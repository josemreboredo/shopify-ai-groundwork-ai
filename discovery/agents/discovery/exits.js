/**
 * @file exits.js
 * @description Deterministic exit-rule evaluation (ADR 0003) for rules
 * 11.1–11.27 in discovery/schema/offering.json, plus merging of LLM-detected candidates.
 * LLM candidates are added, never allowed to remove or overwrite rule results.
 *
 * @module discovery/exits
 */

import { offering } from '../../schema/index.js';
import { countedIntegrations, marketsOf, distinctLanguages, hasChinaMainland } from './classify.js';
import { unmetPlanRequirements, describeRequirements } from './plan.js';
import { picked } from './values.js';

const RULES = new Map(offering.exit_rules.map((r) => [r.id, r]));
const DEFAULT_OWNER = 'Lead Consultant';
const DAY_MS = 24 * 60 * 60 * 1000;

/** Retail stores covered by the +Retail modifier; above this, 11.22 (programme pricing, never per store). */
export const RETAIL_STORES_INCLUDED = 5;

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

  /*
   * Was "more than five markets at launch". Five markets are twenty-five
   * person-days against the fifty-eight to a hundred an L has free above a base
   * build, so the ceiling sat at a third of what the offer could hold — and the
   * Swiss exporter running five or more markets, which the go-to-market names
   * as a target segment, was routed out of the offers by the very rule meant to
   * protect them.
   *
   * Markets are priced per market now, so the count is no longer the question.
   * What is left is the real one: whether the work has stopped being an offer
   * and become a programme, which is what the published benchmark says happens
   * once a template carries the repetition.
   */
  '11.3': (doc) => {
    const scope = doc.offer?.scope_effort_weeks;
    const ceiling = offering.offers.L.duration_weeks.max;
    if (!scope || scope.max <= ceiling) return null;
    return `Scope reaches ${scope.min}–${scope.max} weeks, beyond the ${ceiling} an L holds`;
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
    if (doc.delivery?.route) return null; // routed STOP: Larger Engagement or no bid, no S/M/L offer is quoted
    return doc.delivery?.grow_retainer?.signed === true ? null : `Offer ${code} without a signed Grow retainer`;
  },

  '11.12': (doc) => {
    const risky = (doc.integrations ?? []).filter(
      (i) => (i.category === 'erp' || i.category === 'pim') &&
             (i.connector === 'none' || i.connector === 'not_sure' || (i.connector === 'custom' && i.status !== 'existing')),
    );
    return risky.length ? `No existing connector or iPaaS for: ${risky.map((i) => `${i.system} (${i.category})`).join(', ')}` : null;
  },

  '11.13': (doc) => {
    const s = doc.shipping ?? {};
    const beyondNative = picked(s.routing_rules).filter((r) => r === 'custom_rule_function' || r === 'erp_or_oms_decides');
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
    const used = picked(doc.shopify?.deprecated_features);
    return doc.shopify?.existing_store === true && used.length ? `Existing store uses ${used.join(', ').replace(/_/g, ' ')}` : null;
  },

  '11.19': (doc) => {
    const needs = picked(doc.b2b?.unsupported_needs);
    return doc.b2b?.enabled === true && needs.length ? `B2B needs Shopify B2B does not support: ${needs.join(', ').replace(/_/g, ' ')}` : null;
  },

  '11.22': (doc) => ((doc.retail?.store_count ?? 0) > RETAIL_STORES_INCLUDED ? `${doc.retail.store_count} retail stores (+Retail covers up to ${RETAIL_STORES_INCLUDED})` : null),

  // Fires on missing facts, never on a missing decision: the topology evaluator
  // still returns a recommendation, at confidence to_validate, with its assumptions.
  '11.23': (doc) => {
    const markets = doc.markets?.list ?? [];
    if (markets.length <= 1) return null;
    const topology = doc.markets?.topology;
    if (!topology || topology.confidence !== 'to_validate') return null;
    const entities = doc.meta?.client?.legal_entities ?? [];
    const unmapped = markets.filter((m) => !m.selling_entity).length;
    const reasons = [];
    if (entities.length > 1 && unmapped) reasons.push(`${entities.length} legal entities recorded and ${unmapped} of ${markets.length} markets have no selling entity`);
    if (markets.some((m) => !m.assortment || m.assortment === 'not_sure')) reasons.push('the range per market is unknown');
    if (!(doc.markets?.vat_countries ?? []).length) reasons.push('the tax-registration footprint is unknown');
    if (!reasons.length) return null;
    return `Topology recommended as ${topology.recommendation} at confidence to_validate — ${reasons.join('; ')}`;
  },

  /*
   * The only environment risk on a Shopify build sits on the client side.
   *
   * Shopify needs no instance ladder: a theme stages as an unpublished theme in
   * the production store, development themes do not count against the limit,
   * and checkout is managed, so there is nothing to promote between instances.
   * What does bite is a client system with no sandbox — integration testing then
   * serialises against their live ERP, and the schedule stretches for a reason
   * nobody wrote down. It was not asked before this rule existed.
   */
  '11.24': (doc) => {
    const toConnect = (doc.integrations ?? []).filter((i) => i.status !== 'existing');
    const without = toConnect.filter((i) => i.test_environment === 'none');
    if (!without.length) return null;
    const name = (i) => `${i.system ?? i.category ?? 'a system'}${i.owner && i.owner !== 'not_sure' ? ` (${i.owner})` : ''}`;
    return `No non-production environment to integrate against: ${without.map(name).join(', ')}`;
  },

  /*
   * Hydrogen below Plus: one public deployment, and the rest need a store login.
   *
   * This rule was removed for one commit, on the reasoning that a headless
   * storefront had left the offers altogether. It had not — Hydrogen with
   * content in Shopify is Ecommerce Growth on the headless track — so the
   * condition came straight back into scope while the flag that covered it did
   * not. Verified 2026-09-21: production and preview always exist and custom
   * environments besides, but the public limit is 1 on Starter, Basic, Grow and
   * Advanced against 25 on Plus, and a private deployment URL is slower because
   * authentication is verified on every route.
   *
   * It blocks nothing. It decides who reviews where, and that is a conversation
   * to have before the build rather than during it.
   */
  '11.25': (doc) => {
    if (doc.design?.headless_required !== true) return null;
    const plan = doc.shopify?.target_plan;
    if (!plan || plan === 'plus') return null;
    return `Headless storefront on the ${plan} plan: one public environment (25 on Plus), so every other deployment needs a store login`;
  },

  /*
   * One order, more than one address — which Shopify cannot do.
   *
   * Verified 2026-09-21: split shipping divides an order into several shipments
   * when items cannot travel together — a preorder line, a subscription, stock
   * in different locations, different shipping profiles — and "the customer can
   * select an available shipping option for each shipment". Every shipment still
   * goes to one address. It also does not apply to accelerated checkouts or to
   * draft orders that already carry a shipping line, which is exactly where a
   * wholesale buyer or a gifting flow would have expected it.
   *
   * A flag rather than a stop: there are answers — one order per address, an
   * app, or dropping it — but all three are decisions, and the expensive version
   * is finding out in UAT.
   */
  '11.27': (doc) => (doc.shipping?.multi_address_orders === true
    ? 'One order delivered to more than one address, which Shopify cannot do — split shipping is several shipments to a single address'
    : null),

  /*
   * Where Shopify stops holding the storefront.
   *
   * Not headless: Hydrogen is Shopify's own framework on the Storefront API,
   * and with content in metaobjects and metafields it is a Shopify build — the
   * headless track of Ecommerce Growth, priced by these offers. The line is
   * what sits outside Shopify. Editorial content in an external CMS or a PIM
   * means a second system to unify; another framework, a native app or several
   * front ends on one backend means a front end Shopify does not build. Either
   * is the architecture Merkle builds on Arc — a tokenised design system, a
   * component library and GraphQL middleware over several sources — and this
   * engine prices Shopify builds, so it stops and names the destination.
   *
   * The design system went the other way. A complete Figma design system was an
   * exit for one commit and should not have been: Shopify renders anything a
   * design system describes, and building one is the storefront design gate at
   * its bespoke tier, inside the offers, priced.
   */
  '11.26': (doc) => {
    const h = doc.design?.headless ?? {};
    const outsideContent = h.content_source === 'headless_cms' || h.content_source === 'pim';
    const outsideFrontEnd = h.framework === 'other_framework'
      || (h.reasons ?? []).some((r) => r === 'native_mobile_app' || r === 'multiple_frontends_one_backend');
    if (!outsideContent && !outsideFrontEnd) return null;
    const why = [
      outsideContent ? `editorial content in ${String(h.content_source).replace(/_/g, ' ')}` : null,
      outsideFrontEnd ? `a front end Shopify does not build (${h.framework === 'other_framework' ? 'another framework' : (h.reasons ?? []).filter((r) => r === 'native_mobile_app' || r === 'multiple_frontends_one_backend').join(', ').replace(/_/g, ' ')})` : null,
    ].filter(Boolean).join(' and ');
    return `The storefront lives partly outside Shopify: ${why}`;
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
