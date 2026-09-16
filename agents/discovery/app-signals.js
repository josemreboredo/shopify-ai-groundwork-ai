/**
 * @file app-signals.js
 * @description Deterministic signals that a requirement goes beyond native
 * Shopify and probably needs an app. Used by the approach step (passed to the
 * model as evidence) and by backlog stories. Signals are reasons, not
 * decisions: the consultant confirms the app choice.
 *
 * Native baseline assumed: Shopify return rules and self-serve returns in new
 * customer accounts, staff-created refunds and exchanges, the order status
 * page, and email/SMS shipping notifications.
 *
 * @module discovery/app-signals
 */

/** Monthly returns above this volume make a returns platform worth evaluating. */
export const RETURNS_VOLUME_THRESHOLD = 100;

/**
 * @typedef {Object} AppSignals
 * @property {string[]} returns_platform       Reasons for a returns platform (e.g. Loop, AfterShip Returns, parcelLab)
 * @property {string[]} post_purchase_platform Reasons for a tracking / post-purchase platform (e.g. AfterShip, parcelLab, Narvar)
 * @property {string[]} order_editing_app      Reasons for a customer order editing / cancellation app
 * @property {string[]} warranty_claims        Reasons for a warranty / repair claims solution
 */

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

  const returnsPlatform = [];
  if (returns.label === 'prepaid_label' || returns.label === 'qr_drop_off' || returns.label === 'mixed') {
    returnsPlatform.push(`Return labels by ${returns.label.replace(/_/g, ' ')} need a carrier integration`);
  }
  if ((returns.exchange_types ?? []).includes('any_product')) returnsPlatform.push('Exchanges for any product');
  if ((returns.exchange_types ?? []).includes('store_credit_first')) returnsPlatform.push('Store-credit-first return flow');
  if (refunds.trigger === 'on_carrier_scan') returnsPlatform.push('Refunds triggered by the carrier scan');
  if (returns.international_returns === true && (doc.markets?.list ?? []).length > 1) returnsPlatform.push('International returns across markets');
  if (returns.b2b_returns_online === true && doc.b2b?.enabled === true) returnsPlatform.push('Online returns for B2B customers');
  const volume = pp.orders_per_month !== undefined && returns.return_rate_pct !== undefined
    ? Math.round((pp.orders_per_month * returns.return_rate_pct) / 100)
    : undefined;
  if (volume !== undefined && volume >= RETURNS_VOLUME_THRESHOLD) returnsPlatform.push(`About ${volume} returns per month`);

  const postPurchase = [];
  if (tracking.branded_tracking_page === true) postPurchase.push('Branded order-tracking page');
  const extraChannels = (tracking.proactive_channels ?? []).filter((c) => c === 'whatsapp' || c === 'push');
  if (extraChannels.length) postPurchase.push(`Proactive delivery updates by ${extraChannels.join(' and ')}`);
  if (tracking.delivery_estimates === true) postPurchase.push('Estimated delivery dates on product page or checkout');

  const orderEditing = [];
  if (cancellations.self_service === true) orderEditing.push('Customers cancel orders themselves');
  if (cancellations.order_editing === true) orderEditing.push('Customers edit orders after checkout');

  const warranty = pp.warranty_claims === true ? ['Warranty, repair or servicing claims opened online'] : [];

  return {
    returns_platform: returnsPlatform,
    post_purchase_platform: postPurchase,
    order_editing_app: orderEditing,
    warranty_claims: warranty,
  };
}
