/**
 * Market topology (docs/market-topology-audit.md): the engine derives the store
 * shape from business facts and always returns a recommendation. The questionnaire
 * asks about the client's business; it never asks the client to choose the
 * architecture.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateTopology, managedMarketsVerdict, excludedFromBuild } from '../../agents/discovery/topology.js';
import { evaluateExits } from '../../agents/discovery/exits.js';
import { planRequirements } from '../../agents/discovery/plan.js';
import { approachQualityErrors } from '../../agents/discovery/approach.js';
import { deckErrors } from '../../service/deck-template.js';

/** A minimal engagement: one selling entity, markets given row by row. */
const engagement = ({ markets, entities = ['ACME AG'], hq = 'CH', b2b, shipping, appetite, vat = [], plan = 'basic', payments, catalogue, post_purchase, business, strategy } = {}) => ({
  meta: { client: { hq_country: hq, legal_entities: entities, business_model: b2b ? 'hybrid' : 'dtc' } },
  markets: {
    list: markets,
    primary_markets: [markets[0]?.code].filter(Boolean),
    vat_countries: vat,
    ...(appetite ? { tax_registration_appetite: appetite } : {}),
    ...(strategy ? { strategy } : {}),
  },
  shopify: { target_plan: plan },
  ...(payments ? { payments } : {}),
  ...(catalogue ? { catalogue } : {}),
  ...(post_purchase ? { post_purchase } : {}),
  ...(business ? { business } : {}),
  ...(b2b ? { b2b } : {}),
  ...(shipping ? { shipping } : {}),
});

const stated = (code, extra = {}) => ({ code, currency: 'EUR', selling_entity: 'ACME AG', assortment: 'same', run_by: 'central', ...extra });
const unknown = (code) => ({ code, currency: 'EUR' });

describe('market topology', () => {
  test('1 · a single market produces no topology decision at all', () => {
    assert.equal(evaluateTopology(engagement({ markets: [stated('CH')] })), null);
    assert.equal(evaluateTopology({ markets: {} }), null);
  });

  test('2 · three markets, one selling entity, one range, one team, all stated → one store with Markets, high confidence', () => {
    const t = evaluateTopology(engagement({ markets: [stated('CH'), stated('DE'), stated('AT')], appetite: 'own_registrations', shipping: { fulfilment_countries: ['CH'] } }));
    assert.equal(t.recommendation, 'single_store_markets');
    assert.equal(t.confidence, 'high');
    assert.deepEqual(t.triggers, [], 'no business fact separates the markets');
    assert.ok(t.rejected.some((r) => r.option === 'expansion_stores' && /Shopify Plus/.test(r.reason)), 'expansion stores are rejected with the reason');
    assert.ok(t.rejected.some((r) => r.option === 'single_store_managed_markets' && /Not eligible/.test(r.reason)), 'a Swiss business cannot use Managed Markets');
  });

  test('3 · five legal entities with no per-market mapping → expansion stores, to validate, and exit rule 11.23 fires', () => {
    const doc = engagement({
      markets: [unknown('CH'), unknown('DE'), unknown('AT')],
      entities: ['ACME AG', 'ACME GmbH', 'ACME France SAS', 'ACME Italia Srl', 'ACME Nordics AB'],
    });
    const t = evaluateTopology(doc);
    assert.ok(['expansion_stores', 'hybrid'].includes(t.recommendation), t.recommendation);
    assert.equal(t.confidence, 'to_validate');
    assert.ok(t.triggers.some((x) => x.criterion === 'legal_entity_per_market' && /no per-market mapping/.test(x.evidence)));

    doc.markets.topology = t;
    const exits = evaluateExits(doc, []);
    const flag = exits.items.find((i) => i.rule_id === '11.23');
    assert.ok(flag, 'the workshop flag fires on missing facts');
    assert.equal(flag.result, 'FLAG');
    assert.equal(flag.resolution.owner, 'Lead Consultant');
    assert.match(flag.evidence, /5 legal entities recorded/);

    assert.ok(planRequirements(doc).some((r) => r.feature === 'expansion stores' && r.plan === 'plus'),
      'the derived topology, not the client preference, is what asks for Plus');
  });

  test('4 · mainland China alongside other markets → hybrid, and China stays out of the build', () => {
    const t = evaluateTopology(engagement({ markets: [stated('CH'), stated('DE'), { code: 'CN', currency: 'CNY' }] }));
    assert.equal(t.recommendation, 'hybrid');
    assert.deepEqual(t.separate_store_markets, ['CN']);
    assert.ok(t.triggers.some((x) => x.criterion === 'market_specific_regulation' && /ICP filing/.test(x.evidence)));
    assert.deepEqual(excludedFromBuild(engagement({ markets: [stated('CH'), { code: 'CN' }] })), ['CN']);
  });

  test('5 · a wholesale operation with its own team → hybrid', () => {
    const t = evaluateTopology(engagement({
      markets: [stated('CH'), stated('DE')],
      b2b: { enabled: true, own_operation: true },
    }));
    assert.equal(t.recommendation, 'hybrid');
    assert.ok(t.triggers.some((x) => x.criterion === 'b2b_own_operation'));
  });

  test('6 · an engagement that meets every Managed Markets condition sees it as a live option, with the cost on its own numbers', () => {
    const base = {
      markets: [stated('US', { currency: 'USD' }), stated('CA', { currency: 'CAD' }), stated('GB', { currency: 'GBP' })],
      hq: 'US', plan: 'plus', payments: { providers: ['Shopify Payments'] },
      shipping: { fulfilment_countries: ['US'] },
      post_purchase: { orders_per_month: 4000 },
      business: { revenue_monthly: { min: 1800000, max: 2200000, currency: 'USD' } },
    };
    const kept = evaluateTopology(engagement({ ...base, appetite: 'own_registrations' }));
    assert.equal(kept.managed_markets.status, 'rejected_on_economics');
    assert.ok(kept.managed_markets.conditions.every((c) => c.met), 'every documented condition is met');
    assert.ok(kept.managed_markets.conditions.every((c) => /^https:\/\/help\.shopify\.com\//.test(c.source)), 'each condition cites its Shopify page');
    const cost = kept.managed_markets.cost_signal;
    assert.equal(cost.orders_per_month, 4000);
    assert.equal(cost.average_order_value, 500);
    assert.equal(cost.fee_pct, 4.75, '3.25% on Plus plus 1.5% FX');
    assert.equal(cost.per_order, 23.75);
    assert.equal(cost.per_month, 95000);
    assert.match(cost.basis, /on top of Shopify Payments processing/);

    const outsourced = evaluateTopology(engagement({ ...base, appetite: 'prefer_partner' }));
    assert.equal(outsourced.recommendation, 'single_store_managed_markets');
    assert.equal(outsourced.managed_markets.status, 'eligible');
  });

  test('6b · ineligibility is reported with the failing condition, never omitted', () => {
    const verdict = managedMarketsVerdict(engagement({ markets: [stated('CH')], hq: 'CH', b2b: { enabled: true } }));
    assert.equal(verdict.status, 'not_eligible');
    const failing = verdict.conditions.filter((c) => !c.met).map((c) => c.condition);
    assert.ok(failing.some((c) => /continental United States/.test(c)));
    assert.ok(failing.some((c) => /B2B orders aren't supported/.test(c)));
    assert.equal(verdict.cost_signal, undefined, 'no cost signal for an option that cannot be bought');
  });

  test('7 · the 80% case: every topology question unanswered still produces a recommendation, with its assumptions and what to chase first', () => {
    const doc = engagement({ markets: [unknown('CH'), unknown('DE'), unknown('AT')], vat: [] });
    const t = evaluateTopology(doc);

    assert.ok(t.recommendation, 'a discovery that produces no recommendation has failed at its job');
    assert.equal(t.recommendation, 'single_store_markets');
    assert.equal(t.confidence, 'to_validate');

    assert.ok(t.assumptions.length >= 4, 'every unknown it assumed its way past is listed');
    for (const a of t.assumptions) {
      assert.ok(a.about && a.assumed && a.impact_if_wrong, `assumption is incomplete: ${JSON.stringify(a)}`);
    }
    assert.ok(t.assumptions.some((a) => /invoices the customer/.test(a.about)));
    assert.ok(t.assumptions.some((a) => /App requirements/.test(a.about)), 'the criterion the questionnaire cannot capture is stated as an assumption, never fired as fact');

    assert.ok(t.open_inputs.length >= 4);
    assert.equal(t.open_inputs[0].swing, 'high', 'ranked by how much they would change the outcome');
    assert.ok(t.open_inputs.every((o) => o.question_id && o.why_it_matters));
    const swings = t.open_inputs.map((o) => o.swing);
    assert.deepEqual(swings, [...swings].sort((a, b) => ({ high: 0, medium: 1, low: 2 })[a] - ({ high: 0, medium: 1, low: 2 })[b]));

    assert.ok(t.rejected.length === 3, 'every option not chosen is explained');
    doc.markets.topology = t;
    assert.ok(evaluateExits(doc, []).items.some((i) => i.rule_id === '11.23'), 'the flag asks for the workshop');
  });

  test('8 · a stated preference never overrides the evidence; the disagreement is recorded for the deck to argue', () => {
    const t = evaluateTopology(engagement({
      markets: [stated('CH'), stated('DE'), stated('AT')],
      appetite: 'own_registrations',
      shipping: { fulfilment_countries: ['CH'] },
      strategy: 'expansion_stores',
    }));
    assert.equal(t.recommendation, 'single_store_markets', 'the recommendation does not move');
    assert.equal(t.stated_preference, 'expansion_stores');
    assert.equal(t.disagreement.stated, 'expansion_stores');
    assert.equal(t.disagreement.computed, 'single_store_markets');
    assert.match(t.disagreement.why_computed, /one selling entity|No business fact/);
  });

  test('the approach must decide market topology on a multi-market engagement, and argue it properly', () => {
    const doc = engagement({ markets: [stated('CH'), stated('DE')], appetite: 'own_registrations' });
    doc.markets.topology = evaluateTopology(doc);
    const payload = {
      capability_map: [],
      architecture_decisions: [
        { topic: 'Storefront', question: 'Theme or headless?', options: [{ option: 'Horizon theme' }, { option: 'Hydrogen' }], decision: 'Horizon', rationale: 'Fits the scope', sources: ['https://help.shopify.com/en/manual/online-store/themes'], question_ids: ['Q9.2.1'] },
      ],
      non_functional: [], risk_register: [], integration_architecture: [], app_shortlist: [],
    };
    const missing = approachQualityErrors(payload, doc);
    assert.ok(missing.some((e) => /add "Market topology"/.test(e)), missing.join(' | '));

    payload.architecture_decisions.unshift({
      topic: 'Market topology',
      question: 'One store or several?',
      options: [{ option: 'One store with Shopify Markets' }, { option: 'Expansion stores' }, { option: 'Hybrid' }],
      decision: 'One store with Shopify Markets for CH and DE',
      rationale: 'The client stated one selling entity and the engine derived one range and one team; Managed Markets is not eligible for a Swiss business.',
      sources: ['https://help.shopify.com/en/manual/markets'],
      question_ids: ['Q3.1.1'],
    });
    const thin = approachQualityErrors(payload, doc);
    assert.ok(thin.some((e) => /why_not/.test(e)), 'options not taken must carry the reason');
    assert.ok(thin.some((e) => /impact\.technical/.test(e)) && thin.some((e) => /impact\.customer/.test(e)), 'all four impact lenses are required');

    payload.architecture_decisions[0].why_not = [{ option: 'Expansion stores', reason: 'Nothing separates the markets' }];
    payload.architecture_decisions[0].impact = { technical: 'One store.', project: 'One build.', merchant: 'One admin.', customer: 'Local currency.' };
    const good = approachQualityErrors(payload, doc);
    assert.ok(!good.some((e) => /Market topology/.test(e)), good.filter((e) => /Market topology/.test(e)).join(' | '));
  });

  test('a multi-market deck without the topology slides is rejected', () => {
    const doc = engagement({ markets: [stated('CH'), stated('DE')], appetite: 'own_registrations' });
    doc.markets.topology = evaluateTopology(doc);
    const deck = { slides: [
      { layout: 'title', client: 'ACME', project: 'Discovery', subtitle: 'One store for DACH', date: '2026-09-18' },
      { layout: 'decision', topic: 'Storefront', question: 'Theme or headless?', options: [{ option: 'Horizon' }, { option: 'Hydrogen' }], decision: 'Horizon', rationale: 'Fits', status: 'recommended' },
    ] };
    const errors = deckErrors(deck, doc);
    assert.ok(errors.some((e) => /needs a "Market topology" decision slide/.test(e)), errors.join(' | '));

    deck.slides.push({ layout: 'decision', topic: 'Market topology', question: 'One store or several?', options: [{ option: 'One store' }, { option: 'Expansion stores' }, { option: 'Hybrid' }], decision: 'One store with Shopify Markets', rationale: 'One entity, one range, one team — assumed where not stated', status: 'recommended' });
    const ordered = deckErrors(deck, doc);
    assert.ok(ordered.some((e) => /comes first among the decisions/.test(e)), 'topology constrains the storefront, so it is argued first');
    assert.ok(ordered.some((e) => /teaches the topology trade-off before it recommends/.test(e)));
    assert.ok(ordered.some((e) => /four impact lenses/.test(e)));
  });

  test('a subset of the range resolves with a market catalog, a different range does not', () => {
    const subset = evaluateTopology(engagement({ markets: [stated('CH'), stated('DE', { assortment: 'subset' })] }));
    assert.equal(subset.recommendation, 'single_store_markets');
    const different = evaluateTopology(engagement({ markets: [stated('CH'), stated('DE', { assortment: 'different' })] }));
    assert.equal(different.recommendation, 'hybrid');
    assert.deepEqual(different.separate_store_markets, ['DE']);
  });
});
