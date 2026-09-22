/**
 * What each pack promises, checked against what the engine does with it.
 *
 * The offering was built one way round: it derives the offer from the answers.
 * A client reads it the other way — "if I buy an M, what exactly do I get" —
 * and that question had no answer anywhere, so a consultant improvised one in
 * the room. `closed_scope` is the answer, and this file is what stops it
 * becoming a leaflet the engine disagrees with.
 *
 * The check is not that the words match the gate conditions. It is stronger: an
 * engagement that takes exactly what a pack promises is run through the real
 * classifier, and has to come out as that pack, with its scope gates fitting
 * inside the weeks that pack's band already carries. Promise a market too many
 * and the engagement quietly becomes the next offer up; promise a migration too
 * heavy and the band overflows and the price moves. Either way this goes red.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { offering } from '../../schema/index.js';
import { classifyOffer } from '../../agents/discovery/classify.js';

const LANGS = ['de', 'fr', 'it', 'en', 'es', 'pt', 'nl'];
const CODES = ['CH', 'DE', 'AT', 'FR', 'IT', 'ES', 'NL', 'BE', 'PL', 'SE'];

/** An engagement that takes exactly what a pack promises, and nothing more. */
function engagementAt(limits) {
  const languages = LANGS.slice(0, limits.languages);
  return {
    schema_version: '1.0.0',
    meta: { client: { name: 'X', slug: 'x', business_model: limits.b2b ? 'hybrid' : 'dtc' }, source: 'questionnaire', created_at: '2026-09-01' },
    markets: {
      list: Array.from({ length: limits.markets }, (_, i) => ({
        code: CODES[i],
        currency: limits.multi_currency && i > 0 ? 'EUR' : 'CHF',
        price_strategy: 'base_currency',
        languages,
      })),
    },
    // A pack that promises complex variants has to be built with them, or the
    // catalogue gate never fires and the test proves the wrong engagement.
    catalogue: { sku_count: limits.sku_count, variant_options_max: limits.variant_options ?? 1 },
    design: { figma: { completeness: limits.storefront } },
    integrations: Array.from({ length: limits.integrations }, (_, i) => ({
      system: `sys${i}`, category: ['erp', 'pim', 'crm'][i], connector: 'custom', status: 'to_build', test_environment: 'available',
    })),
    retail: { store_count: limits.retail_locations, pos: limits.retail_locations ? 'shopify_pos' : false },
    migration: limits.migration ? { source_platform: limits.migration, seo_equity: 'none' } : {},
    // A pack that promises checkout blocks has to be built with them.
    checkout: limits.checkout ? { customisation: [limits.checkout] } : {},
  };
}

describe('every threshold a price rests on is referenced', () => {
  /*
   * ADR 0011: every Shopify fact carries an official source and the date it was
   * checked. The question bank has always done this; the offering did not, and
   * the offering is where the thresholds that decide a price live — 500 SKUs,
   * 25 filters, five stores, six languages. A number nobody sourced is how half
   * a week per market survived a day of being quoted.
   *
   * A gate that is not a Shopify fact says so rather than borrowing a citation:
   * what a client runs the store with after go-live is a Merkle decision, and
   * decorating it with a Shopify URL would be worse than leaving it bare.
   */
  const SHOPIFY = /^https:\/\/(help\.shopify\.com|shopify\.dev|www\.shopify\.com|changelog\.shopify\.com)\//;

  test('every scope gate cites Shopify, or declares that it is not a Shopify fact', () => {
    for (const g of offering.scope_gates) {
      if (g.shopify_fact === false) {
        assert.ok(g.$comment, `${g.id}: says it is not a Shopify fact without saying why`);
        assert.ok(!g.sources, `${g.id}: claims not to be a Shopify fact and cites Shopify anyway`);
        continue;
      }
      assert.ok(g.sources?.length, `${g.id}: no source for the thresholds it prices`);
      for (const u of g.sources) assert.match(u, SHOPIFY, `${g.id}: ${u} is not a Shopify page`);
      assert.ok(g.verified?.on, `${g.id}: cites sources with no date they were checked`);
      assert.match(g.verified.on, /^\d{4}-\d{2}-\d{2}$/, `${g.id}: verification date is not a date`);
    }
  });

  test('we never promise past what Shopify allows', () => {
    /*
     * Two kinds of number live in these gates and they read identically: a
     * limit Shopify enforces, and a line Merkle drew. They argue differently —
     * one is a fact to cite, the other a position to defend — and only one of
     * them can make the offering promise something the platform cannot do.
     *
     * So where a gate has both, it records both, and our line has to sit inside
     * the platform's. Ten locations on Basic, Grow and Advanced against the five
     * we sell; twenty published languages against our six.
     */
    for (const g of offering.scope_gates) {
      const l = g.platform_limit;
      if (!l) continue;
      assert.ok(l.merkle_line <= l.shopify,
        `${g.id}: we sell up to ${l.merkle_line} ${l.what.toLowerCase()} and Shopify allows ${l.shopify}`);
      assert.ok(l.shopify <= l.shopify_plus, `${g.id}: the Plus limit is below the standard one`);
      assert.ok(l.source?.startsWith('https://'), `${g.id}: a platform limit with no page behind it`);
      assert.ok(g.sources?.includes(l.source) || g.sources?.length,
        `${g.id}: the platform limit cites a page the gate does not`);
    }
  });

  test('a source is a page, not a search or an anchor pretending to be one', () => {
    for (const g of offering.scope_gates) {
      for (const u of g.sources ?? []) {
        assert.ok(!u.includes('#'), `${g.id}: ${u} points at an anchor, which moves without the page moving`);
        // Anchored on the path segment: 'storefront-search' is a page, '/search' is a query.
        assert.ok(!/\/search(\/|$)|[?&]q=/.test(u), `${g.id}: ${u} is a search, not a citation`);
      }
    }
  });
});

describe('the strategy document and the engine quote the same offering', () => {
  /*
   * offering.json names docs/strategy.md as its source, and the two drifted
   * apart the first afternoon the bands moved: the document still said an M was
   * 6-13 weeks at CHF 65-135k after the engine had started quoting 6-14 at
   * 65-145. Nothing could see it, because one is prose and the other is data.
   *
   * A document that is cited as the source of a number has to carry that
   * number. This reads the table rather than trusting it.
   */
  const strategy = fs.readFileSync(new URL('../../../docs/strategy.md', import.meta.url), 'utf8');

  test('every offer\u2019s band and duration appear in the table that claims to define them', () => {
    for (const [code, offer] of Object.entries(offering.offers)) {
      const b = offer.price_band;
      const d = offer.duration_weeks;
      const money = `CHF ${b.min / 1000}\u2013${b.max / 1000}k${b.open_ended ? '+' : ''}`;
      const weeks = `${d.min}\u2013${d.max} weeks`;
      assert.ok(strategy.includes(money), `${code}: strategy.md does not quote ${money}`);
      assert.ok(strategy.includes(weeks), `${code}: strategy.md does not quote ${weeks}`);
      assert.ok(strategy.includes(offer.name), `${code}: strategy.md never names ${offer.name}`);
    }
  });
});

describe('the closed scope each pack sells', () => {
  const { rows, limits } = offering.closed_scope;

  test('a client who takes exactly what a pack promises gets that pack', () => {
    for (const [code, lim] of Object.entries(limits)) {
      const offer = classifyOffer(engagementAt(lim));
      assert.equal(offer.code, code,
        `${code} promises a scope the engine classifies as ${offer.code} — the leaflet and the engine disagree`);
    }
  });

  test('and it fits inside the weeks that pack already carries, so the price does not move', () => {
    for (const [code, lim] of Object.entries(limits)) {
      const offer = classifyOffer(engagementAt(lim));
      const gates = offer.scope_effort_by_gate.reduce((a, g) => a + g.weeks.max, 0);
      assert.ok(gates <= offer.gate_capacity_weeks.max,
        `${code} promises ${gates} weeks of scope gates against the ${offer.gate_capacity_weeks.max} its band carries — quoting it would cost more than the pack`);
      assert.ok(offer.duration_weeks.max <= offering.offers[code].duration_weeks.max,
        `${code} promises more than its own duration`);
    }
  });

  test('S promises no scope gate at all, which is what makes it the entry offer', () => {
    const offer = classifyOffer(engagementAt(limits.S));
    const active = Object.entries(offer.scope_gates).filter(([, g]) => g.active).map(([id]) => id);
    assert.deepEqual(active, [], `S promises something that fires ${active.join(', ')}`);
  });

  test('every row names a real gate, and every gate is accounted for', () => {
    const gates = new Set(offering.scope_gates.map((g) => g.id));
    const named = new Set();
    for (const row of rows) {
      assert.ok(gates.has(row.gate), `${row.id}: ${row.gate} is not a scope gate`);
      named.add(row.gate);
      for (const code of ['S', 'M', 'L']) {
        // "1" is a complete answer for markets on an S, so this tests for
        // emptiness rather than for length.
        assert.ok(typeof row[code] === 'string' && row[code].trim(), `${row.id}: nothing said for ${code}`);
      }
    }
    // A gate with no row is a capability a client is never told about, and it
    // is the one that surfaces in week six.
    const unnamed = [...gates].filter((g) => !named.has(g));
    assert.deepEqual(unnamed, [], 'scope gates the closed scope never mentions');
  });

  test('a ceiling quoted in a row is the ceiling a rule actually enforces', () => {
    const byId = new Map(offering.exit_rules.map((r) => [r.id, r]));
    for (const row of rows) {
      for (const id of (row.note ?? '').match(/rule (\d+\.\d+)/g)?.map((m) => m.slice(5)) ?? []) {
        assert.ok(byId.has(id), `${row.id}: cites rule ${id}, which does not exist`);
      }
    }
  });
});
