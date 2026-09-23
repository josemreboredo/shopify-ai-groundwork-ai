/**
 * v0.5.1: what happens after a STOP (route, Larger Engagement brief and deck, no backlog),
 * consultant notes in the output, sensitive data flag 11.17, several primary
 * markets, client app preferences as app signals, and the Plus suggestion.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs   from 'node:fs';
import os   from 'node:os';
import path from 'node:path';

import { validateEngagement } from '../../schema/index.js';
import { run } from '../../engagement/cli.js';
import { finishWork, WORK_FILES } from '../../engine/claude-code.js';
import { toApproachPayload } from '../../engine/approach.js';
import { evaluateExits } from '../../engine/exits.js';
import { classifyOffer } from '../../engine/classify.js';
import { appSignals } from '../../engine/app-signals.js';
import { needsApproach } from '../../engine/engine.js';
import { buildBacklog } from '../../backlog/cli.js';
import { buildDeckXml, writeDeck, findLeaks, clientPart } from '../../discovery-deck/build.js';

const TODAY = '2026-09-17';
const FIXTURES = path.join(import.meta.dirname, '..', 'fixtures', 'engagements');
const load = (name) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));
const tmp = (prefix) => fs.mkdtempSync(path.join(os.tmpdir(), prefix));

/**
 * Interview a global client that hits STOP 11.4, optionally record a route, and finish.
 *
 * It used to STOP on eight markets. Markets no longer carry a ceiling of their
 * own — they are priced per market and the effort total decides — so the STOP
 * this fixture needs comes from the answer that still has one: more than six
 * distinct languages, where translation and content operations stop being a
 * build task.
 *
 * @param {string|null} route
 */
function stopInterview(route) {
  const workRoot = tmp('route-');
  const env = { workRoot, date: TODAY };
  const client = 'global-demo';
  const answer = (question, pointer, value, source = 'client') => {
    const r = run('answer', { client, question, pointer, value: JSON.stringify(value), source }, env);
    assert.equal(r.ok, true, `${pointer}: ${JSON.stringify(r.errors)}`);
    return r;
  };
  run('start', { client, mode: 'quick' }, env);
  answer('Q10.5.2', '/meta/consent/llm_processing', true, 'consultant');
  answer('Q1.1.1', '/meta/client/name', 'Global Demo');
  const rows = [
    { code: 'CH', languages: ['de', 'fr'] }, { code: 'DE', languages: ['de'] },
    { code: 'GB', languages: ['en'] },       { code: 'US', languages: ['en', 'es'] },
    { code: 'HK', languages: ['zh'] },       { code: 'JP', languages: ['ja'] },
    { code: 'AU', languages: ['en'] },       { code: 'SG', languages: ['en', 'ms', 'ta'] },
  ];
  const stop = answer('Q3.1.1', '/markets/list', rows.map((r) => ({ ...r, currency: 'EUR' })));
  assert.equal(stop.go, false);
  assert.equal(stop.route, 'not decided');
  answer('Q3.1.2', '/markets/primary_markets', ['US', 'DE']);
  answer('Q1.1.4', '/meta/client/business_model', 'hybrid');
  answer('Q6.2.3', '/b2b/price_lists', true);
  answer('Q6.4.4', '/compliance/sensitive_data', true);
  assert.equal(run('note', { client, text: 'Offer a Larger Engagement with all collected information' }, env).ok, true);
  if (route) answer('Q10.5.5', '/delivery/route', route, 'consultant');
  const finished = run('finish', { client }, env);
  assert.equal(finished.ok, true, JSON.stringify(finished.errors));
  return { workDir: path.join(workRoot, client), finished, outDir: tmp('route-out-') };
}

describe('route after a STOP', () => {
  test('Larger Engagement: approach, brief and client deck are produced; no Jira tickets; notes are kept', () => {
    const { workDir, finished, outDir } = stopInterview('larger_engagement');
    assert.equal(finished.route, 'larger_engagement');
    assert.match(finished.next_step, /approach-instructions\.md/);
    assert.match(fs.readFileSync(path.join(workDir, WORK_FILES.approachInstructions), 'utf8'), /Phase 1 is the Discovery Phase/);

    const missing = finishWork({ workDir, outDir });
    assert.equal(missing.ok, false);
    assert.match(missing.errors[0], /Larger Engagement need a drafted approach/);

    fs.writeFileSync(path.join(workDir, WORK_FILES.approach), JSON.stringify(toApproachPayload(load('acme-watches.json').approach)));
    const done = finishWork({ workDir, outDir });
    assert.equal(done.ok, true, JSON.stringify(done.errors));
    const doc = done.engagement;
    assert.equal(doc.delivery.go, false);
    assert.equal(doc.delivery.route, 'larger_engagement');
    assert.ok(doc.approach.capability_map.length > 0);
    assert.deepEqual(doc.notes.map((n) => n.text), ['Offer a Larger Engagement with all collected information']);
    assert.deepEqual(doc.markets.primary_markets, ['US', 'DE']);
    const planItem = doc.approach.risks.open_items.find((o) => o.pointer === '/shopify/target_plan');
    assert.match(planItem.why, /minimum plan for these answers: plus \(company-specific B2B catalogs/);

    const clientDir = path.join(outDir, 'global-demo');
    const files = done.written.map((f) => path.basename(f)).sort();
    assert.deepEqual(files, ['app-shortlist.md', 'architecture.md', 'capability-map.md', 'delivery-plan.md', 'engagement.json', 'larger-engagement-brief.md', 'risks.md']);
    const brief = fs.readFileSync(path.join(clientDir, 'larger-engagement-brief.md'), 'utf8');
    for (const text of ['Status: **Larger Engagement**', 'Merkle Enterprise Engagement with a dedicated Discovery Phase', 'distinct language', 'Integration landscape', 'Offer a Larger Engagement', 'US, DE', 'minimum plus: company-specific B2B catalogs', 'No Jira tickets']) {
      assert.ok(brief.includes(text), `brief should include "${text}"`);
    }
    assert.doesNotMatch(brief, /€|price band|\+25%|WARN/);

    assert.throws(() => buildBacklog({ clientDir }), /Larger Engagement — no Jira tickets/);

    fs.writeFileSync(path.join(clientDir, 'backlog.json'), JSON.stringify({ summary: [{ name: 'Stale', stories: 1, points: 5, deferred: 0 }], stories: [] }));
    const deck = writeDeck({ clientDir });
    const xml = fs.readFileSync(path.join(clientDir, 'discovery-deck.xml'), 'utf8');
    assert.match(xml, /mode="LARGER_ENGAGEMENT"/);
    assert.deepEqual([...xml.matchAll(/<section id="([^"]+)"/g)].map((m) => m[1]), ['cover', 'executive-summary', 'business-context', 'methodology', 'as-is',
      'solution-design', 'capability-map', 'scope', 'apps', 'work-split', 'risks', 'out-of-scope', 'next-steps', 'timeline', 'investment', 'consultant-notes']);
    assert.match(xml, /<why-larger-engagement>/);
    assert.match(xml, /Discovery Phase kick-off/);
    assert.doesNotMatch(xml, /scope-by-epic|appendix-stories|Stale/);
    assert.doesNotMatch(clientPart(xml), /price-band/);
    assert.ok(!clientPart(xml).includes(doc.offer.name), 'no standard offer name in the client sections of a Larger Engagement deck');
    assert.deepEqual(findLeaks(clientPart(xml), deck.doc, null), []);
    assert.deepEqual(findLeaks('Investment: price band CHF 140,000+', deck.doc, null), ['price band']);
    const notes = xml.slice(xml.indexOf('<section id="consultant-notes"'));
    for (const text of ['route="larger_engagement"', '<nearest-offer', 'reference-only="true"', 'Offer a Larger Engagement with all collected information', 'company-specific B2B catalogs']) {
      assert.ok(notes.includes(text), `consultant notes should include ${text}`);
    }
  });

  test('no route: STOP report only, it asks for the decision, and no backlog', () => {
    const { workDir, finished, outDir } = stopInterview(null);
    assert.equal(finished.route, 'not decided');
    assert.equal(fs.existsSync(path.join(workDir, WORK_FILES.approachInstructions)), false);
    const done = finishWork({ workDir, outDir });
    assert.equal(done.ok, true, JSON.stringify(done.errors));
    assert.deepEqual(done.written.map((f) => path.basename(f)).sort(), ['engagement.json', 'stop-report.md']);
    const report = fs.readFileSync(path.join(outDir, 'global-demo', 'stop-report.md'), 'utf8');
    assert.match(report, /Q10\.5\.5/);
    assert.match(report, /Offer a Larger Engagement with all collected information/);
    assert.throws(() => buildBacklog({ clientDir: path.join(outDir, 'global-demo') }), /resolve the open hard blockers/);
  });

  test('Merkle Arc: the discovery goes across, and nothing here prices it', () => {
    // Arc is a separate engagement scoped by the Arc practice. This engine
    // prices Shopify builds, so it drafts no approach — mapping requirements to
    // Shopify capabilities is exactly what does not apply — and no backlog. The
    // STOP report and the answers behind it are what travel.
    const { workDir, outDir } = stopInterview('arc');
    const done = finishWork({ workDir, outDir });
    assert.equal(done.ok, true, JSON.stringify(done.errors));
    assert.equal(needsApproach(done.engagement), false);
    assert.deepEqual(done.written.map((f) => path.basename(f)).sort(), ['engagement.json', 'stop-report.md']);
    assert.match(fs.readFileSync(path.join(outDir, 'global-demo', 'stop-report.md'), 'utf8'), /Decision: \*\*Merkle Arc\*\*/);
    assert.throws(() => buildBacklog({ clientDir: path.join(outDir, 'global-demo') }), /Merkle Arc/);
  });

  test('a route on a GO engagement changes nothing', () => {
    const doc = load('acme-watches.json');
    doc.delivery.route = 'larger_engagement';
    assert.equal(validateEngagement(doc).valid, true);
    assert.equal(needsApproach(doc), true);
    const dir = tmp('route-go-');
    fs.writeFileSync(path.join(dir, 'engagement.json'), JSON.stringify(doc));
    assert.ok(buildBacklog({ clientDir: dir }).stories.length > 0);
    assert.match(buildDeckXml(doc).xml, /mode="GO"/);
  });
});

describe('mainland China', () => {
  const withMarkets = (codes) => {
    const doc = load('acme-watches.json');
    doc.markets.list = codes.map((code) => ({ code, currency: code === 'CN' ? 'CNY' : 'EUR', languages: code === 'CN' ? ['zh-CN'] : ['en'] }));
    return doc;
  };

  test('is excluded from the offering and routed to a separate China discovery (11.20)', () => {
    const doc = withMarkets(['CH', 'DE', 'CN']);
    const exits = evaluateExits({ ...doc, offer: classifyOffer(doc) });
    assert.equal(exits.items.find((i) => i.rule_id === '11.20').result, 'FLAG');
    assert.equal(exits.triggered, false);
    const offer = classifyOffer(doc);
    assert.match(offer.scope_gates.markets.evidence, /2 market\(s\) at launch: CH, DE$/);
    assert.equal(offer.scope_gates.multi_currency.active, false, 'CNY does not count toward multi-currency');
  });

  test('as the only launch market is a STOP (11.21)', () => {
    const doc = withMarkets(['CN']);
    const exits = evaluateExits({ ...doc, offer: classifyOffer(doc) });
    assert.deepEqual(exits.items.filter((i) => ['11.20', '11.21'].includes(i.rule_id)).map((i) => `${i.rule_id}:${i.result}`), ['11.21:STOP']);
    assert.equal(exits.triggered, true);
  });

  test('China reaches the client document as an answer, never as an exclusion', () => {
    const doc = withMarkets(['CH', 'DE', 'CN']);
    doc.china = { selling_model: 'cross_border_offshore', channels: ['tmall_global'], legal_advice: 'client_prc_counsel' };
    doc.offer = classifyOffer(doc);
    doc.exits = evaluateExits(doc);
    const { xml } = buildDeckXml(doc);
    assert.match(xml, /<mainland-china discovery=/, 'the consultant notes still carry every China answer');
    assert.match(xml, /topic="selling model">cross_border_offshore</);

    // It used to sit in out-of-scope beside the boilerplate — "no content
    // translation unless stated" and the rest. A requirement the client asked
    // for, filed next to standard exclusions, reads as non-compliance and
    // scores as a gap.
    const client = clientPart(xml);
    const outOfScope = client.slice(client.indexOf('id="out-of-scope"'), client.indexOf('id="out-of-scope"') + 400);
    assert.ok(!/China/i.test(outOfScope), 'not among the exclusions');

    assert.match(client, /<answered-elsewhere>/, 'answered in its own right');
    assert.match(client, /what-we-can-do>Shopify carries the brand/, 'and what Merkle can do is said first');
    assert.match(client, /what-shopify-cannot>Shopify has no infrastructure/);
    assert.match(client, /scoped-separately>Onshore selling is its own workstream/);
    assert.equal(validateEngagement(doc).valid, true, JSON.stringify(validateEngagement(doc).errors));
  });

  test('Hong Kong is not mainland China', () => {
    const doc = withMarkets(['CH', 'HK']);
    assert.ok(!evaluateExits({ ...doc, offer: classifyOffer(doc) }).items.some((i) => i.rule_id === '11.20'));
  });
});

describe('rules and signals', () => {
  test('11.17 flags sensitive personal data', () => {
    const doc = load('acme-watches.json');
    assert.ok(!evaluateExits(doc).items.some((i) => i.rule_id === '11.17'));
    doc.compliance.sensitive_data = true;
    const item = evaluateExits(doc).items.find((i) => i.rule_id === '11.17');
    assert.equal(item.result, 'FLAG');
    assert.equal(item.resolution.owner, 'Lead Consultant');
  });

  test('a returns or post-purchase tool the client uses or prefers is an app signal; Shopify native is not', () => {
    const doc = load('foundation-minimal.json');
    const base = appSignals(doc);
    assert.deepEqual(base.returns_platform, []);
    // Read from the one field a question fills (Q6.x apps_preferred); the two
    // free-text fields beside it were never asked, so nothing ever reached them.
    doc.post_purchase = { ...doc.post_purchase, apps_preferred: ['Shopify native returns'] };
    assert.deepEqual(appSignals(doc).returns_platform, []);
    doc.post_purchase.apps_preferred = ['Loop Returns', 'parcelLab'];
    doc.integrations = [...(doc.integrations ?? []), { system: 'Returns hub', category: 'returns', status: 'to_build' }];
    const s = appSignals(doc);
    assert.deepEqual(s.returns_platform, ['Client uses or prefers Loop Returns', "Returns hub is in the client's system landscape (to_build)"]);
    assert.deepEqual(s.post_purchase_platform, ['Client uses or prefers parcelLab']);
  });
});
