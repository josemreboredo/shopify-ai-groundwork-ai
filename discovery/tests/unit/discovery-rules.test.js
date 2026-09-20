/**
 * Deterministic offer classification and exit rules, checked against the
 * golden fixtures (Phase 1) and targeted edge cases.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs   from 'node:fs';
import path from 'node:path';

import { offering } from '../../schema/index.js';
import { classifyOffer, IMPLEMENTED_GATES, IMPLEMENTED_TRIGGERS } from '../../agents/discovery/classify.js';
import { evaluateExits, IMPLEMENTED_RULES, RETAIL_STORES_INCLUDED } from '../../agents/discovery/exits.js';

const FIXTURES = path.join(import.meta.dirname, '..', 'fixtures', 'engagements');
const fixtures = fs.readdirSync(FIXTURES).filter((f) => f.endsWith('.json'))
  .map((f) => [f, JSON.parse(fs.readFileSync(path.join(FIXTURES, f), 'utf8'))]);

/** Answers-only copy: drop everything the engine computes. */
function answersOnly(doc) {
  const { offer, exits, approach, ...rest } = structuredClone(doc);
  if (rest.delivery) delete rest.delivery.go;
  return rest;
}

const activeIds = (block) => Object.entries(block).filter(([, g]) => g.active).map(([id]) => id).sort();

describe('coverage', () => {
  test('every gate, L trigger and exit rule in offering.json has an evaluator', () => {
    assert.deepEqual([...IMPLEMENTED_GATES].sort(), offering.scope_gates.map((g) => g.id).sort());
    assert.deepEqual([...IMPLEMENTED_TRIGGERS].sort(), offering.l_triggers.map((t) => t.id).sort());
    assert.deepEqual([...IMPLEMENTED_RULES].sort(), offering.exit_rules.map((r) => r.id).sort());
  });
});

for (const [file, fixture] of fixtures) {
  describe(`fixture ${file}`, () => {
    const doc = answersOnly(fixture);
    doc.offer = classifyOffer(doc);
    const exits = evaluateExits(doc);

    test('offer matches the golden fixture', () => {
      assert.equal(doc.offer.code, fixture.offer.code);
      assert.deepEqual(activeIds(doc.offer.scope_gates), activeIds(fixture.offer.scope_gates));
      assert.deepEqual(activeIds(doc.offer.l_triggers), activeIds(fixture.offer.l_triggers ?? {}));
      assert.deepEqual(doc.offer.modifiers, fixture.offer.modifiers ?? []);
      assert.deepEqual(doc.offer.price_band, fixture.offer.price_band);
      assert.deepEqual(doc.offer.duration_weeks, fixture.offer.duration_weeks);
    });

    test('exit rules match the golden fixture', () => {
      const pick = (items) => items.map((i) => `${i.rule_id}:${i.result}`).sort();
      assert.deepEqual(pick(exits.items), pick(fixture.exits.items));
      assert.equal(exits.triggered, fixture.exits.triggered);
    });
  });
}

describe('classification edge cases', () => {
  const base = () => ({ schema_version: '1.0.0', meta: { client: { name: 'X', slug: 'x' }, source: 'questionnaire' } });

  test('a single gate gives S with its modifier; no gates gives S without modifiers', () => {
    const doc = { ...base(), migration: { source_platform: 'magento' } };
    assert.deepEqual([classifyOffer(doc).code, classifyOffer(doc).modifiers], ['S', ['+Migration (heavy)']]);

    const singleMarket = { ...base(), markets: { list: [{ code: 'CH', currency: 'CHF', price_strategy: 'base_currency' }] } };
    assert.deepEqual([classifyOffer(singleMarket).code, classifyOffer(singleMarket).modifiers], ['S', []]);

    const retail = { ...base(), retail: { store_count: 3, pos: 'shopify_pos' } };
    assert.deepEqual([classifyOffer(retail).code, classifyOffer(retail).modifiers], ['S', ['+Retail']]);
  });

  test('luxury positioning decides nothing on its own — it was never a size', () => {
    // It used to force an L, which meant a luxury brand with one market and a
    // small catalogue was quoted as the largest offer on the strength of how it
    // described itself. A luxury brand that wants every template designed
    // answers the design questions, and those are what the storefront design
    // gate reads.
    const offer = classifyOffer({ ...base(), brand: { positioning: 'luxury' } });
    assert.equal(offer.code, 'S');
    assert.equal(offer.l_triggers.headless.active, false);
  });

  test('a headless storefront is Ecommerce Growth, and the track follows the answer', () => {
    // Headless is a floor, not a size: four weeks of Foundation cannot produce
    // a headless storefront at any catalogue. It is still a Shopify build while
    // Shopify holds the content — what leaves is exit rule 11.26's business.
    const head = classifyOffer({ ...base(), design: { headless_required: true, headless: { framework: 'hydrogen', content_source: 'shopify_metaobjects' } } });
    assert.equal(head.code, 'L');
    assert.equal(head.delivery_track, 'hydrogen');
    // And the same offer without it is the same offer, on a theme.
    assert.equal(classifyOffer(base()).delivery_track, 'liquid');
  });

  test('S and M have no headless variant', () => {
    const big = {
      ...base(),
      markets: { list: [{ code: 'CH', currency: 'CHF' }, { code: 'DE', currency: 'EUR' }, { code: 'FR', currency: 'EUR' }] },
      migration: { source_platform: 'magento' },
      integrations: [{ category: 'erp', connector: 'custom' }],
    };
    for (const doc of [base(), { ...base(), brand: { positioning: 'luxury' } }, big]) {
      assert.equal(classifyOffer(doc).delivery_track, 'liquid');
    }
  });

  test('rebuilding an existing Shopify store is not a migration', () => {
    assert.equal(classifyOffer({ ...base(), migration: { source_platform: 'shopify' } }).scope_gates.migration.active, false);
  });

  test('display-only currencies do not count toward multi-currency', () => {
    const doc = { ...base(), markets: { list: [
      { code: 'DE', currency: 'EUR', price_strategy: 'base_currency' },
      { code: 'CH', currency: 'CHF', price_strategy: 'display_only' },
    ] } };
    const offer = classifyOffer(doc);
    assert.equal(offer.scope_gates.multi_currency.active, false);
    assert.equal(offer.scope_gates.markets.active, true);
  });

  test('App Store apps do not count as integrations unless custom-built', () => {
    const doc = { ...base(), integrations: [
      { system: 'Klaviyo', category: 'esp', connector: 'native_app' },
      { system: 'Yotpo', category: 'reviews', connector: 'custom' },
    ] };
    const offer = classifyOffer(doc);
    assert.equal(offer.scope_gates.integration.active, true);
    assert.match(offer.scope_gates.integration.evidence, /Yotpo/);
    assert.doesNotMatch(offer.scope_gates.integration.evidence, /Klaviyo/);
  });
});

describe('exit rule edge cases', () => {
  const withOffer = (doc) => ({ ...doc, offer: classifyOffer(doc) });
  const base = { schema_version: '1.0.0', meta: { client: { name: 'X', slug: 'x' }, source: 'questionnaire', created_at: '2026-09-01' } };
  const ids = (doc, llm) => evaluateExits(withOffer(doc), llm).items.map((i) => i.rule_id);

  test('11.1 fires for Plus features on a non-Plus plan, not for B2B alone or a custom checkout UI', () => {
    assert.deepEqual(ids({ ...base, shopify: { target_plan: 'basic' }, b2b: { enabled: true } }), []);
    assert.deepEqual(ids({ ...base, shopify: { target_plan: 'advanced' }, b2b: { enabled: true, price_lists: true } }), ['11.1']);
    assert.deepEqual(ids({ ...base, shopify: { target_plan: 'grow' }, checkout: { customisation: ['checkout_step_blocks_or_fields'] } }), ['11.1']);
    assert.deepEqual(ids({ ...base, shopify: { target_plan: 'grow' }, checkout: { customisation: ['branding_in_editor', 'thank_you_order_status_blocks'] } }), []);
    assert.deepEqual(ids({ ...base, shopify: { target_plan: 'grow' }, checkout: { customisation: ['fully_custom_checkout_ui'] } }), ['11.6']);
  });

  test('11.4 counts distinct languages, not per-market sums', () => {
    const list = ['CH', 'DE', 'AT', 'LI'].map((code) => ({ code, currency: 'EUR', languages: ['de', 'fr', 'it'] }));
    assert.ok(!ids({ ...base, markets: { list } }).includes('11.4'));
  });

  test('11.15 counts from kick-off, falling back to created_at', () => {
    const doc = { ...base, markets: { list: [{ code: 'DE' }, { code: 'AT' }] }, b2b: { enabled: true },
      delivery: { target_launch_date: '2026-10-01', grow_retainer: { signed: true } } };
    assert.ok(ids(doc).includes('11.15'));
    doc.delivery.kickoff_date = '2026-06-01';
    doc.delivery.target_launch_date = '2026-09-01';
    assert.ok(!ids(doc).includes('11.15'));
  });

  test('11.11 warns on M without a signed retainer', () => {
    const doc = { ...base, markets: { list: [{ code: 'DE' }, { code: 'AT' }] }, b2b: { enabled: true } };
    const items = evaluateExits(withOffer(doc)).items;
    const warn = items.find((i) => i.rule_id === '11.11');
    assert.equal(warn.result, 'WARN');
    assert.equal(warn.resolution, undefined);
    const routed = { ...doc, delivery: { route: 'larger_engagement' } };
    assert.ok(!evaluateExits(withOffer(routed)).items.some((i) => i.rule_id === '11.11'), 'a routed STOP quotes no S/M/L offer');
  });

  test('11.22 warns above 5 retail stores: programme pricing, never a per-store price', () => {
    const at = (store_count) => evaluateExits(withOffer({ ...base, retail: { store_count, pos: 'shopify_pos' } })).items.find((i) => i.rule_id === '11.22');
    assert.equal(at(RETAIL_STORES_INCLUDED), undefined);
    const warn = at(RETAIL_STORES_INCLUDED + 7);
    assert.equal(warn.result, 'WARN');
    assert.match(warn.evidence, /12 retail stores/);
    assert.match(offering.exit_rules.find((r) => r.id === '11.22').internal_note, /[Nn]ever quote a per-store price/);
  });

  test('11.24 flags a system with no sandbox, and only one we have to build against', () => {
    // Shopify needs no instance ladder — a theme stages as an unpublished theme
    // in the production store — so the only environment risk on a Shopify build
    // is the client's. It was not asked at all before this rule.
    const erp = (over) => ({ ...base, integrations: [{ system: 'Navision', category: 'erp', connector: 'custom', ...over }] });
    assert.ok(ids(erp({ status: 'to_build', test_environment: 'none' })).includes('11.24'));
    assert.ok(!ids(erp({ status: 'to_build', test_environment: 'available' })).includes('11.24'));
    // Not known yet is not the same as not there: it stays an open item, not a flag.
    assert.ok(!ids(erp({ status: 'to_build', test_environment: 'not_sure' })).includes('11.24'));
    // A connection that already runs is not ours to test into existence.
    assert.ok(!ids(erp({ status: 'existing', test_environment: 'none' })).includes('11.24'));

    const [item] = evaluateExits(withOffer(erp({ status: 'to_build', test_environment: 'none', owner: 'client' })))
      .items.filter((i) => i.rule_id === '11.24');
    assert.match(item.evidence, /Navision \(client\)/, 'the flag names the system and whose it is');
  });

  test('11.26 fires where Shopify stops holding the storefront, not where the theme stops', () => {
    // Hydrogen with content in metaobjects is a Shopify build: Shopify's own
    // framework, Shopify's content, priced by these offers on the headless
    // track. What leaves is a second system to unify.
    const head = (headless) => ids({ ...base, design: { headless_required: true, headless } });
    assert.ok(!head({ framework: 'hydrogen', content_source: 'shopify_metaobjects' }).includes('11.26'));

    assert.ok(head({ framework: 'hydrogen', content_source: 'headless_cms' }).includes('11.26'), 'content outside Shopify');
    assert.ok(head({ framework: 'hydrogen', content_source: 'pim' }).includes('11.26'));
    assert.ok(head({ framework: 'other_framework', content_source: 'shopify_metaobjects' }).includes('11.26'), 'a front end Shopify does not build');
    assert.ok(head({ framework: 'hydrogen', content_source: 'shopify_metaobjects', reasons: ['native_mobile_app'] }).includes('11.26'));
    assert.ok(head({ framework: 'hydrogen', content_source: 'shopify_metaobjects', reasons: ['multiple_frontends_one_backend'] }).includes('11.26'));

    // A complete Figma design system was an exit for one commit and should not
    // have been: Shopify renders anything a design system describes, and
    // building one is the storefront design gate at its bespoke tier.
    assert.ok(!ids({ ...base, design: { figma: { design_system: true, completeness: 'all_templates' } } }).includes('11.26'));
  });

  test('LLM candidates are added once, for known rules only, and never replace rule results', () => {
    const doc = { ...base, checkout: { customisation: ['fully_custom_checkout_ui'] } };
    const exits = evaluateExits(withOffer(doc), [
      { rule_id: '11.8', evidence: 'Industry answer mentions prescription medicines' },
      { rule_id: '11.6', evidence: 'duplicate of a rule result' },
      { rule_id: '11.99', evidence: 'unknown rule' },
      { rule_id: '11.9', evidence: '   ' },
    ]);
    assert.deepEqual(exits.items.map((i) => `${i.rule_id}:${i.source}`), ['11.6:rule', '11.8:llm']);
    assert.equal(exits.triggered, true);
  });

  test('STOP and FLAG items name an owner', () => {
    const doc = { ...base, compliance: { gdpr_deletion_workflow: true }, checkout: { customisation: ['fully_custom_checkout_ui'] } };
    for (const item of evaluateExits(withOffer(doc)).items) {
      if (item.result !== 'WARN') assert.ok(item.resolution.owner);
    }
  });
});

describe('the offer follows the effort, not the gate count', () => {
  // Calibrated 2026-09-20 against published DACH delivery data: Greenblut
  // (150+ migrations) and Eshop Guide (300+ projects). Before it, the offering
  // did not close against its own arithmetic — seven gates added up to 10–13
  // weeks and were quoted as an M of 6–9.
  const base = () => ({ schema_version: '1.0.0', meta: { client: { name: 'X', slug: 'x' }, source: 'questionnaire' } });
  const markets = (...codes) => ({ markets: { list: codes.map((code) => ({ code, currency: 'CHF', price_strategy: 'base_currency' })) } });

  test('a migration is priced by where the data comes from', () => {
    // The published totals differ by a factor of two: WooCommerce 4–8 weeks,
    // Shopware 8–12, Magento 10–14. One flat modifier charged them the same.
    const tier = (source) => classifyOffer({ ...base(), migration: { source_platform: source } });
    assert.equal(tier('woocommerce').scope_gates.migration.tier, 'light');
    assert.equal(tier('shopware').scope_gates.migration.tier, 'medium');
    assert.equal(tier('magento').scope_gates.migration.tier, 'heavy');
    assert.equal(tier('sfcc').scope_gates.migration.tier, 'heavy');
    // An unnamed platform is the middle case, not the cheapest.
    assert.equal(tier('other').scope_gates.migration.tier, 'medium');

    const light = tier('woocommerce').duration_weeks;
    const heavy = tier('magento').duration_weeks;
    assert.ok(heavy.max > light.max * 1.5, `heavy ${heavy.max}wk should dwarf light ${light.max}wk`);
  });

  test('markets are priced per market, so five no longer cost what two cost', () => {
    const two = classifyOffer({ ...base(), ...markets('CH', 'DE') });
    const five = classifyOffer({ ...base(), ...markets('CH', 'DE', 'FR', 'IT', 'AT') });
    assert.ok(five.price_band.max > two.price_band.max,
      `five markets (${five.price_band.max}) must cost more than two (${two.price_band.max})`);
    assert.ok(five.duration_weeks.max > two.duration_weeks.max);
  });

  test('S with a modifier quotes the modifier, not the bare offer', () => {
    // "Priced with its modifier" is what the classification always said. The
    // duration and the band returned were the bare S — invisible at one week,
    // a five-week understatement once a Magento migration is priced properly.
    const bare = classifyOffer(base());
    const withHeavy = classifyOffer({ ...base(), migration: { source_platform: 'magento' } });
    assert.equal(withHeavy.code, 'S');
    assert.ok(withHeavy.duration_weeks.max > bare.duration_weeks.max + 4, 'the weeks are added');
    assert.ok(withHeavy.price_band.max > bare.price_band.max + 30000, 'and so is the price');
  });

  test('scope that outgrows the M ceiling becomes an L, on the track the answers chose', () => {
    // This rule was removed and is back. It was wrong while the offer decided
    // the track — half a week past the ceiling quoted a theme build at a
    // headless band and dragged the architecture after it. The track is an
    // answer now, so the offer following the work is exactly right.
    const heavy = classifyOffer({
      ...base(),
      ...markets('CH', 'DE', 'FR'),
      migration: { source_platform: 'magento' },
      b2b: { enabled: true },
      integrations: [{ category: 'erp', connector: 'custom' }],
    });
    assert.equal(heavy.code, 'L');
    assert.equal(heavy.delivery_track, 'liquid', 'nothing here asked for a headless storefront');
    assert.equal(heavy.l_triggers.headless.active, false);
    assert.ok(heavy.scope_effort_weeks.max > offering.offers.M.duration_weeks.max);
  });

  test('an L carries the gates that outgrow its own band, not M\u2019s', () => {
    // The envelope is each band's own arithmetic: an M of 6-13 over an S of 4-5
    // holds two to eight weeks of gates, an L of 13-20 holds nine to fifteen.
    // Charging an L for gates its band was sized for would be the same error as
    // absorbing the ones it was not.
    const answers = {
      ...base(),
      ...markets('CH', 'DE', 'FR', 'IT', 'ES', 'NL'),
      migration: { source_platform: 'magento' },
      b2b: { enabled: true },
      retail: { store_count: 4, pos: 'shopify_pos' },
      integrations: [{ category: 'erp', connector: 'custom' }, { category: 'pim', connector: 'custom' }, { category: '3pl_wms', connector: 'custom' }],
    };
    const l = classifyOffer(answers);
    assert.equal(l.code, 'L');
    assert.deepEqual(l.gate_capacity_weeks, {
      min: offering.offers.L.duration_weeks.min - offering.offers.S.duration_weeks.min,
      max: offering.offers.L.duration_weeks.max - offering.offers.S.duration_weeks.max,
    });
    assert.ok(l.duration_weeks.max > offering.offers.L.duration_weeks.max, 'the estate is quoted, not absorbed');
    assert.ok(l.price_band.max > offering.offers.L.price_band.max);
    assert.ok(l.price_band.min < l.price_band.max, 'and the band never inverts');
    assert.ok(l.modifiers.length, 'and it says which gates did it');
  });

  test('a catalogue is priced by its size, not by crossing five hundred once', () => {
    // One flat half-week charged a 600-SKU catalogue what it charged a 50,000-SKU
    // one. The published benchmark separates them by an order of magnitude — two
    // to four days under a thousand SKUs against two to four weeks between ten
    // and a hundred thousand — and the migration gate had already learned this
    // lesson from source platforms.
    const at = (sku_count) => classifyOffer({ ...base(), catalogue: { sku_count, variant_options_max: 3 } });
    assert.equal(at(400).scope_gates.sku_complexity.active, false, 'complexity alone is not a catalogue');
    assert.equal(at(600).scope_gates.sku_complexity.tier, 'standard');
    assert.equal(at(4999).scope_gates.sku_complexity.tier, 'standard');
    assert.equal(at(5000).scope_gates.sku_complexity.tier, 'large');
    assert.equal(at(50000).scope_gates.sku_complexity.tier, 'very_large');

    // And the tiers have to reach the quote, or none of this was worth doing.
    assert.ok(at(50000).price_band.max > at(600).price_band.max * 1.4, 'an order of magnitude of catalogue is not a rounding difference');
    assert.ok(at(50000).duration_weeks.max > at(5000).duration_weeks.max);
    assert.ok(at(5000).duration_weeks.max > at(600).duration_weeks.max);
  });

  test('search stops being configuration where Shopify says it does', () => {
    // Configuring Search & Discovery is in every offer, and the backlog has
    // always built the collection and search pages. What was not priced is the
    // point where Shopify's own documented limits run out. Both thresholds are
    // the published ones, verified 2026-09-21:
    // help.shopify.com/en/manual/online-store/search-and-discovery/filters
    const at = (catalogue) => classifyOffer({ ...base(), catalogue }).scope_gates.search_merchandising;
    const filters = (n) => Array.from({ length: n }, (_, i) => `filter-${i}`);

    assert.equal(at({ sku_count: 800, storefront_filters: filters(6) }).active, false,
      'six filters on a small catalogue is what the app is for');

    // 25 filters per store is the cap. Past it, native cannot do it at all.
    assert.equal(at({ sku_count: 800, storefront_filters: filters(25) }).active, false);
    assert.equal(at({ sku_count: 800, storefront_filters: filters(26) }).tier, 'app');

    // And a collection over 5,000 products shows no filters whatsoever.
    assert.equal(at({ sku_count: 4999, storefront_filters: filters(2) }).active, false);
    assert.equal(at({ sku_count: 5000, storefront_filters: filters(2) }).tier, 'app');
    // No filters asked for is no filter problem, whatever the catalogue.
    assert.equal(at({ sku_count: 80000 }).active, false);

    // Hand-curated merchandising at scale is somebody's job after launch, but
    // native still does it.
    assert.equal(at({ sku_count: 1000, collections_estimate: 200, collection_mode: 'manual' }).tier, 'native');
    assert.equal(at({ sku_count: 1000, collections_estimate: 200, collection_mode: 'automated' }).active, false,
      'a rule that maintains itself is not merchandising work');
  });

  test('no offer excludes something the same page prices as one of its gates', () => {
    // The Foundation page said "no ERP, PIM, CRM or 3PL connection is in this
    // offer" directly above a gate table pricing one at +1-3 weeks and
    // CHF 10-30k, and Growth excluded a headless storefront, which is the thing
    // Growth is bought for. A boundary that contradicts the price list on the
    // same page is the first thing a client challenges, and rightly.
    const priced = new Map(offering.scope_gates.map((g) => [g.id, g.label]));
    const FLAT_DENIAL = /\bis (not )?in this offer\b|\bnot included in this offer\b/i;
    for (const [code, offer] of Object.entries(offering.offers)) {
      for (const line of offer.not_included ?? []) {
        assert.doesNotMatch(line, FLAT_DENIAL,
          `${code}: "${line}" denies flatly what a gate may price — say it is not in the base instead`);
      }
    }

    // And the one that is simply false: Ecommerce Growth builds headless.
    const growth = (offering.offers.L.not_included ?? []).join(' ');
    assert.doesNotMatch(growth, /^(?:(?!outside Shopify).)*a headless .{0,40}storefront\b/is,
      'Growth cannot exclude the track it is triggered by');
    assert.ok(priced.has('storefront_design'));
    // The design system is built inside the offers, priced by its gate, since
    // it stopped being an L trigger.
    for (const [code, offer] of Object.entries(offering.offers)) {
      const design = (offer.not_included ?? []).find((l) => /design system|figma/i.test(l));
      if (design) {
        assert.match(design, /gate|not in the base/i,
          `${code}: "${design}" reads as a refusal of work the storefront design gate prices`);
      }
    }
  });

  test('the envelope is the offer\u2019s own arithmetic, and gates inside it cost nothing extra', () => {
    // Two light gates are what an M is for. Charging them on top would be the
    // mirror of the bug above.
    const light = classifyOffer({
      ...base(),
      ...markets('CH', 'DE'),
      catalogue: { sku_count: 900, variant_options_max: 3 },
    });
    assert.equal(light.code, 'M');
    assert.deepEqual(light.duration_weeks, offering.offers.M.duration_weeks);
    assert.deepEqual(light.modifiers, []);
    assert.deepEqual(light.gate_capacity_weeks, {
      min: offering.offers.M.duration_weeks.min - offering.offers.S.duration_weeks.min,
      max: offering.offers.M.duration_weeks.max - offering.offers.S.duration_weeks.max,
    });
  });

  test('and scope that still fits an M stays an M', () => {
    // The mirror of the rule above: four light gates are not an L just for
    // being four. This is why the escalation counts weeks, not gates.
    const light = classifyOffer({
      ...base(),
      ...markets('CH', 'DE'),
      retail: { store_count: 2, pos: 'shopify_pos' },
      integrations: [{ category: 'erp', connector: 'custom' }],
      catalogue: { sku_count: 900, variant_options_max: 3 },
    });
    assert.equal(light.code, 'M');
    assert.ok(light.scope_effort_weeks.max <= offering.offers.M.duration_weeks.max);
  });

  test('Swiss trilingual is free; the fourth language is charged', () => {
    // Every Swiss engagement is DE/FR/IT, so charging from the second language
    // would have put a surcharge on the home market. The offering absorbs three
    // and prices the fourth, which is where a translation workflow starts.
    const langs = (...list) => ({ markets: { list: [{ code: 'CH', currency: 'CHF', price_strategy: 'base_currency', languages: list }] } });
    const trilingual = classifyOffer({ ...base(), ...langs('de', 'fr', 'it') });
    assert.equal(trilingual.scope_gates.languages.active, false, 'DE/FR/IT costs nothing extra');
    assert.deepEqual(trilingual.modifiers, []);

    const four = classifyOffer({ ...base(), ...langs('de', 'fr', 'it', 'en') });
    assert.equal(four.scope_gates.languages.active, true);
    assert.deepEqual(four.modifiers, ['+Languages']);
    // Exactly one language's worth, not four. Asserting only "more than three"
    // let a version through that charged for all four and read as plausible.
    const perLanguage = offering.modifiers.find((m) => m.id === '+Languages').per_language_price;
    assert.equal(four.price_band.max - classifyOffer(base()).price_band.max, perLanguage,
      'the fourth language is charged once — the first three are in the offer');

    // Priced per language beyond the three, not as one flat surcharge.
    const six = classifyOffer({ ...base(), ...langs('de', 'fr', 'it', 'en', 'es', 'pt') });
    assert.ok(six.price_band.max > four.price_band.max,
      `six languages (${six.price_band.max}) must cost more than four (${four.price_band.max})`);
  });

  test('integrations are priced per integration and retail per location', () => {
    // One ERP connector and four are not the same job. A flat modifier quoted
    // them identically, which is the single largest way an M overran.
    const one = classifyOffer({ ...base(), integrations: [{ category: 'erp', connector: 'custom' }] });
    const three = classifyOffer({ ...base(), integrations: ['erp', 'pim', 'crm'].map((category) => ({ category, connector: 'custom' })) });
    assert.ok(three.duration_weeks.max > one.duration_weeks.max + 1, 'three connectors take longer than one');
    assert.ok(three.price_band.max > one.price_band.max);

    const store = (n) => classifyOffer({ ...base(), retail: { store_count: n, pos: 'shopify_pos' } });
    assert.ok(store(5).duration_weeks.max > store(1).duration_weeks.max + 2, 'five locations are not one location');
    assert.ok(store(5).price_band.max > store(1).price_band.max);
  });

  test('the storefront is priced by how much of it is designed, not by the track', () => {
    // Two engagements with identical commerce scope — one taking Horizon with
    // brand tokens, one building the full template set from Figma — came out of
    // the engine with the same band, and the second is three to five weeks more.
    const design = (over) => classifyOffer({ ...base(), design: over });
    assert.equal(design({ figma: { completeness: 'brand_only' } }).scope_gates.storefront_design.active, false,
      'Horizon with brand tokens is in every offer');

    const extended = design({ figma: { completeness: 'key_screens' } });
    const bespoke = design({ figma: { completeness: 'all_templates' } });
    assert.equal(extended.scope_gates.storefront_design.tier, 'extended');
    assert.equal(bespoke.scope_gates.storefront_design.tier, 'bespoke');
    assert.deepEqual(extended.modifiers, ['+Design (extended)']);
    assert.deepEqual(bespoke.modifiers, ['+Design (bespoke)']);

    // A tiered gate resolving to the first declared tier is the bug this test
    // exists for: every bespoke design was quoted at the extended price.
    assert.ok(bespoke.duration_weeks.max > extended.duration_weeks.max + 2,
      `bespoke ${bespoke.duration_weeks.max}wk must be well past extended ${extended.duration_weeks.max}wk`);
    assert.ok(bespoke.price_band.max > extended.price_band.max);

    // And the tiers stay resolved by tier for the gate this pattern came from.
    const migration = (source) => classifyOffer({ ...base(), migration: { source_platform: source } });
    assert.deepEqual(migration('woocommerce').modifiers, ['+Migration (light)']);
    assert.deepEqual(migration('magento').modifiers, ['+Migration (heavy)']);
  });

  test('markets have no ceiling of their own — the effort total is the ceiling', () => {
    // "More than five markets" used to be a STOP. It was a third of what an L
    // can hold, and the segment Merkle sells to is Swiss exporters running five
    // or more. Twelve markets on their own are a priced modifier, not an exit.
    const twelve = classifyOffer({ ...base(), ...markets('CH', 'DE', 'AT', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'SE', 'DK', 'NO') });
    assert.ok(twelve.scope_effort_weeks.max <= offering.offers.L.duration_weeks.max,
      'markets alone do not exceed the L ceiling');
    assert.deepEqual(offering.exit_rules.find((r) => r.id === '11.3').inputs, ['/offer/scope_effort_weeks'],
      '11.3 reads the total, not the market count');
  });

  test('the phases add up to the offer, so a phase cannot quietly grow', () => {
    // "Four to five weeks" is a number a consultant defends in a room, and the
    // only defence is the phases. Published for the first time here, which is
    // worth nothing unless they sum to the duration the offer is sold at.
    for (const [code, offer] of Object.entries(offering.offers)) {
      assert.ok(offer.phases?.length >= 7, `${code}: an offer with no phase plan says nothing about where its weeks go`);
      const sum = (k) => offer.phases.reduce((a, p) => a + p.weeks[k], 0);
      assert.equal(sum('min'), offer.duration_weeks.min, `${code}: the phase minimums do not add up to the offer`);
      assert.equal(sum('max'), offer.duration_weeks.max, `${code}: the phase maximums do not add up to the offer`);

      // The four a client asks about by name.
      const ids = offer.phases.map((p) => p.id);
      for (const id of ['setup', 'template', 'apps', 'design']) assert.ok(ids.includes(id), `${code}: no ${id} phase`);
      assert.equal(new Set(ids).size, ids.length, `${code}: a phase id appears twice`);
      for (const phase of offer.phases) assert.ok(phase.covers?.length > 40, `${code}/${phase.id}: covers has to say something`);
    }
  });

  test('every phase says what is handed over, and no phase just restates its own summary', () => {
    // "What do I actually get" had no answer on the offer pages: four lines of
    // scope and a duration, with the middle invented in the room. Each phase now
    // carries the things handed over at the end of it.
    for (const [code, offer] of Object.entries(offering.offers)) {
      for (const phase of offer.phases) {
        const got = phase.deliverables ?? [];
        assert.ok(got.length >= 2, `${code}/${phase.id}: a phase with fewer than two deliverables is a heading`);
        assert.equal(new Set(got).size, got.length, `${code}/${phase.id}: the same deliverable twice`);
        for (const line of got) {
          assert.ok(line.length > 25, `${code}/${phase.id}: "${line}" is too thin to be a deliverable`);
          // The summary line and the first deliverable said the same thing on
          // four phases, which reads as padding and costs the reader trust.
          assert.notEqual(line.replace(/[.,—]/g, '').trim().toLowerCase(),
            phase.covers.replace(/[.,—]/g, '').trim().toLowerCase(),
            `${code}/${phase.id}: a deliverable restates the phase summary`);
        }
      }
    }
  });

  test('every offer says where it stops and what it needs from the client', () => {
    // An offer that only lists what it includes is the one argued about in week
    // six, and "we assumed you had a sandbox" is not an argument anybody wins.
    for (const [code, offer] of Object.entries(offering.offers)) {
      assert.ok(offer.not_included?.length >= 4, `${code}: fewer than four exclusions is not a boundary`);
      assert.ok(offer.client_provides?.length >= 4, `${code}: the client has to bring more than three things`);
      for (const line of [...offer.not_included, ...offer.client_provides]) {
        assert.ok(line.length > 30, `${code}: "${line}" says too little to be held to`);
      }
    }

    // The one the engine has a rule about: a system with no test environment is
    // flagged by 11.24, so Scale has to ask the client for one.
    assert.ok(offering.offers.M.client_provides.some((l) => /non-production environment/.test(l)),
      'Scale connects systems, so it has to ask for somewhere to connect to');
  });

  test('every offer says what it covers per channel, and wholesale is not an extra', () => {
    for (const [code, offer] of Object.entries(offering.offers)) {
      for (const channel of ['b2c', 'b2b', 'both']) {
        assert.ok(offer.channels?.[channel]?.length > 40, `${code}: nothing said about ${channel}`);
      }
    }

    // The engine has to agree with what the pages say. A wholesale-only client
    // is not a consumer store plus a modifier; a client selling both ways is.
    const model = (m) => classifyOffer({ ...base(), meta: { ...base().meta, client: { name: 'X', slug: 'x', business_model: m } } });
    assert.equal(model('b2b').scope_gates.b2b.active, false, 'wholesale only is the base, not a gate');
    assert.deepEqual(model('b2b').modifiers, [], 'and it is not charged as an addition');
    assert.equal(model('hybrid').scope_gates.b2b.active, true, 'both channels is what the gate is for');
    assert.deepEqual(model('hybrid').modifiers, ['+B2B']);
    assert.equal(model('dtc').scope_gates.b2b.active, false);

    // The same base, whichever single channel it is.
    assert.deepEqual(model('b2b').duration_weeks, model('dtc').duration_weeks);
    assert.deepEqual(model('b2b').price_band, model('dtc').price_band);
  });

  test('every offer band is in Swiss francs', () => {
    assert.equal(offering.currency, 'CHF');
    for (const doc of [base(), { ...base(), brand: { positioning: 'luxury' } }]) {
      assert.equal(classifyOffer(doc).price_band.currency, 'CHF');
    }
  });
});
