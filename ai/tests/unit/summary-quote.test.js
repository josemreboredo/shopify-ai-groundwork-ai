/**
 * What the engine quoted, on the one page that said it carried it.
 *
 * The Summary warned "this page carries the offer and the price band" and
 * carried neither — offerStanding returns a code and a headline, and the band
 * lived only in the go/no-go document and the deck XML. Survivable while the
 * band was simply the offer's; not once gates started being quoted past the
 * weeks a band already holds, because the two numbers then differ and the app
 * showed the wrong one.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { offering } from '../../schema/index.js';
import { quote, renderSummaryMarkdown } from '../../shared/summary.js';
import { classifyOffer } from '../../engine/classify.js';

const FIXTURES = path.join(import.meta.dirname, '..', 'fixtures', 'engagements');
const load = (name) => JSON.parse(fs.readFileSync(path.join(FIXTURES, name), 'utf8'));

/** An engagement whose scope goes well past what the largest pack includes. */
function overflowing() {
  const doc = load('foundation-minimal.json');
  /* This has to outgrow whatever L carries, and L now carries three stores
     and 24 weeks. Eight markets in six languages over a 20,000-SKU
     catalogue clears it by nearly six weeks, so a band moving by one does
     not quietly stop this testing anything. */
  doc.markets = { list: ['CH', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL'].map((code) => ({ code, currency: code === 'CH' ? 'CHF' : 'EUR', price_strategy: 'base_currency', languages: ['de', 'fr', 'it', 'en', 'es', 'nl'] })) };
  doc.catalogue = { sku_count: 20000, variant_options_max: 3 };
  doc.migration = { source_platform: 'magento' };
  doc.b2b = { enabled: true };
  doc.retail = { store_count: 4, pos: 'shopify_pos' };
  doc.integrations = [{ category: 'erp', connector: 'custom' }, { category: 'pim', connector: 'custom' }, { category: '3pl_wms', connector: 'custom' }];   // the integration gate caps at three weeks, so more does nothing
  doc.offer = classifyOffer(doc);
  return doc;
}

describe('the quote the Summary carries', () => {
  test('the band travels to engagement leads and to nobody else', () => {
    const doc = load('acme-watches.json');
    const owner = quote(doc, { pricing: true });
    assert.deepEqual(owner.band, doc.offer.price_band);
    assert.equal(owner.pricing_withheld, false);

    const consultant = quote(doc, { pricing: false });
    assert.equal(consultant.band, undefined, 'Merkle’s commercial position is not in it');
    assert.equal(consultant.pricing_withheld, true);
    // The weeks are not pricing: every consultant needs the duration.
    assert.deepEqual(consultant.weeks, doc.offer.duration_weeks);
    assert.doesNotMatch(JSON.stringify(consultant), /\d{5,}/, 'no price reaches it by another route');
  });

  test('on an overflowing engagement it is not the offer’s published band', () => {
    // The whole reason this exists. Reading the number off the offering page
    // would be reading the wrong number.
    const doc = overflowing();
    const q = quote(doc, { pricing: true });
    const published = offering.offers[q.code];
    assert.ok(q.modifiers.length, 'the gates outgrew the envelope');
    assert.ok(q.band.max > published.price_band.max, 'and the quote says so');
    assert.ok(q.weeks.max > published.duration_weeks.max);
  });

  test('it carries its own arithmetic, so the number can be rebuilt', () => {
    const q = quote(overflowing(), { pricing: true });
    // Every part of "the Foundation build plus every gate, and what goes past
    // the pack" is here.
    assert.deepEqual(q.base_weeks, offering.offers.S.duration_weeks);
    assert.ok(q.scope_effort_weeks.max > q.base_weeks.max, 'the gates add to the build');
    assert.ok(q.addons.length, 'and it names what goes past the pack');
    assert.ok(q.rationale?.length, 'and the engine says why in its own words');
  });

  test('a band computed while gates are unknown says it is a guess', () => {
    const doc = load('acme-watches.json');
    assert.equal(quote(doc, { pricing: true, provisional: true }).provisional, true);
    assert.equal(quote(doc, { pricing: true }).provisional, false);
  });

  test('nothing to quote on an engagement the engine cannot decide', () => {
    assert.equal(quote({}, { pricing: true }), null);
    assert.equal(quote({ offer: {} }, { pricing: true }), null);
  });

  test('the download carries it too, because it is the same promise', () => {
    const doc = overflowing();
    const s = {
      engagement: { client: 'x', mode: 'quick', language: 'en', updated_at: '2026-09-20' },
      generated_at: '2026-09-20',
      preview: { offer: { code: doc.offer.code, name: doc.offer.name }, go: true, scope_gates: {}, l_triggers: {}, exit_rules: [], app_signals: {}, coverage: { required_answered: 1, required_total: 2, required_tbc: 0, required_open: 1 } },
      quote: quote(doc, { pricing: true }),
      open_items: [], sections: [], documents: [], notes: [],
    };
    const md = renderSummaryMarkdown(s);
    assert.match(md, /\*\*Quoted:\*\*/);
    assert.match(md, /How that number is built/);
    assert.match(md, /every scope gate at its own weeks and price/);
    assert.match(md, /past what Ecommerce Growth includes/);

    // And withheld the same way it is on the page.
    const withheld = renderSummaryMarkdown({ ...s, quote: quote(doc, { pricing: false }) });
    assert.match(withheld, /\*\*Quoted:\*\*/);
    assert.doesNotMatch(withheld, /CHF/);
  });
});

describe('an engagement outside the offers', () => {
  test('is quoted at nothing, because the offers do not price it', () => {
    // The error this tool keeps having to unlearn: a commercial position
    // derived from nothing. The go/no-go document already withheld the band on
    // a STOP; this page was about to state one beside a headline saying the
    // engagement had left the offers.
    const doc = overflowing();
    doc.delivery = { go: false, route: 'larger_engagement' };
    const q = quote(doc, { pricing: true });
    assert.equal(q.outside_the_offers, true);
    assert.equal(q.band, undefined, 'no band');
    assert.equal(q.weeks, undefined, 'and no duration either — both are the offer’s');
    assert.equal(q.route, 'larger_engagement');
    // What is still worth knowing: which offer it would have been, and the size.
    assert.equal(q.code, doc.offer.code);
    assert.ok(q.scope_effort_weeks.max > offering.offers.L.duration_weeks.max);
    assert.ok(q.addons.length, 'and what would have gone past the pack');
    assert.doesNotMatch(JSON.stringify(q), /\d{5,}/, 'no price reaches it by another route');
  });

  test('and the download says the same, not a different thing', () => {
    const doc = overflowing();
    doc.delivery = { go: false, route: 'arc' };
    const md = renderSummaryMarkdown({
      engagement: { client: 'x', mode: 'quick', language: 'en', updated_at: '2026-09-20' },
      generated_at: '2026-09-20',
      preview: { offer: { code: doc.offer.code, name: doc.offer.name }, go: false, route: 'arc', scope_gates: {}, l_triggers: {}, exit_rules: [], app_signals: {}, coverage: { required_answered: 1, required_total: 2, required_tbc: 0, required_open: 1 } },
      quote: quote(doc, { pricing: true }),
      open_items: [], sections: [], documents: [], notes: [],
    });
    assert.match(md, /\*\*Quoted:\*\* nothing/);
    assert.match(md, /It would have been/);
    assert.doesNotMatch(md, /CHF/);
  });
});

describe('where the band travels', () => {
  test('the connector never carries it, whatever the consultant’s role', async () => {
    // The band reaches a lead consultant reading a screen. It does not reach a
    // model that goes on to draft a client document from the same context —
    // "the engine keeps them out of everything it generates" is the rule, and a
    // connector transcript is where "internal" and "generated" meet.
    const { createDiscoveryService } = await import('../../shared/index.js');
    const { createMemoryStore } = await import('../../shared/stores/memory-store.js');
    const svc = createDiscoveryService({ store: createMemoryStore(), today: () => '2026-09-21' });
    const owner = { login: 'lead', role: 'owner' };
    await svc.startInterview(owner, { client: 'band-test', language: 'en', mode: 'quick', process: 'rfp' });
    const ans = (id, values) => svc.answerQuestion(owner, 'band-test', { question_id: id, values });
    await ans('Q10.5.2', { '/meta/consent/llm_processing': ['true'] });
    await ans('Q1.1.1', { '/meta/client/name': ['Band Test AG'], '/meta/client/legal_name': ['Band Test AG'] });

    const web = await svc.getSummary(owner, 'band-test');
    assert.ok(web.quote?.band, 'an engagement lead reading the page sees it');

    const forClaude = await svc.getSummary(owner, 'band-test', { pricing: false });
    assert.equal(forClaude.quote.band, undefined);
    assert.equal(forClaude.quote.pricing_withheld, true);
    assert.doesNotMatch(renderSummaryMarkdown(forClaude), /[A-Z]{3}\s*\d+k–\d+k/, 'no band reaches the markdown either');
  });
});
