#!/usr/bin/env node
/**
 * Shopify Store Builder — Merchant Questionnaire
 * -----------------------------------------------
 * Guides the merchant through 7 decision domains and produces a
 * validated store-spec.yaml consumed by the biota build engine.
 *
 * Usage:
 *   node scripts/questionnaire/questionnaire.js
 *   node scripts/questionnaire/questionnaire.js --output ./my-store/store-spec.yaml
 */

import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_OUTPUT = path.join(process.cwd(), 'store-spec.yaml');

// ─── Locale / currency reference maps ────────────────────────────────────────
const LOCALE_FOR_COUNTRY = {
  US: 'en', GB: 'en', AU: 'en', CA: 'en',
  FR: 'fr', BE: 'fr',
  DE: 'de', AT: 'de',
  CH: 'de',   // default — questionnaire will ask about alternates
  DK: 'da', SE: 'sv', NO: 'nb',
  IT: 'it', ES: 'es', NL: 'nl',
  JP: 'ja', KR: 'ko', CN: 'zh-CN',
};

const CURRENCY_FOR_COUNTRY = {
  US: 'USD', GB: 'GBP', AU: 'AUD', CA: 'CAD',
  FR: 'EUR', DE: 'EUR', AT: 'EUR', BE: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  CH: 'CHF', DK: 'DKK', SE: 'SEK', NO: 'NOK',
  JP: 'JPY', KR: 'KRW', CN: 'CNY',
};

// ─── readline helpers ─────────────────────────────────────────────────────────
// Created lazily so the module can be imported (e.g. by tests) without opening stdin.
let rl;
const getRl = () => (rl ??= readline.createInterface({ input: process.stdin, output: process.stdout }));

function ask(question, defaultVal = '') {
  return new Promise(resolve => {
    const hint = defaultVal ? ` [${defaultVal}]` : '';
    getRl().question(`\n${question}${hint}: `, answer => {
      resolve(answer.trim() || defaultVal);
    });
  });
}

function askBool(question, defaultVal = true) {
  return new Promise(resolve => {
    const hint = defaultVal ? '[Y/n]' : '[y/N]';
    getRl().question(`\n${question} ${hint}: `, answer => {
      const a = answer.trim().toLowerCase();
      if (!a) return resolve(defaultVal);
      resolve(a === 'y' || a === 'yes');
    });
  });
}

function askList(question, defaultVal = '') {
  return new Promise(resolve => {
    const hint = defaultVal ? ` [${defaultVal}]` : ' (comma-separated)';
    getRl().question(`\n${question}${hint}: `, answer => {
      const raw = answer.trim() || defaultVal;
      resolve(raw.split(',').map(v => v.trim()).filter(Boolean));
    });
  });
}

function header(title) {
  const line = '─'.repeat(60);
  console.log(`\n${line}\n  ${title}\n${line}`);
}

// ─── DOMAIN 1: Store Identity ─────────────────────────────────────────────────
async function domainStore() {
  header('Domain 1 of 7 — Store Identity');

  const name              = await ask('Store name (display name)', 'My Shopify Store');
  const primaryCountry    = await ask('Primary market country (ISO 2-letter code)', 'US');
  const defaultLocale     = await ask('Default storefront locale', LOCALE_FOR_COUNTRY[primaryCountry.toUpperCase()] || 'en');
  const defaultCurrency   = await ask('Default currency (ISO 4217)', CURRENCY_FOR_COUNTRY[primaryCountry.toUpperCase()] || 'USD');
  const shopifyPlan       = await ask('Shopify plan (basic/shopify/advanced/plus)', 'shopify');

  return { name, defaultLocale, defaultCurrency, primaryMarketCountry: primaryCountry.toUpperCase(), shopifyPlan };
}

// ─── DOMAIN 2: Markets ────────────────────────────────────────────────────────
async function domainMarkets() {
  header('Domain 2 of 7 — Markets & Locales');
  console.log('  Enter one market at a time. Each market = a Shopify Market with its own\n  locale stack, currency, and URL subdirectory.');

  const markets = [];
  let addMore = true;

  while (addMore) {
    console.log(`\n  ── Market #${markets.length + 1} ──`);
    const name            = await ask('Market name (e.g. Switzerland)');
    const countries       = await askList('Countries in this market (ISO codes)', name.toUpperCase().slice(0, 2));
    const defaultLocale   = await ask('Default locale for this market (BCP-47)', LOCALE_FOR_COUNTRY[countries[0]?.toUpperCase()] || 'en');
    const alternates      = await askList('Alternate locales (leave blank for none)', '');
    const currency        = await ask('Currency for this market (ISO 4217)', CURRENCY_FOR_COUNTRY[countries[0]?.toUpperCase()] || 'USD');
    const taxIncluded     = await askBool('Are prices shown with tax included (VAT)?', false);
    const hasPriceAdj     = await askBool('Apply a price adjustment vs. base prices?', false);

    let priceAdjustment;
    if (hasPriceAdj) {
      const type  = await ask('Adjustment type (percentage/fixed)', 'percentage');
      const value = parseFloat(await ask('Adjustment value (e.g. 10 for +10%, -5 for -5%)', '0'));
      priceAdjustment = { type, value };
    }

    markets.push({
      name,
      countries: countries.map(c => c.toUpperCase()),
      defaultLocale,
      alternateLocales: alternates,
      currency,
      taxIncluded,
      ...(priceAdjustment ? { priceAdjustment } : {}),
    });

    addMore = await askBool('Add another market?', false);
  }

  return markets;
}

// ─── DOMAIN 3: Catalog ───────────────────────────────────────────────────────
async function domainCatalog() {
  header('Domain 3 of 7 — Product Catalogue');

  const estimatedSkuCount  = parseInt(await ask('Estimated SKU count at launch', '50'), 10);

  // ── Product types inventory ───────────────────────────────────────────────
  console.log('\n  ── Product types: confirm which apply (Y/n each) ──');
  const hasSimpleProducts    = await askBool('Simple products (no variants)?', true);
  const hasVariants          = await askBool('Variant products (size / colour / material)?', false);
  let variantOptions         = [];
  let maxOptionsPerProduct   = 1;
  let maxVariantsPerProduct  = 1;
  if (hasVariants) {
    variantOptions = await askList('Variant option names', 'Size,Color');
    maxOptionsPerProduct  = parseInt(await ask('Maximum number of OPTIONS on a single product (Shopify limit = 3)', '2'), 10);
    maxVariantsPerProduct = parseInt(await ask('Maximum number of VARIANTS on a single product (Shopify limit = 100)', '20'), 10);

    if (maxOptionsPerProduct > 3) {
      console.log('\n  ⚠️  EXIT TRIGGER — more than 3 variant options detected.');
      console.log('     Shopify hard limit is 3 options per product.');
      console.log('     This requires a custom solution (metafields + theme logic or a headless approach).');
      console.log('     → Flag § 11.3 in the questionnaire. Do NOT proceed with standard scoping.\n');
    }
    if (maxVariantsPerProduct > 100) {
      console.log('\n  ⚠️  EXIT TRIGGER — more than 100 variants per product detected.');
      console.log('     Shopify hard limit is 100 variants per product.');
      console.log('     → Flag § 11.3. Bespoke quote required.\n');
    }
  }

  const hasBundles          = await askBool('Bundle / kit products (multiple SKUs sold as one unit)?', false);
  const hasProductSets      = await askBool('Product sets / looks (shown together, sold separately)?', false);
  const hasGiftCards        = await askBool('Gift card products?', false);
  const hasDigitalProducts  = await askBool('Digital / downloadable products?', false);
  const hasSubscriptions    = await askBool('Subscription products (recurring billing)?', false);
  let subscriptionApp       = null;
  if (hasSubscriptions) {
    const useRecharge = await askBool('Use Recharge (advanced)? If no, will use Shopify Subscriptions (native, basic)', false);
    subscriptionApp = useRecharge ? 'recharge' : 'shopify_subscriptions';
  }
  const hasPreorders        = await askBool('Pre-order products (sell before stock exists)?', false);
  const hasMadeToOrder      = await askBool('Made-to-order / personalised products (engravings, monograms)?', false);
  const hasVirtualProducts  = await askBool('Virtual / service products (consultations, warranties)?', false);

  // ── Integration count check ───────────────────────────────────────────────
  const integrationImpact = [
    hasBundles && 'Shopify Bundles (free)',
    hasDigitalProducts && 'digital fulfilment app (Sky Pilot / FetchApp)',
    (hasSubscriptions && subscriptionApp === 'recharge') && 'Recharge',
    hasPreorders && 'pre-order app (Timesact / Pre-order Now)',
  ].filter(Boolean);

  if (integrationImpact.length > 0) {
    console.log('\n  ℹ️  Product-type integrations implied:');
    integrationImpact.forEach(i => console.log(`     • ${i}`));
    if (integrationImpact.length >= 3) {
      console.log('\n  ⚠️  3+ product-type integrations — this store may already exceed the Medium tier threshold.');
      console.log('     Verify integration total in § 11 before committing to a tier.\n');
    }
  }

  if (hasMadeToOrder) {
    console.log('\n  ⚠️  Made-to-order / personalised products require T3 scoping.');
    console.log('     Checkout Extensibility or draft orders — discuss approach with architect before estimating.\n');
  }

  // ── Inventory ─────────────────────────────────────────────────────────────
  const inventoryTracking   = await askBool('Track inventory per variant?', true);
  const inventoryLocations  = await askList('Inventory/fulfillment location names', 'Main Warehouse');

  // ── Metafields ────────────────────────────────────────────────────────────
  const needsMetafields = await askBool('Do products need custom metafields?', false);
  let metafields = [];
  if (needsMetafields) {
    let addMore = true;
    while (addMore) {
      console.log(`\n  ── Metafield #${metafields.length + 1} ──`);
      const namespace = await ask('Namespace', 'custom');
      const key       = await ask('Key (e.g. care_instructions)');
      const type      = await ask('Type (e.g. single_line_text_field, json, boolean)', 'single_line_text_field');
      metafields.push({ namespace, key, type });
      addMore = await askBool('Add another metafield?', false);
    }
  }

  // ── Assembled product types array for store-spec ──────────────────────────
  const productTypes = [
    hasSimpleProducts   && 'simple',
    hasVariants         && 'variant',
    hasBundles          && 'bundle',
    hasProductSets      && 'product_set',
    hasGiftCards        && 'gift_card',
    hasDigitalProducts  && 'digital',
    hasSubscriptions    && 'subscription',
    hasPreorders        && 'pre_order',
    hasMadeToOrder      && 'made_to_order',
    hasVirtualProducts  && 'virtual',
  ].filter(Boolean);

  return {
    estimatedSkuCount,
    productTypes,
    hasVariants, variantOptions, maxOptionsPerProduct, maxVariantsPerProduct,
    hasBundles, hasProductSets, hasGiftCards, hasDigitalProducts,
    hasSubscriptions, subscriptionApp,
    hasPreorders, hasMadeToOrder, hasVirtualProducts,
    inventoryTracking, inventoryLocations,
    metafields,
  };
}

// ─── DOMAIN 4: Payments ──────────────────────────────────────────────────────
async function domainPayments() {
  header('Domain 4 of 7 — Payments & Checkout');

  const useShopifyPayments    = await askBool('Use Shopify Payments?', true);
  const additionalGateways    = await askList('Additional payment gateways (e.g. PayPal,Klarna)', '');
  const b2bEnabled            = await askBool('Enable B2B / wholesale pricing?', false);
  const giftCardsEnabled      = await askBool('Enable gift cards?', false);
  const dutiesAndImportTaxes  = await askBool('Collect duties/import taxes at checkout for international?', false);

  return { useShopifyPayments, additionalGateways, b2bEnabled, giftCardsEnabled, dutiesAndImportTaxes };
}

// ─── DOMAIN 5: Branding ──────────────────────────────────────────────────────
async function domainBranding() {
  header('Domain 5 of 7 — Theme & Branding');

  const themeSource = await ask('Theme source: dawn / custom-existing / purchased / headless-hydrogen', 'dawn');
  let themeRepoUrl;
  if (themeSource === 'custom-existing' || themeSource === 'headless-hydrogen') {
    themeRepoUrl = await ask('Git URL of the theme/storefront repo');
  }

  const primaryColor   = await ask('Primary brand color (hex)', '#1A1A1A');
  const secondaryColor = await ask('Secondary brand color (hex)', '#FFFFFF');
  const logoUrl        = await ask('Logo URL or file path (optional)', '');
  const fontPrimary    = await ask('Primary font', 'Inter');
  const customSections = await askList('Custom Liquid sections to scaffold (optional)', '');

  return {
    themeSource,
    ...(themeRepoUrl ? { themeRepoUrl } : {}),
    primaryColor,
    secondaryColor,
    ...(logoUrl ? { logoUrl } : {}),
    fontPrimary,
    customSections,
  };
}

// ─── DOMAIN 6: SEO ───────────────────────────────────────────────────────────
async function domainSEO() {
  header('Domain 6 of 7 — SEO & Analytics');

  const hreflangEnabled   = await askBool('Generate hreflang tags per market/locale?', true);
  const sitemapPerMarket  = await askBool('Generate a sitemap per market?', true);
  const metaTitleTemplate = await ask('Meta title template', '{{product}} | {{storeName}}');
  const robotsTxt         = await ask('robots.txt (default/custom)', 'default');
  const analyticsProvider = await ask('Analytics provider (none/ga4/gtm/segment)', 'none');

  return { hreflangEnabled, sitemapPerMarket, metaTitleTemplate, robotsTxt, analyticsProvider };
}

// ─── DOMAIN 7: Promotions & Loyalty ─────────────────────────────────────────
async function domainPromotions() {
  header('Domain 7 of 8 — Promotions, Loyalty & Campaigns');

  // ── Native discount types ─────────────────────────────────────────────────
  console.log('\n  ── Discount types (confirm which apply) ──');
  const discountPercentage  = await askBool('Percentage-off discounts?', true);
  const discountFixed       = await askBool('Fixed-amount-off discounts?', false);
  const discountBogo        = await askBool('Buy-X-get-Y (BOGO) promotions?', false);
  const discountFreeShip    = await askBool('Free shipping discounts?', false);
  const discountVolume      = await askBool('Volume / tiered discounts (spend £X get Y% off)?', false);
  const discountAutomatic   = await askBool('Automatic discounts (no code needed)?', false);
  const discountCodes       = await askBool('Code-based / coupon discounts?', true);
  const discountFlashSale   = await askBool('Flash sales with scheduled start + end times?', false);
  const discountStackable   = await askBool('Promotions must stack (e.g. code + automatic simultaneously)?', false);
  const discountPosOnly     = await askBool('POS-only in-store promotions (separate from online)?', false);

  // ── Integration check: non-native discount types ──────────────────────────
  const discountIntegrations = [
    discountVolume    && 'volume-discount app (Discounts Lab / Bundler / Bold)',
    discountFlashSale && 'flash-sale / scheduling app (Sale Genius / Mechanic)',
  ].filter(Boolean);

  if (discountIntegrations.length > 0) {
    console.log('\n  ℹ️  Promotion integrations implied:');
    discountIntegrations.forEach(i => console.log(`     • ${i}`));
  }

  if (discountStackable) {
    console.log('\n  ⚠️  Stackable discounts: Shopify 2024+ allows 1 automatic + 1 code simultaneously.');
    console.log('     Unlimited stacking requires Checkout Extensibility (discount functions) — T3 work.');
    console.log('     Clarify which exact combinations must stack before estimating.\n');
  }

  // ── Coupon configuration ──────────────────────────────────────────────────
  let couponConfig = null;
  if (discountCodes) {
    const couponType = await ask('Coupon type: single-use / multi-use / bulk-csv', 'multi-use');
    const couponBranded = await askBool('Codes are brand-named (e.g. WELCOME20)?', true);
    const couponExpiry  = await askBool('Codes have an expiry date?', false);
    couponConfig = { couponType, couponBranded, couponExpiry };
  }

  // ── Loyalty programme ─────────────────────────────────────────────────────
  console.log('\n  ── Loyalty programme ──');
  const loyaltyNone        = await askBool('No loyalty programme needed?', true);
  let loyaltyConfig        = null;
  let loyaltyApp           = null;
  if (!loyaltyNone) {
    const loyaltyPoints    = await askBool('Points earned per purchase?', false);
    const loyaltyActions   = await askBool('Points for actions (reviews, referrals, social)?', false);
    const loyaltyTiers     = await askBool('Tiered VIP status (Bronze → Silver → Gold)?', false);
    const loyaltyReferral  = await askBool('Referral programme (earn when a friend buys)?', false);
    const loyaltyCredit    = await askBool('Store credit / cashback as a reward?', false);

    loyaltyApp = await ask('Loyalty app: smile.io / loyaltylion / yotpo-loyalty / tbd', 'smile.io');

    if (loyaltyReferral) {
      const referralBundled = await askBool('Is referral bundled in the loyalty app (not a separate app)?', true);
      if (!referralBundled) {
        console.log('\n  ℹ️  Separate referral app +1 integration (Referral Candy / Viral Loops).\n');
      }
      loyaltyConfig = { loyaltyPoints, loyaltyActions, loyaltyTiers, loyaltyReferral, referralBundled, loyaltyCredit };
    } else {
      loyaltyConfig = { loyaltyPoints, loyaltyActions, loyaltyTiers, loyaltyReferral: false, loyaltyCredit };
    }
  }

  // ── Gift cards as promotional instrument ─────────────────────────────────
  const giftCardAsProduct = await askBool('Gift cards sold as a product in the store?', false);
  const giftCardAsReward  = await askBool('Gift cards issued as a reward / store credit by the brand?', false);

  // ── Affiliate & influencer ────────────────────────────────────────────────
  const hasAffiliate    = await askBool('Affiliate programme (commission per referred sale)?', false);
  let affiliateApp      = null;
  if (hasAffiliate) {
    affiliateApp = await ask('Affiliate platform: refersion / uppromote / shareasale / impact / tbd', 'tbd');
  }
  const hasCollabs      = await askBool('Use Shopify Collabs for influencer seeding?', false);

  // ── Campaign coordination ─────────────────────────────────────────────────
  const campaignEspTriggered  = await askBool('Promotions triggered / coordinated with ESP (Klaviyo / Braze)?', false);
  const campaignLandingPages  = await askBool('Dedicated campaign landing pages needed?', false);
  const campaignCountdowns    = await askBool('Countdown timers / urgency elements on PDP or checkout?', false);
  const campaignByMarket      = await askBool('Different promotions per market / region?', false);

  // ── Total integration warning ─────────────────────────────────────────────
  const allPromoIntegrations = [
    ...discountIntegrations,
    (!loyaltyNone && loyaltyApp) && `loyalty: ${loyaltyApp}`,
    (hasAffiliate && affiliateApp) && `affiliate: ${affiliateApp}`,
  ].filter(Boolean);

  if (allPromoIntegrations.length >= 2) {
    console.log('\n  ⚠️  2+ promotion integrations detected. Combined with product-type and payment');
    console.log('     integrations, you may be approaching or exceeding the Medium tier threshold (≤3 total).');
    console.log('     Review integration count in § 11 of the questionnaire before confirming tier.\n');
  }

  const discountTypes = [
    discountPercentage && 'percentage',
    discountFixed      && 'fixed_amount',
    discountBogo       && 'bogo',
    discountFreeShip   && 'free_shipping',
    discountVolume     && 'volume_tiered',
    discountAutomatic  && 'automatic',
    discountCodes      && 'code_based',
    discountFlashSale  && 'flash_sale',
    discountPosOnly    && 'pos_only',
  ].filter(Boolean);

  return {
    discountTypes,
    discountStackable,
    couponConfig,
    loyaltyApp: loyaltyNone ? null : loyaltyApp,
    loyaltyConfig,
    giftCardAsProduct,
    giftCardAsReward,
    affiliateApp,
    hasCollabs,
    campaignEspTriggered,
    campaignLandingPages,
    campaignCountdowns,
    campaignByMarket,
  };
}

// ─── DOMAIN 8: Apps ──────────────────────────────────────────────────────────
async function domainApps() {
  header('Domain 8 of 8 — Third-party Apps');

  const reviewsApp     = await ask('Reviews app (judge.me / yotpo / stamped / none)', 'none');
  const emailMarketing = await ask('Email marketing (klaviyo / shopify-email / mailchimp / none)', 'none');
  const loyaltyApp     = await ask('Loyalty app (smile.io / yotpo-loyalty / none)', 'none');
  const searchApp      = await ask('Search app (boost-commerce / searchpie / none)', 'none');
  const customApps     = await askList('Any other app handles (optional)', '');

  return {
    reviewsApp:     reviewsApp     === 'none' ? null : reviewsApp,
    emailMarketing: emailMarketing === 'none' ? null : emailMarketing,
    loyaltyApp:     loyaltyApp     === 'none' ? null : loyaltyApp,
    searchApp:      searchApp      === 'none' ? null : searchApp,
    customApps,
  };
}

// ─── YAML serialiser (no dependency, hand-rolled for simple schema) ───────────
function toYaml(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  let out = '';
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) {
      out += `${pad}${k}: null\n`;
    } else if (typeof v === 'boolean') {
      out += `${pad}${k}: ${v}\n`;
    } else if (typeof v === 'number') {
      out += `${pad}${k}: ${v}\n`;
    } else if (typeof v === 'string') {
      const needsQuotes = v.includes(':') || v.includes('#') || v.includes("'") || v === '';
      out += `${pad}${k}: ${needsQuotes ? `"${v.replace(/"/g, '\\"')}"` : v}\n`;
    } else if (Array.isArray(v)) {
      if (v.length === 0) {
        out += `${pad}${k}: []\n`;
      } else if (typeof v[0] === 'string' || typeof v[0] === 'number') {
        out += `${pad}${k}:\n${v.map(i => `${pad}  - ${i}`).join('\n')}\n`;
      } else {
        out += `${pad}${k}:\n`;
        for (const item of v) {
          out += `${pad}  -\n${toYaml(item, indent + 2).replace(/^/gm, '  ').replace(/^  /, '')}`;
        }
      }
    } else if (typeof v === 'object') {
      out += `${pad}${k}:\n${toYaml(v, indent + 1)}`;
    }
  }
  return out;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

/**
 * Resolve --output from CLI args (`--output path` or `--output=path`).
 * Falls back to DEFAULT_OUTPUT when the flag is absent or has no value.
 *
 * @param {string[]} args  process.argv.slice(2)
 * @returns {string}
 */
export function resolveOutputPath(args) {
  const inline = args.find(a => a.startsWith('--output='));
  if (inline) return inline.slice('--output='.length) || DEFAULT_OUTPUT;

  const idx  = args.indexOf('--output');
  const next = idx === -1 ? undefined : args[idx + 1];
  return next && !next.startsWith('--') ? next : DEFAULT_OUTPUT;
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║   Shopify Store Builder — Merchant Questionnaire             ║');
  console.log('║   8 domains · ~40 questions · produces store-spec.yaml       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('\nAnswers are saved locally. Press Enter to accept [defaults].\n');

  const outputPath = resolveOutputPath(process.argv.slice(2));

  const store      = await domainStore();
  const markets    = await domainMarkets();
  const catalog    = await domainCatalog();
  const payments   = await domainPayments();
  const branding   = await domainBranding();
  const seo        = await domainSEO();
  const promotions = await domainPromotions();
  const apps       = await domainApps();

  const spec = { store, markets, catalog, payments, branding, seo, promotions, apps };

  const yaml = `# store-spec.yaml — generated by Shopify Store Builder Questionnaire
# DO NOT EDIT MANUALLY unless you know what you're doing.
# Feed this file to the biota build engine:
#   node scripts/generate-stories.js --spec ${path.basename(outputPath)}
#
# Generated: ${new Date().toISOString()}

${toYaml(spec)}`;

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, yaml, 'utf8');

  rl?.close();

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  ✅  store-spec.yaml written to:                              ║`);
  console.log(`║     ${outputPath.padEnd(57)}║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  Next steps:                                                 ║');
  console.log('║    1. Review integration count vs tier in § 11               ║');
  console.log('║    2. Generate user stories:                                 ║');
  console.log(`║       node scripts/generate-stories.js --spec ${path.basename(outputPath).padEnd(13)}║`);
  console.log('╚══════════════════════════════════════════════════════════════╝\n');
}

if (process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(err); process.exit(1); });
}
