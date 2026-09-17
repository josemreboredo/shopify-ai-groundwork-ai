<!-- GENERATED FILE — do not edit. Source: schema/question-bank.json + schema/offering.json. Re-render: npm run questionnaire:render -->

# Shopify Discovery Questionnaire

> **Version:** question bank 1.0.0 · offering 1.1.0
>
> **How to use:** work through §§ 0–10 with the client in the discovery call (60–90 min),
> then complete § 11 straight after. Answer every *required* question — "TBC" is acceptable,
> a blank is not. Questions marked *consultant* are answered by the lead consultant, not the client.
>
> **Output:** the completed questionnaire is the input to the discovery engine, which produces
> the engagement spec, offer classification, capability map, closing deck and backlog.
>
> **Personal data:** do not record customer personal data. Stakeholder names are optional.

---

## § 0 — Business outcomes

> What is broken before what to build. This section is the primary brief: every capability we scope must trace back to an answer here.

### 0.1 The core problem

**Q0.1.1** — What is the single biggest thing preventing your ecommerce from growing right now? *(required)*

> Answer:

**Q0.1.2** — How long has this been a problem, and what have you already tried to fix it? *(recommended)*

> Answer:

**Q0.1.3** — If we solved only one thing in this engagement, what would have the highest business impact? *(recommended)*

> Answer:

### 0.2 Revenue & conversion

**Q0.2.1** — What is your current monthly ecommerce revenue (range and currency)? *(recommended)*

- min:
- max:
- currency:

**Q0.2.2** — What is your current conversion rate (%)? *(recommended)*

> Answer:

**Q0.2.3** — Which product categories, markets or customer segments under-perform? *(optional)*

> Answer:

**Q0.2.4** — Is the main bottleneck acquisition (traffic), conversion (traffic doesn't buy) or retention (customers don't return)? *(recommended)*

*(tick one)*
- [ ] acquisition
- [ ] conversion
- [ ] retention
- [ ] mixed
- [ ] unknown

### 0.3 Operational pain

**Q0.3.1** — What manual work does your team do today that the platform should automate, and which processes break most often? *(recommended)*

> Answer:

**Q0.3.2** — How many hours per week does the team spend on workarounds? *(optional)*

> Answer:

### 0.4 Growth goals & KPIs

**Q0.4.1** — What does success look like in 12 months (revenue, new markets, channels, customer volume)? *(required)*

> Answer:

**Q0.4.2** — Which KPIs will measure success? For each: metric, today's baseline, target, horizon in months. *(required)*

| metric | baseline | target | horizon months |
|---|---|---|---|
| | | | |

### 0.5 Platform context

**Q0.5.1** — What triggered this engagement — why Shopify, and why now? *(recommended)*

> Answer:

**Q0.5.2** — If you are moving from another platform, what must not be lost in the transition? *(recommended)*

> Answer:

**Q0.5.3** — What are you most unhappy with in the current store or set-up? *(recommended)*

> Answer:

### 0.6 Budget

**Q0.6.1** — What is the approximate budget envelope for this project (range and currency)? *(required)*

- min:
- max:
- currency:

**Q0.6.2** — Is the priority to minimise upfront cost (apps and configuration), to own the solution (custom build), or a balance? *(recommended)*

*(tick one)*
- [ ] minimise upfront
- [ ] own solution
- [ ] balanced

**Q0.6.3** — Is there a monthly ceiling for app subscriptions? *(optional)*

> Answer:

---

## § 1 — Company, brand & Shopify

> Store setup, Shopify plan, brand positioning and assets.

### 1.1 Company identity

**Q1.1.1** — Trading name and legal entity name (if different). *(required)*

- name:
- legal name:

**Q1.1.2** — Country of incorporation / headquarters. *(required)*

> Answer:

**Q1.1.3** — Industry and product vertical. *(required)*

> Answer:

**Q1.1.4** — Is the business direct-to-consumer, B2B, or hybrid? *(required)*

*(tick one)*
- [ ] dtc
- [ ] b2b
- [ ] hybrid

**Q1.1.5** — Current website URL. *(optional)*

> Answer:

### 1.2 Shopify account

**Q1.2.1** — Is there an existing Shopify store? *(required)*

- [ ] Yes
- [ ] No

**Q1.2.2** — Existing store URL, current Shopify plan and current theme. *(recommended)*
*Skip if Q1.2.1 = no.*

- store url:
- current plan:
- current theme:

**Q1.2.3** — Which Shopify plan will the new store run on? (All Foundation and Scale offers assume Shopify Plus.) *(required)*

*(tick one)*
- [ ] none
- [ ] basic
- [ ] grow
- [ ] advanced
- [ ] plus
- [ ] plus expansion

### 1.3 Brand & positioning

**Q1.3.1** — How is the brand positioned (value, mid-market, premium, luxury, enterprise)? *(required · consultant)*
*Luxury or enterprise positioning routes the engagement to the Growth (L) offer.*

*(tick one)*
- [ ] value
- [ ] mid market
- [ ] premium
- [ ] luxury
- [ ] enterprise

**Q1.3.2** — Is the brand identity finalised (logo, colour palette, typography)? *(recommended)*

- [ ] Yes
- [ ] No

**Q1.3.3** — In which formats are brand assets available (SVG, PNG, Figma, guidelines PDF)? *(optional)*
*Skip if Q1.3.2 = no.*

> Answer:

**Q1.3.4** — Are there strict brand guidelines that must be followed? *(recommended)*

- [ ] Yes
- [ ] No

**Q1.3.5** — What differentiates the brand — price, quality, exclusivity, community, sustainability? *(optional)*

> Answer:

### 1.4 Competitive context

**Q1.4.1** — Who are your top three online competitors? *(optional)*

> Answer:

**Q1.4.2** — Which stores (competitor or not) have a UX you want to reference? *(optional)*

> Answer:

---

## § 2 — Catalogue & products

> Product model, variants, metafields, pricing and inventory.

### 2.1 Catalogue size & variants

**Q2.1.1** — How many active SKUs are in the catalogue (approximate)? *(required)*

> Answer:

**Q2.1.2** — What is the maximum number of variant options on a product (e.g. size, colour, material = 3)? *(required)*
*More than 3 options is a hard stop (11.5).*

> Answer:

**Q2.1.3** — What is the maximum number of variants on a single product? *(recommended)*

> Answer:

### 2.2 Product types

**Q2.2.1** — Which product types exist in the catalogue? *(required)*

*(tick all that apply)*
- [ ] simple
- [ ] variant
- [ ] bundle
- [ ] product set
- [ ] gift card
- [ ] digital
- [ ] subscription
- [ ] pre order
- [ ] made to order
- [ ] virtual

**Q2.2.2** — Which subscription app is used or preferred? *(recommended)*
*Skip if Q2.2.1 does not include subscription.*

> Answer:

### 2.3 Catalogue data

**Q2.3.1** — Roughly how many collections? *(optional)*

> Answer:

**Q2.3.2** — Are collections manual, rule-based (automated), or mixed? *(optional)*

*(tick one)*
- [ ] manual
- [ ] automated
- [ ] mixed

**Q2.3.3** — Which product attributes go beyond Shopify's standard fields (technical specs, certifications, fit guides, ingredients)? *(recommended)*

> Answer:

**Q2.3.4** — Where is catalogue data maintained today? *(recommended)*

*(tick one)*
- [ ] shopify admin
- [ ] spreadsheet
- [ ] erp
- [ ] pim
- [ ] mixed

### 2.4 Pricing

**Q2.4.1** — Are there multiple price tiers (retail, trade, VIP)? *(recommended)*

- [ ] Yes
- [ ] No

**Q2.4.2** — Is there volume or quantity-tiered pricing? *(recommended)*

- [ ] Yes
- [ ] No

**Q2.4.3** — Do prices differ by market (not just currency conversion)? *(recommended)*

- [ ] Yes
- [ ] No

### 2.5 Inventory

**Q2.5.1** — Where is the inventory source of truth — Shopify, ERP, WMS, other? *(recommended)*

*(tick one)*
- [ ] shopify
- [ ] erp
- [ ] wms
- [ ] other

**Q2.5.2** — Are low-stock alerts needed? *(optional)*

- [ ] Yes
- [ ] No

**Q2.5.3** — What should happen when a product is out of stock? *(optional)*

*(tick one)*
- [ ] hide
- [ ] show sold out
- [ ] backorder
- [ ] notify me

---

## § 3 — Markets & internationalisation

> Shopify Markets, currencies, languages, tax and duties.

### 3.1 Markets at launch

**Q3.1.1** — Which markets (countries) go live at launch? For each: country code, checkout currency, languages, domain. *(required)*
*More than 5 markets (11.3) or more than 6 distinct languages (11.4) is a hard stop.*

| code | currency | languages | domain | price strategy |
|---|---|---|---|---|
| | | | | |

**Q3.1.2** — Which are the primary markets (one or more country or market codes)? *(required)*
*The markets that lead revenue and launch priority, e.g. US and EU for a global brand.*

> Answer:

**Q3.1.3** — Which countries are planned in the next 12 months? *(optional)*

> Answer:

**Q3.1.4** — One store with Shopify Markets, separate expansion stores, or hybrid? *(recommended · consultant)*
*Expansion stores require Shopify Plus (11.1).*

*(tick one)*
- [ ] shopify markets
- [ ] expansion stores
- [ ] hybrid

**Q3.1.5** — Should visitors be redirected to their local market automatically? *(optional)*

- [ ] Yes
- [ ] No

### 3.2 Language

**Q3.2.1** — How will translation be handled? *(recommended)*

*(tick one)*
- [ ] in house
- [ ] agency
- [ ] translate and adapt
- [ ] third party app
- [ ] undecided

**Q3.2.2** — Does any language need right-to-left layout? *(optional)*

- [ ] Yes
- [ ] No

**Q3.2.3** — Is SEO per language a priority? *(optional)*

- [ ] Yes
- [ ] No

### 3.3 Currency & pricing

**Q3.3.1** — Per market: is it the store's base currency, or are prices auto-converted, manually set, or display-only (checkout in another currency)? *(required)*
*More than one transactional currency activates the multi-currency scope gate.*

*(tick one)*
- [ ] base currency
- [ ] auto converted
- [ ] manual
- [ ] display only

### 3.4 Tax & duties

**Q3.4.1** — Should duties and import taxes be collected at checkout (DDP)? *(recommended)*

- [ ] Yes
- [ ] No

**Q3.4.2** — In which countries are you VAT-registered? *(recommended)*

> Answer:

**Q3.4.3** — Do you sell into the US with state sales tax obligations? *(optional)*

- [ ] Yes
- [ ] No

---

## § 4 — Payments & checkout

> Payment providers, PCI scope and checkout customisation.

### 4.1 Payments

**Q4.1.1** — Which payment providers will you use (Shopify Payments, Adyen, Stripe, PayPal…)? *(required)*

> Answer:

**Q4.1.2** — Which local payment methods are required (TWINT, iDEAL, Bancontact, SEPA, invoice…)? *(recommended)*

> Answer:

**Q4.1.3** — Which buy-now-pay-later providers, if any? *(optional)*

> Answer:

**Q4.1.4** — Do you need settlement in multiple currencies? *(optional)*

- [ ] Yes
- [ ] No

**Q4.1.5** — Will card data be handled only by Shopify-hosted checkout, by a third-party hosted payment page, or by custom card UI / tokenisation? *(required · consultant)*
*Custom card handling is a hard stop (11.9).*

*(tick one)*
- [ ] shopify hosted
- [ ] third party hosted
- [ ] custom card handling

### 4.2 Checkout

**Q4.2.1** — What level of checkout customisation is needed: none, Checkout Extensibility (branding, extra fields, upsells), or a fully custom checkout UI? *(required)*
*Extensibility requires Shopify Plus (11.1); a custom checkout UI is a hard stop (11.6).*

*(tick one)*
- [ ] none
- [ ] extensibility
- [ ] custom ui

**Q4.2.2** — Which checkout extensions are needed? *(optional · consultant)*
*Skip if Q4.2.1 = none.*

> Answer:

**Q4.2.3** — Which custom checkout fields are needed (company, VAT number, PO number, delivery instructions)? *(optional)*

> Answer:

**Q4.2.4** — Are post-purchase upsells needed? *(optional)*

- [ ] Yes
- [ ] No

**Q4.2.5** — Will gift cards be sold or accepted at checkout? *(recommended)*

- [ ] Yes
- [ ] No

**Q4.2.6** — Is store credit needed? *(optional)*

- [ ] Yes
- [ ] No

### 4.3 Fraud & risk

**Q4.3.1** — Is manual fraud review needed for high-value orders? *(optional)*

- [ ] Yes
- [ ] No

**Q4.3.2** — Are there order restrictions by country, customer type or order value? *(optional)*

> Answer:

---

## § 5 — Shipping & fulfilment

> Fulfilment, returns, cancellations, refunds and the post-purchase experience. These answers decide whether native Shopify is enough or a returns or post-purchase platform (e.g. Loop, AfterShip, parcelLab, Narvar) is needed.

### 5.1 Fulfilment model

**Q5.1.1** — Do you fulfil in-house, through a 3PL, or both? *(required)*

*(tick one)*
- [ ] in house
- [ ] 3pl
- [ ] hybrid

**Q5.1.2** — Which 3PL provider? *(recommended)*
*Skip if Q5.1.1 = in house.*

> Answer:

**Q5.1.3** — How many fulfilment locations are there? *(required)*

> Answer:

**Q5.1.4** — Are there complex routing rules deciding which location fulfils an order? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.1.5** — Which carriers do you use? *(recommended)*

> Answer:

**Q5.1.6** — Are shipping rates calculated live, flat, free above a threshold, or mixed? *(recommended)*

*(tick one)*
- [ ] calculated
- [ ] flat
- [ ] free threshold
- [ ] mixed

**Q5.1.7** — Are there product-specific shipping rules (heavy, hazardous, temperature-controlled)? *(optional)*

> Answer:

**Q5.1.8** — Do you ship internationally? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.1.9** — Which countries do you not ship to? *(optional)*
*Skip if Q5.1.8 = no.*

> Answer:

### 5.2 Returns & exchanges

**Q5.2.1** — Summarise the returns policy (window, conditions, who pays return postage). *(recommended)*

> Answer:

**Q5.2.2** — Is a self-service returns portal needed? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.2.3** — Do you process exchanges (not only refunds)? *(optional)*

- [ ] Yes
- [ ] No

**Q5.2.4** — Which returns solution is used or preferred? *(optional)*

> Answer:

**Q5.2.5** — How many days do customers have to return an order? *(recommended)*

> Answer:

**Q5.2.6** — What share of orders is returned today (%)? *(recommended)*
*High return rates or volumes usually justify a returns platform instead of Shopify's native self-serve returns.*

> Answer:

**Q5.2.7** — How do customers send items back: prepaid label, QR code drop-off, their own shipment, or mixed? *(recommended)*
*Prepaid labels and QR drop-off need a carrier integration — typically a returns app.*

*(tick one)*
- [ ] prepaid label
- [ ] qr drop off
- [ ] customer arranged
- [ ] mixed

**Q5.2.8** — Who pays return shipping: you, the customer, or it depends on the market? *(recommended)*

*(tick one)*
- [ ] merchant
- [ ] customer
- [ ] depends on market

**Q5.2.9** — Which exchanges do you offer: same product in another variant, any other product, or store credit first? *(optional)*
*Skip if Q5.2.3 = no.*
*Exchanges for any product or store-credit-first flows usually need a returns app.*

*(tick all that apply)*
- [ ] same product variant
- [ ] any product
- [ ] store credit first

**Q5.2.10** — Do you accept international returns (including refunding duties)? *(optional)*

- [ ] Yes
- [ ] No

**Q5.2.11** — Must returned items be inspected before the refund or exchange is issued? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.2.12** — Do you need to capture and report return reasons? *(optional)*

- [ ] Yes
- [ ] No

**Q5.2.13** — Should B2B customers request returns online (if you sell B2B)? *(optional)*

- [ ] Yes
- [ ] No

### 5.3 Notifications

**Q5.3.1** — Do order, shipping and delivery notifications need custom design or content? *(optional)*

- [ ] Yes
- [ ] No

**Q5.3.2** — Are notifications sent by Shopify, by the email platform, or both? *(optional)*

*(tick one)*
- [ ] shopify
- [ ] esp
- [ ] mixed

### 5.4 Cancellations & refunds

**Q5.4.1** — How many orders per month do you expect in the first year? *(required)*
*Returns, tracking and fraud apps are priced by order volume.*

> Answer:

**Q5.4.2** — Should customers be able to cancel orders themselves? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.4.3** — Until when can an order be cancelled: before fulfilment, within a few hours, or only by your team? *(recommended)*

*(tick one)*
- [ ] before fulfilment
- [ ] within hours
- [ ] merchant only

**Q5.4.4** — Do you allow partial cancellations (some items of an order)? *(optional)*

- [ ] Yes
- [ ] No

**Q5.4.5** — Should customers be able to edit an order after placing it (address, items)? *(recommended)*
*Customer-initiated order editing on the storefront usually needs an app.*

- [ ] Yes
- [ ] No

**Q5.4.6** — How are refunds paid: to the original payment method, as store credit, or as a gift card? *(recommended)*

*(tick all that apply)*
- [ ] original payment
- [ ] store credit
- [ ] gift card

**Q5.4.7** — When is a refund issued: on request, when the carrier scans the return, on receipt, or after inspection? *(recommended)*
*Refunds on carrier scan need a returns platform connected to carrier tracking.*

*(tick one)*
- [ ] on request
- [ ] on carrier scan
- [ ] on receipt
- [ ] after inspection

**Q5.4.8** — Is the original shipping cost refunded: always, only when you are at fault, or never? *(optional)*

*(tick one)*
- [ ] always
- [ ] on fault only
- [ ] never

**Q5.4.9** — Do you charge a restocking fee? *(optional)*

- [ ] Yes
- [ ] No

**Q5.4.10** — Do you issue partial refunds (e.g. damaged or missing parts)? *(optional)*

- [ ] Yes
- [ ] No

**Q5.4.11** — Must refunds be approved by someone before they are paid? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.4.12** — Must cancellations and refunds be passed to your ERP or finance system? *(recommended)*

- [ ] Yes
- [ ] No

### 5.5 Post-purchase experience

**Q5.5.1** — Do you want a branded order-tracking page on your own site? *(recommended)*
*Shopify includes an order status page and shipping emails. A branded tracking page, proactive carrier alerts or delivery estimates usually need a post-purchase platform (e.g. AfterShip, parcelLab, Narvar).*

- [ ] Yes
- [ ] No

**Q5.5.2** — On which channels should customers get proactive delivery updates (delays, out for delivery)? *(recommended)*

*(tick all that apply)*
- [ ] email
- [ ] sms
- [ ] whatsapp
- [ ] push

**Q5.5.3** — Should product pages or checkout show estimated delivery dates? *(optional)*

- [ ] Yes
- [ ] No

**Q5.5.4** — Do customers need to open warranty, repair or servicing claims online? *(recommended)*

- [ ] Yes
- [ ] No

**Q5.5.5** — Is there a preferred or existing returns or post-purchase platform (e.g. Loop, AfterShip, parcelLab, Narvar)? *(optional)*

> Answer:

---

## § 6 — Customers, B2B & privacy

> Customer accounts, B2B, loyalty, segmentation and personal-data obligations.

### 6.1 Customer accounts

**Q6.1.1** — Is guest checkout the default, are accounts optional, or is registration required? *(recommended)*

*(tick one)*
- [ ] guest default
- [ ] optional
- [ ] required

**Q6.1.2** — New customer accounts (passwordless) or classic accounts? *(recommended · consultant)*

*(tick one)*
- [ ] new customer accounts
- [ ] classic
- [ ] undecided

**Q6.1.3** — What should the account area include (order history, addresses, returns, wishlist, subscriptions)? *(optional)*

> Answer:

### 6.2 B2B & wholesale

**Q6.2.1** — Do you sell to business customers (B2B / wholesale)? *(required)*

- [ ] Yes
- [ ] No

**Q6.2.2** — Do B2B customers need company accounts with their own login? *(required)*
*Skip if Q6.2.1 = no.*

- [ ] Yes
- [ ] No

**Q6.2.3** — Do B2B customers get company-specific price lists? *(required)*
*Skip if Q6.2.1 = no.*

- [ ] Yes
- [ ] No

**Q6.2.4** — Are there B2B volume discounts or quantity rules? *(required)*
*Skip if Q6.2.1 = no.*

- [ ] Yes
- [ ] No

**Q6.2.5** — Which payment terms are needed (net 30, invoice, purchase order)? *(recommended)*
*Skip if Q6.2.1 = no.*

> Answer:

**Q6.2.6** — Is there a request-for-quote workflow, or is pricing negotiated per buyer? *(required)*
*Skip if Q6.2.1 = no.*
*An RFQ / negotiated-pricing workflow is a hard stop (11.2).*

- [ ] Yes
- [ ] No

**Q6.2.7** — Must B2B accounts be approved before they can order? *(optional)*
*Skip if Q6.2.1 = no.*

- [ ] Yes
- [ ] No

**Q6.2.8** — Native Shopify B2B or an app? *(recommended · consultant)*
*Skip if Q6.2.1 = no.*

*(tick one)*
- [ ] shopify b2b
- [ ] app
- [ ] undecided

**Q6.2.9** — How many B2B accounts are expected within 12 months? *(optional)*
*Skip if Q6.2.1 = no.*

> Answer:

### 6.3 Loyalty & segmentation

**Q6.3.1** — Which loyalty components are planned? *(recommended)*

*(tick all that apply)*
- [ ] points purchase
- [ ] points actions
- [ ] vip tiers
- [ ] referral
- [ ] vip early access
- [ ] subscription discount
- [ ] store credit

**Q6.3.2** — Is loyalty needed at launch or in a later phase? *(recommended)*

*(tick one)*
- [ ] launch
- [ ] phase 2
- [ ] none

**Q6.3.3** — Which loyalty app is used or preferred? *(optional)*

> Answer:

**Q6.3.4** — Must loyalty status sync to the email platform or CRM? *(optional)*

- [ ] Yes
- [ ] No

**Q6.3.5** — Which customer segments do you use today? *(optional)*

> Answer:

**Q6.3.6** — Where is segmentation driven from — Shopify, the email platform, a CDP, or a mix? *(optional)*

*(tick one)*
- [ ] shopify
- [ ] esp
- [ ] cdp
- [ ] mixed
- [ ] none

**Q6.3.7** — Which customer tags drive custom logic today (pricing, access, discounts)? *(optional)*

> Answer:

### 6.4 Privacy & consent

**Q6.4.1** — Which privacy regimes apply to your customers (GDPR, UK GDPR, CCPA, Swiss nFADP)? *(required · consultant)*

*(tick all that apply)*
- [ ] gdpr
- [ ] uk gdpr
- [ ] ccpa
- [ ] nfadp
- [ ] other

**Q6.4.2** — Which cookie consent tool is used or preferred? *(recommended)*

> Answer:

**Q6.4.3** — Is explicit opt-in required for marketing emails? *(recommended)*

- [ ] Yes
- [ ] No

**Q6.4.4** — Do you collect sensitive personal data (health, age, biometric, financial)? *(required)*
*Flag 11.17 — needs a data protection impact assessment and legal sign-off.*

- [ ] Yes
- [ ] No

**Q6.4.5** — Is a workflow needed for customer data export or deletion requests? *(required)*
*Flag 11.10 — needs legal sign-off.*

- [ ] Yes
- [ ] No

---

## § 7 — Marketing & promotions

> SEO, analytics, email, reviews, affiliates, discounts and campaigns.

### 7.1 SEO

**Q7.1.1** — Is organic search a significant traffic channel? *(recommended)*

- [ ] Yes
- [ ] No

**Q7.1.2** — Are custom URL structures needed? *(optional)*

- [ ] Yes
- [ ] No

**Q7.1.3** — Who manages SEO? *(optional)*

*(tick one)*
- [ ] in house
- [ ] agency
- [ ] none

### 7.2 Analytics & tracking

**Q7.2.1** — Which analytics platforms do you use (GA4, Adobe, other)? *(recommended)*

> Answer:

**Q7.2.2** — Is server-side tracking needed? *(recommended)*

- [ ] Yes
- [ ] No

**Q7.2.3** — Which advertising pixels are needed (Meta, TikTok, Pinterest, Google Ads)? *(recommended)*

> Answer:

**Q7.2.4** — Is a tag manager already configured? *(optional)*

- [ ] Yes
- [ ] No

**Q7.2.5** — Which custom events must be tracked beyond standard ecommerce events? *(optional)*

> Answer:

### 7.3 Email & CRM

**Q7.3.1** — Which email / CRM platform do you use or plan to use? *(recommended)*

> Answer:

**Q7.3.2** — Which automated flows are needed (welcome, abandoned cart, post-purchase, win-back)? *(optional)*

> Answer:

**Q7.3.3** — Is Shopify or the email platform the master for customer segments? *(optional)*

*(tick one)*
- [ ] shopify
- [ ] esp

### 7.4 Reviews & affiliates

**Q7.4.1** — Which product reviews app is used or preferred? *(optional)*

> Answer:

**Q7.4.2** — Is user-generated content important (customer photos, social embeds)? *(optional)*

- [ ] Yes
- [ ] No

**Q7.4.3** — Which affiliate platform, if any? *(optional)*

> Answer:

**Q7.4.4** — Do you use Shopify Collabs for influencers? *(optional)*

- [ ] Yes
- [ ] No

**Q7.4.5** — Are affiliate and influencer sales tracked via discount codes, UTM parameters, or both? *(optional)*

*(tick one)*
- [ ] discount codes
- [ ] utm
- [ ] both
- [ ] none

### 7.5 Discounts & coupons

**Q7.5.1** — Which discount types are used? *(recommended)*

*(tick all that apply)*
- [ ] percentage
- [ ] fixed amount
- [ ] bogo
- [ ] free shipping
- [ ] volume tiered
- [ ] automatic
- [ ] code based
- [ ] scheduled sale
- [ ] stackable
- [ ] pos only

**Q7.5.2** — Which discounts must stack (none, one code plus one automatic, or more)? *(recommended)*
*Beyond one code plus one automatic discount needs a discount function (T3).*

*(tick one)*
- [ ] none
- [ ] one code plus one automatic
- [ ] advanced

**Q7.5.3** — Are coupon codes single-use, multi-use, or bulk-generated? *(optional)*

*(tick all that apply)*
- [ ] single use
- [ ] multi use
- [ ] bulk

**Q7.5.4** — Must codes be brand-named (e.g. WELCOME20)? *(optional)*

- [ ] Yes
- [ ] No

**Q7.5.5** — Do codes need minimum order values or quantities? *(optional)*

- [ ] Yes
- [ ] No

**Q7.5.6** — Do codes expire on a fixed date, a rolling period, or never? *(optional)*

*(tick one)*
- [ ] none
- [ ] fixed
- [ ] rolling

**Q7.5.7** — How are codes distributed (email, SMS, print, influencers)? *(optional)*

> Answer:

### 7.6 Gift cards & campaigns

**Q7.6.1** — Are gift cards sold as a product? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.2** — Are gift cards issued as rewards or compensation? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.3** — Digital gift cards, physical, or both? *(optional)*

*(tick one)*
- [ ] digital
- [ ] physical
- [ ] both

**Q7.6.4** — Must gift cards expire? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.5** — Are promotions triggered from email or SMS campaigns? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.6** — Does each campaign need its own landing page? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.7** — Are countdown timers or urgency elements needed? *(optional)*

- [ ] Yes
- [ ] No

**Q7.6.8** — Do promotions differ by market? *(optional)*

- [ ] Yes
- [ ] No

---

## § 8 — Integrations & migration

> Every system that exchanges data with the store, and what moves from the current platform.

### 8.1 Connected systems

**Q8.1.1** — List every system that exchanges product, inventory, order, customer or financial data with the store. For each: system, category, direction, data objects, frequency, connector (native app / iPaaS / custom / none), owner, status. *(required)*
*Typical ownership: the PIM supplies products, content and attributes; the ERP supplies prices, inventory and orders. Any ERP, PIM, CRM, 3PL/WMS, OMS or custom connection activates the integration gate; more than 3 is a hard stop (11.7).*

| system | category | direction | objects | frequency | connector | middleware | owner | status |
|---|---|---|---|---|---|---|---|---|
| | | | | | | | | |

**Q8.1.2** — Is there a middleware / iPaaS layer (Celigo, Boomi, MuleSoft, custom)? *(optional)*

> Answer:

### 8.2 Data migration

**Q8.2.1** — Which platform are you migrating from (or none — greenfield)? *(required)*

*(tick one)*
- [ ] none
- [ ] shopify
- [ ] woocommerce
- [ ] magento
- [ ] shopware
- [ ] sfcc
- [ ] bigcommerce
- [ ] custom
- [ ] other

**Q8.2.2** — Which data must be migrated? *(recommended)*
*Skip if Q8.2.1 = none.*

*(tick all that apply)*
- [ ] products
- [ ] customers
- [ ] orders
- [ ] content
- [ ] redirects
- [ ] reviews
- [ ] gift cards

**Q8.2.3** — Approximate volumes: products, customers, orders, URL redirects. *(recommended)*
*Skip if Q8.2.1 = none.*

- products:
- customers:
- orders:
- redirects:

**Q8.2.4** — Must historical orders be available inside Shopify? *(recommended)*
*Skip if Q8.2.1 = none.*

- [ ] Yes
- [ ] No

**Q8.2.5** — How much SEO equity (rankings, backlinks) must be preserved? *(required · consultant)*
*Skip if Q8.2.1 = none.*

*(tick one)*
- [ ] none
- [ ] moderate
- [ ] significant

---

## § 9 — Design & experience

> Design source, storefront approach, accessibility and performance.

### 9.1 Design input

**Q9.1.1** — Is there a Figma file or design mockup for the new store? *(required)*

- [ ] Yes
- [ ] No

**Q9.1.2** — How complete is it — brand only, key screens, or every template? *(required)*
*Skip if Q9.1.1 = no.*

*(tick one)*
- [ ] none
- [ ] brand only
- [ ] key screens
- [ ] all templates

**Q9.1.3** — Does the Figma file contain a full design system (tokens and components)? *(required)*
*Skip if Q9.1.1 = no.*

- [ ] Yes
- [ ] No

**Q9.1.4** — Is the design mapped to Shopify sections and blocks? *(optional · consultant)*
*Skip if Q9.1.1 = no.*

- [ ] Yes
- [ ] No

**Q9.1.5** — Is a fully custom design required, rather than a theme with brand customisation? *(recommended)*

- [ ] Yes
- [ ] No

### 9.2 Storefront

**Q9.2.1** — Is a headless storefront required (Hydrogen, another framework, or a native app front end)? *(required)*
*A headless requirement routes the engagement to the Growth (L) offer.*

- [ ] Yes
- [ ] No

**Q9.2.2** — Any theme preferences or existing theme licences? *(optional)*

> Answer:

**Q9.2.3** — What is the aesthetic direction (minimal, editorial, luxury, playful, utilitarian)? *(optional)*

> Answer:

**Q9.2.4** — Which interactive patterns are required (mega-menu, quick-add, swatches, predictive search, lookbook, video hero)? *(recommended)*

> Answer:

**Q9.2.5** — Is custom motion or animation required? *(recommended)*

- [ ] Yes
- [ ] No

### 9.3 Accessibility

**Q9.3.1** — Which accessibility standard applies? *(required)*

*(tick one)*
- [ ] wcag21 aa
- [ ] wcag22 aa
- [ ] en301549
- [ ] section508
- [ ] none

**Q9.3.2** — Has an accessibility audit been done on the current site? *(optional)*

- [ ] Yes
- [ ] No

### 9.4 Performance

**Q9.4.1** — Core Web Vitals targets: LCP (seconds), CLS, INP (milliseconds). *(optional)*

- lcp s:
- cls:
- inp ms:

**Q9.4.2** — Is page speed a known problem today? *(recommended)*

- [ ] Yes
- [ ] No

**Q9.4.3** — Which third-party scripts must load (chat, personalisation, heatmaps)? *(optional)*

> Answer:

---

## § 10 — Delivery, governance & compliance

> Timeline, decision-making, support, legal and project tooling.

### 10.1 Timeline

**Q10.1.1** — What is the target go-live date? *(required)*
*Fewer weeks than the offer's minimum duration raises flag 11.15.*

> Answer:

**Q10.1.2** — What drives the deadline (peak season, product launch, contract end)? *(recommended)*

> Answer:

**Q10.1.3** — Is a phased launch planned? *(optional)*

- [ ] Yes
- [ ] No

**Q10.1.4** — Preferred project kick-off date. *(recommended)*

> Answer:

### 10.2 Team & decisions

**Q10.2.1** — Who is involved on the client side? For each: role, RACI (R/A/C/I), decision-maker (yes/no). Names are optional. *(required)*

| role | raci | decision maker | name |
|---|---|---|---|
| | | | |

**Q10.2.2** — Is there a single decision-maker for scope, approvals and feedback? *(required · consultant)*
*No single decision-maker raises flag 11.16 — resolve before the statement of work.*

- [ ] Yes
- [ ] No

**Q10.2.3** — Is budget approval authority clear? *(required · consultant)*

- [ ] Yes
- [ ] No

**Q10.2.4** — Which roles need Shopify admin access after go-live? *(optional)*

> Answer:

### 10.3 Support & training

**Q10.3.1** — Which training is needed (products, orders, discounts, reports)? *(optional)*

> Answer:

**Q10.3.2** — Are written SOPs required? *(optional)*

- [ ] Yes
- [ ] No

**Q10.3.3** — What post-launch support model is expected? *(recommended)*

*(tick one)*
- [ ] hypercare only
- [ ] retainer
- [ ] self sufficient
- [ ] third party

**Q10.3.4** — Is the Grow retainer signed? *(required · consultant)*
*Not signed on M or L: warning 11.11 (commercial adjustment).*

- [ ] Yes
- [ ] No

**Q10.3.5** — Retainer length in months. *(recommended · consultant)*
*Skip if Q10.3.4 = no.*

> Answer:

### 10.4 Legal & regulated industries

**Q10.4.1** — Is the business in a regulated industry (pharma, alcohol, firearms, age-restricted goods, financial products, medical devices)? If yes, which? *(required)*
*A regulated industry is a hard stop until legal review (11.8).*

- active:
- category:

**Q10.4.2** — Are legal pages (terms, privacy, cookies, returns) ready, in need of updates, or still to be drafted? *(recommended)*

*(tick one)*
- [ ] ready
- [ ] needs update
- [ ] needs drafting

**Q10.4.3** — Any other industry-specific compliance requirements? *(optional)*

> Answer:

### 10.5 Project set-up (consultant)

**Q10.5.1** — Lead consultant. *(required · consultant)*

> Answer:

**Q10.5.2** — Has the client agreed that answers may be processed by the AI discovery engine (no customer personal data included)? *(required · consultant)*
*ADR 0007 — the engine refuses to run without recorded consent.*

- [ ] Yes
- [ ] No

**Q10.5.3** — Jira site and project key for the backlog. *(recommended · consultant)*

- site:
- project key:

**Q10.5.4** — Jira components to use. *(optional · consultant)*

> Answer:

**Q10.5.5** — Discovery hit a STOP. How will Merkle proceed: Larger Engagement or no bid? *(recommended · consultant)*
*Only if a § 11 rule is STOP.*
*Larger Engagement: Merkle proposes an Enterprise Engagement with a dedicated Discovery Phase; the approach, a brief and the client deck are still produced, Jira tickets are not. No bid produces the STOP report only.*

*(tick one)*
- [ ] larger engagement
- [ ] no bid

---

## § 11 — Exit-trigger screening

> Complete immediately after the discovery call, before any work is scoped.
> Each rule is answered by the questions listed — confirm the outcome here.
> **STOP** blocks GO · **FLAG** needs a named owner before build · **WARN** is a commercial adjustment.

| Rule | Condition | Result | If triggered | Answered by | Outcome (triggered / clear) |
|---|---|---|---|---|---|
| 11.1 | A Shopify Plus feature is required (native B2B, Checkout Extensibility customisation, expansion stores) but the target plan is not Plus. A fully custom checkout UI is handled by 11.6, not here | STOP | Confirm Shopify Plus or remove the feature from scope | Q1.2.3, Q3.1.4, Q4.2.1, Q6.2.1 | |
| 11.2 | B2B requires RFQ / quote or custom negotiated pricing per buyer | STOP | Architecture review: Shopify Plus B2B with a quote app or draft-order workflow, or a composable platform | Q6.2.6 | |
| 11.3 | More than 5 Shopify Markets at launch | STOP | Larger Engagement: market roll-out waves and Markets architecture in the Discovery Phase | Q3.1.1 | |
| 11.4 | More than 6 distinct languages across all markets | STOP | Larger Engagement: translation and content operations in the Discovery Phase | Q3.1.1 | |
| 11.5 | More than 3 variant options per product | STOP | Architecture review | Q2.1.2 | |
| 11.6 | Custom checkout UI that cannot be built with Checkout Extensibility | STOP | Composable platform | Q4.2.1 | |
| 11.7 | More than 3 integrations at launch (counted per integration_definition) | STOP | Larger Engagement: integration architecture in the Discovery Phase | Q8.1.1 | |
| 11.8 | Regulated industry (pharma, alcohol, firearms, age-restricted, financial products, medical devices) | STOP | Legal / compliance review | Q1.1.3, Q10.4.1 | |
| 11.9 | PCI scope beyond Shopify-hosted payments (custom card UI, tokenisation, handling card data) | STOP | Security review (threat model mandatory) | Q4.1.5 | |
| 11.10 | GDPR / CCPA data export or deletion workflow required | FLAG | Legal sign-off on data-subject request handling | Q6.4.5 | |
| 11.11 | Grow retainer not signed on an M or L engagement | WARN | Grow retainer to be signed before delivery starts; otherwise commercial adjustment | Q10.3.4 | |
| 11.12 | ERP or PIM with no existing Shopify connector and no iPaaS | FLAG | Separate integration scoping track (T3/T4) | Q8.1.1 | |
| 11.13 | fulfilment_locations > 2 AND complex_routing is true | FLAG | Multi-location inventory scoping (T3) | Q5.1.3, Q5.1.4 | |
| 11.14 | Migration with significant SEO equity or complex historical data | FLAG | Dedicated migration scoping track — not combined with the store build sprint | Q8.2.3, Q8.2.4, Q8.2.5 | |
| 11.15 | Weeks from kick-off (delivery.kickoff_date, else meta.created_at) to target go-live are fewer than the offer's minimum duration_weeks | FLAG | Re-scope to an MVP-first delivery before any sprint begins | Q10.1.1 | |
| 11.16 | No single decision-maker, or budget approval authority is unclear | FLAG | Named client decision-maker and budget owner confirmed before the statement of work is signed | Q10.2.2, Q10.2.3 | |
| 11.17 | Sensitive personal data is collected (health, age, biometric or financial data; special-category data under GDPR art. 9) | FLAG | Data protection impact assessment and legal sign-off on data minimisation, storage location and consent before build | Q6.4.4 | |

---

## Completion checklist

- [ ] Every *required* question in §§ 0–10 has an answer or "TBC"
- [ ] At least one KPI has a baseline and a target (Q0.4.2)
- [ ] Every connected system is listed in Q8.1.1 with direction and connector
- [ ] § 11 outcome recorded for every rule; every STOP has a named resolution owner
- [ ] Consent for AI processing recorded (Q10.5.2)
