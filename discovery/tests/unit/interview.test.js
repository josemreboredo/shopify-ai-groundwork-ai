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
const byBankId = (id) => questionBank.questions.find((q) => q.id === id);
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
    for (const id of ['Q2.3.3', 'Q3.1.1', 'Q8.2.3']) assert.ok(ids.includes(id), `quick mode should ask rule-feeding ${id}`);
    assert.ok(!ids.includes('Q3.1.4'), 'the stated topology preference is optional and never decides the recommendation');
    for (const id of ['Q5.2.1', 'Q5.2.7', 'Q5.5.1', 'Q5.5.4']) assert.ok(!ids.includes(id), `quick mode should not ask ${id} yet`);
    const full = nextQuestions(consented('full'), { limit: 500 }).questions;
    assert.ok(full.some((q) => q.priority === 'optional'));
  });

  test('app-only questions join a quick interview when an earlier answer makes them relevant', () => {
    const s = consented('quick');
    const ask = () => nextQuestions(s, { limit: 500 }).questions.map((q) => q.id);
    assert.ok(!ask().includes('Q5.2.7'));
    assert.equal(recordAnswer(s, { pointer: '/post_purchase/orders_per_month', value: 2500, question_id: 'Q0.2.6', today: TODAY }).ok, true);
    for (const id of ['Q5.2.6', 'Q5.2.7', 'Q5.4.2', 'Q5.5.1']) assert.ok(ask().includes(id), `${id} after 2,500 orders per month`);
    assert.ok(!ask().includes('Q2.2.5'));
    recordAnswer(s, { pointer: '/catalogue/product_types', value: ['variant', 'pre_order'], question_id: 'Q2.2.1', today: TODAY });
    assert.ok(ask().includes('Q2.2.5'), 'pre-order payment after pre_order product type');
    assert.ok(!ask().includes('Q3.2.1'));
    recordAnswer(s, { pointer: '/markets/list', value: [{ code: 'CH', languages: ['de', 'fr', 'it'] }], question_id: 'Q3.1.1', today: TODAY });
    assert.ok(ask().includes('Q3.2.1'), 'translation after 3 languages');
  });

  test('mainland China questions are asked, in any mode, only when CN is a launch market', () => {
    for (const mode of ['quick', 'full']) {
      const s = consented(mode);
      const china = () => nextQuestions(s, { limit: 500 }).questions.filter((q) => q.id.startsWith('Q3.5.')).map((q) => q.id);
      assert.deepEqual(china(), [], `${mode}: no China questions without CN`);
      recordAnswer(s, { pointer: '/markets/list', value: [{ code: 'CH' }, { code: 'HK' }], question_id: 'Q3.1.1', today: TODAY });
      assert.deepEqual(china(), [], `${mode}: Hong Kong is not mainland China`);
      recordAnswer(s, { pointer: '/markets/list', value: [{ code: 'CH' }, { code: 'CN' }], question_id: 'Q3.1.1', today: TODAY });
      assert.ok(china().includes('Q3.5.1') && china().includes('Q3.5.21'), `${mode}: China questions with CN`);
      assert.equal(china().includes('Q3.5.9'), mode === 'full', `${mode}: detailed China questions only in a full interview`);
      assert.ok(toExtraction(s).open_items.some((i) => i.question_id === 'Q3.5.1'), 'unanswered China questions become open items');
    }
    const noChina = consented('full');
    assert.ok(!toExtraction(noChina).open_items.some((i) => i.question_id?.startsWith('Q3.5.')), 'no China open items without CN');
  });

  test('a topic the client never raised is never asked about, whatever the mode', () => {
    /*
     * The question bank works by gateways: one unconditional question asks
     * whether a subject applies at all, and everything under it waits on the
     * answer. That is the right shape — you cannot know whether a client has
     * shops without asking once — but only mainland China was ever held to it
     * by a test, because China was an incident and the others were not.
     *
     * This is the general version. Answer the gateway with "no" and the block
     * behind it stays shut, in a quick interview and a full one alike. An
     * engagement that is greenfield, single-market and consumer-only should
     * never see a migration question, a POS question or a B2B question — and a
     * consultant who is asked them anyway stops trusting the interview.
     */
    const SHUT = [
      { what: 'retail and POS', gateway: { pointer: '/retail/store_count', value: 0, question_id: 'Q5.6.1' }, prefix: 'Q5.6.' },
      { what: 'migration', gateway: { pointer: '/migration/source_platform', value: 'none', question_id: 'Q0.5.4' }, prefix: 'Q8.2.' },
      { what: 'B2B', gateway: { pointer: '/meta/client/business_model', value: 'dtc', question_id: 'Q1.1.4' }, prefix: 'Q6.2.' },
    ];

    for (const mode of ['quick', 'full']) {
      for (const { what, gateway, prefix } of SHUT) {
        const s = consented(mode);
        recordAnswer(s, { ...gateway, today: TODAY });
        const asked = nextQuestions(s, { limit: 500 }).questions.filter((q) => q.id.startsWith(prefix)).map((q) => q.id);
        assert.deepEqual(asked, [], `${mode}: ${what} answered away and still asked ${asked.join(', ')}`);
        // And it does not come back as an open item either, which would put it
        // in the client's Q&A document under another name.
        const open = toExtraction(s).open_items.filter((i) => i.question_id?.startsWith(prefix));
        assert.deepEqual(open, [], `${mode}: ${what} is shut and still an open item`);
      }
    }
  });

  test('consultant questions come in a wrap-up block after the client questions; the STOP route question opens it', () => {
    const s = consented('quick');
    const qs = () => nextQuestions(s, { limit: 500 }).questions;
    const blocks = qs().map((q) => q.block);
    assert.ok(blocks.indexOf('consultant_wrap_up') > 0 && blocks.slice(blocks.indexOf('consultant_wrap_up')).every((x) => x === 'consultant_wrap_up'), 'client first, then consultant wrap-up');
    assert.ok(qs().filter((q) => q.block === 'consultant_wrap_up').every((q) => byBankId(q.id).audience === 'consultant' || byBankId(q.id).ask_when === 'stop'));
    recordAnswer(s, { pointer: '/checkout/customisation', value: ['fully_custom_checkout_ui'], question_id: 'Q4.2.1', today: TODAY });
    assert.notEqual(nextQuestions(s).questions[0].id, 'Q10.5.5', 'the route question waits for the wrap-up');
    const wrap = qs().filter((q) => q.block === 'consultant_wrap_up');
    assert.equal(wrap[0].id, 'Q10.5.5', 'the route question opens the wrap-up');
  });

  test('the route question is asked only while a STOP is open', () => {
    const s = consented('quick');
    assert.ok(!nextQuestions(s, { limit: 500 }).questions.some((q) => q.id === 'Q10.5.5'));
    recordAnswer(s, { pointer: '/checkout/customisation', value: ['fully_custom_checkout_ui'], question_id: 'Q4.2.1', today: TODAY });
    assert.ok(nextQuestions(s, { limit: 500 }).questions.some((q) => q.id === 'Q10.5.5'));
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
    assert.deepEqual(qs.find((q) => q.id === 'Q0.2.4').allowed_values, ['acquisition', 'conversion', 'retention', 'mixed', 'not_sure']);
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
    recordAnswer(s, { pointer: '/meta/client/business_model', value: 'hybrid', question_id: 'Q1.1.4', today: TODAY });
    p = preview(s, TODAY);
    assert.equal(p.scope_gates.markets, 'active');
    assert.equal(p.scope_gates.b2b, 'active');
    assert.equal(p.offer.code, 'M');
  });

  test('the minimum Shopify plan is suggested while the plan is open (B2B alone does not need Plus)', () => {
    const s = consented();
    assert.equal(preview(s, TODAY).plan_suggestion, undefined);
    recordAnswer(s, { pointer: '/meta/client/business_model', value: 'hybrid', question_id: 'Q1.1.4', today: TODAY });
    assert.equal(preview(s, TODAY).plan_suggestion, undefined, 'Shopify B2B runs on every plan from Basic');
    recordAnswer(s, { pointer: '/b2b/price_lists', value: true, question_id: 'Q6.2.3', today: TODAY });
    recordAnswer(s, { pointer: '/checkout/customisation', value: ['checkout_step_blocks_or_fields'], question_id: 'Q4.2.1', today: TODAY });
    const suggestion = preview(s, TODAY).plan_suggestion;
    assert.equal(suggestion.value, 'plus');
    assert.deepEqual(suggestion.reasons, ['company-specific B2B catalogs (Shopify Plus)', 'checkout UI extensions on the information, shipping or payment steps / Checkout Branding API (Shopify Plus)']);
    recordAnswer(s, { pointer: '/shopify/target_plan', value: 'plus', question_id: 'Q1.2.3', today: TODAY });
    assert.equal(preview(s, TODAY).plan_suggestion, undefined);
  });

  test('a custom checkout UI shows STOP immediately', () => {
    const s = consented();
    recordAnswer(s, { pointer: '/checkout/customisation', value: ['fully_custom_checkout_ui'], question_id: 'Q4.2.1', today: TODAY });
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
      // Market topology is derived by the engine, so it is never replayed as an answer.
      delete answers.markets.topology;
      delete answers.markets.cross_border_model;

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

  test('a "not sure" answer becomes an open item after finish', () => {
    const workRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'interview-notsure-'));
    const env = { workRoot, date: TODAY };
    run('start', { client: 'unsure', mode: 'quick' }, env);
    run('answer', { client: 'unsure', pointer: '/meta/consent/llm_processing', value: 'true', question: 'Q10.5.2', source: 'consultant' }, env);
    run('answer', { client: 'unsure', pointer: '/meta/client/name', value: '"Unsure Ltd"', question: 'Q1.1.1' }, env);
    assert.equal(run('answer', { client: 'unsure', pointer: '/shopify/target_plan', value: '"not_sure"', question: 'Q1.2.3' }, env).ok, true);
    assert.equal(run('finish', { client: 'unsure' }, env).ok, true);
    const decision = JSON.parse(fs.readFileSync(path.join(workRoot, 'unsure', 'decision.json'), 'utf8'));
    assert.ok(decision.approach.risks.open_items.some((o) => o.pointer === '/shopify/target_plan' && /not sure/i.test(o.why)));
  });

  test('TBC and unanswered in-mode questions become open items', () => {
    const s = consented('quick');
    markQuestion(s, { question_id: 'Q0.1.1', as: 'tbc', note: 'Client to confirm after board meeting', today: TODAY });
    const items = toExtraction(s).open_items;
    assert.ok(items.some((i) => i.question_id === 'Q0.1.1' && i.why.includes('board meeting')));
    assert.ok(items.some((i) => i.question_id === 'Q2.1.1'));
    assert.ok(items.every((i) => isAnswered({}, i.pointer) === false));
  });
});
