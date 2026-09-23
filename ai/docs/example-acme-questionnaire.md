<!-- Example — filled questionnaire for the fictional client ACME Watches SA. Consistent with discovery/tests/fixtures/engagements/acme-watches.json. -->

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

**Q0.2.1** — What is your current monthly ecommerce revenue (range and currency)? *(required)*

- min: 110,000
- max: 130,000
- currency: EUR

**Q0.2.2** — What is your current conversion rate (%)? *(required)*

> Answer: 1.2

**Q0.2.3** — Which product categories, markets or customer segments under-perform? *(optional)*

> Answer: Mobile sessions (0.7% conversion); Watches above EUR 500 convert at half the rate of watches below EUR 200

**Q0.2.4** — Is the main bottleneck acquisition (traffic), conversion (traffic doesn't buy) or retention (customers don't return)? *(required)*

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

**Q0.2.6** — How many orders per month do you expect in the first year? *(required)*
*Returns, tracking and fraud apps are priced by order volume.*

> Answer: 400

### 0.3 Operational pain

**Q0.3.1** — What manual work does your team do today that the platform should automate, and which processes break most often? *(required)*

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

**Q0.5.1** — What triggered this engagement — why Shopify, and why now? *(required)*

> Answer: WooCommerce cannot keep up on performance or scale, has no native multi-currency, and the wholesale channel needs B2B before the spring collection.

**Q0.5.2** — If you are moving from another platform, what must not be lost in the transition? *(recommended)*

> Answer: 4,200 indexed product and category URLs; Customer accounts; Order history

**Q0.5.3** — What are you most unhappy with in the current store or set-up? *(recommended)*

> Answer: Slow page speed; No multi-currency; Admin UX

**Q0.5.4** — Which platform are you migrating from (or none — greenfield)? *(required)*
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

### 0.6 Budget

**Q0.6.1** — What is the approximate budget envelope for this project (range and currency)? *(required)*

- min: 60,000
- max: 80,000
- currency: EUR

**Q0.6.2** — Is the priority to minimise upfront cost (apps and configuration), to own the solution (custom build), or a balance? *(required)*

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
*B2B or hybrid brings the B2B and wholesale questions (§ 6.2).*

*(tick one)*
- [ ] dtc
- [ ] b2b
- [x] hybrid

**Q1.1.5** — Current website URL. *(optional)*

> Answer: https://www.acme-watches.example

**Q1.1.6** — Do you sell through more than one legal entity (e.g. one per country or region)? List them. *(required)*
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

**Q1.1.8** — How many distinct customer-facing brands does this engagement need a Shopify storefront for? *(required)*
*A brand two customers would recognise as different names, logos or identities — not a market or a product line under the same brand.*

> Answer: 1

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

**Q1.2.6** — How many people need their own Shopify admin login after go-live? *(required)*
*Collaborator accounts and POS-only staff are not counted.*

> Answer:

### 1.3 Brand & positioning

**Q1.3.1** — How would you describe the brand's positioning: value, mid-market, premium, luxury or enterprise? *(required)*
*Positioning shapes the design depth and the solution approach.*

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
*Shopify allows up to 3 options per product; more options need a different product model.*

> Answer: 2 (case size, strap)

**Q2.1.3** — What is the maximum number of variants on a single product? *(required)*
*Shopify allows up to 2,048 variants per product.*

> Answer: 12

**Q2.1.4** — Are variants such as colours managed as separate products (own SKUs, images, URLs) that should appear as one product on the storefront? *(required)*
*This is what Shopify calls combined listings.*

- [ ] Yes
- [ ] No

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
*Ask if Q2.2.1 includes Subscription.*
*Shopify Subscriptions: customers skip, pause and cancel in their account; not with bundles or B2B.*

- approach:
- subscription app:

**Q2.2.3** — If you sell bundles: what must they do? *(recommended)*
*Ask if Q2.2.1 includes Fixed bundle, Multipack, Mix and match bundle or Bundle.*
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
*Ask if Q2.2.1 includes Subscription.*

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
*Ask if Q2.2.1 includes Pre order.*
*Pre-orders need a pre-order app; express checkouts (Shop Pay, Apple Pay, Google Pay) are not available for pre-orders.*

*(tick one)*
- [ ] full at order
- [ ] deposit then balance
- [ ] charged at fulfilment

**Q2.2.6** — Do customers personalise products with choices that are not stock variants (engraving, file upload, paid add-ons, configurators)? *(recommended)*
*Ask if Q2.1.2 is 3 or more, or Q2.2.1 includes Made to order.*

*(tick all that apply)*
- [ ] text engraving
- [ ] file upload
- [ ] paid add ons
- [ ] conditional options
- [ ] configurator 3d
- [ ] none

### 2.3 Catalogue data

**Q2.3.1** — Roughly how many collections? *(optional)*

> Answer: 60

**Q2.3.2** — Are collections manual, rule-based (automated), or mixed? *(optional)*

*(tick one)*
- [ ] manual
- [ ] automated
- [x] mixed

**Q2.3.3** — Which product attributes go beyond Shopify's standard fields (technical specs, certifications, fit guides, ingredients)? *(required)*
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

**Q2.4.1** — Are there special prices for consumer groups (VIP or member prices)? *(recommended)*
*Prices for business customers are covered in § 6.2. Consumer group prices use discounts for customer segments or an app.*

- [x] Yes
- [ ] No

**Q2.4.2** — Are there volume offers for shoppers (e.g. 3 for 2, tiered discounts)? *(recommended)*
*Automatic discounts and buy X get Y cover most volume offers natively. Business volume pricing is covered in § 6.2.*

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
*Ask if Q2.2.1 includes Pre order, or Q2.1.1 is 500 or more.*
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

**Q3.1.1** — Which countries do you sell to at launch? For each: the country, the currency customers pay in, the languages, the web address customers use there today, how prices are set, which of your companies invoices the customer, whether the range is the same as in your main country, and who runs that country day to day. *(required)*
*One row per country. Leave a cell blank if you do not know it — we will come back to it.*

| code | currency | languages | domain | price strategy | selling entity | assortment | run by |
|---|---|---|---|---|---|---|---|
| CH | CHF | de, fr, it | ch.acme-watches.example | manual | ACME Watches AG | same | central |
| DE | EUR | de | de.acme-watches.example | manual | ACME Watches AG | same | central |
| AT | EUR | de | at.acme-watches.example | manual | ACME Watches AG | same | central |

**Q3.1.2** — Which are the primary markets (one or more country or market codes)? *(required)*
*The markets that lead revenue and launch priority, e.g. US and EU for a global brand.*

> Answer: CH

**Q3.1.3** — Which countries are planned in the next 12 months? *(optional)*

> Answer: FR; IT

**Q3.1.4** — Stated preference only — does the client already have a view on running all countries from one store or giving some countries their own store? Record it as their view, not as the answer. *(optional · consultant)*
*Recorded as a stated preference. It never decides the recommendation; where it differs, the closing document argues the gap.*

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

**Q3.1.7** — Should any market have its own theme content, section order, checkout or customer-account settings? *(required)*

- [ ] Yes
- [ ] No

**Q3.1.8** — Are some products not allowed to be sold in certain markets (regulation, registration, licensing or distribution agreements)? *(recommended)*
*List them in a note. In Shopify, products are excluded from the catalog of that market.*

- [ ] Yes
- [ ] No

### 3.2 Language

**Q3.2.1** — How will translation be handled? *(recommended)*
*Ask if Q3.1.1 has 3+ languages.*
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
*Ask if Q3.1.1 has 3+ languages.*
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

### 3.4 Tax & duties

**Q3.4.1** — Should duties and import taxes be collected at checkout (DDP)? *(recommended)*
*Duties and import taxes can be charged at checkout (DDP) or paid by the customer on delivery (DAP), chosen per country. Needs HS codes (and country of origin) on products; not combinable with tax overrides, manual tax rates or customer tax exemptions; DDP labels only with some carriers.*

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

**Q3.4.8** — In which countries should duties and import taxes be collected at checkout (DDP)? In the others the customer pays on delivery (DAP). *(recommended)*
*Skip if Q3.4.1 = no.*
*Country codes, e.g. US, GB, CH. One choice per country: DDP and DAP can't both be offered in the same country.*

> Answer:

**Q3.4.9** — When you ship low-value parcels into these territories from outside them, are you registered to collect the import VAT or GST at checkout? *(recommended)*
*Ask if Q3.1.1 has 2+ markets.*
*Low-value parcels into the EU (IOSS), the UK, Switzerland, Norway (VOEC), Australia and New Zealand. Tick the schemes you are registered for.*

*(tick all that apply)*
- [ ] EU Import One-Stop Shop (IOSS)
- [ ] UK low-value VAT
- [ ] Switzerland low-value VAT
- [ ] Norway VOEC
- [ ] Australia GST on low-value imports
- [ ] New Zealand GST on low-value imports
- [ ] None
- [ ] Not sure yet

**Q3.4.10** — Do some products have reduced or zero tax rates, or tax exemptions, in any market (e.g. medicines, books, food, children's clothing)? *(recommended)*
*Finance confirms the rates; Merkle does not give tax advice.*

- [ ] Yes
- [ ] No

**Q3.4.11** — Who issues invoices to customers? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include GB / DE / FR / IT / PL / BE / ES / EU / AT / NL / PT / IE / SE / DK / FI.*
*Shopify can generate VAT invoices for EU and UK orders (shown on the order status page, not emailed, not for orders with duties). The free Order Printer app prints invoices from templates. Invoices can also come from the ERP or an invoicing app.*

*(tick one)*
- [ ] Shopify VAT invoices (EU and UK)
- [ ] Shopify Order Printer
- [ ] Invoicing app
- [ ] ERP
- [ ] Billing or tax service
- [ ] Not sure yet

**Q3.4.12** — Which electronic invoicing (e-invoicing) obligations apply to your sales? *(recommended)*
*Ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include DE / FR / IT / PL / BE / ES / EU.*
*For example Peppol, XRechnung or ZUGFeRD (Germany), Factur-X (France), SdI (Italy), KSeF (Poland) or VeriFactu (Spain). Shopify has no built-in e-invoicing: it comes from the ERP or an invoicing app.*

*(tick all that apply)*
- [ ] Peppol
- [ ] Germany: XRechnung or ZUGFeRD
- [ ] France: Factur-X
- [ ] Italy: SdI
- [ ] Poland: KSeF
- [ ] Spain: VeriFactu
- [ ] Other
- [ ] None
- [ ] Not sure yet

**Q3.4.13** — If selling in a country meant registering for tax there and filing returns, would you take that on yourself, or would you rather a partner were the legal seller for those orders? *(recommended)*
*Answer for the countries you sell to but are not registered in today.*

*(tick one)*
- [x] own registrations
- [ ] prefer partner
- [ ] mixed
- [ ] Not sure yet

**Q3.4.14** — How will you sell across borders: Shopify Markets with your own tax registrations, Shopify’s Managed Markets, or a third-party merchant-of-record app? *(recommended)*
*Ask if Q3.1.1 has 2+ markets.*
*With Markets you sell in your own name and handle tax per country. A merchant of record sells in its own name and takes on tax and compliance for you. Shopify’s Managed Markets (Global-e as merchant of record) is only available to merchants based in the continental US and certain stores in Canada and the UK — not to a store based in Switzerland.*

Answer: Shopify Markets, with our own tax registrations

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

**Q3.5.4** — Do you have a Hong Kong or other overseas entity that can sell cross-border, and are your trademarks registered in China? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Cross-border marketplaces require both.*

> Not applicable — mainland China is not a launch market.

**Q3.5.5** — ICP status for a China website? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Your PRC counsel confirms whether a filing is enough or a commercial ICP licence is needed.*

> Not applicable — mainland China is not a launch market.

**Q3.5.6** — What is Shopify's role for mainland China? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*
*Shopify can stay the global master for products, inventory and orders while China sells through local channels.*

> Not applicable — mainland China is not a launch market.

**Q3.5.7** — How will goods enter China: bonded warehouse (1210), direct mail (9610), general trade, or personal parcels? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Cross-border channels have per-order and yearly limits per consumer.*

> Not applicable — mainland China is not a launch market.

**Q3.5.8** — Are your products on China's cross-border e-commerce positive list? *(optional)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.9** — How are your products classified in China? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Whitening, sunscreen and anti-hair-loss products are special cosmetics; medicines are not cross-border goods.*

> Not applicable — mainland China is not a launch market.

**Q3.5.10** — Registration or filing status with China's medical products administration (NMPA)? *(optional)*
*Only if the launch markets include mainland China (CN).*
*General trade needs registration or filing; cross-border channels are exempt for goods on the positive list.*

> Not applicable — mainland China is not a launch market.

**Q3.5.11** — Do product claims need a review for China (medical, cosmeceutical or treatment claims)? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*
*China does not allow cosmeceutical or medical claims for cosmetics.*

> Not applicable — mainland China is not a launch market.

**Q3.5.12** — How will mainland customers pay? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Inside the marketplace, Alipay and WeChat Pay through a Hong Kong Shopify Payments account (early access), a cross-border wallet provider, or domestic merchant accounts (PRC entity).*

> Not applicable — mainland China is not a launch market.

**Q3.5.13** — How many mainland China customers do you expect per year? *(optional)*
*Only if the launch markets include mainland China (CN).*
*China's personal information law sets different data-export obligations by volume.*

> Not applicable — mainland China is not a launch market.

**Q3.5.14** — Do you have a representative in China for personal information protection (PIPL)? *(optional)*
*Only if the launch markets include mainland China (CN).*
*Required when an offshore business targets consumers in China.*

> Not applicable — mainland China is not a launch market.

**Q3.5.15** — Where will China customer data (CRM, email, analytics) be stored? *(optional)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.16** — Must scripts blocked in China (Google Fonts, Google Analytics, reCAPTCHA, Meta pixels, YouTube) be replaced? *(optional · consultant)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.17** — Which marketing channels for China? *(optional)*
*Only if the launch markets include mainland China (CN).*

> Not applicable — mainland China is not a launch market.

**Q3.5.18** — Who provides Chinese-language customer service? *(optional)*
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

**Q4.1.4** — Do you need payouts in more than one currency? *(required)*

- [x] Yes
- [ ] No

**Q4.1.5** — Will card data be handled only by Shopify-hosted checkout, by a third-party hosted payment page, or by custom card UI / tokenisation? *(required · consultant)*
*Card data handled outside Shopify-hosted checkout needs a separate security review.*

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
*Shopify checkout is customised with the checkout editor and Checkout Extensibility (blocks, fields, logic via Functions). A fully custom checkout UI is not possible on Shopify.*

*(tick all that apply)*
- [x] branding in editor
- [ ] thank you order status blocks
- [x] checkout step blocks or fields
- [ ] checkout branding api styling
- [ ] backend logic functions
- [ ] fully custom checkout ui
- [ ] none

**Q4.2.2** — Which checkout extensions are needed? *(optional · consultant)*
*Skip if Q4.2.1 = None.*

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
*Ask if Q1.3.1 is Premium, Luxury or Enterprise.*
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
*Skip if Q5.1.1 = In house.*

> Answer: n/a (skipped)

**Q5.1.3** — How many locations will fulfil online orders (warehouses, 3PL locations and stores that ship orders), and in which countries are they? *(required)*
*Physical stores that sell in person are counted separately in § 5.6.*

> Answer: 1 — CH

**Q5.1.4** — How should Shopify pick the fulfilling location? *(required)*
*Shopify's order routing rules: minimise split shipments, stay within the market, closest location, ranked locations, location metafields. Anything else needs a custom routing function or the ERP / OMS.*

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

**Q5.1.6** — How are shipping rates calculated? *(required)*
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
*Local delivery and pickup in store are native. Pickup points are native only for stores in France, Italy, Spain and the UK (with some carriers); elsewhere they need a delivery app or a custom solution. Delivery time slots need an app; ship from store needs Shopify POS.*

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

**Q5.1.13** — Do all products have accurate weights (and package sizes), and where does that data come from? *(recommended)*
*Ask if Q5.1.6 includes Weight or price based, Live carrier rates or Rates from an app.*
*Weight-based and carrier-calculated rates, shipping labels and some duties calculations need product weights.*

*(tick one)*
- [ ] From the PIM or ERP
- [ ] Maintained in Shopify
- [ ] Only for some products
- [ ] Not available yet
- [ ] Not sure yet

**Q5.1.14** — Do any products count as dangerous goods for shipping? *(recommended)*
*E.g. aerosols (sprays, some sunscreens), flammable liquids (perfumes, alcohol-based products), lithium batteries, dry ice. They usually need their own delivery profile and carrier arrangements.*

*(tick all that apply)*
- [ ] Aerosols
- [ ] Flammable liquids
- [ ] Lithium batteries
- [ ] Dry ice
- [ ] Other hazardous materials
- [ ] None
- [ ] Not sure yet

**Q5.1.15** — Does a single order ever need to go to more than one address — gifts to several recipients, or one wholesale order split across branches? *(recommended)*
*Different from an order arriving in several parcels, which Shopify does on its own.*

- [ ] Yes
- [x] No

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
*Ask if Q1.2.1 is yes, or Q0.2.6 is 500 or more.*

> Answer:

**Q5.2.5** — How many days do customers have to return an order? *(recommended)*

> Answer: 30

**Q5.2.6** — What share of orders is returned today (%)? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
*High return rates or volumes usually justify a returns platform instead of Shopify's native self-serve returns.*

> Answer: 8

**Q5.2.7** — How do customers send items back: prepaid label, QR code drop-off, their own shipment, or mixed? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
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
*Ask if Q0.2.6 is 500 or more.*
*Customers can't choose an exchange in Shopify's return form; staff add exchange items when approving. Customer-chosen exchanges need an app.*

*(tick all that apply)*
- [x] same product variant
- [ ] any product
- [ ] store credit first

**Q5.2.10** — Do you accept international returns (including refunding duties)? *(optional)*
*Ask if Q3.1.1 has 2+ markets.*

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

**Q5.4.2** — Should customers be able to cancel orders themselves? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
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
*Ask if Q0.2.6 is 500 or more.*
*Staff can edit orders natively; customers editing their own orders needs an app.*

- [ ] Yes
- [x] No

**Q5.4.6** — How are refunds paid: to the original payment method, as store credit, or as a gift card? *(recommended)*

*(tick all that apply)*
- [x] original payment
- [x] store credit
- [ ] gift card

**Q5.4.7** — When is a refund issued: on request, when the carrier scans the return, on receipt, or after inspection? *(recommended)*
*Ask if Q0.2.6 is 500 or more.*
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
*Ask if Q5.4.2 is yes.*

- [ ] Yes
- [ ] No

### 5.5 Post-purchase experience

**Q5.5.1** — Do you want a branded order-tracking page on your own site? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise.*
*Shopify includes an order status page and shipping emails. A branded tracking page, proactive carrier alerts or delivery estimates usually need a post-purchase app.*

- [ ] Yes
- [x] No

**Q5.5.2** — On which channels should customers get proactive delivery updates (delays, out for delivery)? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise.*

*(tick all that apply)*
- [x] email
- [ ] sms
- [ ] whatsapp
- [ ] push

**Q5.5.3** — Should product pages or checkout show estimated delivery dates? *(optional)*
*Ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise.*
*Shopify can show delivery dates at checkout: manual dates everywhere, automatic dates only for US fulfilment locations.*

- [x] Yes
- [ ] No

**Q5.5.4** — Do customers need to open warranty, repair or servicing claims online? *(recommended)*
*Ask if Q1.1.3 mentions watch, jewel, electronic, appliance, furniture, bike, bicycle, tool, device or luxury.*

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

**Q6.1.3** — What should the account area include (order history, addresses, returns, wishlist, subscriptions)? *(required)*

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

**Q6.1.4** — How should customers sign in? *(required)*
*One-time email code and Google or Facebook sign-in are native.*

*(tick all that apply)*
- [ ] email code
- [ ] google facebook
- [ ] shop
- [ ] company sso identity provider
- [ ] sign in from another site

### 6.2 B2B & wholesale

**Q6.2.2** — Do B2B customers need company accounts with their own login? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [x] Yes
- [ ] No

**Q6.2.3** — Do B2B customers get company-specific price lists? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Business price lists are B2B catalogs.*

- [x] Yes
- [ ] No

**Q6.2.4** — Are there B2B volume discounts or quantity rules? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [x] No

**Q6.2.5** — Which payment terms are needed (net 30, invoice, purchase order)? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

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
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Shopify has no built-in request-for-quote: orders can be submitted for review as drafts, or a quote app handles negotiation.*

- [ ] Yes
- [x] No

**Q6.2.7** — Must B2B accounts be approved before they can order? *(optional)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Native: a wholesale application form (Shopify Forms) plus Flow to create and approve companies.*

- [x] Yes
- [ ] No

**Q6.2.8** — Native Shopify B2B or an app? *(recommended · consultant)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

*(tick one)*
- [x] shopify b2b
- [ ] shopify b2b plus apps
- [ ] b2b app only
- [ ] separate b2b expansion store
- [ ] undecided

**Q6.2.9** — How many B2B accounts are expected within 12 months? *(optional)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

> Answer: 500

**Q6.2.10** — How many distinct B2B price lists (catalogs) do you need, and must any be specific to one company? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- catalog count:
- company specific catalogs:

**Q6.2.11** — Should B2B buyers see a different storefront or checkout from consumers? *(required)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*

- [ ] Yes
- [ ] No

**Q6.2.12** — Do B2B orders need any of these: subscriptions, local delivery or pickup points, express checkouts, more than 500 line items, gift cards? *(required · consultant)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*Shopify B2B does not support these.*

*(tick all that apply)*
- [ ] subscriptions
- [ ] local delivery or pickup points
- [ ] express checkouts
- [ ] over 500 line items
- [ ] gift cards
- [ ] none

**Q6.2.13** — Which shipping rules differ for B2B buyers? *(recommended)*
*Skip if Q1.1.4 = Direct to consumer (DTC).*
*By default B2B and consumer buyers see the same shipping methods. Different options need Checkout Blocks, an app or a delivery customization function; orders can also be submitted as drafts so shipping is quoted before payment.*

*(tick all that apply)*
- [ ] Separate rates or methods
- [ ] Free shipping above an order value
- [ ] Freight or pallet delivery
- [ ] Buyer's own carrier account
- [ ] Shipping quoted after the order
- [ ] None
- [ ] Not sure yet

**Q6.2.14** — Is the wholesale side of the business run by its own team, with its own targets or its own profit and loss? *(recommended)*
*We are asking about how the business is organised, not about the website.*

- [ ] Yes
- [x] No

### 6.3 Loyalty & segmentation

**Q6.3.1** — Which loyalty components are planned? *(recommended)*
*Ask if Q1.1.4 is Direct to consumer (DTC) or Hybrid (DTC and B2B).*
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

**Q6.4.1** — Which privacy laws apply to your customers (GDPR, UK GDPR, CCPA, Swiss nFADP, other)? *(required)*

*(tick all that apply)*
- [x] gdpr
- [ ] uk gdpr
- [ ] ccpa
- [x] nfadp
- [ ] other

**Q6.4.2** — Cookie consent: Shopify's cookie banner or a consent management platform? Name the tool if known. *(recommended)*
*Ask if Q6.4.1 includes GDPR (EU), UK GDPR, Swiss nFADP or CCPA (US).*
*Shopify's cookie banner is native; a third-party platform must integrate Shopify's Customer Privacy API.*

- cookie consent tool: Cookiebot

**Q6.4.3** — Is explicit opt-in required for marketing emails? *(recommended)*

- [x] Yes
- [ ] No

**Q6.4.4** — Do you collect sensitive personal data (health, age, biometric, financial)? *(required)*
*Sensitive data needs a data protection impact assessment and legal sign-off.*

- [ ] Yes
- [x] No

**Q6.4.5** — Must data-access or deletion requests reach systems beyond Shopify (ERP, email platform) or run without staff involvement? *(required)*
*Shopify handles export and erasure requests in admin; other systems or automation need extra design and legal sign-off.*

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

### 6.5 Customer service

**Q6.5.1** — Where will customer questions be answered after launch: Shopify Inbox, a helpdesk app, a helpdesk outside Shopify, email only, or nowhere yet? *(required)*
*Shopify Inbox is free and lives in the admin. A helpdesk such as Gorgias or Zendesk pulls order context in and usually needs a connection built.*

*(tick one)*
- [x] helpdesk app
- [ ] shopify inbox
- [ ] external helpdesk
- [ ] email only
- [ ] none

**Q6.5.2** — Which helpdesk, if one is named? *(recommended)*
*The product name, not a person.*

> Answer: Gorgias

**Q6.5.3** — Where should the storefront contact form deliver: an email inbox, the helpdesk, a CRM, or is there no form? *(required)*
*Shopify themes ship a contact form that sends email. Anything else is a connection somebody builds and maintains.*

*(tick one)*
- [x] into the helpdesk
- [ ] email only
- [ ] into a crm
- [ ] none

**Q6.5.4** — Does your team create orders for customers — by phone, in a showroom, or for wholesale buyers? *(required)*
*In Shopify this is a draft order: staff build the order in the admin and send an invoice to pay.*

- [x] Yes
- [ ] No

**Q6.5.5** — Do customers book a slot with you — an in-store appointment, a virtual consultation, or both? *(recommended)*
*Ask if Q5.6.1 is 1 or more, or Q2.2.1 includes Virtual or Made to order, or Q0.3.1 mentions appointment, booking, consultation, fitting, showroom or reservation.*
*Booking is not a Shopify feature; it is an App Store category, and the app is what holds the calendar.*

*(tick one)*
- [ ] in store appointments
- [x] virtual consultations
- [ ] both
- [ ] none
- [ ] not sure yet

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
*Ask if Q0.2.6 is 500 or more, or Q0.1.1 mentions conversion, tracking, attribution, advert, ads, roas or acquisition.*
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

**Q7.3.3** — Where are customer segments kept: in Shopify, or in the email platform? *(recommended)*
*The system that owns the segments is where they are built and where the other one reads them from.*

Answer: Shopify

**Q7.3.4** — Do you send SMS marketing, and to which countries? *(recommended)*
*Ask if Q0.2.6 is 500 or more, or Q0.4.1 mentions sms, retention or repeat.*

- enabled:
- countries:

**Q7.3.5** — Do you send WhatsApp marketing? *(optional)*
*Native in Shopify Messaging.*

- [ ] Yes
- [ ] No

### 7.4 Reviews & affiliates

**Q7.4.1** — Which product reviews app is used or preferred? *(optional)*
*Ask if Q1.2.1 is yes, or Q0.5.4 is not None.*
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

**Q7.5.2** — Which discounts must combine on one order? *(required)*
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

**Q7.6.8** — Do promotions differ by market — a campaign or a discount that runs in one country only? *(optional)*
*Ask if Q3.1.1 has 2+ markets.*

Answer: No

**Q7.6.9** — Do you run scheduled drops or flash sales with high traffic? *(optional)*
*Scheduled theme and checkout changes are native (Rollouts).*

- [ ] Yes
- [ ] No

### 7.7 AI & agentic commerce

**Q7.7.1** — Do you want your products to be found and bought inside AI assistants such as ChatGPT, Google AI or Copilot? *(recommended)*
*AI assistants are becoming a shopping channel. Shopify already switches eligible stores on by default, so this is a decision to confirm or reverse, not one to postpone.*

- [x] Yes
- [ ] No

**Q7.7.2** — Should Shopify enrol you automatically in new AI channels as they appear, or do you want to approve each one? *(recommended)*
*The default setting also enrols you in channels that do not exist yet.*

*(tick one)*
- [ ] Shopify managed
- [x] Per channel
- [ ] Off
- [ ] Not sure yet

**Q7.7.3** — Should shoppers be able to pay inside the AI assistant, or should they come to your store to check out? *(recommended)*
*Paying in the assistant converts better; sending them to your store keeps the full journey, the upsells and the analytics.*

*(tick one)*
- [ ] All channels
- [ ] Selected channels
- [ ] Off
- [x] Not sure yet

**Q7.7.4** — Do you sell to customers in the United States? *(recommended)*
*Some AI channels are only open to merchants selling to US buyers, wherever the business is based.*

- [ ] Yes
- [x] No

**Q7.7.5** — Who can accept Shopify's additional terms for selling through AI channels? *(recommended)*
*Selling through these channels requires accepting separate terms — usually legal or procurement, not the ecommerce team.*

Managing Director, with the Finance Controller informed.

> Answer:

**Q7.7.6** — Are you comfortable sharing the customer's name, e-mail, phone and address with an AI channel when they buy inside it? *(recommended)*
*This is a data-protection decision. Under GDPR it usually needs a documented review before launch.*

*(tick one)*
- [ ] Approved
- [ ] Refused
- [x] Needs legal review

**Q7.7.7** — How complete is your product data — titles, images, prices, descriptions and variants? *(recommended)*
*AI channels only list products whose data is complete. Gaps make products invisible rather than badly presented.*

*(tick one)*
- [ ] Complete
- [x] Only for some products
- [ ] Not sure yet

**Q7.7.8** — Is important product information kept in custom fields, separate records or inside the product title (for example “Steel 40mm — Automatic”)? *(optional)*
*Data that lives in custom fields or in the title needs mapping before AI channels can read it.*

- [x] Yes
- [ ] No

**Q7.7.9** — Should AI crawlers be allowed, restricted or blocked on your website? *(optional)*
*Blocking crawlers does not remove your products from AI shopping channels; it only affects what they read from your public site.*

*(tick one)*
- [x] Allow all
- [ ] Selective
- [ ] Block
- [ ] Not sure yet

**Q7.7.10** — Do you want to control the answers AI assistants give about shipping, returns and sizing? *(optional)*
*Shopify has a free app that publishes your FAQs for assistants and logs what shoppers ask.*

- [x] Yes
- [ ] No

**Q7.7.11** — Do you plan to offer your own AI shopping assistant, or connect the store to agent platforms yourself? *(optional)*
*Parts of this are still early access at Shopify, so treat it as exploration rather than fixed scope.*

*(tick one)*
- [ ] Now
- [x] Later
- [ ] No
- [ ] Not sure yet

**Q7.7.12** — Which Shopify AI tools do you want your team to use in day-to-day work? *(optional)*
*These are back-office tools for your team, not customer-facing.*

*(tick all that apply)*
- [x] Sidekick
- [x] Shopify magic
- [x] Semantic search
- [ ] Knowledge base
- [ ] None
- [ ] Not sure yet

**Q7.7.13** — Existing Shopify store: what do the agentic sales-channel settings show today (Sales channels → Agentic)? *(recommended · consultant)*
*Skip if Q1.2.1 = no.*
*Check the admin with the client: enrolment mode, which channels are on, and whether checkout inside the assistant is enabled.*

*(tick one)*
- [ ] Shopify managed
- [ ] Per channel
- [ ] Off
- [x] Not sure yet


---

## § 8 — Integrations & migration

> Every system that exchanges data with the store, and what moves from the current platform.

### 8.1 Connected systems

**Q8.1.1** — List every system that exchanges product, inventory, order, customer or financial data with the store. For each: system, category, direction, data objects, frequency, connector (native app / iPaaS / custom / none), owner, status. *(required)*
*Typical ownership: the PIM supplies products, attributes and translations; the ERP supplies prices (including B2B catalogs), inventory per location and order status.*

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

**Q8.2.2** — Which data must be migrated? *(recommended)*
*Skip if Q0.5.4 = None.*
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

**Q8.2.3** — Approximate volumes: products, customers, orders, URL redirects. *(required)*
*Skip if Q0.5.4 = None.*

- products: 800
- customers: 25,000 (approximate — to be confirmed)
- orders: 60,000 (approximate — to be confirmed)
- redirects: 4,200

**Q8.2.4** — Must historical orders be available inside Shopify? *(required)*
*Skip if Q0.5.4 = None.*

- [x] Yes
- [ ] No

**Q8.2.5** — How much SEO equity (rankings, backlinks) must be preserved? *(required · consultant)*
*Skip if Q0.5.4 = None.*

*(tick one)*
- [ ] none
- [ ] moderate
- [x] significant

**Q8.2.6** — Must active subscriptions move to the new store without customers re-entering cards? *(required)*
*Skip if Q0.5.4 = None.*

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

**Q9.1.6** — How many bespoke sections or blocks does the storefront need, beyond the ones the theme already has? *(recommended)*
*A section designed and built for you — not one of the theme's own, configured. Count the distinct ones, not how many pages use them.*

> Answer: 3

### 9.2 Storefront

**Q9.2.1** — Is a headless storefront required (Hydrogen, another framework, or a native app front end)? *(required)*
*Headless means a custom front end built on Shopify; checkout stays Shopify checkout.*

- [ ] Yes
- [x] No

**Q9.2.2** — Any theme licence to keep? *(optional)*
*New builds start from Shopify's Horizon theme; a third-party theme licence only matters for a non-Horizon base.*

> Answer: Horizon

**Q9.2.3** — What is the aesthetic direction (minimal, editorial, luxury, playful, utilitarian)? *(optional)*

> Answer: Minimal, editorial product photography

**Q9.2.4** — Which interactive patterns are required (mega-menu, quick-add, swatches, predictive search, lookbook, video hero)? *(required)*

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

**Q9.2.11** — Which front end: Shopify Hydrogen, or another framework? *(recommended · consultant)*
*Skip if Q9.2.1 = no.*

*(tick one)*
- [ ] hydrogen
- [ ] other framework
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

**Q9.2.10** — Do you want to A/B test themes or checkout configurations? *(required)*
*Native with Shopify Rollouts experiments.*

- [ ] Yes
- [ ] No

**Q9.2.12** — Do you want a presence inside Shopify’s Shop app — a Shop Mini? *(recommended)*
*A full-screen shopping experience inside the Shop app. It is not your own app and not a headless storefront.*

*(tick one)*
- [ ] now
- [x] later
- [ ] no
- [ ] not sure yet

**Q9.2.13** — Beyond the first, how many storefronts need a genuinely different design — a different layout and page structure, rather than different content, imagery or translations? *(recommended)*
*Different content, imagery and translations per market are in every offer. A different design is a second theme, and that is a different thing: Shopify’s per-market customisation reaches section content and block visibility only, never theme settings and never Liquid templates. Answer 0 if one design serves every market and store.*

Answer: 0

**Q9.2.14** — Does each brand need its own design system — its own tokens and components — rather than one design system with a theme per brand? *(recommended)*
*Ask if Q1.1.8 is 2 or more.*
*One design system can carry several brands: the same components, with each brand’s colours, typography and imagery as tokens, and a different layout where a brand needs one. A design system per brand means separate tokens and components, designed and maintained apart.*

Answer: not applicable — one brand

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
*A date sooner than the delivery time the scope needs leads to a phased, MVP-first plan.*

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
*A single decision-maker must be named before the statement of work.*

- [x] Yes
- [ ] No

**Q10.2.3** — Is budget approval authority clear? *(required · consultant)*

- [x] Yes
- [ ] No

**Q10.2.4** — Which roles will run the store day to day — for example merchandising, customer service, finance, marketing — each needing its own staff permissions? *(recommended)*
*Roles, not names. Each role gets its own set of permissions rather than one shared login.*

Answer: merchandising, customer service, finance

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

- [x] Yes
- [ ] No

**Q10.3.5** — Retainer length in months. *(recommended · consultant)*
*Skip if Q10.3.4 = no.*

> Answer: 12

**Q10.3.6** — Will the client re-verify apps and Shopify features at each Shopify Edition after launch? *(optional · consultant)*

- [ ] Yes
- [ ] No

**Q10.3.7** — Should hypercare after go-live run thirty days instead of fifteen? *(recommended)*
*Every offer includes fifteen days of hypercare: a named channel, a response within one working day, and defects triaged with you. Thirty days is priced on top.*

Answer: No

### 10.4 Legal & regulated industries

**Q10.4.1** — Is the business in a regulated industry (pharma, alcohol, firearms, age-restricted goods, financial products, medical devices)? If yes, which? *(required)*
*A regulated industry needs legal review. Shopify has its own rules: e.g. alcohol needs age verification; some business types can't use Shopify Payments.*

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

---

## Completion checklist

- [ ] Every *required* question in §§ 0–10 has an answer or "TBC"
- [ ] At least one KPI has a baseline and a target (Q0.4.2)
- [ ] Every connected system is listed in Q8.1.1 with direction and connector
- [ ] Consent for AI processing recorded (Q10.5.2)
