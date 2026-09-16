# Shopify Discovery Questionnaire — ACME Watches

> **Client:** ACME Watches SA · **Date:** 2025-06 · **Consultant:** Jose Reboredo
> **Status:** Completed

---

## § 0 — Business Problems & Growth Blockers

### 0.1 The core problem
- Single biggest problem: conversion rate on mobile is 40% below desktop; checkout abandonment at 68%.
- Problem duration: 18 months. Previous attempts: redesigned PDPs, added trust badges. No improvement.
- Highest-impact fix: a faster, mobile-optimised checkout + simplified product navigation.

### 0.2 Revenue & conversion gaps
- Monthly ecommerce revenue: ~€120,000/mo
- Conversion rate: 1.2% overall, 0.7% mobile
- Under-performing: Watches >€500 convert at half the rate of watches <€200
- Bottleneck: conversion (traffic is healthy; customers don't complete purchase)

### 0.3 Operational pain
- Manual work: team manually syncs inventory with ERP twice daily
- Breaks most often: order management — refunds and exchanges handled in spreadsheets
- Hours/week on workarounds: ~8h

### 0.4 Growth goals
- 12-month target: €2M/yr, launch CH + DE + AT markets, add 500 B2B wholesale accounts
- Planned expansion: 3 EU markets, B2B wholesale channel
- Deadline: Q4 2025 for holiday peak

### 0.5 Platform & tech debt
- Moving from WooCommerce — trigger is performance and scalability
- Must not be lost: 4,200 product URLs (SEO), customer accounts, order history
- Most unhappy with: slow page speed, no multi-currency, admin UX

### 0.6 Budget framing
- Budget envelope: €60–80k
- Priority: minimise upfront cost where possible; open to apps for non-core features
- Ongoing cost target: keep app subscriptions under €500/mo total

---

## § 1 — Business & Brand

- Client name: ACME Watches SA
- Industry: Luxury watches
- Current Shopify plan: None (migrating from WooCommerce)
- Target plan: Shopify Basic (upgrading to Plus if B2B requires it)
- Brand tier: Premium (not ultra-luxury; Horizon theme acceptable with brand tokens)
- Primary currency: CHF, EUR
- VAT registered: Yes (CH + EU)

---

## § 2 — Catalogue & Products

- SKU count: ~800 active SKUs
- Variant options per product: 2 (size, colour)
- Bundles: No
- B2B: Yes — wholesale accounts with tiered pricing (not RFQ, fixed tiers)
- Digital products: No
- Subscriptions: No
- Pre-orders: No
- Product metafields needed: movement_type, case_material, water_resistance_atm

---

## § 3 — Markets & Internationalisation

- Markets at launch: 3 (CH, DE, AT)
- Languages: 3 (German, French, Italian)
- Currencies: CHF, EUR
- Local domains: Yes (acme.ch, acme.de, acme.at)
- Duties/customs handling: DDP for EU markets (handled by Shopify Markets)
- Translation tool preference: Shopify Translate & Adapt

---

## § 4 — Payments & Checkout

- Payment providers: Shopify Payments (primary), PayPal (secondary)
- BNPL: No
- Checkout customisation: Checkout Extensibility only (no custom checkout)
- 3D Secure: Yes
- Gift cards: No

---

## § 5 — Shipping & Fulfilment

- 3PL: No (in-house fulfilment from CH warehouse)
- Carriers: DHL Express, Swiss Post
- Shipping rules: Free shipping >€150 EUR, tiered by weight for CH
- Returns portal: Yes — self-service returns required
- Fulfilment locations: 1 (Zurich)

---

## § 6 — Customer & Account

- Customer accounts: Required (order history, address book)
- B2B portal: Yes (wholesale login, tiered pricing display)
- Loyalty programme: No (phase 2)
- Customer groups: Retail + Wholesale

---

## § 7 — Marketing & Analytics

- Email platform: Klaviyo
- GA4: Yes
- Meta Pixel: Yes
- Abandoned cart recovery: Klaviyo flows
- Affiliate / referral: No
- Cookie consent tool: Cookiebot

---

## § 8 — Integrations & Tech Stack

- ERP: SAP Business One (inventory + order sync required)
- PIM: No (Shopify as PIM)
- Returns platform: Loop Returns
- Other integrations: None
- Total integrations at launch: 2 (SAP + Loop Returns)

---

## § 9 — Design & UX

- Theme: Horizon (base, not Figma custom)
- Figma source: Partial (brand guidelines only, no full design system)
- Motion / animation: No
- Accessibility target: WCAG 2.1 AA
- Mobile-first: Yes (primary pain point)

---

## § 10 — Operations & Timeline

- Launch date: 2025-10-01 (before holiday peak)
- Team: Consultant (Jose) + client marketing manager
- Staging environment: Yes — development store first
- Post-launch support: 3-month retainer agreed

---

## § 11 — Exit-Trigger Screening

| Row | Condition | Answer |
|-----|-----------|--------|
| 11.1 | Shopify Plus feature required on non-Plus plan? | No — B2B uses fixed tiers, not RFQ |
| 11.2 | B2B with RFQ / custom negotiated pricing? | No — fixed wholesale price tiers |
| 11.3 | More than 5 markets at launch? | No — 3 markets |
| 11.4 | More than 6 languages? | No — 3 languages |
| 11.5 | Variant options > 3 per product? | No — 2 options max |
| 11.6 | Custom checkout (non-Checkout Extensibility)? | No — Extensibility only |
| 11.7 | More than 3 integrations at launch? | No — 2 integrations |
| 11.8 | Regulated industry? | No |
| 11.9 | PCI scope beyond Shopify Payments? | No |
| 11.10 | GDPR/CCPA data deletion workflow required? | Yes — EU customers; data deletion requests possible |
| 11.11 | Grow retainer signed? | Yes |

**§ 11 verdict:** GO — no hard stops. Flag 11.10 (GDPR deletion) for legal confirmation.
