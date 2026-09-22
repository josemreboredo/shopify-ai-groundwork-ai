---
title: Native Shopify B2B — what it does and where it stops
verified: 2026-09-17
topics: b2b
summary: Reference on native Shopify B2B capabilities, plan requirements, tax and checkout behaviour, documented limits and alternatives.
---

## What native B2B is

Shopify B2B lets a merchant "sell business-to-business (B2B) through the Shopify admin
and online store" using the same product catalogue and admin as retail trade [1]. The
data model is a **company** with one or more **company locations**. A company location
is the entity actually being sold to, and each one can carry "its own tax ID, tax
exemptions, ship-to address, billing address, pricing, payment terms, checkout
settings, and contacts" [5].

The documented feature set includes:

- **Catalogs and price lists** — "Create custom pricing and control the availability of
  products for your B2B customers", segmented down to company location [2].
- **Payment terms** — "Configure payment terms to set the time period that a company has
  to pay for an order", from Net 7 to Net 90 plus fulfilment- and receipt-based
  variants [2].
- **PO numbers** — buyers or staff "add purchase order (PO) numbers to an order" [2].
- **Quantity rules** — "restrict the number of items that your B2B customers can
  purchase in an order" [2].
- **Volume pricing** (quantity price breaks) — "offer additional price breaks to B2B
  customers when they purchase a certain quantity of a product in the same order" [2].
- **Draft orders** — a merchant can "require B2B customer orders to be placed as drafts
  based on company location" for review or negotiation before confirmation [2].
- **Account requests** — "Create a company account request form that lets your customers
  submit a request form on your online store to access B2B purchasing" [2].
- Payment reminders, ACH, vaulted cards, draft-order-to-invoice, checkout-to-draft,
  reorders, quick order list, sales-staff permissions, the Trade theme and Flow [3].

## Blended B2B and D2C stores

A "blended store is a single Shopify store that's used for both B2B and D2C customers
and orders" [6]. Shopify's checklist for one runs: create companies and locations,
create catalogs, activate login and accounts for B2B customers, set payment and shipping
methods, customise the online store, then test [6]. A "dedicated B2B store is a separate
Shopify store that's used only for B2B customers and orders", documented as a separate
checklist [11].

## What needs Plus

Most of B2B does not. The B2B landing page says only that "Shopify B2B features are
included on plans that support B2B capabilities" — deliberately vague wording that
should never be quoted to a client without resolving it against the features-by-plan
page [1][3].

| Capability | Basic / Grow / Advanced | Plus |
|---|---|---|
| Companies, locations, net terms, PO numbers, quantity rules, price breaks [3] | Yes | Yes |
| B2B catalogs [3] | "up to 3 active catalogs across all your B2B markets" | Unlimited |
| Catalogs assigned directly to a company or location (customer-level pricing) [3] | No | Yes |
| Deposit requirements, partial payments, payment requests per fulfilment [3] | No | Yes |
| Contextual storefront and checkout via Markets [3] | Advanced | Yes |

Catalogs on the non-Plus plans carry a prerequisite: "To use B2B catalog features on the
Basic, Grow, or Advanced plans, your store must be using new Shopify Markets" [3]. Even
on Plus, "each company location can have a maximum of 25 catalogs assigned to it" [12].

## How buyers get access and approval

B2B customers authenticate through customer accounts; customer accounts must be
activated before B2B can be used, and legacy customer accounts are not supported [4][6].
Prospective buyers can "request access to your store by installing the free Shopify Forms
app" [6]. Within a company location there are two permission levels: ordering only
(purchase plus own order history) and location admin (purchase, visibility of all orders
at the location, and address updates) [5]. Approval is a merchant action in the admin —
the buyer only becomes a B2B buyer once they are attached to a company location.

## B2B checkout specifics

B2B orders must be placed by a customer "associated with a company location"; without
that association D2C rates apply instead of contracted B2B rates [4]. Unsupported in
B2B: "Accelerated checkouts, including Shop Pay, Apple Pay, Google Pay, and Amazon Pay",
local delivery, pickup points, tipping, subscriptions, legacy customer accounts, agentic
storefronts and `checkout.liquid` customisations [4]. Pickup in store, line item scripts,
abandoned checkouts and gift cards at checkout are "turned off by default for Shopify
B2B" and must be requested from Shopify Support by the store or organisation owner [4].
Orders and draft orders each cap at 500 line items and fail above that [4].

## Tax and VAT on company locations

Each company location holds its own tax ID and tax exemptions [5]. The important
limitation for European engagements: Shopify's native VAT validation "lets your business
customers enter a VAT number at checkout to claim the reverse charge exemption on
eligible cross-border orders" [8], but "VAT validation isn't currently available for
B2B-specific checkouts" [8]. On a B2B checkout, therefore, exemption is driven by the
tax settings configured on the company location, not by live validation at checkout.

Even where it does apply, it does not let staff override a failed check: with "no option
to manually override VIES validation", an incomplete VIES response means "the reverse
charge exemption isn't applied and VAT is charged by default" [8]. It keys off an active
EU fulfilment location rather than the store address, and does not cover UK-to-EU or
UK-to-UK orders [8]. It is not a tax-registration, filing or invoicing engine.

## Returns, markets and multicurrency

Return rules apply to B2B orders: "If you use B2B in Shopify, then both the B2B customer
that placed the order and the location admin can request returns or cancellations" via
self-serve returns [9]. "Exchanges can't be requested in self-serve returns and you can't
have exchange-specific return rules", although on approving a return a merchant can "add
exchange items, provide shipping instructions, and send return labels to the customer"
[9][10].

With Markets, "for each market, you can customize currency, theme, collection of taxes
and duties, discounts, and pricing and product availability with catalogs" [7] — that is
how B2B multicurrency is delivered. Catalog capacity still follows the plan: three active
catalogs across all B2B markets below Plus, unlimited on Plus [3][7].

## Native B2B, a separate wholesale store, or a B2B app

| | Native B2B | Separate wholesale store | B2B app |
|---|---|---|---|
| Pros | One product and inventory source; company/location model, terms, PO numbers and price breaks on all plans [2][3]; no third-party data processor | Full separation of catalogue, theme and checkout; on Plus it can use an expansion store on the same contract | Can cover documented gaps such as payment-method restriction, which Shopify points to apps or the Payment Customization Function API for [4] |
| Cons | Documented gaps: no accelerated checkout, subscriptions, local delivery, pickup points or tipping; several features off by default [4]; VAT validation absent from B2B checkout [8]; catalogs capped at three below Plus [3] | Two stores to build and run; data is not synced between stores in an organisation, and expansion stores are a Plus contract feature [13] | Adds a vendor dependency and a second source of pricing truth; app capability is not documented by Shopify and must be evidenced per app |

Shopify publishes no comparison of these three options, so the table is assembled from
the capability pages cited and is our reading of the documentation, not a Shopify
statement.

## Sources

1. Shopify B2B — https://help.shopify.com/en/manual/b2b — "Shopify B2B features are included on plans that support B2B capabilities, and most features are already turned on by default." — checked 2026-09-17
2. Overview of B2B features on Shopify — https://help.shopify.com/en/manual/b2b/getting-started/features — "Configure payment terms to set the time period that a company has to pay for an order" — checked 2026-09-17
3. Shopify B2B features by plan — https://help.shopify.com/en/manual/b2b/getting-started/plan-features — "To use B2B catalog features on the Basic, Grow, or Advanced plans, your store must be using new Shopify Markets." — checked 2026-09-17
4. Requirements and considerations for using B2B — https://help.shopify.com/en/manual/b2b/considerations — "Accelerated checkouts, including Shop Pay, Apple Pay, Google Pay, and Amazon Pay" are not supported; "Orders have a maximum of 500 line items" — checked 2026-09-17
5. Creating and managing B2B customers using companies — https://help.shopify.com/en/manual/b2b/companies-and-customers/creating-companies — "A company can have a maximum of 10,000 company locations."; "A company location can have a maximum of 25 catalogs." — checked 2026-09-17
6. Setup checklist for blended B2B stores — https://help.shopify.com/en/manual/b2b/getting-started/blended-store-checklist — "A blended store is a single Shopify store that's used for both B2B and D2C customers and orders." — checked 2026-09-17
7. Creating and managing B2B catalogs with Markets — https://help.shopify.com/en/manual/b2b/markets — "For each market, you can customize currency, theme, collection of taxes and duties, discounts, and pricing and product availability with catalogs." — checked 2026-09-17
8. VAT validation in checkout — https://help.shopify.com/en/manual/taxes/shopify-tax/vat-validate — "VAT validation isn't currently available for B2B-specific checkouts."; "no option to manually override VIES validation" — checked 2026-09-17
9. Setting up self-serve returns and cancellations — https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns/setup — "If you use B2B in Shopify, then both the B2B customer that placed the order and the location admin can request returns or cancellations."; "Exchanges can't be requested in self-serve returns and you can't have exchange-specific return rules." — checked 2026-09-17
10. Self-serve returns and cancellations — https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns — when you approve a return you can "add exchange items, provide shipping instructions, and send return labels to the customer" — checked 2026-09-17
11. Setup checklist for dedicated B2B stores — https://help.shopify.com/en/manual/b2b/getting-started/dedicated-store-checklist — "A dedicated B2B store is a separate Shopify store that's used only for B2B customers and orders." — checked 2026-09-17
12. Customizing B2B pricing using catalogs — https://help.shopify.com/en/manual/b2b/catalogs/creating-catalogs — "Each company location can have a maximum of 25 catalogs assigned to it." — checked 2026-09-17
13. Overview of expansion stores — https://help.shopify.com/en/manual/organization-settings/expansion-stores — "Shopify Plus plan organizations can have a maximum of ten stores on their contract with no additional cost"; "They don't share data by default." — checked 2026-09-17
