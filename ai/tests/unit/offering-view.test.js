/**
 * The offering page: derived from the engine's own data, and Merkle pricing
 * removed on the server for anyone who may not see it.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { classifyOffer } from '../../engine/classify.js';
import { offeringView } from '../../shared/offering-view.js';
import { offering } from '../../schema/index.js';
import { engagementAt } from '../../engine/promise.js';

describe('offering view', () => {
  /* This guards the mechanism, not who may read it: with pricing off, not one
     field and not one figure leaves the server. The offering pages now pass
     pricing on for every signed-in consultant, but the deck and every
     client-facing path still build their view with it off, and this is what
     stops a band reaching them. */
  test('with pricing off, no field and no figure leaves the server', () => {
    const view = offeringView();
    assert.equal(view.pricing, false);
    assert.deepEqual(view.offers.map((o) => o.code), ['S', 'M', 'L']);
    for (const o of view.offers) {
      assert.ok(o.base_scope.length && o.duration_weeks.min && o.approach.storefront && o.approach.plan, o.code);
    }
    const text = JSON.stringify(view);
    assert.doesNotMatch(text, /price_band|price_add|internal_note/, 'no price field leaves the server');
    for (const band of Object.values(offering.offers).map((o) => o.price_band)) {
      assert.ok(!text.includes(String(band.min)), `the figure ${band.min} must not appear in a consultant's view`);
    }
  });

  test('and no price written into prose either, which is how one did leave', () => {
    /*
     * The structured fields were gated from the first day and the test above
     * has held them. A price typed into a row's note is not a field, so it
     * walked straight past both: "a further market is three quarters of a week
     * and CHF 8k" shipped inside closed_scope to every signed-in reader,
     * Merkle or not. Stripping it in the component would have been theatre —
     * the loader had already serialised it into the page.
     *
     * So the assertion is on the payload, not on the fields: nothing that
     * leaves this function for a non-owner may name the currency at all.
     * Shopify's own ceilings are numbers too (2,048 variants, 20,000,000
     * redirects) and must keep working, which is why this anchors on the
     * currency rather than on digits.
     */
    const text = JSON.stringify(offeringView());
    const money = new RegExp(`${offering.currency}\\s?[\\d.,]`, 'i');
    const offender = (text.match(new RegExp(`.{0,80}${offering.currency}.{0,80}`, 'i')) ?? [])[0];
    assert.doesNotMatch(text, money, `a consultant's view names ${offering.currency}: …${offender ?? ''}…`);
  });

  test('an owner sees the price bands, the per-gate additions and the internal notes', () => {
    const view = offeringView({ pricing: true });
    assert.equal(view.offers.find((o) => o.code === 'M').price_band.min, offering.offers.M.price_band.min);
    assert.ok(view.gates.some((g) => g.price_add), 'the gates carry their price additions');
    assert.ok(Object.values(view.exits).flat().some((r) => r.internal_note), 'and the internal notes');
  });

  test('it says what the engine does: every rule, every gate, every route', () => {
    const view = offeringView();
    const rules = [...view.exits.beyond_offers, ...view.exits.flags, ...view.exits.commercial].map((r) => r.id).sort();
    assert.deepEqual(rules, offering.exit_rules.map((r) => r.id).sort());
    assert.equal(view.gates.length, offering.scope_gates.length);
    assert.deepEqual(view.routes.map((r) => r.id), ['larger_engagement', 'arc']);
    assert.ok(view.plan_gates.every((g) => /^https:\/\//.test(g.docs)), 'every plan gate cites its Shopify page');
  });
});

describe('the comparison table and the add-on catalogue the page reads', () => {
  /*
   * Two lists, and the split between them is the whole point. The table holds
   * only what a pack actually includes something of, so every cell is a
   * quantity a consultant can quote. Everything a client can buy on top —
   * including the three capabilities no pack includes at all — is the add-on
   * catalogue, where a scope description and a cost belong.
   */
  const view = offeringView();
  const priced = offeringView({ pricing: true });

  test('every row carries its group and the Shopify ceiling behind it', () => {
    assert.ok(view.closed_scope_groups.length, 'the groups are published in reading order');
    for (const row of view.closed_scope) {
      assert.ok(view.closed_scope_groups.includes(row.group), `${row.id}: group "${row.group}" is not declared`);
      assert.ok(Object.hasOwn(row, 'shopify_limit'), `${row.id}: no platform ceiling field at all`);
      assert.ok(row.values.S && row.values.M && row.values.L, `${row.id}: a pack with nothing said for it`);
    }
  });

  test('nothing a pack includes none of is left in the table', () => {
    const dashed = view.closed_scope.filter((r) => Object.values(r.values).every((v) => v === '—'));
    assert.deepEqual(dashed.map((r) => r.id), [], 'rows that are add-on services in disguise');
    // And the three that were: they are in the catalogue instead.
    const gates = view.addons.map((a) => a.gate);
    for (const id of ['b2b', 'retail_pos', 'subscriptions']) {
      assert.ok(gates.includes(id), `${id} is in no pack and is not in the add-on catalogue either`);
      assert.ok(!view.closed_scope.some((r) => r.gate === id), `${id} is still a comparison row`);
    }
  });

  test('every add-on names its scope, its packs and its weeks — as numbers, not as a sentence', () => {
    for (const a of view.addons) {
      assert.ok(a.description?.trim(), `${a.id}: an add-on service with no scope description`);
      assert.ok(a.available_in.length, `${a.id}: nobody can buy it`);
      // Hypercare runs after go-live: it is bought in days, not build weeks.
      if (a.gate === null) { assert.ok(a.per_unit?.days > 0, `${a.id}: an add-on with neither weeks nor days`); continue; }
      assert.equal(typeof a.weeks.max, 'number', `${a.id}: weeks are a string, so the page cannot choose how to print them`);
      assert.ok(a.weeks.max >= a.weeks.min && a.weeks.min > 0, `${a.id}: ${a.weeks.min}–${a.weeks.max} weeks`);
      for (const t of a.tiers ?? []) {
        assert.ok(t.label?.trim() && t.description?.trim(), `${a.id}: a tier with no label or no description`);
        assert.ok(t.weeks.max >= t.weeks.min, `${a.id} / ${t.label}: weeks run backwards`);
      }
    }
  });

  test('the weeks the page prints span every tier the engine prices', () => {
    const migration = view.addons.find((a) => a.gate === 'migration');
    assert.deepEqual(migration.tiers.map((t) => t.label), ['light', 'medium', 'heavy']);
    assert.equal(migration.weeks.min, Math.min(...migration.tiers.map((t) => t.weeks.min)));
    assert.equal(migration.weeks.max, Math.max(...migration.tiers.map((t) => t.weeks.max)));
  });

  test('an add-on costs nothing a consultant can see, and everything an owner can', () => {
    assert.ok(view.addons.every((a) => a.price === undefined && a.per_unit?.price === undefined && (a.tiers ?? []).every((t) => t.price === undefined)),
      'a price band reached a caller who may not see Merkle pricing');
    assert.ok(priced.addons.every((a) => (a.price?.min ?? a.per_unit?.price) > 0), 'an owner sees what every add-on costs');
    const hypercare = priced.addons.find((a) => a.id === 'hypercare');
    assert.equal(hypercare.per_unit.price, offering.pricing.weekly_rate * offering.pricing.hypercare_rate_share, 'a week of hypercare is half a build week');
    const b2b = priced.addons.find((a) => a.gate === 'b2b');
    const mods = offering.modifiers.filter((m) => m.gate === 'b2b');
    assert.equal(b2b.price.min, Math.min(...mods.map((m) => m.price_add.min)), 'the add-on quotes a price the engine does not');
    assert.equal(b2b.weeks.max, Math.max(...mods.map((m) => m.effort_weeks.max)));
  });
});

describe('a gate priced by tier shows every tier', () => {
  // Keyed by gate id, a Map kept only the last modifier. Migration has three
  // now, so every page printed the heavy figure — five to seven weeks and
  // CHF 38–55k — for a WooCommerce store the engine prices at one to two. The
  // number looked plausible, which is why nothing caught it.
  const view = offeringView({ pricing: true });
  const migration = view.gates.find((g) => g.id === 'migration');

  test('the headline figure spans the cheapest tier to the dearest', () => {
    assert.ok(migration.tiers, 'migration is priced by tier');
    const lows = migration.tiers.map((t) => t.effort_weeks.min);
    const highs = migration.tiers.map((t) => t.effort_weeks.max);
    assert.equal(migration.effort_weeks.min, Math.min(...lows));
    assert.equal(migration.effort_weeks.max, Math.max(...highs));
    assert.ok(migration.effort_weeks.max > migration.effort_weeks.min * 2,
      'a span that wide is the reason the tiers have to be shown');
  });

  test('every tier is named, described and costed', () => {
    assert.deepEqual(migration.tiers.map((t) => t.tier), ['light', 'medium', 'heavy']);
    for (const t of migration.tiers) {
      assert.ok(t.adds?.trim(), `${t.tier}: says which platforms it is`);
      assert.ok(t.effort_weeks.min > 0 && t.effort_weeks.max >= t.effort_weeks.min, `${t.tier}: has effort`);
      assert.ok(t.price_add.min > 0, `${t.tier}: has a price`);
    }
    // And they climb, or the tiers are not tiers.
    const maxes = migration.tiers.map((t) => t.effort_weeks.max);
    assert.deepEqual(maxes, [...maxes].sort((a, b) => a - b));
  });

  test('a gate with one modifier still reports it directly', () => {
    const integration = view.gates.find((g) => g.id === 'integration');
    assert.equal(integration.modifier, '+Integration');
    assert.equal(integration.tiers, undefined);
    assert.ok(integration.adds?.trim());
  });

  test('every gate carries an effort and a price — none is silently free', () => {
    // multi_currency was the one gate of seven with no modifier at all, so it
    // could move an engagement from S to M without adding a franc to the model.
    for (const g of view.gates) {
      assert.ok(g.effort_weeks, `${g.id}: no effort`);
      assert.ok(g.price_add, `${g.id}: no price`);
    }
  });

  test('the bands a consultant reads are in Swiss francs', () => {
    for (const o of view.offers) assert.equal(o.currency, 'CHF');
  });
});

describe('the page explains the rule the engine actually follows', () => {
  // The offering was recalibrated and the classification list was not. The page
  // kept saying "four questions, it stops at the first yes" while the engine
  // asked five — and the missing one was the one that decides whether an
  // engagement is an M or an L. A tool whose whole claim is that the
  // commercials are code cannot describe code it no longer runs.
  //
  // Pinned by behaviour rather than by wording: each published rule is given an
  // engagement that should land on it, and the engine has to agree.
  const view = offeringView({ pricing: true });
  const base = () => ({ schema_version: '1.0.0', meta: { client: { name: 'X', slug: 'x' }, source: 'questionnaire' } });
  const markets = (...codes) => ({ markets: { list: codes.map((code) => ({ code, currency: 'CHF', price_strategy: 'base_currency' })) } });

  /** One engagement per published rule, in the order the page prints them. */
  const CASES = [
    ['a headless storefront', { ...base(), design: { headless_required: true, headless: { framework: 'hydrogen', content_source: 'shopify_metaobjects' } } }, 'L'],
    ['a quote from the Flagship floor', {
      ...base(),
      ...markets('CH', 'DE', 'FR'),
      catalogue: { sku_count: 20000, variant_options_max: 3 },
      migration: { source_platform: 'magento' },
      b2b: { enabled: true },
      integrations: [{ category: 'erp', connector: 'custom' }, { category: 'pim', connector: 'custom' }],
    }, 'L'],
    ['a quote from the Scale floor', { ...base(), migration: { source_platform: 'magento' } }, 'M'],
    ['a Foundation with add-ons', { ...base(), ...markets('CH', 'DE') }, 'S'],
    ['a further store below the Scale floor', {
      ...base(),
      ...markets('CH', 'DE'),
      markets: { ...markets('CH', 'DE').markets, topology: { recommendation: 'expansion_stores', separate_store_markets: ['DE'], additional_channel_stores: [] } },
    }, 'M'],
  ];

  test('there is one published rule per branch the engine has', () => {
    assert.equal(view.classification.length, CASES.length,
      'a branch with no published rule is a rule a consultant cannot check');
  });

  test('each published rule, in order, lands where it says it lands', () => {
    view.classification.forEach((rule, i) => {
      const [label, doc, expected] = CASES[i];
      assert.equal(rule.offer, expected, `rule ${rule.order} (${label}) claims ${rule.offer}`);
      assert.equal(classifyOffer(doc).code, expected, `rule ${rule.order} (${label}): the engine disagrees`);
    });
  });

  test('every rule reads as a sentence, not as the expression behind it', () => {
    for (const c of view.classification) {
      assert.ok(c.plain?.trim(), `rule ${c.order}: no plain wording`);
      assert.ok(!/[_{}]|>=|==|\.\w+\./.test(c.plain),
        `rule ${c.order}: "${c.plain}" is the engine talking to itself`);
    }
  });

  test('the floor rules name the pack whose floor they test', () => {
    // "Reaches the floor" is only checkable if the page says which one.
    for (const code of ['L', 'M']) {
      const rule = view.classification.find((c) => c.offer === code && /floor/.test(c.plain) && !/Below/.test(c.plain));
      assert.ok(rule, `the rule that names an engagement ${code} by its budget is published`);
      assert.match(rule.plain, new RegExp(offering.offers[code].name));
    }
  });
});

describe('the packs as packaging for a conversation', () => {
  const view = offeringView();
  const priced = offeringView({ pricing: true });

  test('every page states it is a first estimate, in the offering’s own words', () => {
    assert.equal(view.estimate, offering.estimate.line);
    assert.match(view.estimate, /first estimate/i);
    assert.match(view.estimate, /contingency/);
    assert.match(view.estimate, /Design and QA testing/);
    assert.equal(view.after_launch.title, offering.after_launch.title);
    assert.match(view.after_launch.line, /price is kept open/);
  });

  test('a per-unit add-on says what one more unit adds, and its price only to pricing callers', () => {
    const markets = view.addons.find((a) => a.gate === 'markets');
    const mod = offering.modifiers.find((m) => m.id === '+Markets');
    assert.deepEqual(markets.per_unit, { noun: 'market', weeks: mod.per_market_weeks, from: true });
    assert.equal(priced.addons.find((a) => a.gate === 'markets').per_unit.price, mod.per_market_price);
    assert.equal(view.addons.find((a) => a.gate === 'integration').per_unit.from, false, 'nothing raises an integration');
    assert.equal(view.addons.find((a) => a.gate === 'migration').per_unit, undefined, 'a tiered add-on is not per unit');
  });

  test('L shows the replatform figure the engine itself quotes', () => {
    const quoted = classifyOffer(engagementAt({ ...offering.closed_scope.limits.L, migration: 'sfcc' }));
    const l = priced.offers.find((o) => o.code === 'L');
    assert.deepEqual(l.with_replatform.weeks, quoted.duration_weeks);
    assert.equal(l.with_replatform.price_band.max, quoted.price_band.max);
    assert.equal(view.offers.find((o) => o.code === 'L').with_replatform.price_band, undefined, 'and no price without pricing');
    assert.ok(!view.offers.filter((o) => o.code !== 'L').some((o) => o.with_replatform));
  });

  test('every pack says what a week buys in people', () => {
    for (const o of view.offers) assert.equal(o.team, offering.pricing.people_per_week);
  });
});
