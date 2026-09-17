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
const YES_NO = (v) => (v === true ? 'Yes' : v === false ? 'No' : TBC);
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

const prefilled = (label, value) => `- **${label}:** ${value ? `${value} *(from discovery — confirm)*` : '_to complete_'}`;

/**
 * @param {object} doc  Engagement document
 * @returns {string} Markdown workbook
 */
export function buildWorkbook(doc) {
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

  add(
    `# Store configuration workbook — ${client.name}`,
    [
      '> **What this is:** the tax and shipping details we need to configure your Shopify store. Your finance and logistics',
      '> teams complete it once the scope is agreed. Values marked *from discovery* come from our discovery sessions — please',
      '> check them. Leave no field empty: write "n/a" or "to decide". Tax and legal decisions stay with your finance team',
      '> and advisers; Merkle configures what you confirm.',
      '>',
      '> **Never enter passwords, API keys or carrier account credentials in this document** — we collect them securely.',
    ].join('\n'),
  );
  if (hasChinaMainland(doc)) add('_Mainland China is not covered by this workbook: it is handled in a separate China discovery._');

  // ── 1. Tax ──────────────────────────────────────────────────────────────
  add(section('Tax and duties'), '_Owner: finance_', `Shopify admin: Settings > Taxes and duties · [Shopify help](${DOCS.taxes})`);

  add(sub('Tax service'), prefilled('Tax calculation', m.tax_service && m.tax_service !== 'not_sure' ? optionLabel(m.tax_service) : ''),
    '- Shopify Tax calculates the US, EU, UK and Canada; other countries use rates you confirm.');

  const registrationRows = [
    ...[...new Set([...(m.vat_countries ?? []), ...markets.map((x) => x.code)])].map((code) => [
      code === 'EU' ? 'EU countries (list each registration)' : code,
      (m.vat_countries ?? []).includes(code) ? 'Yes *(from discovery)*' : TBC, TBC, TBC, TBC]),
    ...picked(m.low_value_schemes).map((scheme) => [optionLabel(scheme), 'Yes *(from discovery)*', TBC, TBC, 'Low-value import scheme']),
  ];
  add(sub('Tax registrations'),
    `One row per country, state or scheme where you collect tax. Low-value import schemes apply to the EU (IOSS), the UK, Switzerland, Norway, Australia and New Zealand ([Shopify help](${DOCS.lowValue})).`,
    table(['Country, state or scheme', 'Registered?', 'Registration number', 'Collect tax from (date)', 'Notes'], registrationRows));

  add(sub('Prices and tax display per market'),
    `Prices can include tax in some markets and exclude it in others ([dynamic tax display](${DOCS.taxInclusive}); product prices only, not shipping rates).`,
    prefilled('Approach', m.tax_display ? optionLabel(m.tax_display) : ''),
    table(['Market', 'Currency', 'Prices include tax?', 'Shipping rates include tax?'], markets.map((x) => [
      x.code, x.currency ?? TBC,
      m.tax_display === 'include_everywhere' ? 'Yes *(from discovery)*' : m.tax_display === 'exclude_everywhere' ? 'No *(from discovery)*' : TBC, TBC])));

  if (m.duties_ddp === true || ddp.size) {
    add(sub('Duties and import taxes'),
      `Per country, duties are collected at checkout (DDP) or paid by the customer on delivery (DAP) — not both. Collecting duties at checkout can't be combined with tax overrides, manual tax rates or customer tax exemptions, and some destinations are not supported ([Shopify help](${DOCS.duties})). Products need HS codes and country of origin.`,
      prefilled('HS codes and country of origin', doc.catalogue?.customs_data_source ? optionLabel(doc.catalogue.customs_data_source) : ''),
      table(['Market or country', 'DDP or DAP', 'Carrier and service for DDP shipments', 'Notes'], markets.map((x) => [
        x.code, ddp.size ? `${ddp.has(x.code) ? 'DDP' : 'DAP'} *(from discovery)*` : TBC, TBC, TBC])));
  }

  if (m.us_sales_tax === true || markets.some((x) => x.code === 'US')) {
    add(sub('US sales tax'),
      `Add each state where you are registered to collect sales tax ([Shopify help](${DOCS.usTax})). In some states (e.g. California, Colorado, Florida, Illinois, Louisiana, Maine, Maryland) you also choose how shipping is taxed.`,
      table(['State', 'Sales tax ID', 'Registered from (date)', 'Shipping taxed (when applicable / always / never)'], [], 3));
  }

  add(sub('Reduced rates, exemptions and overrides'),
    `Shopify Tax uses product categories for reduced rates and exemptions; overrides apply per country or state to a manual collection ([Shopify help](${DOCS.overrides})).`,
    prefilled('Products with reduced or zero rates or exemptions', YES_NO(m.reduced_rate_products)),
    table(['Products or collection', 'Country or state', 'Rate or exemption', 'Legal basis (from your adviser)'], []));

  if (b2b) {
    add(sub('B2B tax'),
      `Company locations can hold tax registration IDs and exemptions. Automatic EU VAT number validation (reverse charge) needs Shopify Tax, an EU fulfilment location and the "Company VAT number" checkout field ([Shopify help](${DOCS.vatValidation})).`,
      prefilled('Tax-exempt business buyers', YES_NO(doc.b2b?.tax_exempt)),
      table(['Buyer type or company', 'Country', 'VAT number validated?', 'Exempt or reverse charge?', 'Evidence kept'], []));
  }

  const inv = doc.compliance?.invoicing ?? {};
  add(sub('Invoices'),
    `Shopify can generate VAT invoices for EU and UK orders (shown on the order status page, not emailed, not for orders with duties; [Shopify help](${DOCS.vatInvoices})). E-invoicing (e.g. Peppol, XRechnung, SdI, KSeF) comes from your ERP or an invoicing app.`,
    prefilled('Invoices issued by', inv.issuer && inv.issuer !== 'not_sure' ? optionLabel(inv.issuer) : ''),
    prefilled('E-invoicing obligations', labels(inv.e_invoicing)),
    table(['Legal entity', 'Markets', 'Invoice number format', 'E-invoicing standard', 'Legal text on invoices'], []));

  // ── 2. Shipping ─────────────────────────────────────────────────────────
  add(section('Shipping and delivery'), '_Owner: logistics and customer service_', `Shopify admin: Settings > Shipping and delivery · [Shopify help](${DOCS.rates})`);

  add(sub('Locations'),
    prefilled('Fulfilment model', s.model ? optionLabel(s.model) : ''),
    table(['Location name', 'Country', 'Fulfils online orders?', 'Pickup in store?', 'Local delivery?', 'Order cut-off time', 'Processing days'],
      Array.from({ length: Math.min(Math.max(s.fulfilment_locations ?? 0, 1), 20) }, () => ['', '', '', '', '', '', '']), 1));

  const services = methods.filter((x) => ['standard_shipping', 'express'].includes(x));
  const thresholds = s.free_shipping_thresholds ?? [];
  const free = (code) => thresholds.filter((t) => t.market === code).map((t) => `${t.currency ?? ''} ${t.threshold}`.trim()).join(', ');
  add(sub('Shipping zones and rates'),
    'One row per rate shown at checkout. Cover every weight or order-value range: an order outside all ranges gets a shipping error at checkout.',
    prefilled('How rates are calculated', labels(s.rates)),
    table(['Market', 'Countries in the zone', 'Rate name at checkout', 'Service', 'Price, or calculated by carrier', 'Condition (weight or order value)', 'Free above', 'Delivery time shown'],
      markets.flatMap((x) => (services.length ? services : ['standard_shipping']).map((svc) => [
        x.code, TBC, TBC, optionLabel(svc), TBC, TBC, free(x.code) ? `${free(x.code)} *(from discovery)*` : TBC, TBC]))));

  add(sub('Carriers and labels'),
    prefilled('Labels created in', s.label_source ? optionLabel(s.label_source) : ''),
    table(['Carrier', 'Services used', 'Markets', 'Account in place?', 'Tracking link format'], (s.carriers ?? []).map((c) => [`${c} *(from discovery)*`, TBC, TBC, TBC, TBC])));

  add(sub('Product weights and packages'),
    `Labels and weight-based or carrier-calculated rates need accurate product weights and a default package ([Shopify help](${DOCS.packages})).`,
    prefilled('Product weights come from', doc.catalogue?.shipping_data_source ? optionLabel(doc.catalogue.shipping_data_source) : ''),
    table(['Package name', 'Type (box, soft pack, envelope)', 'Dimensions', 'Empty weight', 'Default?'], []));

  add(sub('Delivery dates'),
    `Shopify can show automated delivery dates for domestic orders in the US and 32 European countries when delivery takes up to 5 days (US) or 4 days (Europe) ([Shopify help](${DOCS.deliveryDates})).`,
    table(['Market', 'Show delivery dates?', 'Typical transit days', 'Holidays or closed days'], markets.map((x) => [x.code, TBC, TBC, TBC])));

  if (methods.includes('local_delivery')) {
    add(sub('Local delivery'),
      `Per location: a delivery area by radius (up to 160 km) or postal codes, up to 10 zones and 3 price rules per zone. Not offered at B2B checkout ([Shopify help](${DOCS.localDelivery})).`,
      table(['Location', 'Area (radius or postal codes)', 'Price rules', 'Minimum order', 'Delivery days and times'], []));
  }
  if (methods.includes('pickup_in_store') || methods.includes('pickup_points')) {
    add(sub('Pickup'),
      `Pickup in store is set per location ([Shopify help](${DOCS.pickup})). Pickup points are native only for stores in France, Italy, Spain and the UK with some carriers; they are not available for B2B or express wallets ([Shopify help](${DOCS.pickupPoints})).`,
      table(['Location, carrier or app', 'Type (store pickup / pickup points)', 'Markets', 'Ready for pickup in', 'Pickup instructions'], []));
  }

  add(sub('Special products and restrictions'),
    `Dangerous goods need their own delivery profile and carrier arrangements; the merchant is responsible for classification and labelling ([Shopify help](${DOCS.dangerousGoods})). Products not allowed in a market are excluded from that market's catalog ([Shopify help](${DOCS.catalogs})).`,
    prefilled('Dangerous goods', labels(s.dangerous_goods)),
    prefilled('Product-specific shipping rules', (s.special_rules ?? []).join(', ')),
    prefilled('Countries you do not ship to', (s.excluded_countries ?? []).join(', ')),
    prefilled('Products restricted in some markets', YES_NO(m.product_restrictions_by_market)),
    table(['Product or collection', 'Rule (dangerous goods / not sold in market / special rate)', 'Markets affected', 'Carrier or service', 'Notes'], []));

  if (b2b) {
    add(sub('B2B shipping'),
      `B2B buyers see the same shipping methods as consumers unless you customise them; orders can be submitted as drafts so shipping is quoted before payment ([Shopify help](${DOCS.b2bShipping})).`,
      prefilled('Rules that differ for B2B', labels(doc.b2b?.shipping_needs)),
      table(['Rule', 'Which buyers or company locations', 'Detail (rates, thresholds, carrier account)'], []));
  }

  const r = s.returns ?? {};
  add(sub('Return shipping'),
    prefilled('Return window (days)', r.window_days),
    prefilled('Who pays return shipping', r.shipping_paid_by ? optionLabel(r.shipping_paid_by) : ''),
    prefilled('How items are sent back', r.label ? optionLabel(r.label) : ''),
    prefilled('International returns', YES_NO(r.international_returns)),
    table(['Market', 'Return address or location', 'Return fee', 'Carrier or label'], markets.map((x) => [x.code, TBC, TBC, TBC])));

  // ── 3. Sign-off ─────────────────────────────────────────────────────────
  add(section('Sign-off'), 'Roles only — no names or contact details in this document.',
    table(['Section', 'Confirmed by (role)', 'Date'], [['1. Tax and duties', TBC, TBC], ['2. Shipping and delivery', TBC, TBC]], 0));

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
  console.log(`✓ ${doc.meta.client.name} · store configuration workbook (tax and shipping)`);
  console.log(`  wrote ${path.relative(process.cwd(), target)}`);
  console.log('  Share with the client once the scope is agreed; finance and logistics complete it before store set-up.');
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (err) {
    console.error(`\n✗ ${err.message}\n`);
    process.exit(1);
  }
}
