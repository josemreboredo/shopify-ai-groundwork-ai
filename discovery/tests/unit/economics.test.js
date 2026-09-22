/**
 * Run cost in the client's own numbers: computed from their answers, or carrying
 * the Shopify page that publishes the rate, or listed as unknown. Never invented.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { runCost, basis, RATES } from '../../agents/discovery/economics.js';
import { buildDeckXml } from '../../agents/discovery-deck/build.js';

const fixture = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'fixtures', 'engagements', 'acme-watches.json'), 'utf8'));

describe('run cost', () => {
  test('the basis is the client’s own arithmetic, and says which answers it came from', () => {
    const b = basis(fixture);
    assert.equal(b.orders_per_month, 400);
    assert.equal(b.monthly_revenue, 120000);
    assert.equal(b.average_order_value, 300, 'revenue ÷ orders, nothing else');
    assert.equal(b.currency, 'EUR');
    assert.deepEqual(b.from, ['Q0.2.6 orders per month', 'Q0.2.1 monthly revenue']);
    assert.deepEqual(b.missing, []);
  });

  test('a documented rate becomes a figure per order and per month, with its source', () => {
    const cost = runCost(fixture);
    const duties = cost.per_order.find((f) => /Duties/.test(f.item));
    assert.ok(duties, 'the engagement collects duties at checkout, so the fee applies');
    assert.equal(duties.pct, RATES.duties_with_shopify_payments.pct);
    assert.equal(duties.per_order, 2.55, '0.85% of a €300 basket');
    assert.equal(duties.per_month, 1020, '0.85% of €120,000');
    assert.match(duties.source, /^https:\/\/help\.shopify\.com\//);
  });

  test('only the rates this engagement actually triggers', () => {
    const noDuties = { ...fixture, markets: { ...fixture.markets, duties_ddp: false } };
    assert.deepEqual(runCost(noDuties).per_order, [], 'no duties at checkout, no duties fee');
    const managed = {
      ...fixture,
      markets: { ...fixture.markets, duties_ddp: false, topology: { recommendation: 'single_store_managed_markets', confidence: 'high' } },
    };
    const fees = runCost(managed).per_order.map((f) => f.pct);
    assert.deepEqual(fees, [3.25, 1.5], 'Plus rate plus the conversion fee, both on top of processing');
  });

  test('app subscriptions are totalled per currency and never converted', () => {
    const cost = runCost(fixture);
    assert.equal(cost.totals.subscriptions_per_month.USD, 370);
    assert.ok(cost.currency_note, 'app prices in USD against EUR revenue must be flagged, not silently converted');
    assert.match(cost.currency_note, /no sourced exchange rate/);
  });

  test('the Shopify plan price is always listed as not known, with where to look', () => {
    const plan = runCost(fixture).unknown.find((u) => /plan price/i.test(u.item));
    assert.ok(plan, 'a plan price quoted from memory is how a deck loses its credibility');
    assert.match(plan.where_to_check, /shopify\.com\/pricing/);
    assert.doesNotMatch(JSON.stringify(runCost(fixture)), /\$?\d+\s*(\/|per )\s*month.*plan/i);
  });

  test('missing answers become named unknowns, not zeros', () => {
    const blind = { markets: {}, approach: { app_shortlist: [] } };
    const cost = runCost(blind);
    assert.equal(cost.basis.average_order_value, undefined, 'no invented basket');
    assert.equal(cost.per_order.length, 0);
    assert.ok(cost.unknown.some((u) => /orders per month/.test(u.item)));
    assert.ok(cost.unknown.some((u) => /monthly revenue/.test(u.item)));
  });

  test('the deck receives the arithmetic, the sources and the gaps', () => {
    const { xml } = buildDeckXml(fixture);
    assert.match(xml, /<run-cost>/);
    assert.match(xml, /average-order-value="300"/);
    assert.match(xml, /<subscriptions-total currency="USD" per-month="370"\/>/);
    assert.match(xml, /<per-order-fee[^>]*per-month="1020"/);
    assert.match(xml, /<not-known item="Shopify plan price"/);
  });
});
