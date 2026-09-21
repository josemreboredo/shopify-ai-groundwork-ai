/**
 * @file shipping.js — epic "Shipping, tax & returns" (LWC-SHP-*)
 */

import { markets, list, listOr, isB2b, integrationsOf, exitFired } from './helpers.js';
import { appSignals } from '../../discovery/app-signals.js';

const RATE_TEXT = {
  flat: 'flat rates',
  weight_or_price_based: 'weight or price based rates',
  free_above_threshold: 'free shipping above a threshold',
  carrier_calculated: 'carrier-calculated rates',
  app_calculated: 'rates from a shipping app',
};
/** "flat rates and free shipping above a threshold". @param {object} doc */
const rateText = (doc) => ((doc.shipping?.rates ?? []).length ? list(doc.shipping.rates.map((r) => RATE_TEXT[r] ?? r)) : undefined);

/** @type {import('../model.js').StoryDefinition[]} */
export default [
  {
    key: 'LWC-SHP-001',
    epic: 'shipping',
    title: 'Configure delivery profiles, zones, shipping rates and carriers',
    description: (doc) => `Rates: ${rateText(doc) ?? 'to confirm'}. Carriers: ${listOr(doc.shipping?.carriers, 'to confirm')}.`,
    user_story: 'As a shopper, I want clear delivery options and costs for my country, so that I know what I pay and when it arrives.',
    acceptance_criteria: (doc) => [
      ...markets(doc).map((m) => `Given a ${m.code} address, when a shopper reaches the shipping step, then the agreed ${rateText(doc) ?? 'rates'} and delivery times are shown in ${m.currency ?? 'the market currency'}`),
      ...(doc.shipping?.special_rules ?? []).map((r) => `Given the special rule "${r}", when an affected product is in the cart, then the separate delivery profile applies the correct rates or restrictions`),
      ...(doc.shipping?.excluded_countries?.length ? [`Given an address in ${list(doc.shipping.excluded_countries)}, when a shopper checks out, then shipping is not offered`] : []),
      'Given a cart at a rate boundary (weight or free-shipping threshold), when the shopper reaches the shipping step, then the rate on each side of the boundary is correct',
      `Given the carriers ${listOr(doc.shipping?.carriers, 'agreed with operations')}, when a test order is fulfilled, then a label or tracking number is attached and the shipping confirmation contains the tracking link`,
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-FND-001'],
    spec_refs: ['/shipping/rates', '/shipping/carriers', '/shipping/special_rules', '/shipping/international', '/shipping/excluded_countries', '/markets/list'],
    applies: () => true,
    agent_prompt: (doc) => `Set up shipping in Settings > Shipping and delivery: a general profile with zones per market (${listOr(markets(doc).map((m) => m.code), 'primary market')})${doc.shipping?.international ? ' plus international zones' : ''}, ${rateText(doc) ?? 'agreed rates'} and delivery-time labels. ${(doc.shipping?.rates ?? []).includes('carrier_calculated') ? 'Third-party carrier-calculated rates need the Advanced or Plus plan (an add-on on Grow) — confirm eligibility and keep carrier API credentials out of the repository. ' : ''}${(doc.shipping?.free_shipping_thresholds ?? []).length ? `Free-shipping thresholds: ${doc.shipping.free_shipping_thresholds.map((t) => `${t.market} ${t.currency ?? ''} ${t.threshold}`.replace(/\s+/g, ' ')).join('; ')}. ` : ''}${doc.shipping?.special_rules?.length ? `Create separate delivery profiles for: ${list(doc.shipping.special_rules)}. ` : ''}Carriers: ${listOr(doc.shipping?.carriers, 'to confirm')} — connect via Shopify Shipping or the carrier's app for labels and tracking. Define free-shipping thresholds per market currency. Take zones, rates, locations, packages and special products from the client's completed store configuration workbook (configuration-workbook.md, Shipping and delivery; generate it with npm run workbook). Present the rate table for approval before applying it.`,
  },
  {
    key: 'LWC-SHP-002',
    epic: 'shipping',
    title: (doc) => `Set up ${doc.shipping?.fulfilment_locations ?? 'multiple'} fulfilment locations and order routing`,
    user_story: 'As an operations manager, I want orders routed to the best location automatically, so that we ship faster and split fewer orders.',
    acceptance_criteria: (doc) => [
      'Given each location, when it is created, then its address, fulfilment and local pickup settings and stocked products are correct',
      'Given an order, when routing runs, then the order routing rules pick the location by the agreed priority (for example market, stock availability, fewest splits)',
      ...(exitFired(doc, '11.13') ? ['Given exit rule 11.13 (multi-location routing flag), when the routing design is approved, then its scoping outcome and any Order Routing Location Rule function are signed off by the consultant'] : []),
      'Given insufficient stock at the preferred location, when an order is placed, then it is split or rerouted as agreed and staff are notified',
    ],
    gaia_tier: 'T3',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-SHP-001'],
    spec_refs: ['/shipping/fulfilment_locations', '/shipping/routing_rules', '/catalogue/inventory/source'],
    applies: (doc) => (doc.shipping?.fulfilment_locations ?? 0) > 1,
    agent_prompt: (doc) => `Create ${doc.shipping?.fulfilment_locations ?? 'the agreed'} locations and assign inventory. Configure order routing rules in Settings > Shipping and delivery > Order routing. Routing rules: ${listOr((doc.shipping?.routing_rules ?? []).map((r) => r.replace(/_/g, ' ')), 'to confirm')}. ${(doc.shipping?.routing_rules ?? []).some((r) => r === 'custom_rule_function' || r === 'erp_or_oms_decides') ? 'Some routing goes beyond the native rules: document it and propose an Order Routing Location Rule function or the ERP / OMS integration for approval (T3). ' : ''}Inventory source: ${doc.catalogue?.inventory?.source ?? 'Shopify'}. Test split and single-location orders per market.`,
  },
  {
    key: 'LWC-SHP-003',
    epic: 'shipping',
    title: (doc) => `Connect fulfilment with ${doc.shipping?.provider_3pl ?? 'the 3PL'}`,
    user_story: 'As an operations manager, I want orders sent to our fulfilment partner automatically and tracking returned, so that nobody re-keys orders.',
    acceptance_criteria: [
      'Given a paid order, when it is ready to fulfil, then it is released to the fulfilment service within the agreed time and appears in the partner system',
      'Given the partner ships the order, when tracking is returned, then the order is marked fulfilled with carrier and tracking number and the customer is notified',
      'Given stock levels at the partner warehouse, when they change, then Shopify inventory for that location is updated on the agreed schedule',
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-SHP-001'],
    spec_refs: ['/shipping/model', '/shipping/provider_3pl', '/integrations/*/category'],
    security_flags: ['pii'],
    applies: (doc) => ['3pl', 'hybrid'].includes(doc.shipping?.model),
    agent_prompt: (doc) => `Fulfilment model: ${doc.shipping?.model}. Partner: ${doc.shipping?.provider_3pl ?? 'to confirm'}. ${integrationsOf(doc, '3pl_wms').length ? 'The system connection itself is delivered in the integrations epic; here configure the Shopify side: ' : 'Use the partner\'s Shopify App Store fulfilment app; configure: '}fulfilment service location, which products and markets it fulfils, order release timing (for example after fraud review), tracking sync and inventory sync frequency. ${doc.shipping?.model === 'hybrid' ? 'Document which orders stay in-house. ' : ''}Only share the order data the partner needs. Test end-to-end with test orders in the partner sandbox.`,
  },
  {
    key: 'LWC-SHP-004',
    epic: 'shipping',
    title: (doc) => `Set up taxes for ${listOr(doc.markets?.vat_countries, 'the selling countries')}${doc.markets?.us_sales_tax ? ' and US sales tax' : ''}`,
    user_story: 'As the finance controller, I want correct taxes charged and shown for every market, so that we stay compliant and prices are transparent.',
    acceptance_criteria: (doc) => [
      ...(doc.markets?.vat_countries ?? []).map((c) => `Given the ${c} VAT registration, when a ${c} order is placed, then VAT is charged at the correct rate and prices display tax-inclusive where required`),
      ...(doc.markets?.us_sales_tax ? ['Given US states where the business has nexus, when a US order is placed, then Shopify Tax collects sales tax only in the registered states'] : []),
      ...(isB2b(doc) ? ['Given a B2B company location with a valid tax registration ID or exemption, when it checks out, then tax is applied or exempted according to the location\'s tax settings'] : []),
      'Given products with a Standard Product Taxonomy category, when tax is calculated, then reduced or exempt rates apply only where finance confirmed them',
      'Given tax reports, when finance reviews a month of test orders, then totals reconcile with the order export',
    ],
    gaia_tier: 'T2',
    points: 2,
    owner: 'consultant',
    depends_on: ['LWC-MKT-001'],
    spec_refs: ['/markets/vat_countries', '/markets/us_sales_tax', '/markets/low_value_schemes', '/markets/reduced_rate_products', '/compliance/invoicing/issuer', '/b2b/enabled'],
    applies: () => true,
    agent_prompt: (doc) => `Enter tax registrations supplied by finance for ${listOr(doc.markets?.vat_countries, 'the selling countries')} in Settings > Taxes and duties (never guess registration numbers). Set tax-inclusive pricing per market where required. Check product tax overrides and the Standard Product Taxonomy categories that drive reduced rates.${doc.markets?.us_sales_tax ? ' Activate Shopify Tax for the US and add state registrations where nexus exists.' : ''}${isB2b(doc) ? ' Configure B2B tax exemptions and tax registration IDs on company locations.' : ''} ${(doc.markets?.low_value_schemes ?? []).filter((x) => !['none', 'not_sure'].includes(x)).length ? ` Low-value import schemes: ${list(doc.markets.low_value_schemes.filter((x) => !['none', 'not_sure'].includes(x)).map((x) => x.replace(/_/g, ' ')))}.` : ''} Registrations, tax display, reduced rates and invoice settings come from the client's completed store configuration workbook (configuration-workbook.md, Tax and duties). Finance signs off the tax configuration; the agent does not give tax advice.`,
  },
  {
    key: 'LWC-SHP-005',
    epic: 'shipping',
    title: (doc) => `Set up returns${doc.shipping?.returns?.exchanges ? ' and exchanges' : ''}${doc.shipping?.returns?.solution ? ` with ${doc.shipping.returns.solution}` : ''}`,
    user_story: 'As a shopper, I want to request a return or exchange easily, so that buying online feels safe.',
    description: (doc) => `Policy: ${doc.shipping?.returns?.policy ?? 'to confirm'}`,
    acceptance_criteria: (doc) => [
      `Given the returns policy, when a return rule is configured, then the return window, eligible items and return shipping fees match "${doc.shipping?.returns?.policy ?? 'the agreed policy'}"`,
      ...(doc.shipping?.returns?.portal === 'native_self_serve_returns' || doc.shipping?.returns?.portal === 'returns_app_needed' ? ['Given a customer with an eligible order, when they request a return in the self-service portal, then they receive a label or instructions and staff see the return request'] : ['Given a return request by email, when staff create the return in the admin, then refund, restock and label steps follow the SOP']),
      ...(doc.shipping?.returns?.exchanges ? ['Given an exchange, when it is approved, then the replacement variant is reserved and the price difference is charged or refunded'] : []),
      'Given a refund, when it is issued, then inventory restocks to the right location and the refund reaches the original payment method or store credit',
      ...(doc.shipping?.returns?.window_days !== undefined ? [`Given an order older than ${doc.shipping.returns.window_days} days, when the customer requests a return, then the request is declined with the policy explanation`] : []),
      ...(doc.shipping?.returns?.inspection_required ? ['Given a returned item, when it arrives, then it waits in an inspection state and no refund or exchange is released until staff approve it'] : []),
      ...(doc.shipping?.returns?.reason_tracking ? ['Given return requests over a month, when operations review returns, then a report shows volumes by return reason and product'] : []),
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-SHP-001'],
    spec_refs: ['/shipping/returns/policy', '/shipping/returns/portal', '/shipping/returns/exchanges', '/shipping/returns/solution', '/shipping/returns/label', '/shipping/returns/exchange_types', '/shipping/returns/window_days', '/post_purchase/orders_per_month'],
    security_flags: ['pii'],
    applies: () => true,
    agent_prompt: (doc) => `Returns policy: ${doc.shipping?.returns?.policy ?? 'to confirm'}. Returns-platform signals: ${listOr(appSignals(doc).returns_platform, 'none — native Shopify returns are enough')}. ${doc.shipping?.returns?.solution
      ? `Install and configure ${doc.shipping.returns.solution}: return reasons, windows, fees per market, ${doc.shipping?.returns?.exchanges ? 'exchange-first flow, ' : ''}label generation and restock location. Link its portal from customer accounts and the footer.`
      : `Use Shopify's native return rules and ${doc.shipping?.returns?.portal === 'native_self_serve_returns' ? 'self-serve returns in customer accounts' : 'staff-created returns'}${doc.shipping?.returns?.exchanges ? ' with exchanges' : ''}.`} Update the refund policy page and notifications. Test a return, an exchange (if in scope) and a refund in test mode.`,
  },
  {
    key: 'LWC-SHP-006',
    epic: 'shipping',
    title: 'Brand and translate customer notification templates',
    user_story: 'As a customer, I want order emails that look like the brand and speak my language, so that I trust them and know what happens next.',
    acceptance_criteria: (doc) => [
      'Given the order confirmation, shipping confirmation, refund and account emails, when a test notification is sent, then it shows the brand logo and colours and renders in Gmail, Outlook and Apple Mail',
      `Given each storefront language (${listOr([...new Set(markets(doc).flatMap((m) => m.languages ?? []))], 'the default language')}), when a notification is sent to a customer in that language, then its content is translated`,
      `Given the sender split "${doc.shipping?.notifications?.sender ?? 'shopify'}", when an event occurs, then exactly one system sends the message and no customer receives duplicates`,
    ],
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-THM-001'],
    spec_refs: ['/shipping/notifications/custom', '/shipping/notifications/sender', '/marketing/esp/platform'],
    gates: ['languages'],
    applies: (doc) => doc.shipping?.notifications?.custom === true,
    agent_prompt: (doc) => `Customise Shopify notification templates (Settings > Notifications): brand settings (logo, accent colour) first, then Liquid template edits only where needed. Translate notification content per language with Translate & Adapt or the agreed method. Sender: ${doc.shipping?.notifications?.sender ?? 'shopify'} — ${doc.shipping?.notifications?.sender === 'esp' || doc.shipping?.notifications?.sender === 'mixed' ? `list which transactional messages ${doc.marketing?.esp?.platform ?? 'the ESP'} sends and disable those in Shopify to avoid duplicates. ` : ''}Send test notifications and check rendering in major email clients.`,
  },
{
    key: 'LWC-SHP-007',
    epic: 'shipping',
    title: (doc) => `Configure order cancellations${doc.post_purchase?.cancellations?.order_editing ? ' and order editing' : ''}`,
    user_story: 'As a customer, I want to cancel or correct an order quickly when I make a mistake, so that I do not have to wait for a return.',
    description: (doc) => `Cancellation window: ${doc.post_purchase?.cancellations?.window ?? 'to confirm'}. App signals: ${listOr(appSignals(doc).order_editing_app, 'none — staff cancel and edit orders in the admin')}.`,
    acceptance_criteria: (doc) => {
      const c = doc.post_purchase?.cancellations ?? {};
      return [
        c.self_service
          ? `Given an order that is ${['15_minutes', '1_hour', '24_hours'].includes(c.window) ? `within ${c.window.replace(/_/g, ' ')} of ordering` : 'not yet fulfilled'}, when the customer requests cancellation in their account${c.auto_approve ? '' : ' and staff approve it'}, then payment is refunded or voided, stock is restocked and the fulfilment location stops the order`
          : 'Given a cancellation request by email or phone, when staff cancel the order in the admin, then payment is refunded or voided, stock is restocked and the customer is notified',
        'Given an order already fulfilled, when a cancellation is requested, then it is refused and the customer is pointed to the returns process',
        ...(c.partial ? ['Given a multi-item order, when one item is cancelled, then only that item is refunded and removed from fulfilment'] : []),
        ...(c.order_editing ? ['Given an unfulfilled order, when the customer changes the shipping address or an item, then the order, payment difference and fulfilment request are updated before shipping'] : []),
        ...(integrationsOf(doc, 'erp').length || integrationsOf(doc, '3pl_wms').length ? ['Given a cancellation or edit, when it is saved, then the ERP or warehouse receives it before the order is picked'] : []),
      ];
    },
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-SHP-001'],
    spec_refs: ['/post_purchase/cancellations/self_service', '/post_purchase/cancellations/window', '/post_purchase/cancellations/partial', '/post_purchase/cancellations/order_editing'],
    security_flags: ['payments'],
    applies: (doc) => Object.keys(doc.post_purchase?.cancellations ?? {}).length > 0,
    agent_prompt: (doc) => {
      const signals = appSignals(doc).order_editing_app;
      return `Cancellation rules: self-service ${doc.post_purchase?.cancellations?.self_service ? 'yes' : 'no'}, window ${doc.post_purchase?.cancellations?.window ?? 'to confirm'}, partial ${doc.post_purchase?.cancellations?.partial ? 'yes' : 'no'}, order editing ${doc.post_purchase?.cancellations?.order_editing ? 'yes' : 'no'}. ${signals.length ? `These go beyond native Shopify (${list(signals)}): shortlist order editing / cancellation apps from the Shopify App Store that support new customer accounts and ${(doc.markets?.list ?? []).length > 1 ? 'multiple markets' : 'the store market'}, and present the choice for consultant approval.` : 'Use native admin order cancellation and editing with an SOP for the service team.'} Make sure cancellations void or refund payment, restock inventory and stop fulfilment${integrationsOf(doc, 'erp').length ? ' and reach the ERP' : ''}.`;
    },
  },
  {
    key: 'LWC-SHP-008',
    epic: 'shipping',
    title: 'Implement refund rules and pass refunds to finance',
    user_story: 'As a finance manager, I want refunds issued consistently and recorded in our finance system, so that customers are treated fairly and the books reconcile.',
    description: (doc) => {
      const r = doc.post_purchase?.refunds ?? {};
      return `Methods: ${listOr((r.methods ?? []).map((m) => m.replace(/_/g, ' ')), 'to confirm')}. Trigger: ${(r.trigger ?? 'to confirm').replace(/_/g, ' ')}. Shipping refunded: ${(r.shipping_refunded ?? 'to confirm').replace(/_/g, ' ')}.`;
    },
    acceptance_criteria: (doc) => {
      const r = doc.post_purchase?.refunds ?? {};
      return [
        `Given an approved return, when the refund is issued ${r.trigger ? `(${r.trigger.replace(/_/g, ' ')})` : ''}, then it is paid by ${listOr((r.methods ?? []).map((m) => m.replace(/_/g, ' ')), 'the agreed method')}`.replace('  ', ' '),
        `Given a return where the merchant is not at fault, when the refund is calculated, then original shipping is ${r.shipping_refunded === 'always' ? 'refunded' : 'not refunded'}${r.restocking_fee ? ' and the restocking fee is deducted' : ''}`,
        ...(r.partial ? ['Given a damaged or incomplete return, when staff issue a partial refund, then the amount and reason are recorded on the order'] : []),
        ...(r.approval_required ? ['Given a refund above the agreed limit, when staff prepare it, then it waits for approval by the named approver before payment'] : []),
        ...(r.finance_sync ? [`Given a refund or cancellation, when it is completed, then ${integrationsOf(doc, 'erp').length ? list(integrationsOf(doc, 'erp').map((i) => i.system)) : 'the finance system'} receives the refund with amounts, taxes and currency`] : []),
      ];
    },
    gaia_tier: 'T2',
    points: 3,
    owner: 'agent',
    depends_on: ['LWC-SHP-005'],
    spec_refs: ['/post_purchase/refunds/methods', '/post_purchase/refunds/trigger', '/post_purchase/refunds/shipping_refunded', '/post_purchase/refunds/restocking_fee', '/post_purchase/refunds/approval_required', '/post_purchase/refunds/finance_sync'],
    security_flags: ['payments'],
    applies: (doc) => Object.keys(doc.post_purchase?.refunds ?? {}).length > 0,
    agent_prompt: (doc) => {
      const r = doc.post_purchase?.refunds ?? {};
      return `Refund rules: methods ${listOr(r.methods, 'to confirm')}, trigger ${r.trigger ?? 'to confirm'}, shipping refunded ${r.shipping_refunded ?? 'to confirm'}, restocking fee ${r.restocking_fee ? 'yes' : 'no'}, partial refunds ${r.partial ? 'yes' : 'no'}, approval ${r.approval_required ? 'required' : 'not required'}. ${r.trigger === 'on_carrier_scan' ? 'Refund on carrier scan needs the returns platform — configure it there. ' : 'Configure refunds in the returns solution or Shopify admin and write the staff SOP. '}${(r.methods ?? []).includes('store_credit') ? 'Use Shopify store credit for credit refunds. ' : ''}${r.finance_sync ? `Map refunds and cancellations to ${integrationsOf(doc, 'erp').length ? list(integrationsOf(doc, 'erp').map((i) => i.system)) : 'the finance system'} (amounts, tax lines, currency, payment method). ` : ''}Update the refund policy page to match.`;
    },
  },
  {
    key: 'LWC-SHP-009',
    epic: 'shipping',
    title: 'Set up post-purchase tracking and delivery updates',
    user_story: 'As a customer, I want to follow my delivery on the brand site and hear about delays before I ask, so that I trust the brand and do not contact support.',
    description: (doc) => `Signals beyond native Shopify: ${list(appSignals(doc).post_purchase_platform)}.`,
    acceptance_criteria: (doc) => {
      const t = doc.post_purchase?.tracking ?? {};
      return [
        ...(t.branded_tracking_page ? [`Given a shipped order, when the customer opens the tracking link, then a branded tracking page on the store shows the carrier status in ${listOr([...new Set(markets(doc).flatMap((m) => m.languages ?? []))], 'the store language')}`] : []),
        ...((t.proactive_channels ?? []).length ? [`Given a delay or out-for-delivery event from ${listOr(doc.shipping?.carriers, 'the carrier')}, when the platform receives it, then the customer is notified by ${list(t.proactive_channels)} only if they consented to that channel`] : []),
        ...(t.delivery_estimates ? ['Given a product page or checkout, when the shopper enters or is located in a market, then an estimated delivery date based on carrier transit times is shown'] : []),
        'Given Shopify shipping notifications, when the platform sends tracking messages, then the customer never receives the same update twice',
      ];
    },
    gaia_tier: 'T2',
    points: 5,
    owner: 'agent',
    depends_on: ['LWC-SHP-001'],
    spec_refs: ['/post_purchase/tracking/branded_tracking_page', '/post_purchase/tracking/proactive_channels', '/post_purchase/tracking/delivery_estimates', '/post_purchase/platform_preference', '/shipping/carriers'],
    security_flags: ['pii'],
    applies: (doc) => appSignals(doc).post_purchase_platform.length > 0,
    agent_prompt: (doc) => `Post-purchase requirements beyond native Shopify: ${list(appSignals(doc).post_purchase_platform)}. ${doc.post_purchase?.platform_preference ? `Client platform preference (check it covers tracking, not only returns): ${doc.post_purchase.platform_preference}. ` : 'Shortlist post-purchase platforms (for example AfterShip, parcelLab, Narvar) that support the carriers and markets, and present the choice for consultant approval. '}Carriers: ${listOr(doc.shipping?.carriers, 'to confirm')}. Configure the branded tracking page, notification templates per language and consent-aware channels; decide which system sends each shipping message so customers get no duplicates.`,
  },
  {
    key: 'LWC-SHP-010',
    epic: 'shipping',
    title: 'Set up online warranty, repair and servicing claims',
    user_story: 'As a customer, I want to register a warranty, repair or servicing claim online, so that I know the status without calling support.',
    acceptance_criteria: (doc) => [
      'Given a customer with an order in their account, when they open a warranty or repair claim, then they choose the product, describe the issue, upload photos and receive a claim reference',
      'Given a new claim, when the service team reviews it, then they can approve, request more information or reject it and the customer is notified in their language',
      `Given an approved repair, when the item is sent in and returned, then the claim status and ${doc.shipping?.carriers?.length ? 'carrier tracking' : 'shipping details'} are visible to the customer until it is closed`,
    ],
    gaia_tier: 'T3',
    points: 5,
    owner: 'developer',
    depends_on: ['LWC-CUS-001'],
    spec_refs: ['/post_purchase/warranty_claims', '/post_purchase/platform_preference', '/shipping/returns/solution'],
    security_flags: ['pii'],
    applies: (doc) => doc.post_purchase?.warranty_claims === true,
    agent_prompt: (doc) => `Warranty, repair and servicing claims must be opened online. First check whether ${doc.shipping?.returns?.solution ?? doc.post_purchase?.platform_preference ?? 'the chosen returns or post-purchase platform'} supports warranty or repair flows; otherwise design a claim form in customer accounts backed by a helpdesk app or a metaobject-based claim record with Shopify Flow notifications. Present the options with pros, cons and Gaia tier for consultant approval. Photos and customer details are personal data: store them only where the retention policy allows.`,
  },
];
