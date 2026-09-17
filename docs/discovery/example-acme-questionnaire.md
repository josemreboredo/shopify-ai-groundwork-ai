<!-- Example — filled questionnaire for the fictional client ACME Watches SA. Consistent with tests/fixtures/engagements/acme-watches.json. -->

# Shopify Discovery Questionnaire — ACME Watches SA

> **Client:** ACME Watches SA · **Date:** 2026-09-10 · **Consultant:** Lead Consultant (example)
>
> **Version:** question bank 1.1.0 · offering 1.2.0
>
> **Example:** every client, answer and figure in this file is fictional. "TBC" marks answers still open after the call.

---

## § 0 — Business outcomes

> What is broken before what to build. This section is the primary brief: every capability we scope must trace back to an answer here.

### 0.1 The core problem

**Q0.1.1** — What is the single biggest thing preventing your ecommerce from growing right now? *(required)*

> Answer: Mobile conversion is 40% below desktop and checkout abandonment is 68%.

**Q0.1.2** — How long has this been a problem, and what have you already tried to fix it? *(recommended)*

> Answer: A problem for 18 months. Product pages were redesigned and trust badges added, with no measurable improvement.

**Q0.1.3** — If we solved only one thing in this engagement, what would have the highest business impact? *(recommended)*

> Answer: A fast, mobile-first storefront with a simpler product navigation and a standard Shopify checkout.

### 0.2 Revenue & conversion

**Q0.2.1** — What is your current monthly ecommerce revenue (range and currency)? *(recommended)*

- min: 110,000
- max: 130,000
- currency: EUR

**Q0.2.2** — What is your current conversion rate (%)? *(recommended)*

> Answer: 1.2

**Q0.2.3** — Which product categories, markets or customer segments under-perform? *(optional)*

> Answer: Mobile sessions (0.7% conversion); Watches above EUR 500 convert at half the rate of watches below EUR 200

**Q0.2.4** — Is the main bottleneck acquisition (traffic), conversion (traffic doesn't buy) or retention (customers don't return)? *(recommended)*

*(tick one)*
- [ ] acquisition
- [x] conversion
- [ ] retention
- [ ] mixed
- [ ] unknown

**Q0.2.5** — What share of revenue comes from each channel today (online store, retail stores, marketplaces, social commerce, wholesale / B2B, other)? *(recommended)*
*Tells us whether retail, B2B and marketplace scope are in play.*

| channel | share pct | growth |
|---|---|---|
| | | |

### 0.3 Operational pain

**Q0.3.1** — What manual work does your team do today that the platform should automate, and which processes break most often? *(recommended)*

> Answer: Inventory and prices are synced manually with the ERP twice a day; Refunds and exchanges are tracked in spreadsheets

**Q0.3.2** — How many hours per week does the team spend on workarounds? *(optional)*

> Answer: 8

### 0.4 Growth goals & KPIs

**Q0.4.1** — What does success look like in 12 months (revenue, new markets, channels, customer volume)? *(required)*

> Answer: EUR 2M annual online revenue; CH, DE and AT live with local pricing and languages; B2B wholesale channel with 500 retailer accounts

**Q0.4.2** — Which KPIs will measure success? For each: metric, today's baseline, target, horizon in months. *(required)*

| metric | baseline | target | horizon months |
|---|---|---|---|
| Mobile conversion rate | 0.7% | 1.2% | 12 |
| Checkout abandonment | 68% | 55% | 6 |
| Annual online revenue | EUR 1.44M | EUR 2.0M | 12 |

### 0.5 Platform context

**Q0.5.1** — What triggered this engagement — why Shopify, and why now? *(recommended)*

> Answer: WooCommerce cannot keep up on performance or scale, has no native multi-currency, and the wholesale channel needs B2B before the spring collection.

**Q0.5.2** — If you are moving from another platform, what must not be lost in the transition? *(recommended)*

> Answer: 4,200 indexed product and category URLs; Customer accounts; Order history

**Q0.5.3** — What are you most unhappy with in the current store or set-up? *(recommended)*

> Answer: Slow page speed; No multi-currency; Admin UX

### 0.6 Budget

**Q0.6.1** — What is the approximate budget envelope for this project (range and currency)? *(required)*

- min: 60,000
- max: 80,000
- currency: EUR

**Q0.6.2** — Is the priority to minimise upfront cost (apps and configuration), to own the solution (custom build), or a balance? *(recommended)*

*(tick one)*
- [x] minimise upfront
- [ ] own solution
- [ ] balanced

**Q0.6.3** — Is there a monthly ceiling for app subscriptions? *(optional)*
*Many needs are covered by Shopify's own apps (e.g. Subscriptions, Bundles, Search & Discovery, Translate & Adapt, Flow, Messaging). We check those first.*

> Answer: 500 EUR per month

---

## § 1 — Company, brand & Shopify

> Store setup, Shopify plan, brand positioning and assets.

### 1.1 Company identity

**Q1.1.1** — Trading name and legal entity name (if different). *(required)*

- name: ACME Watches
- legal name: ACME Watches SA

**Q1.1.2** — Country of incorporation / headquarters. *(required)*

> Answer: CH

**Q1.1.3** — Industry and product vertical. *(required)*

> Answer: Premium watches and accessories

**Q1.1.4** — Is the business direct-to-consumer, B2B, or hybrid? *(required)*

*(tick one)*
- [ ] dtc
- [ ] b2b
- [x] hybrid

**Q1.1.5** — Current website URL. *(optional)*

> Answer: https://www.acme-watches.example

**Q1.1.6** — Do you sell through more than one legal entity (e.g. one per country or region)? List them. *(recommended)*
*Several selling entities in one store, or one store per entity, changes the store set-up.*

> Answer:

**Q1.1.7** — Where will you sell at launch? *(required)*
*Online store, Shopify POS, Shop app, marketplaces, social channels, B2B, headless or app front ends, AI shopping agents.*

*(tick all that apply)*
- [ ] online store
- [ ] shopify pos
- [ ] shop app
- [ ] marketplaces
- [ ] facebook instagram
- [ ] google youtube
- [ ] tiktok
- [ ] b2b online
- [ ] headless or mobile app
- [ ] ai agents
- [ ] none other

### 1.2 Shopify account

**Q1.2.1** — Is there an existing Shopify store? *(required)*

- [ ] Yes
- [x] No

**Q1.2.2** — Existing store URL, current Shopify plan and current theme. *(recommended)*
*Skip if Q1.2.1 = no.*

- store url:
- current plan:
- current theme:

**Q1.2.3** — Which Shopify plan will the new store run on (if already decided)? *(required)*
*We recommend the plan once the requirements are known.*

*(tick one)*
- [ ] none
- [ ] starter
- [ ] basic
- [ ] grow
- [ ] advanced
- [x] plus
- [ ] enterprise
- [ ] retail

**Q1.2.4** — Which apps are installed today, what do they do, and which must stay? *(recommended)*
*Skip if Q1.2.1 = no.*

| app | purpose | decision |
|---|---|---|
| | | |

**Q1.2.5** — Existing store audit: which retired or deprecated Shopify features does it still use? *(required · consultant)*
*Skip if Q1.2.1 = no.*
*Shopify Scripts stopped running on 2026-06-30; checkout.liquid and additional scripts are retired; online store script tags stop on 2027-03-01; legacy customer accounts are deprecated; Stocky is retired; the Geolocation app is retired.*

*(tick all that apply)*
- [ ] shopify scripts
- [ ] checkout liquid or additional scripts
- [ ] online store script tags
- [ ] legacy customer accounts
- [ ] stocky
- [ ] geolocation app
- [ ] none

**Q1.2.6** — How many people need their own Shopify admin login after go-live? List their roles. *(recommended)*
*Collaborator accounts and POS-only staff are not counted.*

> Answer:

### 1.3 Brand & positioning

**Q1.3.1** — How is the brand positioned (value, mid-market, premium, luxury, enterprise)? *(required · consultant)*
*Luxury or enterprise positioning routes the engagement to the Growth (L) offer.*

*(tick one)*
- [ ] value
- [ ] mid market
- [x] premium
- [ ] luxury
- [ ] enterprise

**Q1.3.2** — Is the brand identity finalised (logo, colour palette, typography)? *(recommended)*

- [x] Yes
- [ ] No

**Q1.3.3** — In which formats are brand assets available (SVG, PNG, Figma, guidelines PDF)? *(optional)*
*Skip if Q1.3.2 = no.*

> Answer: SVG; PNG; Figma; Guidelines PDF

**Q1.3.4** — Are there strict brand guidelines that must be followed? *(recommended)*

- [x] Yes
- [ ] No

**Q1.3.5** — What differentiates the brand — price, quality, exclusivity, community, sustainability? *(optional)*

> Answer: Mechanical movements assembled in-house; Build quality; Heritage design language

### 1.4 Competitive context

**Q1.4.1** — Who are your top three online competitors? *(optional)*

> Answer: Competitor A (Swiss premium DTC watch brand); Competitor B (German premium watch brand); Competitor C (Nordic minimalist watch brand)

**Q1.4.2** — Which stores (competitor or not) have a UX you want to reference? *(optional)*

> Answer: Competitor A product detail page; A premium outdoor apparel store (navigation and filters)

---

## § 2 — Catalogue & products

> Product model, variants, metafields, pricing and inventory.

### 2.1 Catalogue size & variants

**Q2.1.1** — How many active SKUs are in the catalogue (approximate)? *(required)*

> Answer: 800

**Q2.1.2** — What is the maximum number of variant options on a product (e.g. size, colour, material = 3)? *(required)*
*Shopify allows up to 3 options per product. More options need a product model review (11.5).*

> Answer: 2 (case size, strap)

**Q2.1.3** — What is the maximum number of variants on a single product? *(recommended)*
*Shopify allows up to 2,048 variants per product.*

> Answer: 12

**Q2.1.4** — Are variants such as colours managed as separate products (own SKUs, images, URLs) that should appear as one product on the storefront? *(recommended)*
*This is what Shopify calls combined listings.*

- [ ] Yes
- [ ] No

**Q2.1.5** — Do customers personalise products with choices that are not stock variants (engraving, file upload, paid add-ons, configurators)? *(recommended)*

*(tick all that apply)*
- [ ] text engraving
- [ ] file upload
- [ ] paid add ons
- [ ] conditional options
- [ ] configurator 3d
- [ ] none

### 2.2 Product types

**Q2.2.1** — Which product types exist in the catalogue? *(required)*
*Shopify Bundles creates fixed bundles and multipacks; mix-and-match bundles need an app.*

*(tick all that apply)*
- [x] simple
- [x] variant
- [ ] fixed bundle
- [ ] multipack
- [ ] mix and match bundle
- [ ] bundle
- [ ] product set
- [ ] gift card
- [ ] digital
- [ ] subscription
- [ ] pre order
- [ ] made to order
- [ ] virtual
- [ ] try before you buy
- [ ] none of these

**Q2.2.2** — Will subscriptions run on Shopify Subscriptions (Shopify's app) or a third-party subscription app? Name the app if known. *(recommended)*
*Skip if Q2.2.1 does not include subscription.*
*Shopify Subscriptions: customers skip, pause and cancel in their account; not with bundles or B2B.*

- approach:
- subscription app:

**Q2.2.3** — If you sell bundles: what must they do? *(recommended)*
*Shopify Bundles: up to 30 components; not with subscriptions or pre-orders; no nested bundles.*

*(tick all that apply)*
- [ ] fixed price bundle
- [ ] multipack
- [ ] customer builds bundle
- [ ] bundle with subscription
- [ ] bundle discount tiers
- [ ] sell bundles on pos
- [ ] bundles on marketplaces

**Q2.2.4** — Which subscription features are needed? *(recommended)*
*Skip if Q2.2.1 does not include subscription.*

*(tick all that apply)*
- [ ] pay per delivery
- [ ] prepaid multi delivery
- [ ] build a box
- [ ] subscribe and save discount
- [ ] subscription bundles
- [ ] subscriptions on pos
- [ ] b2b subscriptions
- [ ] international subscriptions
- [ ] migrate existing contracts

**Q2.2.5** — For pre-orders, when is the customer charged? *(recommended)*
*Skip if Q2.2.1 does not include pre order.*
*Pre-orders need a pre-order app; express checkouts (Shop Pay, Apple Pay, Google Pay) are not available for pre-orders.*

*(tick one)*
- [ ] full at order
- [ ] deposit then balance
- [ ] charged at fulfilment

### 2.3 Catalogue data

**Q2.3.1** — Roughly how many collections? *(optional)*

> Answer: 60

**Q2.3.2** — Are collections manual, rule-based (automated), or mixed? *(optional)*

*(tick one)*
- [ ] manual
- [ ] automated
- [x] mixed

**Q2.3.3** — Which product attributes go beyond Shopify's standard fields (technical specs, certifications, fit guides, ingredients)? *(recommended)*
*Shopify stores extra attributes as metafields and metaobjects and uses the Standard Product Taxonomy for category attributes (filters, Google and Meta feeds). With a PIM, attributes come from the PIM.*

> Answer: movement_type, case_material, water_resistance_atm

**Q2.3.4** — Where is catalogue data maintained today? *(recommended)*
*Typical: products and content from the PIM; prices and inventory from the ERP.*

*(tick one)*
- [ ] shopify admin
- [ ] spreadsheet
- [ ] erp
- [x] pim
- [ ] mixed

**Q2.3.5** — Which attributes should shoppers filter by on collection and search pages? *(recommended)*
*Shopify Search & Discovery: up to 25 filters; no filters on collections over 5,000 products.*

> Answer:

### 2.4 Pricing

**Q2.4.1** — Are there price lists for customer groups (retail, trade, VIP)? *(recommended)*
*Price lists for business customers are B2B catalogs; consumer VIP pricing without B2B uses discounts or an app.*

- [x] Yes
- [ ] No

**Q2.4.2** — Is there volume or quantity-tiered pricing? *(recommended)*
*B2B quantity rules and volume pricing are native; for consumers, automatic discounts or a volume-discount app.*

- [ ] Yes
- [x] No

**Q2.4.3** — Do prices differ by market (not just currency conversion)? *(recommended)*
*Shopify Markets supports percentage adjustments, fixed prices per product per country and price rounding.*

- [x] Yes
- [ ] No

### 2.5 Inventory

**Q2.5.1** — Where is the inventory source of truth — Shopify, ERP, WMS, other? *(recommended)*
*With the ERP as source of truth, Shopify still needs stock per location.*

*(tick one)*
- [ ] shopify
- [x] erp
- [ ] wms
- [ ] oms
- [ ] pos
- [ ] other

**Q2.5.2** — Are low-stock alerts needed? *(optional)*
*Shopify has no built-in low-stock alert; we set it up with Shopify Flow.*

- [x] Yes
- [ ] No

**Q2.5.3** — What should happen when a product is out of stock? *(optional)*
*Continue selling (backorder) is native; back-in-stock alerts and pre-orders need apps.*

*(tick all that apply)*
- [ ] hide
- [ ] show sold out
- [ ] continue selling backorder
- [x] back in stock alert
- [ ] pre order

**Q2.5.4** — Which inventory tasks will your team do in Shopify? *(optional)*
*Purchase orders, transfers and stock adjustments are native in Shopify admin (Stocky is retired).*

*(tick all that apply)*
- [ ] purchase orders
- [ ] stock transfers
- [ ] stock counts pos
- [ ] damaged quality control safety stock
- [ ] none erp managed

---

## § 3 — Markets & internationalisation

> Shopify Markets, currencies, languages, tax and duties.

### 3.1 Markets at launch

**Q3.1.1** — Which markets (countries) go live at launch? For each: country code, checkout currency, languages, domain. *(required)*
*List each country or group of countries that shares prices and currency. Mainland China is handled in a separate China discovery (11.20). More than 5 markets (11.3) or more than 6 languages (11.4) is outside the standard offers.*

| code | currency | languages | domain | price strategy |
|---|---|---|---|---|
| CH | CHF | de, fr, it | ch.acme-watches.example | manual |
| DE | EUR | de | de.acme-watches.example | manual |
| AT | EUR | de | at.acme-watches.example | manual |

**Q3.1.2** — Which are the primary markets (one or more country or market codes)? *(required)*
*The markets that lead revenue and launch priority, e.g. US and EU for a global brand.*

> Answer: CH

**Q3.1.3** — Which countries are planned in the next 12 months? *(optional)*

> Answer: FR; IT

**Q3.1.4** — Operating model: one store with Shopify Markets, expansion stores, or hybrid? *(recommended · consultant)*
*Expansion stores suit teams that run each region separately.*

*(tick one)*
- [x] shopify markets
- [ ] expansion stores
- [ ] hybrid

**Q3.1.5** — How should visitors reach their local market? *(optional)*
*Automatic redirection is native; EU visitors on EU country domains are not redirected automatically.*

*(tick one)*
- [x] automatic redirect
- [ ] country selector only
- [ ] suggest banner
- [ ] none

**Q3.1.6** — Who is merchant of record for international orders? *(required · consultant)*
*Self-managed Markets (the client registers and remits tax, Shopify Tax) or Shopify Managed Markets (Shopify is merchant of record).*

*(tick one)*
- [ ] self managed markets
- [ ] managed markets
- [ ] third party mor app
- [ ] undecided

**Q3.1.7** — Should any market have its own theme content, section order, checkout or customer-account settings? *(recommended)*

- [ ] Yes
- [ ] No

### 3.2 Language

**Q3.2.1** — How will translation be handled? *(recommended)*
*Translate & Adapt (Shopify's free app) auto-translates up to 2 languages; more languages need manual work or a translation app. Checkout is pre-translated.*

*(tick one)*
- [ ] in house
- [ ] agency
- [x] translate and adapt
- [ ] third party app
- [ ] pim supplied
- [ ] undecided

**Q3.2.2** — Does any language need right-to-left layout? *(optional)*

- [ ] Yes
- [x] No

**Q3.2.3** — Is SEO per language a priority? *(optional)*

- [x] Yes
- [ ] No

**Q3.2.4** — What must be translated? *(recommended)*
*Translate & Adapt does not auto-translate policies or URL handles.*

*(tick all that apply)*
- [ ] product data from pim
- [ ] theme texts
- [ ] metaobject content
- [ ] policies
- [ ] notifications
- [ ] url handles
- [ ] app content
- [ ] none

### 3.3 Currency & pricing

**Q3.3.1** — Per market: is it the store's base currency, or are prices auto-converted, manually set, or display-only (checkout in another currency)? *(required)*
*More than one transactional currency activates the multi-currency scope gate. Local-currency pricing with all Markets pricing features needs Shopify Payments.*

*(tick one)*
- [x] base currency
- [ ] auto converted
- [x] manual
- [ ] display only

> Per market: CH base currency · DE manual · AT manual

### 3.4 Tax & duties

**Q3.4.1** — Should duties and import taxes be collected at checkout (DDP)? *(recommended)*
*Shopify can charge duties and import taxes at checkout. This needs HS codes and country of origin on every product.*

- [x] Yes
- [ ] No

**Q3.4.2** — In which countries are you VAT-registered? *(recommended)*

> Answer: CH; DE; AT

**Q3.4.3** — Do you sell into the US with state sales tax obligations? *(optional)*

- [ ] Yes
- [x] No

**Q3.4.4** — Do products have HS codes and country of origin, and where do they come from? *(recommended)*
*Skip if Q3.4.1 = no.*

*(tick one)*
- [ ] in pim
- [ ] in erp
- [ ] to be created
- [ ] not needed

**Q3.4.5** — Should prices include tax (VAT) in some markets and exclude it in others? *(required)*
*Shopify can show tax-inclusive prices per market (dynamic tax display).*

*(tick one)*
- [ ] include everywhere
- [ ] exclude everywhere
- [ ] dynamic by market

**Q3.4.6** — Which tax service? *(recommended · consultant)*
*Shopify Tax covers the US, EU, UK and Canada; since 2026-05-13 new stores selling in the EU, UK or Canada cannot use Basic Tax.*

*(tick one)*
- [ ] shopify tax
- [ ] tax app
- [ ] manual rates
- [ ] undecided

**Q3.4.7** — Do business customers buy tax-exempt (VAT number validation, reverse charge)? *(optional)*
*VAT ID validation at checkout is native.*

- [ ] Yes
- [ ] No

### 3.5 Mainland China

**Q3.5.1** — Do you want to sell to mainland China cross-border (from outside China) or onshore, behind the Great Firewall? *(required)*
*Only if the launch markets include mainland China (CN).*
*Onshore selling needs a PRC entity, an ICP filing or licence and hosting in China.*

> Not applicable — mainland China is not a launch market.

**Q3.5.2** — Which channels for mainland China? *(required)*
*Only if the launch markets include mainland China (CN).*
*Cross-border marketplaces (Tmall Global, JD Worldwide, Douyin Global, RED), a WeChat mini-program, your own site, or a Hong Kong store shipping to the mainland.*

> Not applicable — mainland China is not a launch market.

**Q3.5.3** — Do you have a legal entity in mainland China? *(required)*
*Only if the launch markets include mainland China (CN).*
*Needed for an ICP filing or licence and for onshore hosting.*

> Not applicable — mainland China is not a launch market.

**Q3.5.4** — Do you have a Hong Kong or other overseas entity that can sell cross-border, and are your trademarks registered in China? *(recommended)*
*Only if the launch markets include mainland China (CN).*
*Cross-border marketplaces require both.*

> Not applicable — mainland China is not a launch market.

**Q3.5.5** — ICP status for a China website? *(required)*
*Only if the launch markets include mainland China (CN).*
*Your PRC counsel confirms whether a filing is enough or a commercial ICP licence is needed.*

> Not applicable — mainland China is not a launch market.

**Q3.5.6** — What is Shopify's role for mainland China? *(required · consultant)*
*Only if the launch markets include mainland China (CN).*
*Shopify can stay the global master for products, inventory and orders while China sells through local channels.*

> Not applicable — mainland China is not a launch market.

**Q3.5.7** — How will goods enter China: bonded warehouse (1210), direct mail (9610), general trade, or personal parcels? *(required)*
*Only if the launch markets include mainland China (CN).*
*Cross-border channels have per-order and yearly limits per consumer.*

> Not applicable — mainland China is not a launch market.

**Q3.5.8** — Are your products on China's cross-border e-commerce positive list? *(recommended)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.9** — How are your products classified in China? *(required)*
*Only if the launch markets include mainland China (CN).*
*Whitening, sunscreen and anti-hair-loss products are special cosmetics; medicines are not cross-border goods.*

> Not applicable — mainland China is not a launch market.

**Q3.5.10** — Registration or filing status with China's medical products administration (NMPA)? *(recommended)*
*Only if the launch markets include mainland China (CN).*
*General trade needs registration or filing; cross-border channels are exempt for goods on the positive list.*

> Not applicable — mainland China is not a launch market.

**Q3.5.11** — Do product claims need a review for China (medical, cosmeceutical or treatment claims)? *(recommended · consultant)*
*Only if the launch markets include mainland China (CN).*
*China does not allow cosmeceutical or medical claims for cosmetics.*

> Not applicable — mainland China is not a launch market.

**Q3.5.12** — How will mainland customers pay? *(required)*
*Only if the launch markets include mainland China (CN).*
*Inside the marketplace, Alipay and WeChat Pay through a Hong Kong Shopify Payments account (early access), a cross-border wallet provider, or domestic merchant accounts (PRC entity).*

> Not applicable — mainland China is not a launch market.

**Q3.5.13** — How many mainland China customers do you expect per year? *(required)*
*Only if the launch markets include mainland China (CN).*
*China's personal information law sets different data-export obligations by volume.*

> Not applicable — mainland China is not a launch market.

**Q3.5.14** — Do you have a representative in China for personal information protection (PIPL)? *(recommended)*
*Only if the launch markets include mainland China (CN).*
*Required when an offshore business targets consumers in China.*

> Not applicable — mainland China is not a launch market.

**Q3.5.15** — Where will China customer data (CRM, email, analytics) be stored? *(recommended)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.16** — Must scripts blocked in China (Google Fonts, Google Analytics, reCAPTCHA, Meta pixels, YouTube) be replaced? *(recommended · consultant)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.17** — Which marketing channels for China? *(recommended)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.18** — Who provides Chinese-language customer service? *(recommended)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.19** — Do you work with a local partner or trade partner for China? Name it. *(optional)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.20** — Target launch date for mainland China. *(optional)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.21** — Who provides PRC legal, tax and customs advice? *(required)*
*Only if the launch markets include mainland China (CN).*
*Merkle does not provide PRC legal advice.*

> Not applicable — mainland China is not a launch market.

---

## § 4 — Payments & checkout

> Payment providers, PCI scope and checkout customisation.

### 4.1 Payments

**Q4.1.1** — Which payment providers will you use (Shopify Payments, Adyen, Stripe, PayPal…)? *(required)*
*Shopify Payments is required for some features (Shop Pay Installments, Managed Markets, some Markets pricing); third-party gateways are supported.*

> Answer: Shopify Payments; PayPal

**Q4.1.2** — Which local payment methods are required? *(recommended)*

*(tick all that apply)*
- [ ] klarna
- [ ] ideal wero
- [ ] bancontact
- [ ] eps
- [ ] przelewy24
- [ ] blik
- [ ] mb way
- [ ] multibanco
- [ ] mobilepay
- [ ] swish
- [x] twint
- [ ] alipay
- [ ] wechat pay
- [ ] sepa or invoice via gateway
- [ ] other
- [ ] none

**Q4.1.3** — Which buy-now-pay-later options, if any? *(optional)*
*Shop Pay Installments is available to stores in the US, Canada and the UK.*

*(tick all that apply)*
- [ ] shop pay installments
- [ ] klarna via shopify payments
- [ ] bnpl via other gateway
- [x] none

**Q4.1.4** — Do you need payouts in more than one currency? *(optional)*

- [x] Yes
- [ ] No

**Q4.1.5** — Will card data be handled only by Shopify-hosted checkout, by a third-party hosted payment page, or by custom card UI / tokenisation? *(required · consultant)*
*Custom card handling is a hard stop (11.9).*

*(tick one)*
- [x] shopify hosted
- [ ] third party hosted
- [ ] custom card handling

**Q4.1.6** — Which express checkouts are required? *(recommended)*
*B2B checkout and pre-orders do not support express checkouts.*

*(tick all that apply)*
- [ ] shop pay
- [ ] apple pay
- [ ] google pay
- [ ] paypal
- [ ] amazon pay
- [ ] none

**Q4.1.7** — Must payment methods be hidden, renamed or reordered by market, customer type or cart? *(recommended)*
*Needs a payment customization app (Shopify Function).*

- [ ] Yes
- [ ] No

### 4.2 Checkout

**Q4.2.1** — Which checkout changes are needed? *(required)*
*Shopify checkout is customised with the checkout editor and Checkout Extensibility (blocks, fields, logic via Functions). A fully custom checkout UI is not possible on Shopify (11.6).*

*(tick all that apply)*
- [x] branding in editor
- [ ] thank you order status blocks
- [x] checkout step blocks or fields
- [ ] checkout branding api styling
- [ ] backend logic functions
- [ ] fully custom checkout ui
- [ ] none

**Q4.2.2** — Which checkout extensions are needed? *(optional · consultant)*
*Skip if Q4.2.1 = none.*

*(tick all that apply)*
- [x] custom fields
- [ ] upsell block
- [ ] gift message
- [x] trust badges
- [ ] loyalty redemption
- [ ] delivery customization
- [ ] payment customization
- [ ] cart checkout validation
- [ ] address validation
- [ ] pickup point generator

**Q4.2.3** — Which custom checkout fields are needed (company, VAT number, PO number, delivery instructions)? *(optional)*

> Answer: PO number (B2B); VAT number (B2B)

**Q4.2.4** — Are post-purchase upsells needed? *(optional)*
*Upsells on the Thank you page are native; a separate post-purchase page is a Shopify beta.*

- [ ] Yes
- [x] No

**Q4.2.6** — Is store credit needed? *(optional)*
*Store credit is native: refund to store credit or issue credit; customers spend it when signed in.*

- [ ] Yes
- [x] No

### 4.3 Fraud & risk

**Q4.3.1** — Is manual fraud review needed for high-value orders? *(optional)*
*Native: fraud analysis and the Shopify Fraud Control app.*

- [x] Yes
- [ ] No

**Q4.3.2** — Which order restrictions are needed? *(optional)*
*Blocking countries is native (markets and shipping zones); other rules need a cart and checkout validation app (Shopify Function).*

*(tick all that apply)*
- [ ] block countries
- [ ] order value min max
- [ ] quantity limits
- [ ] customer type restrictions
- [ ] product combination rules
- [x] none

**Q4.3.3** — Do you want a guarantee that fraud chargebacks are reimbursed? *(optional)*
*Outside Shopify Protect (US Shop Pay orders) this needs a fraud app.*

- [ ] Yes
- [ ] No

---

## § 5 — Shipping & fulfilment

> How orders reach customers and come back: fulfilment, shipping, returns, cancellations, refunds and the post-purchase experience — and whether native Shopify (return and cancellation rules, self-serve returns, order status page, delivery dates) is enough or an app is needed.

### 5.1 Fulfilment model

**Q5.1.1** — Do you fulfil in-house, through a 3PL, or both? *(required)*

*(tick one)*
- [x] in house
- [ ] 3pl
- [ ] hybrid

**Q5.1.2** — Which 3PL provider? *(recommended)*
*Skip if Q5.1.1 = in house.*

> Answer: n/a (skipped)

**Q5.1.3** — How many fulfilment locations are there? *(required)*
*Include warehouses, stores that ship, and 3PL locations.*

> Answer: 1

**Q5.1.4** — How should Shopify pick the fulfilling location? *(recommended)*
*Shopify's order routing rules: minimise split shipments, stay within the market, closest location, ranked locations, location metafields. Anything else needs a custom routing function or the ERP / OMS (11.13).*

*(tick all that apply)*
- [ ] minimize split fulfillments
- [x] stay within market
- [x] closest location
- [ ] ranked locations
- [ ] location metafields
- [ ] custom rule function
- [ ] erp or oms decides

**Q5.1.5** — Which carriers do you use? *(recommended)*

> Answer: DHL Express; Swiss Post

**Q5.1.6** — How are shipping rates calculated? *(recommended)*
*Flat, weight or price based, free above a threshold, live carrier rates, or rates from an app.*

*(tick all that apply)*
- [x] flat
- [ ] weight or price based
- [x] free above threshold
- [x] carrier calculated
- [ ] app calculated

**Q5.1.7** — Are there product-specific shipping rules (heavy, hazardous, temperature-controlled)? *(optional)*

> Answer: None

**Q5.1.9** — Which countries do you not ship to? *(optional)*

> Answer: None

**Q5.1.10** — Free-shipping thresholds per market (market, threshold, currency, which rates). *(recommended)*
*Native: a rate condition based on order price, or an automatic free-shipping discount.*

| market | threshold | currency | rates |
|---|---|---|---|
| | | | |

**Q5.1.11** — Which delivery methods do you offer? *(required)*
*Local delivery and pickup in store are native; pickup points and delivery time slots need an app; ship from store needs Shopify POS.*

*(tick all that apply)*
- [ ] standard shipping
- [ ] express
- [ ] local delivery
- [ ] pickup in store
- [ ] pickup points
- [ ] scheduled delivery slots
- [ ] ship from store

**Q5.1.12** — How are shipping labels created? *(optional)*

*(tick one)*
- [ ] shopify shipping
- [ ] 3pl system
- [ ] carrier software
- [ ] shipping app

### 5.2 Returns & exchanges

**Q5.2.1** — Summarise the returns policy (window, conditions, who pays return postage). *(recommended)*

> Answer: 30-day returns for unworn watches in original packaging; free returns within CH, customer-paid from DE and AT.

**Q5.2.2** — Shopify includes return requests in customer accounts, controlled by return rules (window, return fee, restocking fee, final sale). Is that enough? *(recommended)*

*(tick one)*
- [x] native self serve returns
- [ ] returns app needed
- [ ] staff created only
- [ ] not sure

**Q5.2.3** — Do you process exchanges (not only refunds)? *(optional)*

- [x] Yes
- [ ] No

**Q5.2.4** — Which returns, tracking or post-purchase apps do you use or prefer? *(optional)*

> Answer:

**Q5.2.5** — How many days do customers have to return an order? *(recommended)*

> Answer: 30

**Q5.2.6** — What share of orders is returned today (%)? *(recommended)*
*High return rates or volumes usually justify a returns platform instead of Shopify's native self-serve returns.*

> Answer: 8

**Q5.2.7** — How do customers send items back: prepaid label, QR code drop-off, their own shipment, or mixed? *(recommended)*
*Shopify creates return labels only for US fulfilment locations; other countries, or QR drop-off, need a returns app.*

*(tick one)*
- [x] prepaid label
- [ ] qr drop off
- [ ] customer arranged
- [ ] mixed

**Q5.2.8** — Who pays return shipping: you, the customer, or it depends on the market? *(recommended)*

*(tick one)*
- [ ] merchant
- [ ] customer
- [x] depends on market

**Q5.2.9** — Which exchanges do you offer: same product in another variant, any other product, or store credit first? *(optional)*
*Skip if Q5.2.3 = no.*
*Customers can't choose an exchange in Shopify's return form; staff add exchange items when approving. Customer-chosen exchanges need an app.*

*(tick all that apply)*
- [x] same product variant
- [ ] any product
- [ ] store credit first

**Q5.2.10** — Do you accept international returns (including refunding duties)? *(optional)*

- [x] Yes
- [ ] No

**Q5.2.11** — Must returned items be inspected before the refund or exchange is issued? *(recommended)*

- [x] Yes
- [ ] No

**Q5.2.12** — Do you need to capture and report return reasons? *(optional)*

- [x] Yes
- [ ] No

**Q5.2.13** — Should B2B customers request returns online (if you sell B2B)? *(optional)*
*Shopify's return requests also work for B2B orders.*

- [ ] Yes
- [x] No

**Q5.2.14** — Do return windows or conditions differ by market or product (e.g. final-sale items)? *(optional)*
*Final sale per product or collection is native.*

- [ ] Yes
- [ ] No

### 5.3 Notifications

**Q5.3.1** — Do order, shipping and delivery notifications need custom design or content? *(optional)*
*Shopify notifications are editable; SMS shipping notifications are native.*

- [x] Yes
- [ ] No

**Q5.3.2** — Are notifications sent by Shopify, by the email platform, or both? *(optional)*

*(tick one)*
- [ ] shopify
- [ ] esp
- [x] mixed

### 5.4 Cancellations & refunds

**Q5.4.1** — How many orders per month do you expect in the first year? *(required)*
*Returns, tracking and fraud apps are priced by order volume.*

> Answer: 400

**Q5.4.2** — Should customers be able to cancel orders themselves? *(recommended)*
*Customers can request cancellation of unshipped orders in their account; you approve. Instant cancellation without approval needs an app.*

- [ ] Yes
- [x] No

**Q5.4.3** — Until when can an order be cancelled? *(recommended)*

*(tick one)*
- [ ] no cancellations
- [x] until fulfilled
- [ ] 15 minutes
- [ ] 1 hour
- [ ] 24 hours
- [ ] staff only

**Q5.4.4** — Do you allow partial cancellations (some items of an order)? *(optional)*

- [x] Yes
- [ ] No

**Q5.4.5** — Should customers be able to edit an order after placing it (address, items)? *(recommended)*
*Staff can edit orders natively; customers editing their own orders needs an app.*

- [ ] Yes
- [x] No

**Q5.4.6** — How are refunds paid: to the original payment method, as store credit, or as a gift card? *(recommended)*

*(tick all that apply)*
- [x] original payment
- [x] store credit
- [ ] gift card

**Q5.4.7** — When is a refund issued: on request, when the carrier scans the return, on receipt, or after inspection? *(recommended)*
*Refunds on carrier scan need a returns platform connected to carrier tracking.*

*(tick one)*
- [ ] on request
- [ ] on carrier scan
- [ ] on receipt
- [x] after inspection

**Q5.4.8** — Is the original shipping cost refunded: always, only when you are at fault, or never? *(optional)*

*(tick one)*
- [ ] always
- [x] on fault only
- [ ] never

**Q5.4.9** — Do you charge a restocking fee? *(optional)*
*A restocking fee is a native return rule (percentage of the return).*

- [ ] Yes
- [x] No

**Q5.4.10** — Do you issue partial refunds (e.g. damaged or missing parts)? *(optional)*

- [x] Yes
- [ ] No

**Q5.4.11** — Must refunds be approved by someone before they are paid? *(recommended)*

- [x] Yes
- [ ] No

**Q5.4.12** — Must cancellations and refunds be passed to your ERP or finance system? *(recommended)*

- [x] Yes
- [ ] No

**Q5.4.13** — Must cancellations be instant, without your approval? *(optional)*
*Skip if Q5.4.2 = no.*

- [ ] Yes
- [ ] No

### 5.5 Post-purchase experience

**Q5.5.1** — Do you want a branded order-tracking page on your own site? *(recommended)*
*Shopify includes an order status page and shipping emails. A branded tracking page, proactive carrier alerts or delivery estimates usually need a post-purchase app.*

- [ ] Yes
- [x] No

**Q5.5.2** — On which channels should customers get proactive delivery updates (delays, out for delivery)? *(recommended)*

*(tick all that apply)*
- [x] email
- [ ] sms
- [ ] whatsapp
- [ ] push

**Q5.5.3** — Should product pages or checkout show estimated delivery dates? *(optional)*
*Shopify can show delivery dates at checkout: manual dates everywhere, automatic dates only for US fulfilment locations.*

- [x] Yes
- [ ] No

**Q5.5.4** — Do customers need to open warranty, repair or servicing claims online? *(recommended)*

- [x] Yes
- [ ] No

### 5.6 Retail & POS

**Q5.6.1** — How many physical retail stores (including pop-ups) will sell with Shopify? *(required)*
*0 if none.*

> Answer:

**Q5.6.2** — Point of sale at launch? *(required)*
*Skip if Q5.6.1 = 0.*

*(tick one)*
- [ ] shopify pos
- [ ] other pos integrated
- [ ] other pos separate
- [ ] undecided

**Q5.6.3** — Which omnichannel services are needed in store? *(required)*
*Skip if Q5.6.1 = 0.*
*Pickup in store, ship from store, in-store returns of online orders, endless aisle, stock transfers, retail prices.*

*(tick all that apply)*
- [ ] buy online pickup in store
- [ ] ship to customer from store
- [ ] in store returns exchanges of online orders
- [ ] endless aisle order in store
- [ ] store credit gift cards in store
- [ ] stock transfers counts
- [ ] retail prices or catalogs
- [ ] staff roles permissions
- [ ] none

**Q5.6.4** — In which countries are the stores? *(recommended)*
*Skip if Q5.6.1 = 0.*

> Answer:

---

## § 6 — Customers, B2B & privacy

> Customer accounts, B2B, loyalty, segmentation and personal-data obligations.

### 6.1 Customer accounts

**Q6.1.1** — Is guest checkout the default, are accounts optional, or is registration required? *(recommended)*

*(tick one)*
- [ ] guest default
- [x] optional
- [ ] required

**Q6.1.3** — What should the account area include (order history, addresses, returns, wishlist, subscriptions)? *(optional)*

*(tick all that apply)*
- [x] order history
- [ ] buy again
- [x] return requests
- [ ] cancellation requests
- [ ] store credit
- [x] addresses
- [ ] subscription management
- [ ] b2b company locations
- [ ] loyalty widget
- [ ] wishlist
- [ ] extra profile fields
- [ ] none

**Q6.1.4** — How should customers sign in? *(recommended)*
*One-time email code and Google or Facebook sign-in are native.*

*(tick all that apply)*
- [ ] email code
- [ ] google facebook
- [ ] shop
- [ ] company sso identity provider
- [ ] sign in from another site

### 6.2 B2B & wholesale

**Q6.2.1** — Do you sell to business customers (B2B / wholesale)? *(required)*

- [x] Yes
- [ ] No

**Q6.2.2** — Do B2B customers need company accounts with their own login? *(required)*
*Skip if Q6.2.1 = no.*

- [x] Yes
- [ ] No

**Q6.2.3** — Do B2B customers get company-specific price lists? *(required)*
*Skip if Q6.2.1 = no.*
*Business price lists are B2B catalogs.*

- [x] Yes
- [ ] No

**Q6.2.4** — Are there B2B volume discounts or quantity rules? *(required)*
*Skip if Q6.2.1 = no.*

- [ ] Yes
- [x] No

**Q6.2.5** — Which payment terms are needed (net 30, invoice, purchase order)? *(recommended)*
*Skip if Q6.2.1 = no.*

*(tick all that apply)*
- [ ] net terms
- [ ] due on fulfilment
- [ ] vaulted card
- [ ] ach us
- [ ] invoice via draft order
- [ ] deposits
- [ ] partial payments
- [ ] pay per fulfilment
- [ ] none

**Q6.2.6** — Is there a request-for-quote workflow, or is pricing negotiated per buyer? *(required)*
*Skip if Q6.2.1 = no.*
*Shopify has no built-in request-for-quote: orders can be submitted for review as drafts, or a quote app handles negotiation (11.2).*

- [ ] Yes
- [x] No

**Q6.2.7** — Must B2B accounts be approved before they can order? *(optional)*
*Skip if Q6.2.1 = no.*
*Native: a wholesale application form (Shopify Forms) plus Flow to create and approve companies.*

- [x] Yes
- [ ] No

**Q6.2.8** — Native Shopify B2B or an app? *(recommended · consultant)*
*Skip if Q6.2.1 = no.*

*(tick one)*
- [x] shopify b2b
- [ ] shopify b2b plus apps
- [ ] b2b app only
- [ ] separate b2b expansion store
- [ ] undecided

**Q6.2.9** — How many B2B accounts are expected within 12 months? *(optional)*
*Skip if Q6.2.1 = no.*

> Answer: 500

**Q6.2.10** — How many distinct B2B price lists (catalogs) do you need, and must any be specific to one company? *(required)*
*Skip if Q6.2.1 = no.*

- catalog count:
- company specific catalogs:

**Q6.2.11** — Should B2B buyers see a different storefront or checkout from consumers? *(recommended)*
*Skip if Q6.2.1 = no.*

- [ ] Yes
- [ ] No

**Q6.2.12** — Do B2B orders need any of these: subscriptions, local delivery or pickup points, express checkouts, more than 500 line items, gift cards? *(recommended · consultant)*
*Skip if Q6.2.1 = no.*
*Shopify B2B does not support these (11.19).*

*(tick all that apply)*
- [ ] subscriptions
- [ ] local delivery or pickup points
- [ ] express checkouts
- [ ] over 500 line items
- [ ] gift cards
- [ ] none

### 6.3 Loyalty & segmentation

**Q6.3.1** — Which loyalty components are planned? *(recommended)*
*Shopify has no native points programme; store credit can be a reward currency. Loyalty needs an app.*

*(tick all that apply)*
- [x] points purchase
- [ ] points actions
- [x] vip tiers
- [x] referral
- [x] vip early access
- [ ] subscription discount
- [ ] store credit
- [ ] none

**Q6.3.2** — Is loyalty needed at launch or in a later phase? *(recommended)*

*(tick one)*
- [ ] launch
- [x] phase 2
- [ ] none

**Q6.3.3** — Which loyalty app is used or preferred? *(optional)*

> Answer: Smile.io

**Q6.3.4** — Must loyalty status sync to the email platform or CRM? *(optional)*

- [x] Yes
- [ ] No

**Q6.3.5** — Which customer segments do you use today? *(optional)*

> Answer: Retail; Wholesale; VIP

**Q6.3.6** — Where is segmentation driven from — Shopify, the email platform, a CDP, or a mix? *(optional)*
*Customer segments are native in Shopify; the email platform or CDP may own them instead.*

*(tick one)*
- [ ] shopify
- [x] esp
- [ ] cdp
- [ ] mixed
- [ ] none

**Q6.3.7** — Which customer tags drive custom logic today (pricing, access, discounts)? *(optional)*

> Answer: wholesale; vip_early_access

### 6.4 Privacy & consent

**Q6.4.1** — Which privacy regimes apply to your customers (GDPR, UK GDPR, CCPA, Swiss nFADP)? *(required · consultant)*

*(tick all that apply)*
- [x] gdpr
- [ ] uk gdpr
- [ ] ccpa
- [x] nfadp
- [ ] other

**Q6.4.2** — Cookie consent: Shopify's cookie banner or a consent management platform? Name the tool if known. *(recommended)*
*Shopify's cookie banner is native; a third-party platform must integrate Shopify's Customer Privacy API.*

- cookie consent tool: Cookiebot

**Q6.4.3** — Is explicit opt-in required for marketing emails? *(recommended)*

- [x] Yes
- [ ] No

**Q6.4.4** — Do you collect sensitive personal data (health, age, biometric, financial)? *(required)*
*Flag 11.17 — needs a data protection impact assessment and legal sign-off.*

- [ ] Yes
- [x] No

**Q6.4.5** — Must data-access or deletion requests reach systems beyond Shopify (ERP, email platform) or run without staff involvement? *(required)*
*Shopify handles export and erasure requests in admin; 11.10 applies when other systems or automation are involved.*

- [x] Yes
- [ ] No

**Q6.4.6** — Do US state privacy laws require a 'Do not sell or share my personal information' page? *(optional)*
*A native opt-out page honours Global Privacy Control.*

- [ ] Yes
- [ ] No

**Q6.4.7** — Where do you collect marketing consent? *(optional)*

*(tick all that apply)*
- [ ] checkout
- [ ] customer account sign in
- [ ] forms popups
- [ ] pos
- [ ] none

---

## § 7 — Marketing & promotions

> SEO, analytics, email, reviews, affiliates, discounts and campaigns.

### 7.1 SEO

**Q7.1.1** — Is organic search a significant traffic channel? *(recommended)*

- [x] Yes
- [ ] No

**Q7.1.2** — Are custom URL structures needed? *(optional)*

- [ ] Yes
- [x] No

**Q7.1.3** — Who manages SEO? *(optional)*

*(tick one)*
- [ ] in house
- [x] agency
- [ ] none

**Q7.1.4** — Should products be discoverable in AI shopping assistants? *(optional)*
*Shopify Catalog and agentic channels (Spring '26).*

- [ ] Yes
- [ ] No

### 7.2 Analytics & tracking

**Q7.2.1** — Which analytics platforms do you use (GA4, Adobe, other)? *(recommended)*

> Answer: GA4

**Q7.2.2** — Is server-side tracking needed? *(recommended)*
*Shopify's customer events track storefront and checkout with consent; the Facebook & Instagram and Google & YouTube apps send server-side events. Anything beyond needs a tracking app. Server-side events can share customer data with ad platforms (PII gate).*

- [ ] Yes
- [x] No

**Q7.2.3** — Which advertising pixels are needed (Meta, TikTok, Pinterest, Google Ads)? *(recommended)*

> Answer: Meta; Google Ads

**Q7.2.4** — Is a tag manager already configured? *(optional)*
*Tag managers run as a custom pixel in Shopify's sandbox; scripts in checkout are no longer possible.*

- [x] Yes
- [ ] No

**Q7.2.5** — Which custom events must be tracked beyond standard ecommerce events? *(optional)*

> Answer: None beyond standard ecommerce events

### 7.3 Email & CRM

**Q7.3.1** — Which email / CRM platform do you use or plan to use: Shopify Messaging or another platform (name)? *(recommended)*
*Shopify Messaging covers email, SMS and WhatsApp campaigns and automations.*

- platform: Klaviyo

**Q7.3.2** — Which automated flows are needed (welcome, abandoned cart, post-purchase, win-back)? *(optional)*

> Answer: Welcome; Abandoned cart; Browse abandonment; Post-purchase; Win-back

**Q7.3.4** — Do you send SMS marketing, and to which countries? *(recommended)*

- enabled:
- countries:

**Q7.3.5** — Do you send WhatsApp marketing? *(optional)*
*Native in Shopify Messaging.*

- [ ] Yes
- [ ] No

### 7.4 Reviews & affiliates

**Q7.4.1** — Which product reviews app is used or preferred? *(optional)*
*Product reviews need an app.*

> Answer: Judge.me

**Q7.4.2** — Is user-generated content important (customer photos, social embeds)? *(optional)*

- [ ] Yes
- [x] No

**Q7.4.3** — Which affiliate platform, if any? *(optional)*

> Answer: None — influencer outreach is managed by an agency

**Q7.4.4** — Do you use Shopify Collabs for influencers? *(optional)*
*Shopify Collabs isn't accepting new creator sign-ups; you can still invite creators.*

- [ ] Yes
- [x] No

**Q7.4.5** — Are affiliate and influencer sales tracked via discount codes, UTM parameters, or both? *(optional)*

*(tick one)*
- [x] discount codes
- [ ] utm
- [ ] both
- [ ] none

### 7.5 Discounts & coupons

**Q7.5.1** — Which discount types are used? *(recommended)*

*(tick all that apply)*
- [x] percentage
- [x] fixed amount
- [ ] bogo
- [x] free shipping
- [ ] volume tiered
- [x] automatic
- [x] code based
- [ ] scheduled sale
- [x] stackable
- [ ] pos only
- [ ] none

**Q7.5.2** — Which discounts must combine on one order? *(recommended)*
*Shopify combines product, order and shipping discounts natively (up to 5 codes plus 1 shipping code, and up to 25 automatic discounts). Custom logic needs a discount function.*

*(tick one)*
- [ ] none
- [x] native combinations
- [ ] multiple discounts same item
- [ ] custom logic function

**Q7.5.3** — Are coupon codes single-use, multi-use, or bulk-generated? *(optional)*

*(tick all that apply)*
- [ ] single use
- [x] multi use
- [x] bulk

**Q7.5.4** — Must codes be brand-named (e.g. WELCOME20)? *(optional)*

- [x] Yes
- [ ] No

**Q7.5.5** — Do codes need minimum order values or quantities? *(optional)*

- [ ] Yes
- [x] No

**Q7.5.6** — Do codes expire on a fixed date, a rolling period, or never? *(optional)*

*(tick one)*
- [ ] none
- [x] fixed
- [ ] rolling

**Q7.5.7** — How are codes distributed (email, SMS, print, influencers)? *(optional)*

> Answer: Email; Influencers

**Q7.5.8** — Do promotions differ by market, customer segment, sales channel or B2B company? *(recommended)*

*(tick all that apply)*
- [ ] market
- [ ] customer segment
- [ ] sales channel pos only
- [ ] b2b company
- [ ] none

### 7.6 Gift cards & campaigns

**Q7.6.1** — Are gift cards sold as a product? *(optional)*
*Gift cards are native: digital cards by email, physical cards on POS; they never expire by default. Also covers gift cards accepted at checkout.*

- [ ] Yes
- [x] No

**Q7.6.2** — Are gift cards issued as rewards or compensation? *(optional)*

- [ ] Yes
- [x] No

**Q7.6.3** — Digital gift cards, physical, or both? *(optional)*

> Answer: Not applicable — gift cards are not sold at launch

**Q7.6.4** — Must gift cards expire? *(optional)*

> Answer: Not applicable — gift cards are not sold at launch

**Q7.6.5** — Are promotions triggered from email or SMS campaigns? *(optional)*

- [x] Yes
- [ ] No

**Q7.6.6** — Does each campaign need its own landing page? *(optional)*

- [ ] Yes
- [x] No

**Q7.6.7** — Are countdown timers or urgency elements needed? *(optional)*
*Countdown timers need an app or theme work.*

- [ ] Yes
- [x] No

**Q7.6.9** — Do you run scheduled drops or flash sales with high traffic? *(optional)*
*Scheduled theme and checkout changes are native (Rollouts).*

- [ ] Yes
- [ ] No

---

## § 8 — Integrations & migration

> Every system that exchanges data with the store, and what moves from the current platform.

### 8.1 Connected systems

**Q8.1.1** — List every system that exchanges product, inventory, order, customer or financial data with the store. For each: system, category, direction, data objects, frequency, connector (native app / iPaaS / custom / none), owner, status. *(required)*
*Typical ownership: the PIM supplies products, attributes and translations; the ERP supplies prices (including B2B catalogs), inventory per location and order status. Any ERP, PIM, CRM, 3PL/WMS, OMS, POS or custom connection activates the integration gate; more than 3 is outside the standard offers (11.7).*

| system | category | direction | objects | frequency | connector | middleware | owner | status |
|---|---|---|---|---|---|---|---|---|
| Client ERP | erp | bidirectional | inventory, prices, orders | batch | ipaas | Celigo | TBC | to build |
| Client PIM | pim | inbound | products, content | batch | ipaas | Celigo | client | to build |
| Klaviyo | esp | outbound | customers, orders | realtime | native app | — | client | existing |
| Loop Returns | returns | bidirectional | orders, returns | realtime | native app | — | client | to build |

**Q8.1.2** — Is there a middleware / iPaaS layer, or custom connectors? *(optional)*

> Answer: Celigo

**Q8.1.3** — How often do prices and stock change (updates per day), and must changes be live within minutes? *(recommended)*
*Sizes the sync design (bulk operations vs webhooks).*

- daily updates:
- latency minutes:

### 8.2 Data migration

**Q8.2.1** — Which platform are you migrating from (or none — greenfield)? *(required)*
*Shopify's Store Migration app imports products and customers from some platforms (e.g. WooCommerce, Wix, Square); other platforms use a migration app or the API.*

*(tick one)*
- [ ] none
- [ ] shopify
- [x] woocommerce
- [ ] magento
- [ ] shopware
- [ ] sfcc
- [ ] bigcommerce
- [ ] custom
- [ ] other

**Q8.2.2** — Which data must be migrated? *(recommended)*
*Skip if Q8.2.1 = none.*
*Customer passwords can't be migrated; customers sign in with a one-time code.*

*(tick all that apply)*
- [x] products
- [x] customers
- [x] orders
- [ ] content
- [x] redirects
- [ ] reviews
- [ ] gift cards
- [ ] store credit
- [ ] metafields metaobjects
- [ ] b2b companies
- [ ] subscription contracts
- [ ] blog posts pages
- [ ] none

**Q8.2.3** — Approximate volumes: products, customers, orders, URL redirects. *(recommended)*
*Skip if Q8.2.1 = none.*

- products: 800
- customers: 25,000 (approximate — to be confirmed)
- orders: 60,000 (approximate — to be confirmed)
- redirects: 4,200

**Q8.2.4** — Must historical orders be available inside Shopify? *(recommended)*
*Skip if Q8.2.1 = none.*

- [x] Yes
- [ ] No

**Q8.2.5** — How much SEO equity (rankings, backlinks) must be preserved? *(required · consultant)*
*Skip if Q8.2.1 = none.*

*(tick one)*
- [ ] none
- [ ] moderate
- [x] significant

**Q8.2.6** — Must active subscriptions move to the new store without customers re-entering cards? *(recommended)*
*Skip if Q8.2.1 = none.*

- [ ] Yes
- [ ] No

---

## § 9 — Design & experience

> Design source, storefront approach, accessibility and performance.

### 9.1 Design input

**Q9.1.1** — Is there a Figma file or design mockup for the new store? *(required)*

- [x] Yes
- [ ] No

**Q9.1.2** — How complete is it — brand only, key screens, or every template? *(required)*
*Skip if Q9.1.1 = no.*

*(tick one)*
- [ ] none
- [x] brand only
- [ ] key screens
- [ ] all templates

**Q9.1.3** — Does the Figma file contain a full design system (tokens and components)? *(required)*
*Skip if Q9.1.1 = no.*

- [ ] Yes
- [x] No

**Q9.1.4** — Is the design mapped to Shopify sections and blocks? *(optional · consultant)*
*Skip if Q9.1.1 = no.*

- [ ] Yes
- [x] No

**Q9.1.5** — Is a fully custom design required, rather than a theme with brand customisation? *(recommended)*

- [ ] Yes
- [x] No

### 9.2 Storefront

**Q9.2.1** — Is a headless storefront required (Hydrogen, another framework, or a native app front end)? *(required)*
*A headless requirement routes the engagement to the Growth (L) offer. Checkout stays Shopify checkout.*

- [ ] Yes
- [x] No

**Q9.2.2** — Any theme licence to keep? *(optional)*
*New builds start from Shopify's Horizon theme; a third-party theme licence only matters for a non-Horizon base.*

> Answer: Horizon

**Q9.2.3** — What is the aesthetic direction (minimal, editorial, luxury, playful, utilitarian)? *(optional)*

> Answer: Minimal, editorial product photography

**Q9.2.4** — Which interactive patterns are required (mega-menu, quick-add, swatches, predictive search, lookbook, video hero)? *(recommended)*

*(tick all that apply)*
- [x] mega menu
- [x] predictive search
- [x] variant swatches
- [x] quick add
- [ ] combined listings
- [ ] filters
- [ ] quick order list volume pricing
- [ ] wishlist
- [ ] store locator
- [ ] lookbook
- [ ] video hero
- [ ] none

**Q9.2.5** — Is custom motion or animation required? *(recommended)*

- [ ] Yes
- [x] No

**Q9.2.6** — Why headless? *(required)*
*Skip if Q9.2.1 = no.*
*Helps check whether Horizon theme blocks would do.*

*(tick all that apply)*
- [ ] ux not possible in theme
- [ ] performance
- [ ] existing cms or content platform
- [ ] native mobile app
- [ ] multiple frontends one backend
- [ ] url structure control
- [ ] other

**Q9.2.7** — Headless hosting? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] oxygen
- [ ] self hosted js runtime
- [ ] undecided

**Q9.2.8** — Where is editorial content managed for the headless storefront? *(recommended)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] shopify metaobjects
- [ ] headless cms
- [ ] pim
- [ ] undecided

**Q9.2.9** — Headless platform features required? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick all that apply)*
- [ ] customer account api accounts
- [ ] markets i18n routes
- [ ] b2b
- [ ] subscriptions
- [ ] bundles combined listings
- [ ] shopify analytics consent
- [ ] multiple storefronts

**Q9.2.10** — Do you want to A/B test themes or checkout configurations? *(optional)*
*Native with Shopify Rollouts experiments.*

- [ ] Yes
- [ ] No

### 9.3 Accessibility

**Q9.3.1** — Which accessibility standard applies? *(required)*
*Shopify checkout is tested against WCAG 2.2 AA; the theme and apps are your responsibility (e.g. under the European Accessibility Act).*

*(tick one)*
- [x] wcag21 aa
- [ ] wcag22 aa
- [ ] en301549
- [ ] section508
- [ ] none

**Q9.3.2** — Has an accessibility audit been done on the current site? *(optional)*

- [ ] Yes
- [x] No

### 9.4 Performance

**Q9.4.1** — Core Web Vitals targets: LCP (seconds), CLS, INP (milliseconds). *(optional)*

- lcp s: 2.5
- cls: 0.1
- inp ms: 200

**Q9.4.2** — Is page speed a known problem today? *(recommended)*
*Shopify's web performance report shows Core Web Vitals for the current store.*

- [x] Yes
- [ ] No

**Q9.4.3** — Which third-party scripts must load (chat, personalisation, heatmaps)? *(optional)*

> Answer: Cookiebot; Klaviyo onsite forms; Google Tag Manager

---

## § 10 — Delivery, governance & compliance

> Timeline, decision-making, support, legal and project tooling.

### 10.1 Timeline

**Q10.1.1** — What is the target go-live date? *(required)*
*Fewer weeks than the offer's minimum duration raises flag 11.15.*

> Answer: 2027-02-01

**Q10.1.2** — What drives the deadline (peak season, product launch, contract end)? *(recommended)*

> Answer: Spring collection launch

**Q10.1.3** — Is a phased launch planned? *(optional)*

- [ ] Yes
- [x] No

**Q10.1.4** — Preferred project kick-off date. *(recommended)*

> Answer: 2026-10-05

### 10.2 Team & decisions

**Q10.2.1** — Who is involved on the client side? For each: role, RACI (R/A/C/I), decision-maker (yes/no). Names are optional. *(required)*

| role | raci | decision maker | name |
|---|---|---|---|
| Managing Director | A | yes | — |
| Ecommerce Manager | R | no | — |
| Head of Wholesale | C | no | — |
| IT / ERP Lead | C | no | — |
| Finance Controller | I | no | — |

**Q10.2.2** — Is there a single decision-maker for scope, approvals and feedback? *(required · consultant)*
*No single decision-maker raises flag 11.16 — resolve before the statement of work.*

- [x] Yes
- [ ] No

**Q10.2.3** — Is budget approval authority clear? *(required · consultant)*

- [x] Yes
- [ ] No

### 10.3 Support & training

**Q10.3.1** — Which training is needed (products, orders, discounts, reports)? *(optional)*

> Answer: Products and metafields; Orders and returns; Discounts; B2B companies and catalogs

**Q10.3.2** — Are written SOPs required? *(optional)*

- [x] Yes
- [ ] No

**Q10.3.3** — What post-launch support model is expected? *(recommended)*

*(tick one)*
- [ ] hypercare only
- [x] retainer
- [ ] self sufficient
- [ ] third party

**Q10.3.4** — Is the Grow retainer signed? *(required · consultant)*
*Not signed on M or L: warning 11.11 (commercial adjustment).*

- [x] Yes
- [ ] No

**Q10.3.5** — Retainer length in months. *(recommended · consultant)*
*Skip if Q10.3.4 = no.*

> Answer: 12

**Q10.3.6** — Will the client re-verify apps and Shopify features at each Shopify Edition after launch? *(optional · consultant)*

- [ ] Yes
- [ ] No

### 10.4 Legal & regulated industries

**Q10.4.1** — Is the business in a regulated industry (pharma, alcohol, firearms, age-restricted goods, financial products, medical devices)? If yes, which? *(required)*
*A regulated industry needs legal review (11.8). Shopify has its own rules: e.g. alcohol needs age verification; some business types can't use Shopify Payments.*

- active: no
- category: n/a

**Q10.4.2** — Are legal pages (terms, privacy, cookies, returns) ready, in need of updates, or still to be drafted? *(recommended)*

*(tick one)*
- [ ] ready
- [x] needs update
- [ ] needs drafting

**Q10.4.3** — Any other industry-specific compliance requirements? *(optional)*

> Answer: None

**Q10.4.4** — Is the business and product range eligible for Shopify Payments (no restricted or prohibited categories)? *(required · consultant)*

- [ ] Yes
- [ ] No

### 10.5 Project set-up (consultant)

**Q10.5.1** — Lead consultant. *(required · consultant)*

> Answer: Lead Consultant (example)

**Q10.5.2** — Has the client agreed that answers may be processed by the AI discovery engine (no customer personal data included)? *(required · consultant)*
*ADR 0007 — the engine refuses to run without recorded consent.*

- [x] Yes
- [ ] No

**Q10.5.3** — Jira site and project key for the backlog. *(recommended · consultant)*

- site: TBC
- project key: ACME

**Q10.5.4** — Jira components to use. *(optional · consultant)*

> Answer: Storefront; Markets; B2B; Integrations; Migration

**Q10.5.5** — Discovery hit a STOP. How will Merkle proceed: Larger Engagement or no bid? *(recommended · consultant)*
*Only if a § 11 rule is STOP.*
*Larger Engagement: Merkle proposes an Enterprise Engagement with a dedicated Discovery Phase; the approach, a brief and the client deck are still produced, Jira tickets are not. No bid produces the STOP report only.*

*(tick one — not applicable: no STOP)*
- [ ] larger engagement
- [ ] no bid

---

## § 11 — Exit-trigger screening

> Complete immediately after the discovery call, before any work is scoped.
> Each rule is answered by the questions listed — confirm the outcome here.
> **STOP** blocks GO · **FLAG** needs a named owner before build · **WARN** is a commercial adjustment.

| Rule | Condition | Result | If triggered | Answered by | Outcome (triggered / clear) |
|---|---|---|---|---|---|
| 11.1 | A required Shopify feature needs a higher Shopify plan than the chosen plan (the consultant checks the plan requirements) | STOP | Confirm the plan the requirements need, or remove the feature from scope | Q1.1.6, Q1.2.3, Q1.2.6, Q2.1.4, Q3.1.1, Q3.1.4, Q3.1.7, Q4.1.4, Q4.2.1, Q5.1.3, Q5.1.6, Q6.1.4, Q6.2.3, Q6.2.5, Q6.2.10, Q6.2.11, Q7.5.2, Q9.2.10 | clear — target plan is Shopify Plus |
| 11.2 | B2B requires request-for-quote or prices negotiated per buyer (Shopify has no built-in RFQ) | FLAG | B2B architecture review: Shopify B2B draft-order review or a quote app (App Store category "Pricing quotes"), before build | Q6.2.6 | clear — fixed wholesale tiers, no RFQ |
| 11.3 | More than 5 Shopify Markets at launch | STOP | Larger Engagement: market roll-out waves and Markets architecture in the Discovery Phase | Q3.1.1 | clear — 3 markets |
| 11.4 | More than 6 distinct languages across all markets | STOP | Larger Engagement: translation and content operations in the Discovery Phase | Q3.1.1 | clear — 3 languages (de, fr, it) |
| 11.5 | More than 3 variant options per product (Shopify limit), or more than 2,048 variants on one product | FLAG | Product model review: combined listings, a product options app for non-stock options, or splitting products | Q2.1.2, Q2.1.3 | clear — max 2 variant options |
| 11.6 | Fully custom checkout UI — not possible on Shopify (checkout.liquid is retired; only Checkout Extensibility) | STOP | Composable platform | Q4.2.1 | clear — Checkout Extensibility only |
| 11.7 | More than 3 integrations at launch (counted per integration_definition) | STOP | Larger Engagement: integration architecture in the Discovery Phase | Q8.1.1 | clear — 2 counted integrations (ERP, PIM) |
| 11.8 | Regulated industry (pharma, alcohol, firearms, age-restricted, financial products, medical devices) | STOP | Legal / compliance review | Q1.1.3, Q10.4.1 | clear — not a regulated industry |
| 11.9 | PCI scope beyond Shopify-hosted payments (custom card UI, tokenisation, handling card data) | STOP | Security review (threat model mandatory) | Q4.1.5 | clear — Shopify-hosted checkout |
| 11.10 | GDPR / CCPA data export or deletion workflow required | FLAG | Legal sign-off on data-subject request handling | Q6.4.5 | **triggered** — owner: Lead Consultant |
| 11.11 | Grow retainer not signed on an M or L engagement | WARN | Grow retainer to be signed before delivery starts; otherwise commercial adjustment | Q10.3.4 | clear — retainer signed (12 months) |
| 11.12 | ERP or PIM with no existing Shopify connector and no iPaaS | FLAG | Separate integration scoping track (T3/T4) | Q8.1.1 | clear — ERP and PIM via Celigo (iPaaS) |
| 11.13 | fulfilment_locations > 2 AND routing beyond Shopify's native order routing rules (a custom routing Function or the ERP / OMS decides) | FLAG | Multi-location inventory scoping (T3) | Q5.1.3, Q5.1.4 | clear — 1 fulfilment location |
| 11.14 | Migration with significant SEO equity or complex historical data | FLAG | Dedicated migration scoping track — not combined with the store build sprint | Q8.2.3, Q8.2.4, Q8.2.5, Q8.2.6 | **triggered** — owner: Tech Lead |
| 11.15 | Weeks from kick-off (delivery.kickoff_date, else meta.created_at) to target go-live are fewer than the offer's minimum duration_weeks | FLAG | Re-scope to an MVP-first delivery before any sprint begins | Q10.1.1 | clear — 17 weeks from kick-off to go-live |
| 11.16 | No single decision-maker, or budget approval authority is unclear | FLAG | Named client decision-maker and budget owner confirmed before the statement of work is signed | Q10.2.2, Q10.2.3 | clear — decision-maker and budget authority confirmed |
| 11.17 | Sensitive personal data is collected (health, age, biometric or financial data; special-category data under GDPR art. 9) | FLAG | Data protection impact assessment and legal sign-off on data minimisation, storage location and consent before build | Q6.4.4 | clear — no sensitive data collected |
| 11.18 | Existing Shopify store uses retired or deprecated features (Shopify Scripts, checkout.liquid / additional scripts, online store script tags, legacy customer accounts, Stocky, Geolocation app) | FLAG | Deprecation migration scoped as its own workstream (e.g. Scripts to Functions, legacy to customer accounts) | Q1.2.5 | clear — no existing Shopify store |
| 11.19 | B2B requirement that Shopify B2B does not support (subscriptions, local delivery or pickup points, express checkouts, more than 500 line items, gift cards) | FLAG | B2B architecture review: app or process change before build | Q6.2.12 | clear — no unsupported B2B needs |
| 11.20 | Mainland China is a launch market — handled in a separate China discovery, outside this engagement | FLAG | Separate China discovery (docs/discovery/china-mainland.md); mainland China excluded from this engagement's scope | Q3.1.1 | clear — no mainland China |
| 11.21 | Mainland China is the only launch market — not part of the Merkle offering | STOP | China discovery (docs/discovery/china-mainland.md) | Q3.1.1 | clear — no mainland China |

---

## Completion checklist

- [ ] Every *required* question in §§ 0–10 has an answer or "TBC"
- [ ] At least one KPI has a baseline and a target (Q0.4.2)
- [ ] Every connected system is listed in Q8.1.1 with direction and connector
- [ ] § 11 outcome recorded for every rule; every STOP has a named resolution owner
- [ ] Consent for AI processing recorded (Q10.5.2)
