<!-- GENERATED FILE — do not edit. Source: discovery/schema/question-bank.json + discovery/schema/offering.json + discovery/schema/apps.json. Re-render: npm run questionnaire:render -->

# Consultant guide — Shopify knowledge per question

> **Version:** question bank 1.2.0 · offering 1.3.0 · app registry checked 2026-09-17
>
> **Consultant only.** Shopify plan requirements, docs links and app candidates behind each discovery question.
> Use them to steer the conversation to what Shopify does natively; do not hand this guide to the client.
> 119 of 296 questions carry Shopify knowledge; facts are checked against Shopify documentation at each Edition.
>
> Apps marked ✓ are approved by a lead consultant after engagement work; all others are proposed candidates.

---

## Shopify plan benchmark (exit rule 11.1)

The offers do not assume Shopify Plus. The minimum plan is the highest plan any of these requirements needs; recommend the plan that best fits the client's market on top of it.

| Requirement | Minimum plan | Answers read | Docs |
|---|---|---|---|
| company-specific B2B catalogs | Shopify Plus | `/b2b/company_specific_catalogs`, `/b2b/price_lists` | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| more than 3 active B2B catalogs | Shopify Plus | `/b2b/catalog_count` | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| B2B deposits, partial payments or payment requests per fulfilment | Shopify Plus | `/b2b/payment_terms` | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| contextual B2B storefront and checkout | Advanced | `/b2b/contextual_experience` | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| checkout UI extensions on the information, shipping or payment steps / Checkout Branding API | Shopify Plus | `/checkout/customisation` | https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility |
| expansion stores | Shopify Plus | `/markets/strategy` | https://help.shopify.com/en/manual/organization-settings/expansion-stores |
| selling from several legal entities | Shopify Plus | `/meta/client/legal_entities` | https://help.shopify.com/en/manual/payments/shopify-payments/onboarding/selling-with-multiple-entities |
| combined listings | Shopify Plus | `/catalogue/combined_listings` | https://help.shopify.com/en/manual/products/combined-listings-app |
| sign-in from another site (Multipass) | Shopify Plus | `/customers/sign_in_methods` | https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api |
| more than 10 locations | Shopify Plus | `/shipping/fulfilment_locations` | https://help.shopify.com/en/manual/fulfillment/setup/locations/setup |
| more than 20 published languages | Shopify Plus | `/markets/list` | https://help.shopify.com/en/manual/international/languages |
| several product discounts on the same item | Shopify Plus | `/promotions/stacking` | https://help.shopify.com/en/manual/discounts/discount-combinations |
| theme, checkout or account customisation per market | Advanced | `/markets/per_market_customisation` | https://help.shopify.com/en/manual/online-store/themes/customizing-themes-for-markets |
| carrier-calculated shipping rates | Advanced | `/shipping/rates` | https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/third-party-carrier-calculated-shipping |
| multi-currency payouts | Advanced | `/payments/multi_currency_settlement` | https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/payouts-in-multiple-currencies |
| more than 15 staff accounts | Shopify Plus | `/shopify/staff_users` | https://help.shopify.com/en/manual/your-account/users/users-plan-requirements |
| more than 5 staff accounts | Advanced | `/shopify/staff_users` | https://help.shopify.com/en/manual/your-account/users/users-plan-requirements |
| staff accounts | Grow | `/shopify/staff_users` | https://help.shopify.com/en/manual/your-account/users/users-plan-requirements |
| A/B testing with Rollouts | Grow | `/design/ab_testing` | https://help.shopify.com/en/manual/markets/rollouts |

---

## § 0 — Business outcomes

### 0.1 The core problem

**Q0.1.1** — What is the single biggest thing preventing your ecommerce from growing right now? *(required · client)*

**Q0.1.2** — How long has this been a problem, and what have you already tried to fix it? *(recommended · client)*

**Q0.1.3** — If we solved only one thing in this engagement, what would have the highest business impact? *(recommended · client)*

### 0.2 Revenue & conversion

**Q0.2.1** — What is your current monthly ecommerce revenue (range and currency)? *(required · client)*

**Q0.2.2** — What is your current conversion rate (%)? *(required · client)*

**Q0.2.3** — Which product categories, markets or customer segments under-perform? *(optional · client)*

**Q0.2.4** — Is the main bottleneck acquisition (traffic), conversion (traffic doesn't buy) or retention (customers don't return)? *(required · client)*

**Q0.2.5** — What share of revenue comes from each channel today (online store, retail stores, marketplaces, social commerce, wholesale / B2B, other)? *(recommended · client)*

**Q0.2.6** — How many orders per month do you expect in the first year? *(required · client)*

### 0.3 Operational pain

**Q0.3.1** — What manual work does your team do today that the platform should automate, and which processes break most often? *(required · client)*

**Q0.3.2** — How many hours per week does the team spend on workarounds? *(optional · client)*

### 0.4 Growth goals & KPIs

**Q0.4.1** — What does success look like in 12 months (revenue, new markets, channels, customer volume)? *(required · client)*

**Q0.4.2** — Which KPIs will measure success? For each: metric, today's baseline, target, horizon in months. *(required · client)*

### 0.5 Platform context

**Q0.5.1** — What triggered this engagement — why Shopify, and why now? *(required · client)*

**Q0.5.2** — If you are moving from another platform, what must not be lost in the transition? *(recommended · client)*

**Q0.5.3** — What are you most unhappy with in the current store or set-up? *(recommended · client)*

**Q0.5.4** — Which platform are you migrating from (or none — greenfield)? *(required · client)*
Feeds: gate Migration

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Store Migration app | Basic |  | https://apps.shopify.com/store-migration |

If native is not enough: [Store data importer](https://apps.shopify.com/categories/sales-channels-selling-online-store-data-importer/all) — [Shopify Store Migration](https://apps.shopify.com/store-migration), [Matrixify](https://apps.shopify.com/excel-export-import)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 0.6 Budget

**Q0.6.1** — What is the approximate budget envelope for this project (range and currency)? *(required · client)*

**Q0.6.2** — Is the priority to minimise upfront cost (apps and configuration), to own the solution (custom build), or a balance? *(required · client)*

**Q0.6.3** — Is there a monthly ceiling for app subscriptions? *(optional · client)*

---

## § 1 — Company, brand & Shopify

### 1.1 Company identity

**Q1.1.1** — Trading name and legal entity name (if different). *(required · client)*

**Q1.1.2** — Country of incorporation / headquarters. *(required · client)*

**Q1.1.3** — Industry and product vertical. *(required · client)*
Feeds: rule 11.8 (STOP)

**Q1.1.4** — Is the business direct-to-consumer, B2B, or hybrid? *(required · client)*
Feeds: gate B2B / Wholesale

**Q1.1.5** — Current website URL. *(optional · client)*

**Q1.1.6** — Do you sell through more than one legal entity (e.g. one per country or region)? List them. *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Selling from multiple business entities | Shopify Plus | Needs Shopify Payments and the new Markets; otherwise expansion stores | https://help.shopify.com/en/manual/payments/shopify-payments/onboarding/selling-with-multiple-entities |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q1.1.7** — Where will you sell at launch? *(required · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Sales channels (Online Store, POS, Shop, Marketplace Connect, Facebook & Instagram, Google & YouTube, TikTok) | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/marketplace-connect |
| Headless channel (Hydrogen / Storefront API) | Basic |  | https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 1.2 Shopify account

**Q1.2.1** — Is there an existing Shopify store? *(required · client)*

**Q1.2.2** — Existing store URL, current Shopify plan and current theme. *(recommended · client)*

**Q1.2.3** — Which Shopify plan will the new store run on (if already decided)? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Plan features | Basic | The minimum plan is derived from the requirements (exit rule 11.1) | https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q1.2.4** — Which apps are installed today, what do they do, and which must stay? *(recommended · client)*

**Q1.2.5** — Existing store audit: which retired or deprecated Shopify features does it still use? *(required · consultant)*
Feeds: rule 11.18 (FLAG)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Functions (replaces Shopify Scripts) | Basic | Scripts stopped running 2026-06-30 | https://shopify.dev/docs/apps/build/functions/migrating-from-shopify-scripts |
| Customer accounts (legacy accounts deprecated 2026-02-26) | Basic |  | https://shopify.dev/changelog/legacy-customer-accounts-are-deprecated |
| Inventory purchase orders and transfers (Stocky retired 2026-08-31) | Basic |  | https://help.shopify.com/en/manual/products/inventory/transitioning-from-stocky |
Build with: Shopify Functions · Theme app extensions (replace script tags)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q1.2.6** — How many people need their own Shopify admin login after go-live? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Staff accounts | Grow | Basic 0, Grow 5, Advanced 15, Plus unlimited; collaborators and POS-only staff not counted | https://help.shopify.com/en/manual/your-account/users/users-plan-requirements |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 1.3 Brand & positioning

**Q1.3.1** — How would you describe the brand's positioning: value, mid-market, premium, luxury or enterprise? *(required · client)*
Feeds: L trigger Luxury / enterprise brand

**Q1.3.2** — Is the brand identity finalised (logo, colour palette, typography)? *(recommended · client)*

**Q1.3.3** — In which formats are brand assets available (SVG, PNG, Figma, guidelines PDF)? *(optional · client)*

**Q1.3.4** — Are there strict brand guidelines that must be followed? *(recommended · client)*

**Q1.3.5** — What differentiates the brand — price, quality, exclusivity, community, sustainability? *(optional · client)*

### 1.4 Competitive context

**Q1.4.1** — Who are your top three online competitors? *(optional · client)*

**Q1.4.2** — Which stores (competitor or not) have a UX you want to reference? *(optional · client)*

---

## § 2 — Catalogue & products

### 2.1 Catalogue size & variants

**Q2.1.1** — How many active SKUs are in the catalogue (approximate)? *(required · client)*
Feeds: gate SKU complexity

**Q2.1.2** — What is the maximum number of variant options on a product (e.g. size, colour, material = 3)? *(required · client)*
Feeds: rule 11.5 (FLAG) · gate SKU complexity

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Product variants (3 options) | Basic |  | https://help.shopify.com/en/manual/products/variants/add-variants |
| Combined listings | Shopify Plus | Up to 60 child products | https://help.shopify.com/en/manual/products/combined-listings-app |

If native is not enough: [Custom products](https://apps.shopify.com/categories/selling-products-custom-products) — [Infinite Options](https://apps.shopify.com/custom-options), [Globo Product Options, Variant](https://apps.shopify.com/product-options-pro), [Easify Custom Product Options](https://apps.shopify.com/easify-product-options)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.1.3** — What is the maximum number of variants on a single product? *(required · client)*
Feeds: rule 11.5 (FLAG)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Up to 2,048 variants per product | Basic | Apps must use the current GraphQL product APIs above 100 variants | https://shopify.dev/changelog/the-product-variant-limit-is-now-2048-for-all-merchants |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.1.4** — Are variants such as colours managed as separate products (own SKUs, images, URLs) that should appear as one product on the storefront? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Combined listings | Shopify Plus |  | https://help.shopify.com/en/manual/products/combined-listings-app |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 2.2 Product types

**Q2.2.1** — Which product types exist in the catalogue? *(required · client)*
Feeds: gate SKU complexity · app signal Bundles beyond Shopify Bundles · app signal Pre-orders

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Bundles (fixed bundles, multipacks) | Basic |  | https://help.shopify.com/en/manual/products/bundles/shopify-bundles |
| Shopify Subscriptions | Basic |  | https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions |
| Gift cards | Basic |  | https://help.shopify.com/en/manual/products/gift-card-products/overview |

If native is not enough: [Product bundles](https://apps.shopify.com/categories/marketing-and-conversion-upsell-and-bundles-product-bundles/all) — [FBP | Fast Bundle & Upsell App](https://apps.shopify.com/fast-bundle-product-bundles), [Bundler » Product Bundles App](https://apps.shopify.com/bundler-product-bundles)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.2.2** — Will subscriptions run on Shopify Subscriptions (Shopify's app) or a third-party subscription app? Name the app if known. *(recommended · client)*
Feeds: app signal Subscriptions beyond Shopify Subscriptions
Quick interview: ask if Q2.2.1 includes Subscription

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Subscriptions | Basic | Not with bundles, B2B or draft orders; limited gateways | https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions/considerations |

If native is not enough: [Subscriptions](https://apps.shopify.com/categories/selling-products-payments-subscriptions) — [Recharge Subscriptions App](https://apps.shopify.com/subscription-payments), [Skio, a Recharge Company](https://apps.shopify.com/skio), [Loop Subscriptions App](https://apps.shopify.com/loop-subscriptions), [Appstle℠ Subscriptions App](https://apps.shopify.com/subscriptions-by-appstle)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.2.3** — If you sell bundles: what must they do? *(recommended · client)*
Feeds: app signal Bundles beyond Shopify Bundles
Quick interview: ask if Q2.2.1 includes Fixed bundle, Multipack, Mix and match bundle or Bundle

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Bundles | Basic | Up to 30 components; not with subscriptions or pre-orders | https://help.shopify.com/en/manual/products/bundles/eligibility-and-considerations |

If native is not enough: [Product bundles](https://apps.shopify.com/categories/marketing-and-conversion-upsell-and-bundles-product-bundles/all) — [FBP | Fast Bundle & Upsell App](https://apps.shopify.com/fast-bundle-product-bundles), [Bundler » Product Bundles App](https://apps.shopify.com/bundler-product-bundles)
Build with: Cart Transform Function
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.2.4** — Which subscription features are needed? *(recommended · client)*
Feeds: app signal Subscriptions beyond Shopify Subscriptions
Quick interview: ask if Q2.2.1 includes Subscription

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Subscriptions | Basic |  | https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions |

If native is not enough: [Subscriptions](https://apps.shopify.com/categories/selling-products-payments-subscriptions) — [Recharge Subscriptions App](https://apps.shopify.com/subscription-payments), [Skio, a Recharge Company](https://apps.shopify.com/skio), [Loop Subscriptions App](https://apps.shopify.com/loop-subscriptions), [Appstle℠ Subscriptions App](https://apps.shopify.com/subscriptions-by-appstle)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.2.5** — For pre-orders, when is the customer charged? *(recommended · client)*
Feeds: app signal Pre-orders
Quick interview: ask if Q2.2.1 includes Pre order

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Pre-orders via selling plans (app required) | Basic | Shopify Payments or PayPal Express only | https://help.shopify.com/en/manual/products/purchase-options/pre-orders |

If native is not enough: [Pre-orders](https://apps.shopify.com/categories/selling-products-purchase-options-pre-orders) — [Preorder, Back In Stock ‑ STOQ](https://apps.shopify.com/back-in-stock-restock-alerts), [Preorder Now Presale Timesact](https://apps.shopify.com/timesact-discount-pre-order)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.2.6** — Do customers personalise products with choices that are not stock variants (engraving, file upload, paid add-ons, configurators)? *(recommended · client)*
Feeds: app signal Product options and personalisation
Quick interview: ask if Q2.1.2 is 3 or more, or Q2.2.1 includes Made to order

If native is not enough: [Custom products](https://apps.shopify.com/categories/selling-products-custom-products) — [Infinite Options](https://apps.shopify.com/custom-options), [Globo Product Options, Variant](https://apps.shopify.com/product-options-pro), [Easify Custom Product Options](https://apps.shopify.com/easify-product-options)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 2.3 Catalogue data

**Q2.3.1** — Roughly how many collections? *(optional · client)*

**Q2.3.2** — Are collections manual, rule-based (automated), or mixed? *(optional · client)*

**Q2.3.3** — Which product attributes go beyond Shopify's standard fields (technical specs, certifications, fit guides, ingredients)? *(required · client)*
Feeds: gate SKU complexity

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Metafields and metaobjects | Basic | Metaobject definitions: 128 below Plus, 256 on Plus | https://shopify.dev/docs/apps/build/metaobjects/metaobject-limits |
| Standard Product Taxonomy (category metafields) | Basic |  | https://help.shopify.com/en/manual/products/details/product-category |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.3.4** — Where is catalogue data maintained today? *(recommended · client)*

**Q2.3.5** — Which attributes should shoppers filter by on collection and search pages? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Search & Discovery filters | Basic | Up to 25 filters; no filters on collections over 5,000 products | https://help.shopify.com/en/manual/online-store/search-and-discovery/filters |

If native is not enough: App Store — [Algolia AI Search & Discovery](https://apps.shopify.com/algolia-search), [Boost AI Search & Filter](https://apps.shopify.com/product-filter-search), [Searchanise Search & Filter](https://apps.shopify.com/searchanise), [Klevu ‑ AI Search & Discovery](https://apps.shopify.com/klevu-smart-search)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 2.4 Pricing

**Q2.4.1** — Are there special prices for consumer groups (VIP or member prices)? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B catalogs | Basic | Up to 3 active catalogs below Plus | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| Company-specific catalogs | Shopify Plus |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.4.2** — Are there volume offers for shoppers (e.g. 3 for 2, tiered discounts)? *(recommended · client)*

**Q2.4.3** — Do prices differ by market (not just currency conversion)? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Market-specific pricing | Basic |  | https://help.shopify.com/en/manual/markets/pricing |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 2.5 Inventory

**Q2.5.1** — Where is the inventory source of truth — Shopify, ERP, WMS, other? *(recommended · client)*

**Q2.5.2** — Are low-stock alerts needed? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Flow | Basic |  | https://help.shopify.com/en/manual/shopify-flow |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.5.3** — What should happen when a product is out of stock? *(optional · client)*
Feeds: app signal Back-in-stock alerts · app signal Pre-orders
Quick interview: ask if Q2.2.1 includes Pre order, or Q2.1.1 is 500 or more

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Continue selling when out of stock | Basic |  | https://help.shopify.com/en/manual/products/inventory/setup/selling-when-out-of-stock |

If native is not enough: [Stock alerts](https://apps.shopify.com/categories/store-design-store-alerts-back-in-stock-alert) — [Amp Back in Stock & Preorder +](https://apps.shopify.com/back-in-stock), [Notify Me! Back in Stock Alert](https://apps.shopify.com/preorder-back-in-stock), [Appikon ‑ Back In Stock](https://apps.shopify.com/customer-back-in-stock-alert-user-notification-app)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.5.4** — Which inventory tasks will your team do in Shopify? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Purchase orders and inventory transfers | Basic |  | https://help.shopify.com/en/manual/products/inventory/purchase-orders |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

---

## § 3 — Markets & internationalisation

### 3.1 Markets at launch

**Q3.1.1** — Which markets (countries) go live at launch? For each: country code, checkout currency, languages, domain, and how prices are set (the store's base currency, auto-converted, a manual price list, or display only). *(required · client)*
Feeds: gate Markets · gate Multi-currency · rule 11.3 (STOP) · rule 11.4 (STOP) · rule 11.1 (STOP) · app signal Translation beyond Translate & Adapt · rule 11.20 (FLAG) · rule 11.21 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Markets (no limit on country markets) | Basic |  | https://help.shopify.com/en/manual/markets/getting-started/market-types |
| Published languages | Basic | 20 languages below Plus, 30 on Plus | https://help.shopify.com/en/manual/international/languages |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.1.2** — Which are the primary markets (one or more country or market codes)? *(required · client)*

**Q3.1.3** — Which countries are planned in the next 12 months? *(optional · client)*

**Q3.1.4** — Operating model: one store with Shopify Markets, expansion stores, or hybrid? *(required · consultant)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Expansion stores | Shopify Plus | Up to 9 expansion stores | https://help.shopify.com/en/manual/organization-settings/expansion-stores |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.1.5** — How should visitors reach their local market? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Automatic redirection | Basic | The Geolocation app is retired | https://help.shopify.com/en/manual/international/automatic-redirection |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.1.6** — Who is merchant of record for international orders? *(required · consultant)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Managed Markets (Shopify as merchant of record) | Basic | US and certain CA/UK stores; Shopify Payments; no B2B; subscriptions domestic only | https://help.shopify.com/en/manual/international/managed-markets/requirements-and-considerations |
| Shopify Tax | Basic |  | https://help.shopify.com/en/manual/taxes/shopify-tax |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.1.7** — Should any market have its own theme content, section order, checkout or customer-account settings? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Theme customisation per market | Advanced |  | https://help.shopify.com/en/manual/online-store/themes/customizing-themes-for-markets |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.1.8** — Are some products not allowed to be sold in certain markets (regulation, registration, licensing or distribution agreements)? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Market catalogs: include or exclude products per market | Basic |  | https://help.shopify.com/en/manual/markets/customizations/catalogs |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 3.2 Language

**Q3.2.1** — How will translation be handled? *(recommended · client)*
Feeds: app signal Translation beyond Translate & Adapt
Quick interview: ask if Q3.1.1 has 3+ languages

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Translate & Adapt | Basic | Auto-translates at most 2 languages; not policies | https://help.shopify.com/en/manual/international/translate-adapt-app |

If native is not enough: [Internationalization](https://apps.shopify.com/categories/store-design-internationalization) — [Weglot: AI Translation & SEO](https://apps.shopify.com/weglot), [langify](https://apps.shopify.com/langify), [Transcy](https://apps.shopify.com/transcy-multiple-languages)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.2.2** — Does any language need right-to-left layout? *(optional · client)*

**Q3.2.3** — Is SEO per language a priority? *(optional · client)*

**Q3.2.4** — What must be translated? *(recommended · client)*
Feeds: app signal Translation beyond Translate & Adapt
Quick interview: ask if Q3.1.1 has 3+ languages

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Translate & Adapt | Basic |  | https://help.shopify.com/en/manual/international/translate-adapt-app |

If native is not enough: [Internationalization](https://apps.shopify.com/categories/store-design-internationalization) — [Weglot: AI Translation & SEO](https://apps.shopify.com/weglot), [langify](https://apps.shopify.com/langify), [Transcy](https://apps.shopify.com/transcy-multiple-languages)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 3.4 Tax & duties

**Q3.4.1** — Should duties and import taxes be collected at checkout (DDP)? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Duties and import taxes at checkout (DDP or DAP per country) | Basic | Plan not stated by Shopify; fee per order; not with tax overrides, manual rates or exemptions | https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations |

If native is not enough: App Store — [Zonos Duty and Tax](https://apps.shopify.com/duty-and-tax-calculator-iglobal-stores), [ESW International](https://apps.shopify.com/esw-international)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.2** — In which countries are you VAT-registered? *(recommended · client)*

**Q3.4.3** — Do you sell into the US with state sales tax obligations? *(optional · client)*

**Q3.4.4** — Do products have HS codes and country of origin, and where do they come from? *(recommended · client)*

**Q3.4.5** — Should prices include tax (VAT) in some markets and exclude it in others? *(required · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Dynamic tax-inclusive pricing | Basic |  | https://help.shopify.com/en/manual/international/pricing/dynamic-tax-inclusive-pricing |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.6** — Which tax service? *(recommended · consultant)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Tax | Basic | Basic Tax closed to new EU, UK and Canada stores since 2026-05-13 | https://help.shopify.com/en/manual/taxes/shopify-tax/choose-tax-service |

If native is not enough: App Store — [Tax: TaxJar Sales Tax Automation](https://apps.shopify.com/taxjar)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.7** — Do business customers buy tax-exempt (VAT number validation, reverse charge)? *(optional · client)*

**Q3.4.8** — In which countries should duties and import taxes be collected at checkout (DDP)? In the others the customer pays on delivery (DAP). *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| DDP or DAP per country or region | Basic | Not available for some destinations (e.g. Northern Ireland) or the Rest of world zone | https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.9** — When you ship low-value parcels into these territories from outside them, are you registered to collect the import VAT or GST at checkout? *(recommended · client)*
Quick interview: ask if Q3.1.1 has 2+ markets

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Low-value goods taxes (EU, UK, Switzerland, Norway, Australia, New Zealand) | Basic | Registration needed; Shopify recommends DDP so orders above the threshold get duties calculated | https://help.shopify.com/en/manual/international/duties-and-import-taxes |
| EU IOSS: collect VAT at checkout on low-value orders | Basic |  | https://help.shopify.com/en/manual/taxes/eu/eu-tax-reference |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.10** — Do some products have reduced or zero tax rates, or tax exemptions, in any market (e.g. medicines, books, food, children's clothing)? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Product categories for reduced rates and exemptions (Shopify Tax: US, EU, UK) | Basic |  | https://help.shopify.com/en/manual/taxes/shopify-tax/product-categories-tax |
| Product tax overrides per country or state (manual collections) | Basic | Ignored where duties are collected at checkout | https://help.shopify.com/en/manual/taxes/tax-overrides |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.11** — Who issues invoices to customers? *(recommended · client)*
Feeds: app signal Invoicing and e-invoicing
Quick interview: ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include GB / DE / FR / IT / PL / BE / ES / EU / AT / NL / PT / IE / SE / DK / FI

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| VAT invoices for EU and UK orders | Basic | Shopify Tax; not emailed; not for orders with duties; Portugal not supported | https://help.shopify.com/en/manual/taxes/shopify-tax/vat-invoices |
| Shopify Order Printer (invoices, packing slips) | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/printing-orders/shopify-order-printer |

If native is not enough: App Store — [Sufio: Professional Invoices](https://apps.shopify.com/sufio), [Order Printer Pro: Invoice App](https://apps.shopify.com/order-printer-pro)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.12** — Which electronic invoicing (e-invoicing) obligations apply to your sales? *(recommended · client)*
Feeds: app signal Invoicing and e-invoicing
Quick interview: ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include DE / FR / IT / PL / BE / ES / EU

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| VAT invoices for EU and UK orders (not e-invoicing) | Basic |  | https://help.shopify.com/en/manual/taxes/shopify-tax/vat-invoices |

If native is not enough: App Store — [Sufio: Professional Invoices](https://apps.shopify.com/sufio), [Order Printer Pro: Invoice App](https://apps.shopify.com/order-printer-pro), [POP: compliant EU invoicing](https://apps.shopify.com/pop-european-invoicing)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 3.5 Mainland China

**Q3.5.1** — Do you want to sell to mainland China cross-border (from outside China) or onshore, behind the Great Firewall? *(required · client)*
Asked only if the launch markets include mainland China (CN)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify in China: Shopify's servers are not located in mainland China | Basic |  | https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.5.2** — Which channels for mainland China? *(required · client)*
Asked only if the launch markets include mainland China (CN)

If native is not enough: App Store — [WalktheChat WeChat Connector](https://apps.shopify.com/walkthechat-wechat-connector), [WalktheChat Marketplace](https://apps.shopify.com/walkthechat-marketplace)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.5.3** — Do you have a legal entity in mainland China? *(required · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.4** — Do you have a Hong Kong or other overseas entity that can sell cross-border, and are your trademarks registered in China? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.5** — ICP status for a China website? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.6** — What is Shopify's role for mainland China? *(optional · consultant)*
Asked only if the launch markets include mainland China (CN)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify in China: Shopify's servers are not located in mainland China | Basic |  | https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.5.7** — How will goods enter China: bonded warehouse (1210), direct mail (9610), general trade, or personal parcels? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.8** — Are your products on China's cross-border e-commerce positive list? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.9** — How are your products classified in China? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.10** — Registration or filing status with China's medical products administration (NMPA)? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.11** — Do product claims need a review for China (medical, cosmeceutical or treatment claims)? *(optional · consultant)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.12** — How will mainland customers pay? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| WeChat Pay via Shopify Payments | Basic | Hong Kong SAR Shopify Payments account; early access; customers pay in CNY; no chargebacks | https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/wechat-pay |
| Alipay via Shopify Payments | Basic | Hong Kong SAR Shopify Payments account; early access | https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/alipay |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.5.13** — How many mainland China customers do you expect per year? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.14** — Do you have a representative in China for personal information protection (PIPL)? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.15** — Where will China customer data (CRM, email, analytics) be stored? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.16** — Must scripts blocked in China (Google Fonts, Google Analytics, reCAPTCHA, Meta pixels, YouTube) be replaced? *(optional · consultant)*
Asked only if the launch markets include mainland China (CN)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify notes that firewalls in China frequently block Google Fonts | Basic |  | https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/online-store-setup |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.5.17** — Which marketing channels for China? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.18** — Who provides Chinese-language customer service? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.19** — Do you work with a local partner or trade partner for China? Name it. *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.20** — Target launch date for mainland China. *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Q3.5.21** — Who provides PRC legal, tax and customs advice? *(required · client)*
Asked only if the launch markets include mainland China (CN)

---

## § 4 — Payments & checkout

### 4.1 Payments

**Q4.1.1** — Which payment providers will you use (Shopify Payments, Adyen, Stripe, PayPal…)? *(required · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Payments | Basic | Available in 40 countries | https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.1.2** — Which local payment methods are required? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Local payment methods via Shopify Payments | Basic |  | https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.1.3** — Which buy-now-pay-later options, if any? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shop Pay Installments | Basic | US, Canada and UK stores | https://help.shopify.com/en/manual/payments/shop-pay-installments/eligibility |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.1.4** — Do you need payouts in more than one currency? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Multi-currency payouts | Advanced |  | https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/payouts-in-multiple-currencies |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.1.5** — Will card data be handled only by Shopify-hosted checkout, by a third-party hosted payment page, or by custom card UI / tokenisation? *(required · consultant)*
Feeds: rule 11.9 (STOP)

**Q4.1.6** — Which express checkouts are required? *(recommended · client)*

**Q4.1.7** — Must payment methods be hidden, renamed or reordered by market, customer type or cart? *(recommended · client)*
Build with: Payment Customization Function (public apps: all plans; custom apps: Plus)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 4.2 Checkout

**Q4.2.1** — Which checkout changes are needed? *(required · client)*
Feeds: rule 11.1 (STOP) · rule 11.6 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Checkout and accounts editor; Thank you / Order status page extensions | Basic |  | https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility |
| Checkout UI extensions on information, shipping and payment steps; Checkout Branding API | Shopify Plus |  | https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility |

If native is not enough: [Checkout](https://apps.shopify.com/categories/marketing-and-conversion-checkout) — [Shopify Checkout Blocks](https://apps.shopify.com/checkout-blocks)
Build with: Checkout UI extensions · Shopify Functions (public apps: all plans; custom apps: Plus)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.2.2** — Which checkout extensions are needed? *(optional · consultant)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Checkout UI extensions | Basic | Step extensions: Plus | https://shopify.dev/docs/api/checkout-ui-extensions |

If native is not enough: [Checkout](https://apps.shopify.com/categories/marketing-and-conversion-checkout) — [Shopify Checkout Blocks](https://apps.shopify.com/checkout-blocks)
Build with: Delivery Customization Function · Payment Customization Function · Cart and Checkout Validation Function · Pickup Point Delivery Option Generator
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.2.3** — Which custom checkout fields are needed (company, VAT number, PO number, delivery instructions)? *(optional · client)*

**Q4.2.4** — Are post-purchase upsells needed? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Thank you page upsell extensions | Basic | Post-purchase page: beta | https://shopify.dev/docs/apps/build/checkout/product-offers/build-a-post-purchase-offer |

If native is not enough: App Store — [Upsell.com ‑ ReConvert Upsell](https://apps.shopify.com/reconvert-upsell-cross-sell), [Aftersell Post Purchase Upsell](https://apps.shopify.com/aftersell)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.2.6** — Is store credit needed? *(optional · client)*

### 4.3 Fraud & risk

**Q4.3.1** — Is manual fraud review needed for high-value orders? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Fraud analysis; Shopify Fraud Control | Basic |  | https://help.shopify.com/en/manual/payments/fraud-prevention/fraud-control-app |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.3.2** — Which order restrictions are needed? *(optional · client)*

If native is not enough: [Checkout](https://apps.shopify.com/categories/marketing-and-conversion-checkout) — [Shopify Checkout Blocks](https://apps.shopify.com/checkout-blocks)
Build with: Cart and Checkout Validation Function
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.3.3** — Do you want a guarantee that fraud chargebacks are reimbursed? *(optional · client)*
Feeds: app signal Chargeback guarantee
Quick interview: ask if Q1.3.1 is Premium, Luxury or Enterprise

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Protect | Basic | US merchants, Shop Pay orders | https://help.shopify.com/en/manual/payments/shop-pay/shopify-protect/protect-order-with-shopify-protect |

If native is not enough: [Fraud](https://apps.shopify.com/categories/store-management-security-fraud/all) — [Signifyd](https://apps.shopify.com/signifyd), [Riskified](https://apps.shopify.com/riskified), [Wyllo (formerly NoFraud listing)](https://apps.shopify.com/nofraud-chargeback-prevention-and-protection)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

---

## § 5 — Shipping & fulfilment

### 5.1 Fulfilment model

**Q5.1.1** — Do you fulfil in-house, through a 3PL, or both? *(required · client)*

**Q5.1.2** — Which 3PL provider? *(recommended · client)*

**Q5.1.3** — How many locations will fulfil online orders (warehouses, 3PL locations and stores that ship orders)? *(required · client)*
Feeds: rule 11.1 (STOP) · rule 11.13 (FLAG)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Locations | Basic | 10 locations below Plus, 200 on Plus; app locations not counted | https://help.shopify.com/en/manual/fulfillment/setup/locations/setup |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.4** — How should Shopify pick the fulfilling location? *(required · client)*
Feeds: rule 11.13 (FLAG)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Order routing rules | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/order-routing/understanding-order-routing |
Build with: Order Routing Location Rule Function
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.5** — Which carriers do you use? *(recommended · client)*

**Q5.1.6** — How are shipping rates calculated? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shipping rates (flat, weight, price conditions) | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/setting-up-shipping-rates |
| Third-party carrier-calculated shipping | Advanced | Add-on on Grow | https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/third-party-carrier-calculated-shipping |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.7** — Are there product-specific shipping rules (heavy, hazardous, temperature-controlled)? *(optional · client)*

**Q5.1.9** — Which countries do you not ship to? *(optional · client)*

**Q5.1.10** — Free-shipping thresholds per market (market, threshold, currency, which rates). *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Free-shipping rate condition or automatic free-shipping discount | Basic |  | https://help.shopify.com/en/manual/discounts/discount-types/free-shipping |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.11** — Which delivery methods do you offer? *(required · client)*
Feeds: app signal Delivery slots and pickup points

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Local delivery | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/local-delivery |
| Pickup in store | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/pickup-in-store |
| Pickup points (native carriers in France, Italy, Spain, UK) | Basic | Elsewhere: custom app with the pickup point Function on Plus; not for B2B or express wallets | https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/pickup-points |

If native is not enough: [Delivery and pickup](https://apps.shopify.com/categories/orders-and-shipping-shipping-solutions-delivery-and-pickup/all) — [Zapiet ‑ Pickup + Delivery](https://apps.shopify.com/click-and-collect)
Build with: Pickup Point Delivery Option Generator
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.12** — How are shipping labels created? *(optional · client)*

**Q5.1.13** — Do all products have accurate weights (and package sizes), and where does that data come from? *(recommended · client)*
Quick interview: ask if Q5.1.6 includes Weight or price based, Live carrier rates or Rates from an app

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Product weights and saved packages | Basic | Labels need accurate weights and a default package | https://help.shopify.com/en/manual/fulfillment/setup/packaging/packages-and-weights |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.14** — Do any products count as dangerous goods for shipping? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shipping dangerous goods (merchant responsibility; restricted with Shopify Shipping labels) | Basic | USPS and FedEx labels bought in Shopify don't support hazardous materials | https://help.shopify.com/en/manual/compliance/legal/shipping-dangerous-goods |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 5.2 Returns & exchanges

**Q5.2.1** — Summarise the returns policy (window, conditions, who pays return postage). *(recommended · client)*

**Q5.2.2** — Shopify includes return requests in customer accounts, controlled by return rules (window, return fee, restocking fee, final sale). Is that enough? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Self-serve returns and return rules | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns |

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [AfterShip Returns & Exchanges](https://apps.shopify.com/returns-center-by-aftership), [Narvar Return and Exchange](https://apps.shopify.com/narvar-returns), [Redo](https://apps.shopify.com/redo)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.3** — Do you process exchanges (not only refunds)? *(optional · client)*

**Q5.2.4** — Which returns, tracking or post-purchase apps do you use or prefer? *(optional · client)*
Feeds: app signal Returns platform · app signal Post-purchase tracking platform
Quick interview: ask if Q1.2.1 is yes, or Q0.2.6 is 500 or more

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [AfterShip Returns & Exchanges](https://apps.shopify.com/returns-center-by-aftership), [Narvar Return and Exchange](https://apps.shopify.com/narvar-returns), [Redo](https://apps.shopify.com/redo), [AfterShip Order Tracking](https://apps.shopify.com/aftership), [parcelLab Order Tracking](https://apps.shopify.com/parcellab-engage)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.5** — How many days do customers have to return an order? *(recommended · client)*

**Q5.2.6** — What share of orders is returned today (%)? *(recommended · client)*
Feeds: app signal Returns platform
Quick interview: ask if Q0.2.6 is 500 or more

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Return rules and self-serve returns | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules |

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [AfterShip Returns & Exchanges](https://apps.shopify.com/returns-center-by-aftership), [Narvar Return and Exchange](https://apps.shopify.com/narvar-returns), [Redo](https://apps.shopify.com/redo)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.7** — How do customers send items back: prepaid label, QR code drop-off, their own shipment, or mixed? *(recommended · client)*
Feeds: app signal Returns platform
Quick interview: ask if Q0.2.6 is 500 or more

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Return labels | Basic | US fulfilment locations only | https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/return-labels |

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [AfterShip Returns & Exchanges](https://apps.shopify.com/returns-center-by-aftership)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.8** — Who pays return shipping: you, the customer, or it depends on the market? *(recommended · client)*

**Q5.2.9** — Which exchanges do you offer: same product in another variant, any other product, or store credit first? *(optional · client)*
Feeds: app signal Returns platform
Quick interview: ask if Q0.2.6 is 500 or more

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Exchanges added by staff on return approval | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns |

If native is not enough: App Store — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [Redo](https://apps.shopify.com/redo)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.10** — Do you accept international returns (including refunding duties)? *(optional · client)*
Feeds: app signal Returns platform
Quick interview: ask if Q3.1.1 has 2+ markets

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Returns and duties refunds for international orders | Basic | Native return labels only for US locations | https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/return-labels |

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [AfterShip Returns & Exchanges](https://apps.shopify.com/returns-center-by-aftership)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.11** — Must returned items be inspected before the refund or exchange is issued? *(recommended · client)*

**Q5.2.12** — Do you need to capture and report return reasons? *(optional · client)*

**Q5.2.13** — Should B2B customers request returns online (if you sell B2B)? *(optional · client)*

**Q5.2.14** — Do return windows or conditions differ by market or product (e.g. final-sale items)? *(optional · client)*

### 5.3 Notifications

**Q5.3.1** — Do order, shipping and delivery notifications need custom design or content? *(optional · client)*

**Q5.3.2** — Are notifications sent by Shopify, by the email platform, or both? *(optional · client)*

### 5.4 Cancellations & refunds

**Q5.4.2** — Should customers be able to cancel orders themselves? *(recommended · client)*
Feeds: app signal Order editing / cancellation app
Quick interview: ask if Q0.2.6 is 500 or more

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Cancellation requests and cancellation rules | Basic | Requests need merchant approval | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules |

If native is not enough: [Order editing](https://apps.shopify.com/categories/orders-and-shipping-orders-order-editing/all) — [Revize: Order Editing & Upsell](https://apps.shopify.com/revize), [OrderEditing.com](https://apps.shopify.com/order-editing), [Orderify ‑ Order Edit Cancel](https://apps.shopify.com/orderify)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.4.3** — Until when can an order be cancelled? *(recommended · client)*

**Q5.4.4** — Do you allow partial cancellations (some items of an order)? *(optional · client)*

**Q5.4.5** — Should customers be able to edit an order after placing it (address, items)? *(recommended · client)*
Feeds: app signal Order editing / cancellation app
Quick interview: ask if Q0.2.6 is 500 or more

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Staff order editing | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/editing-orders |

If native is not enough: [Order editing](https://apps.shopify.com/categories/orders-and-shipping-orders-order-editing/all) — [Revize: Order Editing & Upsell](https://apps.shopify.com/revize), [OrderEditing.com](https://apps.shopify.com/order-editing), [Orderify ‑ Order Edit Cancel](https://apps.shopify.com/orderify)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.4.6** — How are refunds paid: to the original payment method, as store credit, or as a gift card? *(recommended · client)*

**Q5.4.7** — When is a refund issued: on request, when the carrier scans the return, on receipt, or after inspection? *(recommended · client)*
Feeds: app signal Returns platform
Quick interview: ask if Q0.2.6 is 500 or more

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Refunds on return approval or receipt | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns |

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [Redo](https://apps.shopify.com/redo)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.4.8** — Is the original shipping cost refunded: always, only when you are at fault, or never? *(optional · client)*

**Q5.4.9** — Do you charge a restocking fee? *(optional · client)*

**Q5.4.10** — Do you issue partial refunds (e.g. damaged or missing parts)? *(optional · client)*

**Q5.4.11** — Must refunds be approved by someone before they are paid? *(recommended · client)*

**Q5.4.12** — Must cancellations and refunds be passed to your ERP or finance system? *(recommended · client)*

**Q5.4.13** — Must cancellations be instant, without your approval? *(optional · client)*
Feeds: app signal Order editing / cancellation app
Quick interview: ask if Q5.4.2 is yes

If native is not enough: [Order editing](https://apps.shopify.com/categories/orders-and-shipping-orders-order-editing/all) — [Revize: Order Editing & Upsell](https://apps.shopify.com/revize), [OrderEditing.com](https://apps.shopify.com/order-editing), [Orderify ‑ Order Edit Cancel](https://apps.shopify.com/orderify)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 5.5 Post-purchase experience

**Q5.5.1** — Do you want a branded order-tracking page on your own site? *(recommended · client)*
Feeds: app signal Post-purchase tracking platform
Quick interview: ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Order status page and shipping notifications | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview |

If native is not enough: [Order tracking](https://apps.shopify.com/categories/orders-and-shipping-orders-order-tracking/all) — [AfterShip Order Tracking](https://apps.shopify.com/aftership), [parcelLab Order Tracking](https://apps.shopify.com/parcellab-engage)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.5.2** — On which channels should customers get proactive delivery updates (delays, out for delivery)? *(recommended · client)*
Feeds: app signal Post-purchase tracking platform
Quick interview: ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Email and SMS shipping notifications | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview |

If native is not enough: [Order tracking](https://apps.shopify.com/categories/orders-and-shipping-orders-order-tracking/all) — [AfterShip Order Tracking](https://apps.shopify.com/aftership), [parcelLab Order Tracking](https://apps.shopify.com/parcellab-engage)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.5.3** — Should product pages or checkout show estimated delivery dates? *(optional · client)*
Feeds: app signal Post-purchase tracking platform
Quick interview: ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Delivery dates at checkout | Basic | Automatic dates: US fulfilment locations only | https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview |

If native is not enough: [Delivery and pickup](https://apps.shopify.com/categories/orders-and-shipping-shipping-solutions-delivery-and-pickup/all) — [Estimated Delivery Date ‑ ETA](https://apps.shopify.com/estimated-delivery-days), [Essent Estimated Delivery Date](https://apps.shopify.com/essential-estimated-delivery)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.5.4** — Do customers need to open warranty, repair or servicing claims online? *(recommended · client)*
Feeds: app signal Warranty claims solution
Quick interview: ask if Q1.1.3 mentions watch, jewel, electronic, appliance, furniture, bike, bicycle, tool, device or luxury

If native is not enough: [Returns and warranty](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty) — [Extend Shopper Operations](https://apps.shopify.com/extend-protection), [Clyde | Warranty Platform](https://apps.shopify.com/clyde-warranty-platform), [Route ‑ Protection & Tracking](https://apps.shopify.com/route)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 5.6 Retail & POS

**Q5.6.1** — How many physical retail stores (including pop-ups) will sell with Shopify? *(required · client)*
Feeds: gate Retail & POS · rule 11.22 (WARN)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify POS | Basic |  | https://help.shopify.com/en/manual/sell-in-person/getting-started/identify-your-pos-needs |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.6.2** — Point of sale at launch? *(required · client)*
Feeds: gate Retail & POS

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify POS | Basic |  | https://help.shopify.com/en/manual/sell-in-person/shopify-pos/faq |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.6.3** — Which omnichannel services are needed in store? *(required · client)*
Feeds: gate Retail & POS

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| POS Pro (omnichannel services per location) | Basic | POS Pro subscription per location; retail market catalogs need POS Pro or Plus | https://help.shopify.com/en/manual/sell-in-person/getting-started/identify-your-pos-needs |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.6.4** — In which countries are the stores? *(recommended · client)*

---

## § 6 — Customers, B2B & privacy

### 6.1 Customer accounts

**Q6.1.1** — Is guest checkout the default, are accounts optional, or is registration required? *(recommended · client)*

**Q6.1.3** — What should the account area include (order history, addresses, returns, wishlist, subscriptions)? *(required · client)*
Feeds: app signal Wishlist

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer accounts (order history, buy again, returns, store credit) | Basic |  | https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features |

If native is not enough: [Wishlists](https://apps.shopify.com/categories/marketing-and-conversion-customer-loyalty-wishlists/all) — [Swym Wishlist Plus](https://apps.shopify.com/swym-relay), [Swish (formerly Wishlist King)](https://apps.shopify.com/wishlist-king)
Build with: Customer account UI extensions
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.1.4** — How should customers sign in? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer accounts sign-in (one-time code, social) | Basic |  | https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features |
| Multipass (sign in from another site) | Shopify Plus | Not compatible with the Customer Account API used by headless | https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 6.2 B2B & wholesale

**Q6.2.2** — Do B2B customers need company accounts with their own login? *(required · client)*
Feeds: gate B2B / Wholesale

**Q6.2.3** — Do B2B customers get company-specific price lists? *(required · client)*
Feeds: gate B2B / Wholesale · rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B catalogs | Basic | Up to 3 active catalogs below Plus | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| Company-specific catalogs | Shopify Plus |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.4** — Are there B2B volume discounts or quantity rules? *(required · client)*
Feeds: gate B2B / Wholesale

**Q6.2.5** — Which payment terms are needed (net 30, invoice, purchase order)? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B payment terms, vaulted cards, draft orders | Basic |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| Deposits, partial payments, payment requests per fulfilment | Shopify Plus |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.6** — Is there a request-for-quote workflow, or is pricing negotiated per buyer? *(required · client)*
Feeds: rule 11.2 (FLAG) · app signal B2B quotes

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Orders submitted for review as drafts | Basic |  | https://help.shopify.com/en/manual/b2b/checkout-and-orders/checkout-settings |

If native is not enough: [Pricing quotes](https://apps.shopify.com/categories/selling-products-pricing-pricing-quotes/all) — [QS Request a Quote, Hide Price](https://apps.shopify.com/request-for-quote-by-omega), [SparkLayer B2B & Wholesale](https://apps.shopify.com/sparklayer)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.7** — Must B2B accounts be approved before they can order? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Forms and Shopify Flow for company approval | Basic |  | https://help.shopify.com/en/manual/shopify-flow |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.8** — Native Shopify B2B or an app? *(recommended · consultant)*

**Q6.2.9** — How many B2B accounts are expected within 12 months? *(optional · client)*

**Q6.2.10** — How many distinct B2B price lists (catalogs) do you need, and must any be specific to one company? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B catalogs | Basic | Up to 3 active catalogs below Plus | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| Unlimited and company-specific catalogs | Shopify Plus |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.11** — Should B2B buyers see a different storefront or checkout from consumers? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Contextual B2B storefront and checkout (Markets) | Advanced |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.12** — Do B2B orders need any of these: subscriptions, local delivery or pickup points, express checkouts, more than 500 line items, gift cards? *(required · consultant)*
Feeds: rule 11.19 (FLAG)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B considerations (unsupported features) | Basic |  | https://help.shopify.com/en/manual/b2b/getting-started/considerations |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.13** — Which shipping rules differ for B2B buyers? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B shipping methods (same as consumers by default; customise per buyer) | Basic | Custom apps with Shopify Functions need Plus; public apps with functions work on any plan | https://help.shopify.com/en/manual/b2b/checkout-and-orders/shipping-methods |
| Submit B2B orders as drafts for review | Basic |  | https://help.shopify.com/en/manual/b2b/checkout-and-orders/checkout-settings |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 6.3 Loyalty & segmentation

**Q6.3.1** — Which loyalty components are planned? *(recommended · client)*
Feeds: app signal Loyalty programme
Quick interview: ask if Q1.1.4 is Direct to consumer (DTC) or Hybrid (DTC and B2B)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Store credit | Basic |  | https://help.shopify.com/en/manual/customers/store-credit |

If native is not enough: [Loyalty and rewards](https://apps.shopify.com/categories/marketing-and-conversion-customer-loyalty-loyalty-and-rewards/all) — [Smile: Loyalty Program Rewards](https://apps.shopify.com/smile-io), [LoyaltyLion Loyalty Program](https://apps.shopify.com/loyaltylion), [Yotpo: Loyalty Rewards Program](https://apps.shopify.com/swell), [Rivo: Loyalty Program, Rewards](https://apps.shopify.com/rivo-loyalty)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.3.2** — Is loyalty needed at launch or in a later phase? *(recommended · client)*

**Q6.3.3** — Which loyalty app is used or preferred? *(optional · client)*

**Q6.3.4** — Must loyalty status sync to the email platform or CRM? *(optional · client)*

**Q6.3.5** — Which customer segments do you use today? *(optional · client)*

**Q6.3.6** — Where is segmentation driven from — Shopify, the email platform, a CDP, or a mix? *(optional · client)*

**Q6.3.7** — Which customer tags drive custom logic today (pricing, access, discounts)? *(optional · client)*

### 6.4 Privacy & consent

**Q6.4.1** — Which privacy laws apply to your customers (GDPR, UK GDPR, CCPA, Swiss nFADP, other)? *(required · client)*

**Q6.4.2** — Cookie consent: Shopify's cookie banner or a consent management platform? Name the tool if known. *(recommended · client)*
Feeds: app signal Consent management platform
Quick interview: ask if Q6.4.1 includes GDPR (EU), UK GDPR, Swiss nFADP or CCPA (US)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Cookie banner (customer privacy settings) | Basic |  | https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/privacy-settings |

If native is not enough: [Cookie consent](https://apps.shopify.com/categories/store-design-internationalization-cookie-consent/all) — [Pandectes GDPR Compliance](https://apps.shopify.com/gdpr-cookie-consent), [Consentmo GDPR Compliance](https://apps.shopify.com/gdpr-backpack), [Cookiebot CMP](https://apps.shopify.com/cookiebot-cmp-gdpr-compliance)
Build with: Customer Privacy API
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.4.3** — Is explicit opt-in required for marketing emails? *(recommended · client)*

**Q6.4.4** — Do you collect sensitive personal data (health, age, biometric, financial)? *(required · client)*
Feeds: rule 11.17 (FLAG)

**Q6.4.5** — Must data-access or deletion requests reach systems beyond Shopify (ERP, email platform) or run without staff involvement? *(required · client)*
Feeds: rule 11.10 (FLAG)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer data requests and erasure | Basic |  | https://help.shopify.com/en/manual/privacy-and-security/privacy/processing-customer-data-requests |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.4.6** — Do US state privacy laws require a 'Do not sell or share my personal information' page? *(optional · client)*

**Q6.4.7** — Where do you collect marketing consent? *(optional · client)*

---

## § 7 — Marketing & promotions

### 7.1 SEO

**Q7.1.1** — Is organic search a significant traffic channel? *(recommended · client)*

**Q7.1.2** — Are custom URL structures needed? *(optional · client)*

**Q7.1.3** — Who manages SEO? *(optional · client)*

**Q7.1.4** — Should products be discoverable in AI shopping assistants? *(optional · client)*

### 7.2 Analytics & tracking

**Q7.2.1** — Which analytics platforms do you use (GA4, Adobe, other)? *(recommended · client)*

**Q7.2.2** — Is server-side tracking needed? *(recommended · client)*
Feeds: app signal Server-side tracking beyond Shopify
Quick interview: ask if Q0.2.6 is 500 or more, or Q0.1.1 mentions conversion, tracking, attribution, advert, ads, roas or acquisition

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer events (web pixels); Facebook & Instagram and Google & YouTube apps | Basic |  | https://help.shopify.com/en/manual/promoting-marketing/pixels/overview |

If native is not enough: App Store — [Elevar Conversion Tracking](https://apps.shopify.com/gtm-datalayer-by-elevar), [Littledata ‑ The Data Layer](https://apps.shopify.com/littledata)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.2.3** — Which advertising pixels are needed (Meta, TikTok, Pinterest, Google Ads)? *(recommended · client)*

**Q7.2.4** — Is a tag manager already configured? *(recommended · client)*

**Q7.2.5** — Which custom events must be tracked beyond standard ecommerce events? *(recommended · client)*

### 7.3 Email & CRM

**Q7.3.1** — Which email / CRM platform do you use or plan to use: Shopify Messaging or another platform (name)? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Messaging | Basic |  | https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging |

If native is not enough: [Email marketing](https://apps.shopify.com/categories/marketing-and-conversion-marketing-email-marketing) — [Klaviyo: Email Marketing & SMS](https://apps.shopify.com/klaviyo-email-marketing), [Omnisend Email Marketing & SMS](https://apps.shopify.com/omnisend)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.3.2** — Which automated flows are needed (welcome, abandoned cart, post-purchase, win-back)? *(recommended · client)*

**Q7.3.4** — Do you send SMS marketing, and to which countries? *(recommended · client)*
Feeds: app signal SMS marketing outside Shopify Messaging countries
Quick interview: ask if Q0.2.6 is 500 or more, or Q0.4.1 mentions sms, retention or repeat

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Messaging SMS | Basic | AT, CA, DK, FI, IT, LU, PL, PT, SE, UK, US; Spain paused since 2026-09-15 | https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/sms/requirements |

If native is not enough: [SMS marketing](https://apps.shopify.com/categories/marketing-and-conversion-marketing-sms-marketing/all) — [Klaviyo: Email Marketing & SMS](https://apps.shopify.com/klaviyo-email-marketing), [Attentive](https://apps.shopify.com/attentive), [Postscript SMS Marketing](https://apps.shopify.com/postscript-sms-marketing)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.3.5** — Do you send WhatsApp marketing? *(optional · client)*

### 7.4 Reviews & affiliates

**Q7.4.1** — Which product reviews app is used or preferred? *(optional · client)*
Feeds: app signal Product reviews
Quick interview: ask if Q1.2.1 is yes, or Q0.5.4 is not None

If native is not enough: [Product reviews](https://apps.shopify.com/categories/marketing-and-conversion-social-trust-product-reviews/all) — [Judge.me Product Reviews App](https://apps.shopify.com/judgeme), [Yotpo: Product Reviews App](https://apps.shopify.com/yotpo-social-reviews), [Okendo: Reviews & Loyalty](https://apps.shopify.com/okendo-reviews), [Stamped Reviews & Loyalty](https://apps.shopify.com/product-reviews-addon)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.4.2** — Is user-generated content important (customer photos, social embeds)? *(optional · client)*

**Q7.4.3** — Which affiliate platform, if any? *(optional · client)*

**Q7.4.4** — Do you use Shopify Collabs for influencers? *(optional · client)*

**Q7.4.5** — Are affiliate and influencer sales tracked via discount codes, UTM parameters, or both? *(optional · client)*

### 7.5 Discounts & coupons

**Q7.5.1** — Which discount types are used? *(recommended · client)*

**Q7.5.2** — Which discounts must combine on one order? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Discount combinations | Basic | Up to 5 codes + 1 shipping code; 25 automatic discounts | https://help.shopify.com/en/manual/discounts/discount-combinations |
| Several product discounts on the same line item | Shopify Plus | Plan requirement to recheck after Spring '26 | https://help.shopify.com/en/manual/discounts/discount-combinations |
Build with: Discount Function
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.5.3** — Are coupon codes single-use, multi-use, or bulk-generated? *(optional · client)*

**Q7.5.4** — Must codes be brand-named (e.g. WELCOME20)? *(optional · client)*

**Q7.5.5** — Do codes need minimum order values or quantities? *(optional · client)*

**Q7.5.6** — Do codes expire on a fixed date, a rolling period, or never? *(optional · client)*

**Q7.5.7** — How are codes distributed (email, SMS, print, influencers)? *(optional · client)*

**Q7.5.8** — Do promotions differ by market, customer segment, sales channel or B2B company? *(recommended · client)*

### 7.6 Gift cards & campaigns

**Q7.6.1** — Are gift cards sold as a product? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Gift cards | Basic |  | https://help.shopify.com/en/manual/products/gift-card-products/overview |

If native is not enough: App Store — [Rise Gift Cards & Store Credit](https://apps.shopify.com/gift-card-loyalty-program), [Gift Card Hero](https://apps.shopify.com/gift-card-hero)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.6.2** — Are gift cards issued as rewards or compensation? *(optional · client)*

**Q7.6.3** — Digital gift cards, physical, or both? *(optional · client)*

**Q7.6.4** — Must gift cards expire? *(optional · client)*

**Q7.6.5** — Are promotions triggered from email or SMS campaigns? *(optional · client)*

**Q7.6.6** — Does each campaign need its own landing page? *(optional · client)*

**Q7.6.7** — Are countdown timers or urgency elements needed? *(optional · client)*

**Q7.6.9** — Do you run scheduled drops or flash sales with high traffic? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Rollouts (scheduled theme and checkout changes) | Grow |  | https://help.shopify.com/en/manual/markets/rollouts |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 7.7 AI & agentic commerce

**Q7.7.1** — Have you reviewed your AI shopping-channel settings in Shopify (Sales channels → Agentic)? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Agentic storefronts (active by default for eligible stores) | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-home |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.2** — Should Shopify enrol you automatically in current and future AI shopping channels, or do you want to approve each channel? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Agentic channel management (Shopify-managed or per channel) | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-home |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.3** — Should shoppers be able to complete the purchase inside the AI assistant, or come to your store to check out? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Direct checkout in agentic channels | Basic | Per channel; ChatGPT is referral only | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.4** — Do you sell to buyers in the United States? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Agentic channel eligibility | Basic | Starter plan or higher; some channels need US buyers | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.5** — Has someone with authority accepted Shopify's supplemental terms for AI shopping channels? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Agentic Storefronts supplemental terms | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.6** — Are you comfortable that AI channels receive customer name, e-mail, phone and address for orders placed inside the assistant? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer data shared with agentic channels on direct checkout | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/data-privacy |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.7** — How complete is your product data — titles, images, prices, descriptions and variants? *(recommended · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Catalog product requirements | Basic |  | https://help.shopify.com/en/manual/shopify-catalog/requirements |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.8** — Is important product information kept in metafields, metaobjects or inside product titles? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Catalog mapping for custom data | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/products |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.9** — Should AI crawlers be allowed, restricted or blocked on your storefront? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| robots.txt through the theme (robots.txt.liquid) | Basic |  | https://help.shopify.com/en/manual/promoting-marketing/seo/editing-robots-txt |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.10** — Do you want to control the answers AI assistants give about your shop (shipping, returns, sizing)? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Knowledge Base app | Basic |  | https://help.shopify.com/en/manual/promoting-marketing/knowledge-base |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.11** — Do you plan to expose your own AI agent or shopping assistant on top of the store? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Universal Commerce Protocol and agent interfaces | Basic | Universal Cart API is early access | https://shopify.dev/docs/agents |
| Storefront MCP server | Basic |  | https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.12** — Which Shopify AI features do you want your team to use? *(optional · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Sidekick and Shopify Magic | Basic | Included; features and limits vary by plan | https://help.shopify.com/en/manual/ai-powered-tools |
| Semantic search in Search & Discovery | Grow | Shopify or Advanced plan; under 200,000 products | https://changelog.shopify.com/posts/semantic-search-is-now-available-on-more-plans |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

---

## § 8 — Integrations & migration

### 8.1 Connected systems

**Q8.1.1** — List every system that exchanges product, inventory, order, customer or financial data with the store. For each: system, category, direction, data objects, frequency, connector (native app / iPaaS / custom / none), owner, status. *(required · client)*
Feeds: gate Integration · rule 11.7 (STOP) · rule 11.12 (FLAG)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Admin API, bulk operations and webhooks | Basic |  | https://shopify.dev/docs/api/functions |

If native is not enough: [ERP](https://apps.shopify.com/categories/orders-and-shipping-inventory-erp/all)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q8.1.2** — Is there a middleware / iPaaS layer, or custom connectors? *(optional · client)*

**Q8.1.3** — How often do prices and stock change (updates per day), and must changes be live within minutes? *(recommended · client)*

### 8.2 Data migration

**Q8.2.2** — Which data must be migrated? *(recommended · client)*

**Q8.2.3** — Approximate volumes: products, customers, orders, URL redirects. *(required · client)*
Feeds: rule 11.14 (FLAG)

**Q8.2.4** — Must historical orders be available inside Shopify? *(required · client)*
Feeds: rule 11.14 (FLAG)

**Q8.2.5** — How much SEO equity (rankings, backlinks) must be preserved? *(required · consultant)*
Feeds: rule 11.14 (FLAG)

**Q8.2.6** — Must active subscriptions move to the new store without customers re-entering cards? *(required · client)*
Feeds: rule 11.14 (FLAG)

---

## § 9 — Design & experience

### 9.1 Design input

**Q9.1.1** — Is there a Figma file or design mockup for the new store? *(required · client)*
Feeds: L trigger Full Figma design system

**Q9.1.2** — How complete is it — brand only, key screens, or every template? *(required · client)*
Feeds: L trigger Full Figma design system

**Q9.1.3** — Does the Figma file contain a full design system (tokens and components)? *(required · client)*
Feeds: L trigger Full Figma design system

**Q9.1.4** — Is the design mapped to Shopify sections and blocks? *(optional · consultant)*

**Q9.1.5** — Is a fully custom design required, rather than a theme with brand customisation? *(recommended · client)*

### 9.2 Storefront

**Q9.2.1** — Is a headless storefront required (Hydrogen, another framework, or a native app front end)? *(required · client)*
Feeds: L trigger Headless requirement

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Hydrogen and Oxygen | Basic | Oxygen public environments: 1 below Plus, 25 on Plus | https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q9.2.2** — Any theme licence to keep? *(optional · client)*

**Q9.2.3** — What is the aesthetic direction (minimal, editorial, luxury, playful, utilitarian)? *(optional · client)*

**Q9.2.4** — Which interactive patterns are required (mega-menu, quick-add, swatches, predictive search, lookbook, video hero)? *(required · client)*
Feeds: app signal Wishlist

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Predictive search, variant swatches and filters (Search & Discovery) | Basic |  | https://help.shopify.com/en/manual/online-store/search-and-discovery/filters |
| Combined listings | Shopify Plus |  | https://help.shopify.com/en/manual/products/combined-listings-app |

If native is not enough: [Wishlists](https://apps.shopify.com/categories/marketing-and-conversion-customer-loyalty-wishlists/all) — [Swym Wishlist Plus](https://apps.shopify.com/swym-relay), [Swish (formerly Wishlist King)](https://apps.shopify.com/wishlist-king)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q9.2.5** — Is custom motion or animation required? *(recommended · client)*

**Q9.2.6** — Why headless? *(required · client)*

**Q9.2.7** — Headless hosting? *(recommended · consultant)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Oxygen hosting | Basic |  | https://shopify.dev/docs/storefronts/headless/hydrogen/environments |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q9.2.8** — Where is editorial content managed for the headless storefront? *(recommended · client)*

**Q9.2.9** — Headless platform features required? *(recommended · consultant)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer Account API for headless | Basic |  | https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/hydrogen |
| Hydrogen analytics and consent | Basic | Cookie banner does not work on default Oxygen URLs | https://shopify.dev/docs/storefronts/headless/hydrogen/analytics/consent |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q9.2.10** — Do you want to A/B test themes or checkout configurations? *(required · client)*
Feeds: rule 11.1 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Rollouts experiments | Grow |  | https://help.shopify.com/en/manual/markets/rollouts |

If native is not enough: App Store — [Shoplift ‑ CRO & A/B Testing](https://apps.shopify.com/shoplift)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 9.3 Accessibility

**Q9.3.1** — Which accessibility standard applies? *(required · client)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify checkout accessibility (WCAG 2.2 AA) | Basic |  | https://www.shopify.com/accessibility |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q9.3.2** — Has an accessibility audit been done on the current site? *(optional · client)*

### 9.4 Performance

**Q9.4.1** — Core Web Vitals targets: LCP (seconds), CLS, INP (milliseconds). *(optional · client)*

**Q9.4.2** — Is page speed a known problem today? *(recommended · client)*

**Q9.4.3** — Which third-party scripts must load (chat, personalisation, heatmaps)? *(optional · client)*

---

## § 10 — Delivery, governance & compliance

### 10.1 Timeline

**Q10.1.1** — What is the target go-live date? *(required · client)*
Feeds: rule 11.15 (FLAG)

**Q10.1.2** — What drives the deadline (peak season, product launch, contract end)? *(recommended · client)*

**Q10.1.3** — Is a phased launch planned? *(optional · client)*

**Q10.1.4** — Preferred project kick-off date. *(recommended · client)*

### 10.2 Team & decisions

**Q10.2.1** — Who is involved on the client side? For each: role, RACI (R/A/C/I), decision-maker (yes/no). Names are optional. *(required · client)*

**Q10.2.2** — Is there a single decision-maker for scope, approvals and feedback? *(required · consultant)*
Feeds: rule 11.16 (FLAG)

**Q10.2.3** — Is budget approval authority clear? *(required · consultant)*
Feeds: rule 11.16 (FLAG)

### 10.3 Support & training

**Q10.3.1** — Which training is needed (products, orders, discounts, reports)? *(optional · client)*

**Q10.3.2** — Are written SOPs required? *(optional · client)*

**Q10.3.3** — What post-launch support model is expected? *(recommended · client)*

**Q10.3.4** — Is the Grow retainer signed? *(required · consultant)*
Feeds: rule 11.11 (WARN)

**Q10.3.5** — Retainer length in months. *(recommended · consultant)*

**Q10.3.6** — Will the client re-verify apps and Shopify features at each Shopify Edition after launch? *(optional · consultant)*

### 10.4 Legal & regulated industries

**Q10.4.1** — Is the business in a regulated industry (pharma, alcohol, firearms, age-restricted goods, financial products, medical devices)? If yes, which? *(required · client)*
Feeds: rule 11.8 (STOP)

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify rules for regulated goods (e.g. alcohol) | Basic |  | https://help.shopify.com/en/manual/compliance/legal/alcohol |

If native is not enough: App Store — [Age Verifier by OTG](https://apps.shopify.com/age-verification), [SB Age Verification Popup 18+](https://apps.shopify.com/age-verification-popup), [AgeX ‑ Age Verification Popup](https://apps.shopify.com/agex-age-verification-popup)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q10.4.2** — Are legal pages (terms, privacy, cookies, returns) ready, in need of updates, or still to be drafted? *(recommended · client)*

**Q10.4.3** — Any other industry-specific compliance requirements? *(optional · client)*

**Q10.4.4** — Is the business and product range eligible for Shopify Payments (no restricted or prohibited categories)? *(required · consultant)*

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Payments eligibility | Basic |  | https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 10.5 Project set-up (consultant)

**Q10.5.1** — Lead consultant. *(required · consultant)*

**Q10.5.2** — Has the client agreed that answers may be processed by the AI discovery engine (no customer personal data included)? *(required · consultant)*

**Q10.5.3** — Jira site and project key for the backlog. *(recommended · consultant)*

**Q10.5.4** — Jira components to use. *(optional · consultant)*

**Q10.5.5** — Discovery hit a STOP. How will Merkle proceed: Larger Engagement or no bid? *(recommended · consultant · only on STOP)*

---

## § 11 — Exit rules (full conditions)

| Rule | Result | Condition | If triggered | Asked in |
|---|---|---|---|---|
| 11.1 | STOP | A required Shopify feature needs a higher plan than the target plan, per Shopify's plan documentation (Plus: company-specific or more than 3 B2B catalogs, B2B deposits and partial payments, checkout step extensions / Checkout Branding API, expansion stores, several legal entities, combined listings, Multipass sign-in, more than 10 locations, more than 20 languages, several product discounts on one item; Advanced: B2B contextual experience, per-market customisation, carrier-calculated rates, multi-currency payouts, more than 5 staff users; Grow: A/B testing with Rollouts). Shopify B2B itself runs on every plan from Basic. A fully custom checkout UI is handled by 11.6, not here | Confirm the plan the requirements need, or remove the feature from scope | Q1.1.6, Q1.2.3, Q1.2.6, Q2.1.4, Q3.1.1, Q3.1.4, Q3.1.7, Q4.1.4, Q4.2.1, Q5.1.3, Q5.1.6, Q6.1.4, Q6.2.3, Q6.2.5, Q6.2.10, Q6.2.11, Q7.5.2, Q9.2.10 |
| 11.2 | FLAG | B2B requires request-for-quote or prices negotiated per buyer (Shopify has no built-in RFQ) | B2B architecture review: Shopify B2B draft-order review or a quote app (App Store category "Pricing quotes"), before build | Q6.2.6 |
| 11.3 | STOP | More than 5 Shopify Markets at launch | Larger Engagement: market roll-out waves and Markets architecture in the Discovery Phase | Q3.1.1 |
| 11.4 | STOP | More than 6 distinct languages across all markets | Larger Engagement: translation and content operations in the Discovery Phase | Q3.1.1 |
| 11.5 | FLAG | More than 3 variant options per product (Shopify limit), or more than 2,048 variants on one product | Product model review: combined listings, a product options app for non-stock options, or splitting products | Q2.1.2, Q2.1.3 |
| 11.6 | STOP | Fully custom checkout UI — not possible on Shopify (checkout.liquid is retired; only Checkout Extensibility) | Composable platform | Q4.2.1 |
| 11.7 | STOP | More than 3 integrations at launch (counted per integration_definition) | Larger Engagement: integration architecture in the Discovery Phase | Q8.1.1 |
| 11.8 | STOP | Regulated industry (pharma, alcohol, firearms, age-restricted, financial products, medical devices) | Legal / compliance review | Q1.1.3, Q10.4.1 |
| 11.9 | STOP | PCI scope beyond Shopify-hosted payments (custom card UI, tokenisation, handling card data) | Security review (threat model mandatory) | Q4.1.5 |
| 11.10 | FLAG | GDPR / CCPA data export or deletion workflow required | Legal sign-off on data-subject request handling | Q6.4.5 |
| 11.11 | WARN | Grow retainer not signed on an M or L engagement | Grow retainer to be signed before delivery starts; otherwise commercial adjustment | Q10.3.4 |
| 11.12 | FLAG | ERP or PIM with no existing Shopify connector and no iPaaS | Separate integration scoping track (T3/T4) | Q8.1.1 |
| 11.13 | FLAG | fulfilment_locations > 2 AND routing beyond Shopify's native order routing rules (a custom routing Function or the ERP / OMS decides) | Multi-location inventory scoping (T3) | Q5.1.3, Q5.1.4 |
| 11.14 | FLAG | Migration with significant SEO equity or complex historical data | Dedicated migration scoping track — not combined with the store build sprint | Q8.2.3, Q8.2.4, Q8.2.5, Q8.2.6 |
| 11.15 | FLAG | Weeks from kick-off (delivery.kickoff_date, else meta.created_at) to target go-live are fewer than the offer's minimum duration_weeks | Re-scope to an MVP-first delivery before any sprint begins | Q10.1.1 |
| 11.16 | FLAG | No single decision-maker, or budget approval authority is unclear | Named client decision-maker and budget owner confirmed before the statement of work is signed | Q10.2.2, Q10.2.3 |
| 11.17 | FLAG | Sensitive personal data is collected (health, age, biometric or financial data; special-category data under GDPR art. 9) | Data protection impact assessment and legal sign-off on data minimisation, storage location and consent before build | Q6.4.4 |
| 11.18 | FLAG | Existing Shopify store uses retired or deprecated features (Shopify Scripts, checkout.liquid / additional scripts, online store script tags, legacy customer accounts, Stocky, Geolocation app) | Deprecation migration scoped as its own workstream (e.g. Scripts to Functions, legacy to customer accounts) | Q1.2.5 |
| 11.19 | FLAG | B2B requirement that Shopify B2B does not support (subscriptions, local delivery or pickup points, express checkouts, more than 500 line items, gift cards) | B2B architecture review: app or process change before build | Q6.2.12 |
| 11.20 | FLAG | Mainland China (CN) is a launch market. Selling onshore behind the Great Firewall needs a PRC entity, an ICP filing or licence and onshore hosting, and Shopify has no infrastructure in mainland China; cross-border routes (marketplaces, mini-programs, a Hong Kong store) have their own customs and product rules. Not part of the Merkle offering: CN is excluded from this engagement's markets, languages, offer, plan and build scope | Separate China discovery (questions § 3.5, discovery/docs/china-mainland.md); mainland China excluded from this engagement's scope | Q3.1.1 |
| 11.21 | STOP | Mainland China is the only launch market — not part of the Merkle offering | China discovery (discovery/docs/china-mainland.md) | Q3.1.1 |
| 11.22 | WARN | More than 5 retail stores in scope | Quote the retail roll-out as a programme with roll-out increments, or as a rate-carded run team | Q5.6.1 |
