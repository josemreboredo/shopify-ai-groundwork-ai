/**
 * @file exits.js
 * @description Deterministic exit-rule evaluation (ADR 0003) for rules
 * 11.1–11.16 in schema/offering.json, plus merging of LLM-detected candidates.
 * LLM candidates are added, never allowed to remove or overwrite rule results.
 *
 * @module discovery/exits
 */

import { offering } from '../../schema/index.js';
import { countedIntegrations, marketsOf, distinctLanguages, hasChinaMainland } from './classify.js';
import { unmetPlanRequirements, describeRequirements } from './plan.js';

const RULES = new Map(offering.exit_rules.map((r) => [r.id, r]));
const DEFAULT_OWNER = 'Lead Consultant';
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whole weeks between two ISO dates (YYYY-MM-DD), or null if either is missing.
 *
 * @param {string|undefined} from
 * @param {string|undefined} to
 */
function weeksBetween(from, to) {
  if (!from || !to) return null;
  return (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY_MS / 7;
}

/**
 * One evaluator per rule id. Each returns evidence (string) when the rule
 * fires, or null when it does not / cannot be evaluated from the answers.
 *
 * @type {Record<string, (doc: object) => string|null>}
 */
const EVALUATORS = {
  '11.1': (doc) => {
    const unmet = unmetPlanRequirements(doc);
    return unmet.length ? `Target plan "${doc.shopify.target_plan}" but the answers need ${describeRequirements(unmet)}` : null;
  },

  '11.2': (doc) => (doc.b2b?.rfq_or_negotiated_pricing === true ? 'B2B requires RFQ / negotiated pricing' : null),

  '11.3': (doc) => {
    const n = marketsOf(doc).length;
    return n > 5 ? `${n} markets at launch` : null;
  },

  '11.4': (doc) => {
    const langs = distinctLanguages(doc);
    return langs.length > 6 ? `${langs.length} distinct languages: ${langs.join(', ')}` : null;
  },

  '11.5': (doc) => {
    const reasons = [];
    const options = doc.catalogue?.variant_options_max;
    const variants = doc.catalogue?.variants_per_product_max;
    if (options > 3) reasons.push(`${options} variant options per product`);
    if (variants > 2048) reasons.push(`${variants} variants on one product`);
    return reasons.length ? reasons.join('; ') : null;
  },

  '11.6': (doc) => ((doc.checkout?.customisation ?? []).includes('fully_custom_checkout_ui') ? 'Fully custom checkout UI requested' : null),

  '11.7': (doc) => {
    const counted = countedIntegrations(doc);
    return counted.length > 3 ? `${counted.length} counted integrations: ${counted.map((i) => i.system).join(', ')}` : null;
  },

  '11.8': (doc) => {
    const r = doc.compliance?.regulated_industry;
    return r?.active === true ? `Regulated industry${r.category ? `: ${r.category}` : ''}` : null;
  },

  '11.9': (doc) => (doc.payments?.pci_scope === 'custom_card_handling' ? 'Card data handled outside Shopify-hosted checkout' : null),

  '11.10': (doc) => (doc.compliance?.gdpr_deletion_workflow === true ? 'Data export / deletion workflow required' : null),

  '11.11': (doc) => {
    const code = doc.offer?.code;
    if (code !== 'M' && code !== 'L') return null;
    return doc.delivery?.grow_retainer?.signed === true ? null : `Offer ${code} without a signed Grow retainer`;
  },

  '11.12': (doc) => {
    const risky = (doc.integrations ?? []).filter(
      (i) => (i.category === 'erp' || i.category === 'pim') &&
             (i.connector === 'none' || i.connector === 'unknown' || (i.connector === 'custom' && i.status !== 'existing')),
    );
    return risky.length ? `No existing connector or iPaaS for: ${risky.map((i) => `${i.system} (${i.category})`).join(', ')}` : null;
  },

  '11.13': (doc) => {
    const s = doc.shipping ?? {};
    const beyondNative = (s.routing_rules ?? []).filter((r) => r === 'custom_rule_function' || r === 'erp_or_oms_decides');
    const complex = beyondNative.length > 0 || s.complex_routing === true;
    return (s.fulfilment_locations ?? 0) > 2 && complex
      ? `${s.fulfilment_locations} fulfilment locations with routing beyond Shopify's native rules${beyondNative.length ? ` (${beyondNative.join(', ').replace(/_/g, ' ')})` : ''}`
      : null;
  },

  '11.14': (doc) => {
    const m = doc.migration ?? {};
    if (!doc.offer?.scope_gates?.migration?.active) return null;
    const reasons = [];
    if (m.seo_equity === 'significant') reasons.push('significant SEO equity');
    if (m.historical_orders_required === true) reasons.push('historical orders required in Shopify');
    if (m.subscriptions === true) reasons.push('active subscriptions to migrate');
    return reasons.length ? `Migration from ${m.source_platform} with ${reasons.join(' and ')}` : null;
  },

  '11.15': (doc) => {
    const min = doc.offer?.duration_weeks?.min;
    const start = doc.delivery?.kickoff_date ?? doc.meta?.created_at;
    const weeks = weeksBetween(start, doc.delivery?.target_launch_date);
    if (min === undefined || weeks === null) return null;
    return weeks < min ? `${weeks.toFixed(1)} weeks from ${start} to go-live; offer minimum is ${min}` : null;
  },

  '11.16': (doc) => {
    const d = doc.delivery ?? {};
    const gaps = [];
    if (d.decision_maker_confirmed === false) gaps.push('no single decision-maker');
    if (d.budget_authority_clear === false) gaps.push('budget authority unclear');
    return gaps.length ? gaps.join('; ') : null;
  },

  '11.17': (doc) => (doc.compliance?.sensitive_data === true ? 'Sensitive personal data collected (health, age, biometric or financial)' : null),

  '11.20': (doc) => (hasChinaMainland(doc) && marketsOf(doc).length > 0
    ? 'Mainland China (CN) is a launch market — excluded from this offering; separate China discovery'
    : null),

  '11.21': (doc) => (hasChinaMainland(doc) && marketsOf(doc).length === 0 ? 'Mainland China is the only launch market' : null),

  '11.18': (doc) => {
    const used = (doc.shopify?.deprecated_features ?? []).filter((f) => f !== 'none');
    return doc.shopify?.existing_store === true && used.length ? `Existing store uses ${used.join(', ').replace(/_/g, ' ')}` : null;
  },

  '11.19': (doc) => {
    const needs = (doc.b2b?.unsupported_needs ?? []).filter((n) => n !== 'none');
    return doc.b2b?.enabled === true && needs.length ? `B2B needs Shopify B2B does not support: ${needs.join(', ').replace(/_/g, ' ')}` : null;
  },
};

/**
 * Build an exits.items entry for a fired rule.
 *
 * @param {object} rule      offering.exit_rules entry
 * @param {'rule'|'llm'|'consultant'} source
 * @param {string} evidence
 */
function toItem(rule, source, evidence) {
  const item = {
    rule_id: rule.id,
    result: rule.result,
    detail: rule.condition,
    destination: rule.destination,
    source,
    evidence,
  };
  if (rule.result !== 'WARN') item.resolution = { status: 'open', owner: DEFAULT_OWNER };
  return item;
}

/**
 * Evaluate every exit rule against an engagement document that already has
 * its `offer` computed, then merge LLM-detected candidates.
 *
 * @param {object} doc
 * @param {{ rule_id: string, evidence: string }[]} [llmCandidates]
 * @returns {{ triggered: boolean, items: object[] }}
 */
export function evaluateExits(doc, llmCandidates = []) {
  const items = [];
  for (const rule of offering.exit_rules) {
    const evidence = EVALUATORS[rule.id](doc);
    if (evidence) items.push(toItem(rule, 'rule', evidence));
  }

  const fired = new Set(items.map((i) => i.rule_id));
  for (const candidate of llmCandidates) {
    const rule = RULES.get(candidate.rule_id);
    if (!rule || fired.has(rule.id) || !candidate.evidence?.trim()) continue;
    items.push(toItem(rule, 'llm', candidate.evidence.trim()));
    fired.add(rule.id);
  }

  items.sort((a, b) => Number(a.rule_id.split('.')[1]) - Number(b.rule_id.split('.')[1]));
  return {
    triggered: items.some((i) => i.result === 'STOP' && i.resolution?.status === 'open'),
    items,
  };
}

/** Rule ids with an evaluator — tests assert this matches offering.json. */
export const IMPLEMENTED_RULES = Object.keys(EVALUATORS);
