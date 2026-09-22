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
