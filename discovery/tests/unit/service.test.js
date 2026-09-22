/**
 * Discovery service (ADR 0014): shared operations for the Lead Consultant web
 * app and the Claude connector, on top of the unchanged interview engine.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { createDiscoveryService, userFor, ServiceError } from '../../service/index.js';
import { createMemoryStore } from '../../service/stores/memory-store.js';
import { createFileStore } from '../../service/stores/file-store.js';
import { createPostgresStore, TABLE_SQL } from '../../service/stores/postgres-store.js';
import { fieldSpecs, normalizeValue, parseField, parseTable, cellName } from '../../service/fields.js';
import { run } from '../../agents/interview/cli.js';
import { toExtraction } from '../../agents/interview/finish.js';
import { renderSummaryMarkdown } from '../../service/summary.js';
import { preview } from '../../agents/interview/preview.js';

const TODAY = '2026-09-17';
const owner = { login: 'lead', role: 'owner' };
const consultant = { login: 'lc-one', role: 'consultant' };
const other = { login: 'lc-two', role: 'consultant' };

async function started(store = createMemoryStore(), user = consultant) {
  const svc = createDiscoveryService({ store, today: () => TODAY });
  await svc.startInterview(user, { client: 'demo-client', language: 'en', mode: 'quick' });
  await svc.answerQuestion(user, 'demo-client', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
  return svc;
}

const rejects = (promise, status) => assert.rejects(promise, (err) => err instanceof ServiceError && err.status === status);

describe('discovery service', () => {
  test('sign-in allowlist: owners and consultants by GitHub login, case-insensitive; everyone else is refused', () => {
    const allow = { owners: 'Lead', consultants: 'lc-one, lc-two' };
    assert.deepEqual(userFor('lead', allow), { login: 'lead', role: 'owner' });
    assert.deepEqual(userFor('LC-One', allow), { login: 'lc-one', role: 'consultant' });
    assert.equal(userFor('stranger', allow), null);
    assert.equal(userFor('', allow), null);
    const open = { owners: 'lead', consultants: '*' };
    assert.deepEqual(userFor('any-github-user', open), { login: 'any-github-user', role: 'consultant' }, 'open sign-in: every account is a consultant');
    assert.deepEqual(userFor('lead', open), { login: 'lead', role: 'owner' }, 'owners stay named');
    assert.equal(userFor('not a login!', open), null);
  });

  test('a new interview belongs to the consultant who started it and asks consent first', async () => {
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
    await svc.startInterview(consultant, { client: 'demo-client', mode: 'quick' });
    const view = await svc.getInterview(consultant, 'demo-client');
    assert.equal(view.engagement.owner, 'lc-one');
    assert.equal(view.next.consent_required, true);
    assert.deepEqual(view.next.questions[0].inputs, [{ pointer: '/meta/consent/llm_processing', kind: 'boolean' }]);
    await rejects(svc.startInterview(consultant, { client: 'demo-client' }), 409);
    await rejects(svc.startInterview(consultant, { client: 'Not A Slug' }), 400);
    await rejects(svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q0.1.1', values: { '/business/primary_problem': ['Slow checkout'] } }), 400);
  });

  test('consultants see only their engagements; owners see all, including sessions created before 2.0.0', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    await store.create({ client: 'cli-session', language: 'en', mode: 'quick', answers: { meta: { client: { slug: 'cli-session' } } }, provenance: {}, tbc: {}, skipped: {}, notes: [], started_at: TODAY, updated_at: TODAY });
    assert.deepEqual((await svc.listEngagements(consultant)).map((e) => e.client), ['demo-client']);
    assert.deepEqual((await svc.listEngagements(other)), []);
    assert.deepEqual((await svc.listEngagements(owner)).map((e) => e.client).sort(), ['cli-session', 'demo-client']);
    await rejects(svc.getInterview(other, 'demo-client'), 403);
    await rejects(svc.getInterview(consultant, 'cli-session'), 403);
    await rejects(svc.getInterview(consultant, 'missing'), 404);
    await rejects(svc.listEngagements(null), 401);

    const shared = createDiscoveryService({ store, today: () => TODAY, visibility: 'all' });
    assert.deepEqual((await shared.listEngagements(other)).map((e) => e.client).sort(), ['cli-session', 'demo-client'], 'visibility all: every signed-in user sees every engagement');
    assert.equal((await shared.getInterview(other, 'demo-client')).engagement.client, 'demo-client');
    await rejects(shared.listEngagements(null), 401);
  });

  test('a group answer (money range) has one input per field, is recorded as one object, all or nothing, and updates the preview', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    const q = (await svc.getInterview(consultant, 'demo-client', { limit: 50 })).next.questions.find((x) => x.id === 'Q0.2.1');
    assert.deepEqual(q.inputs.map((i) => i.label), ['min', 'max', 'currency']);

    await rejects(svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q0.2.1', values: { '/business/revenue_monthly/min': ['40000'], '/business/revenue_monthly/currency': ['moon coins'] } }), 400);
    assert.equal((await store.get('demo-client')).answers.business?.revenue_monthly, undefined, 'nothing recorded when one field is invalid');

    const r = await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q0.2.1', values: { '/business/revenue_monthly/min': ['40000'], '/business/revenue_monthly/max': ['60000'], '/business/revenue_monthly/currency': ['EUR'] } });
    assert.equal(r.ok, true);
    const saved = await store.get('demo-client');
    assert.deepEqual(saved.answers.business.revenue_monthly, { min: 40000, max: 60000, currency: 'EUR' });
    assert.equal(saved.provenance['/business/revenue_monthly'].source, 'client');
    assert.ok(r.preview.coverage.required_answered >= 1);
  });

  test('tables are answered row by row from form fields — no JSON — and empty rows are ignored', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    const channels = fieldSpecs({ fields: ['/business/channel_mix'], answer_type: 'table' })[0];
    const channel = channels.columns.find((c) => c.key === 'channel').options[0].value;
    const values = {
      [cellName('/business/channel_mix', 0, 'channel')]: [channel],
      [cellName('/business/channel_mix', 0, 'share_pct')]: ['100'],
      [cellName('/business/channel_mix', 1, 'channel')]: [''],
      [cellName('/business/channel_mix', 1, 'share_pct')]: [''],
    };
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q0.2.5', values });
    assert.deepEqual((await store.get('demo-client')).answers.business.channel_mix, [{ channel, share_pct: 100 }]);

    const missing = parseTable(channels, { [cellName('/business/channel_mix', 0, 'share_pct')]: ['50'] });
    assert.match(missing.error, /Row 1: fill in channel/);
    const markets = fieldSpecs({ fields: ['/markets/list'], answer_type: 'table' })[0];
    assert.deepEqual(parseTable(markets, { [cellName('/markets/list', 0, 'code')]: ['CH'], [cellName('/markets/list', 0, 'languages')]: ['de, fr'] }), { value: [{ code: 'CH', languages: ['de', 'fr'] }] });
  });

  test('countries, currencies and languages can be typed as names in any discovery language; unknown ones get a plain message', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q1.1.2', values: { '/meta/client/hq_country': ['switzerland'] } });
    assert.equal((await store.get('demo-client')).answers.meta.client.hq_country, 'CH');
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q0.2.1', values: { '/business/revenue_monthly/min': ['1'], '/business/revenue_monthly/max': ['2'], '/business/revenue_monthly/currency': ['Schweizer Franken'] } });
    assert.equal((await store.get('demo-client')).answers.business.revenue_monthly.currency, 'CHF');
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q3.1.1', values: { [cellName('/markets/list', 0, 'code')]: ['Suisse'], [cellName('/markets/list', 0, 'languages')]: ['German, French'], [cellName('/markets/list', 1, 'code')]: ['UK'] } });
    assert.deepEqual((await store.get('demo-client')).answers.markets.list.map((m) => [m.code, m.languages ?? []]), [['CH', ['de', 'fr']], ['GB', []]]);
    await assert.rejects(
      svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q1.1.2', values: { '/meta/client/hq_country': ['Narnia'] } }),
      (err) => err instanceof ServiceError && /“Narnia” is not a known country — use a name or code, e\.g\. Switzerland or CH/.test(err.errors[0]),
    );
    const hq = fieldSpecs({ fields: ['/meta/client/hq_country'], answer_type: 'country' })[0];
    assert.deepEqual([hq.kind, hq.vocabulary], ['text', 'country']);
  });

  test('dates: a calendar input, and typed dates day first (01/05/27, 1.5.2027) or ISO are stored as YYYY-MM-DD', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    const spec = fieldSpecs({ fields: ['/delivery/target_launch_date'], answer_type: 'date' })[0];
    assert.equal(spec.kind, 'date');
    for (const [typed, stored] of [['01/05/27', '2027-05-01'], ['1.5.2027', '2027-05-01'], ['2027-05-01', '2027-05-01'], ['31-12-2026', '2026-12-31']]) {
      await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q10.1.1', values: { '/delivery/target_launch_date': [typed] } });
      assert.equal((await store.get('demo-client')).answers.delivery.target_launch_date, stored, typed);
    }
    await rejects(svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q10.1.1', values: { '/delivery/target_launch_date': ['31/02/27'] } }), 400);
    const { value, errors } = normalizeValue('/delivery/target_launch_date', '05/13/27');
    assert.equal(value, '05/13/27');
    assert.match(errors[0], /not a date — type it day first/);
  });

  test('a comment alone answers a question: it leaves the queue, counts as clarified and stays an open item for the offer', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    const r = await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q3.4.8', values: {}, note: 'We only ship inside the EU' });
    assert.equal(r.commented, true);
    const view = await svc.getInterview(consultant, 'demo-client', { limit: 100 });
    assert.deepEqual(view.commented, { 'Q3.4.8': 'We only ship inside the EU' });
    assert.ok(!view.next.questions.some((q) => q.id === 'Q3.4.8'));
    await rejects(svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q0.1.1', values: {} }), 400);

    const session = await store.get('demo-client');
    const { open_items } = toExtraction(session);
    assert.ok(open_items.some((i) => i.question_id === 'Q3.4.8' && /Clarified by comment \(no value recorded\): We only ship inside the EU/.test(i.why)));

    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q1.1.2', values: {}, note: 'Holding in Zug, operations in Zurich' });
    assert.equal(preview(await store.get('demo-client'), TODAY).coverage.required_commented, 1);
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q1.1.2', values: { '/meta/client/hq_country': ['Switzerland'] } });
    const after = await store.get('demo-client');
    assert.ok(!('Q1.1.2' in after.commented), 'recording a value replaces the comment-only state');
  });

  test('TBC, skip and notes go through the engine checks (no personal data, consent cannot be skipped)', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    await svc.markQuestion(consultant, 'demo-client', { question_id: 'Q0.1.1', as: 'tbc', note: 'Client confirms next week' });
    await rejects(svc.markQuestion(consultant, 'demo-client', { question_id: 'Q10.5.2', as: 'skipped' }), 400);
    await rejects(svc.addNote(consultant, 'demo-client', { text: 'Call jane.doe@example.com' }), 400);
    await svc.addNote(consultant, 'demo-client', { text: 'Demo engagement' });
    const view = await svc.getInterview(consultant, 'demo-client');
    assert.deepEqual(view.tbc, { 'Q0.1.1': 'Client confirms next week' });
    assert.equal(view.notes.length, 1);
    assert.ok(!view.next.questions.some((x) => x.id === 'Q0.1.1'));
  });

  test('form values are parsed per input kind', () => {
    assert.deepEqual(parseField({ pointer: '/x', kind: 'boolean' }, ['false']), { value: false });
    assert.deepEqual(parseField({ pointer: '/x', kind: 'multi_enum' }, ['a', 'b', 'a']), { value: ['a', 'b'] });
    assert.deepEqual(parseField({ pointer: '/x', kind: 'list' }, ['de, fr\nit']), { value: ['de', 'fr', 'it'] });
    assert.deepEqual(parseField({ pointer: '/x', kind: 'integer' }, ['12']), { value: 12 });
    assert.ok('error' in parseField({ pointer: '/x', kind: 'integer' }, ['1.5']));
    assert.ok('error' in parseField({ pointer: '/x', kind: 'json' }, ['{oops']));
    assert.equal(parseField({ pointer: '/x', kind: 'text' }, ['  ']), undefined);
    const table = fieldSpecs({ fields: ['/markets/list'], answer_type: 'table' })[0];
    assert.equal(table.kind, 'table');
    assert.deepEqual(table.columns.map((c) => [c.key, c.kind, c.required]).slice(0, 3), [['code', 'text', true], ['currency', 'text', false], ['languages', 'list', false]]);
    assert.equal(table.columns.find((c) => c.key === 'price_strategy').kind, 'enum');
  });

  test('the Postgres store keeps one JSONB row per engagement with parameterised queries', async () => {
    const rows = new Map();
    const statements = [];
    const query = async (text, params = []) => {
      statements.push({ text, params });
      if (text === TABLE_SQL) return [];
      if (text.startsWith('SELECT session FROM discovery_interviews WHERE')) return rows.has(params[0]) ? [{ session: rows.get(params[0]) }] : [];
      if (text.startsWith('SELECT session FROM discovery_interviews')) return [...rows.values()].map((session) => ({ session }));
      if (text.startsWith('INSERT')) {
        if (rows.has(params[0])) return [];
        rows.set(params[0], JSON.parse(params[2]));
        return [{ client: params[0] }];
      }
      if (text.startsWith('UPDATE')) {
        if (!rows.has(params[0])) return [];
        rows.set(params[0], JSON.parse(params[1]));
        return [{ client: params[0] }];
      }
      throw new Error(`unexpected SQL: ${text}`);
    };
    const svc = await started(createPostgresStore({ query }));
    assert.equal(rows.get('demo-client').owner, 'lc-one');
    assert.equal(rows.get('demo-client').answers.meta.consent.llm_processing, true);
    assert.equal(statements.filter((s) => s.text === TABLE_SQL).length, 1, 'table created once');
    assert.ok(statements.every((s) => !s.text.includes('demo-client')), 'values are never interpolated into SQL');
    await rejects(svc.startInterview(consultant, { client: 'demo-client' }), 409);
    assert.deepEqual((await svc.listEngagements(consultant)).map((e) => e.client), ['demo-client']);
  });

  test('the file store reads and writes the same session files as the CLI and Claude Code skills', async () => {
    const workRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'discovery-service-'));
    try {
      const svc = await started(createFileStore({ workRoot }));
      await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q0.1.1', values: { '/business/primary_problem': ['Checkout friction on mobile'] } });
      const cli = run('preview', { client: 'demo-client' }, { workRoot, date: TODAY });
      assert.ok(cli.coverage.required_answered >= 1);
      assert.equal(JSON.parse(fs.readFileSync(path.join(workRoot, 'demo-client', 'interview.json'), 'utf8')).owner, 'lc-one');
      assert.deepEqual((await svc.listEngagements(consultant)).map((e) => e.client), ['demo-client']);
    } finally {
      fs.rmSync(workRoot, { recursive: true, force: true });
    }
  });
});

test('the web app declares every package the discovery code it bundles imports (Vercel installs frontend/ only)', () => {
  const root = path.join(import.meta.dirname, '..', '..');
  const frontend = JSON.parse(fs.readFileSync(path.join(root, '..', 'frontend', 'package.json'), 'utf8'));
  const declared = new Set(Object.keys({ ...frontend.dependencies, ...frontend.devDependencies }));
  const seen = new Set();
  const missing = new Set();
  const visit = (file) => {
    if (seen.has(file)) return;
    seen.add(file);
    for (const [, from, bare] of fs.readFileSync(file, 'utf8').matchAll(/^\s*(?:import|export)\b[^;'"]*?\bfrom\s*['"]([^'"]+)['"]|^\s*import\s*['"]([^'"]+)['"]/gm)) {
      const spec = from ?? bare;
      if (spec.startsWith('.')) {
        if (spec.endsWith('.js')) visit(path.resolve(path.dirname(file), spec));
      } else if (!spec.startsWith('node:')) {
        const name = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
        if (!declared.has(name)) missing.add(name);
      }
    }
  };
  for (const entry of ['service/index.js', 'service/mcp.js', 'service/oauth.js', 'service/project-kit.js', 'service/stores/file-store.js', 'service/stores/postgres-store.js', 'service/stores/oauth-memory-store.js', 'service/stores/oauth-postgres-store.js']) visit(path.join(root, entry));
  assert.deepEqual([...missing], []);
});

describe('review, change and summary', () => {
  test('review lists every question with state and answer in words; a question can be changed, cleared or reopened', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q1.1.2', values: { '/meta/client/hq_country': ['Switzerland'] } });
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q3.4.8', values: {}, note: 'We only ship inside the EU' });
    await svc.markQuestion(consultant, 'demo-client', { question_id: 'Q0.1.1', as: 'tbc', note: 'Next workshop' });

    const { sections } = await svc.reviewQuestions(consultant, 'demo-client');
    const all = sections.flatMap((s) => s.questions);
    const byId = (id) => all.find((q) => q.id === id);
    assert.deepEqual([byId('Q1.1.2').state, byId('Q3.4.8').state, byId('Q0.1.1').state], ['answered', 'commented', 'tbc']);
    assert.equal(byId('Q10.5.2').value, 'Yes');
    assert.ok(all.some((q) => q.state === 'open'), 'open questions of the mode are listed too');

    const q = await svc.getQuestion(consultant, 'demo-client', 'Q1.1.2');
    assert.equal(q.values['/meta/client/hq_country'], 'CH');
    assert.equal(q.question.inputs[0].vocabulary, 'country');
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q1.1.2', values: { '/meta/client/hq_country': ['Germany'] } });
    assert.equal((await svc.getQuestion(consultant, 'demo-client', 'Q1.1.2')).values['/meta/client/hq_country'], 'DE');

    await svc.clearAnswer(consultant, 'demo-client', { question_id: 'Q1.1.2' });
    const cleared = await store.get('demo-client');
    assert.equal(cleared.answers.meta.client.hq_country, undefined);
    assert.ok(!('/meta/client/hq_country' in cleared.provenance));
    assert.ok((await svc.getInterview(consultant, 'demo-client', { limit: 100 })).next.questions.some((x) => x.id === 'Q1.1.2'), 'cleared question is open again');
    await rejects(svc.clearAnswer(consultant, 'demo-client', { question_id: 'Q10.5.2' }), 400);

    await svc.reopenQuestion(consultant, 'demo-client', { question_id: 'Q3.4.8' });
    assert.equal((await svc.getQuestion(consultant, 'demo-client', 'Q3.4.8')).state, 'open');
  });

  test('the interview mode can be changed after it started, so a bank that gained a question can still ask it', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    const open = async () => (await svc.reviewQuestions(consultant, 'demo-client')).sections.flatMap((s) => s.questions).map((q) => q.id);
    assert.ok(!(await open()).includes('Q3.4.13'), 'a quick interview never reaches a recommended question');
    const changed = await svc.setInterviewMode(consultant, 'demo-client', { mode: 'standard' });
    assert.deepEqual([changed.was, changed.mode], ['quick', 'standard']);
    assert.ok((await open()).includes('Q3.4.13'), 'and reaches it once the mode moves');
    await rejects(svc.setInterviewMode(consultant, 'demo-client', { mode: 'deep' }), 400);
  });

  test('deleting an engagement needs the slug back, and only the owner of the engagement or an owner can do it', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    await rejects(svc.deleteEngagement(consultant, 'demo-client', { confirm: 'wrong-slug' }), 400);
    await rejects(svc.deleteEngagement(consultant, 'demo-client', {}), 400);
    assert.ok(await store.get('demo-client'), 'nothing is deleted until the slug matches');
    await rejects(svc.deleteEngagement(other, 'demo-client', { confirm: 'demo-client' }), 403);
    assert.deepEqual(await svc.deleteEngagement(consultant, 'demo-client', { confirm: 'demo-client' }), { ok: true, client: 'demo-client', deleted: true });
    assert.equal(await store.get('demo-client'), null);
    assert.deepEqual(await svc.listEngagements(consultant), []);
    await rejects(svc.getInterview(consultant, 'demo-client'), 404);
  });

  test('an owner can delete another consultant\u2019s engagement; the file store removes the work directory', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'discovery-delete-'));
    const store = createFileStore({ workRoot: dir });
    const svc = await started(store);
    assert.ok(fs.existsSync(path.join(dir, 'demo-client', 'interview.json')));
    await svc.deleteEngagement(owner, 'demo-client', { confirm: 'demo-client' });
    assert.equal(fs.existsSync(path.join(dir, 'demo-client')), false, 'the whole work directory goes');
    fs.rmSync(dir, { recursive: true, force: true });
  });

  test('summary from code: status, open items with questions, answers by section, Markdown without internal price bands', async () => {
    const store = createMemoryStore();
    const svc = await started(store);
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q0.1.1', values: { '/business/primary_problem': ['Checkout friction'] } });
    await svc.answerQuestion(consultant, 'demo-client', { question_id: 'Q3.4.8', values: {}, note: 'We only ship inside the EU' });
    const s = await svc.getSummary(consultant, 'demo-client');
    assert.ok(s.preview.offer.code);
    assert.ok(s.open_items.some((i) => i.question_id === 'Q3.4.8' && i.question));
    assert.ok(s.sections.flatMap((x) => x.questions).every((q) => q.state !== 'open'), 'summary lists recorded questions only');
    const md = renderSummaryMarkdown(s);
    assert.match(md, /^# Discovery summary — demo-client/);
    assert.match(md, /Checkout friction/);
    assert.match(md, /Clarified by comment/);
    assert.doesNotMatch(md, /price_band|65000|100000|\+25%/);
  });
});

describe('confirming what was read out of the documents', () => {
  const TODAY_BULK = '2026-09-20';
  const lc = { login: 'lc-one', role: 'consultant' };

  async function withExtracted() {
    const store = createMemoryStore();
    const svc = createDiscoveryService({ store, today: () => TODAY_BULK });
    await svc.startInterview(lc, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(lc, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    const recorded = await svc.recordAnswers(lc, 'a-bid', [
      { question_id: 'Q0.1.1', values: { '/business/primary_problem': 'Mobile checkout friction' }, evidence: { document: 'RFP.pdf', location: 'p. 3' } },
    ]);
    assert.deepEqual(recorded.results, [{ question_id: 'Q0.1.1', ok: true, status: 'tbc' }], 'recorded from a document, waiting on a human');
    return { svc, store };
  }

  test('answers read from a document arrive waiting for a human, not confirmed', async () => {
    const { svc } = await withExtracted();
    const { engagement } = await svc.getSummary(lc, 'a-bid');
    assert.ok(engagement.to_review >= 1, 'nothing a model extracted counts as confirmed on its own');
  });

  test('confirming the lot clears them, and says how many', async () => {
    const { svc } = await withExtracted();
    const before = (await svc.getSummary(lc, 'a-bid')).engagement.to_review;
    const result = await svc.confirmAllAnswers(lc, 'a-bid');
    assert.equal(result.confirmed, before);
    assert.equal((await svc.getSummary(lc, 'a-bid')).engagement.to_review, 0);
  });

  test('a bulk confirmation is recorded as one — "all forty-six in a click" is a different answer from "one by one"', async () => {
    const { svc, store } = await withExtracted();
    await svc.confirmAllAnswers(lc, 'a-bid');
    const session = await store.get('a-bid');
    const touched = Object.values(session.provenance).filter((p) => p.confirmed_at === TODAY_BULK);
    assert.ok(touched.length >= 1);
    for (const p of touched) {
      assert.equal(p.status, 'confirmed');
      assert.equal(p.confirmed_by, 'lc-one');
      assert.equal(p.confirmed_in_bulk, true, 'the engagement stays honest about how its answers were checked');
    }
  });

  test('confirming one at a time is not marked as bulk', async () => {
    const { svc, store } = await withExtracted();
    const session = await store.get('a-bid');
    const pointer = Object.entries(session.provenance).find(([, p]) => p.status === 'tbc')[0];
    await svc.confirmAnswer(lc, 'a-bid', { pointer });
    const after = await store.get('a-bid');
    assert.equal(after.provenance[pointer].status, 'confirmed');
    assert.ok(!after.provenance[pointer].confirmed_in_bulk);
  });

  test('one row at a time: a question is confirmed whole, not field by field', async () => {
    const { svc, store } = await withExtracted();
    const before = await store.get('a-bid');
    const pointers = Object.entries(before.provenance).filter(([, p]) => p.question_id === 'Q0.1.1' && p.status === 'tbc');
    assert.ok(pointers.length >= 1);

    const result = await svc.confirmAnswer(lc, 'a-bid', { question_id: 'Q0.1.1' });
    assert.equal(result.confirmed, pointers.length, 'every field that question filled is confirmed together');

    const after = await store.get('a-bid');
    for (const [pointer] of pointers) {
      assert.equal(after.provenance[pointer].status, 'confirmed');
      assert.ok(!after.provenance[pointer].confirmed_in_bulk, 'a row read and confirmed is not a bulk confirmation');
    }
  });

  test('confirming a question with nothing waiting is refused, not silently ignored', async () => {
    const { svc } = await withExtracted();
    await svc.confirmAnswer(lc, 'a-bid', { question_id: 'Q0.1.1' });
    await rejects(svc.confirmAnswer(lc, 'a-bid', { question_id: 'Q0.1.1' }), 404);
    await rejects(svc.confirmAnswer(lc, 'a-bid', { question_id: 'Q9.9.9' }), 404);
  });

  test('with nothing waiting, it refuses rather than pretending to do something', async () => {
    const { svc } = await withExtracted();
    await svc.confirmAllAnswers(lc, 'a-bid');
    await rejects(svc.confirmAllAnswers(lc, 'a-bid'), 409);
  });
});

describe('a question that fills several fields', () => {
  const lc = { login: 'lc-one', role: 'consultant' };
  const TODAY_M = '2026-09-20';

  async function partlyConfirmed() {
    const store = createMemoryStore();
    const svc = createDiscoveryService({ store, today: () => TODAY_M });
    await svc.startInterview(lc, { client: 'a-bid', language: 'en', mode: 'quick', process: 'rfp' });
    await svc.answerQuestion(lc, 'a-bid', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
    // Q1.2.2 fills three fields; fifteen questions in the bank fill more than one.
    await svc.recordAnswers(lc, 'a-bid', [{
      question_id: 'Q1.2.2',
      values: { '/shopify/store_url': 'https://x.myshopify.com', '/shopify/current_plan': 'basic', '/shopify/current_theme': 'Dawn' },
      evidence: { document: 'RFP.pdf', location: 'p.2' },
    }]);
    const session = await store.get('a-bid');
    const [first] = Object.entries(session.provenance).filter(([, p]) => p.question_id === 'Q1.2.2');
    await svc.confirmAnswer(lc, 'a-bid', { pointer: first[0] });
    return { svc, store };
  }

  test('with one field confirmed and two waiting, the row can still be confirmed', async () => {
    // It used to read the row's state off whichever pointer came first, so this
    // rendered as "Answered" with no Confirm button, out of the to-confirm
    // filter and out of the bulk card — while the counter feeding the spine kept
    // counting the two. No screen named the question and nothing could clear it.
    const { svc } = await partlyConfirmed();
    const review = await svc.reviewQuestions(lc, 'a-bid');
    const row = review.sections.flatMap((s) => s.questions).find((q) => q.id === 'Q1.2.2');
    assert.equal(row.state, 'answered');
    assert.equal(row.to_confirm, true, 'any field still waiting keeps the row confirmable');
  });

  test('and confirming the row clears every field it filled', async () => {
    const { svc } = await partlyConfirmed();
    const result = await svc.confirmAnswer(lc, 'a-bid', { question_id: 'Q1.2.2' });
    assert.equal(result.confirmed, 2, 'the two that were still waiting');
    assert.equal((await svc.getSummary(lc, 'a-bid')).engagement.to_review, 0);
  });

  test('the counter counts questions, which is what a consultant acts on', async () => {
    const { svc } = await partlyConfirmed();
    // Three counts of two different units used to disagree on one screen: the
    // spine said 3, Review said 1, and confirming reported 3.
    const engagement = (await svc.getSummary(lc, 'a-bid')).engagement;
    const review = await svc.reviewQuestions(lc, 'a-bid');
    const waiting = review.sections.flatMap((s) => s.questions).filter((q) => q.to_confirm).length;
    assert.equal(engagement.to_review, waiting, 'the spine and the table agree');
    assert.equal(engagement.to_review, 1);
  });
});
