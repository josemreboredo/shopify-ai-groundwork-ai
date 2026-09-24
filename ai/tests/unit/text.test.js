/**
 * Labels read mid-sentence: the first letter drops, unless the first word is an
 * acronym or a name. Dropping it blindly printed "b2B", "sEO" and "shopify’s".
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { lowerFirst } from '../../engine/text.js';
import { classifyOffer } from '../../engine/classify.js';
import { offering } from '../../schema/index.js';

test('a label drops its capital mid-sentence, and an acronym or a name keeps it', () => {
  assert.equal(lowerFirst('Written SOPs'), 'written SOPs');
  assert.equal(lowerFirst('Each further market'), 'each further market');
  for (const kept of ['B2B and wholesale', 'SEO continuity', 'AI product content', 'UI extensions', 'Shopify’s own B2B', 'Shopify Subscriptions', 'WooCommerce or Shopify-to-Shopify', 'Q7.3.1: Klaviyo']) {
    assert.equal(lowerFirst(kept), kept);
  }
  assert.equal(lowerFirst(''), '');
  assert.equal(lowerFirst(undefined), undefined);
});

test('no quote rationale or strategy row breaks an acronym or a name', () => {
  const doc = JSON.parse(fs.readFileSync(new URL('../fixtures/engagements/acme-watches.json', import.meta.url), 'utf8'));
  const { rationale } = classifyOffer(doc);
  assert.match(rationale, /B2B and wholesale/, 'ACME buys B2B, and the rationale names it');
  const broken = /\b(b2B|sEO|aI|uI|shopify|wooCommerce|shopware|magento)\b/;
  assert.doesNotMatch(rationale, broken);
  for (const m of offering.modifiers) assert.doesNotMatch(lowerFirst(m.description), broken, m.id);
  for (const a of offering.closed_scope.addons) assert.doesNotMatch(lowerFirst(a.what), broken, a.id);
});
