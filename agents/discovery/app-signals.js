/**
 * @file app-signals.js
 * @description Deterministic signals that a requirement goes beyond native
 * Shopify and probably needs an app. Used by the approach step (passed to the
 * model as evidence, with App Store candidates from schema/apps.json) and by
 * backlog stories. Signals are reasons, not decisions: the consultant confirms
 * the app choice. One area per offering.json `app_signals` entry.
 *
 * Native baseline (Shopify documentation, checked 2026-09-17): return and
 * cancellation rules, self-serve returns in customer accounts (also for B2B
 * orders), customer cancellation requests with merchant approval, staff order
 * editing, return labels for US fulfilment locations, manual delivery dates,
 * the order status page, email/SMS shipping notifications, Shopify Bundles
 * (fixed bundles, multipacks), Shopify Subscriptions, store credit, Shopify
 * Messaging (email, SMS in supported countries, WhatsApp), Translate & Adapt
 * (auto-translates 2 languages), Shopify's cookie banner, customer events,
 * pickup points for stores in France, Italy, Spain and the UK, VAT invoices for
 * EU and UK orders (not for orders with duties; no e-invoicing).
 *
 * A tool the client already uses or prefers is also a signal, so the approach
 * confirms it instead of silently recommending native features.
 *
 * @module discovery/app-signals
 */

import { offering, questionBank, apps } from '../../schema/index.js';
import { marketsOf, distinctLanguages } from './classify.js';
import { picked } from './values.js';

/** Monthly returns above this volume make a returns platform worth evaluating. */
export const RETURNS_VOLUME_THRESHOLD = 100;

/** Languages Translate & Adapt can auto-translate (Shopify documentation). */
export const AUTO_TRANSLATED_LANGUAGES = 2;

/** Store countries with native pickup points (Evri, Colissimo, Correos, Mondial Relay, Poste Italiane). */
export const NATIVE_PICKUP_POINT_COUNTRIES = ['FR', 'IT', 'ES', 'GB'];

/** Store countries where Shopify's VAT invoices are not supported. */
const VAT_INVOICE_UNSUPPORTED = ['PT'];

/** Countries where Shopify Messaging sends SMS marketing (Spain paused since 2026-09-15). */
export const SHOPIFY_SMS_COUNTRIES = ['AT', 'CA', 'DK', 'FI', 'IT', 'LU', 'PL', 'PT', 'SE', 'GB', 'US'];

/** A named tool that is really Shopify's own feature is not a reason for an app. */
const isNamedApp = (name) => typeof name === 'string' && name.trim() !== '' && !/^(shopify|native|none|n\/?a)\b/i.test(name.trim());

const RETURNS_WORDS = /return|loop|redo|exchange/i;
const TRACKING_WORDS = /track|parcel|aftership|narvar|route|wismo|delivery/i;

/** True when some fulfilment or market is outside the US (native return labels and automatic dates are US-only). */
const outsideUs = (doc) => marketsOf(doc).some((m) => m.code !== 'US') || (doc.meta?.client?.hq_country ?? 'US') !== 'US';

/** @param {unknown} list @param {...string} values */
const has = (list, ...values) => Array.isArray(list) && values.some((v) => list.includes(v));

/** @typedef {Record<string, string[]>} AppSignals  area id → reasons */

/**
 * @param {object} doc  Engagement document
 * @returns {AppSignals}
 */
export function appSignals(doc) {
  const returns = doc.shipping?.returns ?? {};
  const pp = doc.post_purchase ?? {};
  const refunds = pp.refunds ?? {};
  const tracking = pp.tracking ?? {};
  const cancellations = pp.cancellations ?? {};
  const catalogue = doc.catalogue ?? {};
  const preferred = [...(pp.apps_preferred ?? []), ...(isNamedApp(pp.platform_preference) ? [pp.platform_preference] : [])].filter(isNamedApp).map((a) => a.trim());

  const returnsPlatform = [];
  if (returns.label === 'qr_drop_off') returnsPlatform.push('QR code drop-off returns need a carrier integration');
  if ((returns.label === 'prepaid_label' || returns.label === 'mixed') && outsideUs(doc)) returnsPlatform.push('Prepaid return labels outside the US (Shopify creates return labels only for US locations)');
  if (has(returns.exchange_types, 'any_product')) returnsPlatform.push('Customer-chosen exchanges for any product');
  if (has(returns.exchange_types, 'store_credit_first')) returnsPlatform.push('Store-credit-first return flow');
  if (refunds.trigger === 'on_carrier_scan') returnsPlatform.push('Refunds triggered by the carrier scan');
  if (returns.international_returns === true && marketsOf(doc).length > 1) returnsPlatform.push('International returns across markets');
  const volume = pp.orders_per_month !== undefined && returns.return_rate_pct !== undefined
    ? Math.round((pp.orders_per_month * returns.return_rate_pct) / 100)
    : undefined;
  if (volume !== undefined && volume >= RETURNS_VOLUME_THRESHOLD) returnsPlatform.push(`About ${volume} returns per month`);
  if (isNamedApp(returns.solution)) returnsPlatform.push(`Client uses or prefers ${returns.solution.trim()} for returns`);
  for (const app of preferred.filter((a) => RETURNS_WORDS.test(a))) returnsPlatform.push(`Client uses or prefers ${app}`);
  for (const i of (doc.integrations ?? []).filter((x) => x.category === 'returns' && isNamedApp(x.system))) {
    returnsPlatform.push(`${i.system} is in the client's system landscape (${i.status ?? 'status unknown'})`);
  }

  const postPurchase = [];
  if (tracking.branded_tracking_page === true) postPurchase.push('Branded order-tracking page');
  const extraChannels = (tracking.proactive_channels ?? []).filter((c) => c === 'whatsapp' || c === 'push');
  if (extraChannels.length) postPurchase.push(`Proactive delivery updates by ${extraChannels.join(' and ')}`);
  if (tracking.delivery_estimates === true && outsideUs(doc)) postPurchase.push('Automatic delivery estimates outside the US');
  for (const app of preferred.filter((a) => TRACKING_WORDS.test(a) && !RETURNS_WORDS.test(a))) postPurchase.push(`Client uses or prefers ${app}`);

  const orderEditing = [];
  if (cancellations.order_editing === true) orderEditing.push('Customers edit orders after checkout');
  if (cancellations.self_service === true && cancellations.auto_approve === true) orderEditing.push('Customers cancel orders instantly, without approval');

  const personalisation = picked(catalogue.personalisation);
  const bundleNeeds = (catalogue.bundles?.requirements ?? []).filter((r) => ['customer_builds_bundle', 'bundle_with_subscription'].includes(r));
  const subscriptionNeeds = (catalogue.subscriptions?.features ?? []).filter((f) => ['build_a_box', 'subscription_bundles', 'b2b_subscriptions', 'prepaid_multi_delivery', 'migrate_existing_contracts'].includes(f));
  const languages = distinctLanguages(doc);
  const smsOutside = (doc.marketing?.sms?.countries ?? []).filter((c) => !SHOPIFY_SMS_COUNTRIES.includes(c));
  const loyalty = picked(doc.loyalty?.components).filter((c) => c !== 'store_credit');
  const deliveryBeyondNative = (doc.shipping?.delivery_methods ?? []).filter((m) => m === 'scheduled_delivery_slots'
    || (m === 'pickup_points' && !NATIVE_PICKUP_POINT_COUNTRIES.includes(doc.meta?.client?.hq_country)));
  const invoicing = doc.compliance?.invoicing ?? {};
  const eInvoicing = picked(invoicing.e_invoicing);
  const invoicingNeeds = [
    ...(invoicing.issuer === 'invoicing_app' ? ['Client prefers an invoicing app'] : []),
    ...(eInvoicing.length && !['erp', 'billing_or_tax_service'].includes(invoicing.issuer) ? [`E-invoicing obligations (${eInvoicing.join(', ').replace(/_/g, ' ')}); Shopify has no built-in e-invoicing`] : []),
    ...(invoicing.issuer === 'shopify_vat_invoices' && doc.markets?.duties_ddp === true ? ['Shopify VAT invoices are not generated for orders with duties collected at checkout'] : []),
    ...(invoicing.issuer === 'shopify_vat_invoices' && marketsOf(doc).some((m) => VAT_INVOICE_UNSUPPORTED.includes(m.code)) ? ['Shopify VAT invoices do not support Portugal'] : []),
  ];

  return {
    returns_platform: returnsPlatform,
    post_purchase_platform: postPurchase,
    order_editing_app: orderEditing,
    warranty_claims: pp.warranty_claims === true ? ['Warranty, repair or servicing claims opened online'] : [],
    back_in_stock_app: has(catalogue.inventory?.out_of_stock_behaviour, 'back_in_stock_alert') ? ['Back-in-stock alerts for sold-out variants'] : [],
    pre_order_app: has(catalogue.product_types, 'pre_order') || has(catalogue.inventory?.out_of_stock_behaviour, 'pre_order') ? ['Pre-orders (selling plans need a pre-order app)'] : [],
    product_options_app: [
      ...(personalisation.length ? [`Personalisation beyond stock variants: ${personalisation.join(', ').replace(/_/g, ' ')}`] : []),
      ...((catalogue.variant_options_max ?? 0) > 3 && catalogue.combined_listings !== true ? [`${catalogue.variant_options_max} options per product (Shopify allows 3)`] : []),
    ],
    bundle_app: [
      ...(has(catalogue.product_types, 'mix_and_match_bundle') ? ['Mix-and-match bundles (Shopify Bundles does fixed bundles and multipacks)'] : []),
      ...(bundleNeeds.length ? [`Bundle requirements beyond Shopify Bundles: ${bundleNeeds.join(', ').replace(/_/g, ' ')}`] : []),
    ],
    subscriptions_app: [
      ...(catalogue.subscriptions?.approach === 'third_party_app' ? [`Third-party subscription app${isNamedApp(catalogue.subscription_app) ? `: ${catalogue.subscription_app}` : ''}`] : []),
      ...(subscriptionNeeds.length ? [`Subscription features beyond Shopify Subscriptions: ${subscriptionNeeds.join(', ').replace(/_/g, ' ')}`] : []),
      ...(has(catalogue.subscriptions?.features, 'international_subscriptions') && doc.markets?.cross_border_model === 'managed_markets' ? ['International subscriptions under Managed Markets (domestic only)'] : []),
    ],
    b2b_quote_app: doc.b2b?.rfq_or_negotiated_pricing === true ? ['B2B quotes or prices negotiated per buyer (no built-in RFQ)'] : [],
    loyalty_app: loyalty.length ? [`Loyalty programme: ${loyalty.join(', ').replace(/_/g, ' ')} (no native points programme)`] : [],
    reviews_app: isNamedApp(doc.marketing?.reviews?.app) || doc.marketing?.reviews?.ugc === true ? ['Product reviews or user-generated content (no native reviews app)'] : [],
    translation_app: [
      ...(doc.markets?.translation_method === 'third_party_app' ? ['Client prefers a translation app'] : []),
      ...(languages.length > AUTO_TRANSLATED_LANGUAGES + 1 && !['in_house', 'agency', 'pim_supplied'].includes(doc.markets?.translation_method) ? [`${languages.length} languages; Translate & Adapt auto-translates at most ${AUTO_TRANSLATED_LANGUAGES}`] : []),
      ...(has(doc.markets?.translation_scope, 'policies', 'url_handles') && doc.markets?.translation_method === 'translate_and_adapt' ? ['Policies or URL handles must be translated (not auto-translated by Translate & Adapt)'] : []),
    ],
    consent_app: doc.compliance?.consent_approach === 'third_party_cmp' ? [`Consent management platform${isNamedApp(doc.compliance?.cookie_consent_tool) ? `: ${doc.compliance.cookie_consent_tool}` : ''} (must use the Customer Privacy API)`] : [],
    fraud_guarantee_app: doc.checkout?.chargeback_guarantee === true ? ['Chargeback guarantee beyond Shopify Protect (US Shop Pay orders only)'] : [],
    sms_app: doc.marketing?.sms?.enabled === true && smsOutside.length ? [`SMS marketing in countries Shopify Messaging does not cover: ${smsOutside.join(', ')}`] : [],
    delivery_scheduling_app: deliveryBeyondNative.length ? [`Delivery methods beyond native: ${deliveryBeyondNative.join(', ').replace(/_/g, ' ')}${deliveryBeyondNative.includes('pickup_points') ? ' (native pickup points only for stores in France, Italy, Spain and the UK)' : ''}`] : [],
    tracking_app: doc.marketing?.analytics?.server_side === true ? ['Server-side tracking beyond Shopify customer events and channel apps'] : [],
    wishlist_app: has(doc.customers?.account_features, 'wishlist') || has(doc.design?.interactive_patterns, 'wishlist') ? ['Wishlist (no native wishlist)'] : [],
    invoicing_app: invoicingNeeds,
  };
}

const APP_BY_HANDLE = new Map(apps.apps.map((a) => [a.handle, a]));

/**
 * App Store candidates for every area with a signal: apps named in the
 * `shopify.apps` of questions that feed the area, from schema/apps.json.
 *
 * @param {object} doc
 * @returns {Record<string, { name: string, url: string, status: string }[]>}
 */
export function appCandidates(doc) {
  const signals = appSignals(doc);
  const out = {};
  for (const area of offering.app_signals.map((a) => a.id)) {
    if (!signals[area]?.length) continue;
    const handles = [...new Set(questionBank.questions
      .filter((q) => q.feeds?.includes(`app:${area}`))
      .flatMap((q) => q.shopify?.apps ?? []))];
    out[area] = handles.map((h) => APP_BY_HANDLE.get(h)).filter(Boolean).map((a) => ({ name: a.name, url: a.url, status: a.status }));
  }
  return out;
}
