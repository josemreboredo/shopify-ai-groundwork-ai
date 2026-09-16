# Shopify Discovery Questionnaire

> **Purpose:** Run this as a structured conversation before any engagement begins.
> Every answer feeds directly into the Frame Agent (scoping), the tier decision (T1–T4),
> and the Shopify capability map (native → app → theme → custom).
>
> **How to use:**
> - Work through each domain top-to-bottom in the first discovery call (60–90 min).
> - Mark answers directly in this file — it becomes the client's living brief.
> - § 0 and § 11 are the most time-sensitive: read § 0 before the call starts;
>   complete § 11 immediately after to gate scope.
>
> **Output:** A completed questionnaire drives the Frame Agent to produce a scoped
> delivery plan, capability map, app shortlist, and Gaia tier assignments.

---

## § 0 — Business Problems & Growth Blockers

> **Why this comes first:** Understanding *what is broken* before *what to build*
> prevents over-engineering and ensures every Shopify capability maps to a real
> business outcome. This section is the primary brief for the Frame Agent.

### 0.1 The core problem

- What is the **single biggest thing** preventing your ecommerce from growing right now?
- How long has this been a problem, and what have you already tried to fix it?
- If we solved only one thing in this engagement, what would have the highest business impact?

### 0.2 Revenue & conversion gaps

- What is your current monthly ecommerce revenue (ballpark range)?
- What is your conversion rate — and do you know where in the funnel you lose the most customers?
- Are there specific product categories, markets, or customer segments that under-perform vs the rest?
- Is the bottleneck **acquisition** (not enough traffic), **conversion** (traffic doesn't buy), or **retention** (customers don't return)?

### 0.3 Operational pain

- What manual work is your team doing today that the platform should automate?
- Which processes break or cause complaints most often? (e.g. order management, returns, inventory sync)
- How many hours per week does your team spend on workarounds because the current setup doesn't support them?

### 0.4 Growth goals (12-month horizon)

- What does success look like in **12 months**? (Revenue target, new markets, customer volume, order volume)
- Are you planning to expand into new geographies, add a B2B channel, launch new product lines, or move upmarket?
- Is there a specific event, season, or external deadline driving the launch timeline?

### 0.5 Platform & tech debt

- Why are you on (or moving to) Shopify? What is the trigger for this engagement?
- If migrating from another platform — what must not be lost in the transition?
- What parts of your current store or setup are you *most* unhappy with?

### 0.6 Budget & investment framing

- What is the approximate budget envelope for this project?
- Is the priority to **minimise upfront cost** (apps + config) or **own the solution** (custom build)?
- Are there ongoing platform costs (app subscriptions, retainers) you are trying to reduce?

---

## § 1 — Business & Brand

> Maps to: store setup, Shopify plan selection, legal/tax entity, brand assets.

### 1.1 Company identity

- Legal business name and trading name (if different)
- Country of incorporation and primary country of operation
- Industry / product vertical (fashion, electronics, food & beverage, B2B wholesale, etc.)
- Is the business DTC (direct-to-consumer), B2B, or hybrid?
- Is there an existing Shopify store, or is this greenfield?
  - If existing: store URL, current Shopify plan, current theme name

### 1.2 Brand assets

- Do you have a finalised brand identity (logo, colour palette, typography)?
  - If yes: in what formats? (SVG, PNG, Figma, brand guidelines PDF)
- Is there a Figma design file for the new store, or will we work from a theme?
- Are there strict brand guidelines or a design system that must be followed?

### 1.3 Competitive context

- Who are your top 3 online competitors?
- Is there a store (competitor or otherwise) whose UX you admire and want to reference?
- What differentiates your brand — price, quality, exclusivity, community, sustainability?

---

## § 2 — Catalogue & Products

> Maps to: product model, variant strategy, metafields, bundles, B2B pricing, digital goods.

### 2.1 Product structure

- How many SKUs are in the catalogue (approximate)?
  - < 50 / 50–500 / 500–5 000 / 5 000+ *(tooling implications differ at each band)*
- Do products have **variants** (size, colour, material)? How many options per product (maximum)?
- Are there any products with **more than 3 variant options** or **more than 100 variants** per product?
  *(Shopify hard limits: 3 options, 100 variants — custom solutions required above this — flags § 11.3)*
- Are there **bundles** or **kits** (multiple SKUs sold as one unit)?
- Are there **digital / downloadable** products?
- Are there **subscription** products (recurring billing)?

### 2.2 Catalogue complexity

- Are products organised into **collections**? How many, and are they manual or rule-based (automated)?
- Do products require **custom attributes** beyond Shopify's standard fields?
  (e.g. technical specs, certifications, fit guides, ingredient lists, compliance data)
- Is there a **PIM** (Product Information Manager) as the master data source? (Akeneo, Contentful, Plytix, etc.)
- How is catalogue data maintained today — spreadsheet, ERP export, manual admin entry?

### 2.3 Pricing model

- Is there a single price per product, or multiple price tiers (retail, trade, VIP)?
- Do you sell **B2B / wholesale** alongside retail with different prices for different customer types?
- Are there **volume discounts** or tiered pricing by quantity ordered?
- Are prices **market-specific** (different price per country / region)?
- Are prices **currency-converted** automatically or **locally set** per market?

### 2.4 Inventory

- Is inventory managed natively in Shopify, or synced from an external system (ERP / WMS)?
- Do you have multiple **warehouses or fulfilment locations**?
- Are there products that are **made to order** or **pre-order** only?
- Do you need **low-stock alerts** or automatic **out-of-stock handling** (hide product, show back-order, notify me)?

---

## § 3 — Markets & Internationalisation

> Maps to: Shopify Markets, multi-currency, multi-language, geo-redirect, Hydrogen i18n.

### 3.1 Geographic scope

- Which countries or regions will the store serve at launch?
- Which countries are planned for expansion in the next 12 months?
- Do you need a **geo-redirect** (auto-route users to a localised URL or sub-domain)?

### 3.2 Language

- How many languages must the store support?
- Is translation handled by your team, a translation agency, or an automated tool (DeepL, Weglot, Translate & Adapt)?
- Do any languages require **right-to-left (RTL)** layout? (Arabic, Hebrew)
- Is **SEO per language** a priority? (Requires hreflang tags + translated metadata)

### 3.3 Currency & pricing

- Do customers pay in their local currency, or is there a single checkout currency?
- Are prices **auto-converted** (with rounding rules), or manually set per market?
- Do you need **market-specific promotions** or discounts that differ by region?

### 3.4 Tax & duties

- Do you need **landed cost / duties & taxes** calculated at checkout (DDP — Delivered Duty Paid)?
- Are you VAT-registered in multiple countries? Do you need automatic VAT calculation?
- Do you sell into the EU? *(OSS / iOSS VAT implications)*
- Do you sell into the US? *(State-by-state sales tax — Shopify Tax or Avalara?)*

---

## § 4 — Payments & Checkout

> Maps to: payment gateway config, Shop Pay, accelerated checkout, checkout extensibility, tax config.

### 4.1 Payment gateways

- Which payment providers do you currently use or want to use?
  - Shopify Payments (available in your market?)
  - Stripe, Adyen, Braintree, PayPal, Klarna, Afterpay, Apple Pay, Google Pay
  - Local / regional methods (iDEAL, SEPA, Bancontact, BACS, Multibanco, etc.)
- Are there **B2B payment terms** required (net-30, invoice, purchase orders)?
- Do you need **multi-currency settlement** (receive funds in different currencies)?

### 4.2 Checkout experience

- Is a **customised checkout** required (branded UI, custom fields, post-purchase upsells)?
  *(Checkout Extensibility requires Shopify Plus — flags § 11.1)*
- Are there custom **checkout fields** needed (company name, VAT number, delivery instructions, PO number)?
- Do you need **post-purchase upsells** or order bumps at the thank-you page?
- Are there **gift cards** or **store credit** requirements?

### 4.3 Fraud & risk

- Do you need manual fraud review workflows for high-value orders?
- Are there order restrictions by country, customer type, or order value?

---

## § 5 — Shipping & Fulfilment

> Maps to: shipping profiles, carrier rates, Shopify Shipping, 3PL integration, returns apps.

### 5.1 Shipping model

- Do you fulfil orders yourself, use a 3PL, or a combination of both?
  - If 3PL: which provider? (ShipBob, Zenkraft, Huboo, Fulfilment by Amazon, etc.)
- How many fulfilment locations are there?
- Do you use **calculated carrier rates** (live rates from UPS / DHL / FedEx / Royal Mail), or flat-rate / free shipping thresholds?
- Are there **product-specific** shipping rules? (Large / heavy items, hazardous goods, temperature-controlled)
- Do you ship internationally? Are there any countries you cannot or do not ship to?

### 5.2 Returns & exchanges

- What is your returns policy (window, conditions, who pays return postage)?
- Is returns processing manual (email-based) or do you need a **self-service returns portal**?
- Do you process **exchanges** or refunds only?
- Which returns solution are you considering? (Loop Returns, AfterShip Returns, native Shopify)

### 5.3 Post-purchase notifications

- Do you need customised **order confirmation / shipping / delivery** email and SMS notifications?
- Are these sent from Shopify directly or from an external CRM / ESP (Klaviyo, Mailchimp, etc.)?

---

## § 6 — Customer & Account

> Maps to: customer accounts (classic vs new), B2B companies, loyalty programmes, GDPR / consent.

### 6.1 Customer accounts

- Do customers need to **register** to buy, or is guest checkout the default?
- Are you using **Shopify's new customer accounts** (passwordless) or classic login?
- What should a self-service account area include?
  (Order history, address book, returns, wishlist, loyalty points, subscription management)

### 6.2 B2B & wholesale

- Do you sell to business customers (B2B)?
  - If yes: do B2B customers need their own login, company-level pricing, and payment terms?
  - Are you using Shopify B2B (Shopify Plus feature — flags § 11.2) or an app? (Wholesale Club, Locksmith, etc.)
- Are there **approval workflows** before a B2B account can place orders?

### 6.3 Loyalty & CRM

- Do you have (or plan) a **loyalty / rewards programme**?
  - Points, tiers, referrals? Which app? (LoyaltyLion, Yotpo, Smile.io, Okendo)
- Do you have a customer **segmentation strategy** (VIP, at-risk, dormant, high-LTV)?

### 6.4 GDPR & consent

- Where are your customers based? *(EU / UK = GDPR; California = CCPA)*
- Do you have a **cookie consent** banner in place? (OneTrust, Cookiebot, Pandectes, Axeptio)
- Do customers receive marketing emails? Is explicit opt-in required?
- Do you collect any **sensitive personal data** (health, age-restricted, biometric, financial)?

---

## § 7 — Marketing & Analytics

> Maps to: SEO config, GA4, Meta Pixel, TikTok Pixel, Klaviyo, reviews apps, attribution.

### 7.1 SEO

- Is organic search a significant or planned traffic channel?
- Do you need **custom URL structures**, canonical tags, or hreflang for international SEO?
- Is there existing SEO equity (rankings, backlinks) that must be **preserved** during a migration?
- Who manages SEO — in-house, agency, or self-managed?

### 7.2 Analytics & tracking

- Which analytics platform(s) do you use?
  (Google Analytics 4, Adobe Analytics, Mixpanel, Heap, other)
- Do you use **server-side tracking** (GA4 via GTM server-side, Elevar) or client-side only?
- Do you need **Meta Pixel** (Facebook / Instagram ads)? TikTok Pixel? Pinterest Tag? Snap Pixel?
- Is there a **Tag Manager** (Google Tag Manager) already configured?
- Are there **custom events** beyond standard ecommerce you need to track? (video plays, filter use, size guide opens)

### 7.3 Email & CRM

- Which email / CRM platform do you use or plan to use?
  (Klaviyo, Mailchimp, HubSpot, Braze, Dotdigital, Omnisend, etc.)
- Are **automated flows** needed? (Welcome series, abandoned cart, post-purchase, win-back, browse abandonment)
- Is the ESP the master for customer segments, or does Shopify drive segmentation and sync to the ESP?

### 7.4 Reviews & social proof

- Do you use (or need) a **product reviews** app? (Okendo, Judge.me, Yotpo, Stamped, native Shopify Reviews)
- Is **user-generated content (UGC)** important to your marketing? (Instagram feed, TikTok embeds, customer photos)
- Do you use or plan to use **Shopify Collabs** or influencer / affiliate marketing?

### 7.5 Promotions & discounts

- What types of promotions do you run?
  (Percentage off, fixed amount, BOGO, free shipping, tiered, automatic, code-based, flash sales)
- Do promotions **stack**? (e.g. a discount code on top of a sale price, or free shipping + 10% off)
- Are promotions time-limited with strict start / end scheduling requirements?

---

## § 8 — Integrations & Tech Stack

> Maps to: ERP sync, PIM, WMS, custom APIs — and the exit-trigger risk assessment (§ 11).

### 8.1 Current tech stack

List every system that touches product, order, customer, or financial data:

| System | Role | Sync direction | Real-time or batch? |
|--------|------|----------------|---------------------|
| *(e.g. SAP)* | ERP / finance | Shopify ↔ ERP | Batch (nightly) |
| *(e.g. Akeneo)* | PIM | Shopify ← PIM | Real-time |
| *(e.g. ShipBob)* | 3PL / WMS | Both | Webhook |
| *(e.g. Klaviyo)* | Email CRM | Shopify → Klaviyo | Real-time |

### 8.2 ERP integration

- Is there an **ERP** in use? (SAP, NetSuite, Microsoft Dynamics, Odoo, Brightpearl, Cin7)
  - What data flows between ERP and Shopify? (Products, orders, inventory levels, financials, customer data)
  - Is the integration already built, or does it need to be designed from scratch?
  - Is there a middleware / iPaaS layer? (Celigo, Boomi, MuleSoft, Hotglue, custom)

### 8.3 PIM integration

- Is there a **PIM** as the master source for product content and attributes?
- What format does the PIM export? (REST API, GraphQL, SFTP / CSV, webhook)
- Who owns the connector — your team, an agency, or an iPaaS?

### 8.4 Custom / legacy systems

- Are there **bespoke or legacy systems** with no off-the-shelf Shopify connector?
- Are there webhooks or API endpoints that need to be built from scratch?
- Who maintains custom integrations after go-live — your team or an external partner?

### 8.5 Data migration

- If migrating from another platform: what data needs to be moved?
  (Products, customers, order history, blog content, URL redirects, reviews)
- Is **historical order data** required inside Shopify? *(affects reporting and customer account history)*
- Are there **301 redirects** from old URLs that must be preserved for SEO?

---

## § 9 — Design & UX

> Maps to: theme selection (Horizon vs custom), Figma handoff, component inventory, accessibility requirements.

### 9.1 Design input

- Is there a **Figma file** or design mockup for the new store?
  - If yes: is it complete (all pages and states) or just key screens?
  - Is it mapped to Shopify sections / blocks, or will we interpret and componentise it?
- Is a fully custom design required, or can we work from a Shopify theme with brand customisation?

### 9.2 Theme selection

- If starting from a theme: any preferences or existing theme licenses?
  (Dawn, Horizon, Prestige, Impulse, Pipeline, Broadcast, Symmetry, etc.)
- What is the aesthetic direction? (Minimal, editorial, luxury, playful, utilitarian, B2B)
- Are there specific **interactive patterns** required?
  (Sticky header, mega-menu, quick-add, colour / image swatches, lookbook, video hero, predictive search, etc.)

### 9.3 Accessibility

- Is there an **accessibility standard** to comply with? (WCAG 2.1 AA, Section 508, EN 301 549)
- Are you aware of existing users with accessibility needs you should accommodate?
- Has an **accessibility audit** been conducted on the current site?

### 9.4 Performance

- Are there **page speed / Core Web Vitals** targets? (LCP < 2.5 s, CLS < 0.1, INP < 200 ms)
- Is page speed a known problem on the current site?
- Which third-party scripts must be loaded? (Live chat, trust badges, personalisation, heatmap tools)

---

## § 10 — Operations & Timeline

> Maps to: launch plan, team access model, training requirements, post-launch support.

### 10.1 Timeline & milestones

- What is the **target go-live date**?
- Are there **hard deadlines**? (Peak trading season, sale event, product launch, investor demo, board commitment)
- Is there a phased launch plan, or is it a single go-live?

### 10.2 Team & access

- Who from your side will be involved in the project?
  (Project owner, merchandising, marketing, IT, finance, operations, legal)
- Who is the **single point of contact** for decisions, approvals, and feedback?
- Who needs **Shopify admin access** after go-live, and at what permission level?

### 10.3 Training & handoff

- Does the team need training on Shopify admin? (Products, orders, discounts, reports)
- Is there documentation or SOPs required? (Adding products, running promotions, processing returns)
- What level of **post-launch support** do you expect?
  (Hypercare period only / ongoing retainer / self-sufficient / third-party support partner)

### 10.4 Compliance & legal

- Are there **legal pages** required? (Terms & Conditions, Privacy Policy, Cookie Policy, Returns Policy)
- Are they ready and approved by your legal team, or do they need to be drafted?
- Are there **industry-specific compliance** requirements? (Age verification, GDPR Data Processing Agreement, FCA for financial products, alcohol licensing, etc.)

---

## § 11 — Exit-Trigger Screening

> **Complete immediately after the discovery call — before any work is scoped.**
> Each YES is a hard blocker or scope escalation. Do not begin delivery until
> every YES is resolved.

| # | Trigger question | Answer | Action required if YES |
|---|------------------|--------|------------------------|
| 11.1 | Does the client need **Checkout Extensibility** — custom checkout UI, extra checkout fields, or post-purchase upsells? | | Requires **Shopify Plus** — confirm plan upgrade or remove from scope |
| 11.2 | Does the client need **B2B / wholesale** with company accounts, custom pricing, and payment terms? | | Requires **Shopify Plus** B2B — or complex app stack with trade-offs documented |
| 11.3 | Are there products with **more than 3 variant options** or **more than 100 variants** on a single product? | | Native Shopify limit — requires app (Hulk, Infinite Options) or metafield workaround; add to scope |
| 11.4 | Does the client need a **custom / headless storefront** (Hydrogen, Remix, mobile app)? | | **T3 engagement** — full scoping sprint required before any build sprint |
| 11.5 | Is there an **ERP or PIM** with no existing Shopify connector and no iPaaS solution? | | Custom integration — **T3 / T4** — separate integration scoping track required |
| 11.6 | Are there **more than 2 fulfilment locations** with complex inventory routing rules? | | Multi-location inventory logic — T3 complexity — scoping required |
| 11.7 | Does the client operate in a **regulated industry**? (pharma, alcohol, age-restricted, financial products, medical devices) | | Legal / compliance review required before build begins |
| 11.8 | Does the client require **PCI-scoped checkout customisation**? (custom card UI, payment tokenisation, handling card data) | | **T4** — security engineer mandatory; do not build without full threat model |
| 11.9 | Is there a **migration from a platform with significant SEO equity or complex historical data**? | | Dedicated migration scoping track — do not combine with store build sprint |
| 11.10 | Is the go-live date **less than 6 weeks away** for a scope that appears T3 or above? | | Re-scope immediately — agree MVP-first delivery before any sprint begins |
| 11.11 | Does the client lack a **single decision-maker** or have unclear budget approval authority? | | Pause engagement — commercial and governance clarity required before discovery ends |

---

## Questionnaire completion checklist

Before passing this to the Frame Agent, confirm all boxes are ticked:

- [ ] **§ 0** — At least one clear problem statement and a measurable success metric captured
- [ ] **§ 1–10** — All domains worked through (TBD answers are acceptable; blanks are not)
- [ ] **§ 11** — Exit-trigger screening completed; every YES has a named resolution action
- [ ] Client has confirmed the **go-live date** and the **single point of contact**
- [ ] Approximate **budget envelope** is known and documented
- [ ] Every **third-party system** is listed in § 8.1 with sync direction and data type

---

*Document owner: Shopify AI Builder · Gaia biota · Updated: 2025-06*
*Feeds into: Frame Agent → capability map → app shortlist → Gaia T1–T4 tier assignments → delivery sprint*
