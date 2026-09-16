/**
 * Contract tests for the engagement schema, question bank and offering
 * (implementation plan Phase 1 exit criteria).
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import {
  engagementSchema,
  questionBank,
  offering,
  schemaNodeAt,
  defNode,
  enumValues,
  offeringReferences,
  questionsFeeding,
  validateEngagement,
} from '../../schema/index.js';

const questions = questionBank.questions;
const byId      = new Map(questions.map((q) => [q.id, q]));
const subsectionIds = new Set(questionBank.sections.flatMap((s) => s.subsections.map((ss) => ss.id)));

/** Inputs set by the engine rather than answered in the questionnaire. */
const isComputed = (input) => input.startsWith('/offer/') || input === '/meta/created_at';

/** True when an answer pointer and a rule input overlap (same field, ancestor or descendant). */
const covers = (answer, input) =>
  input === answer || input.startsWith(`${answer}/`) || answer.startsWith(`${input}/`);

describe('question bank', () => {
  test('ids are unique and match their subsection', () => {
    assert.equal(byId.size, questions.length, 'duplicate question id');
    for (const q of questions) {
      assert.ok(subsectionIds.has(q.subsection), `${q.id}: unknown subsection ${q.subsection}`);
      assert.ok(q.id.startsWith(`Q${q.subsection}.`), `${q.id}: id does not match subsection ${q.subsection}`);
    }
  });

  test('every maps_to pointer exists in the engagement schema', () => {
    for (const q of questions) {
      assert.ok(q.maps_to?.length > 0, `${q.id}: maps_to is empty`);
      for (const p of q.maps_to) assert.ok(schemaNodeAt(p), `${q.id}: ${p} not in schema`);
    }
  });

  test('answer_type is compatible with the schema node', () => {
    const multi = new Set(['group', 'money_range']);
    for (const q of questions) {
      if (q.maps_to.length > 1) {
        assert.ok(multi.has(q.answer_type), `${q.id}: several maps_to need answer_type group or money_range`);
        continue;
      }
      const node = schemaNodeAt(q.maps_to[0]);
      const isArray = node.type === 'array';
      const itemNode = isArray ? schemaNodeAt(`${q.maps_to[0]}/*`) : null;
      const checks = {
        boolean:     () => node.type === 'boolean',
        integer:     () => node.type === 'integer',
        number:      () => node.type === 'number' || node.type === 'integer',
        text:        () => node.type === 'string',
        long_text:   () => node.type === 'string',
        date:        () => node === defNode('date'),
        country:     () => node === defNode('country'),
        enum:        () => Array.isArray(node.enum),
        multi_enum:  () => isArray && Array.isArray(itemNode?.enum),
        list:        () => isArray && itemNode?.type === 'string',
        table:       () => isArray && itemNode?.type === 'object',
        money:       () => node === defNode('money'),
        money_range: () => node === defNode('money_range'),
        group:       () => false,
      };
      assert.ok(checks[q.answer_type], `${q.id}: unknown answer_type ${q.answer_type}`);
      assert.ok(checks[q.answer_type](), `${q.id}: answer_type ${q.answer_type} does not fit ${q.maps_to[0]}`);
    }
  });

  test('skip_if references an earlier question and a valid value', () => {
    const order = questions.map((q) => q.id);
    for (const q of questions.filter((x) => x.skip_if)) {
      const target = byId.get(q.skip_if.question);
      assert.ok(target, `${q.id}: skip_if references unknown ${q.skip_if.question}`);
      assert.ok(order.indexOf(target.id) < order.indexOf(q.id), `${q.id}: skip_if must reference an earlier question`);
      const value = q.skip_if.equals ?? q.skip_if.excludes;
      assert.notEqual(value, undefined, `${q.id}: skip_if needs equals or excludes`);
      const allowed = enumValues(schemaNodeAt(target.maps_to[0]));
      if (typeof value === 'string') assert.ok(allowed?.includes(value), `${q.id}: ${value} is not a value of ${target.id}`);
    }
  });

  test('feeds only reference ids defined in offering.json', () => {
    const refs = offeringReferences();
    for (const q of questions) {
      for (const f of q.feeds ?? []) assert.ok(refs.has(f), `${q.id}: unknown feed ${f}`);
    }
  });
});

describe('offering traceability', () => {
  test('every scope gate, L trigger and exit rule is fed by at least one question', () => {
    for (const ref of offeringReferences().keys()) {
      assert.ok(questionsFeeding(ref).length > 0, `${ref} has no question feeding it`);
    }
  });

  test('every rule input exists in the schema and is captured by a feeding question (or computed offer)', () => {
    for (const [ref, { inputs }] of offeringReferences()) {
      const feeders = questionsFeeding(ref).flatMap((id) => byId.get(id).maps_to);
      const allAnswers = questions.flatMap((q) => q.maps_to);
      for (const input of inputs) {
        assert.ok(schemaNodeAt(input), `${ref}: input ${input} not in schema`);
        if (isComputed(input)) continue;
        assert.ok(allAnswers.some((p) => covers(p, input)), `${ref}: no question captures ${input}`);
      }
      assert.ok(
        inputs.some((input) => isComputed(input) || feeders.some((p) => covers(p, input))),
        `${ref}: none of its feeding questions capture any of its inputs`,
      );
    }
  });

  test('exit rule ids are unique and results are defined', () => {
    const ids = offering.exit_rules.map((r) => r.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const r of offering.exit_rules) assert.ok(offering.exit_results[r.result], `${r.id}: unknown result ${r.result}`);
  });

  test('every modifier targets a scope gate and schema enum stays in sync', () => {
    const gates = new Set(offering.scope_gates.map((g) => g.id));
    for (const m of offering.modifiers) assert.ok(gates.has(m.gate), `${m.id}: unknown gate ${m.gate}`);
    const modifierIds = new Set(offering.modifiers.map((m) => m.id));
    for (const g of offering.scope_gates) {
      if (g.modifier !== null) assert.ok(modifierIds.has(g.modifier), `gate ${g.id}: unknown modifier ${g.modifier}`);
    }
    assert.deepEqual(
      [...schemaNodeAt('/offer/modifiers/*').enum].sort(),
      offering.modifiers.map((m) => m.id).sort(),
    );
    assert.deepEqual(
      Object.keys(engagementSchema.properties.offer.properties.scope_gates.properties).sort(),
      [...gates].sort(),
    );
    assert.deepEqual(
      Object.keys(engagementSchema.properties.offer.properties.l_triggers.properties).sort(),
      offering.l_triggers.map((t) => t.id).sort(),
    );
  });

  test('offer codes and integration categories exist in the schema', () => {
    assert.deepEqual(Object.keys(offering.offers).sort(), [...schemaNodeAt('/offer/code').enum].sort());
    const categories = schemaNodeAt('/integrations/*/category').enum;
    for (const c of offering.integration_definition.counted_categories) assert.ok(categories.includes(c), c);
  });
});

describe('engagement schema', () => {
  test('accepts a minimal document and rejects unknown fields', () => {
    const minimal = { schema_version: '1.0.0', meta: { client: { name: 'X', slug: 'x' }, source: 'questionnaire' } };
    assert.equal(validateEngagement(minimal).valid, true);
    const drifted = { ...minimal, catalogue: { sku_counts: 10 } };
    assert.equal(validateEngagement(drifted).valid, false);
  });

  test('STOP and FLAG exit items must name a resolution owner', () => {
    const base = { schema_version: '1.0.0', meta: { client: { name: 'X', slug: 'x' }, source: 'questionnaire' } };
    const withItem = (item) => ({ ...base, exits: { triggered: false, items: [item] } });
    assert.equal(validateEngagement(withItem({ rule_id: '11.10', result: 'FLAG', source: 'rule' })).valid, false);
    assert.equal(validateEngagement(withItem({ rule_id: '11.10', result: 'FLAG', source: 'rule', resolution: { status: 'open' } })).valid, false);
    assert.equal(validateEngagement(withItem({ rule_id: '11.10', result: 'FLAG', source: 'rule', resolution: { status: 'open', owner: 'Lead Consultant' } })).valid, true);
    assert.equal(validateEngagement(withItem({ rule_id: '11.11', result: 'WARN', source: 'rule' })).valid, true);
  });
});
