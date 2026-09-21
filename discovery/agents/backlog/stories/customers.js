/**
 * @file customers.js — epic "Customers & B2B" (LWC-CUS-*)
 */

import { isB2b, list, listOr, count, markets, isMigration, themeName, storeName } from './helpers.js';

/** Customer service answers, and the words a consultant uses for them. */
const service = (doc) => doc.service ?? {};
const SERVICE_LABEL = { shopify_inbox: 'Shopify Inbox', helpdesk_app: 'a helpdesk app', external_helpdesk: 'a helpdesk outside Shopify', email_only: 'an email inbox', none: 'nowhere yet' };
const CONTACT_LABEL = { email_only: 'in an email inbox', into_the_helpdesk: 'in the helpdesk', into_a_crm: 'in the CRM', none: 'nowhere — there is no form' };

/** Payment terms in words, without "none". @param {object} doc */
const terms = (doc) => (doc.b2b?.payment_terms ?? []).filter((t) => t !== 'none').map((t) => t.replace(/_/g, ' '));

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-CUS-001',
    epic: 'customers',
    title: 'Configure customer accounts and account features',
    user_story: 'As a returning customer, I want to sign in easily and see my orders and details, so that reordering and tracking are simple.',
    acceptance_criteria: (doc) => [
      `Given the customer accounts setting, when a shopper signs in, then customer accounts use ${listOr((doc.customers?.sign_in_methods ?? []).map((m) => m.replace(/_/g, ' ')), 'a one-time email code')} and no password`,
      ...(doc.customers?.account_features ?? []).filter((f) => f !== 'none').map((f) => `Given a signed-in customer, when they open their account, then "${f.replace(/_/g, ' ')}" is available and translated`),
      'Given the account pages, when they render, then branding matches the checkout and accounts editor settings on mobile and desktop',
    ],
    gaia_tier: 'T2',
    points: 2,
    owner: 'agent',
    depends_on: ['LWC-PAY-002'],
    spec_refs: ['/customers/sign_in_methods', '/customers/account_requirement', '/customers/account_features'],
    security_flags: ['auth', 'pii'],
    applies: () => true,
    agent_prompt: (doc) => `Use Shopify customer accounts (legacy customer accounts are deprecated since 2026-02-26; B2B, store credit and self-serve returns require customer accounts). Configure: sign-in methods ${listOr((doc.customers?.sign_in_methods ?? []).map((m) => m.replace(/_/g, ' ')), 'one-time email code')}, sign-in links in the theme header, account features ${listOr((doc.customers?.account_features ?? []).filter((f) => f !== 'none').map((f) => f.replace(/_/g, ' ')), 'order history and addresses')}, and any customer account UI extensions only if an agreed feature needs one. ${isMigration(doc) ? 'Migrated customers do not need passwords with new customer accounts — coordinate the welcome communication with the migration story. ' : ''}Do not store tokens in cookies without HttpOnly and Secure.`,
  },
  {
    key: 'LWC-CUS-002',
    epic: 'customers',
    title: (doc) => `Set up B2B companies and locations${doc.b2b?.expected_accounts ? ` for about ${count(doc.b2b.expected_accounts, '')} accounts` : ''}`,
    user_story: 'As a wholesale buyer, I want a company account with my locations and colleagues, so that I can order for my business.',
    acceptance_criteria: (doc) => [
      'Given the wholesale customer list, when companies are imported, then each company has its locations, billing and shipping addresses, contacts with roles and the correct catalog assigned',
      `Given about ${count(doc.b2b?.expected_accounts, 'the expected number of')} accounts, when the import completes, then counts reconcile with the source list and errors are reported per row`,
      ...(doc.b2b?.approval_workflow ? ['Given a new business requests an account, when it submits the request form, then the request waits for staff approval and the buyer is notified of the decision'] : []),
      'Given a B2B contact signs in, when they browse, then they shop in the context of their company location',
    ],
    gaia_tier: 'T3',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-CUS-001'],
    spec_refs: ['/b2b/enabled', '/b2b/company_accounts', '/b2b/expected_accounts', '/b2b/approval_workflow', '/b2b/approach'],
    gates: ['b2b'],
    security_flags: ['pii', 'auth'],
    applies: (doc) => isB2b(doc),
    agent_prompt: (doc) => `Approach: ${doc.b2b?.approach ?? 'shopify_b2b'} (Shopify B2B runs on every plan from Basic; company-specific or more than 3 catalogs, deposits and partial payments need Shopify Plus). Define the company data model (company, locations, contacts, roles such as Location admin and Ordering only, external IDs from ${doc.integrations?.find((i) => i.category === 'erp')?.system ?? 'the source system'}). Import about ${count(doc.b2b?.expected_accounts, 'the agreed number of')} companies with Admin API companyCreate/companyLocationCreate in batches or the B2B company CSV import, never logging contact personal data. ${doc.b2b?.approval_workflow ? 'Configure the company account request form and staff approval process (Shopify Flow notification to the wholesale team). ' : ''}Present the data model and a 10-row sample for approval before the full import.`,
  },
  {
    key: 'LWC-CUS-003',
    epic: 'customers',
    title: (doc) => `Configure B2B catalogs and price lists${doc.b2b?.volume_discounts ? ' with volume pricing and quantity rules' : ''}`,
    user_story: 'As a wholesale buyer, I want to see my negotiated tier prices and order in the right pack sizes, so that I can order without calling sales.',
    acceptance_criteria: (doc) => [
      'Given each wholesale price tier, when a catalog is created, then it has a price list with fixed prices or a percentage adjustment in the right currency and the agreed product publication',
      'Given a buyer of a company location, when they view a product, then they see their catalog price and retail-only products are hidden',
      ...(doc.b2b?.volume_discounts ? ['Given volume pricing and quantity rules, when a buyer changes quantity, then minimums, increments, maximums and tier prices are shown and enforced in cart and checkout'] : []),
      `Given ${markets(doc).length > 1 ? 'buyers in different markets' : 'a buyer'}, when they check out, then prices are in the currency of their catalog`,
    ],
    gaia_tier: 'T3',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-CUS-002', 'LWC-CAT-001'],
    spec_refs: ['/b2b/price_lists', '/b2b/volume_discounts', '/catalogue/pricing/multiple_price_tiers', '/catalogue/pricing/volume_pricing'],
    gates: ['b2b'],
    applies: (doc) => isB2b(doc) && (doc.b2b?.price_lists === true || doc.b2b?.volume_discounts === true || doc.catalogue?.pricing?.multiple_price_tiers === true),
    agent_prompt: (doc) => `Create B2B catalogs for each wholesale tier and assign them to company locations. For each catalog create a price list (fixed prices via priceListFixedPricesAdd or a percentage adjustment) in the catalog currency and publish only wholesale-eligible products.${doc.b2b?.volume_discounts ? ' Add quantity rules (minimum, increment, maximum) and quantity price breaks to the price lists.' : ''} Prices come from ${doc.catalogue?.data_source === 'erp' ? 'the ERP via the integration — define the mapping, not manual entry' : 'the client price file'}. Present the tier/catalog matrix for approval before creating anything.`,
  },
  {
    key: 'LWC-CUS-004',
    epic: 'customers',
    title: (doc) => `Configure B2B payment terms and checkout${terms(doc).length ? `: ${list(terms(doc))}` : ''}`,
    user_story: 'As a wholesale buyer, I want to pay on the terms agreed with my company, so that ordering fits our purchasing process.',
    acceptance_criteria: (doc) => [
      terms(doc).length
        ? `Given the terms ${list(terms(doc))}, when they are assigned to company locations, then orders show the due date and outstanding balance in the admin and customer account`
        : 'Given payment terms are still open with finance, when the story starts, then the agreed terms are confirmed in writing before any configuration',
      'Given a company location checkout setting, when a buyer places an order, then it is submitted as an order or as a draft for review exactly as configured for that location',
      'Given a B2B checkout, when the buyer completes it, then the purchase order number field and the company shipping address rules behave as configured',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-CUS-002', 'LWC-PAY-001'],
    spec_refs: ['/b2b/payment_terms', '/b2b/approval_workflow'],
    gates: ['b2b'],
    security_flags: ['payments'],
    applies: (doc) => isB2b(doc),
    agent_prompt: (doc) => `Payment terms: ${listOr(terms(doc), 'not yet agreed — confirm with finance first')}. Configure per company location: payment terms (net days, due on fulfilment or fixed date), deposit if required, whether orders are submitted for merchant review as drafts${doc.b2b?.approval_workflow ? ' (approval workflow is in scope)' : ''}, shipping address editing and the purchase order number requirement. Set up payment reminders and a Shopify Flow alert for overdue orders. Test ordering on terms, paying an invoice later and a draft-order approval.`,
  },
  {
    key: 'LWC-CUS-005',
    epic: 'customers',
    title: 'Adapt the storefront for B2B buyers',
    user_story: 'As a wholesale buyer, I want a storefront that shows my prices, pack rules and a quick way to order many items, so that large orders take minutes.',
    acceptance_criteria: (doc) => [
      'Given a signed-in B2B buyer, when they browse collections and products, then catalog prices, quantity rules and volume price breaks are shown and retail-only promotions are hidden',
      'Given the quick order list block, when a buyer enters quantities for several variants, then all lines are added to cart in one action',
      'Given a guest or retail customer, when they browse, then no wholesale prices or B2B blocks are visible',
      `Given a B2B buyer with several company locations, when they sign in, then they can switch location and prices update`,
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'developer',
    depends_on: ['LWC-CUS-003', 'LWC-THM-005'],
    spec_refs: ['/b2b/enabled', '/b2b/volume_discounts', '/meta/client/business_model'],
    gates: ['b2b'],
    applies: (doc) => isB2b(doc),
    agent_prompt: (doc) => `Business model: ${doc.meta?.client?.business_model ?? 'hybrid'}. In ${themeName(doc)}, add the quick order list and volume pricing/quantity rule blocks to product and collection templates, show B2B-specific messaging with customer.b2b? and customer.current_location conditions, hide retail promotional blocks for B2B buyers, and add a location switcher link. Do not build custom price logic in Liquid — prices come from catalogs. Test as guest, retail customer and B2B buyer with two locations.`,
  },
  {
    key: 'LWC-CUS-006',
    epic: 'customers',
    title: (doc) => `Set up customer segments and tags: ${listOr(doc.customers?.segments, 'agreed segments')}`,
    user_story: 'As a marketer, I want customers grouped into useful segments, so that campaigns and service are relevant.',
    acceptance_criteria: (doc) => [
      ...(doc.customers?.segments ?? []).map((s) => `Given the segment "${s}", when it is built, then its rule is documented and it lives in ${doc.customers?.segmentation_source === 'esp' ? doc.marketing?.esp?.platform ?? 'the ESP' : 'Shopify customer segments'} as the single master`),
      `Given existing tags ${listOr(doc.customers?.tags_in_use, 'in use')}, when they are reviewed, then each is kept, replaced by a segment or metafield, or retired with an owner`,
      'Given segments that drive automation, when a customer changes segment, then the dependent Flow or ESP automation reacts within one day',
    ],
    gaia_tier: 'T1',
    points: 2,
    owner: 'consultant',
    depends_on: ['LWC-CUS-001'],
    spec_refs: ['/customers/segments', '/customers/segmentation_source', '/customers/tags_in_use', '/marketing/esp/segments_master'],
    security_flags: ['pii'],
    applies: (doc) => (doc.customers?.segments?.length ?? 0) > 0 || (doc.customers?.tags_in_use?.length ?? 0) > 0,
    agent_prompt: (doc) => `Segments: ${listOr(doc.customers?.segments, 'none listed')}; source of truth: ${doc.customers?.segmentation_source ?? 'shopify'}. Build Shopify customer segments with ShopifyQL segment queries for segments mastered in Shopify; for ESP-mastered segments, define which Shopify fields and tags sync to ${doc.marketing?.esp?.platform ?? 'the ESP'}. Review tags ${listOr(doc.customers?.tags_in_use, 'in use')} and propose replacements. Never export customer lists outside Shopify or the ESP.`,
  },
  /*
   * Customer service, which nothing asked about until now.
   *
   * The bank had one question on it and that one was about China. So a client
   * running Gorgias and taking orders by phone was undiscovered scope: the
   * engine could not price what nobody told it. Questions 6.5.1 to 6.5.4 ask;
   * these two deliver.
   */
  {
    key: 'LWC-CUS-007',
    epic: 'customers',
    title: (doc) => `Route customer questions into ${service(doc).platform_name || SERVICE_LABEL[service(doc).platform] || 'the agreed place'}`,
    user_story: 'As a customer-service agent, I want a question to arrive where I work with the order already attached, so that I am not searching two systems to answer one email.',
    description: (doc) => `Service platform: ${SERVICE_LABEL[service(doc).platform] ?? 'to confirm'}${service(doc).platform_name ? ` (${service(doc).platform_name})` : ''}. Contact form delivers: ${CONTACT_LABEL[service(doc).contact_form] ?? 'to confirm'}.`,
    acceptance_criteria: (doc) => [
      `Given a shopper using the contact form, when they submit it, then it arrives ${CONTACT_LABEL[service(doc).contact_form] ?? 'where the client agreed'} and the sender gets a confirmation`,
      ...(service(doc).contact_form === 'into_the_helpdesk' || service(doc).contact_form === 'into_a_crm'
        ? ['Given a submission, when it creates a case or a record, then it carries the customer and, where the shopper gave one, the order reference']
        : []),
      ...(service(doc).platform === 'helpdesk_app' || service(doc).platform === 'external_helpdesk'
        ? ['Given an agent opening a conversation, when they read it, then the order history is visible without leaving the helpdesk',
           'Given the connection to the helpdesk, when it fails, then somebody is alerted rather than the queue quietly emptying']
        : []),
      'Given the routing, when it is handed over, then who answers, within what time and in which languages is written down',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'developer',
    depends_on: ['LWC-THM-003'],
    spec_refs: ['/service/platform', '/service/platform_name', '/service/contact_form', '/markets/list'],
    applies: (doc) => {
      const v = service(doc);
      return Boolean(v.platform && v.platform !== 'none' && v.platform !== 'not_sure')
        || Boolean(v.contact_form && v.contact_form !== 'none' && v.contact_form !== 'not_sure');
    },
    agent_prompt: (doc) => `Wire customer service for ${storeName(doc)}. Platform: ${SERVICE_LABEL[service(doc).platform] ?? 'to confirm'}${service(doc).platform_name ? ` (${service(doc).platform_name})` : ''}. Contact form delivers ${CONTACT_LABEL[service(doc).contact_form] ?? 'to confirm'}. Check the App Store registry for a native connector before assuming anything is custom-built. Where a case or CRM record is created, carry the customer and the order reference. Add monitoring so a broken connection is noticed. Document who answers, in what time and in which languages${markets(doc).length > 1 ? ` across ${list(markets(doc).map((m) => m.code))}` : ''}.`,
  },
  {
    key: 'LWC-CUS-008',
    epic: 'customers',
    title: 'Let staff create orders on a customer\u2019s behalf',
    user_story: 'As a sales assistant, I want to build an order for a customer and send them an invoice, so that a phone or showroom sale does not have to be re-typed somewhere else.',
    acceptance_criteria: (doc) => [
      'Given a customer on the phone or in a showroom, when staff build a draft order, then they can add products, apply the agreed discount and send an invoice to pay',
      `Given a draft order${markets(doc).length > 1 ? ' for any market' : ''}, when it is priced, then it picks up the correct market price, currency and tax rather than the default`,
      'Given the permission to create orders, when it is granted, then it is granted to the roles that need it and to no one else, and discount limits are part of that decision',
      ...(isB2b(doc) ? ['Given a B2B buyer with a company account, when an order is built for them, then it uses their price list and payment terms'] : []),
      'Given a draft order that is never paid, when the agreed window passes, then what happens to it is written down and has an owner',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-CUS-001'],
    spec_refs: ['/service/orders_on_behalf', '/b2b/enabled', '/delivery/admin_roles'],
    security_flags: ['pii'],
    applies: (doc) => service(doc).orders_on_behalf === true,
    agent_prompt: (doc) => `Set up draft orders for ${storeName(doc)}: the staff permission, the discount limits per role, and the invoice flow. Test that a draft order takes the right market price, currency and tax${isB2b(doc) ? ', and that a company account buyer gets their price list and payment terms' : ''}. Agree what happens to an unpaid draft and who owns it. Train the people who will use it and put it in the runbook.`,
  },
];
