/**
 * @file classify.js
 * @description Deterministic offer classification (ADR 0001): scope gates,
 * L triggers, offer code, modifiers, price band — computed from answers in an
 * engagement document using discovery/schema/offering.json. No LLM involved.
 *
 * @module discovery/classify
 */

import { offering } from '../../schema/index.js';
import { picked } from './values.js';

const COUNTED = new Set(offering.integration_definition.counted_categories);
const NON_MIGRATION_SOURCES = new Set(['none', 'shopify']);

/**
 * How much of a project a migration is, by where the data is coming from.
 *
 * It used to be one flat modifier — one to two weeks, whatever the source. The
 * published DACH benchmark separates them by a factor of two: a WooCommerce
 * migration is a 4–8 week project, Shopware 8–12, Magento 10–14 (Greenblut, from
 * 150+ migrations). Charging a Magento estate what a WooCommerce store costs is
 * not a simplification, it is a loss taken on purpose.
 *
 * The tiers are the published totals minus a build with no migration in it.
 */
const MIGRATION_TIER = {
  woocommerce: 'light',
  shopware: 'medium',
  bigcommerce: 'medium',
  magento: 'heavy',
  sfcc: 'heavy',
  custom: 'heavy',
  // An unnamed platform is assumed to be the middle case rather than the
  // cheapest: "other" is what a consultant writes when it is not one of the
  // ones they recognise, and those are rarely the simple ones.
  other: 'medium',
};

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
const CHINA_MAINLAND = 'CN';

/** Locations selling with Shopify POS or an integrated one. @param {object} doc */
export const retailLocations = (doc) => doc.retail?.store_count ?? 0;

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
function checkoutCurrencies(doc) {
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

  languages: (doc) => {
    // Translate & Adapt auto-translates two, and a Swiss engagement is DE/FR/IT
    // as a matter of course — so three are included and the gate opens at the
    // fourth, where translation stops being a setting and becomes a licence or
    // a translator, on every release, for ever.
    const langs = distinctLanguages(doc);
    return {
      active: langs.length >= 4,
      evidence: `${langs.length} distinct language(s)${langs.length ? `: ${langs.join(', ')}` : ''}`,
    };
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

  /**
   * How much storefront, not which storefront.
   *
   * The track (Liquid or Hydrogen) was always part of the offer, and the
   * backlog already had stories guarding on these same answers. What was
   * missing was the price: an engagement taking Horizon with brand tokens and
   * one building the full template set from Figma came out of the engine with
   * the same band, and the second is three to five weeks more. Horizon plus
   * tokens is in every offer, so `brand_only` and `none` do not fire.
   */
  storefront_design: (doc) => {
    const d = doc.design ?? {};
    const completeness = d.figma?.completeness;
    // Bespoke is the full template set, and a mapped design system is the
    // signal that it is meant to be built as theme blocks rather than traced.
    const bespoke = completeness === 'all_templates' || (d.custom_design === true && d.figma?.design_system === true);
    const extended = completeness === 'key_screens' || d.custom_design === true;
    const tier = bespoke ? 'bespoke' : extended ? 'extended' : null;
    const why = bespoke
      ? completeness === 'all_templates' ? 'a full template set in Figma' : 'bespoke design with a design system'
      : extended
        ? completeness === 'key_screens' ? 'key screens designed in Figma' : 'bespoke design elements'
        : 'theme configuration only';
    return {
      active: Boolean(tier),
      ...(tier ? { tier } : {}),
      evidence: `Storefront design: ${why}${tier ? '' : ' — Horizon with brand tokens is in every offer'}`,
    };
  },

  migration: (doc) => {
    const source = doc.migration?.source_platform;
    const active = Boolean(source) && !NON_MIGRATION_SOURCES.has(source);
    const tier = active ? (MIGRATION_TIER[source] ?? 'medium') : null;
    return {
      active,
      ...(tier ? { tier } : {}),
      evidence: `Source platform: ${source ?? 'not recorded'}${tier ? ` (${tier} migration)` : ''}`,
    };
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
/**
 * The modifier that prices one active gate.
 *
 * Two gates are no longer a single fixed number. A migration is priced by where
 * the data comes from, and markets by how many there are — because the first
 * extra market and the fourth are not the same work, and the offering used to
 * charge one week for both.
 *
 * @param {object} gate      the gate definition from offering.json
 * @param {object} evaluated what the evaluator found, including a migration tier
 * @param {object} doc       engagement document
 * @returns {object|null}
 */
function modifierFor(gate, evaluated, doc) {
  const all = offering.modifiers ?? [];

  /*
   * A gate priced by tier resolves by tier, whatever the gate.
   *
   * This was written for migration alone and then storefront_design arrived
   * with the same shape: every bespoke design was quoted at the extended tier,
   * because the lookup below takes the first modifier for the gate and the
   * tiers happen to be declared cheapest first. Where a tier cannot be
   * resolved, the middle one stands in rather than the cheapest — an
   * unrecognised answer is rarely the simple case.
   */
  if (gate.modifier_tiers?.length) {
    const forGate = all.filter((m) => m.gate === gate.id);
    const middle = gate.modifier_tiers[Math.floor(gate.modifier_tiers.length / 2)];
    return forGate.find((m) => m.tier === evaluated?.tier)
      ?? forGate.find((m) => m.tier === middle)
      ?? null;
  }

  const modifier = all.find((m) => m.gate === gate.id) ?? null;
  if (!modifier) return null;

  /*
   * What scales, and from which unit it starts counting.
   *
   * A flat modifier charges one integration what it charges three, and two
   * markets what it charges five. The published component costs are per unit —
   * 40 hours per further store, three to twelve person-days per ERP connection
   * — so the modifier is too, within its own band.
   */
  const SCALES = {
    markets: { count: marketsOf(doc).length, free: 1, weeks: 'per_market_weeks', price: 'per_market_price' },
    languages: { count: distinctLanguages(doc).length, free: modifier.free_languages ?? 3, weeks: 'per_language_weeks', price: 'per_language_price' },
    integration: { count: countedIntegrations(doc).length, free: 0, weeks: 'per_integration_weeks', price: 'per_integration_price' },
    retail_pos: { count: retailLocations(doc), free: 0, weeks: 'per_location_weeks', price: 'per_location_price' },
  };
  const scale = SCALES[gate.id];
  if (!scale) return modifier;

  const units = Math.max(scale.count - scale.free, 0);
  const clamp = (n, band) => Math.min(Math.max(n, band.min), band.max);
  const weeks = clamp(units * (modifier[scale.weeks] ?? 0), modifier.effort_weeks);
  const price = clamp(units * (modifier[scale.price] ?? 0), modifier.price_add);
  return {
    ...modifier,
    effort_weeks: { min: weeks, max: weeks },
    price_add: { min: price, max: price },
    units: scale.count,
  };
}

export function classifyOffer(doc) {
  const scope_gates = Object.fromEntries(
    offering.scope_gates.map((g) => [g.id, GATE_EVALUATORS[g.id](doc)]),
  );
  const l_triggers = Object.fromEntries(
    offering.l_triggers.map((t) => [t.id, L_TRIGGER_EVALUATORS[t.id](doc)]),
  );

  const activeGates    = offering.scope_gates.filter((g) => scope_gates[g.id].active);
  const activeTriggers = offering.l_triggers.filter((t) => l_triggers[t.id].active);

  // What the active gates actually add, in weeks. Counting gates treats a
  // Magento migration and a 500-SKU catalogue as the same thing; they differ by
  // an order of magnitude, and the offering already records how much each one
  // costs. Summing it is the only honest way to ask which offer this is.
  const adds = activeGates.map((g) => modifierFor(g, scope_gates[g.id], doc)).filter(Boolean);
  const effort = adds.reduce((a, m) => ({
    min: a.min + (m.effort_weeks?.min ?? 0),
    max: a.max + (m.effort_weeks?.max ?? 0),
  }), { min: 0, max: 0 });
  const base = offering.offers.S.duration_weeks;
  const total = { min: base.min + effort.min, max: base.max + effort.max };

  let code;
  let modifiers = [];
  let rationale;
  // Whether the modifier is added to what is quoted. "Priced with its modifier"
  // is what the classification has always said, but the duration and the band
  // returned were the bare offer's — invisible while a modifier was one week,
  // and a five-week lie once a Magento migration is priced properly.
  let priced = false;

  if (activeTriggers.length > 0) {
    code = 'L';
    rationale = `L trigger(s): ${activeTriggers.map((t) => t.label).join(', ')}`;
  } else if (total.max > offering.offers.M.duration_weeks.max) {
    // The scope no longer fits inside an M. The test is the ceiling it has
    // outgrown, not the floor of the next offer up: a scope of 10–13 weeks
    // fits an M of 6–13 exactly, and quoting it as a 13–20 week L would
    // over-quote work the engine itself estimated at ten.
    code = 'L';
    rationale = `Scope reaches ${total.min}–${total.max} weeks (${activeGates.map((g) => g.label).join(', ')}), beyond the M ceiling of ${offering.offers.M.duration_weeks.max}`;
  } else if (activeGates.length >= 2) {
    code = 'M';
    rationale = `${activeGates.length} scope gates active: ${activeGates.map((g) => g.label).join(', ')}`;
  } else if (activeGates.length === 1) {
    code = 'S';
    modifiers = adds.map((m) => m.id);
    rationale = `1 scope gate active: ${activeGates[0].label}`;
    priced = true;
  } else {
    code = 'S';
    rationale = 'No scope gates active';
  }

  const offer = offering.offers[code];
  const add = priced
    ? adds.reduce((a, m) => ({
      weeks: { min: a.weeks.min + (m.effort_weeks?.min ?? 0), max: a.weeks.max + (m.effort_weeks?.max ?? 0) },
      price: { min: a.price.min + (m.price_add?.min ?? 0), max: a.price.max + (m.price_add?.max ?? 0) },
    }), { weeks: { min: 0, max: 0 }, price: { min: 0, max: 0 } })
    : { weeks: { min: 0, max: 0 }, price: { min: 0, max: 0 } };

  return {
    code,
    name: offer.name,
    delivery_track: offer.delivery_track,
    scope_gates,
    l_triggers,
    modifiers,
    price_band: {
      min: offer.price_band.min + add.price.min,
      max: offer.price_band.max + add.price.max,
      currency: offering.currency,
      open_ended: offer.price_band.open_ended,
    },
    duration_weeks: { min: offer.duration_weeks.min + add.weeks.min, max: offer.duration_weeks.max + add.weeks.max },
    // What the gates add on their own, kept so the proposal can show its work
    // and so a reader can check the offer against the scope rather than take it.
    scope_effort_weeks: total,
    rationale,
  };
}

/** Ids of all gate / trigger evaluators — used by tests to prove full coverage. */
export const IMPLEMENTED_GATES    = Object.keys(GATE_EVALUATORS);
export const IMPLEMENTED_TRIGGERS = Object.keys(L_TRIGGER_EVALUATORS);
