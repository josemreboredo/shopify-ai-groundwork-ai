/**
 * Golden engagement fixtures (discovery/tests/fixtures/engagements/*.json) must be
 * schema-valid and consistent with discovery/schema/offering.json. They are the expected
 * outputs for the Phase 2 discovery engine.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  questionBank,
  offering,
  schemaNodeAt,
  validateEngagement,
} from '../../schema/index.js';

const FIXTURE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../fixtures/engagements');

const fixtures = fs.readdirSync(FIXTURE_DIR)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((file) => ({ file, doc: JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, file), 'utf8')) }));

const questionIds = new Set(questionBank.questions.map((q) => q.id));
const rulesById   = new Map(offering.exit_rules.map((r) => [r.id, r]));

/** Data pointer → schema pointer ("/integrations/0/owner" → "/integrations/*\/owner"). */
const toSchemaPointer = (pointer) =>
  pointer.split('/').map((s) => (/^\d+$/.test(s) ? '*' : s)).join('/');

const activeIds = (group = {}) => Object.entries(group).filter(([, g]) => g.active).map(([id]) => id);

/** Every question id referenced anywhere in the document (question_id / question_ids keys). */
function collectQuestionIds(node, out = []) {
  if (Array.isArray(node)) {
    for (const item of node) collectQuestionIds(item, out);
  } else if (node && typeof node === 'object') {
    for (const [key, value] of Object.entries(node)) {
      if (key === 'question_id') out.push(value);
      else if (key === 'question_ids') out.push(...value);
      else collectQuestionIds(value, out);
    }
  }
  return out;
}

test('fixture directory is not empty', () => {
  assert.ok(fixtures.length >= 3, 'expected at least three golden fixtures');
});

for (const { file, doc } of fixtures) {
  describe(`fixture ${file}`, () => {
    test('is valid against the engagement schema', () => {
      const { valid, errors } = validateEngagement(doc);
      assert.ok(valid, `schema errors:\n  ${errors.join('\n  ')}`);
    });

    test('offer is consistent with offering.json', () => {
      const { offer } = doc;
      assert.ok(offer, 'offer is missing');

      const gateIds    = offering.scope_gates.map((g) => g.id);
      const triggerIds = offering.l_triggers.map((t) => t.id);
      for (const id of Object.keys(offer.scope_gates ?? {})) assert.ok(gateIds.includes(id), `unknown gate ${id}`);
      for (const id of Object.keys(offer.l_triggers ?? {})) assert.ok(triggerIds.includes(id), `unknown L trigger ${id}`);

      const gates    = activeIds(offer.scope_gates);
      const triggers = activeIds(offer.l_triggers);
      assert.deepEqual(triggers, [], 'these fixtures ask for no headless storefront');

      const def = offering.offers[offer.code];
      assert.equal(offer.name, def.name);
      assert.equal(offer.delivery_track, def.delivery_track);
      assert.equal(offer.price_band.open_ended ?? false, false, 'no quote is open-ended: every one is the scope’s sum');
      assert.equal(offer.price_band.currency, offering.currency);
      assert.deepEqual(offer.gate_capacity_weeks, {
        min: def.duration_weeks.min - offering.offers.S.duration_weeks.min,
        max: def.duration_weeks.max - offering.offers.S.duration_weeks.max,
      });

      /* Modelled here rather than imported, so this stays an independent check
         and not the engine agreeing with itself: every active gate is quoted,
         and the quote is the Foundation base plus each quoted modifier. */
      const quoted = (offer.modifiers ?? []).map((id) => offering.modifiers.find((m) => m.id === id));
      // One decision, one price: a further market carries its currency, and a
      // catalogue of 5,000 SKUs or more carries Shopify's own search.
      const g = offer.scope_gates;
      const carried = (id) => (id === 'multi_currency' && g.markets?.active)
        || (id === 'search_merchandising' && g.search_merchandising?.tier === 'native' && ['large', 'very_large'].includes(g.sku_complexity?.tier))
        || (id === 'custom_templates' && g.storefront_design?.tier === 'bespoke');
      assert.deepEqual(quoted.map((m) => m.gate).sort(), gates.filter((id) => !carried(id)).sort(), 'every active gate is quoted, and only those');
      const weeks = (offer.scope_effort_by_gate ?? []).reduce((a, g) => ({ min: a.min + g.weeks.min, max: a.max + g.weeks.max }), { min: 0, max: 0 });
      const S = offering.offers.S;
      const rate = offering.pricing.weekly_rate;
      assert.deepEqual(offer.duration_weeks, {
        min: Math.round((S.duration_weeks.min + weeks.min) * 2) / 2,
        max: Math.round((S.duration_weeks.max + weeks.max) * 2) / 2,
      });
      const care = (days) => (days / 5) * rate * offering.pricing.hypercare_rate_share;
      const hypercare = Math.max(def.hypercare_days, doc.delivery?.hypercare_days ?? 0);
      assert.deepEqual(offer.hypercare, { days: hypercare, included_days: def.hypercare_days });
      // Design: the Foundation's brand adaptation, in S's band, and each quoted
      // gate's own design days at the design day.
      const d = offering.pricing.design;
      const gateDesign = quoted.reduce((a, m) => ({ min: a.min + (m.design_days?.min ?? 0), max: a.max + (m.design_days?.max ?? 0) }), { min: 0, max: 0 });
      assert.deepEqual(offer.design, { days: { min: d.foundation_days.min + gateDesign.min, max: d.foundation_days.max + gateDesign.max } });
      assert.equal(offer.price_band.min, Math.round((S.price_band.min - care(S.hypercare_days) + weeks.min * rate + gateDesign.min * d.day_price + care(hypercare)) / 1000) * 1000);
      assert.equal(offer.price_band.max, Math.round((S.price_band.max - care(S.hypercare_days) + weeks.max * rate + gateDesign.max * d.day_price + care(hypercare)) / 1000) * 1000);

      // The name is a budget the quote reaches, with what goes past the pack
      // sold as add-ons in it.
      if (offer.code !== 'S') assert.ok(offer.price_band.min >= def.price_band.min - 500, `${offer.code} below its own floor`);
      for (const a of offer.addons ?? []) {
        const sold = offering.closed_scope.addons.find((x) => x.gate === a.gate);
        assert.ok(sold?.available_in.includes(offer.code), `${a.gate} is named an add-on to ${offer.code}, which does not sell it`);
      }
    });

    test('exit items reference known rules with matching results', () => {
      for (const item of doc.exits.items) {
        const rule = rulesById.get(item.rule_id);
        assert.ok(rule, `unknown exit rule ${item.rule_id}`);
        assert.equal(item.result, rule.result, `${item.rule_id}: result`);
      }
      const ids = doc.exits.items.map((i) => i.rule_id);
      assert.equal(new Set(ids).size, ids.length, 'duplicate exit rule items');
    });

    test('exits.triggered and delivery.go follow open STOP items', () => {
      const openStop = doc.exits.items.some((i) => i.result === 'STOP' && i.resolution?.status === 'open');
      assert.equal(doc.exits.triggered, openStop);
      assert.equal(doc.delivery?.go, !doc.exits.triggered);
    });

    test('question ids exist in the bank and pointers resolve in the schema', () => {
      for (const id of collectQuestionIds(doc)) assert.ok(questionIds.has(id), `unknown question id ${id}`);
      for (const pointer of Object.keys(doc.provenance ?? {})) {
        assert.ok(schemaNodeAt(toSchemaPointer(pointer)), `provenance key ${pointer} not in schema`);
      }
      for (const item of doc.approach?.risks?.open_items ?? []) {
        assert.ok(schemaNodeAt(toSchemaPointer(item.pointer)), `open item ${item.pointer} not in schema`);
      }
    });
  });
}

test('golden fixtures produce the expected outcomes', () => {
  const byFile = new Map(fixtures.map(({ file, doc }) => [file, doc]));
  const expected = {
    'acme-watches.json': {
      code: 'M', go: true,
      gates: ['markets', 'multi_currency', 'b2b', 'integration', 'sku_complexity', 'migration', 'seo_continuity', 'returns_post_purchase',
        'checkout_extensibility', 'analytics_consent', 'post_launch_support'],
      exits: ['11.10', '11.14', '11.23'],
    },
    'foundation-minimal.json': { code: 'S', go: true, gates: [], exits: [] },
    'stop-custom-checkout.json': { code: 'S', go: false, gates: ['markets', 'multi_currency', 'storefront_design'], exits: ['11.6', '11.23'] },
  };

  for (const [file, want] of Object.entries(expected)) {
    const doc = byFile.get(file);
    assert.ok(doc, `${file} is missing`);
    assert.equal(doc.offer.code, want.code, `${file}: offer code`);
    assert.equal(doc.delivery.go, want.go, `${file}: delivery.go`);
    assert.deepEqual(activeIds(doc.offer.scope_gates).sort(), [...want.gates].sort(), `${file}: active gates`);
    assert.deepEqual(activeIds(doc.offer.l_triggers), [], `${file}: L triggers`);
    assert.deepEqual(doc.exits.items.map((i) => i.rule_id).sort(), [...want.exits].sort(), `${file}: exit items`);
  }

  assert.deepEqual(byFile.get('foundation-minimal.json').offer.modifiers, []);
  const stop = byFile.get('stop-custom-checkout.json');
  assert.equal(stop.exits.triggered, true);
  assert.ok(stop.exits.items.some((i) => i.rule_id === '11.6' && i.result === 'STOP' && i.resolution.status === 'open'));
});
