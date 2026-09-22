/**
 * @file checkout.js — epic "Payments & checkout" (LWC-PAY-*)
 */

import { markets, list, listOr, isB2b, hasProductType } from './helpers.js';

const methods = (doc) => [...new Set([...(doc.payments?.providers ?? []), ...(doc.payments?.local_methods ?? []), ...(doc.payments?.bnpl ?? [])])];
const extensionsOf = (doc) => [...(doc.checkout?.extensions ?? []).map((e) => e.replace(/_/g, ' ')), ...(doc.checkout?.custom_fields ?? [])];
const giftCardsInScope = (doc) => hasProductType(doc, 'gift_card') || doc.checkout?.gift_cards === true || doc.promotions?.gift_cards?.as_product === true || doc.promotions?.gift_cards?.as_reward === true;

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-PAY-001',
    epic: 'checkout',
    title: (doc) => `Activate payment methods: ${listOr(methods(doc), 'Shopify Payments')}`,
    user_story: 'As a shopper, I want to pay with the methods I trust in my country, so that I complete my purchase.',
    acceptance_criteria: (doc) => [
      ...methods(doc).map((m) => `Given ${m} is activated, when a test order is placed in test mode, then the payment is authorised, the order is created and a refund succeeds`),
      `Given each market (${listOr(markets(doc).map((mk) => `${mk.code} ${mk.currency ?? ''}`.trim()), 'the primary market')}), when a shopper reaches the payment step, then only the methods agreed for that market and currency are offered`,
      'Given the payment set-up, when it is reviewed, then card data is only handled by Shopify-hosted checkout or the provider and no card data touches theme or app code',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-FND-001'],
    spec_refs: ['/payments/providers', '/payments/local_methods', '/payments/bnpl', '/payments/multi_currency_settlement', '/payments/pci_scope'],
    security_flags: ['payments'],
    applies: () => true,
    agent_prompt: (doc) => `Configure payments on the build store: ${listOr(doc.payments?.providers, 'Shopify Payments')} as providers${doc.payments?.local_methods?.length ? `, local methods ${list(doc.payments.local_methods)}` : ''}${doc.payments?.bnpl?.length ? `, buy-now-pay-later ${list(doc.payments.bnpl)}` : ''}. Prefer methods available inside Shopify Payments; install a payment app from the Shopify App Store only for methods Shopify Payments does not offer. Set availability per market and currency. PCI scope is ${doc.payments?.pci_scope ?? 'shopify_hosted'} — keep all card handling in Shopify-hosted checkout. The client owner completes KYC/merchant onboarding; never enter or store their banking or identity documents. Run test-mode orders and refunds per method and record results.`,
  },
  {
    key: 'LWC-PAY-002',
    epic: 'checkout',
    title: 'Brand the checkout and configure checkout settings',
    user_story: 'As a shopper, I want a checkout that looks like the brand and asks only what is needed, so that I finish quickly and confidently.',
    acceptance_criteria: (doc) => [
      'Given the checkout and accounts editor, when branding is applied, then logo, colours, typography and corner radius match the theme tokens on mobile and desktop',
      `Given the customer contact settings, when a shopper checks out, then account creation follows the "${doc.customers?.account_requirement ?? 'optional'}" rule and only required fields are mandatory`,
      ...(doc.compliance?.marketing_opt_in ? ['Given the marketing consent checkbox, when checkout loads, then it is unchecked by default and its wording is approved by legal'] : []),
      'Given the checkout languages, when a shopper switches market or language, then checkout text is translated and policies link correctly',
    ],
    gaia_tier: 'T2',
    points: 2,
    owner: 'agent',
    depends_on: ['LWC-THM-001', 'LWC-PAY-001'],
    spec_refs: ['/checkout/customisation', '/customers/account_requirement', '/compliance/marketing_opt_in'],
    applies: () => true,
    agent_prompt: (doc) => `Apply brand settings in the checkout and accounts editor (logo, colours, fonts, corner radius, header and footer) matching the theme's settings; ${(doc.checkout?.customisation ?? []).includes('checkout_branding_api_styling') ? 'use the Checkout Branding API for styles the editor does not expose (Plus). ' : ''}Configure checkout settings: customer contact method, account requirement (${doc.customers?.account_requirement ?? 'optional'}), required name/company/address line 2/phone fields, address autocomplete, marketing consent checkbox (unchecked by default), order processing and abandoned checkout emails (off if the ESP sends them). Do not use checkout.liquid or scripts — they are no longer supported.`,
  },
  {
    key: 'LWC-PAY-003',
    scope: 'Deliver the agreed checkout requirements with native settings or UI extensions',
    epic: 'checkout',
    title: (doc) => `Deliver ${extensionsOf(doc).length} checkout requirement${extensionsOf(doc).length === 1 ? '' : 's'} with native settings or UI extensions`,
    description: (doc) => `Requirements: ${listOr(extensionsOf(doc), 'to confirm')}.`,
    user_story: 'As a shopper or business buyer, I want the extra information and reassurance I need inside checkout, so that I can complete my order correctly.',
    acceptance_criteria: (doc) => [
      ...extensionsOf(doc).map((e) => `Given the requirement "${e}", when it is analysed, then it is delivered by a native setting where one exists (for example the B2B purchase order number) or by a checkout UI extension placed through the checkout editor`),
      'Given each extension, when it is deployed with shopify app deploy, then it passes shopify app build, renders in the target location on mobile and desktop and has translations for every checkout language',
      'Given collected values, when an order is placed, then they are saved as metafields or attributes on the order and visible to operations',
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'developer',
    depends_on: ['LWC-FND-002', 'LWC-PAY-002'],
    gates: ['checkout_extensibility'],
    spec_refs: ['/checkout/customisation', '/checkout/extensions', '/checkout/custom_fields'],
    security_flags: ['secrets'],
    applies: (doc) => (doc.checkout?.customisation ?? []).some((c) => ['checkout_step_blocks_or_fields', 'thank_you_order_status_blocks'].includes(c)) && extensionsOf(doc).length > 0,
    agent_prompt: (doc) => `Requirements: ${listOr(extensionsOf(doc), 'none listed')}. For each, check native options first: ${isB2b(doc) ? 'B2B checkout already has a purchase order number field and company locations store a tax registration ID — do not rebuild these. ' : ''}Scaffold a custom app with Shopify CLI (shopify app init) and add checkout UI extensions with shopify app generate extension, using Polaris checkout components and the latest stable API version. Store values with the applyMetafieldsChange / attribute APIs on the order. Information, shipping and payment step targets require Shopify Plus; Thank you and Order status targets work on all plans. Keep app credentials in the CLI environment only. Validate with shopify app build before deploying to the build store.`,
  },
  {
    key: 'LWC-PAY-004',
    scope: 'Set up gift cards and store credit',
    epic: 'checkout',
    title: (doc) => `Set up ${[giftCardsInScope(doc) ? 'gift cards' : '', doc.checkout?.store_credit ? 'store credit' : ''].filter(Boolean).join(' and ')}`,
    user_story: 'As a shopper, I want to buy, receive and redeem gift cards and store credit easily, so that gifting and refunds are simple.',
    acceptance_criteria: (doc) => [
      ...(giftCardsInScope(doc) ? [`Given the gift card product, when a shopper buys a ${doc.promotions?.gift_cards?.format ?? 'digital'} gift card, then the recipient receives the code by email on the chosen date and it is redeemable at checkout in the market currency`] : []),
      ...(doc.promotions?.gift_cards?.as_reward ? ['Given a reward or goodwill gesture, when staff or a Flow workflow issues a gift card, then it is sent to the customer with the agreed expiry'] : []),
      ...(doc.checkout?.store_credit ? ['Given a refund to store credit, when a logged-in customer checks out, then the store credit balance can be applied'] : []),
      `Given gift card expiry rules, when a card is issued, then ${doc.promotions?.gift_cards?.expiry ? 'the agreed expiry is set and legal for every market' : 'it does not expire'}`,
    ],
    gaia_tier: 'T1',
    points: 2,
    owner: 'agent',
    depends_on: ['LWC-PAY-001'],
    spec_refs: ['/checkout/gift_cards', '/checkout/store_credit', '/promotions/gift_cards/as_product', '/promotions/gift_cards/as_reward', '/promotions/gift_cards/format', '/catalogue/product_types'],
    security_flags: ['payments'],
    applies: (doc) => giftCardsInScope(doc) || doc.checkout?.store_credit === true,
    agent_prompt: (doc) => `${giftCardsInScope(doc) ? `Create the native gift card product with agreed denominations, image and the gift card template in the theme; enable recipient name, message and send date. Format: ${doc.promotions?.gift_cards?.format ?? 'digital'}${doc.promotions?.gift_cards?.format === 'physical' || doc.promotions?.gift_cards?.format === 'both' ? ' — physical cards need printed codes from an approved supplier or POS' : ''}. ` : ''}${doc.promotions?.gift_cards?.as_reward ? 'Create a Shopify Flow workflow or staff SOP to issue reward gift cards. ' : ''}${doc.checkout?.store_credit ? 'Enable store credit refunds (new customer accounts required) and document when staff issue credit. ' : ''}Set expiry: ${doc.promotions?.gift_cards?.expiry ? 'as agreed and legally checked per market' : 'none'}. Customise the gift card notification in every language. Test purchase and redemption in test mode.`,
  },
  {
    key: 'LWC-PAY-005',
    epic: 'checkout',
    title: 'Add a post-purchase upsell offer',
    user_story: 'As the business, I want to offer a relevant add-on right after purchase, so that average order value rises without hurting conversion.',
    acceptance_criteria: [
      'Given a completed checkout, when the upsell offer is shown, then the shopper can accept it in one click without re-entering payment details',
      'Given an accepted offer, when the order is viewed, then the item is added to the original order with correct tax and shipping',
      'Given the conversion rate, when the offer runs for two weeks, then its acceptance rate and any drop in completed orders are reported',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-PAY-001'],
    spec_refs: ['/checkout/post_purchase_upsell'],
    security_flags: ['payments'],
    applies: (doc) => doc.checkout?.post_purchase_upsell === true,
    agent_prompt: 'Shortlist one post-purchase upsell app built on Shopify post-purchase checkout extensions (or Thank you page extensions for non-charging offers) with cost for approval. Configure offer rules from merchandising (products, markets, exclusions), translate the offer, and test acceptance in test mode including tax and shipping recalculation. Do not use any approach that re-collects card data.',
  },
  {
    key: 'LWC-PAY-006',
    epic: 'checkout',
    title: 'Set up fraud review for risky orders',
    user_story: 'As an operations manager, I want risky orders held for review before fulfilment, so that we avoid chargebacks on high-value goods.',
    acceptance_criteria: [
      'Given an order with a high or medium fraud risk recommendation, when it is created, then a Shopify Flow workflow holds fulfilment, tags the order and notifies the reviewer',
      'Given a reviewed order, when the reviewer approves or cancels it, then the fulfilment hold is released or the payment is voided and refunded',
      'Given payment capture settings, when manual review is required, then capture timing is set so that cancelled orders are not charged',
    ],
    gaia_tier: 'T1',
    points: 2,
    owner: 'agent',
    depends_on: ['LWC-PAY-001'],
    spec_refs: ['/checkout/fraud_manual_review', '/payments/providers'],
    security_flags: ['payments'],
    applies: (doc) => doc.checkout?.fraud_manual_review === true,
    agent_prompt: (doc) => `Use Shopify Fraud Analysis risk recommendations. Create a Shopify Flow workflow: on order risk analysed, if risk is high or medium then hold fulfilment orders, add a review tag and notify the reviewer (internal email, no customer data in the message body beyond the order number). Set payment capture to manual or on fulfilment for ${listOr(doc.payments?.providers, 'the providers')} if needed. Write the review SOP.`,
  },
  {
    key: 'LWC-PAY-007',
    epic: 'checkout',
    title: 'Enforce order restrictions with a cart and checkout validation function',
    user_story: 'As the business, I want checkout to block orders that break our rules, so that we do not have to cancel them afterwards.',
    acceptance_criteria: (doc) => [
      ...(doc.checkout?.order_restrictions ?? []).filter((r) => r !== 'none').map((r) => r.replace(/_/g, ' ')).map((r) => `Given the rule "${r}", when a cart breaks it, then checkout shows a clear translated error and the order cannot be completed`),
      'Given a valid cart, when the function runs, then checkout completes with no added latency visible to the shopper',
      'Given the function, when unit tests run, then every rule has passing and failing input fixtures',
    ],
    gaia_tier: 'T3',
    points: 5,
    owner: 'developer',
    depends_on: ['LWC-FND-002', 'LWC-PAY-002'],
    gates: ['checkout_extensibility'],
    spec_refs: ['/checkout/order_restrictions'],
    security_flags: ['secrets'],
    applies: (doc) => (doc.checkout?.order_restrictions ?? []).some((r) => r !== 'none'),
    agent_prompt: (doc) => `Rules: ${list((doc.checkout?.order_restrictions ?? []).filter((r) => r !== 'none').map((r) => r.replace(/_/g, ' ')))}. First check whether native settings cover a rule (market exclusions, shipping zones, product availability per market, B2B quantity rules). For the rest, scaffold a Cart and Checkout Validation Function with Shopify CLI in the store's custom app, read thresholds from a metafield on the validation so merchants can change them, return localised error messages, add unit tests with input fixtures and deploy with shopify app deploy to the build store.`,
  },
  /*
   * Accelerated checkout, which the bank asked about (Q4.1.6) and nothing built.
   *
   * These buttons are not a toggle. They sit beside Add to cart on the product
   * page and take the buyer straight past the cart, so anything the cart page
   * carries — a gift message, an upsell, a delivery date — is skipped, and the
   * client rarely realises that until after launch. Shopify's own documented
   * limits are the ones to design against: a buyer can take two of one variant
   * but not two different variants of the same product, split shipping does not
   * apply to accelerated checkouts at all, and the buttons order themselves.
   */
  {
    key: 'LWC-PAY-008',
    epic: 'checkout',
    title: (doc) => `Enable accelerated checkout${listOr(doc.payments?.accelerated_checkouts, '') ? `: ${list(doc.payments.accelerated_checkouts)}` : ''}`,
    user_story: 'As a shopper in a hurry, I want to buy from the product page with the payment details I already have, so that I am not filling a form to buy one thing.',
    description: (doc) => `Requested: ${listOr(doc.payments?.accelerated_checkouts, 'to confirm')}.`,
    acceptance_criteria: (doc) => [
      `Given the accelerated methods in scope (${listOr(doc.payments?.accelerated_checkouts, 'to confirm')}), when they are activated, then each appears beside Add to cart and in the Express Checkout section of the checkout`,
      'Given an accelerated purchase, when the buyer uses a button on the product page, then they go straight to checkout and the cart page is skipped — so anything the cart page carries has been checked against that and either moved or accepted as lost',
      'Given a buyer who wants two different variants of the same product, when they try an accelerated button, then the team knows this is not possible and the normal path is still obvious on the page',
      'Given split shipping, when the order would otherwise split, then the team knows it does not apply to accelerated checkouts, and the cases that matter are listed',
      'Given the buttons, when they render, then the order is left to Shopify rather than forced, because it is chosen per buyer',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'developer',
    depends_on: ['LWC-PAY-001'],
    spec_refs: ['/payments/accelerated_checkouts', '/payments/providers', '/checkout/post_purchase_upsell'],
    security_flags: ['payments'],
    applies: (doc) => (doc.payments?.accelerated_checkouts ?? []).some((x) => x !== 'none' && x !== 'not_sure'),
    agent_prompt: (doc) => `Activate accelerated checkouts (${listOr(doc.payments?.accelerated_checkouts, 'to confirm')}) and show the buttons on the product page. Before sign-off, walk the cart page with the client and list what an accelerated purchase skips — gift messages, upsells, delivery notes — and decide for each whether it moves into checkout or is accepted as lost. Tell them two variants of one product cannot go through an accelerated button, and that split shipping does not apply to these checkouts. Leave button ordering to Shopify. Test each method on a real device.`,
  },
];
