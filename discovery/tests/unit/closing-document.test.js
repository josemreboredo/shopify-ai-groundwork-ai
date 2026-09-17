/**
 * Discovery Closing Document outputs: the PowerPoint slide model (ADR 0017
 * amendment) and Merkle's verified Shopify reference chapters appended to the
 * annex. No network, no binary inspection — the slide model is a pure function.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { annexDeckFromMarkdown, deckToMarkdown, plainText } from '../../service/pptx.js';
import { buildDeckSchema, deckErrors, LAYOUTS } from '../../service/deck-template.js';
import { renderDeckPptx } from '../../service/deck-render.js';
import { REFERENCE_CHAPTERS, selectChapters, topicsFor, annexWithChapters, chapterBrief } from '../../service/reference.js';
import { readChapters, renderChaptersModule, OUTPUT } from '../../scripts/render-reference-chapters.js';

const requirementSlide = (n) => ({
  layout: 'requirement', requirement: `Requirement ${n} in the client's words`, evidence: 'Q5.2.7',
  shopify_standard: 'What Shopify does natively, and where it stops', decision: `Decision ${n}`, level: n % 2 ? 'app' : 'native',
  why: 'Why this level and not a cheaper one', covers: ['What it covers'], not_covered: ['What it does not cover'],
  sources: ['https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns'],
});
const decisionSlide = (n) => ({
  layout: 'decision', topic: `Decision topic ${n}`, question: 'What had to be decided?',
  options: [{ option: 'Chosen option', pros: 'Pros', cons: 'Cons', chosen: true }, { option: 'Other option', pros: 'Pros', cons: 'Cons', chosen: false }],
  decision: `We will do ${n}`, rationale: 'Tied to the client answers', status: 'Recommended',
});
const problemSlide = (n) => ({
  layout: 'problem_solution', problem: `Problem ${n} in the client's words`, cost_today: 'What it costs today',
  shopify_answer: 'How Shopify solves it', what_changes: ['What changes'], measure: 'The KPI',
});

const DECK = {
  slides: [
    { layout: 'title', client: 'ACME Watches SA', project: 'Discovery Closing Document', subtitle: 'One Shopify Plus store for three markets and 500 retailers', date: '2026-09-17', consultant: 'Lead Consultant' },
    { layout: 'agenda', headline: 'What we agreed and what is still open', items: ['Recommendation', 'Solution design', 'Risks'] },
    problemSlide(1), problemSlide(2),
    { layout: 'section', number: '02', title: 'Solution design', kicker: 'The decisions that shape the build' },
    requirementSlide(1), requirementSlide(2), requirementSlide(3), requirementSlide(4), requirementSlide(5),
    { layout: 'app_case', app: 'Loop Returns', requirement: 'Prepaid labels for CH, DE and AT', native_gap: 'Shopify issues return labels for US domestic orders only',
      covers: ['Prepaid labels'], not_covered: ['CH labels unconfirmed'], cost: 'USD 155/month',
      alternatives: [{ option: 'Native returns with carrier labels', why_not: 'Manual work for 32 returns a month' }] },
    { layout: 'gaps', headline: 'Four things Shopify will not solve', items: [
      { requirement: 'Collect EU VAT from Switzerland', status: 'not covered', consequence: 'DE and AT need duties at checkout', option: 'Decide with the tax adviser in sprint 0' },
    ] },
    { layout: 'architecture', headline: 'One store, the ERP still owning stock', layers: [{ name: 'Storefront', items: ['Horizon theme'] }, { name: 'Shopify Plus', items: ['Markets', 'B2B'] }] },
    decisionSlide(1), decisionSlide(2), decisionSlide(3),
    { layout: 'kpis', headline: 'Three numbers decide whether this worked', cards: [
      { metric: 'Mobile conversion', baseline: '0.7%', target: '1.2%', horizon: '12 months' },
    ] },
    { layout: 'risks', headline: 'Tax and migration carry the launch risk', risks: [
      { risk: 'Import VAT configured wrongly', likelihood: 'medium', impact: 'high', mitigation: 'Tax adviser decides in sprint 0', owner: 'shared', evidence: 'Q3.4.1' },
    ] },
    { layout: 'next_steps', headline: 'Four decisions unblock the build', client: ['Confirm the tax model'], merkle: ['Legal sign-off on data requests'], dates: 'Kick-off 2026-10-05' },
  ],
};

describe('the deck is filled templates, not prose', () => {
  test('a complete deck passes', () => {
    assert.deepEqual(deckErrors(DECK), []);
  });

  test('missing fields, unknown layouts and stray fields are named', () => {
    const errors = deckErrors({ slides: [
      { layout: 'bullets', headline: 'No bullets here' },
      { layout: 'hero', headline: 'Not a layout' },
      { layout: 'table', headline: 'Markets', columns: ['Market', 'Currency'], rows: [['CH']], mood: 'blue' },
    ] });
    assert.ok(errors.some((e) => /slide 1 \(bullets\): bullets is required/.test(e)));
    assert.ok(errors.some((e) => /slide 2 \(hero\): unknown layout/.test(e)));
    assert.ok(errors.some((e) => /row 1 has 1 cells, the table has 2 columns/.test(e)));
    assert.ok(errors.some((e) => /mood is not a field of the table layout/.test(e)));
    assert.ok(errors.some((e) => /first slide must be the title/.test(e)));
  });

  test('a decision slide must mark the option that was chosen', () => {
    const deck = structuredClone(DECK);
    deck.slides.find((x) => x.layout === 'decision').options.forEach((o) => { o.chosen = false; });
    assert.ok(deckErrors(deck).some((e) => /mark the chosen option/.test(e)));
  });

  test('every layout in the catalogue is offered to Claude in the schema', () => {
    const schema = buildDeckSchema();
    const offered = schema.properties.slides.items.anyOf.map((s) => s.properties.layout.const);
    assert.deepEqual(offered.sort(), Object.keys(LAYOUTS).sort());
  });

  test('the deck renders as a PowerPoint', async () => {
    const file = await renderDeckPptx(DECK, { client: 'acme-watches', version: '1.0' });
    assert.ok(Buffer.isBuffer(file) && file.length > 20000);
    assert.equal(file.subarray(0, 2).toString(), 'PK', 'pptx is a zip container');
  });

  test('the deck reads back as Markdown for the text download', () => {
    const md = deckToMarkdown(DECK);
    assert.match(md, /^# Discovery Closing Document — ACME Watches SA/);
    assert.match(md, /\*\*Chosen option\*\* \(chosen\)/);
    assert.match(md, /\*\*What it does not cover\*\*/, 'the limits survive into the text version');
    assert.match(md, /Why an app at all/);
    assert.match(md, /Mobile conversion/);
  });
});

describe('the annex becomes its own deck', () => {
  const ANNEX = `# Annex — ACME

## A. Decision analysis

### A.1 Store structure

- Three markets share one catalogue
- Expansion stores would triple the integration work

| Option | Cost |
|---|---|
| One store | Lower |
| Expansion stores | Higher |

## Consultant notes

- Internal only: price band EUR 65,000–100,000
`;

  test('sections become dividers, bullets and tables become slides', () => {
    const deck = annexDeckFromMarkdown(ANNEX, { client: 'acme-watches', date: '2026-09-17' });
    assert.equal(deck.slides[0].layout, 'title');
    assert.ok(deck.slides.some((s) => s.layout === 'section' && /Decision analysis/.test(s.title)));
    assert.ok(deck.slides.some((s) => s.layout === 'bullets' && s.bullets.some((b) => /one catalogue/.test(b))));
    const table = deck.slides.find((s) => s.layout === 'table');
    assert.deepEqual(table.columns, ['Option', 'Cost']);
    const shapeOnly = deckErrors({ slides: deck.slides.filter((s) => s.layout !== 'section') })
      .filter((e) => !/the deck needs|first slide must be/.test(e));
    assert.deepEqual(shapeOnly, [], 'annex slides are individually valid');
  });

  test('consultant notes stay out unless asked for', () => {
    assert.ok(!JSON.stringify(annexDeckFromMarkdown(ANNEX)).includes('65,000'));
    assert.ok(JSON.stringify(annexDeckFromMarkdown(ANNEX, { internal: true })).includes('65,000'));
  });

  test('plain text drops Markdown formatting but keeps the words', () => {
    assert.equal(plainText('**Bold** and `code` and [a link](https://x.test)'), 'Bold and code and a link');
  });
});

describe('Shopify reference chapters', () => {
  test('the chapters module matches discovery/docs/reference (npm run reference:chapters)', () => {
    assert.equal(fs.readFileSync(OUTPUT, 'utf8'), renderChaptersModule(readChapters()));
  });

  test('every chapter has front matter, a body and sources', () => {
    for (const chapter of REFERENCE_CHAPTERS) {
      assert.match(chapter.verified, /^\d{4}-\d{2}-\d{2}$/, `${chapter.slug}: verified date`);
      assert.ok(chapter.topics.length, `${chapter.slug}: topics`);
      assert.ok(chapter.summary.length > 10, `${chapter.slug}: summary`);
      assert.ok(chapter.markdown.length > 500, `${chapter.slug}: body`);
      assert.match(chapter.markdown, /https:\/\/(help\.shopify\.com|shopify\.dev|www\.shopify\.com|changelog\.shopify\.com|shopify\.engineering)\//, `${chapter.slug}: official sources`);
    }
  });

  test('topics follow the engagement: B2B, markets and migration only when they apply', () => {
    const dtc = topicsFor({ markets: { list: [{ code: 'DE' }] }, b2b: { enabled: false }, migration: { source_platform: 'none' } });
    assert.ok(dtc.has('plans') && dtc.has('payments') && dtc.has('ai'));
    assert.ok(!dtc.has('b2b') && !dtc.has('markets') && !dtc.has('migration'));

    const complex = topicsFor({ markets: { list: [{ code: 'CH' }, { code: 'DE' }] }, b2b: { enabled: true }, migration: { source_platform: 'woocommerce' } });
    for (const topic of ['markets', 'cross_border', 'b2b', 'migration']) assert.ok(complex.has(topic), topic);
  });

  test('selected chapters are appended to the annex once, with their verified date', () => {
    const doc = { markets: { list: [{ code: 'CH' }, { code: 'DE' }] }, b2b: { enabled: true } };
    const chapters = selectChapters(doc);
    const annex = annexWithChapters('# Annex\n\nClient-specific analysis.', doc);
    assert.ok(annex.startsWith('# Annex'));
    for (const chapter of chapters) {
      assert.ok(annex.includes(`## ${chapter.title}`), `${chapter.slug} appended`);
      assert.ok(annex.includes(`checked ${chapter.verified}`), `${chapter.slug} carries its verified date`);
    }
    assert.deepEqual(chapterBrief(doc).map((c) => c.slug), chapters.map((c) => c.slug));
  });
});

describe('a document knows when the answers moved under it', () => {
  test('snapshot, diff and redraft prompt', async () => {
    const { createDiscoveryService } = await import('../../service/index.js');
    const { createMemoryStore } = await import('../../service/stores/memory-store.js');
    const store = createMemoryStore();
    const svc = createDiscoveryService({ store, today: () => '2026-09-17', visibility: 'all' });
    const lc = { login: 'lead', role: 'consultant' };
    await svc.startInterview(lc, { client: 'demo', mode: 'quick' });
    await svc.recordAnswers(lc, 'demo', [{ question_id: 'Q10.5.2', values: { '/meta/consent/llm_processing': true } }]);
    await svc.recordAnswers(lc, 'demo', [{ question_id: 'Q1.1.1', values: { '/meta/client/name': 'Demo AG' } }]);

    const before = await svc.getClosingDocument(lc, 'demo');
    assert.equal(before.freshness.known, false, 'no document yet, nothing to compare');

    await svc.saveClosingDocument(lc, 'demo', { markdown: `# Doc\n\n${'Text. '.repeat(120)}` });
    const saved = await svc.getClosingDocument(lc, 'demo');
    assert.equal(saved.freshness.up_to_date, true);
    assert.match(saved.freshness.redraft_prompt, /^Draft the Discovery Closing Document/);

    await svc.recordAnswers(lc, 'demo', [{ question_id: 'Q1.1.1', values: { '/meta/client/name': 'Demo Holding AG' } }]);
    await svc.markQuestion(lc, 'demo', { question_id: 'Q1.1.3', as: 'tbc', note: 'industry to confirm' });
    const stale = await svc.getClosingDocument(lc, 'demo');
    assert.equal(stale.freshness.up_to_date, false);
    assert.deepEqual(stale.freshness.changes.map((c) => [c.question_id, c.kind, c.before, c.after]), [
      ['Q1.1.1', 'changed', 'Demo AG', 'Demo Holding AG'],
      ['Q1.1.3', 'state', 'answered', 'to confirm'],
    ]);
    assert.match(stale.freshness.redraft_prompt, /Redraft .* Q1\.1\.1: now Demo Holding AG/);

    await svc.saveClosingDocument(lc, 'demo', { markdown: `# Doc v2\n\n${'Text. '.repeat(120)}` });
    assert.equal((await svc.getClosingDocument(lc, 'demo')).freshness.up_to_date, true, 'redrafting clears it');
  });
});
