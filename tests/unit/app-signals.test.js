/**
 * App signals: when requirements go beyond native Shopify (baseline checked
 * against Shopify documentation 2026-09-17), with App Store candidates.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { offering, apps } from '../../schema/index.js';
import { appSignals, appCandidates, RETURNS_VOLUME_THRESHOLD } from '../../agents/discovery/app-signals.js';
import { approachInput } from '../../agents/discovery/approach.js';

const base = { schema_version: '1.0.0', meta: { client: { name: 'X', slug: 'x', hq_country: 'DE' }, source: 'questionnaire' } };
const areas = offering.app_signals.map((a) => a.id);

test('one area per offering app signal; no answers or native-only answers produce no signals', () => {
  const empty = appSignals(base);
  assert.deepEqual(Object.keys(empty).sort(), [...areas].sort());
  assert.ok(Object.values(empty).every((r) => r.length === 0));

  const native = { ...base,
    markets: { list: [{ code: 'DE' }] },
    shipping: { returns: { portal: 'native_self_serve_returns', label: 'customer_arranged', exchange_types: ['same_product_variant'], b2b_returns_online: true } },
    post_purchase: { orders_per_month: 400, cancellations: { self_service: true, auto_approve: false }, tracking: { branded_tracking_page: false, proactive_channels: ['email', 'sms'], delivery_estimates: false } },
    catalogue: { product_types: ['fixed_bundle', 'subscription'], subscriptions: { approach: 'shopify_subscriptions', features: ['pay_per_delivery'] } },
    compliance: { consent_approach: 'shopify_cookie_banner' },
    marketing: { sms: { enabled: true, countries: ['IT', 'GB'] } },
    loyalty: { components: ['store_credit'] },
  };
  assert.deepEqual(Object.entries(appSignals(native)).filter(([, r]) => r.length), [], 'B2B returns, cancellation requests, fixed bundles, Shopify Subscriptions, cookie banner and SMS in supported countries are native');
});

test('returns platform: labels outside the US, customer-chosen exchanges, carrier-scan refunds, volume, preferred tools', () => {
  const doc = { ...base, markets: { list: [{ code: 'DE' }, { code: 'AT' }] },
    shipping: { returns: { label: 'prepaid_label', exchange_types: ['any_product'], international_returns: true, return_rate_pct: 20 } },
    post_purchase: { orders_per_month: 1000, refunds: { trigger: 'on_carrier_scan' }, apps_preferred: ['Loop Returns', 'parcelLab'] } };
  const s = appSignals(doc);
  assert.equal(s.returns_platform.length, 6);
  assert.ok(s.returns_platform.some((r) => r.includes(`${Math.round(1000 * 0.2)} returns per month`)));
  assert.ok(200 >= RETURNS_VOLUME_THRESHOLD);
  assert.deepEqual(s.post_purchase_platform, ['Client uses or prefers parcelLab']);

  const us = { ...base, meta: { client: { name: 'X', slug: 'x', hq_country: 'US' } }, markets: { list: [{ code: 'US' }] }, shipping: { returns: { label: 'prepaid_label' } } };
  assert.deepEqual(appSignals(us).returns_platform, [], 'Shopify creates return labels for US locations');
});

test('post-purchase, order editing and warranty signals', () => {
  const doc = { ...base, markets: { list: [{ code: 'DE' }] },
    post_purchase: { tracking: { branded_tracking_page: true, proactive_channels: ['whatsapp'], delivery_estimates: true }, cancellations: { self_service: true, auto_approve: true, order_editing: true }, warranty_claims: true } };
  const s = appSignals(doc);
  assert.equal(s.post_purchase_platform.length, 3);
  assert.equal(s.order_editing_app.length, 2);
  assert.equal(s.warranty_claims.length, 1);
});

test('catalogue, B2B, marketing, privacy and delivery signals', () => {
  const doc = { ...base,
    markets: { list: [{ code: 'DE', languages: ['de', 'en', 'fr', 'it'] }], translation_method: 'translate_and_adapt', translation_scope: ['policies'] },
    catalogue: { product_types: ['pre_order', 'mix_and_match_bundle'], personalisation: ['text_engraving'], variant_options_max: 4, inventory: { out_of_stock_behaviour: ['back_in_stock_alert'] }, subscriptions: { approach: 'third_party_app', features: ['build_a_box'] } },
    b2b: { enabled: true, rfq_or_negotiated_pricing: true },
    loyalty: { components: ['points_purchase'] },
    marketing: { reviews: { app: 'Judge.me' }, sms: { enabled: true, countries: ['DE'] }, analytics: { server_side: true } },
    compliance: { consent_approach: 'third_party_cmp', cookie_consent_tool: 'Cookiebot' },
    checkout: { chargeback_guarantee: true },
    shipping: { delivery_methods: ['pickup_points'] },
    customers: { account_features: ['wishlist'] },
  };
  const s = appSignals(doc);
  for (const area of ['back_in_stock_app', 'pre_order_app', 'bundle_app', 'subscriptions_app', 'b2b_quote_app', 'loyalty_app', 'reviews_app', 'consent_app', 'fraud_guarantee_app', 'sms_app', 'delivery_scheduling_app', 'tracking_app', 'wishlist_app']) {
    assert.ok(s[area].length > 0, area);
  }
  assert.equal(s.product_options_app.length, 2);
  assert.equal(s.translation_app.length, 2);
});

test('App Store candidates come from the registry for signalled areas only; approach input carries signals and candidates', () => {
  const doc = { ...base, offer: { code: 'S', name: 'Ecommerce Foundation', delivery_track: 'liquid', scope_gates: {}, l_triggers: {} },
    b2b: { enabled: true, rfq_or_negotiated_pricing: true } };
  const candidates = appCandidates(doc);
  assert.deepEqual(Object.keys(candidates), ['b2b_quote_app']);
  const urls = new Set(apps.apps.map((a) => a.url));
  assert.ok(candidates.b2b_quote_app.length > 0 && candidates.b2b_quote_app.every((a) => urls.has(a.url) && a.status));
  const input = approachInput(doc);
  assert.deepEqual(input.app_signals, appSignals(doc));
  assert.deepEqual(input.app_candidates, candidates);
});
