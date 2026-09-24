/**
 * @file ai/shared/addons-view.js
 * @description Every add-on service in time and cost, pack by pack.
 *
 * The same add-on is not the same work in every pack. A further market meets a
 * configured theme in S and a full template set to re-test in L; an integration
 * in L is wired again in each of its stores; a Shopware migration in M replaces
 * the WooCommerce one M already carries. One figure per add-on is right for one
 * pack and wrong for the other two.
 *
 * So each cell is the engine's own answer: the pack's promise with the add-on,
 * less the promise without it. The only thing written here is how to ask for
 * each add-on, and a test holds every ask to the gate and tier it claims.
 *
 * Prices are Merkle's internal position. With `pricing` off, no franc leaves
 * the server — only weeks and days.
 *
 * @module ai/shared/addons-view
 */

import { offering } from '../schema/index.js';
import { classifyOffer } from '../engine/classify.js';
import { engagementAt } from '../engine/promise.js';

const CODES = ['S', 'M', 'L'];
const DAYS_PER_WEEK = 5;

/** One more of something a pack counts. */
const oneMore = (key) => (l) => ({ ...l, [key]: (l[key] ?? 0) + 1 });
/** A pack's limits with at least a second store. */
const withAStore = (l) => ({ ...l, stores: Math.max(l.stores ?? 1, 2) });
/** A change to the built engagement, where the limits have no word for it. */
const merge = (section, values) => (doc) => ({ ...doc, [section]: { ...doc[section], ...values } });

/*
 * How to ask for each add-on, as a change to what a pack promises.
 *
 * `limits` changes the pack's limits before the engagement is built, `doc`
 * changes the built engagement, and `base` is what the add-on is priced
 * against when it needs something else first: a further storefront design
 * needs a further store to live on. A tier's `label` is the tier as a reader
 * meets it, kept beside the change that opens it so the two cannot drift.
 */
export const ASKS = {
  markets: { limits: oneMore('markets') },
  store_estate: { limits: (l) => ({ ...l, stores: (l.stores ?? 1) + 1 }) },
  /* A second checkout currency exists only on a further market, and the
     market is priced with it — so it is asked against a further market that
     keeps the first market's currency. */
  multi_currency: {
    base: { limits: oneMore('markets') },
    limits: (l) => ({ ...oneMore('markets')(l), multi_currency: true }),
    carried_by: 'a further market',
  },
  b2b: {
    tiers: {
      standard: { label: 'Shopify’s own B2B: company accounts, price lists, payment terms', limits: (l) => ({ ...l, b2b: true }) },
      advanced: { label: 'Past it: catalogues per company, or a B2B storefront of its own', limits: (l) => ({ ...l, b2b: true }), doc: merge('b2b', { company_specific_catalogs: true }) },
    },
  },
  integration: { limits: oneMore('integrations') },
  storefront_design: {
    tiers: {
      extended: { label: 'Bespoke sections from a key-screens design', limits: (l) => ({ ...l, storefront: 'key_screens', bespoke_sections: 3 }) },
      bespoke: { label: 'The full template set from a design system', limits: (l) => ({ ...l, storefront: 'all_templates' }) },
    },
  },
  /* Shopify publishes one theme per store, so where a pack has one store the
     design is priced on top of a further store rather than with it. */
  theme_design: {
    base: { limits: withAStore },
    limits: (l) => ({ ...withAStore(l), extra_theme_designs: (l.extra_theme_designs ?? 0) + 1 }),
    needs: 'a further store',
  },
  /* Priced where the storefront stays on a Shopify theme. L's promise is the
     custom theme, which carries every template, so in L it is asked of L on a
     Shopify theme — the global set-up that keeps its theme. */
  custom_templates: {
    base: { limits: (l) => (l.storefront === 'all_templates' ? { ...l, storefront: 'brand_only' } : l) },
    limits: (l) => ({ ...(l.storefront === 'all_templates' ? { ...l, storefront: 'brand_only' } : l), custom_templates: (l.custom_templates ?? 0) + 1 }),
    instead: 'the custom theme',
  },
  /* A headless storefront designs every template, so in S and M it is asked on
     top of the full template set — the Hydrogen line is Hydrogen alone. */
  hydrogen: {
    base: { limits: (l) => ({ ...l, storefront: 'all_templates' }) },
    limits: (l) => ({ ...l, storefront: 'all_templates', headless: true }),
    needs: 'the full template set',
  },
  sku_complexity: {
    tiers: {
      standard: { label: '500 to 4,999 SKUs with complex variants, attributes or bundles', limits: (l) => ({ ...l, sku_count: Math.max(l.sku_count, 2000), variant_options: Math.max(l.variant_options ?? 1, 2) }) },
      large: { label: '5,000 to 49,999 SKUs', limits: (l) => ({ ...l, sku_count: 5000 }) },
      very_large: { label: '50,000 SKUs and more', limits: (l) => ({ ...l, sku_count: 50000 }) },
    },
  },
  search_merchandising: {
    tiers: {
      native: { label: 'Search & Discovery at its documented limits', doc: merge('catalogue', { collection_mode: 'manual', collections_estimate: 100 }) },
      app: { label: 'A third-party search app', doc: merge('catalogue', { storefront_filters: Array.from({ length: 26 }, (_, i) => `filter_${i + 1}`) }) },
    },
  },
  migration: {
    tiers: {
      light: { label: 'From WooCommerce', limits: (l) => ({ ...l, migration: 'woocommerce' }) },
      medium: { label: 'From Shopware, BigCommerce or another platform', limits: (l) => ({ ...l, migration: 'shopware' }) },
      heavy: { label: 'From Magento, Salesforce Commerce Cloud or a custom platform', limits: (l) => ({ ...l, migration: 'magento' }) },
    },
  },
  retail_pos: { limits: oneMore('retail_locations') },
  languages: { limits: oneMore('languages') },
  seo_continuity: {
    tiers: {
      standard: { label: '1,000 to 10,000 redirects, or rankings the business runs on', limits: (l) => ({ ...l, redirects: 1000 }) },
      large: { label: 'More than 10,000 redirects', limits: (l) => ({ ...l, redirects: 10001 }) },
    },
  },
  subscriptions: {
    tiers: {
      standard: { label: 'Shopify Subscriptions', doc: merge('catalogue', { subscriptions: { approach: 'shopify_subscriptions' } }) },
      advanced: { label: 'A subscription app, or live contracts carried across', doc: merge('catalogue', { subscriptions: { approach: 'third_party_app' } }) },
    },
  },
  checkout_extensibility: {
    tiers: {
      post_purchase: { label: 'Blocks on the Thank you and Order status pages', limits: (l) => ({ ...l, checkout: 'thank_you_order_status_blocks' }) },
      in_checkout: { label: 'Blocks and fields inside the checkout steps', limits: (l) => ({ ...l, checkout: 'checkout_step_blocks_or_fields' }) },
      functions: { label: 'Functions: validation, delivery and payment rules', limits: (l) => ({ ...l, checkout: 'backend_logic_functions' }) },
    },
  },
  custom_promotions: {
    tiers: {
      standard: { label: 'Tiered or volume discounts for consumers', doc: merge('promotions', { discount_types: ['volume_tiered'] }) },
      advanced: { label: 'Stacking rules of the business’s own across discounts', doc: merge('promotions', { stacking: 'custom_logic_function' }) },
    },
  },
  analytics_consent: {
    tiers: {
      standard: { label: 'Custom events, a tag manager or a third destination', limits: (l) => ({ ...l, analytics_custom_events: true }) },
      advanced: {
        label: 'Server-side tagging or a consent platform',
        limits: (l) => ({ ...l, analytics_custom_events: true }),
        doc: (d) => ({ ...d, marketing: { ...d.marketing, analytics: { ...d.marketing?.analytics, server_side: true } } }),
      },
    },
  },
  post_launch_support: {
    tiers: {
      standard: { label: 'One of the two', doc: merge('delivery', { sops_required: true }) },
      extended: { label: 'Both', doc: merge('delivery', { sops_required: true, support_model: 'retainer' }) },
    },
  },
};

/** The engagement a pack's limits make, with one ask applied. */
export function build(step, limits) {
  const doc = engagementAt(step?.limits ? step.limits(limits) : limits);
  return step?.doc ? step.doc(doc) : doc;
}

/** Four decimals: enough for a surcharge, none of the float noise. */
const exact = (n) => Math.round(n * 1e4) / 1e4;

/**
 * What one ask adds to one pack.
 *
 * `included` where the promise already holds it, `carried` where another
 * add-on brings it at no price of its own, `not_sold` where the pack does not
 * sell it, and otherwise the weeks the engine adds with their price.
 */
function cellFor(addon, ask, code, pricing) {
  if (!addon.available_in.includes(code)) return { state: 'not_sold' };
  const limits = offering.closed_scope.limits[code];
  const before = classifyOffer(build(ask.base, limits));
  const after = classifyOffer(build(ask, limits));
  const base = before.scope_effort_weeks;
  const more = after.scope_effort_weeks;
  const weeks = { min: exact(more.min - base.min), max: exact(more.max - base.max) };
  // Design is priced by the design day, apart from the build week.
  const design = { min: after.design.days.min - before.design.days.min, max: after.design.days.max - before.design.days.max };
  const sys = (q) => q.design.system_days ?? { min: 0, max: 0 };
  const system = { min: sys(after).min - sys(before).min, max: sys(after).max - sys(before).max };
  if (weeks.max <= 0 && design.max <= 0 && system.max <= 0) {
    const promised = classifyOffer(engagementAt(limits)).scope_gates[addon.gate];
    return promised?.active ? { state: 'included' } : { state: 'carried', by: ask.carried_by ?? null };
  }
  const rate = offering.pricing.weekly_rate;
  const day = offering.pricing.design.day_price;
  const systemDay = offering.pricing.design.system_architect.day_price;
  const reshaped = JSON.stringify(build(ask.base, limits)) !== JSON.stringify(engagementAt(limits));
  const needsMore = ask.needs && reshaped;
  return {
    state: 'priced',
    weeks,
    ...(design.max > 0 ? { design_days: design } : {}),
    ...(system.max > 0 ? { system_days: system } : {}),
    ...(pricing ? {
      price: {
        min: Math.round(weeks.min * rate + design.min * day + system.min * systemDay),
        max: Math.round(weeks.max * rate + design.max * day + system.max * systemDay),
      },
    } : {}),
    ...(needsMore ? { on_top_of: ask.needs } : {}),
    ...(ask.instead && reshaped ? { instead_of: ask.instead } : {}),
  };
}

const cells = (fn) => Object.fromEntries(CODES.map((code) => [code, fn(code)]));

/** One add-on service from the offering, a row per tier or one row. */
function gateAddon(addon, pricing) {
  const ask = ASKS[addon.gate];
  if (!ask) throw new Error(`No ask for the ${addon.gate} add-on`);
  const mods = offering.modifiers.filter((m) => m.gate === addon.gate);
  const rows = ask.tiers
    ? mods.map((m) => {
      const tier = ask.tiers[m.tier];
      if (!tier) throw new Error(`No ask for the ${m.tier} tier of ${addon.gate}`);
      return { id: `${addon.id}:${m.tier}`, tier: m.tier, label: tier.label, description: m.description, cells: cells((code) => cellFor(addon, tier, code, pricing)) };
    })
    : [{ id: addon.id, tier: null, label: null, description: null, cells: cells((code) => cellFor(addon, ask, code, pricing)) }];
  return {
    id: addon.id,
    gate: addon.gate,
    what: addon.what,
    description: addon.description ?? (mods.length === 1 ? mods[0].description : null),
    note: addon.note ?? null,
    rows,
  };
}

/*
 * Hypercare and apps are not scope gates: hypercare runs after go-live, and
 * apps are counted rather than opened. Each pack includes some of both, and
 * what past it costs is the same arithmetic the engine quotes with.
 */
function countedAddons(pricing) {
  const p = offering.pricing;
  const app = { min: p.app_weeks, max: p.app_weeks };
  const appFrancs = Math.round(p.app_weeks * p.weekly_rate);
  const appPrice = pricing ? { price: { min: appFrancs, max: appFrancs } } : {};
  const careWeek = p.weekly_rate * p.hypercare_rate_share;
  const stores = (code) => offering.closed_scope.limits[code].stores ?? 1;
  return [
    {
      id: 'hypercare',
      gate: null,
      what: 'Each further week of hypercare',
      description: 'A named channel, a response within one working day and defects triaged with the client, for five more working days after go-live.',
      note: null,
      rows: [{
        id: 'hypercare', tier: null, label: null, description: null,
        cells: cells((code) => ({
          state: 'priced',
          after_go_live: { days: DAYS_PER_WEEK },
          ...(pricing ? { price: { min: careWeek, max: careWeek } } : {}),
          included: { count: offering.offers[code].hypercare_days, noun: 'days' },
        })),
      }],
    },
    {
      id: 'apps',
      gate: null,
      what: 'Each further third-party app',
      description: 'Installed, configured, tested with the theme and handed over with an owner and its monthly fee. Shopify’s own apps and apps a scope gate prices do not count.',
      note: null,
      rows: [{
        id: 'apps', tier: null, label: null, description: null,
        cells: cells((code) => ({ state: 'priced', weeks: app, ...appPrice, included: { count: offering.offers[code].apps_included, noun: 'apps' } })),
      }],
    },
    {
      id: 'apps_per_store',
      gate: null,
      what: 'Each app in each further store',
      description: 'Expansion stores share no data and apps are installed, configured and billed per store, so every app is set up again in each store past the first. A pack’s app allowance is its first store’s.',
      note: null,
      rows: [{
        id: 'apps_per_store', tier: null, label: null, description: null,
        cells: cells((code) => (code === 'S'
          ? { state: 'not_sold' }
          : { state: 'priced', weeks: app, ...appPrice, ...(stores(code) < 2 ? { on_top_of: 'a further store' } : {}) })),
      }],
    },
  ];
}

/*
 * The pack table's own groups, so the two tables read in the same order. The
 * three channels no pack includes any of have no row there, and SEO continuity
 * sits with the migration it usually rides on.
 */
const CHANNELS = 'Selling channels no pack includes';
const GROUP = { b2b: CHANNELS, retail_pos: CHANNELS, subscriptions: CHANNELS, seo_continuity: 'Data and integrations', custom_templates: 'Storefront', hydrogen: 'Storefront' };
const COUNTED_GROUP = 'Running the store';

function grouped(addons) {
  const rows = offering.closed_scope.rows ?? [];
  const groupOf = (a) => GROUP[a.gate] ?? rows.find((r) => r.gate && r.gate === a.gate)?.group ?? COUNTED_GROUP;
  const order = [...(offering.closed_scope.groups ?? [])];
  order.splice(order.includes(COUNTED_GROUP) ? order.indexOf(COUNTED_GROUP) : order.length, 0, CHANNELS);
  return order
    .map((title) => ({ title, addons: addons.filter((a) => groupOf(a) === title) }))
    .filter((g) => g.addons.length);
}

/** L's own promise with a heavy replatform beside it, as the engine quotes it. */
function replatform(pricing) {
  const o = classifyOffer(engagementAt({ ...offering.closed_scope.limits.L, migration: 'sfcc' }));
  return {
    code: 'L',
    name: offering.offers.L.name,
    from: 'Salesforce Commerce Cloud, Adobe Commerce or a custom platform',
    weeks: o.duration_weeks,
    ...(pricing ? { price_band: { min: o.price_band.min, max: o.price_band.max } } : {}),
  };
}

const CACHE = new Map();

/**
 * @param {{ pricing?: boolean }} [options]  pricing: include every franc
 */
export function addonsView({ pricing = false } = {}) {
  const key = Boolean(pricing);
  if (CACHE.has(key)) return CACHE.get(key);
  const addons = [
    ...(offering.closed_scope.addons ?? []).map((a) => gateAddon(a, key)),
    ...countedAddons(key),
  ];
  const view = {
    pricing: key,
    currency: offering.currency,
    estimate: offering.estimate.line,
    packs: CODES.map((code) => ({ code, name: offering.offers[code].name })),
    groups: grouped(addons),
    ...(key ? { weekly_cost: offering.pricing.weekly_rate } : {}),
    replatform: replatform(key),
  };
  CACHE.set(key, view);
  return view;
}
