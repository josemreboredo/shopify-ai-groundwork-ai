/**
 * Market topology (docs/market-topology-audit.md): the engine derives the store
 * shape from business facts and always returns a recommendation. The questionnaire
 * asks about the client's business; it never asks the client to choose the
 * architecture.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { evaluateTopology, managedMarketsVerdict, excludedFromBuild } from '../../engine/topology.js';
import { evaluateExits } from '../../engine/exits.js';
import { planRequirements } from '../../engine/plan.js';
import { storesBeyondTheFirst, classifyOffer } from '../../engine/classify.js';
import { approachQualityErrors } from '../../engine/approach.js';
import { deckErrors } from '../../shared/deck-template.js';

/** A minimal engagement: one selling entity, markets given row by row. */
const engagement = ({ markets, entities = ['ACME AG'], hq = 'CH', b2b, shipping, appetite, vat = [], plan = 'basic', payments, catalogue, post_purchase, business, strategy, brands = 1 } = {}) => ({
  meta: { client: { hq_country: hq, legal_entities: entities, business_model: b2b ? 'hybrid' : 'dtc', brand_count: brands } },
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

const stated = (code, extra = {}) => ({ code, currency: 'EUR', selling_entity: 'ACME AG', assortment: 'same', run_by: 'central', distinct_theme_design: false, ...extra });
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

  test('3b · a different entity per market alone does not force expansion stores on Plus — Shopify Payments routes it from one store', () => {
    const marketsRow = [stated('CH'), stated('DE', { selling_entity: 'ACME GmbH' })];
    const basic = evaluateTopology(engagement({ markets: marketsRow, entities: ['ACME AG', 'ACME GmbH'], plan: 'basic' }));
    const entityTrigger = (t) => t.triggers.find((x) => x.criterion === 'legal_entity_per_market');
    assert.equal(basic.recommendation, 'expansion_stores', 'unmitigated on a plan without the feature');
    assert.doesNotMatch(entityTrigger(basic).evidence, /mitigated/);

    const plus = evaluateTopology(engagement({ markets: marketsRow, entities: ['ACME AG', 'ACME GmbH'], plan: 'plus' }));
    assert.notEqual(plus.recommendation, 'expansion_stores', 'mitigated on Plus — one criterion alone no longer forces a split');
    assert.match(entityTrigger(plus).evidence, /mitigated: Shopify Payments routes each entity/);
    assert.equal(entityTrigger(plus).source, 'https://help.shopify.com/en/manual/markets/customizations/business-entities');
  });

  test('3c · a full expansion-stores recommendation prices every market beyond the primary as a store — not zero', () => {
    // The regression this guards: separate_store_markets was only ever
    // populated for 'hybrid', so storesBeyondTheFirst() (classify.js) priced
    // a full expansion-stores estate — the most expensive shape — as though
    // it were a single store, silently.
    const doc = engagement({
      markets: [stated('CH'), stated('DE', { selling_entity: 'ACME GmbH' }), stated('FR', { selling_entity: 'ACME SAS' })],
      entities: ['ACME AG', 'ACME GmbH', 'ACME SAS'],
    });
    const t = evaluateTopology(doc);
    assert.equal(t.recommendation, 'expansion_stores');
    assert.deepEqual(t.separate_store_markets, ['DE', 'FR'], 'CH is the primary market — the implicit first store, not listed');
    doc.markets.topology = t;
    assert.equal(storesBeyondTheFirst(doc), 2);
  });

  test('4 · mainland China alongside other markets → hybrid, and China stays out of the build', () => {
    const t = evaluateTopology(engagement({ markets: [stated('CH'), stated('DE'), { code: 'CN', currency: 'CNY' }] }));
    assert.equal(t.recommendation, 'hybrid');
    assert.deepEqual(t.separate_store_markets, ['CN']);
    assert.ok(t.triggers.some((x) => x.criterion === 'market_specific_regulation' && /ICP filing/.test(x.evidence)));
    assert.deepEqual(excludedFromBuild(engagement({ markets: [stated('CH'), { code: 'CN' }] })), ['CN']);
  });

  test('5 · a wholesale operation with its own team → hybrid, and it prices a store — not zero', () => {
    // The regression this guards: b2b_own_operation fired and the
    // recommendation said 'hybrid' — correctly, a second store is needed —
    // but adds_store was computed and then discarded before evaluateTopology
    // returned, so storesBeyondTheFirst() (classify.js) priced it as zero.
    const doc = engagement({
      markets: [stated('CH'), stated('DE')],
      b2b: { enabled: true, own_operation: true },
    });
    const t = evaluateTopology(doc);
    assert.equal(t.recommendation, 'hybrid');
    assert.ok(t.triggers.some((x) => x.criterion === 'b2b_own_operation'));
    assert.deepEqual(t.additional_channel_stores, ['B2B']);
    doc.markets.topology = t;
    assert.equal(storesBeyondTheFirst(doc), 1);
  });

  test('5b · B2B run as its own operation still needs a second store with a single market', () => {
    // The regression this guards: evaluateTopology returned null outright
    // whenever there was one market or none — right for the market-divergence
    // criteria, which have nothing to compare with one market, but wrong for
    // b2b_own_operation, which does not depend on market count at all.
    const doc = engagement({
      markets: [stated('CH')],
      b2b: { enabled: true, own_operation: true },
    });
    const t = evaluateTopology(doc);
    assert.notEqual(t, null, 'single-market engagements are not exempt from a B2B-driven second store');
    assert.equal(t.recommendation, 'hybrid');
    assert.deepEqual(t.additional_channel_stores, ['B2B']);
    doc.markets.topology = t;
    assert.equal(storesBeyondTheFirst(doc), 1);
  });

  test('5c · a second customer-facing brand needs its own store even with a single market, and each extra brand is its own store', () => {
    // The regression this guards: expansion stores must stay "an extension of
    // the main brand" (Shopify's own eligibility rule) — a genuinely separate
    // brand is not free the way expansion stores are, and nothing about it
    // depends on how many markets there are.
    const one = evaluateTopology(engagement({ markets: [stated('CH')], brands: 2 }));
    assert.notEqual(one, null, 'a second brand is not exempt just because there is one market');
    assert.equal(one.recommendation, 'hybrid');
    assert.ok(one.triggers.some((x) => x.criterion === 'distinct_brand'));
    assert.deepEqual(one.additional_channel_stores, ['Brand']);
    const doc1 = { markets: { topology: one } };
    assert.equal(storesBeyondTheFirst(doc1), 1);

    const three = evaluateTopology(engagement({ markets: [stated('CH')], brands: 3 }));
    assert.deepEqual(three.additional_channel_stores, ['Brand', 'Brand'], 'two extra brands are two stores, not one deduplicated entry');
    const doc3 = { markets: { topology: three } };
    assert.equal(storesBeyondTheFirst(doc3), 2);
  });

  test('5d · a market needing its own theme design (not just content) forces it apart from a shared store', () => {
    // The regression this guards: per-market customization never reaches
    // theme settings or Liquid templates, only content — so "we want CH and DE
    // to look different, not just read different" is a store-separation fact
    // the engine could not see at all before this criterion existed.
    const doc = engagement({ markets: [stated('CH'), stated('DE', { distinct_theme_design: true })] });
    const t = evaluateTopology(doc);
    assert.equal(t.recommendation, 'hybrid');
    assert.ok(t.triggers.some((x) => x.criterion === 'distinct_theme_design' && /theme settings/.test(x.evidence)));
    assert.deepEqual(t.separate_store_markets, ['DE']);
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
    // Every option measured on the same axes — the rubric of discovery/agents/discovery/rubric.js.
    const cell = (o) => ({ plan: 'x', run_cost: 'x', build_effort: 'x', time_to_launch: 'x', who_can_change_it: 'x', operational_load: 'x', reversibility: 'x', limits: 'x', multi_market: 'x', ...o });
    for (const option of payload.architecture_decisions[0].options) option.assessment = cell({});
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

describe('a second brand: where it stays and where it leaves', () => {
  /*
   * Two rules meet on the same answer and they are not the same rule.
   *
   * A second customer-facing brand needs its own store — Shopify's expansion
   * stores must stay "an extension of the main brand" — and that store is
   * priced: an add-on on M, up to three in L. A different layout per brand is
   * priced too, as a further storefront design on the same token layer.
   *
   * What leaves is a design system per brand: separate tokens and components
   * is a design programme, and rule 11.29 routes it to Merkle Arc. The line is
   * the client's answer to that question (Q9.2.14), not the storefront tier —
   * the tier is exactly what L includes, and reading it sent a two-brand client
   * who took L's own design to Arc.
   */
  const brandDesign = (brands, completeness, perBrand) => {
    const doc = engagement({ markets: [stated('CH')], brands });
    doc.design = { figma: { completeness }, ...(perBrand === undefined ? {} : { design_system_per_brand: perBrand }) };
    doc.markets.topology = evaluateTopology(doc);
    doc.offer = classifyOffer(doc);
    doc.exits = evaluateExits(doc, []);
    return doc;
  };
  const arc = (doc) => (doc.exits.items ?? []).find((i) => i.rule_id === '11.29');

  test('one brand never fires it, whatever the design costs', () => {
    assert.equal(arc(brandDesign(1, 'all_templates', true)), undefined, 'one brand with a full design system is an offer, not a programme');
    assert.equal(arc(brandDesign(1, 'brand_only')), undefined);
  });

  test('a second brand on a configured theme stays in the offers, with its store as an add-on', () => {
    const doc = brandDesign(2, 'brand_only');
    assert.equal(arc(doc), undefined, 'nothing leaves the offers');
    assert.equal(doc.offer.code, 'M', 'the store it needs is sold on M');
    assert.ok(doc.offer.addons.some((a) => a.gate === 'store_estate'), 'and named as what goes past the pack');
    assert.equal(doc.offer.l_triggers.multi_store.active, true, 'the approach still reads the second store');
  });

  test('two brands sharing one design system stay, even on the full template set L includes', () => {
    const doc = brandDesign(2, 'all_templates', false);
    assert.equal(doc.offer.scope_gates.storefront_design.tier, 'bespoke');
    assert.equal(arc(doc), undefined, 'L’s own design is not a reason to leave L');
    assert.equal(arc(brandDesign(2, 'all_templates')), undefined, 'and neither is not having answered yet');
  });

  test('a second brand with its own design system goes to Merkle Arc', () => {
    const doc = brandDesign(2, 'all_templates', true);
    const fired = arc(doc);
    assert.ok(fired, 'rule 11.29 fires');
    assert.equal(fired.result, 'STOP');
    assert.match(fired.evidence, /2 customer-facing brands, each needing its own design system/);
    assert.match(fired.destination, /Merkle Arc/, 'and it names Arc as the destination');
    assert.equal(doc.exits.triggered, true, 'a STOP takes it out of the offers whatever the classification says');
  });
});

