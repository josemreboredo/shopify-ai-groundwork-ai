/**
 * Consultant interview (Phase 5): question selection, answer validation,
 * live preview, and parity with the questionnaire path.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs   from 'node:fs';
import os   from 'node:os';
import path from 'node:path';

import { questionBank } from '../../schema/index.js';
import { createSession, isAnswered, valuesAt } from '../../agents/interview/session.js';
import { nextQuestions, CONSENT_QUESTION } from '../../agents/interview/next.js';
import { recordAnswer, markQuestion, addNote } from '../../agents/interview/answer.js';
import { preview } from '../../agents/interview/preview.js';
import { toExtraction } from '../../agents/interview/finish.js';
import { run } from '../../agents/interview/cli.js';
import { flattenAnswers, toSchemaPointer } from '../../agents/discovery/extract.js';

const TODAY = '2026-09-17';
const FIXTURES = path.join(import.meta.dirname, '..', 'fixtures', 'engagements');
const load = (name) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));

/** New session with consent already recorded. */
function consented(mode = 'standard') {
  const s = createSession({ client: 'test-client', mode, today: TODAY });
  const r = recordAnswer(s, { pointer: '/meta/consent/llm_processing', value: true, question_id: CONSENT_QUESTION, source: 'consultant', today: TODAY });
  assert.equal(r.ok, true, JSON.stringify(r));
  return s;
}

describe('question selection', () => {
  test('consent is always asked first and gates every other answer', () => {
    const s = createSession({ client: 'test-client', today: TODAY });
    const { questions } = nextQuestions(s);
    assert.deepEqual(questions.map((q) => q.id), [CONSENT_QUESTION]);

    const refused = recordAnswer(s, { pointer: '/catalogue/sku_count', value: 800, question_id: 'Q2.1.1', today: TODAY });
    assert.equal(refused.ok, false);
    assert.match(refused.errors.join(' '), /Consent/);
  });

  test('mode filters by priority, but questions that change the result are asked in every mode', () => {
    const quick = nextQuestions(consented('quick'), { limit: 500 }).questions;
    assert.ok(quick.length > 0 && quick.every((q) => q.priority === 'required' || q.feeds?.length));
    const ids = quick.map((q) => q.id);
    for (const id of ['Q2.3.3', 'Q3.1.4', 'Q8.2.3', 'Q5.2.7', 'Q5.5.1', 'Q5.5.4']) assert.ok(ids.includes(id), `quick mode should ask ${id}`);
    assert.ok(!ids.includes('Q5.2.1'), 'plain recommended questions stay out of quick mode');
    const full = nextQuestions(consented('full'), { limit: 500 }).questions;
    assert.ok(full.some((q) => q.priority === 'optional'));
  });

  test('the route question is asked only while a STOP is open, and first', () => {
    const s = consented('quick');
    assert.ok(!nextQuestions(s, { limit: 500 }).questions.some((q) => q.id === 'Q10.5.5'));
    recordAnswer(s, { pointer: '/checkout/customisation', value: 'custom_ui', question_id: 'Q4.2.1', today: TODAY });
    assert.equal(nextQuestions(s).questions[0].id, 'Q10.5.5');
    assert.equal(recordAnswer(s, { pointer: '/delivery/route', value: 'larger_engagement', question_id: 'Q10.5.5', source: 'consultant', today: TODAY }).ok, true);
    assert.ok(!nextQuestions(s, { limit: 500 }).questions.some((q) => q.id === 'Q10.5.5'));
    assert.equal(preview(s, TODAY).route, 'larger_engagement');
  });

  test('answered, TBC, skipped and skip_if questions are not asked again', () => {
    const s = consented();
    assert.equal(recordAnswer(s, { pointer: '/shopify/existing_store', value: false, question_id: 'Q1.2.1', today: TODAY }).ok, true);
    assert.equal(markQuestion(s, { question_id: 'Q0.1.1', as: 'tbc', today: TODAY }).ok, true);
    assert.equal(markQuestion(s, { question_id: 'Q0.1.2', as: 'skipped', today: TODAY }).ok, true);
    const ids = nextQuestions(s, { limit: 500 }).questions.map((q) => q.id);
    for (const id of ['Q1.2.1', 'Q1.2.2', 'Q0.1.1', 'Q0.1.2', CONSENT_QUESTION]) assert.ok(!ids.includes(id), id);
  });

  test('within a section, questions that feed gates or exit rules come first', () => {
    const s = consented('full');
    const section2 = nextQuestions(s, { limit: 500 }).questions.filter((q) => q.section.startsWith('§ 2 '));
    const firstPlain = section2.findIndex((q) => !q.feeds);
    const lastFeeding = section2.map((q) => Boolean(q.feeds)).lastIndexOf(true);
    assert.ok(lastFeeding < firstPlain, 'feeding questions should precede the rest');
  });

  test('question descriptions carry allowed values for enums and item fields for tables', () => {
    const qs = nextQuestions(consented('full'), { limit: 500 }).questions;
    assert.deepEqual(qs.find((q) => q.id === 'Q0.2.4').allowed_values, ['acquisition', 'conversion', 'retention', 'mixed', 'unknown']);
    assert.ok(Array.isArray(qs.find((q) => q.id === 'Q3.1.1').item_fields.price_strategy));
  });
});

describe('answers', () => {
  test('invalid values, foreign fields, computed fields and personal data are refused without changing the session', () => {
    const s = consented();
    const before = JSON.stringify(s);
    const cases = [
      { pointer: '/business/bottleneck', value: 'traffic', question_id: 'Q0.2.4' },
      { pointer: '/catalogue/sku_count', value: 800, question_id: 'Q0.2.4' },
      { pointer: '/offer/code', value: 'S' },
      { pointer: '/business/primary_problem', value: 'Call jane@acme.example', question_id: 'Q0.1.1' },
      { pointer: '/business/primary_problem', value: '', question_id: 'Q0.1.1' },
      { pointer: '/not/a/field', value: 1 },
    ];
    for (const c of cases) assert.equal(recordAnswer(s, { ...c, today: TODAY }).ok, false, JSON.stringify(c));
    assert.equal(JSON.stringify(s), before);
  });

  test('a valid answer is stored in English with provenance and clears TBC', () => {
    const s = consented();
    markQuestion(s, { question_id: 'Q0.2.4', as: 'tbc', today: TODAY });
    const r = recordAnswer(s, { pointer: '/business/bottleneck', value: 'conversion', question_id: 'Q0.2.4', source: 'client', status: 'confirmed', note: 'Client said: "Umwandlung"', today: TODAY });
    assert.equal(r.ok, true);
    assert.equal(valuesAt(s.answers, '/business/bottleneck')[0], 'conversion');
    assert.deepEqual(s.provenance['/business/bottleneck'], { source: 'client', status: 'confirmed', question_id: 'Q0.2.4', note: 'Client said: "Umwandlung"' });
    assert.equal(s.tbc['Q0.2.4'], undefined);
  });

  test('notes refuse personal data', () => {
    const s = consented();
    assert.equal(addNote(s, { text: 'Decision maker prefers phased launch', today: TODAY }).ok, true);
    assert.equal(addNote(s, { text: 'call +41 44 123 45 67', today: TODAY }).ok, false);
  });
});

describe('preview', () => {
  test('gates are unknown until answered, then the offer updates', () => {
    const s = consented();
    let p = preview(s, TODAY);
    assert.equal(p.scope_gates.markets, 'unknown');
    assert.equal(p.offer.provisional, true);

    recordAnswer(s, { pointer: '/markets/list', value: [{ code: 'DE', currency: 'EUR', languages: ['de'], price_strategy: 'base_currency' }, { code: 'AT', currency: 'EUR', languages: ['de'], price_strategy: 'manual' }], question_id: 'Q3.1.1', today: TODAY });
    recordAnswer(s, { pointer: '/b2b/enabled', value: true, question_id: 'Q6.2.1', today: TODAY });
    p = preview(s, TODAY);
    assert.equal(p.scope_gates.markets, 'active');
    assert.equal(p.scope_gates.b2b, 'active');
    assert.equal(p.offer.code, 'M');
  });

  test('the minimum Shopify plan is suggested while the plan is open (B2B alone does not need Plus)', () => {
    const s = consented();
    assert.equal(preview(s, TODAY).plan_suggestion, undefined);
    recordAnswer(s, { pointer: '/b2b/enabled', value: true, question_id: 'Q6.2.1', today: TODAY });
    assert.equal(preview(s, TODAY).plan_suggestion, undefined, 'Shopify B2B runs on every plan from Basic');
    recordAnswer(s, { pointer: '/b2b/price_lists', value: true, question_id: 'Q6.2.3', today: TODAY });
    recordAnswer(s, { pointer: '/checkout/customisation', value: 'extensibility', question_id: 'Q4.2.1', today: TODAY });
    const suggestion = preview(s, TODAY).plan_suggestion;
    assert.equal(suggestion.value, 'plus');
    assert.deepEqual(suggestion.reasons, ['company-specific B2B catalogs (Shopify Plus)', 'checkout UI extensions on the information, shipping or payment steps / Checkout Branding API (Shopify Plus)']);
    recordAnswer(s, { pointer: '/shopify/target_plan', value: 'plus', question_id: 'Q1.2.3', today: TODAY });
    assert.equal(preview(s, TODAY).plan_suggestion, undefined);
  });

  test('a custom checkout UI shows STOP immediately', () => {
    const s = consented();
    recordAnswer(s, { pointer: '/checkout/customisation', value: 'custom_ui', question_id: 'Q4.2.1', today: TODAY });
    const p = preview(s, TODAY);
    assert.equal(p.go, false);
    assert.ok(p.exit_rules.some((e) => e.rule === '11.6' && e.result === 'STOP'));
  });
});

describe('parity with the questionnaire path', () => {
  /** Question id whose fields cover a data pointer. */
  function questionFor(pointer) {
    const sp = toSchemaPointer(pointer);
    return questionBank.questions.find((q) => q.maps_to.some((m) => sp === m || sp.startsWith(`${m}/`)))?.id;
  }

  for (const file of ['acme-watches.json', 'foundation-minimal.json', 'stop-custom-checkout.json']) {
    test(`${file}: answers given in the interview reach the same offer, exit rules and GO/STOP`, () => {
      const fixture = load(file);
      const { schema_version, offer, exits, approach, provenance, notes, ...answers } = structuredClone(fixture);
      delete answers.meta.source;
      delete answers.meta.updated_at;
      delete answers.delivery.go;

      const workRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'interview-'));
      const slug = fixture.meta.client.slug;
      run('start', { client: slug, mode: 'standard' }, { workRoot, date: TODAY });

      const pairs = flattenAnswers(answers);
      const consent = pairs.find((p) => p.pointer === '/meta/consent/llm_processing');
      for (const pair of [consent, ...pairs.filter((p) => p !== consent)]) {
        const result = run('answer', { client: slug, pointer: pair.pointer, value: pair.value_json, ...(questionFor(pair.pointer) ? { question: questionFor(pair.pointer) } : {}), source: 'client' }, { workRoot, date: TODAY });
        assert.equal(result.ok, true, `${pair.pointer}: ${JSON.stringify(result.errors)}`);
      }

      const finished = run('finish', { client: slug }, { workRoot, date: TODAY });
      assert.equal(finished.ok, true, JSON.stringify(finished.errors));
      assert.equal(finished.offer.code, fixture.offer.code);
      assert.equal(finished.go, fixture.delivery.go);
      assert.deepEqual(finished.exit_rules.map((e) => `${e.rule}:${e.result}`), fixture.exits.items.map((i) => `${i.rule_id}:${i.result}`));

      const decision = JSON.parse(fs.readFileSync(path.join(workRoot, slug, 'decision.json'), 'utf8'));
      assert.equal(decision.meta.source, 'chatbot');
    });
  }

  test('TBC and unanswered in-mode questions become open items', () => {
    const s = consented('quick');
    markQuestion(s, { question_id: 'Q0.1.1', as: 'tbc', note: 'Client to confirm after board meeting', today: TODAY });
    const items = toExtraction(s).open_items;
    assert.ok(items.some((i) => i.question_id === 'Q0.1.1' && i.why.includes('board meeting')));
    assert.ok(items.some((i) => i.question_id === 'Q2.1.1'));
    assert.ok(items.every((i) => isAnswered({}, i.pointer) === false));
  });
});
