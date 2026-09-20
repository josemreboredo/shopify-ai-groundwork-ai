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

  test('luxury positioning forces L regardless of gates', () => {
    const doc = { ...base(), brand: { positioning: 'luxury' } };
    const offer = classifyOffer(doc);
    assert.equal(offer.code, 'L');
    assert.equal(offer.delivery_track, 'hydrogen');
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

  test('scope that outgrows the M ceiling becomes an L, with no L trigger', () => {
    const heavy = classifyOffer({
      ...base(),
      ...markets('CH', 'DE', 'FR'),
      migration: { source_platform: 'magento' },
      b2b: { enabled: true },
      integrations: [{ category: 'erp', connector: 'custom' }],
    });
    assert.equal(heavy.code, 'L');
    assert.deepEqual(Object.entries(heavy.l_triggers).filter(([, t]) => t.active), [],
      'it is an L on effort alone, with no qualitative trigger');
    assert.ok(heavy.scope_effort_weeks.max > offering.offers.M.duration_weeks.max);
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

  test('every offer band is in Swiss francs', () => {
    assert.equal(offering.currency, 'CHF');
    for (const doc of [base(), { ...base(), brand: { positioning: 'luxury' } }]) {
      assert.equal(classifyOffer(doc).price_band.currency, 'CHF');
    }
  });
});
