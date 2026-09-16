/**
 * App signals: when post-purchase requirements go beyond native Shopify.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { appSignals, RETURNS_VOLUME_THRESHOLD } from '../../agents/discovery/app-signals.js';
import { approachInput } from '../../agents/discovery/approach.js';

const base = { schema_version: '1.0.0', meta: { client: { name: 'X', slug: 'x' }, source: 'questionnaire' } };

test('no answers or native-only answers produce no signals', () => {
  assert.deepEqual(appSignals(base), { returns_platform: [], post_purchase_platform: [], order_editing_app: [], warranty_claims: [] });
  const native = { ...base, shipping: { returns: { portal: true, exchanges: true, label: 'customer_arranged', exchange_types: ['same_product_variant'] } },
    post_purchase: { orders_per_month: 400, tracking: { branded_tracking_page: false, proactive_channels: ['email', 'sms'], delivery_estimates: false } } };
  const s = appSignals(native);
  assert.deepEqual([s.returns_platform, s.post_purchase_platform, s.order_editing_app], [[], [], []]);
});

test('labels, any-product exchanges, carrier-scan refunds and volume signal a returns platform', () => {
  const doc = { ...base, markets: { list: [{ code: 'DE' }, { code: 'AT' }] },
    shipping: { returns: { label: 'prepaid_label', exchange_types: ['any_product'], international_returns: true, return_rate_pct: 20 } },
    post_purchase: { orders_per_month: 1000, refunds: { trigger: 'on_carrier_scan' } } };
  const reasons = appSignals(doc).returns_platform;
  assert.equal(reasons.length, 5);
  assert.ok(reasons.some((r) => r.includes(`${Math.round(1000 * 0.2)} returns per month`)));
  assert.ok(200 >= RETURNS_VOLUME_THRESHOLD);
});

test('branded tracking, WhatsApp updates and delivery estimates signal a post-purchase platform (e.g. Narvar)', () => {
  const doc = { ...base, post_purchase: { tracking: { branded_tracking_page: true, proactive_channels: ['whatsapp'], delivery_estimates: true } } };
  assert.equal(appSignals(doc).post_purchase_platform.length, 3);
});

test('self-service cancellation, order editing and warranty claims are signalled; approach input carries the signals', () => {
  const doc = { ...base, offer: { code: 'S', name: 'Ecommerce Foundation', delivery_track: 'liquid', scope_gates: {}, l_triggers: {} },
    post_purchase: { cancellations: { self_service: true, order_editing: true }, warranty_claims: true } };
  const s = appSignals(doc);
  assert.equal(s.order_editing_app.length, 2);
  assert.equal(s.warranty_claims.length, 1);
  assert.deepEqual(approachInput(doc).app_signals, s);
});
