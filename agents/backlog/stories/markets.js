/**
 * @file markets.js — epic "Markets & internationalisation" (LWC-MKT-*)
 */

import { markets, languages, list, gate } from './helpers.js';

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
      `Given the primary market ${doc.markets?.primary_market ?? ''}, when Markets are reviewed in the admin, then it is the primary market and the others are active`.trim(),
      ...(doc.markets?.geo_redirect ? ['Given a visitor lands on the wrong market, when geo-redirect runs, then they are offered their local market without losing the current page'] : []),
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-FND-001'],
    spec_refs: ['/markets/list', '/markets/primary_market', '/markets/geo_redirect'],
    gates: ['markets', 'multi_currency'],
    applies: (doc) => gate(doc, 'markets'),
    agent_prompt: (doc) => `Configure Shopify Markets for: ${markets(doc).map((m) => `${m.code} currency ${m.currency}, languages ${(m.languages ?? []).join('/')}, price strategy ${m.price_strategy ?? 'TBC'}${m.domain ? `, domain ${m.domain}` : ''}`).join('; ')}. Set ${doc.markets?.primary_market} as primary. Use Shopify Markets (not expansion stores) unless engagement.markets.strategy says otherwise. Enable geo-redirect: ${doc.markets?.geo_redirect ? 'yes' : 'no'}. Present the plan for consultant approval before applying it.`,
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
];
