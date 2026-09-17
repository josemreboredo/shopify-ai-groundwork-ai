# Proposal: a Shopify-knowledge-based discovery questionnaire

- **Scope:** `schema/question-bank.json` 1.0.0 (211 questions), `schema/engagement.schema.json`, `schema/offering.json` 1.1.0, `agents/discovery/app-signals.js`
- **Checked against:** help.shopify.com, shopify.dev (docs and changelog), changelog.shopify.com, shopify.com/editions, shopify.com/pricing and apps.shopify.com, on 2026-09-17
- **Status:** proposal only. No repository file was changed.
- **Pricing:** this document contains no Merkle prices or modifiers and no Shopify fees.

> **Edition note.** The latest Edition published on shopify.com is **Spring '26** (https://www.shopify.com/editions/spring2026). `shopify.com/editions/summer2026` returns 404, and the only "Summer '26" reference found was a community forum post, so no claim below relies on a Summer '26 Edition. Earlier Editions used: Summer '25 and Winter '26.

---

## 1. Summary: top 10 changes by impact on scoping accuracy

| # | Change | Why it matters (offer · exit rule · app shortlist · effort) | Sections |
|---|---|---|---|
| 1 | **Rebuild exit rule 11.1 around Shopify's real plan boundaries.** Native B2B is **no longer Plus-only**; it has been on Basic, Grow and Advanced since 2026-04-02. Replace the prose list with checks at feature level: **Plus** for >3 active B2B catalogs, company-specific catalogs, deposits or partial payments, checkout-step UI extensions, Checkout Branding API, combined listings, multiple business entities and expansion stores; **Advanced** for per-market theme, checkout and accounts customisation and carrier-calculated shipping. | Today 11.1 fires a STOP for every B2B client not on Plus, and misses Combined Listings, multi-entity and per-market customisation. | 1.2, 3.1, 4.2, 6.2 + offering |
| 2 | **Rewrite the checkout customisation question (Q4.2.1/Q4.2.2)** using Shopify's surfaces: the checkout and accounts editor (all plans), Thank you / Order status extensions (all plans), Information/Shipping/Payment step extensions (Plus), Checkout Branding API (Plus), and Functions (public apps all plans, custom apps Plus). checkout.liquid is fully gone. | 11.1 and 11.6 accuracy; checkout effort estimate; app vs custom decision. | 4.2 |
| 3 | **Add a "Retail & POS" subsection** (known gap, confirmed): number of stores, POS today, omnichannel features that need **POS Pro** (ship-to-customer, pickup in store, exchanges, stock transfers), and retail market catalogs (POS Pro or Plus). | POS is not captured at all today. It changes locations (11.13), routing, returns and inventory integration scope. | new 5.6 |
| 4 | **Add the cross-border model question**: Managed Markets (Shopify as merchant of record: US, certain CA/UK stores) or self-managed Markets with Shopify Tax. Also add tax-inclusive display per market, tax service, and HS code / country-of-origin readiness. | Decides tax, duties, fraud and payment scope and several incompatibilities (Managed Markets has no B2B, and subscriptions only for domestic orders). | 3.1, 3.4 |
| 5 | **Correct the native post-purchase baseline** in the bank and `app-signals.js`: Shopify has native **cancellation requests** (Spring '26), **return and cancellation rules** (windows, return fees, restocking fee, final sale), and self-serve returns that also cover **B2B orders**. Native return labels only exist for **US** fulfilment locations, and customers cannot request exchanges. | Removes false "order editing app" and "B2B returns app" signals, and adds true ones (non-US labels, customer-requested exchanges, instant cancellation). | 5.2, 5.4 + app-signals |
| 6 | **Fix the discount stacking help and enum (Q7.5.2).** Shopify natively allows **5 product/order codes + 1 shipping code** per order and **25 active automatic discounts**. A Discount Function is needed only for custom logic. | The current help overstates custom work (T3) for common promotions. | 7.5 |
| 7 | **Catalogue realism:** **2,048 variants** per product (since 2025-10-15), still 3 options; **Combined Listings** (Plus); product-option apps for non-inventory options; **Shopify Bundles** only does fixed bundles and multipacks (mix-and-match needs an app, and bundles don't work with subscriptions or pre-orders); native **Shopify Subscriptions** limits; **pre-orders and back-in-stock alerts need apps**. | 11.5 routing, sku_complexity gate, and the app shortlist for bundles, subscriptions, pre-orders and alerts. | 2.1, 2.2, 2.5 |
| 8 | **Deprecation audit for existing Shopify stores** (consultant): Shopify Scripts (stopped running 2026-06-30), checkout.liquid and additional scripts, online-store script tags (stop running 2027-03-01), legacy customer accounts (deprecated 2026-02-26), Stocky (gone 2026-08-31), plus an installed-apps inventory. | A "rebuild" of an existing Plus store often hides a Scripts → Functions migration and an accounts upgrade. The effort is currently invisible. | 1.2 |
| 9 | **Shipping and fulfilment in Shopify's own terms:** delivery methods (local delivery, pickup in store, pickup points), free-shipping thresholds per market (known gap, confirmed), carrier-calculated shipping (Advanced+), the native order routing rule names, and location limits (10 below Plus, 200 on Plus). | Makes 11.13 precise (native routing vs a custom Order Routing Function), catches the plan gate for live rates, and adds delivery-app signals. | 5.1 |
| 10 | **A `shopify` knowledge block per question, an app registry and explicit "none" options**, checked at every Shopify Edition (section 5 of this proposal). | Makes every question traceable to a docs URL and plan, lets 11.1 and app signals run on data, and separates "no requirement" from "not answered". | all |

Counts proposed in section 3:
- **51 new questions**, including a new subsection 5.6 Retail & POS
- **76 changes to existing questions** (text, help, enum, answer type or feeds)
- **7 removals or merges**
- **2 exit-rule changes and 2 new FLAG rules** (11.18, 11.19)
- **3 corrected app signals and 15 new app signals**

---

## 2. Corrections to current help texts and rule assumptions

| # | Item | Current (repo) | Correct per Shopify (2026-09-17) | Source |
|---|---|---|---|---|
| C1 | Exit 11.1 condition; Q6.2.1 `feeds: exit:11.1`; offering 11.1 "native B2B" | Native B2B is a Plus feature | B2B is available on **Basic, Grow, Advanced and Plus** (changelog 2026-04-02). All plans get companies and locations, **up to 3 active B2B catalogs**, quantity rules and volume pricing, net payment terms, vaulted cards, ACH (US), draft orders and PO numbers, quick order list, and Flow. **Plus only:** unlimited catalogs, catalogs assigned directly to companies or locations, deposits, partial payments, payment requests per fulfilment. **Advanced or Plus:** contextual checkout and storefront. | https://changelog.shopify.com/posts/key-b2b-features-now-available-on-non-plus-plans · https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| C2 | Q4.2.1 help "Extensibility requires Shopify Plus (11.1)"; 11.1 "Checkout Extensibility customisation" | All Checkout Extensibility customisation is Plus | **All plans:** checkout and accounts editor, and apps and UI extensions on **Thank you and Order status** pages. **Plus only:** UI extensions on **Information, Shipping and Payment** steps, the **Checkout Branding API**, and **custom apps** using Shopify Functions. Public App Store apps with Functions work on all plans. | https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility · https://shopify.dev/docs/api/checkout-ui-extensions · https://shopify.dev/docs/api/functions |
| C3 | Q4.2.1 enum `custom_ui`; 11.6 | Implies a custom checkout UI is still an option to weigh | checkout.liquid stopped on in-checkout pages **2024-08-13**. On Thank you and Order status pages it stopped **2025-08-28** (Plus). Non-Plus script tags on those pages stopped **2026-08-26**. There is no supported way to build a custom checkout UI on Shopify. 11.6 stays valid as a STOP, but the help should say "not possible on Shopify" rather than just "hard stop". | https://shopify.dev/changelog/checkout-liquid-will-no-longer-work-for-in-checkout-pages-starting-august-13-2024 · https://shopify.dev/docs/storefronts/themes/architecture/layouts/checkout-liquid · https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade |
| C4 | Q7.5.2 help "Beyond one code plus one automatic discount needs a discount function (T3)" | Only 1 code + 1 automatic without custom work | Customers can enter **up to 5 product or order discount codes and 1 shipping code**, and a store can have **25 active automatic discounts** (app discounts included). Product+order, order+order, product+shipping and order+shipping combine natively. Only **multiple product discounts on the same line item** is Plus-only; Spring '26 lists "stacking multiple product discounts" without a plan tag (plan requirement unverified). A Function is needed for custom logic, e.g. one discount saving across classes, line-item-property rules, or external data (Plus custom apps only). | https://help.shopify.com/en/manual/discounts/discount-combinations · https://shopify.dev/docs/api/functions/latest/discount · https://www.shopify.com/editions/spring2026 |
| C5 | Q2.1.2 help "More than 3 options is a hard stop (11.5)"; Q2.1.3 has no help | Options are the only variant constraint | **3 options** per product is still the limit. Variants per product went from 100 to **2,048** for all merchants on **2025-10-15**; apps not on the current GraphQL product APIs "may have a downgraded or broken experience" above 100 variants. **Combined Listings** (Plus and enterprise only) groups separate products (up to 60 children) as one listing, which is the native way around the option limit. | https://help.shopify.com/en/manual/products/variants/add-variants · https://shopify.dev/changelog/the-product-variant-limit-is-now-2048-for-all-merchants · https://help.shopify.com/en/manual/products/combined-listings-app |
| C6 | Q3.1.1 help "More than 5 markets (11.3) or more than 6 languages (11.4) is a hard stop" | Reads as a Shopify limit | These are **Merkle scope thresholds**, not Shopify limits, and the help should say so. Shopify has **no limit on country/region markets**, allows **20 published languages** (Basic–Advanced) and **30** (Plus). Translate & Adapt auto-translates **at most 2 languages**. | https://help.shopify.com/en/manual/markets/getting-started/market-types · https://help.shopify.com/en/manual/international/languages · https://help.shopify.com/en/manual/international/translate-adapt-app |
| C7 | Q6.1.2 "New customer accounts (passwordless) or classic accounts?" and enum `new_customer_accounts / classic` | Both are valid choices | **Legacy customer accounts are deprecated (2026-02-26)**. They are not available to new stores or to stores that weren't using them, and a sunset date is "to be announced later in 2026". "New customer accounts" is now just **Customer accounts**. B2B, self-serve returns, store credit and Buy again require them. | https://shopify.dev/changelog/legacy-customer-accounts-are-deprecated · https://changelog.shopify.com/posts/new-customer-accounts-is-now-customer-accounts · https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features |
| C8 | `app-signals.js`: "Customers cancel orders themselves" → order editing app | Self-service cancellation needs an app | Native **cancellation requests** from customer accounts (Spring '26). Cancellation windows: none, until fulfilled, 15 min, 1 h, 24 h. Requests need **merchant approval**. An app is only needed for instant auto-cancellation, customer order **editing**, or address changes. | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns · https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules · https://www.shopify.com/editions/spring2026 |
| C9 | `app-signals.js`: "Online returns for B2B customers" → returns platform | B2B online returns need an app | Return rules and self-serve returns **apply to all orders, including B2B**. Not a reason for an app on its own. | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules · https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns/setup |
| C10 | Q5.2.2 "Is a self-service returns portal needed?" (boolean); Q5.2.7 help "Prepaid labels and QR drop-off need a carrier integration" | Portal = app; labels = app | A native self-serve returns portal exists (customer accounts), with return rules for window, return shipping fee, restocking fee and final sale. **Native return labels in admin only for US fulfilment locations** (no international). **Customers can't request exchanges**; merchants add exchange items on approval. So non-US prepaid labels and customer-chosen exchanges remain valid app signals. | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns · https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/return-labels |
| C11 | Q5.4.9 restocking fee; Q5.2.8 return shipping | Treated as policy only | Both are **native return rule settings**: restocking fee as a percentage of the return (not automatically deducted from refunds), and a flat return shipping fee or customer-bought label. | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules |
| C12 | Q2.2.2 "Which subscription app is used or preferred?" | Assumes a third-party app | Shopify has a native **Shopify Subscriptions** app. Limits: not with bundles, draft orders or the order-edit API; not with B2B; gateways limited to Shopify Payments, PayPal Express, Authorize.net, Adyen and Stripe; gift cards apply to the first payment only; under Managed Markets, domestic orders only. | https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions/considerations · https://help.shopify.com/en/manual/b2b/getting-started/considerations · https://help.shopify.com/en/manual/international/managed-markets/requirements-and-considerations |
| C13 | Q2.5.3 enum `backorder`, `notify_me`; product type `pre_order` | Treated as native behaviour | "Continue selling when out of stock" is native (needs tracked inventory; not for POS). **Pre-orders need a pre-order app** (selling plans), and only with Shopify Payments or PayPal Express. **No native back-in-stock alert** was found, so it is app-based. Stocky is **retired (2026-08-31)**; purchase orders and transfers are native in admin. | https://help.shopify.com/en/manual/products/inventory/setup/selling-when-out-of-stock · https://help.shopify.com/en/manual/products/purchase-options/pre-orders · https://help.shopify.com/en/manual/products/inventory/transitioning-from-stocky |
| C14 | Q2.5.2 "Are low-stock alerts needed?" | Implies a native alert | There is no dedicated native low-stock alert. Shopify points to **Flow** automations (all plans). | https://help.shopify.com/en/manual/products/inventory/transitioning-from-stocky · https://help.shopify.com/en/manual/shopify-flow |
| C15 | Q3.4.1 duties (no help) | Implicitly Plus / app | Duties and import taxes at checkout are listed on **all plans** (pricing page; Summer '25). They need **HS codes and country of origin** on products, no Shopify Fulfillment Network, and a DDP-capable carrier if buying labels. Otherwise use a duties app. | https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties · https://www.shopify.com/pricing · https://www.shopify.com/editions/summer2025 |
| C16 | Q3.4.2 / Q3.4.3 tax (no help) | No tax service question | **Shopify Tax** covers US, EU, UK and Canada (VAT invoices, VAT number validation). Since **2026-05-13**, **Basic Tax is not available to new stores** selling in Canada, the UK or the EU. Tax display per market ("Dynamic tax display") is native. | https://help.shopify.com/en/manual/taxes/shopify-tax · https://help.shopify.com/en/manual/taxes/shopify-tax/choose-tax-service · https://help.shopify.com/en/manual/international/pricing/dynamic-tax-inclusive-pricing |
| C17 | Q3.1.5 geo redirect | Boolean, no guidance | The Geolocation app **can't be installed since 2025-02-01**. **Automatic redirection** is native (Online Store > Preferences), but EU visitors on EU country domains are not redirected automatically. | https://help.shopify.com/en/manual/international/geolocation · https://help.shopify.com/en/manual/international/automatic-redirection |
| C18 | Q3.1.4 help "Expansion stores require Shopify Plus" | Correct, incomplete | Correct: Plus includes **9 expansion stores** (10 stores in total). Missing: per-market theme customisation needs **Advanced or Plus**; selling from **multiple business entities** needs **Plus** + Shopify Payments + new Markets; **multiple B2B markets** need Plus. | https://help.shopify.com/en/manual/organization-settings/expansion-stores · https://help.shopify.com/en/manual/online-store/themes/customizing-themes-for-markets · https://help.shopify.com/en/manual/payments/shopify-payments/onboarding/selling-with-multiple-entities · https://changelog.shopify.com/posts/new-version-of-markets-now-available |
| C19 | Q5.1.6 "calculated" rates | No plan dependency | Third-party **carrier-calculated shipping** is on **Advanced and Plus**, is an add-on on Grow, and isn't available on Basic or Starter. A free-shipping threshold is native (rate condition "Based on order price" or an automatic free-shipping discount). | https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/third-party-carrier-calculated-shipping · https://help.shopify.com/en/manual/discounts/discount-types/free-shipping |
| C20 | Q5.1.3/Q5.1.4 and 11.13 | ">2 locations and complex routing" = beyond native | **Location limits:** Starter 2, Basic/Grow/Advanced 10, Plus 200 (app/3PL locations don't count). **Native order routing rules:** minimise split fulfilments, stay within destination market, ship from closest location, ranked locations, location metafields. Only logic beyond these needs an Order Routing Location Rule Function. | https://help.shopify.com/en/manual/fulfillment/setup/locations/setup · https://help.shopify.com/en/manual/fulfillment/setup/order-routing/understanding-order-routing |
| C21 | Q5.5.3 delivery estimates → post-purchase platform | Always an app | **Manual delivery dates** work on all plans. **Automated** delivery dates need a **US** fulfilment location. **Shop Promise** is US only. Outside the US, estimated delivery dates remain an app signal. | https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview |
| C22 | Q4.1.3 BNPL; Q4.1.2 local methods | Free text | **Shop Pay Installments:** stores in the **US, Canada, UK** only. **Via Shopify Payments:** Klarna (Europe), iDEAL \| Wero, Bancontact, EPS, Przelewy24, BLIK, MB WAY, Multibanco, MobilePay, Swish, TWINT, Alipay, WeChat Pay, OXXO, ACH Direct Debit (US B2B). Shopify Payments is available in 40 countries. | https://help.shopify.com/en/manual/payments/shop-pay-installments/eligibility · https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods · https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries |
| C23 | Q4.1.4 multi-currency settlement | No plan dependency | **Multi-Currency Payouts** with Shopify Payments are **Advanced and Plus only** (UAE Plus only). | https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/payouts-in-multiple-currencies |
| C24 | Q4.3.1 fraud | No native baseline | **Fraud analysis:** indicators on Basic+; recommendations need Grow+ or Shopify Payments. **Shopify Fraud Control** app (checkout rules need Shopify Payments). **Shopify Protect** (chargeback protection on Shop Pay orders) is **US merchants only**. A chargeback guarantee outside that needs an app. | https://help.shopify.com/en/manual/fulfillment/managing-orders/protecting-orders/fraud-analysis · https://help.shopify.com/en/manual/payments/fraud-prevention/fraud-control-app · https://help.shopify.com/en/manual/payments/shop-pay/shopify-protect/protect-order-with-shopify-protect |
| C25 | Q4.2.4 post-purchase upsells | Treated as a standard feature | The **post-purchase page extension is still beta** (live stores request access; custom apps Plus only). Thank you page upsell extensions work on all plans. | https://shopify.dev/docs/apps/build/checkout/product-offers/build-a-post-purchase-offer |
| C26 | Q6.4.2 cookie consent tool (free text) | Assumes a third-party tool | Native **cookie banner** (Settings > Customer privacy), set up automatically for UK/EEA when those markets are active; also on checkout and customer accounts. Third-party banners must integrate the **Customer Privacy API**. Native **data sale/sharing opt-out page** honours Global Privacy Control. | https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/privacy-settings · https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/understanding-customer-privacy-settings |
| C27 | Q6.4.5 help / 11.10 "workflow for export or deletion requests" | Any workflow → legal FLAG | Access ("Request customer data") and erasure ("Erase personal data", cancellable within 10 days) are **native in admin**. The merchant must notify third parties separately. 11.10 should fire only when requests must propagate to other systems or need a self-service or automated flow. | https://help.shopify.com/en/manual/privacy-and-security/privacy/processing-customer-data-requests |
| C28 | Q7.4.4 "Do you use Shopify Collabs?" | Collabs is open | Collabs "isn't accepting new creator signups at this time" (merchants can still invite creators). It needs Network Intelligence and is not available on Starter or Retail. | https://help.shopify.com/en/manual/promoting-marketing/collabs · https://help.shopify.com/en/manual/promoting-marketing/collabs/merchants/setup |
| C29 | Q6.3.6 segmentation source (implied Audiences) | — | **Shopify Audiences** requires **Plus**, Shopify Payments, a US/Canada business and Network Intelligence. | https://help.shopify.com/en/manual/promoting-marketing/shopify-audiences |
| C30 | `#def:shopify_plan` enum `none, basic, grow, advanced, plus, plus_expansion` | — | "Grow" is correct (renamed from "Shopify" 2025-04-21). Missing plans: **Starter, Retail, Shopify for enterprise (Commerce Components), Agentic** (Spring '26). `plus_expansion` is not a plan; expansion is covered by `/markets/strategy`. | https://shopify.dev/changelog/adding-publicdisplayname-field-on-shopplan · https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features · https://www.shopify.com/editions/spring2026 |
| C31 | Q10.2.4 admin roles (no help) | No plan impact | **User limits:** Starter 0, Basic 0, Grow 5, Advanced 15, Plus unlimited. Collaborators and POS-only staff (POS Pro) don't count. This can force a plan choice. | https://help.shopify.com/en/manual/your-account/users/users-plan-requirements |
| C32 | Q9.2.1 headless help | Headless = L; no platform facts | **Oxygen** comes with Starter, Basic, Grow, Advanced and Plus (not Agentic). **Public environments:** 1 below Plus, 25 on Plus. Hydrogen can also be self-hosted. The Headless channel allows up to 100 storefronts/tokens. Headless accounts use the **Customer Account API** (needs the Hydrogen or Headless channel; Multipass doesn't support it). Checkout is always Shopify checkout. The Shopify cookie banner doesn't work on default `*.myshopify.dev` Oxygen URLs. | https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals · https://shopify.dev/docs/storefronts/headless/hydrogen/environments · https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels · https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/hydrogen · https://shopify.dev/docs/storefronts/headless/hydrogen/analytics/consent |
| C33 | Existing-store rebuilds (no question) | Not covered | **Shopify Scripts:** no editing after **2026-04-15**, stopped running **2026-06-30**; migrate to Functions. **Online store script tags:** deprecated, **stop running 2027-03-01**. | https://changelog.shopify.com/posts/shopify-scripts-can-no-longer-be-edited-or-published · https://shopify.dev/changelog/online-store-script-tags-deprecation |
| C34 | Q8.2.1 migration (no help) | — | Shopify's **Store Migration** app imports from Square, WooCommerce, Etsy, Wix, Amazon, eBay, Clover and Lightspeed (products, customers). Other sources (e.g. Magento, Shopware, SFCC) need a migration app or the API. Historical orders, gift cards and store credit can be imported via app/API; **customer passwords can't be migrated**. | https://apps.shopify.com/store-migration · https://help.shopify.com/en/manual/migrating-to-shopify |
| C35 | Q8.1.2 "(Celigo, Boomi, MuleSoft, custom)" | Names iPaaS vendors | This doesn't conflict with Shopify, but it breaks the owner's rule against vendor names for ERP, PIM, iPaaS and similar. Change to "an iPaaS / middleware layer, or custom". | owner requirement |
| C36 | Q2.3.3 / `gate:sku_complexity` (custom attributes) | No limits stated; older docs had plan-based caps on metaobject entries | Metaobject entries are now **1,000,000 per definition** (plan caps removed 2025-10-24). Merchant metaobject definitions: **128 below Plus, 256 on Plus**. 256 metafield definitions per resource. Plan limits are no longer an input to SKU complexity. | https://shopify.dev/changelog/increased-limits-for-metafields-and-metaobjects · https://shopify.dev/docs/apps/build/metaobjects/metaobject-limits |

---

## 3. Proposed changes by section

**Conventions**
- IDs continue each subsection's numbering. A new subsection is marked *new*.
- **Pri:** R = required, Rec = recommended, O = optional. **Aud:** C = client, K = consultant.
- **Field:** "new field" means the engagement schema lacks it; a proposed path is given.
- **Options:** lists enum values that mirror Shopify feature names. Every multi_enum or list gets `none`, and `not_sure` where the client may not know.
- **Help text:** written for the rendered questionnaire. The plan information comes from the `shopify` block (section 5).

### § 0 Business outcomes

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Add | Q0.2.5 | Rec / C / table | "What share of revenue comes from each channel today: online store, retail stores, marketplaces, social commerce, wholesale/B2B, other?" | Tells us whether POS, B2B and marketplace scope are in play. Columns: channel · share % · growth expectation. Options for channel: `online_store`, `retail_pos`, `marketplaces`, `social_commerce`, `b2b_wholesale`, `other`. | new field `/business/channel_mix` |
| Change | Q0.6.3 | O / C / money | (unchanged text) | Add help: "Many needs are covered by apps made by Shopify (e.g. Subscriptions, Bundles, Search & Discovery, Translate & Adapt, Flow, Messaging). We check those first." | — |

### § 1 Company, brand & Shopify

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Add | Q1.1.6 | Rec / C / list | "Do you sell through more than one legal entity (e.g. one per country or region)? List them." | Selling from several business entities in one store needs **Shopify Plus**, Shopify Payments and the new Markets. Otherwise you need expansion stores. `none` allowed. | new field `/meta/client/legal_entities` · feeds `exit:11.1` |
| Add | Q1.1.7 | R / C / multi_enum | "Where will you sell at launch?" | Options: `online_store`, `shopify_pos`, `shop_app`, `marketplaces` (Marketplace Connect: Amazon, eBay; Walmart and Target Plus US only), `facebook_instagram`, `google_youtube`, `tiktok`, `b2b_online`, `headless_or_mobile_app`, `ai_agents` (Shopify Catalog / agentic channels, Spring '26), `none_other`. | new field `/channels/launch` |
| Change | Q1.2.2 | Rec / C / group | Add "…and the apps installed today (name, purpose, keep/replace)". | Split out as Q1.2.4. | — |
| Change | Q1.2.3 | R / C / enum | "Which Shopify plan will the new store run on?" (move "(All Foundation and Scale offers assume Shopify Plus.)" to consultant help) | Enum: `starter`, `basic`, `grow`, `advanced`, `plus`, `enterprise`, `retail`, `not_sure`; drop `plus_expansion`. Help: "Some features depend on the plan. We will confirm the plan once requirements are known." | `#def:shopify_plan` enum change |
| Add | Q1.2.4 | Rec / C / table | "Which apps are installed today, what do they do, and which must stay?" | skip_if Q1.2.1 = false. Columns: app · purpose · keep / replace / remove. Feeds app-signal "client uses X". | new field `/shopify/installed_apps` |
| Add | Q1.2.5 | R / K / multi_enum | "Existing store audit: which deprecated Shopify features does it still use?" | skip_if Q1.2.1 = false. Options: `shopify_scripts` (stopped 2026-06-30 → Functions), `checkout_liquid_or_additional_scripts` (retired 2024–2026), `online_store_script_tags` (stop 2027-03-01), `legacy_customer_accounts` (deprecated 2026-02-26), `stocky` (gone 2026-08-31), `geolocation_app`, `none`. | new field `/shopify/deprecated_features` · proposed new FLAG 11.18 |
| Add | Q1.2.6 | Rec / C / integer | "How many people need their own Shopify admin login after go-live?" | Users per plan: Basic 0, Grow 5, Advanced 15, Plus unlimited. Collaborators and POS-only staff don't count. **Merges Q10.2.4** (the roles list becomes a column). | new field `/shopify/staff_users` |

### § 2 Catalogue & products

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Change | Q2.1.2 | R / C / integer | (unchanged) | Replace help: "Shopify allows up to 3 options per product. Above 3: split into separate products shown as one (**Combined Listings**, Plus), or capture non-stock choices with a product options app." Keep 11.5 but change its destination (section 3 exit rules below). | — |
| Change | Q2.1.3 | Rec / C / integer | (unchanged) | Add help: "Shopify allows up to 2,048 variants per product (since Oct 2025). Above 100 variants, every app must use Shopify's current product APIs." Feed a new check: >2,048 → 11.5. | feeds `exit:11.5` |
| Add | Q2.1.4 | Rec / C / boolean | "Are variants such as colours managed as separate products (own SKUs, images, URLs) that should appear as one product on the storefront?" | This is **Combined Listings** (Plus and enterprise only; up to 60 child products). | new field `/catalogue/combined_listings` · feeds `exit:11.1` |
| Add | Q2.1.5 | Rec / C / multi_enum | "Do customers personalise products with inputs that are not stock variants?" | Options: `text_engraving`, `file_upload`, `paid_add_ons`, `conditional_options`, `configurator_3d`, `none`. Needs a product options app (category "Custom products"). | new field `/catalogue/personalisation` · new app signal `product_options_app` |
| Change | Q2.2.1 | R / C / multi_enum | (unchanged) | Enum: split `bundle` into `fixed_bundle`, `multipack`, `mix_and_match_bundle`; add `try_before_you_buy`, `none_of_these`. Help: "Shopify Bundles (all plans) creates fixed bundles and multipacks; mix-and-match needs an app." | enum change `/catalogue/product_types` |
| Add | Q2.2.3 | Rec / C / multi_enum | "What must bundles do?" | skip_if Q2.2.1 excludes any bundle type. Options: `fixed_price_bundle`, `multipack`, `customer_builds_bundle`, `bundle_with_subscription`, `bundle_discount_tiers`, `sell_bundles_on_pos`, `bundles_on_marketplaces`. **Shopify Bundles limits:** up to 30 components; not with subscriptions, pre-orders or try-before-you-buy; no nested bundles; bundle price doesn't follow component price changes. | new field `/catalogue/bundles/requirements` · new app signal `bundle_app` |
| Change | Q2.2.2 | Rec / C / enum | "Will subscriptions run on Shopify Subscriptions (Shopify's app) or a third-party subscription app?" | Enum: `shopify_subscriptions`, `third_party_app`, `undecided`. Keep `/catalogue/subscription_app` for the named app. **Shopify Subscriptions:** skip, pause and cancel in customer accounts; POS supported; not with bundles, B2B or draft orders; limited payment gateways. | new field `/catalogue/subscriptions/approach` |
| Add | Q2.2.4 | Rec / C / multi_enum | "Which subscription features are needed?" | skip_if no subscription. Options: `pay_per_delivery`, `prepaid_multi_delivery`, `build_a_box`, `subscribe_and_save_discount`, `subscription_bundles`, `subscriptions_on_pos`, `b2b_subscriptions`, `international_subscriptions`, `migrate_existing_contracts`. The last six (from `build_a_box`, apart from POS) are app signals; prepaid support in the native app is unverified. | new field `/catalogue/subscriptions/features` · new app signal `subscriptions_app` |
| Add | Q2.2.5 | Rec / C / enum | "For pre-orders, when is the customer charged?" | skip_if no pre_order. Options: `full_at_order`, `deposit_then_balance`, `charged_at_fulfilment`. Help: "Pre-orders need a pre-order app, with Shopify Payments or PayPal Express. Express checkouts (Shop Pay, Apple Pay, Google Pay) aren't available for pre-orders." | new field `/catalogue/pre_orders/payment` · new app signal `pre_order_app` |
| Change | Q2.3.3 | Rec / C / list | (unchanged) | Add help: "Shopify stores extra attributes as metafields and metaobjects, and uses the Standard Product Taxonomy for category attributes (used for filters and Google/Meta feeds). With a PIM, attributes come from the PIM." | — |
| Add | Q2.3.5 | Rec / C / list | "Which attributes should shoppers filter by on collection and search pages?" | Search & Discovery filters: up to 25 filters; no filters on collections over 5,000 products; up to 100 values shown per filter. Above that → search app (category "Search and filters"). | new field `/catalogue/storefront_filters` |
| Change | Q2.3.4 | Rec / C / enum | (unchanged) | Add help: "Typical: products and content from the PIM; prices and inventory from the ERP." | — |
| Change | Q2.4.1 | Rec / C / boolean | "Are there price lists for customer groups (retail, trade, VIP)?" | Help: "Company price lists are **B2B catalogs**. All plans get up to 3 active catalogs; more, or catalogs per company, need Plus. Consumer VIP pricing without B2B needs discounts or an app." | feeds `gate:b2b` |
| Change | Q2.4.2 | Rec / C / boolean | (unchanged) | Help: "B2B **quantity rules and volume pricing** are native on all plans. For consumers, use automatic discounts or a volume-discount app." | — |
| Change | Q2.4.3 | Rec / C / boolean | (unchanged) | Help: "Markets supports percentage price adjustments, fixed prices per product per country, and price rounding. Full functionality needs Shopify Payments." | — |
| Change | Q2.5.1 | Rec / C / enum | (unchanged) | Add help: "With the ERP as source of truth, Shopify still needs stock per location." Add enum `oms`, `pos`. | enum change |
| Change | Q2.5.2 | O / C / boolean | (unchanged) | Help: "Shopify has no built-in low-stock alert. We set it up with Shopify Flow (all plans)." | — |
| Change | Q2.5.3 | O / C / multi_enum (was enum) | "What should happen when a product is out of stock?" | Options: `hide`, `show_sold_out`, `continue_selling_backorder` (native), `back_in_stock_alert` (app), `pre_order` (app). | type change · new app signal `back_in_stock_app` |
| Add | Q2.5.4 | O / C / multi_enum | "Which inventory tasks will your team do in Shopify?" | Options: `purchase_orders`, `stock_transfers`, `stock_counts_pos`, `damaged_quality_control_safety_stock`, `none_erp_managed`. All are native (Stocky retired 2026-08-31). | new field `/catalogue/inventory/operations` |

### § 3 Markets & internationalisation

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Change | Q3.1.1 | R / C / table | (unchanged) | Replace help (consultant view): "Merkle scope thresholds: >5 markets (11.3), >6 languages (11.4). **Shopify limits:** no limit on country or region markets; 20 languages (30 on Plus)." Client view: "List each country or group of countries." Add column `domain_type` (`subfolder`, `subdomain`, `country_domain`). | add `/markets/list/*/domain_type` |
| Change | Q3.1.4 | Rec / K / enum | "Operating model: one store with Markets, expansion stores (Plus), or hybrid?" | Help: "Expansion stores (up to 9 on Plus) suit teams that run each region separately. Per-market theme, checkout and account customisation needs Advanced or Plus." | — |
| Add | Q3.1.6 | R / K / enum | "Who is merchant of record for international orders?" | Options: `self_managed_markets` (you register and remit; Shopify Tax), `managed_markets` (Shopify/Global-e is merchant of record), `third_party_mor_app`, `undecided`. **Managed Markets:** US, certain Canada and UK stores; Shopify Payments; no B2B; subscriptions domestic only; no multiple entities; not with Collabs. | new field `/markets/cross_border_model` · proposed FLAG in 11.1 family |
| Add | Q3.1.7 | Rec / C / boolean | "Should any market have its own theme content, section order, checkout or customer-account settings?" | Needs **Advanced or Plus**. | new field `/markets/per_market_customisation` · feeds `exit:11.1` (plan ≥ advanced) |
| Change | Q3.1.5 | O / C / enum (was boolean) | "How should visitors reach their local market?" | Options: `automatic_redirect` (native), `country_selector_only`, `suggest_banner` (app), `none`. Help: "The old Geolocation app is retired. EU visitors on EU country domains are not redirected automatically." | type change `/markets/geo_redirect` |
| Change | Q3.2.1 | Rec / C / enum | (unchanged) | Help: "Translate & Adapt (free Shopify app) auto-translates up to 2 languages; more need manual work or an app (e.g. Weglot, langify). Checkout is pre-translated in 33 languages." Enum: add `pim_supplied`. | enum change |
| Add | Q3.2.4 | Rec / C / multi_enum | "What must be translated?" | Options: `product_data_from_pim`, `theme_texts`, `metaobject_content`, `policies`, `notifications`, `url_handles`, `app_content`, `none`. Translate & Adapt doesn't auto-translate policies or URL handles. | new field `/markets/translation_scope` · new app signal `translation_app` |
| Change | Q3.3.1 | R / C / enum | (unchanged) | Add: "Local-currency pricing with every Markets pricing feature needs Shopify Payments." | — |
| Change | Q3.4.1 | Rec / C / boolean | (unchanged) | Help: "Shopify can charge duties and import taxes at checkout (all plans). This needs HS codes and country of origin on every product." | — |
| Add | Q3.4.4 | Rec / C / enum | "Do products have HS codes and country of origin, and where do they come from?" | skip_if Q3.4.1 = false. Options: `in_pim`, `in_erp`, `to_be_created`, `not_needed`. | new field `/catalogue/customs_data_source` |
| Add | Q3.4.5 | R / C / enum | "Should prices include tax (VAT) in some markets and exclude it in others?" | Options: `include_everywhere`, `exclude_everywhere`, `dynamic_by_market` (native "Dynamic tax display"). Known gap, confirmed. | new field `/markets/tax_display` |
| Add | Q3.4.6 | Rec / K / enum | "Which tax service?" | Options: `shopify_tax`, `tax_app`, `manual_rates`, `undecided`. Help: "Shopify Tax covers US, EU, UK and Canada. Since 2026-05-13, new stores selling in the EU, UK or Canada can't use Basic Tax." | new field `/markets/tax_service` |
| Add | Q3.4.7 | O / C / boolean | "Do business customers buy tax-exempt (VAT number validation, reverse charge)?" | Native: VAT ID validation at checkout (Spring '26). B2B tax exemption per company location is not verified in this review. | new field `/b2b/tax_exempt` |

### § 4 Payments & checkout

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Change | Q4.1.1 | R / C / list | (unchanged) | Help: "Shopify Payments (40 countries) is required for Shop Pay Installments, Shopify Protect, Managed Markets, multiple entities and some Markets pricing features. Third-party gateways are supported." | — |
| Change | Q4.1.2 | Rec / C / multi_enum (was list) | (unchanged) | Options mirror Shopify Payments local methods: `klarna`, `ideal_wero`, `bancontact`, `eps`, `przelewy24`, `blik`, `mb_way`, `multibanco`, `mobilepay`, `swish`, `twint`, `alipay`, `wechat_pay`, `sepa_or_invoice_via_gateway`, `other`, `none`. | type change |
| Change | Q4.1.3 | O / C / multi_enum | (unchanged) | Options: `shop_pay_installments` (US, CA, UK stores), `klarna_via_shopify_payments`, `bnpl_via_other_gateway`, `none`. | enum change |
| Change | Q4.1.4 | O / C / boolean | (unchanged) | Help: "Multi-Currency Payouts: Advanced and Plus only." | feeds `exit:11.1` (plan ≥ advanced) |
| Add | Q4.1.6 | Rec / C / multi_enum | "Which express checkouts are required?" | Options: `shop_pay`, `apple_pay`, `google_pay`, `paypal`, `amazon_pay`, `none`. Help: "B2B checkout and pre-orders don't support express checkouts." | new field `/payments/accelerated_checkouts` |
| Add | Q4.1.7 | Rec / C / boolean | "Must payment methods be hidden, renamed or reordered by market, customer type or cart?" | Needs a **Payment Customization Function** app (public apps all plans; custom apps Plus). Local methods by region can be managed natively. | new field `/payments/method_rules` |
| Change | Q4.2.1 | R / C / multi_enum (was enum) | "Which checkout changes are needed?" | Options: `branding_in_editor` (all plans), `thank_you_order_status_blocks` (all plans), `checkout_step_blocks_or_fields` (Plus), `checkout_branding_api_styling` (Plus), `backend_logic_functions` (discount/shipping/payment/validation rules), `fully_custom_checkout_ui` (not possible → 11.6), `none`. | type/enum change `/checkout/customisation` · feeds `exit:11.1`, `exit:11.6` |
| Change | Q4.2.2 | O / K / multi_enum (was list) | (unchanged) | Options mirror extension points: `custom_fields`, `upsell_block`, `gift_message`, `trust_badges`, `loyalty_redemption`, `delivery_customization` (hide/rename/sort rates), `payment_customization`, `cart_checkout_validation` (min/max, restrictions), `address_validation`, `pickup_point_generator`. App category: "Checkout" (e.g. **Shopify Checkout Blocks**). | type change |
| Change | Q4.2.4 | O / C / boolean | (unchanged) | Help: "Upsells on the Thank you page: all plans. A separate post-purchase page is a Shopify beta (needs access)." | — |
| Change | Q4.2.5 | — | — | **Merge into Q7.6.1** (duplicate gift card question). | remove `/checkout/gift_cards` |
| Change | Q4.2.6 | O / C / boolean | (unchanged) | Help: "Store credit is native (refund to store credit, issue credit). Customers spend it when signed in to customer accounts or Shop Pay." | — |
| Change | Q4.3.1 | O / C / boolean | (unchanged) | Help: "Native: fraud analysis and the Shopify Fraud Control app. Chargeback protection (Shopify Protect) covers US Shopify Payments stores only." | — |
| Add | Q4.3.3 | O / C / boolean | "Do you want a guarantee that fraud chargebacks are reimbursed?" | Outside US Shop Pay orders this needs a fraud app (e.g. Signifyd, Riskified). | new field `/checkout/chargeback_guarantee` · new app signal `fraud_guarantee_app` |
| Change | Q4.3.2 | O / C / multi_enum (was list) | (unchanged) | Options: `block_countries` (native via markets/shipping zones), `order_value_min_max`, `quantity_limits`, `customer_type_restrictions`, `product_combination_rules`, `none`. Beyond country blocks → Cart and Checkout Validation Function (e.g. Checkout Blocks). | type change |

### § 5 Shipping & fulfilment

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Change | § 5 intro | — | Remove the hard-coded app names. | Replace with "…whether native Shopify (return rules, self-serve returns, order status page, delivery dates) is enough or an app is needed." Apps come from the registry. | — |
| Change | Q5.1.3 | R / C / integer | (unchanged) | Help: "Stock locations: 10 below Plus, 200 on Plus. 3PL app locations don't count." | feeds `exit:11.1` when >10 |
| Change | Q5.1.4 | Rec / C / multi_enum (was boolean) | "How should Shopify pick the fulfilling location?" | Options mirror native rules: `minimize_split_fulfillments`, `stay_within_market`, `closest_location`, `ranked_locations`, `location_metafields`, `custom_rule_function`, `erp_or_oms_decides`. 11.13 fires only on the last two. | type change `/shipping/complex_routing` → `/shipping/routing_rules` |
| Change | Q5.1.6 | Rec / C / multi_enum | (unchanged) | Options: `flat`, `weight_or_price_based`, `free_above_threshold`, `carrier_calculated` (Advanced/Plus; add-on on Grow), `app_calculated`. | enum change · feeds `exit:11.1` |
| Add | Q5.1.10 | Rec / C / table | "Free-shipping thresholds per market (market, threshold, currency, which rates)." | Native: rate condition "Based on order price" or an automatic free-shipping discount. Known gap, confirmed. | new field `/shipping/free_shipping_thresholds` |
| Add | Q5.1.11 | R / C / multi_enum | "Which delivery methods do you offer?" | Options: `standard_shipping`, `express`, `local_delivery` (native; up to 160 km, 10 zones), `pickup_in_store` (native), `pickup_points` (Function/app), `scheduled_delivery_slots` (app), `ship_from_store` (POS Pro). B2B checkout doesn't offer local delivery or pickup points. | new field `/shipping/delivery_methods` · new app signal `delivery_scheduling_app` |
| Add | Q5.1.12 | O / C / enum | "How are shipping labels created?" | Options: `shopify_shipping` (carriers vary by country), `3pl_system`, `carrier_software`, `shipping_app`. | new field `/shipping/label_source` |
| Change | Q5.1.8 | — | — | **Remove**: derive from `/markets/list` (more than the home country = international). Keep Q5.1.9 (skip_if single market). | remove `/shipping/international` from questions (keep as derived) |
| Change | Q5.2.2 | Rec / C / enum (was boolean) | "Shopify includes customer return requests in customer accounts, controlled by return rules. Is that enough?" | Options: `native_self_serve_returns`, `returns_app_needed`, `staff_created_only`, `not_sure`. The help lists native features: return window 14/30/90/custom days, flat return fee, restocking fee, final sale, merchant approval, exchange items added by staff. | type change `/shipping/returns/portal` |
| Change | Q5.2.4 + Q5.5.5 | — | — | **Merge** into one Q5.2.4: "Which returns, tracking or post-purchase apps do you use or prefer?" (list, `none` allowed). | merge `/post_purchase/platform_preference` into `/shipping/returns/solution` or a new list `/post_purchase/apps_preferred` |
| Change | Q5.2.7 | Rec / C / enum | (unchanged) | Help: "Shopify creates return labels only for US fulfilment locations (domestic). Other countries, or QR drop-off, need a returns app." | app-signal change (below) |
| Change | Q5.2.9 | O / C / multi_enum | (unchanged) | Help: "Customers can't request exchanges in Shopify's return form; staff add exchange items when approving. Customer-chosen exchanges need an app." | — |
| Change | Q5.2.13 | O / C / boolean | (unchanged) | Help: "Shopify's return requests also work for B2B orders." Remove `app:returns_platform` feed. | feeds change |
| Add | Q5.2.14 | O / C / boolean | "Do return windows or conditions differ by market or product (e.g. final-sale items)?" | Final sale per product or collection is native. Market-specific return rules are early access. | new field `/shipping/returns/rules_vary` |
| Change | Q5.3.1 | O / C / boolean | (unchanged) | Help: "Shopify notifications are editable on all plans. Suppressing individual notifications is Plus only. SMS shipping notifications are native." | — |
| Change | Q5.4.2 | Rec / C / boolean | (unchanged) | Help: "Customers can request cancellation of unshipped items in customer accounts; you approve. Instant cancellation without approval needs an app." | app-signal change |
| Change | Q5.4.3 | Rec / C / enum | (unchanged) | Enum aligned with Shopify cancellation rules: `no_cancellations`, `until_fulfilled`, `15_minutes`, `1_hour`, `24_hours`, `staff_only`. | enum change `/post_purchase/cancellations/window` |
| Change | Q5.4.5 | Rec / C / boolean | (unchanged) | Help: "Staff can edit orders natively (not orders paid with Shop Pay Installments, local delivery or imported orders). Customer self-editing needs an app (e.g. Revize, Cleverific)." | — |
| Change | Q5.4.9 | O / C / boolean | (unchanged) | Help: "Restocking fee is a native return rule (% of the return)." | — |
| Change | Q5.5.1 | Rec / C / boolean | (unchanged) | Replace app names with a registry reference. | — |
| Change | Q5.5.3 | O / C / boolean | (unchanged) | Help: "Shopify can show delivery dates at checkout: manual dates on all plans; automatic dates only for US fulfilment locations. Otherwise an app is needed." | app-signal change |
| Add (new 5.6 Retail & POS) | Q5.6.1 | R / C / integer | "How many physical retail stores (including pop-ups) will sell with Shopify?" | `0` allowed. | new field `/retail/store_count` |
| Add | Q5.6.2 | R / C / enum | "Point of sale at launch?" | skip_if Q5.6.1 = 0. Options: `shopify_pos`, `other_pos_integrated`, `other_pos_separate`, `undecided`. | new field `/retail/pos` · counts as integration if `other_pos_integrated` |
| Add | Q5.6.3 | R / C / multi_enum | "Which omnichannel services are needed in store?" | skip_if Q5.6.1 = 0. Options: `buy_online_pickup_in_store`, `ship_to_customer_from_store`, `in_store_returns_exchanges_of_online_orders`, `endless_aisle_order_in_store`, `store_credit_gift_cards_in_store`, `stock_transfers_counts`, `retail_prices_or_catalogs`, `staff_roles_permissions`, `none`. Most need **POS Pro** per location; retail market catalogs need POS Pro or Plus. | new field `/retail/omnichannel` |
| Add | Q5.6.4 | Rec / C / list | "In which countries are the stores?" | Shopify sells POS hardware directly in AU, BE, CA, DK, FI, FR, DE, IE, IT, NL, NZ, SG, ES, UK and US. Elsewhere, supported models come from third-party retailers, and payments depend on supported card providers. | new field `/retail/countries` |

### § 6 Customers, B2B & privacy

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Remove | Q6.1.2 | — | — | Legacy accounts are deprecated. New stores get customer accounts. Existing stores are covered by Q1.2.5. | remove `/customers/account_type` (or keep, derived) |
| Change | Q6.1.3 | O / C / multi_enum (was list) | (unchanged) | Options: `order_history`, `buy_again`, `return_requests`, `cancellation_requests`, `store_credit`, `addresses`, `subscription_management`, `b2b_company_locations`, `loyalty_widget` (app), `wishlist` (app), `extra_profile_fields` (UI extension), `none`. | type change · new app signal `wishlist_app` |
| Add | Q6.1.4 | Rec / C / multi_enum | "How should customers sign in?" | Options: `email_code` (native), `google_facebook` (native), `shop`, `company_sso_identity_provider`, `sign_in_from_another_site` (Multipass, Plus; not compatible with the Customer Account API used by headless). | new field `/customers/sign_in_methods` · feeds `exit:11.1` |
| Change | Q6.2.1 | R / C / boolean | (unchanged) | Help: "Shopify B2B is available on all plans (since April 2026). Some features need Advanced or Plus; see the next questions." **Remove `exit:11.1` from feeds.** | feeds change |
| Change | Q6.2.3 | R / C / boolean | (unchanged) | Help: "Price lists are **B2B catalogs**: up to 3 active on Basic to Advanced; more, or catalogs per company, need Plus." | — |
| Add | Q6.2.10 | R / C / integer | "How many distinct B2B price lists (catalogs) do you need, and must any be specific to one company?" | Group: count + boolean `company_specific`. | new fields `/b2b/catalog_count`, `/b2b/company_specific_catalogs` · feeds `exit:11.1` |
| Change | Q6.2.5 | Rec / C / multi_enum (was list) | (unchanged) | Options: `net_terms`, `due_on_fulfilment`, `vaulted_card`, `ach_us`, `invoice_via_draft_order`, `deposits` (Plus), `partial_payments` (Plus), `pay_per_fulfilment` (Plus), `none`. | type change · feeds `exit:11.1` |
| Change | Q6.2.6 | R / C / boolean | (unchanged) | Help: "Shopify has no built-in request-for-quote. Native options: orders submitted as drafts for review, and staff-created draft orders. Quote apps (category 'Pricing quotes') handle negotiation." See open question O2 on 11.2. | — |
| Change | Q6.2.7 | O / C / boolean | (unchanged) | Help: "Native: a wholesale application form (Shopify Forms) plus Flow to create and approve companies." | — |
| Change | Q6.2.8 | Rec / K / enum | (unchanged) | Enum: `shopify_b2b`, `shopify_b2b_plus_apps`, `b2b_app_only`, `separate_b2b_expansion_store`, `undecided`. | enum change |
| Add | Q6.2.11 | Rec / C / boolean | "Should B2B buyers see a different storefront or checkout from consumers?" | Contextual storefront and checkout need **Advanced or Plus**. Multiple B2B markets need Plus. | new field `/b2b/contextual_experience` · feeds `exit:11.1` |
| Add | Q6.2.12 | Rec / K / multi_enum | "Do B2B orders need any of these?" | Options: `subscriptions`, `local_delivery_or_pickup_points`, `express_checkouts`, `over_500_line_items`, `gift_cards` (Plus + support), `none`. Shopify B2B doesn't support these (gift cards are Plus via support). | new field `/b2b/unsupported_needs` · new FLAG 11.19 |
| Change | Q6.3.1 | Rec / C / multi_enum | (unchanged) | Add `none`. Help: "Shopify has no native points programme; store credit can be a reward currency. Loyalty needs an app." | enum change · new app signal `loyalty_app` |
| Change | Q6.3.6 + Q7.3.3 | — | — | **Merge** Q7.3.3 into Q6.3.6. Help: "Customer segments are native. Shopify Audiences (ad targeting) needs Plus and a US or Canada business." | remove `/marketing/esp/segments_master` |
| Change | Q6.4.2 | Rec / C / enum (was text) | "Cookie consent: Shopify's cookie banner or a consent management platform?" | Options: `shopify_cookie_banner`, `third_party_cmp` (must integrate Shopify's Customer Privacy API), `undecided`. | type change · new app signal `consent_app` |
| Change | Q6.4.5 | R / C / boolean | "Must data-access or deletion requests reach systems beyond Shopify (ERP, email platform) or run without staff involvement?" | Help: "Shopify handles export and erasure requests in admin. 11.10 applies when other systems or automation are involved." | feeds `exit:11.10` (narrowed) |
| Add | Q6.4.6 | O / C / boolean | "Do US state privacy laws require a 'Do not sell or share my personal information' page?" | Native opt-out page (honours Global Privacy Control). | new field `/compliance/data_sale_opt_out` |
| Add | Q6.4.7 | O / C / multi_enum | "Where do you collect marketing consent?" | Options: `checkout`, `customer_account_sign_in`, `forms_popups`, `pos`, `none`. | new field `/compliance/consent_capture_points` |

### § 7 Marketing & promotions

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Change | Q7.1.2 | O / C / boolean | (unchanged) | Help (unverified, see section 6): "Shopify themes use fixed URL prefixes (/products/, /collections/, /pages/). Other URL structures need redirects or a headless storefront." | — |
| Add | Q7.1.4 | O / C / boolean | "Should products be discoverable in AI shopping assistants?" | Shopify Catalog and agentic channels (Spring '26). | new field `/channels/agentic` |
| Change | Q7.2.2 | Rec / C / boolean | (unchanged) | Help: "Shopify's Customer events (web pixels) track storefront and checkout, including consent. The Facebook & Instagram app sends server-side events (Conversions API) at its Enhanced/Maximum data-sharing levels, which **share customer PII with Meta** and need the PII gate. Google & YouTube tracks GA4 ecommerce events. Anything beyond that uses an app (e.g. Elevar, Littledata)." | new app signal `tracking_app` |
| Change | Q7.2.4 | O / C / boolean | (unchanged) | Help: "Tag managers run as a custom pixel in Shopify's sandbox. Scripts in checkout.liquid are no longer possible." | — |
| Change | Q7.3.1 | Rec / C / enum (was text) | (unchanged) | Options: `shopify_messaging`, `third_party_esp` (+ name), `none`. Help: "Shopify Messaging (formerly Shopify Email) covers email, SMS and WhatsApp campaigns and automations." | type change |
| Add | Q7.3.4 | Rec / C / group | "Do you send SMS marketing, and to which countries?" | Shopify Messaging SMS countries: Austria, Canada, Denmark, Finland, Italy, Luxembourg, Poland, Portugal, Sweden, UK, US (Spain paused since 2026-09-15). Other countries → SMS app. Known gap, confirmed. | new fields `/marketing/sms/enabled`, `/marketing/sms/countries` · new app signal `sms_app` |
| Add | Q7.3.5 | O / C / boolean | "Do you send WhatsApp marketing?" | Native in Shopify Messaging. | new field `/marketing/whatsapp` |
| Change | Q7.4.1 | O / C / text | (unchanged) | Help: "Product reviews need an app (category 'Product reviews')." | app signal `reviews_app` |
| Change | Q7.4.4 | O / C / boolean | (unchanged) | Help: "Shopify Collabs isn't accepting new creator sign-ups; you can still invite creators." | — |
| Change | Q7.5.2 | Rec / C / enum | "Which discounts must combine on one order?" | Enum: `none`, `native_combinations` (up to 5 product/order codes + 1 shipping code; product + order + shipping; up to 25 automatic discounts), `multiple_discounts_same_item` (Plus), `custom_logic_function`. Corrected help per C4. | enum change `/promotions/stacking` |
| Add | Q7.5.8 | Rec / C / multi_enum | "Do promotions differ by…?" | Options: `market` (native, Spring '26), `customer_segment` (native automatic discounts for eligible customers), `sales_channel_pos_only` (native), `b2b_company`, `none`. **Merges Q7.6.8.** | new field `/promotions/targeting` |
| Change | Q7.6.1–Q7.6.4 | O / C | (unchanged) | Help: "Gift cards are native on all plans. Digital cards are emailed; physical cards are scanned on POS. They never expire by default. Selling in local currencies needs markets and catalogs." | — |
| Change | Q7.6.7 | O / C / boolean | (unchanged) | Help: "Countdown timers need an app or theme work." | — |
| Add | Q7.6.9 | O / C / boolean | "Do you run scheduled drops or flash sales with high traffic?" | Native: scheduled theme and checkout rollouts (Rollouts). Plus: Launchpad and advanced bot protection. | new field `/promotions/campaigns/flash_sales` · feeds `exit:11.1` if Launchpad required |

### § 8 Integrations & migration

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Change | Q8.1.1 | R / C / table | (unchanged) | Enum `/integrations/*/category` add: `pos`, `marketplace`, `tax`, `fraud`, `subscriptions`, `iPaaS`. Enum `/integrations/*/objects` add: `companies_catalogs` (B2B), `locations`, `fulfilments`, `refunds`, `metaobjects`, `translations`, `customs_data`. Help: "The PIM supplies products, attributes and translations; the ERP supplies prices (incl. B2B catalogs), inventory per location and order status." | enum changes |
| Change | Q8.1.2 | O / C / text | "Is there a middleware / iPaaS layer, or custom connectors?" | Remove vendor names. | — |
| Add | Q8.1.3 | Rec / C / group | "How often do prices and stock change: updates per day, and must changes be live within minutes?" | Used to size API sync (bulk operations vs webhooks). | new fields `/integrations/*/daily_updates`, `/integrations/*/latency_minutes` |
| Change | Q8.2.1 | R / C / enum | (unchanged) | Help: "Shopify's Store Migration app imports products and customers from Square, WooCommerce, Etsy, Wix, Amazon, eBay, Clover and Lightspeed. Other platforms use a migration app (e.g. Matrixify) or the API." | — |
| Change | Q8.2.2 | Rec / C / multi_enum | (unchanged) | Enum add: `store_credit`, `metafields_metaobjects`, `b2b_companies`, `subscription_contracts`, `blog_posts_pages`. Help: "Customer passwords can't be migrated; customers sign in with a one-time code." | enum change |
| Add | Q8.2.6 | Rec / C / boolean | "Must active subscriptions move to the new store or subscription app without customers re-entering cards?" | Payment-method migration depends on gateway and app. | new field `/migration/subscriptions` · feeds `exit:11.14` |

### § 9 Design & experience

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Change | Q9.2.1 | R / C / boolean | (unchanged) | Consultant help: "Hydrogen is Shopify's headless framework (React Router 7). Oxygen hosting is included on Starter to Plus (1 public environment below Plus, 25 on Plus). Checkout stays Shopify checkout." | — |
| Add | Q9.2.6 | R / C / multi_enum | "Why headless?" | skip_if Q9.2.1 = false. Options: `ux_not_possible_in_theme`, `performance`, `existing_cms_or_content_platform`, `native_mobile_app`, `multiple_frontends_one_backend`, `url_structure_control`, `other`. Lets the consultant check whether Horizon theme blocks would do. | new field `/design/headless/reasons` |
| Add | Q9.2.7 | Rec / K / enum | "Headless hosting?" | skip_if not headless. Options: `oxygen`, `self_hosted_js_runtime`, `undecided`. | new field `/design/headless/hosting` |
| Add | Q9.2.8 | Rec / C / enum | "Where is editorial content managed for the headless storefront?" | Options: `shopify_metaobjects`, `headless_cms`, `pim`, `undecided`. | new field `/design/headless/content_source` · counts as integration if `headless_cms` |
| Add | Q9.2.9 | Rec / K / multi_enum | "Headless platform features required?" | Options: `customer_account_api_accounts`, `markets_i18n_routes`, `b2b`, `subscriptions`, `bundles_combined_listings`, `shopify_analytics_consent` (Hydrogen Analytics + Customer Privacy API), `multiple_storefronts` (public Oxygen environments: 1 below Plus, 25 on Plus). Help: "Consent via Hydrogen Analytics + Customer Privacy API needs checkout on a subdomain. The cookie banner doesn't work on default Oxygen URLs." Known gap (Hydrogen fields), confirmed. | new field `/design/headless/features` |
| Change | Q9.2.2 | O / C / text | "Any theme licence to keep?" | Help: "New builds start from Shopify's Horizon theme (theme blocks). A third-party theme licence is only relevant for a non-Horizon base." | — |
| Change | Q9.2.4 | Rec / C / multi_enum (was list) | (unchanged) | Options: `mega_menu`, `predictive_search` (native), `variant_swatches` (native), `quick_add`, `combined_listings`, `filters` (Search & Discovery), `quick_order_list_volume_pricing` (Horizon B2B), `wishlist` (app), `store_locator` (app), `lookbook`, `video_hero`, `none`. | type change |
| Add | Q9.2.10 | O / C / boolean | "Do you want to A/B test themes or checkout configurations?" | Native Rollouts experiments (Grow plan or higher); scheduled theme launches. | new field `/design/ab_testing` |
| Change | Q9.3.1 | R / C / enum | (unchanged) | Help: "Shopify checkout is tested against WCAG 2.2 AA (Shopify's accessibility report). The store theme and apps are your responsibility (e.g. under the European Accessibility Act)." | — |
| Change | Q9.4.2 | Rec / C / boolean | (unchanged) | Help: "Shopify's web performance report shows Core Web Vitals for the current store." | — |

### § 10 Delivery, governance & compliance

| Action | ID | Pri / Aud / Type | Text | Help / options | Field |
|---|---|---|---|---|---|
| Remove | Q10.2.4 | — | — | Merged into Q1.2.6. | — |
| Change | Q10.4.1 | R / C / group | (unchanged) | Help: "Shopify has its own rules for regulated goods: alcohol requires age verification; age-restricted goods are excluded from the Shop app and Managed Markets; some business types can't use Shopify Payments. Age checks need an app (category \"Age verification\", e.g. Age Verifier by OTG)." Keeps 11.8. | — |
| Add | Q10.4.4 | R / K / boolean | "Is the business and product range eligible for Shopify Payments (no restricted or prohibited categories)?" | Source: Shopify Payments eligibility. `false` → gateway choice and any feature that requires Shopify Payments. | new field `/compliance/shopify_payments_eligible` |
| Add | Q10.3.6 | O / K / boolean | "Will the client's team re-verify apps and Shopify features at each Shopify Edition after launch?" | Links the Grow retainer to platform change management (Scripts, accounts and Stocky-style retirements). | new field `/delivery/platform_watch` |

### Exit rules and app signals (offering.json / app-signals.js)

| Action | Item | Proposal |
|---|---|---|
| Change | **11.1** | Condition: "A required feature's minimum plan (question `shopify.native[].plan`) is above `/shopify/target_plan`." Inputs gain `/b2b/catalog_count`, `/b2b/company_specific_catalogs`, `/b2b/payment_terms`, `/b2b/contextual_experience`, `/catalogue/combined_listings`, `/meta/client/legal_entities`, `/markets/per_market_customisation`, `/payments/multi_currency_settlement`, `/shipping/rates`, `/shipping/fulfilment_locations`, `/customers/sign_in_methods`. Drop the blanket `/b2b/enabled`. Destination: "Confirm the required plan (Advanced or Plus) or remove the feature." |
| Change | **11.5** | Keep STOP for more than 3 options that **must be inventory-tracked variants**, and add ">2,048 variants". Destination: "Architecture review: Combined Listings (Plus), product-options app for non-stock options, or product split." |
| Add | **11.18 FLAG** | "Existing store uses retired or deprecated Shopify features (Scripts, checkout.liquid/additional scripts, script tags, legacy customer accounts, Stocky)." Destination: "Deprecation migration scoped as its own backlog epic." |
| Add | **11.19 FLAG** | "B2B requirement that Shopify B2B doesn't support (subscriptions, local delivery or pickup points, express checkouts, >500 line items)." Destination: "B2B architecture review (app or process change)." |
| Change | app signal `order_editing_app` | Fire on `order_editing = true`, or on `self_service = true` **and** cancellation must be instant or without approval (new field `/post_purchase/cancellations/auto_approve`). Don't fire on self-service cancellation alone. |
| Change | app signal `returns_platform` | Remove the B2B-returns reason. Treat `prepaid_label` as a reason only when a fulfilment location is **outside the US** or returns are international. Keep any-product exchanges, store-credit-first, carrier-scan refunds and volume. |
| Change | app signal `post_purchase_platform` | `delivery_estimates` is a reason only when no US fulfilment location is used or dates must appear on product pages. |
| Add | new app signals | `back_in_stock_app`, `pre_order_app`, `product_options_app`, `bundle_app` (mix-and-match or bundles with subscriptions), `subscriptions_app` (build-a-box, B2B, bundles, international under Managed Markets), `b2b_quote_app`, `loyalty_app`, `reviews_app`, `translation_app` (>2 auto-translated languages), `consent_app`, `fraud_guarantee_app`, `sms_app` (unsupported countries), `delivery_scheduling_app`, `tracking_app`, `wishlist_app`. Each carries an App Store category from the registry. |

---

## 4. App Store categories and apps referenced

**How apps were checked (2026-09-17):**
- **V:** the listing page was loaded; the name and developer were read from it, and it is not marked "not currently available".
- **S:** the listing appeared in apps.shopify.com search results only.
- **H:** the category URL is linked from a help.shopify.com page.

No prices are given. Include an app in the shortlist only when native Shopify is not enough (see the "Native first" column).

| Requirement (question) | Native first | App Store category | Apps (developer where shown) | Check |
|---|---|---|---|---|
| Returns and exchanges beyond native (Q5.2.x) | Return and cancellation rules; self-serve returns | Returns and exchanges: https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all | Loop Returns & Exchanges: https://apps.shopify.com/loop-returns · AfterShip Returns & Exchanges: https://apps.shopify.com/returns-center-by-aftership · Narvar Return and Exchange: https://apps.shopify.com/narvar-returns · Redo: https://apps.shopify.com/redo |V |
| Branded tracking and proactive delivery updates (Q5.5.1–2) | Order status page; shipping notifications (email/SMS) | Order tracking: https://apps.shopify.com/categories/orders-and-shipping-orders-order-tracking/all | AfterShip Order Tracking: https://apps.shopify.com/aftership · parcelLab Order Tracking: https://apps.shopify.com/parcellab-engage |V |
| Customer order editing and instant cancellation (Q5.4.2, Q5.4.5) | Staff order editing; customer cancellation requests | Order editing: https://apps.shopify.com/categories/orders-and-shipping-orders-order-editing/all | Revize: Order Editing & Upsell (Untechnickle): https://apps.shopify.com/revize · OrderEditing.com (Order Editing): https://apps.shopify.com/order-editing · Orderify ‑ Order Edit Cancel: https://apps.shopify.com/orderify · Cleverific AI Upsell & Editing: https://apps.shopify.com/edit-order (S) | V |
| Back-in-stock alerts (Q2.5.3) | None found (Flow for staff alerts) | Stock alerts: https://apps.shopify.com/categories/store-design-store-alerts-back-in-stock-alert | Amp Back in Stock & Preorder + (HEL SG): https://apps.shopify.com/back-in-stock · Notify Me! Back in Stock Alert: https://apps.shopify.com/preorder-back-in-stock · Appikon ‑ Back In Stock: https://apps.shopify.com/customer-back-in-stock-alert-user-notification-app | V |
| Pre-orders (Q2.2.5) | Selling plans API only (app required) | Pre-orders: https://apps.shopify.com/categories/selling-products-purchase-options-pre-orders | Preorder, Back In Stock ‑ STOQ (Artos Software): https://apps.shopify.com/back-in-stock-restock-alerts · Preorder Now Presale Timesact (Kairock Partners): https://apps.shopify.com/timesact-discount-pre-order | H (category) / V |
| Subscriptions beyond native (Q2.2.4) | Shopify Subscriptions: https://apps.shopify.com/shopify-subscriptions | Subscriptions: https://apps.shopify.com/categories/selling-products-payments-subscriptions | Recharge Subscriptions App: https://apps.shopify.com/subscription-payments · Skio, a Recharge Company: https://apps.shopify.com/skio · Loop Subscriptions App: https://apps.shopify.com/loop-subscriptions · Appstle℠ Subscriptions App: https://apps.shopify.com/subscriptions-by-appstle | V |
| Mix-and-match bundles (Q2.2.3) | Shopify Bundles (fixed, multipack): https://apps.shopify.com/shopify-bundles | Product bundles: https://apps.shopify.com/categories/marketing-and-conversion-upsell-and-bundles-product-bundles/all | FBP \| Fast Bundle & Upsell App: https://apps.shopify.com/fast-bundle-product-bundles · Bundler » Product Bundles App: https://apps.shopify.com/bundler-product-bundles · Easy Bundles: Bundle Builder: https://apps.shopify.com/bundle-builder (S) | V |
| Options beyond 3 / personalisation (Q2.1.2, Q2.1.5) | Combined Listings (Plus): https://apps.shopify.com/combined-listings | Custom products: https://apps.shopify.com/categories/selling-products-custom-products | Infinite Options (ShopPad): https://apps.shopify.com/custom-options · Globo Product Options, Variant: https://apps.shopify.com/product-options-pro · Easify Custom Product Options: https://apps.shopify.com/easify-product-options | V |
| Loyalty (Q6.3.1) | Store credit (reward currency) | Loyalty and rewards: https://apps.shopify.com/categories/marketing-and-conversion-customer-loyalty-loyalty-and-rewards/all | Smile: Loyalty Program Rewards: https://apps.shopify.com/smile-io · LoyaltyLion Loyalty Program: https://apps.shopify.com/loyaltylion · Yotpo: Loyalty Rewards Program: https://apps.shopify.com/swell · Rivo: Loyalty Program, Rewards: https://apps.shopify.com/rivo-loyalty | V |
| Product reviews (Q7.4.1) | None | Product reviews: https://apps.shopify.com/categories/marketing-and-conversion-social-trust-product-reviews/all | Judge.me Product Reviews App: https://apps.shopify.com/judgeme · Yotpo: Product Reviews App: https://apps.shopify.com/yotpo-social-reviews · Okendo: Reviews & Loyalty: https://apps.shopify.com/okendo-reviews · Stamped Reviews & Loyalty: https://apps.shopify.com/product-reviews-addon (Shopify's own Product Reviews app is no longer available) | V |
| Email/SMS marketing (Q7.3.1, Q7.3.4) | Shopify Messaging: https://apps.shopify.com/shopify-messaging | Email marketing: https://apps.shopify.com/categories/marketing-and-conversion-marketing-email-marketing · SMS marketing: https://apps.shopify.com/categories/marketing-and-conversion-marketing-sms-marketing/all | Klaviyo: Email Marketing & SMS: https://apps.shopify.com/klaviyo-email-marketing · Omnisend Email Marketing & SMS: https://apps.shopify.com/omnisend · Attentive: https://apps.shopify.com/attentive · Postscript SMS Marketing: https://apps.shopify.com/postscript-sms-marketing | V |
| Translation beyond 2 auto languages (Q3.2.1, Q3.2.4) | Translate & Adapt: https://apps.shopify.com/translate-and-adapt | Internationalization: https://apps.shopify.com/categories/store-design-internationalization | Weglot: AI Translation & SEO: https://apps.shopify.com/weglot · langify: https://apps.shopify.com/langify · Transcy (FireGroup): https://apps.shopify.com/transcy-multiple-languages | V |
| Search and filters beyond native (Q2.3.5) | Shopify Search & Discovery: https://apps.shopify.com/search-and-discovery | Search and filters (Internationalization/merchandising listings) | Algolia AI Search & Discovery: https://apps.shopify.com/algolia-search · Boost AI Search & Filter: https://apps.shopify.com/product-filter-search · Searchanise Search & Filter: https://apps.shopify.com/searchanise · Klevu ‑ AI Search & Discovery: https://apps.shopify.com/klevu-smart-search | V (category URL not captured) |
| Cookie consent / CMP (Q6.4.2) | Shopify cookie banner (Customer privacy settings) | Cookie consent: https://apps.shopify.com/categories/store-design-internationalization-cookie-consent/all | Pandectes GDPR Compliance: https://apps.shopify.com/gdpr-cookie-consent · Consentmo GDPR Compliance: https://apps.shopify.com/gdpr-backpack · Cookiebot CMP (Usercentrics): https://apps.shopify.com/cookiebot-cmp-gdpr-compliance | V |
| B2B beyond native, quotes (Q6.2.6, Q6.2.8) | Shopify B2B (all plans; Plus extras); draft-order review | Wholesale: https://apps.shopify.com/categories/finding-products-sourcing-options-wholesale/all · Pricing quotes: https://apps.shopify.com/categories/selling-products-pricing-pricing-quotes/all | SparkLayer B2B & Wholesale: https://apps.shopify.com/sparklayer · BSS B2B Wholesale Pricing: https://apps.shopify.com/b2b-solution-custom-pricing · Wholesale Pricing Discount B2B: https://apps.shopify.com/wholesale-pricing-discount · QS Request a Quote, Hide Price (Quote Snap): https://apps.shopify.com/request-for-quote-by-omega · SP Request a Quote (RFQ): https://apps.shopify.com/mp-request-a-quote-rfq (S) | V |
| Checkout blocks, validation, order limits (Q4.2.2, Q4.3.2) | Checkout and accounts editor | Checkout: https://apps.shopify.com/categories/marketing-and-conversion-checkout | Shopify Checkout Blocks (Shopify): https://apps.shopify.com/checkout-blocks | S |
| Upsell (Q4.2.4) | Thank you page extensions | Upsell and bundles: https://apps.shopify.com/categories/marketing-and-conversion-upsell-and-bundles | Upsell.com ‑ ReConvert Upsell: https://apps.shopify.com/reconvert-upsell-cross-sell · Aftersell Post Purchase Upsell (Rokt): https://apps.shopify.com/aftersell | V |
| Fraud guarantee (Q4.3.3) | Fraud analysis; Shopify Fraud Control: https://apps.shopify.com/fraud-control; Shopify Protect (US) | Fraud: https://apps.shopify.com/categories/store-management-security-fraud/all | Signifyd: https://apps.shopify.com/signifyd · Riskified: https://apps.shopify.com/riskified · Wyllo (formerly NoFraud listing): https://apps.shopify.com/nofraud-chargeback-prevention-and-protection | V |
| Duties outside native / MoR alternative (Q3.1.6) | Duties at checkout; Managed Markets | (Cross-border / taxes) | Zonos Duty and Tax: https://apps.shopify.com/duty-and-tax-calculator-iglobal-stores · ESW International: https://apps.shopify.com/esw-international · Tax: TaxJar Sales Tax Automation (US): https://apps.shopify.com/taxjar | V |
| Delivery slots, pickup scheduling, delivery dates (Q5.1.11, Q5.5.3) | Local delivery, pickup in store, manual delivery dates | Delivery and pickup: https://apps.shopify.com/categories/orders-and-shipping-shipping-solutions-delivery-and-pickup/all | Zapiet ‑ Pickup + Delivery: https://apps.shopify.com/click-and-collect · Estimated Delivery Date ‑ ETA (SetuBridge): https://apps.shopify.com/estimated-delivery-days · Essent Estimated Delivery Date: https://apps.shopify.com/essential-estimated-delivery | V |
| Wishlist (Q6.1.3) | None | Wishlists: https://apps.shopify.com/categories/marketing-and-conversion-customer-loyalty-wishlists/all | Swym Wishlist Plus: https://apps.shopify.com/swym-relay · Swish (formerly Wishlist King): https://apps.shopify.com/wishlist-king | V |
| Gift card and store credit programmes (Q7.6.x) | Native gift cards and store credit | (Loyalty / gift cards) | Rise Gift Cards & Store Credit: https://apps.shopify.com/gift-card-loyalty-program · Gift Card Hero (Syncube): https://apps.shopify.com/gift-card-hero | V |
| Server-side tracking (Q7.2.2) | Customer events (web pixels); Google & YouTube: https://apps.shopify.com/google; Facebook & Instagram (Conversions API): https://apps.shopify.com/facebook | (Analytics) | Elevar Conversion Tracking: https://apps.shopify.com/gtm-datalayer-by-elevar · Littledata ‑ The Data Layer: https://apps.shopify.com/littledata | V |
| A/B testing beyond Rollouts (Q9.2.10) | Rollouts (Grow+) | (CRO / A/B testing) | Shoplift ‑ CRO & A/B Testing: https://apps.shopify.com/shoplift | S |
| Migration (Q8.2.x) | Shopify Store Migration: https://apps.shopify.com/store-migration | Store data importer: https://apps.shopify.com/categories/sales-channels-selling-online-store-data-importer/all | Matrixify (ITissible): https://apps.shopify.com/excel-export-import | V |
| Warranty claims (Q5.5.4) and shipping protection | None | Returns and warranty: https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty | Extend Shopper Operations: https://apps.shopify.com/extend-protection · Clyde \| Warranty Platform (Cover Genius): https://apps.shopify.com/clyde-warranty-platform · Route ‑ Protection & Tracking: https://apps.shopify.com/route | V |
| Age verification (Q10.4.1) | None (alcohol requires age verification practices) | (Age verification) | Age Verifier by OTG: https://apps.shopify.com/age-verification · SB Age Verification Popup 18+: https://apps.shopify.com/age-verification-popup · AgeX ‑ Age Verification Popup: https://apps.shopify.com/agex-age-verification-popup | V |
| ERP connection (Q8.1.1) | Admin API / bulk operations | ERP: https://apps.shopify.com/categories/orders-and-shipping-inventory-erp/all | (no vendor named, per owner rule) | V (category) |

**Checked but excluded:**
- **Not currently available on the App Store:** Rebuy Personalization Engine, Shopify's Product Reviews, PreOrder Now WOD, SB: Back in stock.
- **No listing found:** Global-e (its developer page shows 0 apps; reach it through native Managed Markets), Avalara AvaTax (developer page shows 0 apps; only "Extractor for Avalara", a returns-filing export), Vertex tax, OneTrust, XCover, Bold Product Options, and a Narvar tracking app.
- **Misleading slugs:** `apps.shopify.com/zapiet-pickup-delivery` belongs to an unrelated developer (Zapiet is `/click-and-collect`), and `apps.shopify.com/vertex` is an AI image app, not the tax company.
- **Renames to reflect in the registry:**
  - Shopify Email is now Shopify Messaging.
  - ReConvert is now Upsell.com.
  - Wishlist King is now Swish.
  - The NoFraud listing is now Wyllo.
  - Aftersell is listed under Rokt.

---

## 5. Structural proposal: Shopify knowledge per question

### 5.1 A `shopify` block on every question (question-bank 1.1.0)

Add one optional, validated block to each question in `schema/question-bank.json`. It says which part of Shopify answers the question, on which plan, and where that is documented:

```json
{
  "id": "Q6.2.1",
  "text": "Do you sell to business customers (B2B / wholesale)?",
  "shopify": {
    "native": [
      { "feature": "Shopify B2B (companies, catalogs, payment terms, quantity rules)",
        "plan": "basic",
        "plan_note": "Up to 3 active B2B catalogs below Plus; unlimited catalogs and direct company catalogs need Plus",
        "docs": "https://help.shopify.com/en/manual/b2b/getting-started/plan-features" }
    ],
    "app_category": { "name": "B2B & wholesale", "url": "https://apps.shopify.com/categories/..." },
    "apps": ["b2b-wholesale-solution", "sparklayer"],
    "extension_points": ["Payment Customization Function (B2B order review rules, Plus)"],
    "verified": { "on": "2026-09-17", "source": "help.shopify.com", "edition": "Spring '26" }
  }
}
```

The fields:

| Field | Type | Purpose |
|---|---|---|
| `native[].feature` | string | Shopify's own feature name, exactly as the help center writes it (e.g. "Return and cancellation rules", "Combined listings") |
| `native[].plan` | `shopify_plan` enum (the same `$def` as the engagement schema) | Lowest plan that has the feature. The engine can then derive exit 11.1 from data instead of prose |
| `native[].plan_note` | string | A limit or restriction in one sentence (catalog caps, POS Pro, region) |
| `native[].docs` | URL (must be help.shopify.com, shopify.dev or shopify.com) | Traceability |
| `app_category` | `{name, url}` | App Store category, used when native is not enough |
| `apps` | array of app handles (the apps.shopify.com slug) | Shortlist seeds. They point to a single `schema/apps.json` registry (name, developer, URL, category, last_checked), so an app is described once |
| `extension_points` | string[] | Functions, UI extension targets or APIs that a custom build would use |
| `verified` | `{on, source, edition}` | When the entry was last checked against Shopify, and against which Edition |

The rendering, and how the engine uses it:

- `render-questionnaire.js` adds one line under the help text. Example: *Shopify: B2B (Basic+; 3 catalogs below Plus) · docs · if not native: B2B & wholesale apps*. Consultant-audience questions show the full block; the client version shows the feature name and plan only.
- The interview skill shows the same line after the question, so the consultant can steer the client to the native feature while talking.
- `approach.js` and `app-signals.js` take the shortlist from `shopify.apps` and `schema/apps.json`, not from prose. This removes the app names that are hard-coded in section intros and help texts (e.g. "Loop, AfterShip, parcelLab, Narvar").
- Exit rule 11.1 becomes data-driven. It fires when any active requirement's `native[].plan` is above `/shopify/target_plan`. This fixes the B2B error (section 2) permanently and catches new plan-gated features (combined listings, multi-entity, Checkout Branding API, retail market catalogs).

### 5.2 Enum options that mirror Shopify's feature names

- Add an optional `x-shopify` annotation on enum values in `engagement.schema.json`, e.g. `"x-shopify": {"extensibility": "Checkout UI extensions (Plus for Information/Shipping/Payment)"}`. The renderer then shows "Checkout UI extensions" rather than "extensibility".
- Use Shopify's names for new values: "Return and cancellation rules", "Self-serve returns", "Local pickup", "Local delivery", "Carrier-calculated shipping", "Catalogs", "Quantity rules", "Market-specific pricing", "Combined listings", "Shopify Bundles", "Shopify Subscriptions", "Store credit", "Shopify Messaging", "Customer privacy (cookie banner)".
- Every multi_enum or list question with "which X" gets an explicit **`none`** option (and `not_sure` where the client cannot know). The engine must be able to tell "no requirement" apart from "not answered". This is one of the known gaps and is confirmed here: Q2.2.1, Q4.1.2, Q4.1.3, Q6.3.1, Q7.2.3, Q7.5.1, Q8.2.2 and Q9.2.4 have no way to record "none".

### 5.3 Keeping it current

1. **A test that runs on every commit** (`tests/unit/question-bank-shopify.test.js`):
   - every `required` question and every question with `feeds` has a `shopify` block
   - `docs` URLs are on an allow-listed Shopify domain
   - `plan` is a valid `shopify_plan`
   - every `apps` handle exists in `schema/apps.json`
   - fail when `verified.on` is older than 200 days, which is roughly one Editions cycle plus a buffer
2. **A release check at each Shopify Edition** (winter, spring and summer; Spring '26 was published in 2026). This is a Track C methodology task owned by the Architect:
   - `npm run shopify:verify` lists every `docs` URL and app URL.
   - It runs a HEAD/GET check for 404s and redirects. An app that is delisted or renamed fails.
   - For the content check, the Shopify AI Toolkit plugin (the `shopify-dev` doc search skill in Claude Code) or the Shopify Dev MCP answers each `native[].feature` and `plan_note` against current docs. The output is a diff report in `docs/discovery/shopify-verification-<edition>.md`.
   - The consultant approves the changes, bumps `verified.on`, and increments the question-bank minor version. The rendered questionnaire header already shows that version.
3. **Changelog watch:** subscribe to changelog.shopify.com and shopify.dev/changelog. Tag entries with "plan", "deprecat", "B2B", "Markets", "checkout", "returns", "POS" or "customer accounts" as intake items under `_intake/`.
4. **An owner per section:** the Architect owns §§ 3, 4 and 9; the BA owns §§ 2, 5 and 6; the XD owns § 9 design. The owner signs off the Edition diff for their section.
5. **Pricing hygiene:** the `shopify` block never holds prices or fees. Add a test that fails on currency symbols or "%" inside `shopify.*`, so internal pricing rules stay intact.

---

## 6. Open questions for the owner

| # | Question | Why it needs a decision |
|---|---|---|
| O1 | **Plus as the baseline:** do S and M still "assume Shopify Plus" now that B2B, duties, Flow, Functions via public apps and Thank you page extensions work below Plus? Should there be an Advanced-plan variant? | 11.1 today stops non-Plus clients who may be fully served on Advanced. This is a commercial choice, not a platform limit. |
| O2 | **11.2 (RFQ / negotiated pricing):** keep it as a STOP, or make it a FLAG routed to "Shopify B2B + quote app / draft-order review"? | Native draft review plus quote apps now cover many RFQ flows. Rule-based order review (Payment Customization Function) is Plus. |
| O3 | **11.3 / 11.4 thresholds** (>5 markets, >6 languages): keep them as Merkle scope rules? Add Shopify's hard limits as separate checks (languages >20 below Plus, >30 on Plus; >2 auto-translated languages → translation app)? | Keeps "our scope rule" and "platform limit" apart in the deck. |
| O4 | **11.5:** keep it as a STOP, or make it a FLAG now that Combined Listings (Plus) and option apps cover most >3-option cases? | Reduces false STOPs on apparel and furniture catalogues. |
| O5 | **Retail & POS:** should POS with omnichannel services (POS Pro) become a **scope gate** (+Retail), or be counted under the integration gate only when a non-Shopify POS is connected? | POS is not in the offer model today. |
| O6 | **Managed Markets:** should choosing Shopify as merchant of record reduce the Markets gate effort, and should its incompatibilities (B2B, international subscriptions, multi-entity) raise a FLAG? | It changes tax, duties and fraud scope materially. |
| O7 | **Plan information in the client questionnaire:** show plan requirements ("needs Plus") to clients, or only in the consultant view and interview? | Transparency vs steering the plan conversation. |
| O8 | **App registry governance:** who approves apps in `schema/apps.json` (partner relationships, security review of app data access under the PII gate), and how often? | The shortlist becomes data the engine recommends. |
| O9 | **Deprecation FLAG 11.18:** is it a FLAG or a WARN (commercial adjustment)? | Scripts → Functions and legacy accounts → customer accounts are real effort on rebuilds. |
| O10 | **Summer '26:** no official Edition page exists yet (the latest is Spring '26). Should the next verification run be tied to its publication? | Several Winter '26 / Spring '26 features may change plan tags. |

---

## 7. Sources

All sources are official Shopify pages, accessed 2026-09-17.

**Plans and Editions**
- https://www.shopify.com/pricing
- https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features
- https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-plus-plan
- https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-advanced-plan
- https://shopify.dev/changelog/adding-publicdisplayname-field-on-shopplan
- https://help.shopify.com/en/manual/your-account/users/users-plan-requirements
- https://www.shopify.com/editions
- https://www.shopify.com/editions/summer2025
- https://www.shopify.com/editions/winter2026
- https://www.shopify.com/editions/spring2026

**B2B**
- https://changelog.shopify.com/posts/key-b2b-features-now-available-on-non-plus-plans
- https://help.shopify.com/en/manual/b2b/getting-started/plan-features
- https://help.shopify.com/en/manual/b2b/getting-started/store-type
- https://help.shopify.com/en/manual/b2b/getting-started/considerations
- https://help.shopify.com/en/manual/b2b/checkout-and-orders/checkout-settings
- https://changelog.shopify.com/posts/control-when-b2b-orders-require-review-at-checkout

**Checkout, Functions, discounts, Scripts**
- https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility
- https://help.shopify.com/en/manual/checkout-settings/checkout-extensibility/checkout-upgrade
- https://shopify.dev/docs/api/checkout-ui-extensions
- https://shopify.dev/docs/apps/build/checkout/styling
- https://shopify.dev/docs/api/functions
- https://shopify.dev/docs/api/functions/latest/discount
- https://shopify.dev/docs/api/functions/latest/cart-transform
- https://shopify.dev/docs/apps/build/checkout/product-offers/build-a-post-purchase-offer
- https://shopify.dev/changelog/checkout-liquid-will-no-longer-work-for-in-checkout-pages-starting-august-13-2024
- https://shopify.dev/docs/storefronts/themes/architecture/layouts/checkout-liquid
- https://help.shopify.com/en/manual/discounts/discount-combinations
- https://help.shopify.com/en/manual/discounts/discount-types/free-shipping
- https://changelog.shopify.com/posts/shopify-scripts-can-no-longer-be-edited-or-published
- https://shopify.dev/changelog/shopify-scripts-will-be-deprecated-on-june-30-2026
- https://shopify.dev/docs/apps/build/functions/migrating-from-shopify-scripts
- https://shopify.dev/changelog/online-store-script-tags-deprecation

**Catalogue**
- https://help.shopify.com/en/manual/products/variants/add-variants
- https://shopify.dev/changelog/the-product-variant-limit-is-now-2048-for-all-merchants
- https://help.shopify.com/en/manual/products/combined-listings-app
- https://help.shopify.com/en/manual/products/product-media/add-media
- https://shopify.dev/docs/apps/build/metafields/metafield-limits
- https://shopify.dev/docs/apps/build/metaobjects/metaobject-limits
- https://shopify.dev/changelog/increased-limits-for-metafields-and-metaobjects
- https://help.shopify.com/en/manual/products/details/product-category
- https://help.shopify.com/en/manual/products/bundles/shopify-bundles
- https://help.shopify.com/en/manual/products/bundles/eligibility-and-considerations
- https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions
- https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions/considerations
- https://help.shopify.com/en/manual/products/purchase-options/pre-orders
- https://help.shopify.com/en/manual/products/purchase-options/pre-orders/setup
- https://help.shopify.com/en/manual/products/inventory/fundamentals/inventory-states
- https://help.shopify.com/en/manual/products/inventory/setup/selling-when-out-of-stock
- https://help.shopify.com/en/manual/products/inventory/transitioning-from-stocky
- https://help.shopify.com/en/manual/products/inventory/purchase-orders
- https://help.shopify.com/en/manual/products/inventory/inventory-transfers

**Markets, tax, duties, translation**
- https://help.shopify.com/en/manual/markets/getting-started/market-types
- https://shopify.dev/docs/apps/build/markets/new-markets/market-types
- https://help.shopify.com/en/manual/markets/getting-started/managing-markets
- https://changelog.shopify.com/posts/new-version-of-markets-now-available
- https://changelog.shopify.com/posts/retail-markets-are-now-available
- https://help.shopify.com/en/manual/markets/pricing
- https://help.shopify.com/en/manual/markets/customizations/catalogs
- https://help.shopify.com/en/manual/markets/customizations/domains-and-languages
- https://help.shopify.com/en/manual/online-store/themes/customizing-themes-for-markets
- https://help.shopify.com/en/manual/international
- https://help.shopify.com/en/manual/international/languages
- https://help.shopify.com/en/manual/international/localization-and-translation
- https://help.shopify.com/en/manual/international/translate-adapt-app
- https://help.shopify.com/en/manual/international/geolocation
- https://help.shopify.com/en/manual/international/automatic-redirection
- https://help.shopify.com/en/manual/organization-settings/expansion-stores
- https://help.shopify.com/en/manual/payments/shopify-payments/onboarding/selling-with-multiple-entities
- https://help.shopify.com/en/manual/international/managed-markets/overview
- https://help.shopify.com/en/manual/international/managed-markets/requirements-and-considerations
- https://help.shopify.com/en/manual/international/duties-and-import-taxes
- https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties
- https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations
- https://help.shopify.com/en/manual/international/tax-inclusive
- https://help.shopify.com/en/manual/international/pricing/dynamic-tax-inclusive-pricing
- https://help.shopify.com/en/manual/taxes/shopify-tax
- https://help.shopify.com/en/manual/taxes/shopify-tax/choose-tax-service

**Payments and fraud**
- https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries
- https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods
- https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/payouts-in-multiple-currencies
- https://help.shopify.com/en/manual/payments/shop-pay-installments/eligibility
- https://help.shopify.com/en/manual/international/payments
- https://help.shopify.com/en/manual/payments/shop-pay/shopify-protect/protect-order-with-shopify-protect
- https://help.shopify.com/en/manual/fulfillment/managing-orders/protecting-orders/fraud-analysis
- https://help.shopify.com/en/manual/payments/fraud-prevention/fraud-control-app

**Shipping, fulfilment, returns, POS**
- https://help.shopify.com/en/manual/fulfillment/setup/locations/setup
- https://help.shopify.com/en/manual/fulfillment/setup/order-routing/understanding-order-routing
- https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/setting-up-shipping-rates
- https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/third-party-carrier-calculated-shipping
- https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/setup
- https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/local-delivery
- https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/pickup-in-store
- https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview
- https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns
- https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns/setup
- https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules
- https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/creating-returns
- https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/return-labels
- https://help.shopify.com/en/manual/fulfillment/managing-orders/editing-orders
- https://help.shopify.com/en/manual/fulfillment/managing-orders/editing-orders/considerations
- https://help.shopify.com/en/manual/sell-in-person/getting-started/identify-your-pos-needs

**Customers, marketing, privacy**
- https://shopify.dev/changelog/legacy-customer-accounts-are-deprecated
- https://changelog.shopify.com/posts/new-customer-accounts-is-now-customer-accounts
- https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features
- https://help.shopify.com/en/manual/customers/store-credit
- https://help.shopify.com/en/manual/products/gift-card-products/overview
- https://help.shopify.com/en/manual/products/gift-card-products/modify-gift-card-settings
- https://help.shopify.com/en/manual/shopify-flow
- https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-modify-search
- https://help.shopify.com/en/manual/online-store/search-and-discovery/filters
- https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-recommendations
- https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging
- https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/sms/requirements
- https://help.shopify.com/en/manual/promoting-marketing/shopify-audiences
- https://help.shopify.com/en/manual/promoting-marketing/collabs
- https://help.shopify.com/en/manual/online-sales-channels/shopify-collective/retailers/requirements-and-considerations
- https://help.shopify.com/en/manual/markets/rollouts
- https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/privacy-settings
- https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/understanding-customer-privacy-settings
- https://help.shopify.com/en/manual/privacy-and-security/privacy/processing-customer-data-requests
- https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance
- https://www.shopify.com/accessibility
- https://help.shopify.com/en/manual/compliance/legal/alcohol

**Headless, themes, channels and migration**
- https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals
- https://shopify.dev/docs/storefronts/headless/hydrogen/environments
- https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels
- https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/hydrogen
- https://shopify.dev/docs/storefronts/headless/hydrogen/markets
- https://help.shopify.com/en/manual/online-store/themes/managing-themes/versions
- https://help.shopify.com/en/manual/online-store/themes/adding-themes
- https://help.shopify.com/en/manual/promoting-marketing/pixels/overview
- https://help.shopify.com/en/manual/promoting-marketing/analyze-marketing/meta-data-sharing
- https://help.shopify.com/en/manual/reports-and-analytics/google-analytics/google-analytics-setup
- https://help.shopify.com/en/manual/online-sales-channels/marketplace-connect
- https://help.shopify.com/en/manual/sell-in-person/hardware/getting-started
- https://help.shopify.com/en/manual/sell-in-person/shopify-pos/faq
- https://shopify.dev/docs/apps/build/pos
- https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api
- https://shopify.dev/docs/storefronts/headless/hydrogen/analytics/consent
- https://help.shopify.com/en/manual/migrating-to-shopify
- https://apps.shopify.com/store-migration

**App Store:** see the category and app URLs in section 4.

### Claims not verified from an official source (flagged in the text)

- A Summer '26 Edition: no official page exists; the latest is Spring '26.
- Whether stacking multiple product discounts on the **same line item** is still Plus-only after Spring '26.
- Refunds to a gift card as a native refund method.
- Prepaid subscriptions in Shopify Subscriptions.
- Native back-in-stock alerts: none found, so treated as app-only.
- Native customer self-editing of orders: none found, so treated as app-only.
- Fixed Shopify URL prefixes (/products/, /collections/): not re-checked in this review.
- B2B tax exemption per company location: not checked.
- Plan tags in Edition summaries (e.g. identity-provider sync, Markets for B2B): read from Edition summaries. Recheck on the feature page before quoting to a client.
- App listings marked S in section 4 (Checkout Blocks, Shoplift, Cleverific, Easy Bundles, SP Request a Quote) were seen only in search results. All others were loaded and checked.
- Server pixels (server-side Customer events), the plan availability of ShopifyQL, the maximum number of Hydrogen storefronts, and whether inventory counts are a POS Pro-only feature.
