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
import { evaluateExits, IMPLEMENTED_RULES } from '../../agents/discovery/exits.js';

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
    assert.deepEqual([classifyOffer(doc).code, classifyOffer(doc).modifiers], ['S', ['+Migration']]);

    const singleMarket = { ...base(), markets: { list: [{ code: 'CH', currency: 'CHF', price_strategy: 'base_currency' }] } };
    assert.deepEqual([classifyOffer(singleMarket).code, classifyOffer(singleMarket).modifiers], ['S', []]);
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
    assert.deepEqual(ids({ ...base, shopify: { target_plan: 'grow' }, checkout: { customisation: 'extensibility' } }), ['11.1']);
    assert.deepEqual(ids({ ...base, shopify: { target_plan: 'grow' }, checkout: { customisation: 'custom_ui' } }), ['11.6']);
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
  });

  test('LLM candidates are added once, for known rules only, and never replace rule results', () => {
    const doc = { ...base, checkout: { customisation: 'custom_ui' } };
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
    const doc = { ...base, compliance: { gdpr_deletion_workflow: true }, checkout: { customisation: 'custom_ui' } };
    for (const item of evaluateExits(withOffer(doc)).items) {
      if (item.result !== 'WARN') assert.ok(item.resolution.owner);
    }
  });
});
