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
import { engagementAt } from '../../engine/promise.js';
import { renderStrategy } from '../../scripts/render-strategy.js';

/** A citation is a page on one of Shopify's own sites, and nothing else. */
const SHOPIFY = /^https:\/\/(help\.shopify\.com|shopify\.dev|www\.shopify\.com|changelog\.shopify\.com)\//;

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

  test('the classification rule and the modifier table are the offering’s own', () => {
    assert.equal(strategy, renderStrategy(strategy), 'docs/strategy.md has drifted from offering.json — run npm run strategy:render');
  });

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

  test('and it is quoted inside the band the pack publishes', () => {
    /* The quote is the Foundation base plus every gate at its own price, so a
       pack's band is a promise the arithmetic has to keep: a client who takes
       exactly the pack is quoted inside it, never above the ceiling on the
       page. When the gates a pack includes grow, this goes red until the band
       moves with them. */
    for (const [code, lim] of Object.entries(limits)) {
      const offer = classifyOffer(engagementAt(lim));
      const band = offering.offers[code].price_band;
      const weeks = offering.offers[code].duration_weeks;
      assert.ok(offer.price_band.min >= band.min && offer.price_band.max <= band.max,
        `${code} at its promise is quoted CHF ${offer.price_band.min}–${offer.price_band.max} against a published ${band.min}–${band.max}`);
      assert.ok(offer.duration_weeks.min >= weeks.min && offer.duration_weeks.max <= weeks.max,
        `${code} at its promise takes ${offer.duration_weeks.min}–${offer.duration_weeks.max} weeks against a published ${weeks.min}–${weeks.max}`);
      assert.deepEqual(offer.addons, [], `${code} at its promise needs add-ons: ${offer.addons.map((a) => a.gate)}`);
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
     * The row that started this: the page promised an Ecommerce Flagship "up to
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

  test('a second Shopify store is an add-on on M, and included in L up to three', () => {
    /* A re-estimate that finds a second store has to read as the same project
       with a store more. The store is sold on M and included in L; S does not
       carry it, so a small engagement that needs one is named after the
       smallest pack that sells it. */
    const stores = addons.find((a) => a.gate === 'store_estate');
    assert.deepEqual(stores.available_in, ['M', 'L']);
    assert.deepEqual(rows.find((r) => r.id === 'store_estate').addon, ['M', 'L']);

    const m = classifyOffer(engagementAt(limits.M));
    const more = classifyOffer(engagementAt({ ...limits.M, stores: 2 }));
    assert.equal(more.code, 'M', 'an M that finds a second store is still an M');
    assert.deepEqual(more.addons.map((a) => a.gate), ['store_estate']);
    const store = more.price_band.max - m.price_band.max;
    assert.ok(store > 0 && store < 30000, `the store adds CHF ${store} to the ceiling, not the next pack's band`);

    const small = classifyOffer(engagementAt({ ...limits.S, stores: 2 }));
    assert.equal(small.code, 'M', 'S does not carry a second store');
    assert.deepEqual(small.addons.map((a) => a.gate), ['store_estate']);
    assert.equal(classifyOffer(engagementAt(limits.L)).addons.length, 0, 'L includes three stores');
  });

  test('L sells across regions: more markets than M, spread over its stores', () => {
    /* Three stores are how a brand sells across regions, and L promised three
       markets — one per store, no more than M. The ladder has to climb on the
       thing a flagship is bought for. */
    assert.ok(limits.S.markets < limits.M.markets && limits.M.markets < limits.L.markets, 'markets climb from S to M to L');
    assert.ok(limits.L.markets > limits.L.stores, 'more than one market in a store');
    assert.equal(classifyOffer(engagementAt(limits.L)).addons.length, 0, 'and every one of them is inside L');
  });

  test('Hydrogen is an add-on in every pack, priced by its weeks and the design system days', () => {
    /* It had no weeks of its own, so a headless quote was floored at L's band
       and every L band carried a "+". It is a gate now: the owned front end in
       build weeks, the design system in a design system architect's days. */
    const m = offering.modifiers.find((x) => x.gate === 'hydrogen');
    // The weeks are their parts: the React front end and the back end a theme never needs.
    for (const k of ['min', 'max']) assert.equal(m.parts.reduce((a, p) => a + p.weeks[k], 0), m.effort_weeks[k], `Hydrogen ${k}: the parts do not add up`);
    assert.ok(m.parts.some((p) => /Back end/.test(p.what)), 'the back end is its own part');
    const l = classifyOffer(engagementAt(limits.L));
    const h = classifyOffer(engagementAt({ ...limits.L, headless: true }));
    assert.equal(h.code, 'L');
    assert.equal(h.delivery_track, 'hydrogen');
    assert.deepEqual(h.addons.map((a) => a.gate), ['hydrogen'], 'L plus the Hydrogen add-on');
    assert.equal(h.scope_effort_weeks.max - l.scope_effort_weeks.max, m.effort_weeks.max);
    assert.deepEqual(h.design.system_days, m.system_days);
    const day = offering.pricing.design.system_architect.day_price;
    assert.equal(h.price_band.max - l.price_band.max, Math.round((m.price_add.max + m.system_days.max * day) / 1000) * 1000);
    assert.equal(h.price_band.open_ended, false, 'no quote is open-ended any more');
    assert.equal(offering.offers.L.price_band.open_ended, false, 'nor is L’s band');
    // Every pack sells it, and a headless storefront designs every template.
    assert.deepEqual(addons.find((a) => a.gate === 'hydrogen').available_in, ['S', 'M', 'L']);
    assert.ok(!offering.l_triggers.some((t) => t.id === 'headless'), 'it no longer names the pack');
    const bare = classifyOffer(engagementAt({ ...limits.S, headless: true }));
    // Named by its budget, not forced: a React front end designed in full
    // reaches the Flagship floor on its own, even on one market.
    assert.equal(bare.code, 'L');
    assert.ok(bare.price_band.min >= offering.offers.L.price_band.min, 'it reaches the Flagship budget rather than being put there');
    assert.ok(bare.addons.some((a) => a.gate === 'hydrogen'));
    assert.equal(bare.scope_gates.storefront_design.tier, 'bespoke');
  });

  test('a row’s note never states a different number of days than its cells', () => {
    // Hypercare was 15 days in every cell and thirty in the note under them,
    // so a consultant reading the note promised twice what the price assumes.
    const WORDS = { seven: 7, ten: 10, fourteen: 14, fifteen: 15, twenty: 20, thirty: 30, sixty: 60, ninety: 90 };
    const days = (text) => [...String(text ?? '').matchAll(/\b(\d+|[a-z]+) days\b/gi)]
      .map((m) => Number(m[1]) || WORDS[m[1].toLowerCase()]).filter(Boolean);
    for (const row of rows) {
      const inCells = new Set(['S', 'M', 'L'].flatMap((c) => days(row[c])));
      if (!inCells.size) continue;
      for (const n of days(row.note)) assert.ok(inCells.has(n), `${row.id}: the note says ${n} days, the cells say ${[...inCells]}`);
    }
  });

  test('the migration add-on and the row agree on what each pack carries', () => {
    const row = rows.find((r) => r.gate === 'migration');
    const sold = addons.find((a) => a.gate === 'migration');
    assert.match(row.M, /WooCommerce/);
    assert.equal(limits.M.migration, 'woocommerce', 'the promise the engine prices carries the same');
    assert.match(sold.description, /Ecommerce Scale already carries a WooCommerce or Shopify migration/);
    assert.doesNotMatch(sold.description, /Ecommerce Flagship already carr/, 'L carries no migration');
    for (const source of ['Shopware', 'BigCommerce', 'Magento']) assert.match(row.addon_label, new RegExp(source), `${source} is sold on top in M, and the row has to say so`);
  });

  test('a pack promises nothing no row, gate or add-on stands behind', () => {
    // "Personalisation set up and running at launch" and "consent carried to
    // every destination" sat in L's headline with nothing priced behind them —
    // the second one sold back to L as the analytics add-on.
    for (const [code, offer] of Object.entries(offering.offers)) {
      const promise = `${offer.for_whom} ${offer.base_scope}`;
      assert.doesNotMatch(promise, /personali[sz]ation/i, `${code} promises personalisation, which nothing defines or prices`);
      assert.doesNotMatch(promise, /consent carried|every destination/i, `${code} promises what the analytics add-on sells`);
    }
  });

  test('a further storefront design is sold where a further store is', () => {
    // Shopify publishes one theme per store, so a second design needs a second store.
    assert.deepEqual(addons.find((a) => a.gate === 'theme_design').available_in, ['M', 'L']);
    assert.deepEqual(rows.find((r) => r.id === 'themes').addon, ['M', 'L']);
  });

  /* The Arc column is the one place the pack table talks about work this engine
     does not price. Left to prose it would drift into a fourth offer — a cell
     saying what Arc "includes" is a commercial promise for a practice that
     never agreed to it. So every Arc cell has to be traceable to a STOP rule
     that actually routes there: the rule must exist, it must stop the
     engagement, and its destination must name Arc. */
  test('every Arc cell is backed by a STOP rule that routes to Arc', () => {
    const byId = new Map(offering.exit_rules.map((r) => [r.id, r]));
    const withArc = rows.filter((r) => r.Arc);
    assert.ok(withArc.length, 'the pack table claims an Arc column and no row fills it');

    for (const row of rows) {
      if (row.Arc_rules && !row.Arc) assert.fail(`${row.id}: cites Arc rules with nothing in the Arc cell`);
      if (!row.Arc) continue;
      assert.ok(row.Arc_rules?.length, `${row.id}: says what Arc does and names no rule for it`);
      for (const id of row.Arc_rules) {
        const rule = byId.get(id);
        assert.ok(rule, `${row.id}: cites rule ${id}, which does not exist`);
        assert.equal(rule.result, 'STOP', `${row.id}: rule ${id} does not take the engagement out of the offers`);
        assert.match(
          rule.destination ?? '',
          /Merkle Arc/,
          `${row.id}: rule ${id} leaves the offers, but not towards Arc — it goes to "${rule.destination}"`,
        );
      }
    }
  });

  /* The other half of the same guard. A rule that routes to Arc and appears in
     no row is a column that under-reports where the offers stop, which is the
     failure a consultant finds out about in the room. */
  test('every rule that routes to Arc appears in the Arc column', () => {
    const arcRules = offering.exit_rules.filter((r) => r.result === 'STOP' && /Merkle Arc/.test(r.destination ?? ''));
    const cited = new Set(rows.flatMap((r) => r.Arc_rules ?? []));
    for (const rule of arcRules) {
      assert.ok(cited.has(rule.id), `rule ${rule.id} routes to Arc and no row in the pack table says so`);
    }
  });

  /* The column head of the comparison table says how each pack's storefront is
     built — "Liquid · Theme", "Custom Liquid · Hydrogen". It is prose in the
     schema, so nothing stops it drifting from what the offer can actually
     deliver: a label naming Hydrogen on an offer with no headless track sells
     something the engine does not price, and an offer that gains a headless
     track without the label loses it silently. */
  test('the build label names only a track the offer actually has', () => {
    for (const [code, offer] of Object.entries(offering.offers)) {
      const label = offer.build_label;
      assert.ok(label?.trim(), `${code}: the comparison table prints a build label and this offer has none`);
      const headless = Boolean(offer.tracks?.hydrogen);
      assert.equal(
        /hydrogen/i.test(label),
        headless,
        headless
          ? `${code}: builds headless and the label does not say so — "${label}"`
          : `${code}: the label promises Hydrogen and the offer has no headless track — "${label}"`,
      );
    }
  });

  /* Per-unit modifiers clamp to their own band, and a band set too tight
     silently cancels the per-unit price: markets once quoted four and fourteen
     identically, and nothing could see it. A second design and a fourth must
     not cost the same, so the band has to carry at least three of whatever the
     unit is. */
  test('a per-unit modifier can charge for more than one unit before its band clamps', () => {
    const perUnit = offering.modifiers.filter((m) => Object.keys(m).some((k) => /^per_\w+_weeks$/.test(k)));
    assert.ok(perUnit.length, 'no per-unit modifier found — has the mechanism been renamed?');
    for (const m of perUnit) {
      const key = Object.keys(m).find((k) => /^per_\w+_weeks$/.test(k));
      const unit = m[key];
      const units = m.effort_weeks.max / unit;
      assert.ok(units >= 3,
        `${m.id}: ${m.effort_weeks.max} weeks at ${unit} a unit clamps after ${units} — the third unit is free`);
    }
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

describe('the quote is the scope, priced one way', () => {
  const { limits } = offering.closed_scope;
  const S = offering.offers.S;
  const rate = offering.pricing.weekly_rate;

  test('every modifier is priced at the one weekly rate', () => {
    for (const m of offering.modifiers) {
      assert.equal(m.price_add.min, Math.round(m.effort_weeks.min * rate), `${m.id}: its minimum is not its weeks at the rate`);
      assert.equal(m.price_add.max, Math.round(m.effort_weeks.max * rate), `${m.id}: its maximum is not its weeks at the rate`);
      for (const k of Object.keys(m).filter((x) => /^per_\w+_weeks$/.test(x))) {
        assert.equal(m[k.replace(/_weeks$/, '_price')], Math.round(m[k] * rate), `${m.id}: ${k} is not priced at the rate`);
      }
    }
  });

  test('the Foundation band and every floor are weeks at the rate, with the pack’s hypercare and design', () => {
    /* The bands are the week's price, not numbers of their own: when the rate
       moves, a band left behind is a price the engine no longer charges. The
       design a pack promises is priced at the design day on top of its weeks. */
    const care = (days) => (days / 5) * rate * offering.pricing.hypercare_rate_share;
    const day = offering.pricing.design.day_price;
    const k1 = (n) => Math.round(n / 1000) * 1000;
    const S = offering.offers.S;
    const f = offering.pricing.design.foundation_days;
    assert.equal(S.price_band.min, k1(S.duration_weeks.min * rate + care(S.hypercare_days) + f.min * day), 'S floor');
    assert.equal(S.price_band.max, k1(S.duration_weeks.max * rate + care(S.hypercare_days) + f.max * day), 'S ceiling');
    for (const code of ['M', 'L']) {
      const o = offering.offers[code];
      const designed = classifyOffer(engagementAt(limits[code])).design.days.min;
      assert.equal(o.price_band.min, k1(o.duration_weeks.min * rate + care(o.hypercare_days) + designed * day), `${code}: its floor is its shortest engagement at the rate, with its design`);
    }
  });

  test('custom templates are priced on a Shopify theme, and a custom theme carries them', () => {
    /* A large, global set-up can keep a Shopify theme and buy the templates
       it needs one by one. On the custom theme every template is designed
       already, so the same answer adds nothing. */
    const onTheme = { ...limits.L, storefront: 'brand_only' };
    const none = classifyOffer(engagementAt(onTheme));
    const five = classifyOffer(engagementAt({ ...onTheme, custom_templates: 5 }));
    assert.equal(five.code, 'L', 'a global set-up on a Shopify theme is still an L');
    assert.deepEqual(five.addons.map((x) => `${x.gate}×${x.units}`), ['custom_templates×5']);
    const m = offering.modifiers.find((x) => x.gate === 'custom_templates');
    assert.equal(five.scope_effort_weeks.max - none.scope_effort_weeks.max, 5 * m.per_template_weeks, 'five templates, five times the weeks');
    assert.deepEqual(five.design.days, { min: none.design.days.min + 5 * m.per_template_design_days.min, max: none.design.days.max + 5 * m.per_template_design_days.max });
    const custom = classifyOffer(engagementAt({ ...limits.L, custom_templates: 5 }));
    assert.deepEqual(custom.price_band, classifyOffer(engagementAt(limits.L)).price_band, 'the custom theme designs every template already');
    const headless = classifyOffer(engagementAt({ ...limits.L, headless: true, custom_templates: 5 }));
    assert.equal(headless.scope_gates.custom_templates.active, false, 'a headless storefront has no theme to add templates to');
  });

  test('promotions: Shopify’s own discounts in every pack, a discount Function is the add-on', () => {
    /* Codes, automatic discounts, buy X get Y, free shipping and scheduled
       sales are an admin setting; a rule they cannot express is code that
       touches every order's price, and was built by the backlog unpriced. */
    const row = offering.closed_scope.rows.find((r) => r.id === 'promotions');
    assert.ok(row.S === row.M && row.M === row.L, 'the same standard capabilities in every pack');
    const at = (promotions, model) => {
      const doc = engagementAt(limits.M);
      return classifyOffer({ ...doc, promotions, ...(model ? { meta: { ...doc.meta, client: { ...doc.meta.client, business_model: model } } } : {}) });
    };
    assert.equal(at({ discount_types: ['percentage', 'bogo', 'free_shipping', 'scheduled_sale'], stacking: 'native_combinations' }).scope_gates.custom_promotions.active, false);
    assert.equal(at({ discount_types: ['volume_tiered'] }).scope_gates.custom_promotions.tier, 'standard');
    const custom = at({ discount_types: ['percentage'], stacking: 'custom_logic_function' });
    assert.equal(custom.scope_gates.custom_promotions.tier, 'advanced');
    assert.deepEqual(custom.addons.map((x) => x.gate), ['custom_promotions'], 'an M plus custom promotions');
    assert.equal(at({ discount_types: ['volume_tiered'] }, 'b2b').scope_gates.custom_promotions.active, false, 'wholesale volume pricing is B2B quantity rules');
  });

  test('AI is built into every pack; only what takes a build is the agentic commerce add-on', () => {
    /* AI is part of what the offer sells: the products in AI assistants, the
       Knowledge Base answers and Shopify's own AI tools cost a decision and a
       configuration, not a build, so every pack carries them. */
    const row = offering.closed_scope.rows.find((r) => r.id === 'ai_channels');
    assert.ok(row.S === row.M && row.M === row.L, 'the same AI in every pack');
    for (const c of ['S', 'M', 'L']) assert.match(offering.offers[c].base_scope, /AI built in/, `${c} names the AI it includes`);
    const at = (ai) => classifyOffer({ ...engagementAt(limits.S), ai });
    for (const ai of [{ sell_through_agents: true }, { knowledge_base: true }, { merchant_ai_tools: ['sidekick', 'shopify_magic'] }, { agentic_enrolment: 'per_channel' }, { crawler_policy: 'allow_all' }]) {
      assert.equal(at(ai).scope_gates.agentic_commerce.active, false, `${JSON.stringify(ai)} is in every pack`);
    }
    for (const ai of [{ crawler_policy: 'block' }, { crawler_policy: 'selective' }, { catalog_mapping_needed: true }]) {
      assert.equal(at(ai).scope_gates.agentic_commerce.tier, 'standard', JSON.stringify(ai));
    }
    const own = at({ sell_through_agents: true, own_agent_surface: 'now' });
    assert.equal(own.scope_gates.agentic_commerce.tier, 'advanced');
    assert.equal(at({ own_agent_surface: 'later' }).scope_gates.agentic_commerce.active, false, 'later is scoped, not built');
    // Every Shopify fact on the gate is dated, and the early-access part is named as such.
    const gate = offering.scope_gates.find((g) => g.id === 'agentic_commerce');
    assert.match(gate.verified.on, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(gate.condition, /early access/);
  });

  test('AI product content is priced per 1,000 SKUs, with a floor that covers setting it up', () => {
    const m = offering.modifiers.find((x) => x.gate === 'ai_content');
    const at = (sku_count, ai_enrichment) => classifyOffer({ ...engagementAt({ ...limits.M, sku_count }), catalogue: { ...engagementAt({ ...limits.M, sku_count }).catalogue, ai_enrichment } });
    const weeks = (q) => q.scope_effort_by_gate.find((g) => g.gate === 'ai_content')?.weeks.max ?? 0;
    assert.equal(at(2000, ['none']).scope_gates.ai_content.active, false, 'nothing asked, nothing priced');
    assert.equal(weeks(at(1000, ['product_descriptions'])), m.effort_weeks.min, 'a small catalogue pays the set-up floor');
    assert.equal(weeks(at(10000, ['product_descriptions', 'seo_fields'])), 10 * m.per_thousand_weeks, 'ten thousand SKUs, ten times the rate');
    assert.ok(weeks(at(20000, ['image_alt_text'])) > weeks(at(10000, ['image_alt_text'])), 'more SKUs, more weeks');
    // Shopify Magic does it product by product for free; the add-on says so.
    assert.match(offering.scope_gates.find((g) => g.id === 'ai_content').condition, /Shopify Magic/);
  });

  test('design is priced by the design day, by pack and only on the add-ons that need it', () => {
    /* A designer inside the build week would be charged on a migration as much
       as on a template set. Design is its own line: S adapts the UI to the
       brand, M adds the custom templates, L designs the custom theme. */
    const days = (code) => classifyOffer(engagementAt(limits[code])).design.days;
    assert.deepEqual(days('S'), { min: 3, max: 5 });
    assert.deepEqual(days('M'), { min: 8, max: 12 });
    assert.deepEqual(days('L'), { min: 20, max: 30 });
    assert.ok(!offering.pricing.team.some((t) => /design/i.test(t.role)), 'no designer in the build week');
    for (const gate of ['migration', 'integration', 'markets', 'store_estate', 'retail_pos', 'languages', 'seo_continuity', 'sku_complexity']) {
      for (const m of offering.modifiers.filter((x) => x.gate === gate)) assert.equal(m.design_days, undefined, `${m.id} needs no design`);
    }
    // And a further storefront design is designed, by the design.
    const two = classifyOffer(engagementAt({ ...limits.L, extra_theme_designs: 2 })).design.days;
    const one = classifyOffer(engagementAt({ ...limits.L, extra_theme_designs: 1 })).design.days;
    assert.ok(two.min > one.min && one.min > days('L').min);
  });

  test('the week the rate prices is the team the pages show', () => {
    const fte = offering.pricing.team.reduce((a, t) => a + t.fte, 0);
    assert.ok(Math.abs(fte - offering.pricing.people_per_week) < 0.01);
    for (const t of offering.pricing.team) assert.ok(t.role?.trim() && t.fte > 0, 'every role has a share of the week');
    assert.ok(offering.pricing.team.some((t) => /QA/.test(t.role)), 'QA is part of the team, so it is not sold again on top');
  });

  test('a per-unit band holds every unit its limit allows, at the dearest surcharge', () => {
    /* A band that clamps below the limit behind it gives the last units away:
       the fifth store to the tenth once cost nothing. */
    for (const m of offering.modifiers.filter((x) => x.max_units)) {
      const key = Object.keys(m).find((k) => /^per_\w+_weeks$/.test(k));
      // Tiers of one gate never apply together; a per-unit surcharge counts up
      // to three integrations, the most rule 11.7 lets through.
      const byGate = {};
      for (const s of m.per_unit_surcharge ?? []) byGate[s.gate] = Math.max(byGate[s.gate] ?? 0, s.add * (s.per_unit ? 3 : 1));
      const uplift = Object.values(byGate).reduce((a, n) => a + n, 0);
      const needed = m.max_units.value * m[key] * (1 + uplift);
      assert.ok(m.effort_weeks.max >= needed - 0.05,
        `${m.id}: ${m.max_units.value} units at the dearest surcharge need ${needed} weeks; the band stops at ${m.effort_weeks.max}`);
      assert.ok(m.max_units.why?.trim(), `${m.id}: a limit with no reason`);
    }
  });

  test('the quote is the Foundation base plus every gate at its own price, and the pack’s hypercare', () => {
    const cases = [
      ...Object.values(limits),
      { ...limits.M, stores: 2 }, { ...limits.M, languages: 5 }, { ...limits.S, migration: 'magento' },
      { ...limits.L, migration: 'sfcc', stores: 4 }, { ...limits.S, b2b: 'advanced', integrations: 2 },
    ];
    for (const lim of cases) {
      const o = classifyOffer(engagementAt(lim));
      const mods = o.modifiers.map((id) => offering.modifiers.find((m) => m.id === id));
      assert.equal(mods.length, o.scope_effort_by_gate.length, 'every active gate is priced');
      const weeks = o.scope_effort_by_gate.reduce((a, g) => ({ min: a.min + g.weeks.min, max: a.max + g.weeks.max }), { min: 0, max: 0 });
      assert.equal(o.duration_weeks.min, Math.round((S.duration_weeks.min + weeks.min) * 2) / 2);
      assert.equal(o.duration_weeks.max, Math.round((S.duration_weeks.max + weeks.max) * 2) / 2);
      // S's band carries S's own hypercare; the named pack carries its own.
      const care = (days) => (days / 5) * rate * offering.pricing.hypercare_rate_share;
      const base = { min: S.price_band.min - care(S.hypercare_days), max: S.price_band.max - care(S.hypercare_days) };
      // Design past the Foundation's own brand adaptation, at the design day.
      const f = offering.pricing.design.foundation_days;
      const designed = { min: (o.design.days.min - f.min) * offering.pricing.design.day_price, max: (o.design.days.max - f.max) * offering.pricing.design.day_price };
      assert.equal(o.hypercare.days, offering.offers[o.code].hypercare_days);
      assert.equal(o.price_band.min, Math.round((base.min + weeks.min * rate + designed.min + care(o.hypercare.days)) / 1000) * 1000,
        `${JSON.stringify(lim)}: the floor is not the base plus the gates and the hypercare`);
      assert.equal(o.price_band.max, Math.round((base.max + weeks.max * rate + designed.max + care(o.hypercare.days)) / 1000) * 1000,
        `${JSON.stringify(lim)}: the ceiling is not the base plus the gates and the hypercare`);
    }
  });

  test('more scope never costs less, and never takes less time', () => {
    /* Every dimension a client can grow, stepped up one notch at a time from
       random engagements, checked on all four numbers. The test it replaced
       looked at the maximums only and at nine gates of seventeen. */
    const STEPS = {
      markets: [1, 2, 3, 4, 6], multi_currency: [false, true], languages: [1, 3, 4, 5, 6], integrations: [0, 1, 2, 3],
      storefront: ['brand_only', 'key_screens', 'all_templates'], sku_count: [400, 2000, 6000, 20000],
      migration: [null, 'woocommerce', 'shopware', 'magento'], retail_locations: [0, 1, 3], stores: [1, 2, 3, 5],
      checkout: [null, 'thank_you_order_status_blocks', 'checkout_step_blocks_or_fields'], analytics_custom_events: [false, true],
      b2b: [false, 'standard', 'advanced'], extra_theme_designs: [0, 1, 2], headless: [false, true],
      apps: [0, 3, 5, 6, 8, 10, 14], hypercare_days: [0, 5, 10, 15, 30],
    };
    let seed = 7;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const numbers = (o) => [o.price_band.min, o.price_band.max, o.duration_weeks.min, o.duration_weeks.max];
    for (let i = 0; i < 1500; i++) {
      const lim = Object.fromEntries(Object.entries(STEPS).map(([k, v]) => [k, pick(v)]));
      lim.extra_theme_designs = Math.min(lim.extra_theme_designs, lim.stores - 1);
      const dims = Object.keys(STEPS).filter((k) => STEPS[k].indexOf(lim[k]) < STEPS[k].length - 1);
      const d = pick(dims);
      const next = { ...lim, [d]: STEPS[d][STEPS[d].indexOf(lim[d]) + 1] };
      next.extra_theme_designs = Math.min(next.extra_theme_designs, next.stores - 1);
      const doc = (l) => ({ ...engagementAt(l), shopify: { apps_at_launch: l.apps }, delivery: { hypercare_days: l.hypercare_days } });
      const a = numbers(classifyOffer(doc(lim)));
      const b = numbers(classifyOffer(doc(next)));
      a.forEach((n, j) => assert.ok(b[j] >= n, `${d} ${lim[d]} → ${next[d]} lowers ${['the floor', 'the ceiling', 'the minimum weeks', 'the maximum weeks'][j]}: ${n} → ${b[j]}`));
    }
  });
});
