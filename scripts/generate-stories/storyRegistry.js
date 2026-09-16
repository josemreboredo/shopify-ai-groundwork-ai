/**
 * @file storyRegistry.js
 * @description Catalogue of delivery stories for the shopify-ai-builder pipeline.
 *
 * Each story describes one atomic unit of work that can be handed to the
 * AI delivery pipeline.  The `applicability` guard is a function that receives
 * the parsed {@link StoreSpec} and returns `true` only when the story is
 * relevant to that spec.  `selectStories(spec)` uses these guards to produce
 * the filtered list that drives story generation.
 *
 * No external dependencies — pure Node.js built-ins only.
 *
 * @module storyRegistry
 */

// ─── JSDoc type definitions ──────────────────────────────────────────────────

/**
 * Complexity rating for a story.
 * @typedef {'XS'|'S'|'M'|'L'|'XL'} Complexity
 */

/**
 * @typedef {Object} Story
 * @property {string}      slug           Kebab-case unique identifier
 * @property {string}      title          Short human-readable title
 * @property {string}      domain         Domain bucket (e.g. "store-identity")
 * @property {Complexity}  complexity     T-shirt size
 * @property {(spec: import('./parseSpec.js').StoreSpec) => boolean} applicability
 *   Guard that returns `true` when this story applies to the given spec
 * @property {string}      prompt         Detailed instruction handed to the AI agent
 */

// ─── Domain: store-identity ───────────────────────────────────────────────────

/** @type {Story[]} */
const STORE_IDENTITY_STORIES = [
  {
    slug:        'store-branding-tokens',
    title:       'Apply brand tokens to Horizon theme',
    domain:      'store-identity',
    complexity:  'S',
    applicability: (spec) => spec?.theme?.brandTokens === true,
    prompt:
      'Read the brand colour palette, typography scale and spacing system from ' +
      'the project brief.  Map every value to the matching Shopify Horizon CSS ' +
      'custom property.  Update `config/settings_data.json` and any relevant ' +
      'section schema defaults.  Verify the output renders correctly in the ' +
      'theme editor without hardcoded hex values in Liquid files.',
  },
  {
    slug:        'store-favicon-meta',
    title:       'Favicon and browser meta tags',
    domain:      'store-identity',
    complexity:  'XS',
    applicability: (_spec) => true,
    prompt:
      'Add the brand favicon (16 px, 32 px, 180 px apple-touch-icon) to ' +
      '`assets/`.  Update `layout/theme.liquid` to reference them via ' +
      '`{{ settings.favicon | image_url }}`  if the theme supports the setting, ' +
      'or via hardcoded asset_url as a fallback.  Add Open Graph and Twitter Card ' +
      'meta tags using `page_title` and `page_description`.',
  },
  {
    slug:        'store-announcement-bar',
    title:       'Announcement bar with localised copy',
    domain:      'store-identity',
    complexity:  'S',
    applicability: (spec) => (spec?.markets?.count ?? 1) >= 1,
    prompt:
      'Implement or configure the Horizon announcement bar section.  ' +
      'Support at least one message slot with a URL, and localise the copy ' +
      'using Shopify\'s `t:` translation key convention.  ' +
      'If the store serves multiple markets, ensure the announcement is ' +
      'translatable per locale in the locale JSON files.',
  },
  {
    slug:        'store-footer-navigation',
    title:       'Footer navigation and legal links',
    domain:      'store-identity',
    complexity:  'S',
    applicability: (_spec) => true,
    prompt:
      'Configure the Horizon footer section with three navigation groups: ' +
      'Shop, Help and Legal.  Wire up the Privacy Policy, Terms of Service ' +
      'and Refund Policy pages (create stubs if they do not exist).  ' +
      'Add social icon links sourced from `settings_data.json` social fields.',
  },
  {
    slug:        'store-cookie-consent',
    title:       'Cookie consent banner (GDPR / CCPA)',
    domain:      'store-identity',
    complexity:  'M',
    applicability: (spec) => {
      const eu = ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'PT', 'PL', 'AT', 'SE', 'DK', 'FI'];
      const primary = spec?.store?.primaryMarketCountry ?? '';
      const hasEuMarket = eu.includes(primary) ||
        (spec?.markets?.marketList ?? []).some((m) => eu.includes(m?.code ?? ''));
      return hasEuMarket || spec?.store?.primaryMarketCountry === 'US';
    },
    prompt:
      'Implement a cookie consent banner using the Shopify Customer Privacy API ' +
      '(`window.Shopify.customerPrivacy`).  Show the banner on first visit for ' +
      'EU visitors and California residents.  Provide Accept / Decline buttons.  ' +
      'Gate analytics scripts (GA4, Meta Pixel) behind consent.  ' +
      'Store consent in a 12-month cookie and suppress the banner on return visits.',
  },
];

// ─── Domain: markets ─────────────────────────────────────────────────────────

/** @type {Story[]} */
const MARKETS_STORIES = [
  {
    slug:        'markets-shopify-markets-setup',
    title:       'Configure Shopify Markets for multi-region selling',
    domain:      'markets',
    complexity:  'M',
    applicability: (spec) => (spec?.markets?.count ?? 1) > 1,
    prompt:
      'Enable Shopify Markets in the admin.  Create one Market per entry in ' +
      '`markets.marketList`.  Set the correct currency, pricing rules and domain ' +
      'or subfolder strategy per market.  Document the URL structure chosen ' +
      '(subfolder vs subdomain) in `docs/markets.md`.',
  },
  {
    slug:        'markets-locale-files',
    title:       'Seed locale translation files',
    domain:      'markets',
    complexity:  'M',
    applicability: (spec) => (spec?.markets?.marketList ?? []).some(
      (m) => (m?.languages ?? []).length > 1 ||
             (m?.languages?.[0] && m.languages[0] !== (spec?.store?.defaultLocale ?? 'en')),
    ),
    prompt:
      'For each non-default language in `markets.marketList`, create or extend ' +
      'the corresponding locale file under `locales/` (e.g. `locales/fr.json`).  ' +
      'Translate all `t:` keys present in the default locale.  ' +
      'Validate JSON syntax and ensure no keys are missing relative to the ' +
      'default locale file.',
  },
  {
    slug:        'markets-currency-switcher',
    title:       'Currency / country switcher in header',
    domain:      'markets',
    complexity:  'M',
    applicability: (spec) => (spec?.markets?.count ?? 1) > 1,
    prompt:
      'Add a country and currency selector to the Horizon header.  ' +
      'Use the `localization` Liquid object and the `/cart/update.js` endpoint ' +
      'to persist the customer\'s selection.  ' +
      'Render the selector as a disclosure widget with a flag emoji or country ' +
      'code, and the active currency symbol.',
  },
  {
    slug:        'markets-hreflang-tags',
    title:       'hreflang alternate link tags for SEO',
    domain:      'markets',
    complexity:  'S',
    applicability: (spec) => (spec?.markets?.count ?? 1) > 1,
    prompt:
      'Inject `<link rel="alternate" hreflang="…">` tags in the `<head>` for ' +
      'every active market and locale combination.  Use the Liquid ' +
      '`routes.root_url` and locale handles to construct canonical alternate URLs.  ' +
      'Include an `x-default` tag pointing to the primary market URL.',
  },
];

// ─── Domain: catalogue ───────────────────────────────────────────────────────

/** @type {Story[]} */
const CATALOGUE_STORIES = [
  {
    slug:        'catalogue-product-metafields',
    title:       'Define and surface product metafields',
    domain:      'catalogue',
    complexity:  'M',
    applicability: (spec) => (spec?.catalogue?.metafields ?? []).length > 0,
    prompt:
      'For each entry in `catalogue.metafields`, create the metafield definition ' +
      'via the Shopify Admin API (`metafieldDefinitionCreate`).  ' +
      'Expose each metafield on the product page using the Horizon ' +
      '`product-information` block.  ' +
      'Add a settings toggle so merchants can show or hide individual metafields ' +
      'from the theme editor.',
  },
  {
    slug:        'catalogue-bundles',
    title:       'Product bundle section',
    domain:      'catalogue',
    complexity:  'L',
    applicability: (spec) => spec?.catalogue?.hasBundles === true,
    prompt:
      'Build a "Bundle" product section that renders a fixed set of variant ' +
      'selectors (one per component product) and a single "Add bundle to cart" ' +
      'CTA.  Use the Cart API to add all line items atomically.  ' +
      'Display the combined price and the individual savings.  ' +
      'Gate the feature on the `bundle` product tag so standard PDPs are unaffected.',
  },
  {
    slug:        'catalogue-digital-products',
    title:       'Digital product delivery flow',
    domain:      'catalogue',
    complexity:  'L',
    applicability: (spec) => spec?.catalogue?.hasDigitalProducts === true,
    prompt:
      'Configure Shopify Digital Downloads (or a compatible app) for digital ' +
      'product SKUs tagged `digital`.  ' +
      'Remove shipping-related UI elements (weight, fulfilment, delivery estimate) ' +
      'from the PDP for digital products.  ' +
      'Verify that the post-purchase download link is delivered via order ' +
      'confirmation email.',
  },
  {
    slug:        'catalogue-subscriptions',
    title:       'Subscription product setup (Recharge / native)',
    domain:      'catalogue',
    complexity:  'XL',
    applicability: (spec) => spec?.catalogue?.hasSubscriptions === true,
    prompt:
      'Integrate the subscription provider listed in `integrations` (or Recharge ' +
      'as default).  Add a "Subscribe & Save" widget to the PDP with frequency ' +
      'selector and discount badge.  ' +
      'Handle both one-time and subscription purchase paths in the Cart API calls.  ' +
      'Test that subscription orders appear correctly in the Shopify admin.',
  },
  {
    slug:        'catalogue-preorders',
    title:       'Pre-order badge and messaging',
    domain:      'catalogue',
    complexity:  'M',
    applicability: (spec) => spec?.catalogue?.hasPreorders === true,
    prompt:
      'Detect products tagged `preorder`.  Replace the Add-to-Cart button label ' +
      'with "Pre-order" and surface an estimated dispatch date stored in a ' +
      'product metafield (`custom.preorder_dispatch_date`).  ' +
      'Show a banner in the cart when pre-order items are present advising the ' +
      'combined shipping date.',
  },
  {
    slug:        'catalogue-b2b-wholesale-catalogue',
    title:       'B2B wholesale catalogue (company login gate)',
    domain:      'catalogue',
    complexity:  'XL',
    applicability: (spec) => spec?.catalogue?.b2bWholesale === true,
    prompt:
      'Enable Shopify B2B on the store.  Create a Company and at least one ' +
      'Location with a price list.  Gate the wholesale catalogue behind the ' +
      'B2B login page.  Use `customer.b2b?` in Liquid to conditionally render ' +
      'wholesale pricing, net-term checkout and company account pages.',
  },
  {
    slug:        'catalogue-collection-filtering',
    title:       'Faceted collection filtering',
    domain:      'catalogue',
    complexity:  'M',
    applicability: (_spec) => true,
    prompt:
      'Enable Shopify Search & Discovery app filters on collection pages.  ' +
      'Configure filter groups for: product type, price range, and any ' +
      'metafield-based attributes defined in the spec.  ' +
      'Style the filter drawer to match brand tokens and verify WCAG 2.1 AA ' +
      'keyboard accessibility.',
  },
];

// ─── Domain: promotions ───────────────────────────────────────────────────────

/** @type {Story[]} */
const PROMOTIONS_STORIES = [
  {
    slug:        'promotions-discount-functions',
    title:       'Shopify Discount Functions for custom promotion logic',
    domain:      'promotions',
    complexity:  'L',
    applicability: (spec) => (spec?.promotions?.types ?? []).length > 0,
    prompt:
      'Scaffold a Shopify Functions extension for the promotion types listed in ' +
      '`promotions.types`.  Implement the `purchase.discount-code-application` ' +
      'or `purchase.product-discount` function target as appropriate.  ' +
      'Write unit tests with the Shopify Functions testing harness.  ' +
      'Deploy via `shopify app deploy`.',
  },
  {
    slug:        'promotions-stacking',
    title:       'Discount stacking configuration',
    domain:      'promotions',
    complexity:  'M',
    applicability: (spec) => spec?.promotions?.stackingAllowed === true,
    prompt:
      'Configure the discount stacking rules in the Shopify admin to allow ' +
      'multiple discount codes to apply simultaneously.  ' +
      'Update the cart page to display each applied discount line and its saving.  ' +
      'Add a test fixture that applies two discount codes and verifies both ' +
      'appear in the cart response.',
  },
  {
    slug:        'promotions-countdown-timer',
    title:       'Countdown timer for time-limited promotions',
    domain:      'promotions',
    complexity:  'S',
    applicability: (spec) => spec?.promotions?.strictScheduling === true,
    prompt:
      'Build a `countdown-timer` custom element (Web Component, no framework ' +
      'dependency) that accepts `data-end` (ISO 8601 datetime) and renders ' +
      'HH:MM:SS.  Register it in `assets/countdown-timer.js` and load it ' +
      'deferred.  Add it to the announcement bar and product badge sections ' +
      'via a schema block.',
  },
  {
    slug:        'promotions-free-gift-with-purchase',
    title:       'Free gift with purchase threshold',
    domain:      'promotions',
    complexity:  'M',
    applicability: (spec) =>
      (spec?.promotions?.types ?? []).some((t) =>
        typeof t === 'string' && t.toLowerCase().includes('gift'),
      ),
    prompt:
      'Implement a "Free gift with purchase" cart upsell.  ' +
      'When cart subtotal exceeds the configured threshold, automatically add ' +
      'the gift variant via the Cart API and surface a progress bar in the ' +
      'cart drawer.  Store the threshold and gift variant ID in theme settings ' +
      'so merchants can configure without a code deploy.',
  },
];

// ─── Domain: checkout ─────────────────────────────────────────────────────────

/** @type {Story[]} */
const CHECKOUT_STORIES = [
  {
    slug:        'checkout-express-buttons',
    title:       'Express checkout buttons (Shop Pay / Apple Pay / Google Pay)',
    domain:      'checkout',
    complexity:  'S',
    applicability: (spec) => spec?.checkout?.expressCheckout === true,
    prompt:
      'Enable accelerated checkout buttons on the product page and cart page ' +
      'using the Shopify `checkout-sheet-kit` or native `<shopify-payment-button>` ' +
      'web component.  Verify each gateway (Shop Pay, Apple Pay, Google Pay) ' +
      'renders only when the browser/device supports it.  ' +
      'Ensure buttons do not appear on password-protected or B2B-only stores.',
  },
  {
    slug:        'checkout-gift-cards',
    title:       'Gift card product and redemption at checkout',
    domain:      'checkout',
    complexity:  'M',
    applicability: (spec) => spec?.checkout?.giftCards === true,
    prompt:
      'Create a gift card product with denominations of 25, 50, 100 and 200 in ' +
      'the store currency.  Enable the gift card product type in Shopify admin.  ' +
      'Add a gift card entry field to the cart page using the Cart API ' +
      '`gift_cards` endpoint.  Verify redemption is reflected in order totals.',
  },
  {
    slug:        'checkout-b2b-net-terms',
    title:       'B2B net-terms payment at checkout',
    domain:      'checkout',
    complexity:  'L',
    applicability: (spec) =>
      spec?.checkout?.b2bNetTerms === true && spec?.catalogue?.b2bWholesale === true,
    prompt:
      'Configure Shopify B2B net-payment terms (Net 30 / Net 60) for company ' +
      'accounts.  Build a Checkout UI Extension that surfaces the net-terms ' +
      'option as a payment method for authenticated B2B customers.  ' +
      'Verify that orders placed on net terms appear with the correct payment ' +
      'status ("Pending") in the admin.',
  },
  {
    slug:        'checkout-payment-gateway-config',
    title:       'Payment gateway configuration and testing',
    domain:      'checkout',
    complexity:  'S',
    applicability: (spec) => (spec?.checkout?.paymentGateways ?? []).length > 0,
    prompt:
      'Enable each payment gateway listed in `checkout.paymentGateways` via the ' +
      'Shopify Payments settings or third-party provider onboarding flow.  ' +
      'For each gateway, complete a test transaction using Shopify\'s bogus gateway ' +
      'or provider sandbox.  Document the gateway IDs in `docs/checkout.md`.',
  },
  {
    slug:        'checkout-order-confirmation-email',
    title:       'Branded order confirmation email',
    domain:      'checkout',
    complexity:  'S',
    applicability: (_spec) => true,
    prompt:
      'Customise the Shopify order confirmation email template ' +
      '(`notifications/orders/new`) with the brand logo, primary colour, and ' +
      'brand typography.  Localise the email for each active locale.  ' +
      'Send a test notification to verify rendering in Gmail, Outlook and ' +
      'Apple Mail.',
  },
];

// ─── Domain: theme ────────────────────────────────────────────────────────────

/** @type {Story[]} */
const THEME_STORIES = [
  {
    slug:        'theme-custom-sections',
    title:       'Build custom Liquid sections',
    domain:      'theme',
    complexity:  'M',
    applicability: (spec) => spec?.theme?.customSections === true,
    prompt:
      'Implement the custom sections defined in the project brief as Liquid ' +
      'section files under `sections/`.  Each section must have a full ' +
      '`{% schema %}` block with translatable presets and settings.  ' +
      'Register each section as an available block in `config/settings_schema.json` ' +
      'where appropriate.  Validate in the theme editor.',
  },
  {
    slug:        'theme-horizon-base-setup',
    title:       'Horizon theme initial setup and CLI push',
    domain:      'theme',
    complexity:  'S',
    applicability: (spec) =>
      (spec?.theme?.baseTheme ?? '').toLowerCase().includes('horizon'),
    prompt:
      'Pull the latest Horizon theme via `shopify theme pull`.  ' +
      'Verify the `config/settings_data.json` matches the project baseline.  ' +
      'Push the theme to the development store using `shopify theme push --development`.  ' +
      'Tag the initial commit `theme/horizon-base`.',
  },
  {
    slug:        'theme-performance-audit',
    title:       'Lighthouse performance audit and fixes',
    domain:      'theme',
    complexity:  'M',
    applicability: (_spec) => true,
    prompt:
      'Run a Lighthouse audit (mobile preset) against the homepage, PLP and PDP.  ' +
      'Target a performance score ≥ 80.  Address the top 3 LCP issues: ' +
      'add `fetchpriority="high"` to the hero image, defer non-critical JS, ' +
      'and enable Shopify image CDN with `image_url` filters.  ' +
      'Re-run the audit and attach results to the PR.',
  },
  {
    slug:        'theme-accessibility-audit',
    title:       'WCAG 2.1 AA accessibility pass',
    domain:      'theme',
    complexity:  'M',
    applicability: (_spec) => true,
    prompt:
      'Run axe-core against homepage, PLP and PDP using `npx axe-cli`.  ' +
      'Fix all critical and serious violations: missing alt text, insufficient ' +
      'colour contrast ratios (< 4.5:1 for body, < 3:1 for UI components), ' +
      'missing ARIA landmarks, and keyboard-inaccessible interactive elements.  ' +
      'Re-run axe and confirm 0 violations before merging.',
  },
  {
    slug:        'theme-back-in-stock',
    title:       'Back-in-stock notification opt-in',
    domain:      'theme',
    complexity:  'M',
    applicability: (_spec) => true,
    prompt:
      'When a product variant is sold out, render an email opt-in form in place ' +
      'of the Add-to-Cart button.  Submit the email to the Shopify Customer ' +
      'Email Marketing subscription list with a `back_in_stock` tag.  ' +
      'Trigger the built-in Shopify back-in-stock notification flow when ' +
      'inventory is restocked.',
  },
];

// ─── Domain: integrations ────────────────────────────────────────────────────

/** @type {Story[]} */
const INTEGRATIONS_STORIES = [
  {
    slug:        'integrations-erp-inventory-sync',
    title:       'ERP inventory sync via webhook',
    domain:      'integrations',
    complexity:  'XL',
    applicability: (spec) => Boolean(spec?.integrations?.erp),
    prompt:
      'Build a webhook receiver (Node.js / Remix route) that accepts inventory ' +
      'update payloads from the ERP system (`' + '${spec.integrations.erp}` ).  ' +
      'Verify the HMAC signature on every inbound request.  ' +
      'Translate the payload to a `inventorySetQuantities` Admin API mutation.  ' +
      'Implement idempotency with a deduplication key stored in a KV store.  ' +
      'Add Datadog (or equivalent) error alerting.',
  },
  {
    slug:        'integrations-crm-customer-sync',
    title:       'CRM customer sync on account creation',
    domain:      'integrations',
    complexity:  'L',
    applicability: (spec) => Boolean(spec?.integrations?.crm),
    prompt:
      'Subscribe to the `customers/create` Shopify webhook.  ' +
      'On each event, upsert the customer record in the CRM (`${spec.integrations.crm}`).  ' +
      'Map: email, first/last name, phone, tags.  ' +
      'Never log PII; scrub email from any error messages before emitting to logs.  ' +
      'Write an integration test using a fixture payload.',
  },
  {
    slug:        'integrations-loyalty-points',
    title:       'Loyalty programme widget and points display',
    domain:      'integrations',
    complexity:  'L',
    applicability: (spec) => Boolean(spec?.integrations?.loyalty),
    prompt:
      'Integrate the loyalty provider (`${spec.integrations.loyalty}`) SDK.  ' +
      'Display the customer\'s current points balance in the account page header.  ' +
      'Add a points-at-checkout widget to the cart page showing estimated points ' +
      'earned on the current order.  ' +
      'Gate all loyalty UI behind a `customer.logged_in` check.',
  },
  {
    slug:        'integrations-reviews-pdp',
    title:       'Product reviews widget on PDP',
    domain:      'integrations',
    complexity:  'S',
    applicability: (spec) => Boolean(spec?.integrations?.reviews),
    prompt:
      'Install and configure the reviews provider (`${spec.integrations.reviews}`).  ' +
      'Embed the review widget snippet in the product page below the product ' +
      'description.  Add a star-rating aggregate in the PDP hero and in collection ' +
      'product cards.  Verify review structured data (Schema.org `AggregateRating`) ' +
      'is emitted in the page `<head>`.',
  },
  {
    slug:        'integrations-search-provider',
    title:       'Third-party search provider integration',
    domain:      'integrations',
    complexity:  'L',
    applicability: (spec) => Boolean(spec?.integrations?.search),
    prompt:
      'Integrate the search provider (`${spec.integrations.search}`) to replace ' +
      'Shopify\'s default predictive search.  ' +
      'Index all published products with title, description, tags, vendor and ' +
      'metafields defined in the spec.  ' +
      'Wire up the search input in the Horizon header to the provider\'s ' +
      'autocomplete API.  ' +
      'Rebuild the /search results page using the provider\'s full-text search API.',
  },
  {
    slug:        'integrations-analytics-ga4',
    title:       'GA4 + enhanced ecommerce via Shopify Web Pixels',
    domain:      'integrations',
    complexity:  'M',
    applicability: (spec) =>
      Boolean(spec?.integrations?.analytics) ||
      (spec?.checkout?.paymentGateways ?? []).length > 0,
    prompt:
      'Create a Shopify Web Pixel extension for GA4 analytics.  ' +
      'Track the standard ecommerce event set: `view_item`, `add_to_cart`, ' +
      '`begin_checkout`, `purchase`.  ' +
      'Pass the GA4 Measurement ID from an app setting (never hardcoded).  ' +
      'Gate the pixel behind customer privacy consent.  ' +
      'Verify events appear in GA4 DebugView.',
  },
];

// ─── Master registry ──────────────────────────────────────────────────────────

/**
 * The full flat list of all known stories across all domains.
 * @type {Story[]}
 */
export const ALL_STORIES = [
  ...STORE_IDENTITY_STORIES,
  ...MARKETS_STORIES,
  ...CATALOGUE_STORIES,
  ...PROMOTIONS_STORIES,
  ...CHECKOUT_STORIES,
  ...THEME_STORIES,
  ...INTEGRATIONS_STORIES,
];

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Filter the story registry to only the stories that apply to `spec`.
 *
 * Stories are returned in registry order (domain grouping preserved), which
 * gives a natural priority ordering when converted to a sprint backlog.
 *
 * @param {import('./parseSpec.js').StoreSpec} spec  Validated store spec
 * @returns {Story[]}  Applicable stories, in registry order
 */
export function selectStories(spec) {
  return ALL_STORIES.filter((story) => {
    try {
      return story.applicability(spec);
    } catch {
      // Guard threw — story is not applicable rather than crashing the pipeline
      return false;
    }
  });
}
