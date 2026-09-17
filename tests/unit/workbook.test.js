/**
 * Store configuration workbook (ADR 0012): tax and shipping set-up detail,
 * pre-filled from the engagement, client-facing.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { offering } from '../../schema/index.js';
import { buildWorkbook } from '../../agents/workbook/build.js';

const acme = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '..', 'fixtures', 'engagements', 'acme-watches.json'), 'utf8'));

test('pre-fills markets, registrations, carriers and returns from discovery; conditional sections follow the answers', () => {
  const md = buildWorkbook(acme);
  assert.match(md, /^# Store configuration workbook — /);
  for (const code of acme.markets.list.map((m) => m.code)) assert.match(md, new RegExp(`\\| ${code} \\|`));
  for (const carrier of acme.shipping.carriers) assert.ok(md.includes(`${carrier} *(from discovery)*`), carrier);
  assert.match(md, /### 1\.\d+ Duties and import taxes/, 'ACME collects duties at checkout');
  assert.doesNotMatch(md, /### 1\.\d+ US sales tax/, 'no US market');
  assert.doesNotMatch(md, /### 2\.\d+ Local delivery/);

  const us = buildWorkbook({ ...acme, markets: { ...acme.markets, list: [...acme.markets.list, { code: 'US', currency: 'USD' }, { code: 'CN' }], ddp_markets: ['US'] },
    shipping: { ...acme.shipping, delivery_methods: ['standard_shipping', 'local_delivery'] } });
  assert.match(us, /### 1\.\d+ US sales tax/);
  assert.match(us, /\| US \| DDP \*\(from discovery\)\*/);
  assert.match(us, /\| DE \| DAP \*\(from discovery\)\*/);
  assert.match(us, /### 2\.\d+ Local delivery/);
  assert.match(us, /Mainland China is not covered/);
  assert.doesNotMatch(us, /\| CN \|/);
});

test('is client-facing: no internal pricing, offer logic, exit rules or Shopify plan requirements', () => {
  const md = buildWorkbook({ ...acme, b2b: { ...acme.b2b, enabled: true } });
  const internal = [...offering.modifiers.map((m) => m.id), ...Object.values(offering.offers).map((o) => o.name), 'price band', 'STOP', 'FLAG', 'Shopify Plus', 'Advanced plan', 'Grow plan', 'Basic plan'];
  for (const term of internal) assert.ok(!md.includes(term), term);
  assert.doesNotMatch(md, /\b11\.\d+\b/);
  assert.match(md, /Never enter passwords, API keys/);
});
