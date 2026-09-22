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
import { classifyOffer } from '../../engine/classify.js';

/** A citation is a page on one of Shopify's own sites, and nothing else. */
const SHOPIFY = /^https:\/\/(help\.shopify\.com|shopify\.dev|www\.shopify\.com|changelog\.shopify\.com)\//;

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
    /* A pack that promises N bespoke sections has to be built with N of them,
       for the same reason as the variants above: the number went unenforced
       for months precisely because nothing built an engagement that took it. */
    design: { figma: { completeness: limits.storefront }, ...(limits.bespoke_sections === undefined ? {} : { bespoke_sections: limits.bespoke_sections }) },
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
  const { rows, addons, groups, limits } = offering.closed_scope;

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

  test('every gate is accounted for — as a comparison row, or as an add-on service', () => {
    /*
     * The invariant that matters has not changed: a capability a client is
     * never told about is the one that surfaces in week six. What changed is
     * where a gate may be told. Three gates — B2B, Shopify POS, subscriptions —
     * are in no pack at all, and a comparison row saying "not in the base pack"
     * three times is a table explaining what it does not sell. Those belong in
     * the add-on catalogue instead. So a gate has to appear in exactly one of
     * the two, and neither list may quietly drop one.
     */
    const gates = new Set(offering.scope_gates.map((g) => g.id));
    const inRows = new Set(rows.map((r) => r.gate).filter(Boolean));
    const inAddons = addons.map((a) => a.gate);

    for (const row of rows) {
      if (row.gate !== null) assert.ok(gates.has(row.gate), `${row.id}: ${row.gate} is not a scope gate`);
      for (const code of ['S', 'M', 'L']) {
        // "1" is a complete answer for markets on an S, so this tests for
        // emptiness rather than for length.
        assert.ok(typeof row[code] === 'string' && row[code].trim(), `${row.id}: nothing said for ${code}`);
      }
    }
    for (const gateId of inAddons) assert.ok(gates.has(gateId), `${gateId} is sold as an add-on and is not a scope gate`);
    assert.equal(new Set(inAddons).size, inAddons.length, 'a gate is listed twice in the add-on catalogue');

    const unaccounted = [...gates].filter((g) => !inRows.has(g) && !inAddons.includes(g));
    assert.deepEqual(unaccounted, [], 'scope gates neither compared nor sold as an add-on');
  });

  test('a row a pack holds none of is not a row at all', () => {
    /*
     * The stakeholder's rule, as data. The table states the most that fits in
     * each pack; it does not argue about what does not fit. So a cell is a
     * quantity or an em dash, never "add-on", never "not in the base pack" —
     * and a row whose three cells are all dashes is not a comparison at all,
     * it is an add-on service that wandered into the table.
     */
    const DASH = '—';
    for (const row of rows) {
      const cells = ['S', 'M', 'L'].map((c) => row[c]);
      assert.ok(cells.some((v) => v !== DASH),
        `${row.id}: no pack includes any of this, so it belongs in the add-on catalogue rather than the table`);
      for (const [i, v] of cells.entries()) {
        if (v === DASH) continue;
        assert.doesNotMatch(v, /add-?on|not in the base|scope gate|^no\b|^yes$/i,
          `${row.id} (${'SML'[i]}): "${v}" explains instead of stating a quantity`);
      }
    }
  });

  test('every row reads under a declared group, and the groups do not interleave', () => {
    assert.ok(groups?.length, 'the row groups are declared and ordered');
    const seen = [];
    for (const row of rows) {
      assert.ok(groups.includes(row.group), `${row.id}: "${row.group}" is not one of the declared groups`);
      if (seen.at(-1) !== row.group) {
        assert.ok(!seen.includes(row.group), `${row.id}: the ${row.group} rows are split apart by another group`);
        seen.push(row.group);
      }
    }
  });

  test('every row states the Shopify ceiling behind it, or that Shopify documents none', () => {
    /*
     * ADR 0011 again, on the page a consultant argues from rather than in the
     * schema behind it. A row whose ceiling is a Shopify fact has to cite one,
     * and a row that is a Merkle decision has to say so rather than borrow a
     * citation — the same bargain the scope gates already keep. Where the row
     * has no gate of its own (staff users, payment providers, tax), it carries
     * its own sources and the date they were checked.
     */
    const cited = new Map(offering.scope_gates.map((g) => [g.id, g]));
    for (const row of rows) {
      if (row.shopify_fact === false) {
        assert.equal(row.shopify_limit ?? null, null, `${row.id}: says it is not a Shopify fact and quotes a Shopify limit`);
        assert.ok(row.$comment, `${row.id}: says it is not a Shopify fact without saying why`);
        assert.ok(!row.sources, `${row.id}: claims not to be a Shopify fact and cites Shopify anyway`);
        continue;
      }
      assert.ok(row.shopify_limit?.trim(), `${row.id}: no platform ceiling stated, and no claim that Shopify documents none`);
      const sources = row.sources ?? cited.get(row.gate)?.sources;
      assert.ok(sources?.length, `${row.id}: quotes a Shopify limit with nothing behind it`);
      for (const u of sources) assert.match(u, SHOPIFY, `${row.id}: ${u} is not a Shopify page`);
      const verified = row.verified ?? cited.get(row.gate)?.verified;
      assert.match(verified?.on ?? '', /^\d{4}-\d{2}-\d{2}$/, `${row.id}: cites sources with no date they were checked`);
    }
  });

  test('a quantity in a cell is the quantity the engine was tested at', () => {
    /*
     * The row that started this: the page promised an Ecommerce Growth "up to
     * 3 system integrations" while the fixture below — the one the classifier
     * actually runs — carried one, and at two the scope overflows the band and
     * the engagement is no longer priced as quoted. Nothing could see it,
     * because the sentence and the number lived in different objects.
     *
     * Only the dimensions `limits` counts are checked here. Catalogue size is
     * deliberately not one of them: the fixture holds a representative value
     * inside the tier (2,000) rather than the tier's ceiling (4,999), and the
     * modifier prices the two identically.
     */
    const COUNTED = { markets: 'markets', languages: 'languages', integrations: 'integrations' };
    const DASH = '—';
    for (const row of rows) {
      const key = COUNTED[row.id];
      if (!key) continue;
      for (const code of ['S', 'M', 'L']) {
        const promised = limits[code][key];
        const cell = row[code];
        if (!promised) {
          assert.equal(cell, DASH, `${row.id} (${code}): the fixture takes none and the cell promises "${cell}"`);
          continue;
        }
        const quoted = Number(/\d[\d,]*/.exec(cell)?.[0].replace(/,/g, ''));
        assert.equal(quoted, promised,
          `${row.id} (${code}): the cell promises ${quoted} and the engine was tested at ${promised}`);
      }
    }
  });

  test('the storefront row counts the bespoke sections the offer itself counts', () => {
    // The one other hand-typed number with an engine-side twin: each offer
    // records how many bespoke sections it builds, and the cell used to be
    // free to say something else.
    const row = rows.find((r) => r.id === 'storefront_design');
    for (const code of ['S', 'M']) {
      const built = offering.offers[code].storefront.bespoke_sections;
      assert.match(row[code], new RegExp(`\\b${built}\\b`),
        `${code}: builds ${built} bespoke sections and the table says "${row[code]}"`);
    }
    // L counts no sections — the template set is the deliverable — so the cell
    // must not invent a number for it.
    assert.equal(offering.offers.L.storefront.bespoke_sections, null);
    assert.doesNotMatch(row.L, /\d/, 'L promises a count its own offer deliberately does not give');
  });

  test('every add-on service says what it covers, what it costs and which packs can buy it', () => {
    const byGate = new Map();
    for (const m of offering.modifiers) byGate.set(m.gate, [...(byGate.get(m.gate) ?? []), m]);
    for (const a of addons) {
      const mods = byGate.get(a.gate) ?? [];
      assert.ok(mods.length, `${a.id}: an add-on service the engine has no price for`);
      assert.ok(a.what?.trim(), `${a.id}: no name`);
      // One modifier describes itself; tiers need a line above them.
      if (mods.length > 1) assert.ok(a.description?.trim(), `${a.id}: priced by tier with nothing said above the tiers`);
      const packs = a.available_in ?? ['S', 'M', 'L'];
      assert.ok(packs.length && packs.every((p) => ['S', 'M', 'L'].includes(p)), `${a.id}: ${packs} is not a set of packs`);
    }
  });

  test('a second Shopify store is sold only where the engine can actually deliver it', () => {
    // The store gate and the multi_store L-trigger read the same fact, so any
    // second store makes the engagement an Ecommerce Growth. Offering one as an
    // add-on to an S or an M would be selling a pack the engine cannot quote.
    const stores = addons.find((a) => a.gate === 'store_estate');
    assert.deepEqual(stores.available_in, ['L']);
    assert.deepEqual(rows.find((r) => r.id === 'store_estate').addon, ['L']);
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
