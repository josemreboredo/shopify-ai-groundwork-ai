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
      // Modelled here rather than imported, so this stays an independent check
      // and not the engine agreeing with itself. The rule is the work, in weeks:
      // outgrow what an M holds and it is an L, which is the same Liquid build
      // one size up. Nothing qualitative decides it — a storefront that is not
      // a Shopify theme leaves the offers entirely (11.26, 11.27).
      const reach = offer.scope_effort_weeks?.max ?? offering.offers.S.duration_weeks.max;
      const expected = reach > offering.offers.M.duration_weeks.max ? 'L' : gates.length >= 2 ? 'M' : 'S';
      assert.equal(offer.code, expected, `active gates [${gates}], reach ${reach}`);
      assert.deepEqual(triggers, [], 'there are no L triggers left to fire');

      const def = offering.offers[offer.code];
      assert.equal(offer.name, def.name);
      assert.equal(offer.delivery_track, def.delivery_track);
      assert.equal(offer.price_band.open_ended ?? false, def.price_band.open_ended);
      assert.equal(offer.price_band.currency, offering.currency);

      // Each band is an S plus the gate work it was sized for. Gates inside that
      // envelope cost nothing more; the excess is quoted on top.
      assert.deepEqual(offer.gate_capacity_weeks, {
        min: def.duration_weeks.min - offering.offers.S.duration_weeks.min,
        max: def.duration_weeks.max - offering.offers.S.duration_weeks.max,
      });

      const quoted = offer.modifiers ?? [];
      const gateOfModifier = new Map(offering.modifiers.map((m) => [m.id, m.gate]));
      for (const id of quoted) {
        assert.ok(gates.includes(gateOfModifier.get(id)), `${id} is quoted but its gate is not active`);
      }
      if (offer.code === 'S') {
        // An S prices its single gate in full: its band is base and nothing else.
        assert.equal(quoted.length, gates.length, 'an S quotes every gate it has');
      }
      if (quoted.length === 0) {
        assert.deepEqual(offer.duration_weeks, def.duration_weeks);
        assert.equal(offer.price_band.min, def.price_band.min);
        assert.equal(offer.price_band.max, def.price_band.max);
      } else {
        assert.ok(offer.duration_weeks.min >= def.duration_weeks.min, 'a quoted gate never shortens the offer');
        assert.ok(offer.duration_weeks.max >= def.duration_weeks.max);
        assert.ok(offer.price_band.min >= def.price_band.min);
        assert.ok(offer.price_band.max >= def.price_band.max);
        assert.ok(offer.price_band.min < offer.price_band.max, 'and the band never inverts');
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
      code: 'L', go: true,
      gates: ['markets', 'multi_currency', 'b2b', 'integration', 'sku_complexity', 'migration', 'seo_continuity',
        'checkout_extensibility', 'analytics_consent', 'post_launch_support'],
      exits: ['11.10', '11.14', '11.23'],
    },
    'foundation-minimal.json': { code: 'S', go: true, gates: [], exits: [] },
    'stop-custom-checkout.json': { code: 'M', go: false, gates: ['markets', 'multi_currency', 'storefront_design'], exits: ['11.6', '11.23'] },
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
