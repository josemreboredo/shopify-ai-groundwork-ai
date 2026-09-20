/**
 * Claude connector (ADR 0015): OAuth authorization server, answers from
 * documents with review, document register and the MCP tools — the shared
 * memory between Claude and the web app.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { createMcpHandler, withMcpAuth } from 'mcp-handler';

import { createDiscoveryService, ServiceError } from '../../service/index.js';
import { createMemoryStore } from '../../service/stores/memory-store.js';
import { createOAuthServer, authorizationServerMetadata, protectedResourceMetadata, pkceChallenge, CLAUDE_REDIRECT_URI, hashToken } from '../../service/oauth.js';
import { createOAuthMemoryStore } from '../../service/stores/oauth-memory-store.js';
import { createOAuthPostgresStore } from '../../service/stores/oauth-postgres-store.js';
import { registerDiscoveryTools } from '../../service/mcp.js';
import { recordAnswer } from '../../agents/interview/answer.js';
import { flattenAnswers } from '../../agents/discovery/extract.js';
import { toApproachPayload } from '../../agents/discovery/approach.js';
import { DECK_PROMPT } from '../../agents/discovery-deck/prompt.js';
import { promptBody, SOURCE } from '../../scripts/render-deck-prompt.js';

const ORIGIN = 'https://discovery.example.test';
const TODAY = '2026-09-17';
const lc = { login: 'lc-one', role: 'consultant' };
const CIMD_URL = 'https://claude.ai/oauth/mcp-oauth-client-metadata';
const cimdDoc = { client_id: CIMD_URL, client_name: 'Claude', redirect_uris: [CLAUDE_REDIRECT_URI] };

async function engagement() {
  const svc = createDiscoveryService({ store: createMemoryStore(), today: () => TODAY });
  await svc.startInterview(lc, { client: 'rfp-demo', mode: 'quick' });
  await svc.answerQuestion(lc, 'rfp-demo', { question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': ['true'] } });
  return svc;
}

describe('OAuth for the Claude connector', () => {
  const verifier = 'v'.repeat(64);
  const authorizeParams = (overrides = {}) => ({
    client_id: CIMD_URL, redirect_uri: CLAUDE_REDIRECT_URI, response_type: 'code',
    code_challenge: pkceChallenge(verifier), code_challenge_method: 'S256', scope: 'discovery offline_access', state: 'xyz', resource: `${ORIGIN}/mcp`,
    ...overrides,
  });

  test('metadata advertises what Claude needs: CIMD with public clients, S256 PKCE, resource and issuer', () => {
    const as = authorizationServerMetadata(ORIGIN);
    assert.equal(as.client_id_metadata_document_supported, true);
    assert.ok(as.token_endpoint_auth_methods_supported.includes('none'));
    assert.deepEqual(as.code_challenge_methods_supported, ['S256']);
    assert.ok(as.scopes_supported.includes('offline_access'));
    const pr = protectedResourceMetadata(ORIGIN);
    assert.equal(pr.resource, `${ORIGIN}/mcp`);
    assert.deepEqual(pr.authorization_servers, [as.issuer]);
  });

  test('full flow: CIMD client, consent, single-use code with PKCE, token for the MCP resource, rotating refresh', async () => {
    const fetched = [];
    const server = createOAuthServer({ store: createOAuthMemoryStore(), fetchJson: async (url) => (fetched.push(url), cimdDoc) });
    const v = await server.validateAuthorize(authorizeParams(), ORIGIN);
    assert.equal(v.ok, true);
    assert.deepEqual(fetched, [CIMD_URL]);

    const redirect = new URL(await server.approve(v.request, 'lc-one'));
    assert.equal(`${redirect.origin}${redirect.pathname}`, CLAUDE_REDIRECT_URI);
    assert.equal(redirect.searchParams.get('state'), 'xyz');
    const code = redirect.searchParams.get('code');

    const bad = await server.token({ grant_type: 'authorization_code', code, code_verifier: 'wrong'.repeat(10), client_id: CIMD_URL, redirect_uri: CLAUDE_REDIRECT_URI });
    assert.equal(bad.body.error, 'invalid_grant');
    const reused = await server.token({ grant_type: 'authorization_code', code, code_verifier: verifier, client_id: CIMD_URL, redirect_uri: CLAUDE_REDIRECT_URI });
    assert.equal(reused.body.error, 'invalid_grant', 'a code is consumed by the first attempt, even a failed one');

    const again = new URL(await server.approve(v.request, 'lc-one')).searchParams.get('code');
    const ok = await server.token({ grant_type: 'authorization_code', code: again, code_verifier: verifier, client_id: CIMD_URL, redirect_uri: CLAUDE_REDIRECT_URI });
    assert.equal(ok.status, 200);
    assert.equal(ok.body.token_type, 'Bearer');
    assert.deepEqual(await server.verify(ok.body.access_token, ORIGIN).then((g) => g.login), 'lc-one');
    assert.equal(await server.verify(ok.body.access_token, 'https://other.example.test'), null, 'token bound to this resource');

    const refreshed = await server.token({ grant_type: 'refresh_token', refresh_token: ok.body.refresh_token, client_id: CIMD_URL });
    assert.equal(refreshed.status, 200);
    assert.notEqual(refreshed.body.refresh_token, ok.body.refresh_token);
    assert.equal((await server.token({ grant_type: 'refresh_token', refresh_token: ok.body.refresh_token, client_id: CIMD_URL })).body.error, 'invalid_grant', 'old refresh token is rotated out');
    assert.equal(await server.verify(ok.body.access_token, ORIGIN), null, 'access token of the rotated grant no longer works');
    assert.equal((await server.verify(refreshed.body.access_token, ORIGIN)).login, 'lc-one');
  });

  test('untrusted clients and redirects are refused without redirecting; bad requests go back to the client', async () => {
    const server = createOAuthServer({ store: createOAuthMemoryStore(), fetchJson: async () => cimdDoc });
    assert.deepEqual(await server.validateAuthorize(authorizeParams({ client_id: 'https://evil.example/cimd' }), ORIGIN).then((r) => [r.ok, r.redirect]), [false, false], 'CIMD only from claude.ai');
    assert.deepEqual(await server.validateAuthorize(authorizeParams({ redirect_uri: 'https://evil.example/cb' }), ORIGIN).then((r) => [r.ok, r.redirect]), [false, false]);
    assert.deepEqual(await server.validateAuthorize(authorizeParams({ code_challenge_method: 'plain' }), ORIGIN).then((r) => [r.ok, r.error]), [false, 'invalid_request']);
    assert.deepEqual(await server.validateAuthorize(authorizeParams({ resource: 'https://other.example/mcp' }), ORIGIN).then((r) => [r.ok, r.error]), [false, 'invalid_target']);
    const mismatch = await createOAuthServer({ store: createOAuthMemoryStore(), fetchJson: async () => ({ ...cimdDoc, client_id: 'https://claude.ai/other' }) }).validateAuthorize(authorizeParams(), ORIGIN);
    assert.equal(mismatch.ok, false, 'document must name itself as the client');

    const staticClient = await server.validateAuthorize(authorizeParams({ client_id: 'merkle-discovery-claude' }), ORIGIN);
    assert.equal(staticClient.ok, true, 'pre-registered client works without fetching');
    const loopback = await createOAuthServer({ store: createOAuthMemoryStore(), fetchJson: async () => ({ ...cimdDoc, redirect_uris: ['http://localhost/callback'] }) })
      .validateAuthorize(authorizeParams({ redirect_uri: 'http://localhost:3118/callback' }), ORIGIN);
    assert.equal(loopback.ok, true, 'loopback redirect with any port (Claude Code)');
    assert.equal((await server.token({ grant_type: 'client_credentials' })).body.error, 'unsupported_grant_type');
  });

  test('the Postgres OAuth store keeps only hashes and consumes codes and refresh tokens with DELETE … RETURNING', async () => {
    const statements = [];
    const rows = { codes: new Map(), grants: new Map() };
    const query = async (text, params = []) => {
      statements.push({ text, params });
      if (text.startsWith('CREATE') || text.startsWith('DELETE FROM oauth_codes WHERE expires_at') || text.startsWith('DELETE FROM oauth_grants WHERE refresh_expires_at')) return [];
      if (text.startsWith('INSERT INTO oauth_codes')) return (rows.codes.set(params[0], params[1]), []);
      if (text.startsWith('DELETE FROM oauth_codes')) { const d = rows.codes.get(params[0]); rows.codes.delete(params[0]); return d ? [{ data: d }] : []; }
      if (text.startsWith('INSERT INTO oauth_grants')) return (rows.grants.set(params[0], { access: params[1], data: params[2] }), []);
      if (text.startsWith('SELECT data FROM oauth_grants')) return [...rows.grants.values()].filter((g) => g.access === params[0]).map((g) => ({ data: g.data }));
      if (text.startsWith('DELETE FROM oauth_grants')) { const g = rows.grants.get(params[0]); rows.grants.delete(params[0]); return g ? [{ data: g.data }] : []; }
      throw new Error(`unexpected SQL: ${text}`);
    };
    const server = createOAuthServer({ store: createOAuthPostgresStore({ query }), fetchJson: async () => cimdDoc });
    const v = await server.validateAuthorize(authorizeParams(), ORIGIN);
    const code = new URL(await server.approve(v.request, 'lc-one')).searchParams.get('code');
    const t = await server.token({ grant_type: 'authorization_code', code, code_verifier: verifier, client_id: CIMD_URL, redirect_uri: CLAUDE_REDIRECT_URI });
    assert.equal((await server.verify(t.body.access_token, ORIGIN)).login, 'lc-one');
    const everything = JSON.stringify(statements);
    for (const secret of [code, t.body.access_token, t.body.refresh_token]) assert.ok(!everything.includes(secret), 'no raw secret reaches the database');
    assert.ok(everything.includes(hashToken(t.body.access_token)));
  });
});

describe('shared memory: answers from documents, review and documents', () => {
  test('answers with evidence are recorded as client answers to confirm, with a citation, per question', async () => {
    const svc = await engagement();
    const { results, preview } = await svc.recordAnswers(lc, 'rfp-demo', [
      { question_id: 'Q0.1.1', values: { '/business/primary_problem': 'Mobile checkout friction' }, evidence: { document: 'RFP-2026.pdf', location: '§2.1', quote: 'Our mobile checkout loses half of the sessions' } },
      { question_id: 'Q0.2.1', values: { '/business/revenue_monthly': { min: 40000, max: 60000, currency: 'moon coins' } }, evidence: { document: 'RFP-2026.pdf' } },
      { question_id: 'Q9.9.9', values: { '/x': 1 } },
    ]);
    assert.deepEqual(results.map((r) => [r.question_id, r.ok]), [['Q0.1.1', true], ['Q0.2.1', false], ['Q9.9.9', false]]);
    assert.ok(results[1].errors.some((e) => /“moon coins” is not a known currency/.test(e)));
    assert.ok(preview.coverage.required_answered >= 1);

    const [answer] = (await svc.listAnswers(lc, 'rfp-demo')).filter((a) => a.question_id === 'Q0.1.1');
    assert.equal(answer.status, 'tbc');
    assert.equal(answer.source, 'client');
    assert.equal(answer.via, 'claude');
    assert.equal(answer.by, 'lc-one');
    assert.match(answer.note, /^Source: RFP-2026\.pdf, §2\.1 “Our mobile checkout/);
    assert.equal((await svc.listEngagements(lc))[0].to_review, 1);

    await svc.confirmAnswer(lc, 'rfp-demo', { pointer: '/business/primary_problem' });
    assert.equal((await svc.listAnswers(lc, 'rfp-demo')).find((a) => a.question_id === 'Q0.1.1').status, 'confirmed');
    await assert.rejects(svc.confirmAnswer(lc, 'rfp-demo', { pointer: '/business/nothing' }), (e) => e instanceof ServiceError && e.status === 404);
  });

  test('personal data is refused in answers and document details; documents are registered, not stored', async () => {
    const svc = await engagement();
    const { results } = await svc.recordAnswers(lc, 'rfp-demo', [{ question_id: 'Q0.1.1', values: { '/business/primary_problem': 'Contact jane.doe@client.example' } }]);
    assert.equal(results[0].ok, false);
    await assert.rejects(svc.registerDocument(lc, 'rfp-demo', { name: 'RFP', summary: 'owner: jane.doe@client.example' }), ServiceError);
    await svc.registerDocument(lc, 'rfp-demo', { name: 'RFP-2026.pdf', type: 'rfp', date: '2026-09-01', summary: 'Scope, markets and integrations' });
    const { documents } = await svc.registerDocument(lc, 'rfp-demo', { name: 'RFP-2026.pdf', type: 'rfp', summary: 'Updated summary' });
    assert.equal(documents.length, 1, 'same name updates the entry');
    assert.deepEqual(Object.keys(documents[0]).sort(), ['added_at', 'added_by', 'name', 'summary', 'type', 'via']);
  });

  test('find_questions maps a topic to questions with inputs and state', async () => {
    const svc = await engagement();
    const hits = await svc.findQuestions(lc, 'rfp-demo', { query: 'payment providers', limit: 5 });
    assert.ok(hits.some((q) => q.id === 'Q4.1.1'));
    assert.ok(hits.every((q) => ['open', 'answered', 'tbc', 'skipped'].includes(q.state) && q.inputs.length));
    await assert.rejects(svc.findQuestions(lc, 'rfp-demo', { query: 'ab' }), ServiceError);
  });
});

describe('MCP connector tools', () => {
  async function connector({ user = lc } = {}) {
    const service = await engagement();
    const handler = withMcpAuth(
      createMcpHandler((server) => registerDiscoveryTools(server, { service, userOf: (ctx) => ctx.http?.authInfo?.extra?.user ?? null }), { serverInfo: { name: 'merkle-discovery', version: 'test' } }),
      async (_req, bearer) => (bearer === 'valid' ? { token: bearer, clientId: 'claude', scopes: ['discovery'], extra: { user } } : undefined),
      { required: true, resourceMetadataPath: '/.well-known/oauth-protected-resource/mcp' },
    );
    let id = 0;
    const rpc = async (method, params, token = 'valid') => {
      const res = await handler(new Request(`${ORIGIN}/mcp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
      }));
      const text = await res.text();
      const payload = text.startsWith('event:') ? JSON.parse(text.split('\n').find((l) => l.startsWith('data: ')).slice(6)) : text ? JSON.parse(text) : null;
      return { status: res.status, headers: res.headers, payload };
    };
    const call = async (name, args) => {
      const { payload } = await rpc('tools/call', { name, arguments: args });
      const result = payload.result;
      return { isError: Boolean(result.isError), data: result.isError ? result.content[0].text : JSON.parse(result.content[0].text) };
    };
    return { service, rpc, call };
  }

  test('requires a bearer token and points Claude at the protected resource metadata', async () => {
    const { rpc } = await connector();
    const res = await rpc('tools/list', {}, null);
    assert.equal(res.status, 401);
    assert.match(res.headers.get('www-authenticate'), /resource_metadata="https:\/\/discovery\.example\.test\/\.well-known\/oauth-protected-resource\/mcp"/);
  });

  test('lists the discovery tools and runs the document workflow as the signed-in consultant', async () => {
    const { rpc, call, service } = await connector();
    const tools = (await rpc('tools/list', {})).payload.result.tools.map((t) => t.name).sort();
    assert.deepEqual(tools, ['add_note', 'find_questions', 'get_closing_document', 'get_interview', 'get_preview', 'get_reference', 'get_summary', 'list_answers', 'list_engagements', 'mark_questions', 'prepare_clarifications', 'prepare_closing_document', 'record_answers', 'register_document', 'save_approach', 'save_clarifications', 'save_closing_document', 'start_interview']);

    assert.equal((await call('list_engagements', {})).data[0].client, 'rfp-demo');
    const view = (await call('get_interview', { client: 'rfp-demo', limit: 5 })).data;
    assert.equal(view.consent_required, false);
    assert.ok(view.questions[0].inputs.length);

    await call('register_document', { client: 'rfp-demo', name: 'RFP-2026.pdf', type: 'rfp', summary: 'Scope and markets' });
    const recorded = (await call('record_answers', {
      client: 'rfp-demo',
      answers: [{ question_id: 'Q0.1.1', values: { '/business/primary_problem': 'Mobile checkout friction' }, evidence: { document: 'RFP-2026.pdf', location: 'p. 3' } }],
    })).data;
    assert.deepEqual(recorded.results, [{ question_id: 'Q0.1.1', ok: true, status: 'tbc' }]);
    assert.ok(recorded.preview.offer.code);

    const toConfirm = (await call('list_answers', { client: 'rfp-demo', status: 'tbc' })).data;
    assert.deepEqual(toConfirm.map((a) => [a.question_id, a.via]), [['Q0.1.1', 'claude']]);
    const web = await service.getInterview(lc, 'rfp-demo');
    assert.equal(web.documents[0].name, 'RFP-2026.pdf', 'the web app sees what Claude recorded');

    const denied = await call('get_interview', { client: 'someone-else' });
    assert.equal(denied.isError, true);
  });

  test('a token whose user is no longer allowlisted gets no data', async () => {
    const { call } = await connector({ user: null });
    const r = await call('list_engagements', {});
    assert.equal(r.isError, true);
    assert.match(r.data, /allowlist/);
  });
});

describe('Discovery Closing Document from the shared engagement', () => {
  const fixture = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'fixtures', 'engagements', 'acme-watches.json'), 'utf8'));

  /** An engagement whose interview answers match the ACME fixture. */
  async function acme() {
    const store = createMemoryStore();
    const svc = createDiscoveryService({ store, today: () => TODAY });
    await svc.startInterview(lc, { client: 'acme-watches', mode: 'standard' });
    const session = await store.get('acme-watches');
    const { schema_version, offer, exits, approach, provenance, notes, ...answers } = structuredClone(fixture);
    delete answers.meta.source;
    delete answers.meta.updated_at;
    delete answers.delivery.go;
    // Derived by the engine, never answered in the interview (market topology).
    delete answers.markets.topology;
    delete answers.markets.cross_border_model;
    for (const pair of [{ pointer: '/meta/consent/llm_processing', value_json: 'true' }, ...flattenAnswers(answers).filter((p) => p.pointer !== '/meta/consent/llm_processing')]) {
      const r = recordAnswer(session, { pointer: pair.pointer, value: JSON.parse(pair.value_json), source: 'client', today: TODAY });
      assert.equal(r.ok, true, `${pair.pointer}: ${JSON.stringify(r.errors)}`);
    }
    await store.save(session);
    return { svc, store };
  }

  test('no tool result is too large for an MCP client to take in one piece', async () => {
    const { svc, store } = await acme();
    const handler = withMcpAuth(
      createMcpHandler((server) => registerDiscoveryTools(server, { service: svc, userOf: () => lc }), { serverInfo: { name: 'merkle-discovery', version: 'test' } }),
      async () => ({ token: 't', clientId: 'claude', scopes: ['discovery'], extra: { user: lc } }),
      { required: true, resourceMetadataPath: '/.well-known/oauth-protected-resource/mcp' },
    );
    let id = 0;
    const call = async (name, args) => {
      const res = await handler(new Request(`${ORIGIN}/mcp`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream', authorization: 'Bearer t' },
        body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method: 'tools/call', params: { name, arguments: args } }),
      }));
      const text = await res.text();
      const payload = JSON.parse(text.split('\n').find((l) => l.startsWith('data: ')).slice(6));
      const body = payload.result.content[0].text;
      return { tokens: Buffer.byteLength(body) / 4, data: payload.result.isError ? body : JSON.parse(body) };
    };
    // Claude Code's documented default for one MCP result; claude.ai sits in the same range.
    const LIMIT = 20_000; // 25k is the client's limit; keep a fifth of it as headroom for larger engagements
    const sizes = {};
    const prepared = await call('prepare_closing_document', { client: 'acme-watches' });
    sizes.prepare = prepared.tokens;
    assert.match(prepared.data.reference, /get_reference/, 'the step says where the reference is');
    assert.equal(prepared.data.engagement.verified_knowledge, undefined, 'and does not inline it');

    const index = await call('get_reference', { client: 'acme-watches' });
    sizes.index = index.tokens;
    for (const { section } of index.data.sections) {
      const piece = await call('get_reference', { client: 'acme-watches', section });
      sizes[section] = piece.tokens;
    }
    const saved = await call('save_approach', { client: 'acme-watches', approach: toApproachPayload(fixture.approach) });
    sizes.save_approach = saved.tokens;
    assert.equal(saved.data.reference_chapters, undefined);
    assert.ok(saved.data.deck_data.length >= 1, 'the deck data is paged');
    for (const section of saved.data.deck_data) {
      const page = await call('get_reference', { client: 'acme-watches', section });
      sizes[section] = page.tokens;
      assert.match(page.data.deck_xml, /<section id="/, `${section} carries whole sections`);
    }

    if (process.env.SHOW_SIZES) console.log(Object.entries(sizes).map(([k, t]) => `${k} ${Math.round(t / 100) / 10}k`).join(' · '));
    const over = Object.entries(sizes).filter(([, t]) => t > LIMIT).map(([k, t]) => `${k} ${Math.round(t / 1000)}k`);
    assert.deepEqual(over, [], `tool results over ${LIMIT / 1000}k tokens: ${over.join(', ')}`);
  });

  test('prepare → approach → deck data → saved document, with validation errors returned to Claude', async () => {
    const { svc, store } = await acme();
    const prepared = await svc.prepareClosingDocument(lc, 'acme-watches');
    assert.equal(prepared.step, 'approach');
    assert.equal(prepared.status.decision, fixture.delivery.go ? 'GO' : 'STOP');
    assert.ok(prepared.instructions.includes('Capability map'));
    assert.ok(prepared.engagement.meta && prepared.approach_schema.properties.capability_map);
    assert.doesNotMatch(JSON.stringify(prepared.engagement), /price_band|price_add/, 'the approach step never sees internal pricing');

    await assert.rejects(svc.saveApproach(lc, 'acme-watches', { capability_map: 'nope' }), (err) => err instanceof ServiceError && err.errors.length > 0);
    const unsourced = toApproachPayload(fixture.approach);
    unsourced.architecture_decisions = unsourced.architecture_decisions.map((d) => ({ ...d, sources: [] }));
    await assert.rejects(svc.saveApproach(lc, 'acme-watches', unsourced), (err) => err instanceof ServiceError && err.errors.some((e) => /official Shopify source/.test(e)), 'unsourced architecture decisions are rejected');

    const deck = await svc.saveApproach(lc, 'acme-watches', toApproachPayload(fixture.approach));
    assert.equal(deck.step, 'document');
    assert.match(deck.deck_xml, /^<\?xml|<discovery-deck /);
    assert.ok(deck.instructions.startsWith(DECK_PROMPT.slice(0, 40)));
    assert.equal((await store.get('acme-watches')).closing.approach.via, 'claude');

    await assert.rejects(svc.saveClosingDocument(lc, 'acme-watches', { markdown: 'too short' }), ServiceError);
    const markdown = `# Discovery Closing Document — ACME Watches\n\n${'Section text. '.repeat(60)}`;
    await svc.saveClosingDocument(lc, 'acme-watches', { markdown });
    const again = await svc.saveClosingDocument(lc, 'acme-watches', { markdown: `${markdown}\nRevised.` });
    assert.equal(again.versions, 2);
    const saved = await svc.getClosingDocument(lc, 'acme-watches');
    assert.match(saved.document.markdown, /Revised\./);
    assert.equal(saved.history.length, 1);
    assert.equal((await svc.listEngagements(lc))[0].closing_document_at, TODAY);
  });

  test('a STOP without a chosen route asks for the route first', async () => {
    const svc = await engagement();
    await svc.recordAnswers(lc, 'rfp-demo', [
      { question_id: 'Q1.1.1', values: { '/meta/client/name': 'RFP Demo' } },
      { question_id: 'Q4.2.1', values: { '/checkout/customisation': ['fully_custom_checkout_ui'] } },
    ]);
    await assert.rejects(svc.prepareClosingDocument(lc, 'rfp-demo'), (err) => {
      if (!(err instanceof ServiceError) || err.status !== 409) return false;
      // The message is for a human; the blocker is what the app turns into a link.
      const [blocker] = err.blockers;
      return blocker.question_id === 'Q10.5.5' && /Larger Engagement/.test(blocker.why) && /consultant-led Discovery Phase/.test(blocker.why);
    });
  });

  test('the deck prompt module matches discovery/docs/deck-prompt.md (npm run deck:prompt)', () => {
    assert.equal(DECK_PROMPT, promptBody(fs.readFileSync(SOURCE, 'utf8')));
  });
});
