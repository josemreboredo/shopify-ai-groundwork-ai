/**
 * @file migration.js — epic "Data migration" (LWC-MIG-*)
 */

import { isMigration, exitFired, count, listOr, languages } from './helpers.js';

const data = (doc) => doc.migration?.data ?? [];
const migrates = (doc, what) => isMigration(doc) && data(doc).includes(what);
const source = (doc) => {
  const names = { woocommerce: 'WooCommerce', magento: 'Magento', shopware: 'Shopware', sfcc: 'Salesforce Commerce Cloud', bigcommerce: 'BigCommerce', custom: 'the custom platform', other: 'the current platform' };
  return names[doc.migration?.source_platform] ?? 'the current platform';
};
const flag1114 = (doc) => (exitFired(doc, '11.14')
  ? ['Given exit rule 11.14 (significant SEO equity or complex historical data), when this work is scheduled, then it runs in the dedicated migration track and not inside a store build sprint']
  : []);

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-MIG-001',
    epic: 'migration',
    title: (doc) => `Plan the ${source(doc)} migration and map data to Shopify`,
    user_story: 'As the client, I want a tested migration plan with a field-by-field mapping, so that nothing important is lost when we move to Shopify.',
    description: (doc) => `Data in scope: ${listOr(data(doc), 'to confirm')}. Volumes: ${count(doc.migration?.volumes?.products, 'unknown')} products, ${count(doc.migration?.volumes?.customers, 'unknown')} customers, ${count(doc.migration?.volumes?.orders, 'unknown')} orders, ${count(doc.migration?.volumes?.redirects, 'unknown')} redirects.`,
    acceptance_criteria: (doc) => [
      `Given the data in scope (${listOr(data(doc), 'to confirm')}), when the mapping is reviewed, then every source field is mapped, transformed or explicitly dropped with client sign-off`,
      'Given a sample export of 100 records per object, when it is imported to the development store, then the reconciliation report shows counts and field checks with no unexplained differences',
      'Given the cut-over approach, when the plan is approved, then it defines the content freeze, delta import window, rollback and owners',
      ...flag1114(doc),
    ],
    gaia_tier: 'T3',
    points: 5,
    owner: 'consultant',
    depends_on: ['LWC-CAT-001'],
    spec_refs: ['/migration/source_platform', '/migration/data', '/migration/volumes', '/migration/seo_equity', '/migration/historical_orders_required'],
    gates: ['migration'],
    security_flags: ['pii'],
    applies: isMigration,
    agent_prompt: (doc) => `Source: ${source(doc)}. Data: ${listOr(data(doc), 'to confirm')}. Volumes: products ${count(doc.migration?.volumes?.products, 'unknown')}, customers ${count(doc.migration?.volumes?.customers, 'unknown')}, orders ${count(doc.migration?.volumes?.orders, 'unknown')}, redirects ${count(doc.migration?.volumes?.redirects, 'unknown')}. Choose the tool (Matrixify or equivalent from the shortlist) and write the mapping workbook per object, the data-cleansing rules, the sample and full-run plan and the cut-over timeline (freeze, delta, DNS). Personal data exports stay in the client's secure storage and are deleted after launch; never paste them into prompts or tickets. ${exitFired(doc, '11.14') ? 'Exit rule 11.14 fired: plan this as a dedicated migration track. ' : ''}Present the plan for consultant approval.`,
  },
  {
    key: 'LWC-MIG-002',
    epic: 'migration',
    title: (doc) => `Migrate ${count(doc.migration?.volumes?.products, 'all')} products from ${source(doc)}`,
    user_story: 'As a merchandiser, I want all products, variants, images and attributes moved accurately, so that the catalogue is launch-ready.',
    acceptance_criteria: (doc) => [
      `Given the full product import, when it completes, then ${count(doc.migration?.volumes?.products, 'the expected number of')} products reconcile by SKU with variants, prices, images with alt text, metafields and inventory`,
      'Given product handles, when they are compared with source URLs, then handles are preserved where possible and every changed URL is added to the redirect list',
      ...(languages(doc).length > 1 ? ['Given translated source content, when it is imported, then translations are registered per language and not overwritten by machine translation'] : []),
      'Given a delta run, when it is repeated, then products are updated by handle or SKU without duplicates',
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-MIG-001', 'LWC-CAT-002'],
    spec_refs: ['/migration/data', '/migration/volumes/products', '/catalogue/custom_attributes'],
    gates: ['migration'],
    applies: (doc) => migrates(doc, 'products'),
    agent_prompt: (doc) => `Export products from ${source(doc)}, transform to the approved product model (options at most 3, category, metafields ${listOr(doc.catalogue?.custom_attributes, 'as mapped')}) and import with the chosen tool updating by handle. ${doc.catalogue?.data_source === 'erp' || doc.catalogue?.data_source === 'pim' ? 'Coordinate with the integration: decide which fields the migration seeds and which the integration owns afterwards. ' : ''}Produce a reconciliation report and a list of changed handles for redirects.`,
  },
  {
    key: 'LWC-MIG-003',
    epic: 'migration',
    title: (doc) => `Migrate ${count(doc.migration?.volumes?.customers, 'all')} customer accounts with consent status`,
    user_story: 'As a returning customer, I want my account to exist on the new store, so that I can sign in and see my details without re-registering.',
    acceptance_criteria: (doc) => [
      `Given the customer import, when it completes, then ${count(doc.migration?.volumes?.customers, 'the expected number of')} customers reconcile by email with addresses, tags and email marketing consent state and consent date preserved`,
      'Given a customer without recorded marketing consent in the source, when they are imported, then they are not subscribed to marketing',
      'Given customer accounts, when a migrated customer signs in with their email code, then they see their profile without needing a password or account invite (passwords cannot be migrated)',
      'Given the export files, when the import is signed off, then the files are deleted from all working locations and the deletion is logged',
    ],
    gaia_tier: 'T3',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-MIG-001', 'LWC-CUS-001'],
    spec_refs: ['/migration/data', '/migration/volumes/customers', '/customers/sign_in_methods', '/compliance/marketing_opt_in'],
    gates: ['migration'],
    security_flags: ['pii'],
    applies: (doc) => migrates(doc, 'customers'),
    agent_prompt: (doc) => `Import about ${count(doc.migration?.volumes?.customers, 'the agreed number of')} customers from ${source(doc)}: email, name, phone, addresses, tags, email and SMS marketing consent with opt-in level and date. Passwords cannot be migrated; with ${doc.customers?.account_type === 'classic' ? 'legacy accounts plan account activation emails' : 'new customer accounts no password is needed'}. Do not send any customer email from the import. Process personal data only on approved machines, never log or paste it, and delete exports after sign-off. Reconcile counts and consent totals.`,
  },
  {
    key: 'LWC-MIG-004',
    epic: 'migration',
    title: (doc) => `Import ${count(doc.migration?.volumes?.orders, 'all')} historical orders`,
    user_story: 'As a returning customer and as customer service, I want past orders visible in Shopify, so that support, returns and reorders work from day one.',
    acceptance_criteria: (doc) => [
      `Given the order import, when it completes, then ${count(doc.migration?.volumes?.orders, 'the expected number of')} orders reconcile in count and total value per year and currency`,
      'Given imported orders, when they are created, then no notifications are sent, inventory is not adjusted and no payment is captured',
      'Given a migrated customer, when they open their account, then their historical orders are listed and linked to the right customer',
      ...flag1114(doc),
    ],
    gaia_tier: 'T3',
    points: 8,
    owner: 'agent',
    depends_on: ['LWC-MIG-003'],
    spec_refs: ['/migration/historical_orders_required', '/migration/volumes/orders', '/migration/data'],
    gates: ['migration'],
    security_flags: ['pii'],
    applies: (doc) => migrates(doc, 'orders') && doc.migration?.historical_orders_required === true,
    agent_prompt: (doc) => `Import about ${count(doc.migration?.volumes?.orders, 'the agreed number of')} historical orders from ${source(doc)} with the chosen tool: send_receipt false, inventory behaviour bypass, financial and fulfilment status as historical, original dates, currency, tax lines and source order number in a metafield or tag. Agree with finance whether refunds and B2B orders are included. Run a 1% sample first, then full import in batches with reconciliation per year. Never log order personal data.`,
  },
  {
    key: 'LWC-MIG-005',
    epic: 'migration',
    title: (doc) => `Migrate ${[migrates(doc, 'content') ? 'pages and blog content' : '', migrates(doc, 'reviews') ? 'product reviews' : ''].filter(Boolean).join(' and ')}`,
    user_story: 'As a marketer, I want our content and reviews carried over, so that we keep SEO value and social proof.',
    acceptance_criteria: (doc) => [
      ...(migrates(doc, 'content') ? ['Given pages and blog posts, when they are imported, then titles, body, images, authors, dates, tags and SEO fields match the source and internal links point to new URLs'] : []),
      ...(migrates(doc, 'reviews') ? [`Given historical reviews, when they are imported into ${doc.marketing?.reviews?.app ?? 'the reviews app'}, then ratings, dates, verified status and product links reconcile with the source`] : []),
      'Given imported content, when the redirect list is built, then every old content URL has a mapping',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-MIG-001', 'LWC-MIG-002'],
    spec_refs: ['/migration/data', '/marketing/reviews/app'],
    gates: ['migration'],
    applies: (doc) => migrates(doc, 'content') || migrates(doc, 'reviews'),
    agent_prompt: (doc) => `${migrates(doc, 'content') ? `Export pages and blog posts from ${source(doc)}, clean markup (remove shortcodes and inline styles), re-host images in Shopify Files and import as pages and articles with SEO fields. ` : ''}${migrates(doc, 'reviews') ? `Export reviews and import them with ${doc.marketing?.reviews?.app ?? 'the reviews app'}'s importer mapped by product handle or SKU. ` : ''}Collect old URLs for the redirect story and reconcile counts.`,
  },
  {
    key: 'LWC-MIG-006',
    epic: 'migration',
    title: 'Migrate gift card balances',
    user_story: 'As a gift card holder, I want my remaining balance to work on the new store, so that I do not lose money.',
    acceptance_criteria: [
      'Given active gift cards in the source, when they are imported, then codes, remaining balances, currencies and expiry dates reconcile exactly with the source liability report',
      'Given a migrated code, when it is redeemed in test mode, then the correct balance is deducted',
      'Given cut-over, when the source store closes, then the delta of balances used since the first import is re-synced before launch',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-MIG-001', 'LWC-PAY-004'],
    spec_refs: ['/migration/data', '/migration/source_platform'],
    gates: ['migration'],
    security_flags: ['payments'],
    applies: (doc) => migrates(doc, 'gift_cards'),
    agent_prompt: (doc) => `Export active gift cards with codes and balances from ${source(doc)} and import them to Shopify (gift card import with custom codes requires Shopify Plus; use the Admin API giftCardCreate or the migration tool). Treat codes as payment instruments: never log or share them in plain text. Reconcile total liability with finance and plan a delta re-sync at cut-over.`,
  },
  {
    key: 'LWC-MIG-007',
    epic: 'migration',
    title: (doc) => `Map and import ${count(doc.migration?.volumes?.redirects, 'all')} URL redirects`,
    user_story: 'As a marketer, I want every old URL to redirect to its best new page, so that we keep search rankings and no customer hits a dead link.',
    acceptance_criteria: (doc) => [
      `Given the source URL inventory (crawl, sitemap and top landing pages from analytics), when the redirect map is built, then all ${count(doc.migration?.volumes?.redirects, 'known')} URLs map to a relevant new URL, not the home page`,
      'Given the redirect import, when a crawler requests every old URL on the new domain, then each returns a single 301 hop to a 200 page',
      'Given launch day, when Search Console and 404 logs are checked daily for two weeks, then new 404s are redirected within one business day',
      ...flag1114(doc),
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-MIG-002'],
    spec_refs: ['/migration/volumes/redirects', '/migration/seo_equity', '/marketing/seo/owner'],
    gates: ['migration'],
    applies: (doc) => isMigration(doc) && (data(doc).includes('redirects') || ['moderate', 'significant'].includes(doc.migration?.seo_equity)),
    agent_prompt: (doc) => `SEO equity: ${doc.migration?.seo_equity ?? 'to confirm'}. Build the redirect map for about ${count(doc.migration?.volumes?.redirects, 'the known number of')} URLs from ${source(doc)}: crawl the live site, merge sitemap and analytics landing pages, map products, categories, content and paginated or filtered URLs to their best Shopify equivalent (Shopify URLs are /products/, /collections/, /pages/, /blogs/). ${languages(doc).length > 1 ? 'Include language and market prefixes. ' : ''}Import with URL redirects CSV or the migration tool, then verify every URL with a crawler (single 301 hop). Share the map with the SEO owner (${doc.marketing?.seo?.owner ?? 'to confirm'}) for approval.`,
  },
];
