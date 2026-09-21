/**
 * @file retail.js — epic "Retail & POS" (LWC-RTL-*)
 *
 * The gate priced this at one to five weeks and CHF 8–40k and the backlog
 * delivered nothing: not one story in ninety mentioned POS, pickup in store or
 * ship from store. It passed the coverage test because `retail_pos` is active in
 * no fixture, so the test never asked.
 *
 * The thread through every story here is the same fact, and it is the one that
 * decides the estimate: almost every omnichannel service Shopify offers needs
 * POS Pro, and POS Pro is charged per location per month. A roll-out is
 * therefore a per-location cost the client carries for ever, not only a build.
 */

import { list, listOr, storeName, gate } from './helpers.js';

const retail = (doc) => doc.retail ?? {};
const stores = (doc) => retail(doc).store_count ?? 0;
const services = (doc) => (retail(doc).omnichannel ?? []).filter((s) => s !== 'none' && s !== 'not_sure');
const wants = (doc, service) => services(doc).includes(service);
const onShopifyPos = (doc) => retail(doc).pos === 'shopify_pos';
/** The gate is the engine's answer; the raw answers are the fallback before it is decided. */
const isRetail = (doc) => gate(doc, 'retail_pos') || stores(doc) > 0 || services(doc).length > 0;

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-RTL-001',
    epic: 'retail',
    title: (doc) => `Set up ${stores(doc) || 'the'} retail location${stores(doc) === 1 ? '' : 's'} with POS and staff access`,
    user_story: 'As a store manager, I want my location set up in Shopify with the right POS plan and staff access, so that my team can sell and see the right stock from day one.',
    description: (doc) => `${stores(doc) || 'Number of'} location(s)${retail(doc).countries?.length ? ` in ${list(retail(doc).countries)}` : ''}. POS at launch: ${retail(doc).pos ?? 'to confirm'}. Services: ${listOr(services(doc).map((s) => s.replace(/_/g, ' ')), 'to confirm')}.`,
    acceptance_criteria: (doc) => [
      `Given the ${stores(doc) || 'agreed'} location(s), when each is created in Shopify, then it has its address, its own inventory, and is marked as selling in person`,
      'Given the POS subscription, when a location goes live, then the plan it needs is recorded against it with its monthly cost, because POS Pro is charged per location',
      'Given retail staff, when they sign in to POS, then they have a POS-only role with the permissions that role needs and nothing more',
      ...(wants(doc, 'staff_roles_permissions') ? ['Given the agreed staff roles, when permissions are reviewed with the store manager, then discounting, refund and cash-handling limits match what the client asked for'] : []),
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-FND-001'],
    spec_refs: ['/retail/store_count', '/retail/pos', '/retail/countries', '/retail/omnichannel'],
    gates: ['retail_pos'],
    applies: isRetail,
    agent_prompt: (doc) => `Create ${stores(doc) || 'the agreed'} retail location(s)${retail(doc).countries?.length ? ` in ${list(retail(doc).countries)}` : ''} in Shopify admin with addresses and inventory enabled per location. POS at launch: ${retail(doc).pos ?? 'to confirm with the client'}. Record which locations need POS Pro and the monthly cost per location — Pro is billed per location and almost every omnichannel service needs it. Create POS staff roles with the least permission each role needs. Do not enable a service the client has not asked for. Present the location and cost table for consultant approval.`,
  },
  {
    key: 'LWC-RTL-002',
    epic: 'retail',
    title: 'Enable buy online, pick up in store',
    user_story: 'As a shopper, I want to buy online and collect in a store near me, so that I do not pay for delivery or wait at home.',
    acceptance_criteria: (doc) => [
      'Given a product in stock at a location, when a shopper reaches checkout, then pickup at that location is offered with the pickup time the client agreed',
      'Given a pickup order, when it is placed, then the store receives it in POS and the customer is notified when it is ready',
      'Given a pickup order that is never collected, when the agreed window passes, then the process for restocking and refunding it is written down and has an owner',
      `Given the POS plan, when pickup is enabled at ${stores(doc) || 'each'} location, then that location is on POS Pro, because pickup in store is a Pro feature`,
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'developer',
    depends_on: ['LWC-RTL-001'],
    spec_refs: ['/retail/omnichannel', '/retail/store_count', '/shipping/model'],
    gates: ['retail_pos'],
    applies: (doc) => isRetail(doc) && wants(doc, 'buy_online_pickup_in_store'),
    agent_prompt: (doc) => `Enable local pickup on the locations that offer it and set the pickup instructions and expected ready time per location. Confirm each of those locations is on POS Pro. Test the full path: stock check at checkout, order placed, POS notification, ready-for-pickup email, collection and inventory adjustment. Agree and document the uncollected-order process with ${storeName(doc)}.`,
  },
  {
    key: 'LWC-RTL-003',
    epic: 'retail',
    title: 'Fulfil online orders from store stock',
    user_story: 'As an operations manager, I want stores to ship online orders, so that stock anywhere in the estate can sell and shipments start closer to the customer.',
    acceptance_criteria: (doc) => [
      'Given an online order, when the routing rules run, then the location chosen is the one the client agreed on (closest, most stock, or a written priority) and the reason is visible',
      'Given a store-fulfilled order, when staff pick it in POS, then they can print the packing slip and buy the label without admin access',
      'Given a location that runs out mid-day, when stock reaches the agreed floor, then it stops being offered for fulfilment rather than failing at the picking stage',
      'Given the POS plan, when ship from store is enabled, then every fulfilling location is on POS Pro, which is what the feature requires',
    ],
    gaia_tier: 'T3',
    points: 5,
    owner: 'developer',
    depends_on: ['LWC-RTL-001'],
    spec_refs: ['/retail/omnichannel', '/shipping/routing_rules', '/shipping/fulfilment_locations'],
    gates: ['retail_pos'],
    applies: (doc) => isRetail(doc) && (wants(doc, 'ship_to_customer_from_store') || wants(doc, 'endless_aisle_order_in_store')),
    agent_prompt: (doc) => `Configure fulfilment priority across the retail locations and the warehouse to match the agreed routing rule${doc.shipping?.routing_rules?.length ? ` (${list(doc.shipping.routing_rules)})` : ''}. Set a safety-stock floor per location so a store stops being routed to before it runs dry. Confirm ship from store is available: it requires POS Pro on that location. Test picking, packing slip and label purchase from POS, and the inventory movement afterwards.${wants(doc, 'endless_aisle_order_in_store') ? ' Also set up ordering in store for stock the location does not hold, and agree who owns that order until it arrives.' : ''}`,
  },
  {
    key: 'LWC-RTL-004',
    epic: 'retail',
    title: 'Accept in-store returns and exchanges of online orders',
    user_story: 'As a shopper, I want to return or exchange something I bought online at a store, so that I do not have to post it back and wait.',
    acceptance_criteria: [
      'Given an online order, when the customer brings it to a store, then staff can find it in POS and take the return without calling anyone',
      'Given a return taken in store, when it is processed, then the refund goes to the original payment method or to store credit per the agreed rule, and inventory returns to that location',
      'Given an exchange, when it is completed in store, then the price difference is settled in POS and both movements appear on the original order',
      'Given the POS plan, when returns and exchanges are enabled, then the location is on POS Pro, which is what exchanges require',
    ],
    gaia_tier: 'T2',
    points: 5,
    owner: 'developer',
    depends_on: ['LWC-RTL-001'],
    spec_refs: ['/retail/omnichannel', '/shipping/returns', '/checkout/store_credit'],
    gates: ['retail_pos'],
    applies: (doc) => isRetail(doc) && wants(doc, 'in_store_returns_exchanges_of_online_orders'),
    agent_prompt: (doc) => `Enable returns and exchanges of online orders in POS at the agreed locations, each on POS Pro. Configure the refund routes the client agreed${doc.checkout?.store_credit ? ' including store credit' : ''} and the restocking rule per reason. Test: find an online order in POS, return one line, exchange another, check the refund, the inventory at that location and what the customer sees on the original order. Write the counter process down for the training pack.`,
  },
  {
    key: 'LWC-RTL-005',
    epic: 'retail',
    title: 'Move and count stock across locations',
    user_story: 'As an inventory manager, I want transfers and counts to run in Shopify, so that what the storefront promises is what the stores actually hold.',
    acceptance_criteria: [
      'Given stock moving between locations, when a transfer is raised, then it is received against the transfer and discrepancies are recorded rather than absorbed',
      'Given a stocktake, when it is completed at a location, then adjustments carry a reason and the person who made them',
      'Given the inventory the storefront sells from, when locations are enabled for online orders, then which locations are sellable online is a deliberate list, not every location by default',
      'Given the POS plan, when transfers and counts are done in POS, then those locations are on POS Pro, which is what they require',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'developer',
    depends_on: ['LWC-RTL-001'],
    spec_refs: ['/retail/omnichannel', '/catalogue/inventory'],
    gates: ['retail_pos'],
    applies: (doc) => isRetail(doc) && wants(doc, 'stock_transfers_counts'),
    agent_prompt: () => 'Configure inventory per location, decide and document which locations are sellable online, and set up the transfer and stocktake process in POS. Test a transfer end to end including a deliberate discrepancy, and a stocktake with an adjustment reason. Hand over the process with the named owner for discrepancies.',
  },
  {
    key: 'LWC-RTL-006',
    epic: 'retail',
    title: 'Set in-store prices, catalogues and gift cards',
    user_story: 'As a retail manager, I want stores to sell the range and the prices that suit them, so that the shop floor is not tied to the online price list.',
    acceptance_criteria: (doc) => [
      ...(wants(doc, 'retail_prices_or_catalogs') ? [
        'Given a retail catalogue, when it is assigned to a location, then that location sells the range and prices it was given, and the online store is unaffected',
        'Given a price that differs in store, when it is checked at the till, then it matches the catalogue and not the online price',
      ] : []),
      ...(wants(doc, 'store_credit_gift_cards_in_store') ? [
        'Given a gift card, when it is sold or redeemed in store, then the balance is the same one the online store sees',
        'Given store credit issued in store, when the customer shops online, then the credit is available there too',
      ] : []),
      'Given the catalogue and pricing set-up, when it is handed over, then the merchant can change a retail price without a developer',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'developer',
    depends_on: ['LWC-RTL-001'],
    spec_refs: ['/retail/omnichannel', '/catalogue/pricing', '/checkout/gift_cards', '/checkout/store_credit'],
    gates: ['retail_pos'],
    applies: (doc) => isRetail(doc) && (wants(doc, 'retail_prices_or_catalogs') || wants(doc, 'store_credit_gift_cards_in_store')),
    agent_prompt: (doc) => `${wants(doc, 'retail_prices_or_catalogs') ? 'Create the retail catalogue(s) with the agreed range and prices and assign them per location; catalogue customisation for retail needs POS Pro or Plus. ' : ''}${wants(doc, 'store_credit_gift_cards_in_store') ? 'Enable gift cards and store credit in POS and confirm balances are shared with the online store. ' : ''}Test at the till against the online price, and show the merchant how to change a retail price themselves.`,
  },
  {
    key: 'LWC-RTL-007',
    epic: 'retail',
    title: (doc) => `Train store teams and hand over the retail runbook${onShopifyPos(doc) ? '' : ' for the integrated POS'}`,
    user_story: 'As a store manager, I want my team trained on the till and the omnichannel flows, so that the first busy Saturday is not the first time anyone tries them.',
    acceptance_criteria: (doc) => [
      `Given the ${stores(doc) || 'agreed'} location(s), when training is delivered, then every store has at least one trained key user who can train the rest`,
      `Given the services this project enables (${listOr(services(doc).map((s) => s.replace(/_/g, ' ')), 'the agreed list')}), when the runbook is handed over, then each one has its counter process written down`,
      'Given a POS problem on a trading day, when staff follow the runbook, then it names who to call and what to do while they wait',
    ],
    gaia_tier: 'T1',
    points: 3,
    owner: 'consultant',
    depends_on: ['LWC-RTL-002', 'LWC-RTL-003', 'LWC-RTL-004'],
    spec_refs: ['/retail/store_count', '/retail/omnichannel', '/delivery/training'],
    gates: ['retail_pos'],
    applies: isRetail,
    agent_prompt: (doc) => `Write the retail runbook for ${storeName(doc)}: the till basics, and one counter process per enabled service (${listOr(services(doc).map((s) => s.replace(/_/g, ' ')), 'to confirm')}). Include what to do when POS is offline or a payment terminal fails, and who to call. Plan one training session per location with a named key user, and record it so new staff can watch it.`,
  },
];
