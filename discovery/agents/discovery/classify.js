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
 * How many weeks of scope gates an offer's band already contains.
 *
 * M is S plus its gates: the band runs 6–13 against an S of 4–5, so an M holds
 * two to eight weeks of gates. L holds the same, because L is M plus the
 * headless storefront — seven weeks at both ends of the band, which is the
 * offer itself and not gate work.
 *
 * Gates inside the envelope cost nothing more; that is what the band is for.
 * What was missing was the other side of it, and L showed it worst: its
 * triggers are qualitative — luxury, headless, a Figma system — so a brand with
 * a Magento estate, six markets and four integrations was quoted at the same
 * 13–20 weeks as one with a single market and no migration.
 */
const GATE_CAPACITY = {
  min: offering.offers.M.duration_weeks.min - offering.offers.S.duration_weeks.min,
  max: offering.offers.M.duration_weeks.max - offering.offers.S.duration_weeks.max,
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

  /*
   * A wholesale-only engagement is not a consumer store plus an extra.
   *
   * B2B was always a modifier on a DTC base, which charges a wholesale-only
   * client for consumer promotion and checkout work they never receive, and then
   * charges them again for the company accounts that replace it. The base is the
   * same size; the weeks are spent differently, and each offer now says so per
   * channel. What the gate is actually for is the second channel — a client
   * selling both ways builds both storefronts and tests both.
   */
  b2b: (doc) => {
    const b2b = doc.b2b ?? {};
    const model = doc.meta?.client?.business_model;
    const selling = b2b.enabled === true || (b2b.enabled === undefined && (model === 'b2b' || model === 'hybrid'));
    const wholesaleOnly = model === 'b2b';
    const features = ['company_accounts', 'price_lists', 'volume_discounts'].filter((k) => b2b[k] === true);
    if (selling && wholesaleOnly) {
      return {
        active: false,
        evidence: `Wholesale only${features.length ? ` with ${features.join(', ').replace(/_/g, ' ')}` : ''} — B2B is this engagement's base, not an addition to a consumer store`,
      };
    }
    return {
      active: selling,
      evidence: selling
        ? `Both channels in one store: consumer and B2B${features.length ? `, with ${features.join(', ').replace(/_/g, ' ')}` : ''}`
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

  /*
   * Carrying the search traffic across, priced.
   *
   * This work only ever rode along inside the migration gate, which is tiered by
   * source platform and never reads `seo_equity` at all — so the answer to "how
   * much ranking must survive" changed nothing about what was quoted. Worse, the
   * gate is keyed on the platform changing, and the case that loses the most
   * traffic is a brand already on Shopify rebuilding its storefront: every URL
   * moves, no platform does, and the redirect estate was quoted at nothing.
   *
   * So this gate reads the search answers directly and does not care where the
   * data is coming from. Greenfield still costs nothing: with no equity, no
   * redirects and no custom URLs there is nothing to carry.
   */
  seo_continuity: (doc) => {
    const equity    = doc.migration?.seo_equity;
    const redirects = doc.migration?.volumes?.redirects ?? 0;
    const organic   = doc.marketing?.seo?.priority_channel === true;
    const customUrls = doc.marketing?.seo?.custom_urls === true;

    const active = equity === 'significant' || redirects >= 1000 || (organic && customUrls);
    // Large is the estate a pattern cannot map. Equity alone does not buy it:
    // every brand that cares about search answers "significant", and the work
    // is set by how many URLs have to be carried, not by how much it matters.
    const tier = active
      ? (redirects >= 10000 || (equity === 'significant' && redirects >= 5000) ? 'large' : 'standard')
      : null;

    const why = [
      equity ? `SEO equity to preserve: ${equity}` : 'SEO equity not recorded',
      `${redirects} redirect(s)`,
      organic ? 'organic is a priority channel' : 'organic not a priority channel',
      ...(customUrls ? ['custom URL structures'] : []),
    ].join(', ');
    return { active, ...(tier ? { tier } : {}), evidence: why };
  },

  /*
   * Recurring revenue is a different store, not a product type.
   *
   * The question bank has a whole block on it — which app, which plan shapes,
   * whether live contracts move — and none of it reached the offer. Shopify's
   * own app is free and covers the simple case; everything past it is a paid
   * app, and carrying existing contracts across without the customer
   * re-entering a card is the part that fails on the day.
   */
  subscriptions: (doc) => {
    const s = doc.catalogue?.subscriptions ?? {};
    const features = (s.features ?? []).filter((f) => f !== 'not_sure');
    const approach = s.approach;
    const sells = (approach && approach !== 'not_sure')
      || features.length > 0
      || (doc.catalogue?.product_types ?? []).includes('subscription');
    const migrating = doc.migration?.subscriptions === true || features.includes('migrate_existing_contracts');

    // What Shopify Subscriptions does not do. Each of these is a paid app, a
    // different data model, or both.
    const BEYOND_NATIVE = new Set([
      'prepaid_multi_delivery', 'build_a_box', 'subscription_bundles',
      'subscriptions_on_pos', 'b2b_subscriptions', 'international_subscriptions',
    ]);
    const active = sells || migrating;
    const tier = active
      ? (migrating || approach === 'third_party_app' || features.some((f) => BEYOND_NATIVE.has(f)) ? 'advanced' : 'standard')
      : null;
    return {
      active,
      ...(tier ? { tier } : {}),
      evidence: active
        ? `Subscriptions: ${approach ? approach.replace(/_/g, ' ') : 'approach not recorded'}${features.length ? `, ${features.length} feature(s)` : ''}${migrating ? ', existing contracts to carry across' : ''}`
        : 'No subscription selling recorded',
    };
  },

  /*
   * A checkout extension is an app, not a setting.
   *
   * Branding in the editor is on every plan and is part of every offer, so it
   * does not fire this. Everything past it — a block, a field, a Function —
   * is scaffolded, built, tested and deployed with the CLI, and lives on a
   * release path of its own. A fully custom checkout UI is not in here at all:
   * Shopify no longer permits it, which is exit rule 11.6's job.
   */
  checkout_extensibility: (doc) => {
    const c = doc.checkout ?? {};
    const real = (list) => (list ?? []).filter((x) => x !== 'none' && x !== 'not_sure');
    const customisation = real(c.customisation).filter((x) => x !== 'branding_in_editor' && x !== 'fully_custom_checkout_ui');
    const extensions = real(c.extensions);
    const fields = (c.custom_fields ?? []).length > 0;
    // Blocking countries is a market setting; the rest need a validation Function.
    const restrictions = real(c.order_restrictions).filter((r) => r !== 'block_countries');

    const active = customisation.length > 0 || extensions.length > 0 || fields || restrictions.length > 0;
    const FUNCTIONS = new Set(['cart_checkout_validation', 'delivery_customization', 'payment_customization']);
    const backend = customisation.includes('backend_logic_functions')
      || extensions.some((e) => FUNCTIONS.has(e))
      || restrictions.length > 0;
    const tier = active ? (backend ? 'functions' : 'standard') : null;
    return {
      active,
      ...(tier ? { tier } : {}),
      evidence: active
        ? `Checkout: ${[...customisation, ...extensions].join(', ') || 'custom fields'}${restrictions.length ? `; order rules: ${restrictions.join(', ')}` : ''}`
        : 'Checkout settings and editor branding only — in every offer',
    };
  },

  /*
   * The measurement, which this agency of all agencies was giving away.
   *
   * Shopify's own analytics and its cookie banner are in every offer. What is
   * not is the plumbing between them and everywhere else: customer events per
   * destination, consent carried to each of them, and — once tagging moves
   * server-side or a consent platform arrives — the reconciliation that proves
   * the numbers still agree with Shopify's.
   */
  analytics_consent: (doc) => {
    const a = doc.marketing?.analytics ?? {};
    const platforms = a.platforms ?? [];
    const pixels = a.pixels ?? [];
    const events = a.custom_events ?? [];
    const destinations = platforms.length + pixels.length;
    const cmp = doc.compliance?.consent_approach === 'third_party_cmp';
    const capture = (doc.compliance?.consent_capture_points ?? []).filter((p) => p !== 'none' && p !== 'not_sure');

    // GA4 and a Meta pixel are what every store already has, so they are in
    // every offer — the same way three languages are. The gate opens where
    // measurement stops being an integration someone switches on: a third
    // destination to keep consistent, a tag manager, custom events. Advanced is
    // where consent state itself has to be carried, which is a different job.
    const active = a.server_side === true || a.tag_manager === true || cmp
      || events.length > 0 || destinations >= 3;
    const tier = active
      ? (a.server_side === true || cmp || capture.length >= 2 ? 'advanced' : 'standard')
      : null;
    return {
      active,
      ...(tier ? { tier } : {}),
      evidence: active
        ? `${destinations} destination(s)${a.server_side ? ', server-side' : ''}${a.tag_manager ? ', tag manager' : ''}${events.length ? `, ${events.length} custom event(s)` : ''}${cmp ? ', third-party consent platform' : ''}`
        : 'Shopify analytics and the Shopify cookie banner — in every offer',
    };
  },

  /*
   * What happens after go-live, which the offers ended one week before.
   *
   * The backlog has always carried a hypercare story and a training-and-SOPs
   * story; the offer had no weeks for either, and its standard exclusions
   * pointed at an "agreed support model" the offering never priced. Launch-day
   * training and handover stay in every offer — this is the commitment past it.
   */
  post_launch_support: (doc) => {
    const d = doc.delivery ?? {};
    const model = d.support_model;
    const sops = d.sops_required === true;
    // A hypercare window is in every offer: the launch phase carries it and the
    // backlog has always had the story. What is not carried is the operating
    // model past it — runbooks written to be handed over, or a retainer that
    // has to receive something.
    const retainer = model === 'retainer';
    const active = retainer || sops;
    const tier = active ? (retainer && sops ? 'extended' : 'standard') : null;
    return {
      active,
      ...(tier ? { tier } : {}),
      evidence: active
        ? `Support model: ${model ? model.replace(/_/g, ' ') : 'not recorded'}${sops ? ', written SOPs required' : ''}`
        : `Support model: ${model ? model.replace(/_/g, ' ') : 'not recorded'} — hypercare and handover are in every offer`,
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
  // Weeks the gates push past this offer's envelope. Null while they fit.
  let overflow = null;

  /*
   * Scope no longer promotes an engagement into L.
   *
   * It used to: outgrow the M ceiling and the quote became L's, which is the
   * headless offer — so a Liquid build that ran half a week long was quoted at
   * a 13–20 week Hydrogen band, and the architecture, the app shortlist and the
   * whole approach followed the band rather than the engagement. The offer is
   * now what the engagement is, and the weeks it outgrew are priced where they
   * happen. L is reached by what it is actually for: headless, luxury, a Figma
   * design system. Scope that outgrows every offer is exit rule 11.3's, and it
   * is a programme rather than a bigger offer.
   */
  if (activeTriggers.length > 0) {
    code = 'L';
    rationale = `L trigger(s): ${activeTriggers.map((t) => t.label).join(', ')}`;
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

  const gateTotals = adds.reduce((a, m) => ({
    weeks: { min: a.weeks.min + (m.effort_weeks?.min ?? 0), max: a.weeks.max + (m.effort_weeks?.max ?? 0) },
    price: { min: a.price.min + (m.price_add?.min ?? 0), max: a.price.max + (m.price_add?.max ?? 0) },
  }), { weeks: { min: 0, max: 0 }, price: { min: 0, max: 0 } });

  /*
   * When the envelope bursts, the excess has to reach the quote.
   *
   * Only the excess: the band already contains the gate work it was sized for,
   * and charging those gates twice would be the same error in the other
   * direction.
   *
   * S is not in this: it prices its single gate in full, because its band is
   * four to five weeks of base and nothing else.
   */
  if (code !== 'S') {
    const over = {
      min: Math.max(0, gateTotals.weeks.min - GATE_CAPACITY.min),
      max: Math.max(0, gateTotals.weeks.max - GATE_CAPACITY.max),
    };
    if (over.min > 0 || over.max > 0) {
      overflow = over;
      priced = true;
      modifiers = adds.map((m) => m.id);
      rationale += `. Scope gates add ${gateTotals.weeks.min}–${gateTotals.weeks.max} weeks against the ${GATE_CAPACITY.min}–${GATE_CAPACITY.max} this offer already carries, so ${over.min}–${over.max} week(s) are quoted on top`;
    }
  }

  /*
   * What an overflow week costs is not a rate written down somewhere else: it
   * is the rate the gates that caused it are already priced at, blended across
   * the band. The overflow is more of exactly that work.
   */
  const weeksTotal = gateTotals.weeks.min + gateTotals.weeks.max;
  const perWeek = weeksTotal > 0 ? (gateTotals.price.min + gateTotals.price.max) / weeksTotal : 0;
  const toThousand = (n) => Math.round(n / 1000) * 1000;

  const add = !priced
    ? { weeks: { min: 0, max: 0 }, price: { min: 0, max: 0 } }
    : overflow
      ? { weeks: overflow, price: { min: toThousand(overflow.min * perWeek), max: toThousand(overflow.max * perWeek) } }
      : gateTotals;

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
    // The gate weeks this offer's band already contains, so a reader can check
    // an overflow rather than take it.
    gate_capacity_weeks: GATE_CAPACITY,
    rationale,
  };
}

/** Ids of all gate / trigger evaluators — used by tests to prove full coverage. */
export const IMPLEMENTED_GATES    = Object.keys(GATE_EVALUATORS);
export const IMPLEMENTED_TRIGGERS = Object.keys(L_TRIGGER_EVALUATORS);
