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
  apps,
} from '../../schema/index.js';
import { PLAN_RULES } from '../../agents/discovery/plan.js';

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

describe('Shopify knowledge (question bank 1.1.0)', () => {
  const PLANS = new Set(schemaNodeAt('/shopify/target_plan').enum);
  const DOC_HOSTS = /^https:\/\/(help\.shopify\.com|shopify\.dev|www\.shopify\.com|changelog\.shopify\.com|apps\.shopify\.com)\//;
  const handles = new Set(apps.apps.map((a) => a.handle));

  test('every shopify block has valid features, plans, Shopify docs, registry apps and a verification date', () => {
    for (const q of questions.filter((x) => x.shopify)) {
      const s = q.shopify;
      for (const n of s.native) {
        assert.ok(n.feature?.trim(), `${q.id}: native feature name`);
        assert.ok(PLANS.has(n.plan), `${q.id}: plan ${n.plan}`);
        assert.match(n.docs, DOC_HOSTS, `${q.id}: docs must be an official Shopify URL`);
      }
      if (s.app_category?.url) assert.match(s.app_category.url, /^https:\/\/apps\.shopify\.com\/categories\//, `${q.id}: category URL`);
      for (const h of s.apps ?? []) assert.ok(handles.has(h), `${q.id}: app ${h} is not in schema/apps.json`);
      assert.match(s.verified?.on ?? '', /^\d{4}-\d{2}-\d{2}$/, `${q.id}: verified.on`);
      assert.doesNotMatch(JSON.stringify(s), /[€$£]\s?\d|\d+\s?(EUR|USD|CHF|GBP)\b|\/mo\b|per month/i, `${q.id}: no prices in shopify blocks`);
    }
  });

  test('questions that decide the Shopify plan or an app signal carry Shopify knowledge', () => {
    const missing = questions.filter((q) => q.feeds?.some((f) => f === 'exit:11.1' || f.startsWith('app:')) && !q.shopify && q.id !== 'Q1.2.3').map((q) => q.id);
    assert.deepEqual(missing, []);
  });

  test('questions feeding only app signals carry ask_if conditions on answers a quick interview collects', () => {
    const quick = (q) => q.priority === 'required' || q.feeds?.some((f) => !f.startsWith('app:')) || Boolean(q.ask_if);
    const kinds = ['equals', 'not_equals', 'in', 'includes_any', 'min', 'count_min', 'matches'];
    for (const q of questions.filter((x) => x.feeds?.length && x.feeds.every((f) => f.startsWith('app:')) && x.priority !== 'required')) {
      assert.ok(q.ask_if?.length > 0, `${q.id}: needs ask_if`);
      for (const c of q.ask_if) {
        assert.ok(schemaNodeAt(c.pointer), `${q.id}: ${c.pointer} not in schema`);
        assert.equal(kinds.filter((k) => k in c).length, 1, `${q.id}: one condition kind per entry`);
        const source = questions.find((x) => x.id !== q.id && x.maps_to.some((p) => covers(p, c.pointer)));
        assert.ok(source && quick(source), `${q.id}: ${c.pointer} must be captured by a question a quick interview asks`);
        if ('matches' in c) assert.doesNotThrow(() => new RegExp(c.matches, 'i'));
      }
    }
  });

  test('only_if conditions use known kinds on answers a quick interview collects; mainland China questions depend on CN', () => {
    for (const q of questions.filter((x) => x.only_if)) {
      for (const c of q.only_if) {
        assert.ok(schemaNodeAt(c.pointer), `${q.id}: ${c.pointer}`);
        const source = questions.find((x) => x.id !== q.id && x.maps_to.some((p) => covers(p, c.pointer)));
        assert.equal(source?.priority, 'required', `${q.id}: ${c.pointer} must come from a required question`);
      }
    }
    const china = questions.filter((q) => q.subsection === '3.5');
    assert.ok(china.length >= 15);
    for (const q of china) assert.deepEqual(q.only_if, [{ pointer: '/markets/list/*/code', includes_any: ['CN'] }], q.id);
  });

  test('every Shopify plan rule reads answers that exit rule 11.1 lists and a question feeding 11.1 asks', () => {
    const rule = offering.exit_rules.find((r) => r.id === '11.1');
    const feeders = questionsFeeding('exit:11.1').flatMap((id) => byId.get(id).maps_to);
    for (const r of PLAN_RULES) {
      assert.ok(r.docs.startsWith('https://'), r.feature);
      for (const input of r.inputs) {
        assert.ok(rule.inputs.includes(input), `${r.feature}: ${input} missing from 11.1 inputs`);
        assert.ok(feeders.some((p) => covers(p, input)), `${r.feature}: no question feeding 11.1 captures ${input}`);
      }
    }
  });

  test('app registry: unique handles matching their App Store URL, approval needs an approver and date, no prices', () => {
    assert.equal(handles.size, apps.apps.length, 'duplicate handle');
    for (const a of apps.apps) {
      assert.equal(a.url, `https://apps.shopify.com/${a.handle}`, a.handle);
      assert.ok(['proposed', 'approved'].includes(a.status), `${a.handle}: status`);
      if (a.status === 'approved') assert.ok(a.approved_by && /^\d{4}-\d{2}-\d{2}$/.test(a.approved_on ?? ''), `${a.handle}: approval`);
      assert.doesNotMatch(JSON.stringify(a), /[€$£]\s?\d|\d+\s?(EUR|USD|CHF|GBP)\b|\/mo\b|per month/i, `${a.handle}: no prices`);
    }
  });

  test('exit rules 11.2 and 11.5 are FLAGs (Shopify benchmark); mainland China and POS are modelled', () => {
    const result = (id) => offering.exit_rules.find((r) => r.id === id)?.result;
    assert.deepEqual(['11.2', '11.5', '11.18', '11.19', '11.20', '11.21'].map(result), ['FLAG', 'FLAG', 'FLAG', 'FLAG', 'FLAG', 'STOP']);
    assert.ok(offering.scope_gates.some((g) => g.id === 'retail_pos'));
    assert.ok(!offering.offers.S.base_scope.includes('Plus'), 'offers do not assume Shopify Plus');
  });
});
