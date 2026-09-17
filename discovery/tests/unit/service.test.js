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
import { fieldSpecs, parseField, parseTable, cellName } from '../../service/fields.js';
import { run } from '../../agents/interview/cli.js';

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
