/**
 * The page that explains how an estimate is built reads the same data the
 * engine prices with, and works its examples through the engine itself — so
 * the explanation cannot drift from the quote it explains.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { offering } from '../../schema/index.js';
import { classifyOffer } from '../../engine/classify.js';
import { engagementAt } from '../../engine/promise.js';
import { estimationView } from '../../shared/estimation-view.js';

describe('how we estimate', () => {
  const view = estimationView({ pricing: true });
  const hidden = estimationView();

  test('the team is the offering’s team, and its days add up to the week', () => {
    assert.deepEqual(view.team.map((t) => [t.role, t.fte]), offering.pricing.team.map((t) => [t.role, t.fte]));
    const days = view.team.reduce((a, t) => a + t.days_per_week, 0);
    assert.ok(Math.abs(days - view.person_days) < 0.01, `${days} person-days against ${view.person_days}`);
    const share = view.team.reduce((a, t) => a + t.share, 0);
    assert.ok(Math.abs(share - 1) < 0.01, 'the shares make one week');
    assert.equal(view.weekly_cost, offering.pricing.weekly_rate);
  });

  test('every worked example is the engine’s own quote, and its lines add up to it', () => {
    const limits = offering.closed_scope.limits;
    const cases = [limits.S, limits.M, limits.L, { ...limits.M, stores: 2 }, { ...limits.L, headless: true }];
    view.examples.forEach((x, i) => {
      const quote = classifyOffer(engagementAt(cases[i]));
      assert.equal(x.code, quote.code);
      assert.deepEqual(x.price_band, { min: quote.price_band.min, max: quote.price_band.max });
      assert.deepEqual(x.weeks, quote.duration_weeks);
      for (const k of ['min', 'max']) {
        const sum = x.lines.reduce((a, l) => a + l.price[k], 0);
        assert.ok(Math.abs(sum - x.price_band[k]) <= 500, `${x.title}: the lines come to ${sum}, the quote to ${x.price_band[k]}`);
      }
    });
    assert.deepEqual(view.examples[3].addons, ['Each further Shopify store'], 'the re-estimate example is the same pack with a store more');
  });

  test('without pricing, no franc leaves the server', () => {
    const text = JSON.stringify(hidden);
    assert.equal(hidden.weekly_cost, undefined);
    assert.doesNotMatch(text, /"price(_band)?"/, 'no price field');
    assert.ok(!text.includes(String(offering.pricing.weekly_rate)), 'and not the weekly cost by another route');
    assert.ok(hidden.team.length && hidden.examples.every((x) => x.lines.length), 'the team and the weeks are still there');
  });
});
