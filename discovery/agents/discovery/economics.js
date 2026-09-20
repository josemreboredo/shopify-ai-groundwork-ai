/**
 * @file economics.js
 * @description What the solution costs to run, in the client's own numbers.
 *
 * "This is more expensive" is an opinion. "At 400 orders a month and an average
 * basket of CHF 1,250, duties at checkout cost about CHF 4,250 a month" is an
 * argument, and it is the most credible thing a deck can contain — because the
 * client recognises the inputs as their own answers.
 *
 * The rule here is the same as everywhere else: a number is computed from the
 * engagement's own answers, or it carries the Shopify page that publishes the
 * rate, or it is listed as unknown with where to go and look. Shopify's plan
 * prices are deliberately absent — they are published per region and per currency
 * and this repository holds no sourced table of them, so inventing one to make the
 * arithmetic tidy is exactly the failure this module exists to prevent.
 *
 * @module discovery/economics
 */

/** Documented rates, each with the page that publishes it. Verified 2026-09-18. */
export const RATES = {
  duties_with_shopify_payments: {
    label: 'Duties and import taxes at checkout (with Shopify Payments)',
    pct: 0.85,
    source: 'https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties',
  },
  duties_other_provider: {
    label: 'Duties and import taxes at checkout (other payment provider)',
    pct: 1.5,
    source: 'https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties',
  },
  managed_markets_plus: {
    label: 'Managed Markets transaction fee (Plus)',
    pct: 3.25,
    source: 'https://help.shopify.com/en/manual/international/managed-markets/overview',
  },
  managed_markets_standard: {
    label: 'Managed Markets transaction fee (Basic, Grow, Advanced)',
    pct: 3.5,
    source: 'https://help.shopify.com/en/manual/international/managed-markets/overview',
  },
  managed_markets_fx: {
    label: 'Managed Markets currency conversion fee',
    pct: 1.5,
    source: 'https://help.shopify.com/en/manual/international/managed-markets/overview',
  },
};

const round = (n) => Math.round(n * 100) / 100;

/**
 * The two numbers every other number rests on, from the client's own answers.
 *
 * @param {object} doc
 * @returns {{ orders_per_month?: number, monthly_revenue?: number, average_order_value?: number, currency?: string, from: string[], missing: string[] }}
 */
export function basis(doc) {
  const orders = doc.post_purchase?.orders_per_month;
  const revenue = doc.business?.revenue_monthly;
  const from = [];
  const missing = [];
  // The question id travels as a field, not inside the sentence. Whatever the
  // engine says it cannot cost has to become a question to the client, and a
  // link that reads itself out of prose breaks the first time the prose changes.
  const needs = [];
  if (orders) from.push('Q0.2.6 orders per month'); else { missing.push('Q0.2.6 — orders per month'); needs.push({ question_id: 'Q0.2.6', item: 'orders per month' }); }
  if (revenue) from.push('Q0.2.1 monthly revenue'); else { missing.push('Q0.2.1 — monthly revenue'); needs.push({ question_id: 'Q0.2.1', item: 'monthly revenue' }); }
  const midpoint = revenue && (revenue.min ?? revenue.max) !== undefined
    ? ((revenue.min ?? revenue.max) + (revenue.max ?? revenue.min)) / 2
    : undefined;
  return {
    ...(orders ? { orders_per_month: orders } : {}),
    ...(midpoint !== undefined ? { monthly_revenue: midpoint } : {}),
    ...(orders && midpoint !== undefined ? { average_order_value: round(midpoint / orders) } : {}),
    ...(revenue?.currency ? { currency: revenue.currency } : {}),
    from,
    missing,
    needs,
  };
}

/** Apps the approach recommends, with the cost the model found on the listing. */
function subscriptions(doc) {
  const apps = (doc.approach?.app_shortlist ?? []).filter((a) => a.recommended);
  return apps.map((app) => ({
    item: app.name,
    ...(app.cost?.amount !== undefined ? { amount: app.cost.amount } : {}),
    ...(app.cost?.currency ? { currency: app.cost.currency } : {}),
    period: app.cost?.period ?? 'unknown',
    note: app.cost?.note ?? 'no published price recorded — verify on the App Store listing',
    ...(app.url ? { source: app.url } : {}),
  }));
}

/** Documented per-order rates that this engagement actually triggers. */
function perOrderRates(doc) {
  const out = [];
  const plan = doc.shopify?.target_plan;
  const providers = (doc.payments?.providers ?? []).map((p) => String(p).toLowerCase());
  const shopifyPayments = providers.some((p) => p.includes('shopify'));

  if (doc.markets?.duties_ddp === true) {
    out.push(shopifyPayments ? RATES.duties_with_shopify_payments : RATES.duties_other_provider);
  }
  if (doc.markets?.topology?.recommendation === 'single_store_managed_markets') {
    out.push(['plus', 'enterprise'].includes(plan) ? RATES.managed_markets_plus : RATES.managed_markets_standard);
    out.push(RATES.managed_markets_fx);
  }
  return out;
}

/**
 * The run cost as far as the engagement's own data carries it, and an explicit
 * list of what it does not.
 *
 * @param {object} doc  Decided engagement, ideally with an approach
 * @returns {object}
 */
const costCache = new WeakMap();

/** Computed once per document: three callers ask for it on every save. */
export function runCostFor(doc) {
  if (!costCache.has(doc)) costCache.set(doc, runCost(doc));
  return costCache.get(doc);
}

export function runCost(doc) {
  const b = basis(doc);
  const recurring = subscriptions(doc);
  const rates = perOrderRates(doc);

  const per_order = rates.map((rate) => {
    const aov = b.average_order_value;
    const monthly = b.monthly_revenue;
    return {
      item: rate.label,
      pct: rate.pct,
      ...(aov !== undefined ? { per_order: round((aov * rate.pct) / 100) } : {}),
      ...(monthly !== undefined ? { per_month: round((monthly * rate.pct) / 100) } : {}),
      ...(b.currency ? { currency: b.currency } : {}),
      source: rate.source,
    };
  });

  const by_currency = {};
  for (const line of recurring) {
    if (line.amount === undefined || line.period !== 'month' || !line.currency) continue;
    by_currency[line.currency] = round((by_currency[line.currency] ?? 0) + line.amount);
  }

  const unknown = [
    {
      item: 'Shopify plan price',
      why: 'Shopify publishes plan prices per region and per currency, and this tool holds no sourced table of them — quoting one from memory is how a deck loses its credibility',
      where_to_check: 'https://www.shopify.com/pricing for the client\'s own market',
    },
    ...b.missing.map((m) => ({ item: m.split(' — ')[1] ?? m, why: `${m} was not answered, so the per-order and monthly figures cannot be computed`, where_to_check: 'ask the client' })),
    ...recurring.filter((r) => r.amount === undefined).map((r) => ({ item: `${r.item} subscription`, why: 'no published price recorded', where_to_check: r.source ?? 'the App Store listing' })),
  ];

  const currencies = [...new Set([...Object.keys(by_currency), ...(b.currency ? [b.currency] : [])])];
  return {
    ...(currencies.length > 1 ? { currency_note: `Figures are in ${currencies.join(' and ')} and are not converted: this tool holds no sourced exchange rate. Present them in the client's currency only once someone has applied a rate they can stand behind.` } : {}),
    note: 'Computed from the client\'s own answers and from rates Shopify publishes, each with its source. Never add a figure that is not here without a source, and never quote a Shopify plan price this tool has not given you.',
    basis: b,
    recurring,
    per_order,
    totals: { subscriptions_per_month: by_currency },
    unknown,
  };
}
