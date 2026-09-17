/**
 * @file classify.js
 * @description Deterministic offer classification (ADR 0001): scope gates,
 * L triggers, offer code, modifiers, price band — computed from answers in an
 * engagement document using schema/offering.json. No LLM involved.
 *
 * @module discovery/classify
 */

import { offering } from '../../schema/index.js';
import { picked } from './values.js';

const COUNTED = new Set(offering.integration_definition.counted_categories);
const NON_MIGRATION_SOURCES = new Set(['none', 'shopify']);

/**
 * Integrations that count toward the integration gate and exit rule 11.7.
 *
 * @param {object} doc  Engagement document
 * @returns {object[]}
 */
export function countedIntegrations(doc) {
  return (doc.integrations ?? []).filter((i) => COUNTED.has(i.category) || i.connector === 'custom');
}

/**
 * Mainland China is not part of the offering (owner decision 2026-09-17): selling
 * behind the Great Firewall needs an ICP licence, onshore hosting and a
 * China-specific architecture, scoped in a separate China discovery (exit rules
 * 11.20 / 11.21). Hong Kong, Macau and Taiwan are separate markets.
 */
export const CHINA_MAINLAND = 'CN';

/** Launch markets in the offering's scope (mainland China excluded). @param {object} doc */
export const marketsOf = (doc) => (doc.markets?.list ?? []).filter((m) => m.code !== CHINA_MAINLAND);

/** True when mainland China is a launch market. @param {object} doc */
export const hasChinaMainland = (doc) => (doc.markets?.list ?? []).some((m) => m.code === CHINA_MAINLAND);

/**
 * Distinct languages across the markets in scope.
 *
 * @param {object} doc
 * @returns {string[]}
 */
export function distinctLanguages(doc) {
  return [...new Set(marketsOf(doc).flatMap((m) => m.languages ?? []))];
}

/**
 * Distinct checkout currencies (markets whose prices are not display-only).
 *
 * @param {object} doc
 * @returns {string[]}
 */
export function checkoutCurrencies(doc) {
  return [...new Set(
    marketsOf(doc)
      .filter((m) => m.currency && m.price_strategy !== 'display_only')
      .map((m) => m.currency),
  )];
}

/** @typedef {{ active: boolean, evidence: string }} Gate */

/** @type {Record<string, (doc: object) => Gate>} */
const GATE_EVALUATORS = {
  markets: (doc) => {
    const codes = marketsOf(doc).map((m) => m.code);
    return { active: codes.length >= 2, evidence: `${codes.length} market(s) at launch${codes.length ? `: ${codes.join(', ')}` : ''}` };
  },

  multi_currency: (doc) => {
    const currencies = checkoutCurrencies(doc);
    return { active: currencies.length > 1, evidence: `Checkout currencies: ${currencies.join(', ') || 'none recorded'}` };
  },

  b2b: (doc) => {
    const b2b = doc.b2b ?? {};
    const model = doc.meta?.client?.business_model;
    const active = b2b.enabled === true || (b2b.enabled === undefined && (model === 'b2b' || model === 'hybrid'));
    const features = ['company_accounts', 'price_lists', 'volume_discounts'].filter((k) => b2b[k] === true);
    return {
      active,
      evidence: active
        ? `B2B selling${features.length ? ` with ${features.join(', ').replace(/_/g, ' ')}` : ''}`
        : 'No B2B selling',
    };
  },

  integration: (doc) => {
    const counted = countedIntegrations(doc);
    return {
      active: counted.length >= 1,
      evidence: counted.length
        ? `Counted integrations: ${counted.map((i) => `${i.system} (${i.category})`).join(', ')}`
        : 'No counted integrations',
    };
  },

  sku_complexity: (doc) => {
    const c = doc.catalogue ?? {};
    const skus = c.sku_count ?? 0;
    const reasons = [];
    if ((c.variant_options_max ?? 0) >= 2) reasons.push(`${c.variant_options_max} variant options`);
    if ((c.custom_attributes ?? []).length > 0) reasons.push('custom attributes');
    if ((c.product_types ?? []).some((t) => ['bundle', 'fixed_bundle', 'multipack', 'mix_and_match_bundle', 'product_set'].includes(t))) reasons.push('bundles / product sets');
    const active = skus >= 500 && reasons.length > 0;
    return { active, evidence: `${skus} SKUs${reasons.length ? `; ${reasons.join(', ')}` : ''}` };
  },

  retail_pos: (doc) => {
    const r = doc.retail ?? {};
    const stores = r.store_count ?? 0;
    const services = picked(r.omnichannel);
    const pos = r.pos === 'shopify_pos' || r.pos === 'other_pos_integrated';
    const active = stores > 0 && (pos || services.length > 0);
    return {
      active,
      evidence: stores > 0
        ? `${stores} store(s); POS: ${r.pos ? r.pos.replace(/_/g, ' ') : 'not recorded'}${services.length ? `; omnichannel: ${services.join(', ').replace(/_/g, ' ')}` : ''}`
        : 'No retail stores',
    };
  },

  migration: (doc) => {
    const source = doc.migration?.source_platform;
    const active = Boolean(source) && !NON_MIGRATION_SOURCES.has(source);
    return { active, evidence: `Source platform: ${source ?? 'not recorded'}` };
  },
};

/** @type {Record<string, (doc: object) => Gate>} */
const L_TRIGGER_EVALUATORS = {
  luxury: (doc) => {
    const p = doc.brand?.positioning;
    return { active: p === 'luxury' || p === 'enterprise', evidence: `Brand positioning: ${p ?? 'not recorded'}` };
  },
  headless: (doc) => {
    const h = doc.design?.headless_required;
    return { active: h === true, evidence: `Headless storefront required: ${h === undefined ? 'not recorded' : h ? 'yes' : 'no'}` };
  },
  figma_design_system: (doc) => {
    const f = doc.design?.figma ?? {};
    const active = f.design_system === true && f.completeness === 'all_templates';
    return { active, evidence: `Figma: ${f.exists ? `${f.completeness ?? 'completeness unknown'}, design system ${f.design_system ? 'yes' : 'no'}` : 'none'}` };
  },
};

/**
 * Compute the `offer` block for an engagement document.
 *
 * @param {object} doc  Engagement document (answers only are read)
 * @returns {object}    Value for doc.offer
 */
export function classifyOffer(doc) {
  const scope_gates = Object.fromEntries(
    offering.scope_gates.map((g) => [g.id, GATE_EVALUATORS[g.id](doc)]),
  );
  const l_triggers = Object.fromEntries(
    offering.l_triggers.map((t) => [t.id, L_TRIGGER_EVALUATORS[t.id](doc)]),
  );

  const activeGates    = offering.scope_gates.filter((g) => scope_gates[g.id].active);
  const activeTriggers = offering.l_triggers.filter((t) => l_triggers[t.id].active);

  let code;
  let modifiers = [];
  let rationale;

  if (activeTriggers.length > 0) {
    code = 'L';
    rationale = `L trigger(s): ${activeTriggers.map((t) => t.label).join(', ')}`;
  } else if (activeGates.length >= 2) {
    code = 'M';
    rationale = `${activeGates.length} scope gates active: ${activeGates.map((g) => g.label).join(', ')}`;
  } else if (activeGates.length === 1) {
    code = 'S';
    modifiers = activeGates[0].modifier ? [activeGates[0].modifier] : [];
    rationale = `1 scope gate active: ${activeGates[0].label}`;
  } else {
    code = 'S';
    rationale = 'No scope gates active';
  }

  const offer = offering.offers[code];
  return {
    code,
    name: offer.name,
    delivery_track: offer.delivery_track,
    scope_gates,
    l_triggers,
    modifiers,
    price_band: {
      min: offer.price_band.min,
      max: offer.price_band.max,
      currency: offering.currency,
      open_ended: offer.price_band.open_ended,
    },
    duration_weeks: { ...offer.duration_weeks },
    rationale,
  };
}

/** Ids of all gate / trigger evaluators — used by tests to prove full coverage. */
export const IMPLEMENTED_GATES    = Object.keys(GATE_EVALUATORS);
export const IMPLEMENTED_TRIGGERS = Object.keys(L_TRIGGER_EVALUATORS);
