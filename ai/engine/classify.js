/**
 * @file classify.js
 * @description Deterministic offer classification (ADR 0001): scope gates,
 * L triggers, offer code, modifiers, price band — computed from answers in an
 * engagement document using discovery/schema/offering.json. No LLM involved.
 *
 * @module engine/classify
 */

import { offering } from '../schema/index.js';
import { picked } from './values.js';
import { promiseOf } from './promise.js';

const COUNTED = new Set(offering.integration_definition.counted_categories);
const NON_MIGRATION_SOURCES = new Set(['none', 'shopify']);

/*
 * Bespoke sections an offer builds before the work is a full template set.
 *
 * Read from the gate rather than written here. The offering page states this
 * number to a client and the classifier has to enforce the same one — a
 * second copy in this file is how "up to 3 bespoke sections" came to be
 * printed for months while the engine counted nothing at all.
 */
export const BESPOKE_SECTIONS_INCLUDED = offering.scope_gates
  .find((g) => g.id === 'storefront_design').platform_limit.merkle_line;

/**
 * How much of a project a migration is, by where the data is coming from.
 *
 * It used to be one flat modifier — one to two weeks, whatever the source. The
 * published DACH benchmark separates them by a factor of two: a WooCommerce
 * migration is a 4–8 week project, Shopware 8–12, Magento 10–14 (Greenblut, from
 * 150+ migrations: https://www.greenblut.com/ratgeber/shopify-migration-kosten,
 * read 2026-09-23). Only the durations are borrowed; the price is Merkle's rate.
 * Charging a Magento estate what a WooCommerce store costs is not a
 * simplification, it is a loss taken on purpose.
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
 * How many weeks of scope gates a pack's band spans: its duration less the
 * Foundation's.
 *
 * It once decided the price — gates inside it cost nothing, the excess was
 * quoted on top — and that is what made the ceiling snap to the pack. The
 * quote is the Foundation plus every gate now; this is kept for the pack pages
 * and for rule 11.3, which reads the largest pack's as the line past which a
 * scope stops being one build.
 *
 * @param {string} code  offer code
 * @returns {{ min: number, max: number }}
 */
export function gateCapacity(code) {
  const base = offering.offers.S.duration_weeks;
  const band = offering.offers[code]?.duration_weeks ?? base;
  return { min: band.min - base.min, max: band.max - base.max };
}

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

/**
 * Stores the topology needs beyond the first.
 *
 * `separate_store_markets` is the markets the engine could not fit on the main
 * store. A hybrid puts those on their own stores and keeps the rest together; a
 * full expansion recommendation does the same thing more widely.
 * `additional_channel_stores` is stores a channel needs regardless of market
 * count — B2B run as its own operation, today the only one; a single-market
 * business with that answer still needs a second store for it. Either count is
 * what the engine already worked out, not a number anyone typed.
 *
 * @param {object} doc
 */
export function storesBeyondTheFirst(doc) {
  const t = doc.markets?.topology;
  if (!t || t.recommendation === 'single_store_markets' || t.recommendation === 'single_store_managed_markets') return 0;
  return (t.separate_store_markets ?? []).length + (t.additional_channel_stores ?? []).length;
}

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

  /*
   * How many Shopify stores the requirements actually need.
   *
   * The engine has always derived this — one store with Markets, expansion
   * stores, or a hybrid — and then priced every engagement as though the answer
   * were one. Ten stores come with a Plus contract at no licence cost, which is
   * exactly why nobody counts them; the cost is that expansion stores share no
   * data by default, so every integration is wired again in each one, apps are
   * billed per store and theme licences cannot be shared.
   *
   * It reads the derived topology rather than an answer, because no client
   * knows how many Shopify stores they need — that is the question this tool
   * exists to answer.
   */
  store_estate: (doc) => {
    const t = doc.markets?.topology;
    const extra = storesBeyondTheFirst(doc);
    if (!t || extra <= 0) {
      return { active: false, evidence: t ? 'One store covers every market' : 'Topology not derived yet' };
    }
    return {
      active: true,
      evidence: `${t.recommendation.replace(/_/g, ' ')}: ${extra + 1} stores, ${extra} beyond the first`,
    };
  },

  /* One design serves every market and every store in every pack, and that is a
     Shopify fact rather than a Merkle line: per-market customisation reaches
     section content, block visibility and order, and section-level settings —
     never theme settings and never Liquid templates. So a genuinely different layout is a second theme — to
     build, deploy, Theme Check and keep in step on every release, for ever.
     The design system is not built twice; the second set is drawn against the
     same token layer, which is why it prices between the two storefront-design
     tiers. A design-system programme per brand is not this and leaves the
     offers entirely (rule 11.29). */
  theme_design: (doc) => {
    const extra = doc.design?.extra_theme_designs ?? 0;
    return {
      active: extra > 0,
      evidence: extra > 0
        ? `${extra} storefront design${extra === 1 ? '' : 's'} beyond the first`
        : 'One design serves every market and store',
    };
  },

  /* A page template designed and built new while the storefront stays on a
     Shopify theme. The way a large, global set-up keeps its theme and still
     gets the pages it needs; a full template set designs every template and
     carries these (see `carried` below). */
  /* The storefront built headless on Hydrogen instead of a Liquid theme. It
     used to have no weeks of its own, so a headless quote was floored at L's
     band; it is an add-on in every pack now, priced like any other gate. Content or a
     front end outside Shopify is not this: that is rule 11.26 and Merkle Arc. */
  hydrogen: (doc) => {
    const h = doc.design ?? {};
    const required = h.headless_required === true;
    const framework = h.headless?.framework;
    const source = h.headless?.content_source;
    return {
      active: required,
      evidence: required
        ? `A headless storefront, built instead of a theme (${framework ? framework.replace(/_/g, ' ') : 'front end not recorded'}, content in ${source ? source.replace(/_/g, ' ') : 'a source not recorded'})`
        : `A Liquid theme; headless storefront required: ${h.headless_required === undefined ? 'not recorded' : 'no'}`,
    };
  },

  custom_templates: (doc) => {
    const n = doc.design?.custom_templates ?? 0;
    // A headless storefront has no theme: every template is part of it.
    const headless = doc.design?.headless_required === true;
    return {
      active: n > 0 && !headless,
      evidence: n > 0
        ? headless
          ? 'A headless storefront has no theme: every template is built as part of it'
          : `${n} page template${n === 1 ? '' : 's'} designed and built new on a Shopify theme`
        : 'No page template beyond the theme’s own',
    };
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
    /*
     * What the B2B side asks of the store.
     *
     * One flat figure charged Shopify's own B2B set-up and a quote workflow
     * with catalogues per company the same, although the answers that tell them
     * apart were already asked. Standard is Shopify's own: company accounts,
     * price lists, volume rules, payment terms. Advanced is past it.
     */
    const advanced = [
      b2b.company_specific_catalogs === true || (b2b.catalog_count ?? 0) > 1 ? 'catalogues per company' : null,
      b2b.rfq_or_negotiated_pricing === true ? 'quote or negotiated pricing' : null,
      b2b.contextual_experience === true ? 'a separate B2B storefront or checkout' : null,
      picked(b2b.unsupported_needs).filter((n) => n !== 'none').length ? 'needs Shopify’s B2B does not cover' : null,
    ].filter(Boolean);
    return {
      active: selling,
      ...(selling ? { tier: advanced.length ? 'advanced' : 'standard' } : {}),
      evidence: selling
        ? `Both channels in one store: consumer and B2B${features.length ? `, with ${features.join(', ').replace(/_/g, ' ')}` : ''}${advanced.length ? `; past Shopify’s own B2B: ${advanced.join(', ')}` : ''}`
        : 'No B2B selling',
    };
  },

  integration: (doc) => {
    const counted = countedIntegrations(doc);
    return {
      active: counted.length >= 1,
      evidence: counted.length
        ? `Counted integrations: ${counted.map((i) => `${i.system ?? 'system not named'} (${i.category})`).join(', ')}`
        : 'No counted integrations',
    };
  },

  /* The catalogue's content written or enriched with AI, priced per 1,000
     SKUs. Shopify Magic does it product by product in the admin, free; this
     is the whole catalogue at once, in the brand's voice, reviewed. */
  ai_content: (doc) => {
    const scope = (doc.catalogue?.ai_enrichment ?? []).filter((x) => x !== 'none' && x !== 'not_sure');
    const skus = doc.catalogue?.sku_count ?? 0;
    return {
      active: scope.length > 0,
      evidence: scope.length
        ? `AI product content for ${skus ? `${skus} SKUs` : 'a catalogue of a size still to confirm'}: ${scope.join(', ').replace(/_/g, ' ')}`
        : 'Product content as the client supplies it; Shopify Magic in the admin',
    };
  },

  sku_complexity: (doc) => {
    const c = doc.catalogue ?? {};
    const skus = c.sku_count ?? 0;
    const reasons = [];
    if ((c.variant_options_max ?? 0) >= 2) reasons.push(`${c.variant_options_max} variant options`);
    if ((c.custom_attributes ?? []).length > 0) reasons.push('custom attributes');
    if ((c.product_types ?? []).some((t) => ['bundle', 'fixed_bundle', 'multipack', 'mix_and_match_bundle', 'product_set'].includes(t))) reasons.push('bundles / product sets');
    /*
     * Either arm, not both.
     *
     * The condition used to read "500 SKUs AND complexity", so size on its own
     * never fired anything: fifty thousand flat SKUs came out of the engine as a
     * four-week Foundation at CHF 40-65k. Tiering the modifier by size fixed the
     * half that already worked. Five thousand is the other arm's threshold
     * because it is where Shopify's own behaviour changes — a collection past it
     * shows no filters at all — and where the published benchmark stops counting
     * days and starts counting weeks.
     */
    const active = (skus >= 500 && reasons.length > 0) || skus >= 5000;
    /*
     * The product model is designed once. The data is handled per thousand.
     *
     * One flat half-week charged a 600-SKU catalogue what it charged a 50,000-SKU
     * one, which is the same mistake the migration gate made before it was tiered
     * by source platform. The published benchmark separates them by an order of
     * magnitude — two to four days under a thousand SKUs against two to four
     * weeks between ten and a hundred thousand — and a known share of products
     * need a person before they will load at all.
     */
    const tier = !active ? null : skus >= 50000 ? 'very_large' : skus >= 5000 ? 'large' : 'standard';
    const why = reasons.length ? `; ${reasons.join(', ')}` : (active ? '; size alone, whatever the shape' : '');
    return { active, ...(tier ? { tier } : {}), evidence: `${skus} SKUs${why}` };
  },

  /*
   * Where Search & Discovery stops.
   *
   * Configuring it is in every offer — filters, predictive search, boosts — and
   * the backlog has always built the collection and search pages. What was not
   * priced is the point where Shopify's own documented limits run out: more
   * than 25 filters, or a catalogue whose collections cross 5,000 products, at
   * which filters stop showing to a shopper at all. Past either, the answer is
   * a third-party search app with an index to keep true.
   *
   * A hand-curated collection estate at scale is the other half: merchandising
   * that somebody maintains after launch, rather than a rule that maintains
   * itself.
   *
   * Limits verified 2026-09-21 against
   * help.shopify.com/en/manual/online-store/search-and-discovery/filters.
   */
  search_merchandising: (doc) => {
    const c = doc.catalogue ?? {};
    const filters = (c.storefront_filters ?? []).length;
    const skus = c.sku_count ?? 0;
    const collections = c.collections_estimate ?? 0;
    const curated = c.collection_mode === 'manual' || c.collection_mode === 'mixed';

    /*
     * Size fires on its own, as it does on the catalogue gate.
     *
     * The ceiling arm used to read "5,000 SKUs AND filters recorded", and the
     * filters question is recommended rather than required — so a fifty-thousand
     * SKU store where nobody had answered it came out with no search work at
     * all. An empty list meant both "they want no filters" and "nobody asked",
     * and the engine cannot tell those apart, so it stopped pretending to.
     *
     * Merchandising at that size is work whether or not a filter is ever
     * configured. What the recorded filters change is the tier: the app tier is
     * for a documented limit known to be crossed, not for one inferred from
     * silence.
     */
    const pastFilterCap = filters > 25;
    const atCollectionScale = skus >= 5000;
    const ceilingWillBite = atCollectionScale && filters > 0;
    const curatedAtScale = curated && collections >= 100;

    const active = pastFilterCap || atCollectionScale || curatedAtScale;
    const tier = active ? (pastFilterCap || ceilingWillBite ? 'app' : 'native') : null;
    const why = [
      filters ? `${filters} storefront filter(s)` : 'no storefront filters recorded',
      `${skus} SKUs`,
      collections ? `${collections} collections, ${c.collection_mode ?? 'mode not recorded'}` : null,
      pastFilterCap ? 'past the 25-filter cap' : null,
      ceilingWillBite ? 'collections will cross the 5,000-product ceiling where filters stop showing' : null,
      atCollectionScale && !filters ? 'merchandising at this catalogue size, with the filter set still to confirm' : null,
    ].filter(Boolean).join('; ');
    return { active, ...(tier ? { tier } : {}), evidence: why };
  },

  /*
   * What Shopify's own returns do not do.
   *
   * Self-serve requests, return rules, exchanges added on approval and
   * refunds to the original payment or store credit are Shopify's and in every
   * pack. An app starts where they stop — and return labels are the common
   * case for a European client: Shopify sells them only from US locations.
   */
  returns_post_purchase: (doc) => {
    const r = doc.shipping?.returns ?? {};
    const pp = doc.post_purchase ?? {};
    const app = [
      r.portal === 'returns_app_needed' ? 'a returns app, Shopify’s own not being enough' : null,
      ['prepaid_label', 'qr_drop_off', 'mixed'].includes(r.label) ? `return labels (${r.label.replace(/_/g, ' ')}), which Shopify sells only from US locations` : null,
      pp.refunds?.trigger === 'on_carrier_scan' ? 'refunds on the carrier’s first scan' : null,
      pp.cancellations?.order_editing === true ? 'customers editing their own orders' : null,
      pp.tracking?.branded_tracking_page === true ? 'a branded tracking page' : null,
      (pp.tracking?.proactive_channels ?? []).some((c) => c === 'whatsapp' || c === 'push') ? 'delivery updates by WhatsApp or push' : null,
      pp.warranty_claims === true ? 'warranty and repair claims online' : null,
    ].filter(Boolean);
    const reconciled = [
      r.inspection_required === true || pp.refunds?.trigger === 'after_inspection' ? 'items inspected before the refund' : null,
      pp.refunds?.finance_sync === true ? 'returns and refunds passed to finance' : null,
    ].filter(Boolean);
    const active = app.length + reconciled.length > 0;
    return {
      active,
      ...(active ? { tier: reconciled.length ? 'advanced' : 'standard' } : {}),
      evidence: active ? `Past Shopify’s own returns: ${[...app, ...reconciled].join(', ')}` : 'Shopify’s own returns, cancellations and refunds — in every pack',
    };
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
  /*
   * How much of the storefront is designed, and how much of it is configured.
   *
   * The count is the part that used to be missing. "Up to 3 bespoke sections"
   * was printed on the offering page for months and nothing anywhere enforced
   * it: the gate read three booleans about Figma and no number, so a client
   * asking for ten bespoke sections classified and priced exactly like one
   * asking for three. A promise the engine cannot see is a promise it cannot
   * keep, which is the whole reason this file and that page are tested
   * against each other.
   *
   * Past the line, the tier moves rather than a surcharge accruing: building
   * more bespoke sections than that is the full template set in all but name,
   * and it is already priced as one. Shopify's own ceiling (25 sections per
   * template) sits far above ours and is recorded on the gate, so the page
   * can say which of the two numbers a reader is looking at.
   */
  storefront_design: (doc) => {
    const d = doc.design ?? {};
    const completeness = d.figma?.completeness;
    const sections = d.bespoke_sections ?? 0;
    const overSectionLine = sections > BESPOKE_SECTIONS_INCLUDED;
    // Bespoke is the full template set, and a mapped design system is the
    // signal that it is meant to be built as theme blocks rather than traced.
    // A headless storefront has no theme to configure: every template is
    // designed and built, which is the full set whatever the Figma file holds.
    const headless = d.headless_required === true;
    const bespoke = completeness === 'all_templates'
      || (d.custom_design === true && d.figma?.design_system === true)
      || overSectionLine
      || headless;
    const extended = completeness === 'key_screens' || d.custom_design === true || sections > 0;
    const tier = bespoke ? 'bespoke' : extended ? 'extended' : null;
    const why = bespoke
      ? headless ? 'a headless storefront, which designs and builds every template'
        : completeness === 'all_templates' ? 'a full template set in Figma'
        : overSectionLine ? `${sections} bespoke sections, past the ${BESPOKE_SECTIONS_INCLUDED} an offer builds`
          : 'bespoke design with a design system'
      : extended
        ? completeness === 'key_screens' ? 'key screens designed in Figma'
          : sections > 0 ? `${sections} bespoke section${sections === 1 ? '' : 's'}`
            : 'bespoke design elements'
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
      ? (redirects > 10000 || (equity === 'significant' && redirects >= 5000) ? 'large' : 'standard')
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
    // Hiding, renaming or reordering payment methods is a Payment Customization
    // Function (shopify.dev/docs/api/functions/latest/payment-customization),
    // not a setting — it was asked (Q4.1.7) and never read anywhere.
    const methodRules = doc.payments?.method_rules === true;

    const active = customisation.length > 0 || extensions.length > 0 || fields || restrictions.length > 0 || methodRules;
    const FUNCTIONS = new Set(['cart_checkout_validation', 'delivery_customization', 'payment_customization']);
    const backend = customisation.includes('backend_logic_functions')
      || extensions.some((e) => FUNCTIONS.has(e))
      || restrictions.length > 0
      || methodRules;
    /*
     * Three tiers, because Shopify gates the three differently and the page was
     * quoting them as one. Verified 2026-09-21 on shopify.dev: UI extensions on
     * the Thank you and Order status pages run on every plan except Starter,
     * while the information, shipping and payment steps are Shopify Plus only.
     * Quoting a thank-you block at the in-checkout price charges a Basic store
     * for a plan it does not need, and telling an M it cannot have checkout
     * extensions at all was simply wrong.
     */
    const IN_CHECKOUT = new Set(['checkout_step_blocks_or_fields', 'checkout_branding_api_styling']);
    const inCheckout = customisation.some((x) => IN_CHECKOUT.has(x))
      || extensions.some((e) => !FUNCTIONS.has(e))
      || fields;
    const tier = active ? (backend ? 'functions' : inCheckout ? 'in_checkout' : 'post_purchase') : null;
    return {
      active,
      ...(tier ? { tier } : {}),
      evidence: active
        ? `Checkout: ${[...customisation, ...extensions].join(', ') || (fields ? 'custom fields' : 'payment method rules')}${restrictions.length ? `; order rules: ${restrictions.join(', ')}` : ''}${methodRules ? '; payment methods hidden, renamed or reordered' : ''}`
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
  /*
   * Promotions past Shopify's own discounts.
   *
   * Codes, automatic discounts, buy X get Y, free shipping, scheduled sales and
   * the native combinations are an admin setting in every pack. A tiered or
   * volume discount for consumers, or stacking rules of the business's own, is
   * a discount Function — code that touches every order's price, tested and
   * owned. Wholesale-only volume pricing is B2B quantity rules, not this.
   */
  custom_promotions: (doc) => {
    const p = doc.promotions ?? {};
    const types = (p.discount_types ?? []).filter((t) => t !== 'none' && t !== 'not_sure');
    const wholesaleOnly = doc.meta?.client?.business_model === 'b2b';
    const tiered = types.includes('volume_tiered') && !wholesaleOnly;
    const custom = p.stacking === 'custom_logic_function';
    const active = tiered || custom;
    const tier = active ? (custom ? 'advanced' : 'standard') : null;
    return {
      active,
      ...(tier ? { tier } : {}),
      evidence: active
        ? `Promotions past Shopify’s own discounts: ${[custom ? 'stacking rules of the business’s own' : null, tiered ? 'tiered or volume discounts for consumers' : null].filter(Boolean).join(', ')}`
        : `Shopify’s own discounts${types.length ? `: ${types.join(', ').replace(/_/g, ' ')}` : ''} — in every pack`,
    };
  },

  /*
   * What takes a build past the AI every pack includes.
   *
   * Every pack decides and sets up Shopify's agentic storefronts, answers
   * through the Knowledge Base app and shows the team Shopify Magic and
   * Sidekick: Shopify's own, a decision rather than a build, and part of what
   * the offer sells. Mapping product data from custom fields and an AI crawler
   * policy are standard; the store's own assistant is advanced.
   */
  agentic_commerce: (doc) => {
    const a = doc.ai ?? {};
    const own = a.own_agent_surface === 'now';
    // Selling through the AI channels, the Knowledge Base answers and the
    // team's own AI tools are in every pack; only what takes a build is here.
    const reasons = [
      a.catalog_mapping_needed === true ? 'product data mapped from custom fields' : null,
      ['selective', 'block'].includes(a.crawler_policy) ? `an AI crawler policy (${a.crawler_policy})` : null,
      own ? 'the store’s own agent, now' : null,
    ].filter(Boolean);
    const active = reasons.length > 0;
    return {
      active,
      ...(active ? { tier: own ? 'advanced' : 'standard' } : {}),
      evidence: active ? `Agentic commerce: ${reasons.join(', ')}` : 'AI channels, Knowledge Base answers and Shopify’s own AI tools — in every pack',
    };
  },

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
    //
    // A handover into a signed Grow retainer is part of that retainer: pricing
    // it here charged the client for agreeing to the retainer, and could tip a
    // Foundation into the next budget for doing so. Hypercare is not this gate:
    // each pack carries its own days and more are priced with the quote.
    const signed = d.grow_retainer?.signed === true;
    const retainer = model === 'retainer' && !signed;
    const parts = [retainer, sops].filter(Boolean).length;
    const active = parts > 0;
    const tier = active ? (parts >= 2 ? 'extended' : 'standard') : null;
    return {
      active,
      ...(tier ? { tier } : {}),
      evidence: active
        ? `Support model: ${model ? model.replace(/_/g, ' ') : 'not recorded'}${sops ? ', written SOPs required' : ''}`
        : `Support model: ${model ? model.replace(/_/g, ' ') : 'not recorded'}${model === 'retainer' && signed ? ' — the handover is part of the signed Grow retainer' : ''} — hypercare and handover are in every offer`,
    };
  },
};

/**
 * What still decides Ecommerce Flagship on its own. A headless storefront used
 * to, and does not any more: Hydrogen is an add-on sold in every pack (the
 * hydrogen gate), and the engagement is named after the budget it reaches.
 *
 * @type {Record<string, (doc: object) => Gate>}
 */
const L_TRIGGER_EVALUATORS = {
  /*
   * Global reach alone never forces this — Shopify documents no cap on how
   * many country or region markets one store can hold (topology.js). What
   * forces a second store is a business fact the engine already derives:
   * a different selling entity per market beyond what Plus's own per-market
   * entity assignment covers, its own tax/invoicing footprint, a genuinely
   * different range, an independently-run market, a market with its own
   * regulatory requirement, or wholesale run as its own operation. A store
   * selling in twelve markets from one Shopify Markets set-up is still this
   * offering's M; the same reach needing two or more separate stores is L —
   * a second store means a second app estate, a second theme licence and
   * every integration wired again, which is L-shaped work regardless of how
   * many markets sit behind it.
   */
  multi_store: (doc) => {
    const t = doc.markets?.topology;
    const extra = storesBeyondTheFirst(doc);
    return {
      active: extra > 0,
      evidence: extra > 0
        ? `${t.recommendation.replace(/_/g, ' ')}: ${extra} store${extra === 1 ? '' : 's'} beyond the first`
        : t ? 'One store covers every market' : 'Topology not derived yet',
    };
  },
};

/** Whether a gate fires on this document, asked without the offer being decided yet. */
const ACTIVE_GATE = (doc, id) => Boolean(GATE_EVALUATORS[id]?.(doc)?.active);

/** The storefront design tier this document asks for, or null. */
const STOREFRONT_TIER = (doc) => GATE_EVALUATORS.storefront_design?.(doc)?.tier ?? null;

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
    store_estate: { count: storesBeyondTheFirst(doc), free: 0, weeks: 'per_store_weeks', price: 'per_store_price' },
    theme_design: { count: doc.design?.extra_theme_designs ?? 0, free: 0, weeks: 'per_theme_weeks', price: 'per_theme_price' },
    custom_templates: { count: doc.design?.custom_templates ?? 0, free: 0, weeks: 'per_template_weeks', price: 'per_template_price' },
    ai_content: { count: Math.ceil((doc.catalogue?.sku_count ?? 0) / 1000), free: 0, weeks: 'per_thousand_weeks', price: 'per_thousand_price' },
  };
  const scale = SCALES[gate.id];
  if (!scale) return modifier;

  /*
   * A market costs what the storefront it is opened on costs to re-test.
   *
   * Every pack charged the same three quarters of a week per market, and they
   * are not the same work: in an entry offer a market meets a configured theme
   * and three languages, and in the largest it meets the full template set and
   * six. The second is more surface to translate, check and sign off.
   *
   * Scaling by the pack would be circular — the pack is decided by the effort
   * this is part of — so it scales by what actually drives it, which is more
   * honest anyway: not "because it is an L" but "because there is a bespoke
   * template set to re-test in every market". A large engagement picks these up
   * by having them, and a small one that happens to have them pays for them too.
   */
  const surcharges = modifier.per_unit_surcharge ?? [];
  const uplift = surcharges.reduce((a, s) => {
    if (s.gate === 'storefront_design') {
      return STOREFRONT_TIER(doc) === s.tier ? a + s.add : a;
    }
    /*
     * A store surcharge that scales by count, not by whether the gate fired.
     *
     * One store re-wiring one integration and one store re-wiring five are not
     * the same job — every connection is tested and reconciled again in each
     * store, so five integrations across three extra stores is fifteen
     * reconciliations, not three. A flat +33% the moment any integration
     * existed charged the same whether there was one or ten. Uncapped here on
     * purpose: the modifier's own effort_weeks/price_add band is what bounds
     * the total, the same as every other modifier.
     */
    if (s.per_unit) return a + s.add * (SCALES[s.gate]?.count ?? 0);
    return ACTIVE_GATE(doc, s.gate) ? a + s.add : a;
  }, 0);

  const units = Math.max(scale.count - scale.free, 0);
  const clamp = (n, band) => Math.min(Math.max(n, band.min), band.max);
  const perWeek = (modifier[scale.weeks] ?? 0) * (1 + uplift);
  const perPrice = (modifier[scale.price] ?? 0) * (1 + uplift);
  const weeks = clamp(units * perWeek, modifier.effort_weeks);
  const price = clamp(units * perPrice, modifier.price_add);
  // Design by the unit, where a unit is designed: a further storefront design.
  const perDesign = Object.keys(modifier).find((k) => /^per_\w+_design_days$/.test(k));
  return {
    ...modifier,
    effort_weeks: { min: weeks, max: weeks },
    price_add: { min: price, max: price },
    ...(perDesign ? { design_days: { min: units * modifier[perDesign].min, max: units * modifier[perDesign].max } } : {}),
    units: scale.count,
  };
}

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

  const activeGates = offering.scope_gates.filter((g) => scope_gates[g.id].active);
  // Headless is the hydrogen gate now: an add-on in every pack, not a name.
  const headless = Boolean(scope_gates.hydrogen?.active);

  /*
   * Each active gate with the modifier that prices it, kept together.
   *
   * They used to be two arrays joined by position, one of them filtered — which
   * held only while every gate had a modifier. The label below compares each
   * gate with what a pack includes, so the pairing has to be real.
   */
  /*
   * One client decision, one price.
   *
   * A second currency only exists as a further market, and a further market is
   * priced with its currency; charging the currency again priced one decision
   * twice. The same for a catalogue of 5,000 SKUs and more, which sets up
   * Shopify's own search as part of the catalogue work. What is carried stays
   * active — its evidence still explains the engagement — and is not priced.
   */
  const carried = ({ gate, evaluated }) =>
    (gate.id === 'multi_currency' && scope_gates.markets?.active === true)
    || (gate.id === 'search_merchandising' && evaluated.tier === 'native' && ['large', 'very_large'].includes(scope_gates.sku_complexity?.tier))
    // A full template set designs and builds every template already.
    || (gate.id === 'custom_templates' && scope_gates.storefront_design?.tier === 'bespoke');
  const priced = activeGates
    .map((gate) => ({ gate, evaluated: scope_gates[gate.id], modifier: modifierFor(gate, scope_gates[gate.id], doc) }))
    .filter((p) => p.modifier && !carried(p));
  /*
   * The same sum, itemised.
   *
   * Only the total survived, and on an engagement that outgrows the largest
   * offer the total is the one number that cannot be acted on: a consultant
   * reading "the scope reaches 30 weeks" has been told there is a problem and
   * nothing about where it is. The gate labels, not the modifier ids — the ids
   * are internal pricing vocabulary and this is read in front of the work.
   */
  const byGate = priced
    .map((p) => ({ gate: p.gate.id, label: p.gate.label, weeks: p.modifier.effort_weeks }))
    .filter((x) => x.weeks)
    .sort((a, b) => b.weeks.max - a.weeks.max);
  const gateTotals = priced.reduce((a, { modifier: m }) => ({
    weeks: { min: a.weeks.min + (m.effort_weeks?.min ?? 0), max: a.weeks.max + (m.effort_weeks?.max ?? 0) },
    price: { min: a.price.min + (m.price_add?.min ?? 0), max: a.price.max + (m.price_add?.max ?? 0) },
  }), { weeks: { min: 0, max: 0 }, price: { min: 0, max: 0 } });

  /*
   * The quote follows the scope, floor and ceiling alike.
   *
   * It is the Foundation base plus every active gate at its own weeks and
   * price — the rule S always used for its one gate, now used for all of them.
   * It replaced a band per pack plus whatever overflowed the pack's capacity,
   * which followed the scope at the floor and snapped to the pack at the top:
   * half a week of extra work could move a quote by CHF 105k, and a re-estimate
   * that found a second store read as a different project rather than as the
   * same one with a store more. The packs remain what the conversation opens
   * with; what a client is quoted is what the answers add up to.
   *
   * A headless storefront was the one exception, floored at L's band while
   * Hydrogen had no weeks of its own. It is an add-on on L now (the hydrogen
   * gate), so every quote is the scope's sum and none is open-ended.
   */
  const S = offering.offers.S;
  /*
   * Design, by the design day.
   *
   * Not part of the build week: most gates need none, and a designer inside
   * the team would be charged on a migration as much as on a template set. The
   * Foundation brand adaptation is in S's band like its build; every gate that
   * needs design carries its own days, added at the design day's price. Design
   * runs alongside set-up and template selection, so it adds to the price and
   * not to the weeks.
   */
  const design = offering.pricing.design;
  const gateDesign = priced.reduce((a, { modifier: m }) => ({
    min: a.min + (m.design_days?.min ?? 0), max: a.max + (m.design_days?.max ?? 0),
  }), { min: 0, max: 0 });
  const designDays = { min: design.foundation_days.min + gateDesign.min, max: design.foundation_days.max + gateDesign.max };
  // The design system architect's days, on a storefront whose components are owned.
  const systemDays = priced.reduce((a, { modifier: m }) => ({
    min: a.min + (m.system_days?.min ?? 0), max: a.max + (m.system_days?.max ?? 0),
  }), { min: 0, max: 0 });
  const systemDay = design.system_architect.day_price;
  /*
   * Hypercare, by pack.
   *
   * Every pack carried fifteen working days inside the Foundation base. Each
   * carries its own now — S five, M ten, L fifteen — and a week of hypercare
   * costs half a build week: a named channel and a response within a working
   * day, not a team building. The Foundation build is S's band without S's own
   * days; the pack an engagement is named after adds its days back, and days
   * the client asks for past them are priced the same way. Hypercare runs
   * after go-live, so it adds to the price and not to the weeks.
   */
  const hypercarePrice = (days) => (days / 5) * offering.pricing.weekly_rate * offering.pricing.hypercare_rate_share;
  const asked = doc.delivery?.hypercare_days ?? 0;
  const hypercareFor = (code) => Math.max(offering.offers[code].hypercare_days, asked);
  /*
   * Apps, by pack, the same way.
   *
   * S installs and configures three third-party apps, M six, L ten; Shopify's
   * own apps do not count. Each further one is an eighth of a build week —
   * sized so that the apps a bigger pack includes never outweigh the hypercare
   * it adds, and crossing into it never makes a quote cheaper.
   */
  const apps = doc.shopify?.apps_at_launch ?? 0;
  const extraApps = (code) => Math.max(0, apps - offering.offers[code].apps_included);
  const foundation = hypercarePrice(S.hypercare_days);
  const scope = {
    price: {
      min: S.price_band.min - foundation + gateTotals.price.min + gateDesign.min * design.day_price + systemDays.min * systemDay,
      max: S.price_band.max - foundation + gateTotals.price.max + gateDesign.max * design.day_price + systemDays.max * systemDay,
    },
    weeks: { min: S.duration_weeks.min + gateTotals.weeks.min, max: S.duration_weeks.max + gateTotals.weeks.max },
  };
  /*
   * Every further store installs its apps again.
   *
   * Expansion stores share no data and apps are installed, configured and
   * billed per store, so an app the engagement runs is set up once more in
   * each store past the first. No pack includes that: its allowance is the
   * first store's.
   */
  const perStore = apps * storesBeyondTheFirst(doc);
  // The time the apps take is the same whatever the pack; what a pack
  // includes is only what it does not charge for.
  const appWeeks = (Math.max(0, apps - S.apps_included) + perStore) * offering.pricing.app_weeks;
  const quoteFor = (code) => {
    const add = hypercarePrice(hypercareFor(code)) + (extraApps(code) + perStore) * offering.pricing.app_weeks * offering.pricing.weekly_rate;
    const priced = { min: scope.price.min + add, max: scope.price.max + add };
    const weeks = { min: scope.weeks.min + appWeeks, max: scope.weeks.max + appWeeks };
    return { price: priced, weeks };
  };

  const { code, addons } = packFor(priced, quoteFor);
  const quote = quoteFor(code);
  const offer = offering.offers[code];
  const addonLabels = addons.map((a) => a.label.charAt(0).toLowerCase() + a.label.slice(1));
  const rationale = [
    addons.length
        ? `${offer.name} plus ${addonLabels.join('; ')}`
        : `${offer.name} as packaged: ${activeGates.length ? `${activeGates.map((g) => g.label).join(', ')} — all inside what it includes` : 'no scope gates active'}`,
    `Quoted from the Foundation base plus each scope gate at its own weeks and price, with ${hypercareFor(code)} working days of hypercare after go-live${extraApps(code) ? ` and ${extraApps(code)} third-party app${extraApps(code) === 1 ? '' : 's'} past the ${offer.apps_included} it includes` : ''}${perStore ? `, each app set up again in every further store (${perStore})` : ''}`,
  ].join('. ').replace(/\. and /, ' and ');

  /*
   * The track is an answer, not a property of the offer.
   *
   * Every pack builds a theme, and any of them can take the Hydrogen add-on,
   * so reading the track off the offer would tell a Hydrogen engagement it was
   * getting a theme.
   */
  const delivery_track = headless ? 'hydrogen' : offer.delivery_track;
  const toThousand = (n) => Math.round(n / 1000) * 1000;
  const toHalfWeek = (n) => Math.round(n * 2) / 2;

  return {
    code,
    name: offer.name,
    delivery_track,
    scope_gates,
    l_triggers,
    modifiers: priced.map((p) => p.modifier.id),
    addons,
    price_band: {
      min: toThousand(quote.price.min),
      max: toThousand(quote.price.max),
      currency: offering.currency,
      // Never open-ended: every quote is the scope's sum, a headless one included.
      open_ended: false,
    },
    duration_weeks: { min: toHalfWeek(quote.weeks.min), max: toHalfWeek(quote.weeks.max) },
    hypercare: { days: hypercareFor(code), included_days: offer.hypercare_days },
    // Design days: the Foundation brand adaptation plus every gate that needs design.
    design: { days: designDays, ...(systemDays.max > 0 ? { system_days: systemDays } : {}) },
    apps: { count: apps, included: offer.apps_included, extra: extraApps(code), in_further_stores: perStore },
    // What the scope adds up to before any floor, kept so a reader can check
    // the quote against the scope rather than take it.
    scope_effort_weeks: scope.weeks,
    // And the same sum gate by gate, heaviest first, so a scope that has
    // outgrown the offers can be argued with rather than only reported.
    scope_effort_by_gate: byGate,
    // The gate weeks this pack's band spans, read by exit rule 11.3 and shown
    // on the pack pages; no longer part of what is quoted.
    gate_capacity_weeks: gateCapacity(code),
    rationale,
  };
}

/*
 * What each pack's promise includes, gate by gate.
 *
 * The promise is `closed_scope.limits` built into an engagement and run
 * through the same gates, so "M includes three markets" means exactly what the
 * markets gate does with three markets. Computed once per pack.
 */
const INCLUDED = {};
function includedIn(code) {
  if (INCLUDED[code]) return INCLUDED[code];
  const doc = promiseOf(code);
  const out = {};
  for (const gate of offering.scope_gates) {
    const evaluated = GATE_EVALUATORS[gate.id](doc);
    if (!evaluated.active) continue;
    const modifier = modifierFor(gate, evaluated, doc);
    out[gate.id] = { tier: evaluated.tier ?? modifier?.tier ?? null, units: modifier?.units ?? null };
  }
  return (INCLUDED[code] = out);
}

/** Whether an engagement's use of one gate goes past what a pack includes. */
function beyond({ gate, evaluated, modifier }, included) {
  if (!included) return true;
  if (modifier.units != null && included.units != null) return modifier.units > included.units;
  const tiers = gate.modifier_tiers;
  if (tiers?.length) return tiers.indexOf(evaluated.tier ?? modifier.tier) > tiers.indexOf(included.tier);
  return false;
}

/**
 * The pack an engagement is built on, and what it takes on top of it.
 *
 * A pack can carry an engagement when everything past its promise is sold as an
 * add-on in that pack. Of those, the engagement is named after the largest one
 * whose floor its quote reaches — that is the budget the conversation is in —
 * and what goes past that pack's promise is listed as add-ons — a headless
 * storefront included, since Hydrogen is an add-on in every pack. Nothing here
 * moves the price: the quote is the scope's sum whatever the name.
 *
 * @param {object[]} priced  active gates with their evaluation and modifier
 * @param {(code: string) => object} quoteFor  the quote as that pack would price it (its hypercare included)
 * @returns {{ code: string, addons: object[] }}
 */
function packFor(priced, quoteFor) {
  const addonOf = new Map(offering.closed_scope.addons.map((a) => [a.gate, a]));
  const candidates = ['S', 'M', 'L'].map((code) => {
    const included = includedIn(code);
    const extra = priced.filter((p) => beyond(p, included[p.gate.id]));
    return { code, extra, sellable: extra.every((p) => addonOf.get(p.gate.id)?.available_in.includes(code)) };
  });
  const sellable = candidates.filter((c) => c.sellable);
  const reached = sellable.filter((c) => quoteFor(c.code).price.min >= offering.offers[c.code].price_band.min);
  const chosen = reached.at(-1) ?? sellable[0] ?? candidates.at(-1);
  return {
    code: chosen.code,
    addons: chosen.extra.map((p) => {
      const included = includedIn(chosen.code)[p.gate.id];
      return {
        gate: p.gate.id,
        label: addonOf.get(p.gate.id)?.what ?? p.gate.label,
        ...(p.modifier.units != null ? { units: p.modifier.units, included_units: included?.units ?? 0 } : {}),
        ...(p.evaluated.tier ? { tier: p.evaluated.tier } : {}),
      };
    }),
  };
}

/** Ids of all gate / trigger evaluators — used by tests to prove full coverage. */
export const IMPLEMENTED_GATES    = Object.keys(GATE_EVALUATORS);
export const IMPLEMENTED_TRIGGERS = Object.keys(L_TRIGGER_EVALUATORS);
