/**
 * Discovery Closing Document outputs: the PowerPoint slide model (ADR 0017
 * amendment) and Merkle's verified Shopify reference chapters appended to the
 * annex. No network, no binary inspection — the slide model is a pure function.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { slidesFromMarkdown, plainText, closingDocumentPptx } from '../../service/pptx.js';
import { REFERENCE_CHAPTERS, selectChapters, topicsFor, annexWithChapters, chapterBrief } from '../../service/reference.js';
import { readChapters, renderChaptersModule, OUTPUT } from '../../scripts/render-reference-chapters.js';

const DOC = `# Discovery Closing Document — ACME

Prepared by Lead Consultant · 2026-09-17

## 1. Cover

| | |
|---|---|
| Client | ACME |

## 2. Executive summary

**Recommendation: one store with Shopify Markets.**

- Three markets [Q3.1.1]
- Native B2B on Plus [5]

### Why Shopify Plus

- Company-specific catalogs [5]
- Checkout step extensions [6]

## 12. Risks

| Risk | Impact |
|---|---|
${Array.from({ length: 12 }, (_, i) => `| Risk ${i + 1} | High |`).join('\n')}

## 17. Appendix — user stories

| Key | Story |
|---|---|
| LWC-1 | Set up the store |

### References

1. Shopify Help Center: https://help.shopify.com/en/manual/markets

## Consultant notes

> Lead Consultant only — remove before sharing.

| Item | Value |
|---|---|
| Price band | EUR 65,000–100,000 |
`;

describe('closing document as a PowerPoint deck', () => {
  test('plain text drops Markdown formatting but keeps the words', () => {
    assert.equal(plainText('**Bold** and `code` and [a link](https://x.test)'), 'Bold and code and a link');
    assert.equal(plainText('one<br>two'), 'one · two');
  });

  test('the client deck leaves out consultant notes, appendices and references', () => {
    const model = slidesFromMarkdown(DOC);
    const text = JSON.stringify(model).toLowerCase();
    assert.equal(model.title, 'Discovery Closing Document — ACME');
    assert.ok(model.subtitle.some((s) => s.includes('Lead Consultant')));
    assert.ok(!text.includes('price band'), 'no internal pricing in the client deck');
    assert.ok(!text.includes('appendix'), 'appendices belong in the annex');
    assert.ok(!text.includes('help.shopify.com'), 'the bibliography belongs in the annex');
    const sections = model.slides.filter((s) => s.kind === 'section').map((s) => s.heading);
    assert.deepEqual(sections, ['1. Cover', '2. Executive summary', '12. Risks']);
  });

  test('internal and annex options add the sections back', () => {
    const internal = JSON.stringify(slidesFromMarkdown(DOC, { internal: true }));
    assert.ok(internal.includes('Price band'), 'consultant notes are in the internal deck');
    const annex = JSON.stringify(slidesFromMarkdown(DOC, { annex: true }));
    assert.ok(annex.includes('LWC-1'), 'appendices are in the annex deck');
  });

  test('long tables are split across slides and bullets are chunked', () => {
    const model = slidesFromMarkdown(DOC);
    const risk = model.slides.filter((s) => s.kind === 'table' && s.section === '12. Risks');
    assert.equal(risk.length, 2, '12 rows become two slides');
    assert.ok(risk.every((s) => s.rows.length <= 9));
    assert.match(risk[0].heading, /\(1\/2\)$/);
    assert.deepEqual(risk[0].header, ['Risk', 'Impact']);
    const bullets = model.slides.filter((s) => s.kind === 'bullets');
    assert.ok(bullets.every((s) => s.bullets.length <= 7));
    assert.ok(bullets.some((s) => s.bullets.includes('Three markets [Q3.1.1]')));
  });

  test('renders a PowerPoint file', async () => {
    const file = await closingDocumentPptx(DOC, { client: 'acme', date: '2026-09-17' });
    assert.ok(Buffer.isBuffer(file) && file.length > 10000);
    assert.equal(file.subarray(0, 2).toString(), 'PK', 'pptx is a zip container');
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
