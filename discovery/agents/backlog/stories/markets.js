/**
 * @file markets.js — epic "Markets & internationalisation" (LWC-MKT-*)
 */

import { markets, languages, list, listOr, gate } from './helpers.js';

const strategyText = {
  base_currency: 'prices in the store base currency',
  auto_converted: 'automatically converted prices with rounding rules',
  manual: 'fixed prices set per product in a market price list',
  display_only: 'converted prices for display only',
};

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-MKT-001',
    epic: 'markets',
    title: (doc) => `Configure Shopify Markets for ${list(markets(doc).map((m) => m.code))}`,
    user_story: 'As a shopper, I want to see my market\'s currency, prices and language automatically, so that buying feels local.',
    description: (doc) => `Markets at launch: ${markets(doc).map((m) => `${m.code} (${m.currency ?? 'currency TBC'}, ${(m.languages ?? []).join('/') || 'languages TBC'}${m.domain ? `, ${m.domain}` : ''})`).join('; ')}.`,
    acceptance_criteria: (doc) => [
      ...markets(doc).map((m) => `Given a visitor from ${m.code}, when they open the storefront, then prices show in ${m.currency ?? 'the market currency'}${m.domain ? ` on ${m.domain}` : ''}`),
      `Given the primary market${(doc.markets?.primary_markets ?? []).length > 1 ? 's' : ''} ${listOr(doc.markets?.primary_markets, '')}, when Markets are reviewed in the admin, then the store's primary market is ${doc.markets?.primary_markets?.[0] ?? 'set'} and the others are active`.trim(),
      ...(doc.markets?.geo_redirect === 'automatic_redirect' ? ['Given a visitor lands on the wrong market, when automatic redirection runs, then they reach their local market without losing the current page (EU visitors on EU country domains are not redirected)'] : doc.markets?.geo_redirect && doc.markets.geo_redirect !== 'none' ? [`Given a visitor lands on the wrong market, when the page loads, then a ${doc.markets.geo_redirect.replace(/_/g, ' ')} offers their local market`] : []),
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-FND-001'],
    spec_refs: ['/markets/list', '/markets/primary_markets', '/markets/geo_redirect'],
    gates: ['markets', 'multi_currency'],
    applies: (doc) => gate(doc, 'markets'),
    agent_prompt: (doc) => `Configure Shopify Markets for: ${markets(doc).map((m) => `${m.code} currency ${m.currency}, languages ${(m.languages ?? []).join('/')}, price strategy ${m.price_strategy ?? 'TBC'}${m.domain ? `, domain ${m.domain}` : ''}`).join('; ')}. Set ${doc.markets?.primary_markets?.[0] ?? 'the primary market (to confirm)'} as the store's primary market${(doc.markets?.primary_markets ?? []).length > 1 ? ` (lead markets: ${doc.markets.primary_markets.join(', ')})` : ''}. Use Shopify Markets (not expansion stores) unless engagement.markets.strategy says otherwise. Local market routing: ${doc.markets?.geo_redirect ? doc.markets.geo_redirect.replace(/_/g, ' ') : 'to confirm'} (the Geolocation app is retired; automatic redirection is in Online Store > Preferences). Present the plan for consultant approval before applying it.`,
  },
  {
    key: 'LWC-MKT-002',
    epic: 'markets',
    title: (doc) => `Translate the storefront into ${list(languages(doc))}`,
    user_story: 'As a shopper, I want the store in my language, so that I understand products, policies and checkout.',
    acceptance_criteria: (doc) => [
      ...languages(doc).map((l) => `Given the ${l} storefront, when a shopper browses home, collection, product, cart and policy pages, then no untranslated theme or content strings remain`),
      'Given each language, when the page source is inspected, then Shopify outputs hreflang alternates for every published language (no custom hreflang code)',
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'client',
    depends_on: ['LWC-MKT-001'],
    spec_refs: ['/markets/list/*/languages', '/markets/translation_method', '/markets/seo_per_language'],
    gates: ['markets'],
    applies: (doc) => languages(doc).length > 1,
    agent_prompt: (doc) => `Publish languages ${list(languages(doc))} and set up translation with ${doc.markets?.translation_method ?? 'the agreed method'}. Translate theme strings, navigation, policies, metafield content and SEO titles/descriptions. Rely on Shopify's native hreflang output.`,
  },
  {
    key: 'LWC-MKT-003',
    epic: 'markets',
    title: (doc) => `Set market pricing for ${list(markets(doc).map((m) => `${m.code} (${m.currency ?? 'currency TBC'})`))}`,
    user_story: 'As a pricing manager, I want each market to have deliberate prices in its currency, so that margins and price points are right everywhere.',
    description: (doc) => markets(doc).map((m) => `${m.code}: ${strategyText[m.price_strategy] ?? 'strategy to confirm'}`).join('; '),
    acceptance_criteria: (doc) => [
      ...markets(doc).map((m) => `Given the ${m.code} market, when a product is viewed, then the storefront shows ${strategyText[m.price_strategy] ?? 'prices per the agreed strategy'} in ${m.currency ?? 'the market currency'}`),
      'Given a market with fixed prices, when a product has no fixed price in that market, then the fallback (percentage adjustment or conversion) is explicit and reported before launch',
      'Given compare-at prices and discounts, when they apply in a market, then they display in that market\'s currency and rounding',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-MKT-001', 'LWC-CAT-001'],
    spec_refs: ['/markets/list/*/price_strategy', '/markets/list/*/currency', '/catalogue/pricing/market_specific', '/payments/multi_currency_settlement'],
    gates: ['multi_currency'],
    applies: (doc) => gate(doc, 'multi_currency') || markets(doc).some((m) => m.price_strategy === 'manual') || (markets(doc).length > 1 && doc.catalogue?.pricing?.market_specific === true),
    agent_prompt: (doc) => `Configure pricing per market in Shopify Markets: ${markets(doc).map((m) => `${m.code} ${m.currency ?? ''} — ${strategyText[m.price_strategy] ?? 'strategy to confirm'}`).join('; ')}. For fixed prices, set product-level prices on the market's catalog/price list (bulk via Admin API priceListFixedPricesAdd or Matrixify) and define the percentage adjustment fallback. For converted prices, set price rounding. Enable the local currencies in Shopify Payments${doc.payments?.multi_currency_settlement ? ' and confirm multi-currency payouts (settle in the local currency bank account where configured)' : ''}. Produce a report of products missing fixed prices. Present the price plan for approval before applying it.`,
  },
  {
    key: 'LWC-MKT-004',
    epic: 'markets',
    title: 'Collect duties and import taxes at checkout (DDP)',
    user_story: 'As an international shopper, I want to pay duties and import taxes at checkout, so that there are no surprise charges on delivery.',
    acceptance_criteria: (doc) => [
      `Given a cross-border order to ${listOr(markets(doc).filter((m) => !(doc.markets?.primary_markets ?? []).includes(m.code)).map((m) => m.code), 'an international market')}, when the shopper reaches checkout, then duties and import taxes are calculated and shown as a separate line`,
      'Given every product, when duties are calculated, then it has an HS code and country of origin in the product admin',
      'Given the shipping labels, when a DDP order ships, then the carrier service and customs documents match delivered-duty-paid terms',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-MKT-001', 'LWC-CAT-001'],
    spec_refs: ['/markets/duties_ddp', '/markets/ddp_markets', '/markets/list', '/shipping/carriers'],
    gates: ['markets'],
    applies: (doc) => doc.markets?.duties_ddp === true,
    agent_prompt: (doc) => `Enable collection of duties and import taxes ${doc.markets?.ddp_markets?.length ? `(DDP) for ${list(doc.markets.ddp_markets)} and DAP for the other international markets` : 'for the international markets'} in Settings > Taxes and duties (DDP or DAP per country, never both). Check eligibility first (unsupported destinations, carriers that support DDP labels) and report if a market is not eligible; duties can't be combined with tax overrides, manual tax rates or customer tax exemptions. Add HS codes and country of origin to every product (bulk via Admin API or Matrixify). Align carrier services (${listOr(doc.shipping?.carriers, 'carriers to confirm')}) with DDP terms and test orders crossing the ${listOr(doc.markets?.primary_markets, 'primary market')} border in each direction.`,
  },
  {
    key: 'LWC-MKT-005',
    epic: 'markets',
    title: 'Set up expansion stores for markets that need a separate store',
    user_story: 'As the business, I want separate expansion stores only where a market needs its own catalogue, operations or legal entity, so that complexity stays proportional.',
    acceptance_criteria: (doc) => [
      'Given the market list, when the store architecture is decided, then each market is assigned to the main store (Shopify Markets) or an expansion store with a written reason',
      'Given an expansion store, when it is created under the Plus organisation, then theme, apps, metafield definitions and staff roles are replicated from the main store by a documented process',
      `Given products and inventory, when they change in the source system, then every store stays in sync${doc.integrations?.length ? ' through the agreed integrations' : ''}`,
    ],
    gaia_tier: 'T3',
    points: 8,
    owner: 'consultant',
    depends_on: ['LWC-MKT-001'],
    spec_refs: ['/markets/topology/recommendation', '/markets/list', '/shopify/target_plan'],
    gates: ['markets'],
    applies: (doc) => ['expansion_stores', 'hybrid'].includes(doc.markets?.strategy),
    security_flags: ['auth'],
    agent_prompt: (doc) => `Strategy is ${doc.markets?.strategy}. For each market (${list(markets(doc).map((m) => m.code))}), recommend Shopify Markets on the main store unless there is a concrete need for a separate store (different legal entity, catalogue, fulfilment or B2B-only operation). Create approved expansion stores in the Plus organisation, replicate the theme via the repository, metafield and metaobject definitions via scripts, and apps by checklist. Use Shopify Plus organisation users for staff. Document how data stays in sync. Present the architecture decision for consultant approval before creating any store.`,
  },
];
