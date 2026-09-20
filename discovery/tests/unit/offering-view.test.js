/**
 * The offering page: derived from the engine's own data, and Merkle pricing
 * removed on the server for anyone who may not see it.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { offeringView } from '../../service/offering-view.js';
import { offering } from '../../schema/index.js';

describe('offering view', () => {
  test('a consultant sees scope, routes, durations and the Shopify approach — and no price at all', () => {
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
    assert.deepEqual(view.routes.map((r) => r.id), ['larger_engagement', 'no_bid']);
    assert.ok(view.plan_gates.every((g) => /^https:\/\//.test(g.docs)), 'every plan gate cites its Shopify page');
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
    const b2b = view.gates.find((g) => g.id === 'b2b');
    assert.equal(b2b.modifier, '+B2B');
    assert.equal(b2b.tiers, undefined);
    assert.ok(b2b.adds?.trim());
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
