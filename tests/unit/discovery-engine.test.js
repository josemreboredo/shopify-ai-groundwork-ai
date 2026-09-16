/**
 * Discovery engine tests. The LLM is replaced by a recorded-response fake built
 * from the golden fixtures, so no network calls are made.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs   from 'node:fs';
import os   from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';

import { offering, validateEngagement } from '../../schema/index.js';

const validateEngagementErrors = (doc) => { const r = validateEngagement(doc); return r.valid ? [] : r.errors; };
import { runDiscovery } from '../../agents/discovery/engine.js';
import { hasConsent, redactQuestionnaire, InputRejectedError } from '../../agents/discovery/input.js';
import { buildExtractionSchema, buildApproachSchema, countOptionalParameters, MAX_OPTIONAL_PARAMETERS, fieldCatalogue } from '../../agents/discovery/extraction-schema.js';
import { assembleAnswers, flattenAnswers, extractAnswers, ExtractionInvalidError } from '../../agents/discovery/extract.js';
import Anthropic from '@anthropic-ai/sdk';
import { createLlm, parseStructured, LlmError, DEFAULT_MODEL, explainError, clientOptions } from '../../agents/discovery/llm.js';
import { approachInput, toApproachPayload, fromApproachPayload } from '../../agents/discovery/approach.js';
import { renderArtefacts } from '../../agents/discovery/render.js';
import { writeOutputs, parseArgs } from '../../agents/discovery/cli.js';

const require = createRequire(import.meta.url);
const Ajv2020 = require('ajv/dist/2020');

const ROOT = path.join(import.meta.dirname, '..', '..');
const FIXTURES = path.join(ROOT, 'tests', 'fixtures', 'engagements');
const load = (name) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
const ACME_MD = fs.readFileSync(path.join(ROOT, 'docs', 'discovery', 'example-acme-questionnaire.md'), 'utf8');

const CONSENT = '**Q10.5.2** — Consent? *(required · consultant)*\n\n- [x] Yes\n- [ ] No\n';

/** Answers-only view of a fixture (what extraction should recover). */
function fixtureAnswers(fixture) {
  const { schema_version, offer, exits, approach, provenance, notes, ...answers } = structuredClone(fixture);
  delete answers.meta.source;
  delete answers.meta.updated_at;
  if (answers.delivery) delete answers.delivery.go;
  return answers;
}

/** Extraction payload the model would return for a fixture. */
function recordedExtraction(fixture) {
  return {
    answers: flattenAnswers(fixtureAnswers(fixture)),
    provenance: Object.entries(fixture.provenance ?? {}).map(([pointer, p]) => ({
      pointer, source: p.source, status: p.status, question_id: p.question_id ?? '', note: p.note ?? '',
    })),
    exit_candidates: [],
    open_items: (fixture.approach?.risks?.open_items ?? []).map((o) => ({ pointer: o.pointer, question_id: o.question_id ?? '', why: o.why })),
  };
}

/** Approach payload the model would return for a fixture. */
const recordedApproach = (fixture) => toApproachPayload(fixture.approach ?? {});

/** Fake LLM adapter that records calls and replays fixture data. */
function fakeLlm(fixture) {
  const calls = [];
  return {
    calls,
    model: 'fake-model',
    async callStructured(call) {
      calls.push(call);
      const isExtraction = 'answers' in call.schema.properties;
      return { data: isExtraction ? recordedExtraction(fixture) : recordedApproach(fixture), model: 'fake-model', usage: {} };
    },
  };
}

const STRUCTURED_OUTPUT_UNSUPPORTED = ['minimum', 'maximum', 'minLength', 'maxLength', 'pattern', 'uniqueItems', 'propertyNames', 'if', 'then', 'else'];

function findKeys(node, keys, found = new Set()) {
  if (Array.isArray(node)) node.forEach((n) => findKeys(n, keys, found));
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (keys.includes(k) && k !== 'properties') found.add(k);
      // Property *names* such as "pattern" are fine; only schema keywords matter.
      if (k === 'properties') Object.values(v).forEach((child) => findKeys(child, keys, found));
      else findKeys(v, keys, found);
    }
  }
  return found;
}

describe('input guards', () => {
  test('consent is required and read from Q10.5.2', () => {
    assert.equal(hasConsent(ACME_MD), true);
    assert.equal(hasConsent(CONSENT.replace('[x] Yes', '[ ] Yes')), false);
    assert.equal(hasConsent(CONSENT.replace('[ ] No', '[x] No')), false);
    assert.equal(hasConsent('no consent question'), false);
  });

  test('runDiscovery refuses without consent and never calls the model', async () => {
    const llm = fakeLlm(load('acme-watches.json'));
    await assert.rejects(runDiscovery({ questionnaire: '# empty', llm, today: '2026-09-16' }), InputRejectedError);
    assert.equal(llm.calls.length, 0);
  });

  test('redacts e-mails, international phone numbers and stakeholder names — not dates or volumes', () => {
    const md = [
      'Contact: jane.doe@acme.example, call +41 44 123 45 67',
      'Launch 2027-02-01 · 25000 customers · 4200 redirects',
      '**Q10.2.1** — Who is involved? *(required)*',
      '',
      '| role | raci | decision maker | name |',
      '|---|---|---|---|',
      '| Managing Director | A | yes | Jane Doe |',
      '| IT Lead | C | no | — |',
      '',
      '**Q10.2.2** — Next question',
    ].join('\n');
    const { text, redactions } = redactQuestionnaire(md);
    assert.deepEqual(redactions, { emails: 1, phones: 1, names: 1 });
    assert.doesNotMatch(text, /jane\.doe|Jane Doe|\+41/);
    assert.match(text, /2027-02-01 · 25000 customers · 4200 redirects/);
  });

  test('fails closed on card numbers and customer e-mail lists', () => {
    assert.throws(() => redactQuestionnaire('card 4111 1111 1111 1111'), InputRejectedError);
    const list = Array.from({ length: 4 }, (_, i) => `c${i}@example.com`).join('\n');
    assert.throws(() => redactQuestionnaire(list), InputRejectedError);
  });
});

describe('structured output schemas', () => {
  test('contain no keywords structured outputs reject', () => {
    assert.deepEqual([...findKeys(buildExtractionSchema(), STRUCTURED_OUTPUT_UNSUPPORTED)], []);
    assert.deepEqual([...findKeys(buildApproachSchema(), STRUCTURED_OUTPUT_UNSUPPORTED)], []);
  });

  test(`stay within the API limit of ${MAX_OPTIONAL_PARAMETERS} optional parameters`, () => {
    assert.ok(countOptionalParameters(buildExtractionSchema()) <= MAX_OPTIONAL_PARAMETERS);
    assert.ok(countOptionalParameters(buildApproachSchema()) <= MAX_OPTIONAL_PARAMETERS);
    // Guard the counter itself: the full engagement schema is far over the limit.
    assert.ok(countOptionalParameters(buildApproachSchema()) >= 0 && countOptionalParameters({ properties: { a: {}, b: {} }, required: ['a'] }) === 1);
  });

  test('field catalogue lists extractable fields and never computed ones', () => {
    const pointers = fieldCatalogue().map((l) => l.split(' — ')[0]);
    for (const p of ['/markets/list', '/catalogue/sku_count', '/compliance/regulated_industry/active', '/business/revenue_monthly']) assert.ok(pointers.includes(p), p);
    for (const p of pointers) assert.doesNotMatch(p, /^\/(offer|exits|approach|provenance|notes|schema_version)\b|^\/meta\/source$|^\/delivery\/go$/);
  });

  test('answers flatten and re-assemble losslessly; approach encodes and decodes losslessly', () => {
    for (const file of ['acme-watches.json', 'foundation-minimal.json', 'stop-custom-checkout.json']) {
      const fixture = load(file);
      const { answers, errors } = assembleAnswers(flattenAnswers(fixtureAnswers(fixture)));
      assert.deepEqual(errors, []);
      assert.deepEqual(answers, fixtureAnswers(fixture), file);
      if (fixture.delivery.go) {
        const { open_items, ...risks } = fixture.approach.risks;
        const expected = { capability_map: fixture.approach.capability_map, app_shortlist: fixture.approach.app_shortlist, phases: fixture.approach.phases, risks };
        assert.deepEqual(fromApproachPayload(toApproachPayload(fixture.approach)), expected, file);
      }
    }
  });

  test('assembleAnswers rejects unknown, computed and malformed entries', () => {
    const { answers, errors } = assembleAnswers([
      { pointer: '/catalogue/sku_count', value_json: '800' },
      { pointer: '/catalogue/sku_counts', value_json: '1' },
      { pointer: '/offer/code', value_json: '"S"' },
      { pointer: '/markets/primary_market', value_json: 'CH' },
    ]);
    assert.deepEqual(answers, { catalogue: { sku_count: 800 } });
    assert.equal(errors.length, 3);
  });

  test('accept the recorded responses built from every fixture', () => {
    const ajv = new Ajv2020({ strict: false, allErrors: true });
    const extraction = ajv.compile(buildExtractionSchema());
    const approach = ajv.compile(buildApproachSchema());
    for (const file of ['acme-watches.json', 'foundation-minimal.json', 'stop-custom-checkout.json']) {
      const fixture = load(file);
      assert.ok(extraction(recordedExtraction(fixture)), `${file}: ${JSON.stringify(extraction.errors?.slice(0, 3))}`);
      if (fixture.delivery.go) assert.ok(approach(recordedApproach(fixture)), `${file}: ${JSON.stringify(approach.errors?.slice(0, 3))}`);
    }
  });
});

describe('runDiscovery with recorded responses', () => {
  for (const file of ['acme-watches.json', 'foundation-minimal.json', 'stop-custom-checkout.json']) {
    test(`${file} reproduces offer, exits, GO/STOP and approach`, async () => {
      const fixture = load(file);
      const llm = fakeLlm(fixture);
      const questionnaire = file === 'acme-watches.json' ? ACME_MD : CONSENT;
      const steps = [];
      const { engagement, go } = await runDiscovery({ questionnaire, llm, today: '2026-09-16', onStep: (s) => steps.push(s) });
      assert.deepEqual(steps, go ? ['extraction', 'approach'] : ['extraction']);

      assert.equal(engagement.offer.code, fixture.offer.code);
      assert.equal(go, fixture.delivery.go);
      assert.deepEqual(engagement.exits.items.map((i) => `${i.rule_id}:${i.result}`), fixture.exits.items.map((i) => `${i.rule_id}:${i.result}`));
      assert.deepEqual(engagement.provenance, fixture.provenance);
      assert.equal(engagement.meta.source, 'questionnaire');

      if (go) {
        assert.equal(llm.calls.length, 2, 'extraction + approach');
        assert.deepEqual(engagement.approach.capability_map, fixture.approach.capability_map);
        assert.deepEqual(engagement.approach.risks, fixture.approach.risks);
      } else {
        assert.equal(llm.calls.length, 1, 'no approach call on STOP');
        assert.equal(engagement.approach.capability_map, undefined);
      }
    });
  }

  test('the extraction prompt receives the redacted questionnaire', async () => {
    const llm = fakeLlm(load('foundation-minimal.json'));
    await runDiscovery({ questionnaire: `${CONSENT}\nowner: ops@nordlicht.example`, llm, today: '2026-09-16' });
    assert.doesNotMatch(llm.calls[0].user, /ops@nordlicht/);
    assert.match(llm.calls[0].user, /\[redacted-email\]/);
  });

  test('the approach call never sees internal pricing or modifiers', async () => {
    const fixture = load('acme-watches.json');
    const llm = fakeLlm(fixture);
    const { engagement } = await runDiscovery({ questionnaire: ACME_MD, llm, today: '2026-09-16' });
    const sent = llm.calls[1].user;
    assert.doesNotMatch(sent, /price_band|modifiers|price_add|65000|100000/);
    assert.equal(approachInput(engagement).offer.price_band, undefined);
  });
});

describe('extraction repair', () => {
  const fixture = load('foundation-minimal.json');
  const good = recordedExtraction(fixture);
  const bad = { ...good, answers: [...good.answers.filter((a) => a.pointer !== '/checkout/customisation'), { pointer: '/checkout/customisation', value_json: '"custom ui"' }] };
  const validate = (answers) => {
    const doc = { schema_version: '1.0.0', ...answers, meta: { ...answers.meta, source: 'questionnaire' } };
    return validateEngagementErrors(doc);
  };

  test('one repair call fixes invalid answers and receives the validation errors', async () => {
    const calls = [];
    const llm = { callStructured: async (call) => { calls.push(call); return { data: calls.length === 1 ? bad : good, model: 'fake' }; } };
    const result = await extractAnswers(llm, CONSENT, validate);
    assert.equal(result.repaired, true);
    assert.equal(calls.length, 2);
    assert.match(calls[1].user, /previous extraction had these problems/);
    assert.match(calls[1].user, /customisation/);
  });

  test('fails with the errors when the repair is still invalid', async () => {
    const llm = { callStructured: async () => ({ data: bad, model: 'fake' }) };
    await assert.rejects(extractAnswers(llm, CONSENT, validate), ExtractionInvalidError);
  });
});

describe('llm adapter', () => {
  test('rejects refusals, truncation and invalid JSON without echoing output', () => {
    const msg = (stop_reason, text = '{}') => ({ stop_reason, content: [{ type: 'text', text }] });
    assert.throws(() => parseStructured({ ...msg('refusal'), stop_details: { category: 'cyber' } }), (e) => e instanceof LlmError && e.code === 'refusal');
    assert.throws(() => parseStructured(msg('max_tokens')), (e) => e.code === 'truncated');
    assert.throws(() => parseStructured(msg('end_turn', 'SECRET not json')), (e) => e.code === 'invalid_json' && !e.message.includes('SECRET'));
    assert.deepEqual(parseStructured(msg('end_turn', '{"a":1}')), { a: 1 });
  });

  test('explains missing credentials and API errors without leaking content', () => {
    const missing = new Error('Could not resolve authentication method. Expected one of apiKey, authToken, credentials, config, or profile to be set.');
    assert.match(explainError(missing), /No Anthropic API credentials found[\s\S]*ANTHROPIC_API_KEY=/);

    const billing = new Anthropic.APIError(400, { type: 'error', error: { type: 'invalid_request_error', message: 'Your credit balance is too low to access the Anthropic API.' } }, undefined, new Headers());
    assert.match(explainError(billing), /no credit left/);

    const connection = new Anthropic.APIConnectionError({ message: 'socket hang up' });
    assert.match(explainError(connection), /Could not reach the Anthropic API/);

    assert.match(explainError(new LlmError('Model output was truncated (max_tokens) — nothing was written.', 'truncated')), /truncated/);
  });

  test('sends the workspace header only when ANTHROPIC_WORKSPACE_ID is set', () => {
    assert.deepEqual(clientOptions({}), {});
    assert.deepEqual(clientOptions({ ANTHROPIC_WORKSPACE_ID: ' wrkspc_123 ' }), { defaultHeaders: { 'anthropic-workspace-id': 'wrkspc_123' } });
    const err = new Anthropic.BadRequestError(400, { type: 'error', error: { type: 'invalid_request_error',
      message: 'This API key is not scoped to a workspace, so this request must include the anthropic-workspace-id header' } }, undefined, new Headers());
    assert.match(explainError(err), /ANTHROPIC_WORKSPACE_ID=wrkspc_/);
  });

  test('sends model, cached system prompt, fallbacks and the JSON schema', async () => {
    let request;
    const client = {
      beta: { messages: { stream(body) { request = body; return { finalMessage: async () => ({ stop_reason: 'end_turn', model: body.model, usage: {}, content: [{ type: 'text', text: '{"ok":true}' }] }) }; } } },
    };
    const llm = createLlm({ client });
    const result = await llm.callStructured({ system: 'S', user: 'U', schema: { type: 'object' } });
    assert.equal(request.model, process.env.DISCOVERY_MODEL ?? DEFAULT_MODEL);
    assert.deepEqual(request.system[0].cache_control, { type: 'ephemeral' });
    assert.equal(request.fallbacks, 'default');
    assert.deepEqual(request.betas, ['server-side-fallback-2026-07-01']);
    assert.deepEqual(request.output_config.format, { type: 'json_schema', schema: { type: 'object' } });
    assert.deepEqual(result.data, { ok: true });
  });
});

describe('renderers and output', () => {
  test('GO renders the four artefacts and STOP renders only the stop report', () => {
    assert.deepEqual(Object.keys(renderArtefacts(load('acme-watches.json'))).sort(),
      ['app-shortlist.md', 'capability-map.md', 'delivery-plan.md', 'risks.md']);
    const stop = renderArtefacts(load('stop-custom-checkout.json'));
    assert.deepEqual(Object.keys(stop), ['stop-report.md']);
    assert.match(stop['stop-report.md'], /11\.6/);
  });

  test('rendered artefacts contain no internal pricing', () => {
    const internal = [...offering.modifiers.map((m) => m.id), '65000', '100000', 'price_add', '+25%'];
    for (const file of ['acme-watches.json', 'foundation-minimal.json', 'stop-custom-checkout.json']) {
      for (const [name, content] of Object.entries(renderArtefacts(load(file)))) {
        for (const term of internal) assert.ok(!content.includes(term), `${file} ${name} leaks ${term}`);
      }
    }
  });

  test('writeOutputs writes under the slug directory, replaces stale artefacts and refuses bad slugs', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'discovery-'));
    const go = load('acme-watches.json');
    writeOutputs(outDir, go);
    const stop = { ...load('stop-custom-checkout.json'), meta: { ...load('stop-custom-checkout.json').meta, client: { ...go.meta.client } } };
    writeOutputs(outDir, stop);
    assert.deepEqual(fs.readdirSync(path.join(outDir, go.meta.client.slug)).sort(), ['engagement.json', 'stop-report.md']);

    const evil = structuredClone(go);
    evil.meta.client.slug = '../escape';
    assert.throws(() => writeOutputs(outDir, evil), /Refusing to write outside/);
  });

  test('CLI arguments are validated', () => {
    assert.throws(() => parseArgs([]), /Missing --questionnaire/);
    assert.throws(() => parseArgs(['--questionnaire', 'q.md', '--client', '../x']), /Invalid --client/);
    assert.equal(parseArgs(['--questionnaire', 'q.md', '--dry-run']).dryRun, true);
  });
});
