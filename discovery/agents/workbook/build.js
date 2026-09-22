/**
 * @file build.js
 * @description Store configuration workbook (ADR 0012): the tax and shipping
 * set-up detail the discovery does not collect. Generated per client after the
 * scope is agreed, pre-filled from engagement.json, completed by the client's
 * finance and logistics teams, and used to configure Shopify (backlog stories
 * LWC-SHP-001 and LWC-SHP-004). Client-facing: no internal pricing, offer
 * logic, exit rules or Shopify plan requirements. Shopify facts checked
 * 2026-09-17 against help.shopify.com.
 *
 * Usage: npm run workbook -- --client <slug> [--clients-dir clients]
 *
 * @module workbook/build
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { optionLabel, validateEngagement } from '../../schema/index.js';
import { marketsOf, hasChinaMainland } from '../discovery/classify.js';
import { picked } from '../discovery/values.js';
import { CLIENTS_DIR } from '../../paths.js';
import { words } from './strings.js';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const WORKBOOK_FILE = 'configuration-workbook.md';

const DOCS = {
  taxes: 'https://help.shopify.com/en/manual/taxes/shopify-tax/choose-tax-service',
  lowValue: 'https://help.shopify.com/en/manual/international/duties-and-import-taxes',
  duties: 'https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations',
  taxInclusive: 'https://help.shopify.com/en/manual/international/pricing/dynamic-tax-inclusive-pricing',
  usTax: 'https://help.shopify.com/en/manual/taxes/us/us-tax-setup',
  overrides: 'https://help.shopify.com/en/manual/taxes/tax-overrides',
  vatValidation: 'https://help.shopify.com/en/manual/taxes/shopify-tax/vat-validate',
  vatInvoices: 'https://help.shopify.com/en/manual/taxes/shopify-tax/vat-invoices',
  rates: 'https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/setting-up-shipping-rates',
  packages: 'https://help.shopify.com/en/manual/fulfillment/setup/packaging/packages-and-weights',
  deliveryDates: 'https://help.shopify.com/en/manual/fulfillment/setup/processing-time-and-delivery-dates/automatic-delivery-dates',
  localDelivery: 'https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/local-delivery',
  pickup: 'https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/pickup-in-store',
  pickupPoints: 'https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/pickup-points',
  dangerousGoods: 'https://help.shopify.com/en/manual/compliance/legal/shipping-dangerous-goods',
  catalogs: 'https://help.shopify.com/en/manual/markets/customizations/catalogs',
  b2bShipping: 'https://help.shopify.com/en/manual/b2b/checkout-and-orders/shipping-methods',
};

const TBC = '';
const labels = (values) => picked(values).map(optionLabel).join(', ');
const cell = (v) => String(v ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');

/** Markdown table; at least `blankRows` empty rows so there is room to write. */
function table(headers, rows, blankRows = 2) {
  const all = [...rows, ...Array.from({ length: Math.max(0, blankRows - rows.length) }, () => headers.map(() => ''))];
  return [
    `| ${headers.join(' | ')} |`,
    `|${headers.map(() => '---').join('|')}|`,
    ...all.map((r) => `| ${r.map(cell).join(' | ')} |`),
  ].join('\n');
}



/**
 * @param {object} doc  Engagement document
 * @returns {string} Markdown workbook
 */
export function buildWorkbook(doc, { language = doc?.meta?.language } = {}) {
  const W = words(language);
  const YES_NO = (v) => (v === true ? W.yes : v === false ? W.no : TBC);
  const prefilled = (label, value) => `- **${label}:** ${value ? `${value} ${W.fromDiscoveryConfirm}` : W.toComplete}`;
  const help = (url) => `[${W.help}](${url})`;
  const from = `*${W.fromDiscovery.replace(/^\*|\*$/g, '')}*`;
  const said = (value) => `${value} ${from}`;
  const client = doc.meta.client;
  const markets = marketsOf(doc);
  const m = doc.markets ?? {};
  const s = doc.shipping ?? {};
  const b2b = doc.b2b?.enabled === true;
  const methods = picked(s.delivery_methods);
  const ddp = new Set(m.ddp_markets ?? []);
  const out = [];
  const add = (...parts) => out.push(...parts.flatMap((part) => [part, '']));
  let major = 0;
  let minor = 0;
  const section = (title) => { major += 1; minor = 0; return `## ${major}. ${title}`; };
  const sub = (title) => { minor += 1; return `### ${major}.${minor} ${title}`; };

  add(`# ${W.title(client.name)}`, W.intro.join('\n'));
  if (hasChinaMainland(doc)) add(W.china);

  // ── 1. Tax ──────────────────────────────────────────────────────────────
  add(section(W.secTax), W.ownerFinance, `${W.adminTaxes} · ${help(DOCS.taxes)}`);

  add(sub(W.subTaxService), prefilled(W.lblTaxCalculation, m.tax_service && m.tax_service !== 'not_sure' ? optionLabel(m.tax_service) : ''),
    W.noteTaxService);

  const registrationRows = [
    ...[...new Set([...(m.vat_countries ?? []), ...markets.map((x) => x.code)])].map((code) => [
      code === 'EU' ? W.rowEuCountries : code,
      (m.vat_countries ?? []).includes(code) ? said(W.yes) : TBC, TBC, TBC, TBC]),
    ...picked(m.low_value_schemes).map((scheme) => [optionLabel(scheme), said(W.yes), TBC, TBC, W.cellLowValueScheme]),
  ];
  add(sub(W.subRegistrations),
    `${W.proseRegistrations} (${help(DOCS.lowValue)}).`,
    table(W.thRegistrations, registrationRows));

  add(sub(W.subTaxDisplay),
    `${W.proseTaxDisplay} ([${W.linkTaxDisplay}](${DOCS.taxInclusive}); ${W.proseTaxDisplayTail}).`,
    prefilled(W.lblApproach, m.tax_display ? optionLabel(m.tax_display) : ''),
    table(W.thTaxDisplay, markets.map((x) => [
      x.code, x.currency ?? TBC,
      m.tax_display === 'include_everywhere' ? said(W.yes) : m.tax_display === 'exclude_everywhere' ? said(W.no) : TBC, TBC])));

  if (m.duties_ddp === true || ddp.size) {
    add(sub(W.subDuties),
      `${W.proseDuties} (${help(DOCS.duties)}). ${W.proseDutiesTail}`,
      prefilled(W.lblHsCodes, doc.catalogue?.customs_data_source ? optionLabel(doc.catalogue.customs_data_source) : ''),
      table(W.thDuties, markets.map((x) => [
        x.code, ddp.size ? said(ddp.has(x.code) ? 'DDP' : 'DAP') : TBC, TBC, TBC])));
  }

  if (m.us_sales_tax === true || markets.some((x) => x.code === 'US')) {
    add(sub(W.subUsTax),
      `${W.proseUsTax} (${help(DOCS.usTax)}). ${W.proseUsTaxTail}`,
      table(W.thUsTax, [], 3));
  }

  add(sub(W.subReduced),
    `${W.proseReduced} (${help(DOCS.overrides)}).`,
    prefilled(W.lblReducedProducts, YES_NO(m.reduced_rate_products)),
    table(W.thReduced, []));

  if (b2b) {
    add(sub(W.subB2bTax),
      `${W.proseB2bTax} (${help(DOCS.vatValidation)}).`,
      prefilled(W.lblTaxExempt, YES_NO(doc.b2b?.tax_exempt)),
      table(W.thB2bTax, []));
  }

  const inv = doc.compliance?.invoicing ?? {};
  add(sub(W.subInvoices),
    `${W.proseInvoices} ${help(DOCS.vatInvoices)}). ${W.proseInvoicesTail}`,
    prefilled(W.lblInvoiceIssuer, inv.issuer && inv.issuer !== 'not_sure' ? optionLabel(inv.issuer) : ''),
    prefilled(W.lblEInvoicing, labels(inv.e_invoicing)),
    table(W.thInvoices, []));

  // ── 2. Shipping ─────────────────────────────────────────────────────────
  add(section(W.secShipping), W.ownerLogistics, `${W.adminShipping} · ${help(DOCS.rates)}`);

  add(sub(W.subLocations),
    prefilled(W.lblFulfilmentModel, s.model ? optionLabel(s.model) : ''),
    table(W.thLocations,
      Array.from({ length: Math.min(Math.max(s.fulfilment_locations ?? 0, 1), 20) }, () => ['', '', '', '', '', '', '']), 1));

  const services = methods.filter((x) => ['standard_shipping', 'express'].includes(x));
  const thresholds = s.free_shipping_thresholds ?? [];
  const free = (code) => thresholds.filter((t) => t.market === code).map((t) => `${t.currency ?? ''} ${t.threshold}`.trim()).join(', ');
  add(sub(W.subZones),
    W.proseZones,
    prefilled(W.lblRates, labels(s.rates)),
    table(W.thZones,
      markets.flatMap((x) => (services.length ? services : ['standard_shipping']).map((svc) => [
        x.code, TBC, TBC, optionLabel(svc), TBC, TBC, free(x.code) ? said(free(x.code)) : TBC, TBC]))));

  add(sub(W.subCarriers),
    prefilled(W.lblLabelSource, s.label_source ? optionLabel(s.label_source) : ''),
    table(W.thCarriers, (s.carriers ?? []).map((c) => [said(c), TBC, TBC, TBC, TBC])));

  add(sub(W.subWeights),
    `${W.proseWeights} (${help(DOCS.packages)}).`,
    prefilled(W.lblWeightSource, doc.catalogue?.shipping_data_source ? optionLabel(doc.catalogue.shipping_data_source) : ''),
    table(W.thPackages, []));

  add(sub(W.subDeliveryDates),
    `${W.proseDeliveryDates} (${help(DOCS.deliveryDates)}).`,
    table(W.thDeliveryDates, markets.map((x) => [x.code, TBC, TBC, TBC])));

  if (methods.includes('local_delivery')) {
    add(sub(W.subLocalDelivery),
      `${W.proseLocalDelivery} (${help(DOCS.localDelivery)}).`,
      table(W.thLocalDelivery, []));
  }
  if (methods.includes('pickup_in_store') || methods.includes('pickup_points')) {
    add(sub(W.subPickup),
      `${W.prosePickupA} (${help(DOCS.pickup)}). ${W.prosePickupB} (${help(DOCS.pickupPoints)}).`,
      table(W.thPickup, []));
  }

  add(sub(W.subSpecial),
    `${W.proseSpecialA} (${help(DOCS.dangerousGoods)}). ${W.proseSpecialB} (${help(DOCS.catalogs)}).`,
    prefilled(W.lblDangerousGoods, labels(s.dangerous_goods)),
    prefilled(W.lblSpecialRules, (s.special_rules ?? []).join(', ')),
    prefilled(W.lblExcludedCountries, (s.excluded_countries ?? []).join(', ')),
    prefilled(W.lblRestrictedProducts, YES_NO(m.product_restrictions_by_market)),
    table(W.thSpecial, []));

  if (b2b) {
    add(sub(W.subB2bShipping),
      `${W.proseB2bShipping} (${help(DOCS.b2bShipping)}).`,
      prefilled(W.lblB2bRules, labels(doc.b2b?.shipping_needs)),
      table(W.thB2bShipping, []));
  }

  const r = s.returns ?? {};
  add(sub(W.subReturns),
    prefilled(W.lblReturnWindow, r.window_days),
    prefilled(W.lblReturnPaidBy, r.shipping_paid_by ? optionLabel(r.shipping_paid_by) : ''),
    prefilled(W.lblReturnLabel, r.label ? optionLabel(r.label) : ''),
    prefilled(W.lblInternationalReturns, YES_NO(r.international_returns)),
    table(W.thReturns, markets.map((x) => [x.code, TBC, TBC, TBC])));

  // ── 3. Sign-off ─────────────────────────────────────────────────────────
  add(section(W.secSignOff), W.proseSignOff,
    table(W.thSignOff, [[`1. ${W.secTax}`, TBC, TBC], [`2. ${W.secShipping}`, TBC, TBC]], 0));

  return `${out.join('\n').trim()}\n`;
}

/**
 * Write clients/<slug>/configuration-workbook.md.
 *
 * @param {{ clientDir: string }} options
 */
function writeWorkbook({ clientDir }) {
  const file = path.join(clientDir, 'engagement.json');
  if (!fs.existsSync(file)) throw new Error(`engagement.json not found in ${clientDir} — run discovery first.`);
  const doc = JSON.parse(fs.readFileSync(file, 'utf8'));
  const { valid, errors } = validateEngagement(doc);
  if (!valid) throw new Error(`engagement.json is invalid:\n  • ${errors.slice(0, 10).join('\n  • ')}`);
  const target = path.join(clientDir, WORKBOOK_FILE);
  fs.writeFileSync(target, buildWorkbook(doc), 'utf8');
  return { doc, target };
}

function main() {
  const argv = process.argv.slice(2);
  const get = (flag) => {
    const i = argv.indexOf(flag);
    return i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined;
  };
  const client = get('--client');
  if (!client || !SLUG.test(client)) throw new Error('Usage: npm run workbook -- --client <slug> [--clients-dir clients]');
  const clientDir = path.join(path.resolve(process.cwd(), get('--clients-dir') ?? CLIENTS_DIR), client);
  const { doc, target } = writeWorkbook({ clientDir });
  const W = words(doc.meta.language);
  console.log(`✓ ${doc.meta.client.name} · ${W.cliDone}`);
  console.log(`  wrote ${path.relative(process.cwd(), target)}`);
  console.log(`  ${W.cliShare}`);
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`\n✗ ${err.message}\n`);
    process.exit(1);
  }
}
