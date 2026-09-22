---
title: Managed Markets
verified: 2026-09-18
topics: cross_border
summary: What Shopify Managed Markets does as merchant of record, who is eligible, what it costs, what it excludes, and how it compares with self-managed duties.
---

# Managed Markets

## What Managed Markets is

Managed Markets lets a merchant sell internationally without registering a business or handling tax compliance country by country. Customers "buy from your store, in your brand's checkout, and pay in their own currency" [1].

The mechanism is a change of merchant of record. Shopify documents that Managed Markets "adds Global-e as the merchant of record and takes those responsibilities on for a per-order fee" [1]. From the customer's point of view nothing changes, but the legal seller for the cross-border transaction is no longer the merchant. Managed Markets is therefore not a feature toggle on top of Shopify Markets — it is an outsourcing of cross-border legal and tax liability to a partner, priced as a percentage of order value.

## Who is eligible

Eligibility is narrow and geography-bound.

| Requirement | Detail |
|---|---|
| Business location | Available to businesses in the continental United States, and to certain stores in Canada and the United Kingdom [2] |
| Plan | Basic plan or higher [2] |
| Payments | "Your store must use Shopify Payments" [2] |
| Store currency | "Your store currency must be the default currency of the country where your business is based" [2] — a US business needs USD; if the store currency differs, Managed Markets cannot be activated [2] |
| Physical presence | At least one non-PO box location in the home country [2] |
| Fulfilment | At least one fulfilment location in the home country. US: continental US. Canada: fulfilment in the same province. UK: fulfilment in either Great Britain or Northern Ireland, not both [2] |
| Tax setup (Canada) | Must use Shopify Tax or Basic Tax [2] |
| Products | Reviewed before activation "to ensure that they're not prohibited items in the countries and regions that you sell to" [4] |

**A merchant based outside the United States, Canada or the United Kingdom cannot use Managed Markets.** For European, APAC, LATAM and Middle East clients this chapter is background only: the cross-border answer is self-managed duties on Shopify Markets, or a third-party merchant-of-record app.

Region-specific: US territories including Puerto Rico and Guam are excluded from the US eligibility definition [2]. The Canada and UK programmes are documented separately and carry their own conditions [2].

## What it does for the merchant

- **Tax registration and remittance.** "Global-e registers for tax in the countries that you sell to and remits duties and taxes to local authorities on your behalf" [1].
- **Compliance.** Global-e "complies with local laws for cross-border products, restricts certain products to specific destinations" [1], and produces commercial invoices and carrier arrangements [1].
- **Payments.** More local payment methods, 136 currencies with USD payouts, and fraud chargeback protection in the United States [3].
- **Duties.** Calculated and collected, HS codes assigned automatically, with "international pricing to automatically display prices with duties and import tax included" [3].
- **Shipping.** Discounted DHL Express, DHL eCommerce, FedEx and UPS labels, with automated address correction [3].
- **EU consumer law.** "compliant cancellation and return policies are automatically applied" to EU orders [2].

Returns stay with the merchant: they are "managed by you in your Shopify admin, the same as your other orders" [5], and customer requests, return labels and return costs remain the merchant's responsibility [2]. Two refund rules matter commercially: "After the Managed Markets order is fulfilled, refunds aren't provided for duties, customs fees, or VAT" [5], while a full refund before fulfilment returns duties and customs on the next payout [5]. A 30-day guarantee "ensures that the same currency exchange rate is applied for 30 days after your order is placed" [5].

## What it costs

| Component | Rate |
|---|---|
| Managed Markets transaction fee | "3.5% for stores that are on the Basic, Grow, or Advanced plan"; 3.25% on Shopify Plus [1] |
| Currency conversion | "A 1.5% currency conversion fee, also known as the foreign exchange (FX) fee" [1] |
| Payment processing | Standard Shopify Payments rates, varying by plan and card type [1] |

These stack, on top of normal payment processing. The all-in take rate on a cross-border order is materially higher than domestic. Model it against gross margin: it usually pays when the alternative is registering for VAT in several countries, and rarely when cross-border is a small share of revenue.

## What it does not support

Documented exclusions [2], re-verified 2026-09-18:

- **B2B.** "B2B orders aren't supported by Managed Markets."
- **Subscriptions.** "Managed Markets doesn't support subscriptions."
- **Multiple business entities.** "Managed Markets doesn't support multiple business entities" — which is why it can never be the answer for a client whose markets sell through different legal entities. That client is choosing between one store with Markets and expansion stores, not between merchants of record.
- **Free orders.** "Free orders that have a value of zero aren't supported."
- **Shopify Collabs**, and the standalone Global-e app, cannot run alongside it.
- **Manual bundles** created as a single line item are incompatible; Shopify Bundles are supported.
- **Order editing.** "Managed Markets orders can't be edited after a shipping label is printed."
- **Canada.** All fulfilment locations must sit in the same province, and the store must use Shopify Tax or Basic Tax — "Managed Markets can't be used if your store uses manual tax settings" [2].

## The checkout disclaimer

Managed Markets is visible to the customer. "A disclaimer is displayed at checkout on your Managed Markets orders which states that your customer is purchasing from Global-e, and provides a link to Global-e's terms and conditions and privacy policy" [1]. It appears only to customers in Managed Markets regions, and it cannot be hidden or modified. On a premium or luxury brand this is a brand decision as much as a tax one, and it belongs in the recommendation rather than in a footnote.

## Managed Markets is not a topology

It answers *who sells*, not *how many stores*. A merchant can run one store with Shopify Markets and put cross-border orders through Managed Markets; it does not merge stores, split them, or remove the need for a second store where the business genuinely runs two operations. Decide the store topology first, from the business facts (see `shopify-markets`), then decide the merchant of record.

## Managed Markets versus self-managed duties

| | Managed Markets | Self-managed duties on Shopify Markets |
|---|---|---|
| Merchant of record | Global-e [1] | The merchant |
| Tax registration abroad | Handled by Global-e [1] | The merchant registers where required; Shopify does not file or remit [6] |
| Duties at checkout | Calculated, collected and remitted; HS codes assigned automatically [3] | Estimates only, "based on the latest information at the time that the customer places their order" [7]; merchant supplies HS codes [8] |
| Carriers | DHL Express, DHL eCommerce, FedEx, UPS at discounted rates [3] | Carrier must support DDP labels; through Shopify's own carrier accounts that means Canada Post (US only) and DHL Express [9] |
| Cost | 3.5% (3.25% Plus) plus 1.5% FX plus processing [1] | 0.85% with Shopify Payments, 1.5% with other providers, on orders with duties calculated [8] |
| Local payment methods | Broader set, 136 currencies, USD payouts [3] | Shopify Payments local currencies and Stripe local options [3] |
| Fraud and chargebacks | Chargeback protection in the US [3] | Merchant's own risk |
| B2B and subscriptions | Not supported [2] | Supported by the normal platform |
| Eligibility | US, Canada, UK businesses only, Shopify Payments required [2] | Open to any merchant on any plan |
| Control | Lower — no checkout redirects, limited order editing [2] | Full |

**Pros of Managed Markets:** removes foreign tax registration and remittance work, removes the compliance burden of restricted goods, gives a cleaner duty-paid checkout, adds local payment methods and US chargeback protection, and is fast to switch on.

**Cons:** materially higher cost per order, eligibility limited to three countries, no B2B or subscriptions, reduced checkout and order-editing control, dependence on a third party as merchant of record, and duties and VAT are non-refundable once fulfilled.

**Rule of thumb for scoping.** Recommend Managed Markets when the client is US, Canadian or UK based, sells direct to consumer, ships to many destinations, and would otherwise need multiple VAT or sales tax registrations. Recommend self-managed duties when the client is outside the eligible countries, sells B2B or subscriptions, concentrates on one or two destinations where registration is straightforward, or needs full checkout control.

## Sources

1. Overview of Managed Markets — https://help.shopify.com/en/manual/international/managed-markets/overview — "Global-e registers for tax in the countries that you sell to and remits duties and taxes to local authorities on your behalf" — checked 2026-09-17
2. Requirements and considerations for using Managed Markets — https://help.shopify.com/en/manual/international/managed-markets/requirements-and-considerations — "B2B orders aren't supported by Managed Markets." — checked 2026-09-17
3. Comparing International and Managed Markets features — https://help.shopify.com/en/manual/international/managed-markets/compare — "discounted DHL Express, DHL eCommerce, FedEx, and UPS shipping labels" — checked 2026-09-17
4. Setting up Managed Markets — https://help.shopify.com/en/manual/international/managed-markets/setting-up — "Your products are reviewed before you activate Managed Markets to ensure that they're not prohibited items in the countries and regions that you sell to." — checked 2026-09-17
5. Fulfilling and managing Managed Markets orders — https://help.shopify.com/en/manual/international/managed-markets/fulfillment — "After the Managed Markets order is fulfilled, refunds aren't provided for duties, customs fees, or VAT." — checked 2026-09-17
6. Tax registration — https://help.shopify.com/en/manual/taxes/registration — "It's your responsibility to consult with local tax authorities or a tax professional to verify that you charge your customers the correct tax rates" — checked 2026-09-17
7. Considerations for charging duties and import taxes at checkout — https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations — "The duties and import taxes that are charged are estimates based on the latest information at the time that the customer places their order." — checked 2026-09-17
8. Collecting international duties and import taxes at checkout — https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties — "0.85% transaction fee applies to orders that have duties and import taxes calculated" — checked 2026-09-17
9. Buying DDP shipping labels — https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/ddp-ddu — "DDP (Delivered Duty Paid) labels are supported only for specific carriers when purchasing shipping labels through Shopify's carrier accounts" — checked 2026-09-17
10. Overview of Managed Markets — https://help.shopify.com/en/manual/international/managed-markets/overview — "A disclaimer is displayed at checkout on your Managed Markets orders which states that your customer is purchasing from Global-e" · "3.25% for stores on the Shopify Plus plan" · "3.5% for stores that are on the Basic, Grow, or Advanced plan" · "A 1.5% currency conversion fee, also known as the foreign exchange (FX) fee" — checked 2026-09-18
11. Requirements and considerations for using Managed Markets — https://help.shopify.com/en/manual/international/managed-markets/requirements-and-considerations — "Managed Markets doesn't support multiple business entities" · "Managed Markets doesn't support subscriptions" · "Free orders that have a value of zero aren't supported" · "Managed Markets orders can't be edited after a shipping label is printed" — checked 2026-09-18
