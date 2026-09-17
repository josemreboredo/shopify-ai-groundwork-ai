# ADR 0012 — Tax and shipping: discovery questions and a store configuration workbook

- **Status:** Accepted (2026-09-17, owner decision: "Split")
- **Date:** 2026-09-17
- **Amends:** ADR 0011 (question bank 1.2.0; new app signal area `invoicing_app`)
- **Relates to:** ADR 0002 (engagement.json), ADR 0006 (Jira backlog)

## Context

The owner asked whether taxation and shipping methods are covered, because they must be configured in the store. The
question bank covered them at discovery depth (duties yes/no, VAT countries, tax display and service, rates, carriers,
delivery methods, locations) but not at configuration depth, and missed topics that change scope or apps. A review
against Shopify documentation (checked 2026-09-17) found:

- Duties are collected at checkout (DDP) or paid on delivery (DAP) **per country**, never both in the same country, and
  can't be combined with tax overrides, manual tax rates or customer tax exemptions.
- Low-value goods taxes apply to the EU (IOSS), the UK, Switzerland, Norway, Australia and New Zealand; the merchant must
  be registered.
- Reduced rates and exemptions come from product categories (Shopify Tax: US, EU, UK) or overrides per country or state.
- Shopify generates VAT invoices for EU and UK orders (not emailed, not for orders with duties, not Portugal) and has no
  built-in e-invoicing: it comes from the ERP or an invoicing app (Sufio, Order Printer Pro, POP).
- Pickup points are native only for stores in France, Italy, Spain and the UK; not for B2B or express wallets.
- B2B buyers see the consumer shipping methods by default; different options need Checkout Blocks, an app or a delivery
  customization function; local delivery and pickup points are not offered at B2B checkout.
- Shopify Shipping labels (USPS, FedEx) don't support hazardous materials; the merchant handles dangerous goods.

## Decision

1. **Discovery asks what changes scope, plan or apps** (question bank 1.2.0, 284 questions):
   Q3.1.8 products restricted by market · Q3.4.8 DDP countries · Q3.4.9 low-value import schemes · Q3.4.10 reduced
   rates and exemptions · Q3.4.11 invoice issuer · Q3.4.12 e-invoicing obligations · Q5.1.13 product weights source ·
   Q5.1.14 dangerous goods · Q6.2.13 B2B shipping rules. All are *recommended* (standard and full interviews); Q3.4.11 and
   Q3.4.12 feed the new app signal `invoicing_app` and are asked in quick interviews for B2B or hybrid clients or EU/UK
   markets. Q3.4.1 and Q5.1.11 help texts were corrected.
2. **Configuration detail goes in a store configuration workbook** (`npm run workbook -- --client <slug>` →
   `clients/<slug>/configuration-workbook.md`): tax registrations, tax display, duties per country, US states, reduced
   rates, B2B tax, invoices; locations, zones and rates, carriers, packages, delivery dates, local delivery, pickup,
   special products, B2B shipping, return shipping; sign-off by role. Pre-filled from engagement.json and marked
   *from discovery — confirm*. The client's finance and logistics teams complete it after the scope is agreed; backlog
   stories LWC-SHP-001, LWC-SHP-004 and the DDP story read from it.
3. **The workbook is client-facing:** no internal pricing, offer logic, exit rules or Shopify plan requirements (tested),
   no credentials, roles instead of names. Mainland China is excluded (separate China discovery).

## Consequences

- Discovery calls stay short; configuration questions don't lengthen the interview.
- Tax and legal decisions stay with the client's finance team and advisers; Merkle configures what they confirm.
- The workbook's Shopify facts carry help.shopify.com links and are re-checked at each Shopify Edition with the question
  bank.
