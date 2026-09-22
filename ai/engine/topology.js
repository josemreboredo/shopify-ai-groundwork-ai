/**
 * @file topology.js
 * @description Market topology, derived from business facts — never asked.
 *
 * On any engagement with more than one market, this decides whether the markets
 * run on one store with Shopify Markets, on expansion stores, on a hybrid of the
 * two, or on one store with Managed Markets as merchant of record. It is
 * deterministic and reproducible: the LLM argues the decision in the closing
 * document, it never makes it.
 *
 * The rule the whole module exists to enforce: the questionnaire asks about the
 * client's business (which company invoices in each country, whether the range
 * differs, who runs the country, where stock sits, who files the tax returns),
 * and the engine turns those facts into the architecture. An engagement whose
 * inputs are mostly unknown still gets a recommendation, at confidence
 * `to_validate`, with every assumption listed — a discovery that produces no
 * recommendation has failed at its job.
 *
 * Every criterion resting on a Shopify platform fact carries its official
 * source in the trigger it fires (`source`, in SOURCES). One criterion rests
 * on business governance instead — who runs a market day to day
 * (governance_isolation) — and carries none, because there is nothing Shopify
 * publishes to cite for a client's own org chart; citing a Shopify page there
 * would misrepresent what it backs. Where Shopify publishes nothing on the
 * platform question itself — there is no official side-by-side comparison of
 * one store with Markets versus expansion stores, and no published cap on
 * markets, currencies or price lists per store — the code says so and the
 * consequence is framed as architecture, not as a documented limit.
 *
 * @module engine/topology
 */

import { marketsOf, hasChinaMainland } from './classify.js';

/** Official Shopify sources, verified 2026-09-18; business entities and the B2B store type 2026-09-22. */
export const SOURCES = {
  expansion_stores: 'https://help.shopify.com/en/manual/organization-settings/expansion-stores',
  markets: 'https://help.shopify.com/en/manual/markets',
  catalogs: 'https://help.shopify.com/en/manual/markets/customizations/catalogs',
  // The Markets-level feature (Plus only): assigns a business entity per
  // market, so orders route to that entity's Shopify Payments account. More
  // precise than SOURCES.entities for this criterion — that page documents the
  // prerequisite (multiple Payments accounts), this one the per-market
  // assignment the criterion is actually about.
  business_entities: 'https://help.shopify.com/en/manual/markets/customizations/business-entities',
  entities: 'https://help.shopify.com/en/manual/payments/shopify-payments/onboarding/selling-with-multiple-entities',
  // Dedicated vs blended B2B store: the actual platform backing for "run as
  // its own operation" — different staff, inventory and access are exactly
  // what a dedicated store is for.
  b2b_store_type: 'https://help.shopify.com/en/manual/b2b/getting-started/store-type',
  per_market_theme: 'https://help.shopify.com/en/manual/online-store/themes/customizing-themes-for-markets',
  b2b_plans: 'https://help.shopify.com/en/manual/b2b/getting-started/plan-features',
  managed_markets_requirements: 'https://help.shopify.com/en/manual/international/managed-markets/requirements-and-considerations',
  managed_markets_overview: 'https://help.shopify.com/en/manual/international/managed-markets/overview',
  managed_markets_uk: 'https://help.shopify.com/en/manual/international/managed-markets/managed-markets-uk',
  taxes: 'https://help.shopify.com/en/manual/taxes/registration/setup',
  // Not a single Shopify page: Shopify documents no mainland-China-specific
  // infrastructure position at all. The claim (PRC entity, ICP filing, onshore
  // hosting) is sourced from Chinese government orders and MIIT notices, not
  // from Shopify — see the dedicated brief.
  china: '../docs/china-mainland.md',
};

/** Countries whose businesses Shopify documents as eligible for Managed Markets. */
const MANAGED_MARKETS_COUNTRIES = ['US', 'CA', 'GB'];

/** Managed Markets fee on order value, by plan. Source: managed_markets_overview. */
const MANAGED_MARKETS_FEE = { plus: 3.25, enterprise: 3.25, default: 3.5 };
/** Foreign-exchange fee, on top of the transaction fee and of normal processing. */
const MANAGED_MARKETS_FX_FEE = 1.5;

const OPTIONS = ['single_store_markets', 'expansion_stores', 'hybrid', 'single_store_managed_markets'];

const list = (doc) => doc.markets?.list ?? [];
const codes = (rows) => rows.map((m) => m.code).filter(Boolean);
const distinct = (values) => [...new Set(values.filter(Boolean))];

/**
 * Criteria that push markets apart, in decreasing weight. Each returns null, or
 * the markets it fires for with the evidence and the question ids behind it.
 * `stated` is false when the criterion fired from an assumption rather than an
 * answer — that is what drives confidence.
 */
const CRITERIA = [
  {
    /*
     * A second legal entity is not automatically a second store.
     *
     * Verified 2026-09-22: Shopify lets a Plus store assign a business entity
     * per market, so orders in that market route through that entity's
     * Shopify Payments account and pay out to its bank — one store, several
     * entities (SOURCES.business_entities; the prerequisite multi-account
     * Payments set-up is SOURCES.entities). That page is explicit it affects
     * payment processing only, and says nothing about invoicing or tax
     * registrations — so the entity split still counts, at a lower weight
     * than it carried, and what carries the weight now is the invoicing and
     * tax footprint below it.
     *
     * Below Plus (and on Enterprise Commerce, unconfirmed either way — see the
     * mitigation logic) the feature does not exist at all, and a second
     * entity really does mean a second store.
     */
    id: 'legal_entity_per_market',
    weight: 3,
    label: 'A different selling legal entity per market — on Plus this is business entities per market, below Plus it is a second store',
    evaluate(doc, markets) {
      const plan = doc.shopify?.target_plan;
      // Mitigation requires knowing the plan; 'not_sure' or unanswered is
      // treated the same as not having it, same as everywhere else this
      // engine reasons from an unknown.
      const mitigated = plan === 'plus' || plan === 'enterprise';
      const mitigation = mitigated
        ? ` — mitigated: Shopify Payments routes each entity's transactions and payouts from one store on ${plan === 'plus' ? 'Plus' : 'Enterprise Commerce'} (${SOURCES.business_entities}), though it does not cover VAT invoicing or tax filing`
        : '';
      const mapped = markets.filter((m) => m.selling_entity);
      const entities = distinct(mapped.map((m) => m.selling_entity));
      if (entities.length > 1) {
        const primary = primaryEntity(doc, mapped);
        const others = mapped.filter((m) => m.selling_entity !== primary);
        return {
          markets: codes(others),
          evidence: `${entities.length} selling entities across ${markets.length} markets (${entities.join(', ')})${mitigation}`,
          question_ids: ['Q3.1.1', 'Q1.1.6'],
          stated: true,
          broad: !mitigated && others.length >= Math.ceil(markets.length / 2),
          source: SOURCES.business_entities,
        };
      }
      // No per-market mapping, but several entities are recorded: the topology
      // turns on which of them sells where, so this fires broadly and unresolved.
      const recorded = doc.meta?.client?.legal_entities ?? [];
      if (!mapped.length && recorded.length > 1) {
        return {
          markets: codes(markets),
          evidence: `${recorded.length} legal entities recorded (${recorded.join(', ')}) with no per-market mapping${mitigation}`,
          question_ids: ['Q1.1.6', 'Q3.1.1'],
          stated: false,
          broad: !mitigated,
          source: SOURCES.business_entities,
        };
      }
      return null;
    },
  },
  {
    id: 'invoicing_and_tax_footprint',
    weight: 4,
    label: 'A different invoicing and tax-registration footprint per market',
    evaluate(doc, markets) {
      const registrations = doc.markets?.vat_countries ?? [];
      const mapped = markets.filter((m) => m.selling_entity);
      const primary = primaryEntity(doc, mapped);
      const own = mapped.filter((m) => m.selling_entity !== primary && registrations.includes(m.code));
      if (own.length) {
        return {
          markets: codes(own),
          evidence: `${own.length} market(s) invoice through their own entity and hold their own tax registration (${codes(own).join(', ')})`,
          question_ids: ['Q3.1.1', 'Q3.4.2'],
          stated: true,
          broad: own.length >= Math.ceil(markets.length / 2),
          source: SOURCES.taxes,
        };
      }
      return null;
    },
  },
  {
    id: 'distinct_assortment',
    weight: 4,
    label: 'A genuinely distinct assortment per market (a subset resolves with market catalogs)',
    evaluate(doc, markets) {
      const different = markets.filter((m) => m.assortment === 'different');
      if (!different.length) return null;
      return {
        markets: codes(different),
        evidence: `${different.length} market(s) sell a deliberately different range (${codes(different).join(', ')}); a subset would resolve with a market catalog`,
        question_ids: ['Q3.1.1'],
        stated: true,
        broad: different.length >= Math.ceil(markets.length / 2),
        source: SOURCES.catalogs,
      };
    },
  },
  {
    id: 'incompatible_apps',
    weight: 3,
    label: 'Mutually incompatible app requirements across markets (apps are store-wide)',
    // Not captured by the questionnaire: it would need a per-market app estate,
    // which no client can state at discovery. Recorded as an assumption instead
    // (see ASSUMPTIONS) and never fired from data, so it can never invent a store.
    evaluate: () => null,
  },
  {
    id: 'b2b_own_operation',
    weight: 3,
    label: 'B2B run as its own operation with its own team',
    evaluate(doc) {
      if (doc.b2b?.enabled !== true || doc.b2b?.own_operation !== true) return null;
      return {
        markets: [],
        // Shopify's own B2B store-type guidance names this exact split: a
        // dedicated store is for different staff, different inventory, and
        // restricted access — the platform's own framing of "its own
        // operation" (SOURCES.b2b_store_type). B2B itself runs on every plan
        // from Basic (SOURCES.b2b_plans) — that fact is unrelated to why this
        // fires and is not cited here.
        evidence: 'The wholesale business is run by its own team with its own targets or P&L',
        question_ids: ['Q6.2.14', 'Q1.1.4'],
        stated: true,
        broad: false,
        source: SOURCES.b2b_store_type,
        adds_store: 'B2B',
      };
    },
  },
  {
    id: 'governance_isolation',
    weight: 3,
    label: 'Independent market teams: data isolation, own release train, own P&L',
    evaluate(doc, markets) {
      const local = markets.filter((m) => m.run_by === 'local_team');
      if (!local.length) return null;
      return {
        markets: codes(local),
        evidence: `${local.length} market(s) are run by their own local team (${codes(local).join(', ')})`,
        question_ids: ['Q3.1.1'],
        stated: true,
        broad: local.length >= Math.ceil(markets.length / 2),
      };
    },
  },
  {
    id: 'market_specific_regulation',
    weight: 5,
    label: 'A market with a regulatory or technical requirement of its own',
    evaluate(doc) {
      if (!hasChinaMainland(doc)) return null;
      return {
        markets: ['CN'],
        evidence: 'Mainland China is a launch market: selling onshore needs a PRC entity, an ICP filing and onshore hosting, and Shopify has no infrastructure in mainland China',
        question_ids: ['Q3.1.1', 'Q3.5.1'],
        stated: true,
        broad: false,
        excluded_from_build: true,
        source: SOURCES.china,
      };
    },
  },
];

/**
 * Every market except the one the first store is built for: the stated
 * primary market, or just the first one recorded when none is stated.
 */
function nonPrimary(doc, markets) {
  const primaries = doc.markets?.primary_markets ?? [];
  const first = primaries.length ? markets.filter((m) => primaries.includes(m.code)) : markets.slice(0, 1);
  const firstCodes = new Set(first.map((m) => m.code));
  return markets.filter((m) => !firstCodes.has(m.code));
}

/** The entity that sells in the primary markets, or the most common one. */
function primaryEntity(doc, mapped) {
  const primaries = doc.markets?.primary_markets ?? [];
  const onPrimary = mapped.find((m) => primaries.includes(m.code));
  if (onPrimary) return onPrimary.selling_entity;
  const counts = new Map();
  for (const m of mapped) counts.set(m.selling_entity, (counts.get(m.selling_entity) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

/**
 * Every unknown that the evaluator had to assume its way past, with what it
 * assumed and what changes if the assumption is wrong. One entry per unknown —
 * this is what turns an unanswered interview into a recommendation instead of a
 * blank.
 */
function assumptionsFor(doc, markets) {
  const out = [];
  const unmapped = markets.filter((m) => !m.selling_entity);
  const entities = doc.meta?.client?.legal_entities ?? [];
  if (unmapped.length && entities.length <= 1) {
    out.push({
      about: 'Which company invoices the customer in each market',
      assumed: `All ${markets.length} markets sell through the ${doc.meta?.client?.hq_country ?? 'headquarters'} entity`,
      impact_if_wrong: 'A second selling entity moves the recommendation towards expansion stores and requires Shopify Plus',
      question_id: 'Q3.1.1',
    });
  }
  if (markets.some((m) => !m.assortment || m.assortment === 'not_sure')) {
    out.push({
      about: 'How the range differs by market',
      assumed: 'The same range everywhere, or a subset of it',
      impact_if_wrong: 'A deliberately different range in several markets moves the recommendation to hybrid or expansion stores',
      question_id: 'Q3.1.1',
    });
  }
  if (markets.some((m) => !m.run_by || m.run_by === 'not_sure')) {
    out.push({
      about: 'Who runs each market day to day',
      assumed: 'One central team runs every market',
      impact_if_wrong: 'Local teams with their own release cycle and data are the strongest non-technical argument for separate stores',
      question_id: 'Q3.1.1',
    });
  }
  if (!doc.markets?.tax_registration_appetite || doc.markets.tax_registration_appetite === 'not_sure') {
    out.push({
      about: 'Whether the business will hold its own tax registrations',
      assumed: 'The business keeps its own registrations and Shopify Markets handles duties and taxes',
      impact_if_wrong: 'A preference for a partner as legal seller makes a merchant of record the cross-border answer',
      question_id: 'Q3.4.13',
    });
  }
  if (!(doc.shipping?.fulfilment_countries ?? []).length) {
    out.push({
      about: 'Where the stock that serves each market sits',
      assumed: `Fulfilment from ${doc.meta?.client?.hq_country ?? 'the home country'} only`,
      impact_if_wrong: 'Stock inside a destination region changes the duties position, the tax schemes available and Managed Markets eligibility',
      question_id: 'Q5.1.3',
    });
  }
  if (doc.b2b?.enabled === true && doc.b2b?.own_operation === undefined) {
    out.push({
      about: 'Whether wholesale is its own operation',
      assumed: 'Wholesale is run by the same team as the consumer business',
      impact_if_wrong: 'A wholesale team with its own P&L adds a second store to the recommendation',
      question_id: 'Q6.2.14',
    });
  }
  out.push({
    about: 'App requirements that cannot coexist on one store',
    assumed: 'No market needs an app the others cannot live with (apps are installed store-wide)',
    impact_if_wrong: 'One incompatible app requirement is enough to force a separate store for that market',
    source: SOURCES.expansion_stores,
    question_id: null,
  });
  return out.map(({ question_id, ...rest }) => (question_id ? { ...rest, question_id } : rest));
}

/** Unanswered inputs that would change the outcome, most decisive first. */
function openInputsFor(doc, markets) {
  const out = [];
  if (markets.some((m) => !m.selling_entity)) {
    out.push({ question_id: 'Q3.1.1', pointer: '/markets/list/*/selling_entity', swing: 'high',
      why_it_matters: 'Which company invoices in each market decides between one store and separate stores, and whether Shopify Plus is required' });
  }
  if (markets.some((m) => !m.assortment || m.assortment === 'not_sure')) {
    out.push({ question_id: 'Q3.1.1', pointer: '/markets/list/*/assortment', swing: 'high',
      why_it_matters: 'A deliberately different range per market is the difference between a market catalog and a second store' });
  }
  if (markets.some((m) => !m.run_by || m.run_by === 'not_sure')) {
    out.push({ question_id: 'Q3.1.1', pointer: '/markets/list/*/run_by', swing: 'medium',
      why_it_matters: 'Local teams that publish independently need separated admins and release cycles' });
  }
  if (!doc.markets?.tax_registration_appetite || doc.markets.tax_registration_appetite === 'not_sure') {
    out.push({ question_id: 'Q3.4.13', pointer: '/markets/tax_registration_appetite', swing: 'medium',
      why_it_matters: 'Decides whether the client stays the seller of record or hands that to a partner' });
  }
  if (!(doc.markets?.vat_countries ?? []).length) {
    out.push({ question_id: 'Q3.4.2', pointer: '/markets/vat_countries', swing: 'medium',
      why_it_matters: 'The registration footprint separates markets that already stand alone from markets served cross-border' });
  }
  if (!(doc.shipping?.fulfilment_countries ?? []).length) {
    out.push({ question_id: 'Q5.1.3', pointer: '/shipping/fulfilment_countries', swing: 'low',
      why_it_matters: 'Where stock sits changes duties, tax schemes and Managed Markets eligibility' });
  }
  if (doc.b2b?.enabled === true && doc.b2b?.own_operation === undefined) {
    out.push({ question_id: 'Q6.2.14', pointer: '/b2b/own_operation', swing: 'medium',
      why_it_matters: 'A wholesale team with its own P&L adds a second store' });
  }
  const rank = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => rank[a.swing] - rank[b.swing]);
}

/**
 * Managed Markets eligibility, evaluated strictly and reported either way: a
 * client who has heard of Managed Markets deserves to see why it was ruled out.
 * Every condition carries the Shopify page it comes from.
 *
 * @param {object} doc
 * @returns {{ status: string, conditions: object[], cost_signal?: object }}
 */
export function managedMarketsVerdict(doc) {
  const hq = doc.meta?.client?.hq_country;
  const plan = doc.shopify?.target_plan;
  const providers = (doc.payments?.providers ?? []).map((p) => String(p).toLowerCase());
  const entities = doc.meta?.client?.legal_entities ?? [];
  const fulfilment = doc.shipping?.fulfilment_countries ?? [];
  const conditions = [
    {
      condition: 'The business is based in the continental United States, or is an eligible store in Canada or the United Kingdom',
      met: MANAGED_MARKETS_COUNTRIES.includes(hq ?? ''),
      evidence: hq ? `Headquarters in ${hq}` : 'No headquarters country recorded',
      source: SOURCES.managed_markets_requirements,
    },
    {
      condition: 'The store is on the Basic plan or higher',
      met: !['none', 'starter'].includes(plan ?? 'not_sure'),
      evidence: plan ? `Target plan ${plan}` : 'No target plan recorded',
      source: SOURCES.managed_markets_requirements,
    },
    {
      condition: 'The store uses Shopify Payments',
      met: providers.some((p) => p.includes('shopify')),
      evidence: providers.length ? `Providers: ${(doc.payments?.providers ?? []).join(', ')}` : 'No payment providers recorded',
      source: SOURCES.managed_markets_requirements,
    },
    {
      condition: 'At least one fulfilment location in the home country',
      met: fulfilment.length ? fulfilment.includes(hq ?? '') : Boolean(hq),
      evidence: fulfilment.length ? `Fulfilment in ${fulfilment.join(', ')}` : 'No fulfilment countries recorded — assumed to be the home country',
      source: SOURCES.managed_markets_requirements,
    },
    {
      condition: 'No B2B orders — "B2B orders aren\'t supported by Managed Markets"',
      met: doc.b2b?.enabled !== true,
      evidence: doc.b2b?.enabled === true ? 'The engagement sells B2B' : 'No B2B in scope',
      source: SOURCES.managed_markets_requirements,
    },
    {
      condition: 'No subscriptions — "Managed Markets doesn\'t support subscriptions"',
      met: !(doc.catalogue?.product_types ?? []).includes('subscription'),
      evidence: (doc.catalogue?.product_types ?? []).includes('subscription') ? 'Subscription products are in the catalogue' : 'No subscription products',
      source: SOURCES.managed_markets_requirements,
    },
    {
      condition: 'No multiple business entities — "Managed Markets doesn\'t support multiple business entities"',
      met: entities.length <= 1,
      evidence: entities.length > 1 ? `${entities.length} legal entities recorded` : 'One selling entity',
      source: SOURCES.managed_markets_requirements,
    },
  ];
  const failing = conditions.filter((c) => !c.met);
  return {
    status: failing.length ? 'not_eligible' : 'eligible',
    conditions,
    ...(failing.length ? {} : { cost_signal: costSignal(doc) }),
    // UK has its own terms beyond the general conditions above (no Shopify
    // Protect, no multi-currency payouts, no refunds through Managed Markets,
    // fulfilment must be either Great Britain or Northern Ireland — not both
    // — and a VAT registration that must match the registered business name).
    // Not folded into a pass/fail condition: the country code this engine
    // works from (GB) does not distinguish Great Britain from Northern
    // Ireland, so whether a GB fulfilment answer actually crosses that line
    // needs a person to check, not this evaluator.
    ...(hq === 'GB' ? { uk_considerations: SOURCES.managed_markets_uk } : {}),
  };
}

/**
 * What Managed Markets costs on this engagement's own numbers: the transaction
 * fee plus the currency-conversion fee, both on top of normal payment
 * processing. On high-AOV engagements this is usually what decides it.
 */
function costSignal(doc) {
  const orders = doc.post_purchase?.orders_per_month;
  const revenue = doc.business?.revenue_monthly;
  const plan = doc.shopify?.target_plan;
  const feePct = (MANAGED_MARKETS_FEE[plan] ?? MANAGED_MARKETS_FEE.default) + MANAGED_MARKETS_FX_FEE;
  const midpoint = revenue && (revenue.min ?? revenue.max) !== undefined
    ? ((revenue.min ?? revenue.max) + (revenue.max ?? revenue.min)) / 2
    : null;
  const aov = orders && midpoint ? midpoint / orders : null;
  const basis = `${MANAGED_MARKETS_FEE[plan] ?? MANAGED_MARKETS_FEE.default}% Managed Markets fee + ${MANAGED_MARKETS_FX_FEE}% currency conversion, on top of Shopify Payments processing (${SOURCES.managed_markets_overview})`;
  if (!aov) return { fee_pct: feePct, basis };
  return {
    orders_per_month: orders,
    average_order_value: Math.round(aov * 100) / 100,
    ...(revenue?.currency ? { currency: revenue.currency } : {}),
    fee_pct: feePct,
    per_order: Math.round(aov * feePct) / 100,
    per_month: Math.round(midpoint * feePct) / 100,
    basis,
  };
}

/**
 * The topology decision.
 *
 * @param {object} doc  Engagement document with markets, meta, b2b and shipping
 * @returns {object|null}  null when the engagement has one market or none
 */
export function evaluateTopology(doc) {
  const all = list(doc);
  if (all.length <= 1) return null;
  const markets = marketsOf(doc); // mainland China is out of the offering's scope

  const triggers = [];
  for (const criterion of CRITERIA) {
    const hit = criterion.evaluate(doc, markets);
    if (!hit) continue;
    triggers.push({
      criterion: criterion.id,
      weight: criterion.weight,
      evidence: hit.evidence,
      ...(hit.markets?.length ? { markets: hit.markets } : {}),
      question_ids: hit.question_ids,
      // Not every criterion rests on a Shopify platform fact — some (business
      // ownership, team structure) are consulting judgement with nothing to
      // cite; those legitimately have no source.
      ...(hit.source ? { source: hit.source } : {}),
      _broad: hit.broad,
      _stated: hit.stated,
      _adds_store: hit.adds_store,
      _excluded: hit.excluded_from_build,
    });
  }

  const assumptions = assumptionsFor(doc, markets);
  const open_inputs = openInputsFor(doc, markets);
  const managed_markets = managedMarketsVerdict(doc);
  const wantsPartner = doc.markets?.tax_registration_appetite === 'prefer_partner';

  const entityOrTax = triggers.filter((t) => ['legal_entity_per_market', 'invoicing_and_tax_footprint'].includes(t.criterion));
  const broad = entityOrTax.some((t) => t._broad);
  const separate = [...new Set(triggers.flatMap((t) => t.markets ?? []))];

  let recommendation;
  if (!triggers.length) recommendation = 'single_store_markets';
  else if (broad) recommendation = 'expansion_stores';
  else recommendation = 'hybrid';

  // Managed Markets changes who sells, not how many stores: it is only the
  // recommendation where one store already wins and the client would rather a
  // partner carried the registrations.
  if (recommendation === 'single_store_markets' && managed_markets.status === 'eligible' && wantsPartner) {
    recommendation = 'single_store_managed_markets';
  }
  if (managed_markets.status === 'eligible' && recommendation !== 'single_store_managed_markets') {
    managed_markets.status = wantsPartner ? 'eligible' : 'rejected_on_economics';
  }

  const decisive = new Set(['legal_entity_per_market', 'invoicing_and_tax_footprint', 'distinct_assortment', 'governance_isolation']);
  const assumedDecision = triggers.some((t) => decisive.has(t.criterion) && t._stated === false)
    || (recommendation === 'single_store_markets' && assumptions.length >= 3)
    || (!triggers.length && assumptions.some((a) => a.question_id === 'Q3.1.1'));
  const confidence = assumedDecision ? 'to_validate' : assumptions.length > 1 ? 'medium' : 'high';

  const rejected = OPTIONS.filter((o) => o !== recommendation).map((option) => ({
    option,
    reason: rejectionReason(option, { recommendation, triggers, markets, managed_markets, separate }),
  }));

  const stated = doc.markets?.strategy;
  const statedMatch = { shopify_markets: 'single_store_markets', expansion_stores: 'expansion_stores', hybrid: 'hybrid' };
  const disagreement = stated && statedMatch[stated] && statedMatch[stated] !== recommendation
    ? {
        stated,
        computed: recommendation,
        why_computed: triggers.length
          ? triggers.map((t) => t.evidence).join('; ')
          : 'No business fact separates the markets: one selling entity, one range, one team',
      }
    : null;

  // Any recommendation except a full expansion-store estate leaves at least
  // one store serving more than one market — where per-market theme content
  // (not just settings) needs the Advanced plan or higher; Basic and Grow
  // share one theme customisation across every market on that store.
  const sharesOneStoreAcrossMarkets = recommendation !== 'expansion_stores';

  return {
    recommendation,
    confidence,
    triggers: triggers.map(({ _broad, _stated, _adds_store, _excluded, ...t }) => t),
    rejected,
    assumptions,
    open_inputs,
    // A hybrid separates only the markets that actually diverged; a full
    // expansion-store recommendation separates all of them. Either way this
    // lists stores *beyond the first* (classify.js's storesBeyondTheFirst),
    // so one market — the primary one, same market a selling entity defaults
    // to — stays off the list as the implicit first store, not because it is
    // exempt but because it is the one nothing further is added for. Left
    // unset for anything else, storesBeyondTheFirst() silently priced zero
    // extra stores for a full expansion recommendation before this — the
    // most expensive shape, costed as the cheapest one.
    ...(recommendation === 'hybrid' && separate.length ? { separate_store_markets: separate } : {}),
    ...(recommendation === 'expansion_stores' ? { separate_store_markets: codes(nonPrimary(doc, markets)) } : {}),
    managed_markets,
    ...(stated ? { stated_preference: stated } : {}),
    ...(disagreement ? { disagreement } : {}),
    ...(sharesOneStoreAcrossMarkets ? { per_market_theme_note: SOURCES.per_market_theme } : {}),
  };
}

/** Why each option was not chosen — the deck needs the argument, not just the answer. */
function rejectionReason(option, { recommendation, triggers, markets, managed_markets, separate }) {
  const names = triggers.map((t) => t.criterion.replace(/_/g, ' ')).join(', ');
  switch (option) {
    case 'single_store_markets':
      return `Rejected: ${names || 'the facts'} separate ${separate.length || markets.length} of ${markets.length} markets, and one store shares one theme, one app estate and one admin across all of them (${SOURCES.markets})`;
    case 'expansion_stores':
      return recommendation === 'hybrid'
        ? `Rejected: only ${separate.length} of ${markets.length} markets diverge, and a full multi-store estate would duplicate catalogue, theme and app work for markets that do not need it (expansion stores also require Shopify Plus — ${SOURCES.expansion_stores})`
        : `Rejected: nothing in the answers separates the markets by entity, range or team, so a second store would duplicate every catalogue, theme and app change for no benefit (and requires Shopify Plus — ${SOURCES.expansion_stores})`;
    case 'hybrid':
      return recommendation === 'expansion_stores'
        ? 'Rejected: the entity and tax footprint separates most markets, not a minority, so a core store plus one exception does not hold'
        : 'Rejected: no market diverges enough to leave the core store';
    case 'single_store_managed_markets':
      return managed_markets.status === 'not_eligible'
        ? `Not eligible: ${managed_markets.conditions.filter((c) => !c.met).map((c) => c.condition).join('; ')} (${SOURCES.managed_markets_requirements})`
        : 'Eligible, but rejected: the client keeps its own tax registrations, so the fees buy nothing it is not already doing';
    default:
      return 'Not applicable';
  }
}

/** Markets excluded from the build by their own regulation (mainland China). */
export const excludedFromBuild = (doc) => (hasChinaMainland(doc) ? ['CN'] : []);
