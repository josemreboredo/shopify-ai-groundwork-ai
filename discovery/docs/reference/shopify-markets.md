---
title: Shopify Markets
verified: 2026-09-17
topics: markets, cross_border
summary: How Shopify Markets structures cross-border selling — domains, languages, pricing, catalogs, duties and taxes — and when an expansion store is the better answer.
---

# Shopify Markets

## What Shopify Markets is

Markets controls how groups of customers experience one store, "based on their location, customer group, retail location, or sales channel" [1]. A market has conditions (who it applies to) and customisations, which "control settings, such as currency, product availability, theme content, domains, languages, and taxes" [1] — one store and one admin with per-market overrides, rather than one store per country.

## Market types and limits

| Type | What it is keyed on | Documented limit |
|---|---|---|
| Country or region | Geographic location [2] | "There's no limit to the number of country or region markets you can create" [2] |
| Retail | POS locations [2] | Catalogue customisation "requires Shopify POS Pro or the Plus plan" [3] |
| B2B | Wholesale company locations [2] | Basic, Grow, Advanced: "up to 3 active catalogs across all your B2B markets"; Plus: unlimited [2] |
| Channel | Sales channels [2] | None documented |

Not confirmed: a 50-market cap on Plus is sometimes claimed, but the documentation records no limit on country or region markets [2]. Confirm before designing against a cap.

## Domain strategies

Each market is served from a domain or a path on one [5].

| Strategy | Example | SEO | Operations |
|---|---|---|---|
| Subfolder | `yourstore.com/fr/` [5] | Inherits the main domain: "benefit from your store's existing search ranking and domain authority" [4] | "minimal setup" [4]; deleting a market needs redirects or customers hit 404s [4] |
| Subdomain | `fr.yourstore.com` | "might take longer to develop domain authority" [4] | Free to set up [4] |
| ccTLD | `yourstore.fr` | "develops its own domain authority and search ranking" [4] | One domain purchase per market; "the most time and effort to build up your SEO" [4] |

Subfolders are the default; ccTLDs are justified only by existing local domain equity or a legal reason to separate.

## Languages

A store can sell in "up to 20 languages ... on the Basic, Grow, Shopify, or Advanced plan, and in up to 30 languages on the Shopify Plus plan and Shopify Enterprise Commerce plan" [6]. Each published language gets its own URL (`example.com/fr`), hreflang tags are "Automatically added for language-specific URLs" [6], and published languages appear in sitemaps [6].

Translations live in the Translate & Adapt app, covering "products, collections, blog posts, policies, and pages" [7]. Machine translation is capped — "You can automatically translate a maximum of 2 languages" [7] — and once used, "you can't switch that automatic translation to a different language" [7]. Beyond two, budget for human or third-party translation.

## Pricing per market

Three mechanisms, in increasing order of control: automatic currency conversion, using "(Product price x currency conversion rate) x (1 + currency conversion fee)" [8] with optional rounding rules [8][9]; percentage adjustment per market, applied to a catalogue [9][10]; and fixed prices per product, by country or region [9].

Fixed prices win — "the fixed price takes precedence over any other adjustments" [11] — which is the hook for ERP-maintained pricing: an ERP pushes fixed per-market prices through the GraphQL Admin API price list objects, whose currency must match the market's [11].

Region-specific: the conversion fee appears in Shopify's worked example as 1.5% [8] but varies by store location. Local currency pricing requires Shopify Payments with one-page checkout and a country selector [9].

## Catalogs and product availability

A catalog is "a set of products with optional custom pricing that you assign to a market" [10]. By default "all the products in your store are available in every market at your store's default prices" [10]; a catalogue then includes or excludes products and sets prices [10]. Where a parent market and a submarket both price a product, "the more specific price is used" [10].

## Automatic redirection

When activated, "the online storefront that matches the location preferences of your customers is automatically displayed" [13]. The documented exception: "Customers from the EU who access a localized experience with an EU country code top-level domain name (ccTLD) aren't automatically redirected" [13] — they can be where the market uses a non-country domain such as `.com` [13]. Language redirection works only where the language is added, assigned, translated and published [13]. Note also: "For markets that use shared domains, content isn't indexed by search engines" [13]. The separate Geolocation app only recommends: it "doesn't automatically adjust a country or language based on a visitor's location" [14].

## Market-specific theme content

"Per-market theme customization requires the Advanced plan or higher" [12]. On Basic and Grow all markets share one theme customisation; adaptation fields may appear in Translate & Adapt but will not display [12]. Confirm the plan before promising per-market merchandising.

## Duties and import taxes at checkout

Delivered duty paid (DDP) means the customer pays import costs at checkout; delivered at place (DAP) leaves them to pay on delivery. DDP requires a carrier that "support[s] DDP labels", no Shopify Fulfillment Network, and "Harmonized System (HS) codes applied to products" [15]. Documented limitations [16]:

- Not compatible with tax overrides or manual tax rates.
- "You can't offer both DDP and DAP to customers in the same country or region."
- No duties in the "Rest of world" shipping zone.
- Charges are estimates "based on the latest information at the time that the customer places their order."
- Twelve countries and regions are unsupported, including Northern Ireland, Russia and Puerto Rico.
- Taxes cannot be collected alone; duties and taxes are collected together.

Carriers supporting DDP labels bought through Shopify are limited to Canada Post (US destinations only) and DHL Express (US and Canada); DHL eCommerce is DAP only [17]. Other carriers must be confirmed directly [16]. Without a DDP label, "your customer is still charged duties and import taxes at delivery" [15].

Fees: 0.85% with Shopify Payments, 1.5% with other providers, on orders with duties calculated [15]; a temporary 0.5% rate applied from 2 February 2025 [15]. Not confirmed: whether 0.5% is still in force — verify before quoting.

## EU VAT and IOSS

The Import One-Stop Shop "is for merchants outside the EU that sell to customers located in any EU member country" [18], letting them "collect VAT on orders equal to or less than €150 EUR at checkout so that your customers don't pay taxes upon delivery" [18]. Registration is optional "but it is required if you intend to charge VAT during the checkout process" [18]. The One-Stop Shop does not help: "OSS registrations don't apply when the selected fulfillment location is outside the EU" [18].

Shopify also documents that "Starting July 1, 2026, the EU will begin removing the €150 EUR customs duty exemption" [18] — a date now passed, so confirm the current position for the client's goods.

## Tax registrations, Shopify Tax and Basic Tax

Shopify Tax covers "the United States, European Union, United Kingdom, and Canada" [19]. Outside those, Basic Tax covers Norway, Switzerland, Australia, New Zealand and Singapore, and "requires you to input a tax registration number" [21]. Registrations are added per region under Settings > Taxes and duties [21]. Shopify Tax is free until a sales threshold, then charged per order with a cap [20]. Shopify does not file or remit: "It's your responsibility ... to ensure that you file and remit your taxes correctly" [21].

## Expansion stores as the alternative

Expansion stores are "additional `.myshopify.com` stores that fall under the same organization and contract on your Shopify Plus plan" [22], recommended for multiple regions or languages, product line extensions, B2B wholesale and member or employee stores [22]. The cost is isolation: "Store settings, products, collections, and inventory aren't synced between stores" [22], apps are billed per store and theme licences are not shared [22]. Markets is the default; an expansion store is justified only by a different catalogue structure, operating entity, app stack or team.

## Sources

1. Markets — https://help.shopify.com/en/manual/markets — "You can use Markets to manage how different customers experience your store based on their location, customer group, retail location, or sales channel." — checked 2026-09-17
2. Understanding market types — https://help.shopify.com/en/manual/markets/getting-started/market-types — "There's no limit to the number of country or region markets you can create." — checked 2026-09-17
3. Managing markets — https://help.shopify.com/en/manual/markets/managing-markets — "Customizing catalogs for use with retail markets requires Shopify POS Pro or the Plus plan." — checked 2026-09-17
4. International domains — https://help.shopify.com/en/manual/domains/managing-domains/international-domains — "region-specific URLs benefit from your store's existing search ranking and domain authority" — checked 2026-09-17
5. Assigning domains and languages to markets — https://help.shopify.com/en/manual/markets/customizations/domains-and-languages — "Your market is served from a path on your primary domain (for example, `yourstore.com/fr/`)." — checked 2026-09-17
6. Languages — https://help.shopify.com/en/manual/markets/languages — "You can sell in up to 20 languages from a single Shopify store on the Basic, Grow, Shopify, or Advanced plan, and in up to 30 languages on the Shopify Plus plan" — checked 2026-09-17
7. Add language translations using the Translate & Adapt app — https://help.shopify.com/en/manual/international/translate-adapt-app — "You can automatically translate a maximum of 2 languages." — checked 2026-09-17
8. Currency conversions and exchange rates — https://help.shopify.com/en/manual/international/pricing/exchange-rates — "(Product price x currency conversion rate) x (1 + currency conversion fee)" — checked 2026-09-17
9. Pricing for markets — https://help.shopify.com/en/manual/markets/pricing — "if you sell in local currencies, then you need to have a country selector so that customers can select their local country or region" — checked 2026-09-17
10. Catalogs — https://help.shopify.com/en/manual/markets/customizations/catalogs — "A catalog is a set of products with optional custom pricing that you assign to a market." — checked 2026-09-17
11. About catalogs for different markets — https://shopify.dev/docs/apps/build/markets/catalogs-different-markets — "if you use the `PriceListPrice` field to configure a fixed price for a product variant, then the fixed price takes precedence over any other adjustments" — checked 2026-09-17
12. Customizing your online store for markets — https://help.shopify.com/en/manual/markets/customizations/online-store — "Per-market theme customization requires the Advanced plan or higher." — checked 2026-09-17
13. Automatic redirection — https://help.shopify.com/en/manual/international/automatic-redirection — "Customers from the EU who access a localized experience with an EU country code top-level domain name (ccTLD) aren't automatically redirected." — checked 2026-09-17
14. Geolocation — https://help.shopify.com/en/manual/international/geolocation — "doesn't automatically adjust a country or language based on a visitor's location. Customers need to accept the recommendations" — checked 2026-09-17
15. Collecting international duties and import taxes at checkout — https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties — "0.85% transaction fee applies to orders that have duties and import taxes calculated" — checked 2026-09-17
16. Considerations for charging duties and import taxes at checkout — https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations — "You can't offer both DDP and DAP to customers in the same country or region." — checked 2026-09-17
17. Buying DDP shipping labels — https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/ddp-ddu — "DDP (Delivered Duty Paid) labels are supported only for specific carriers when purchasing shipping labels through Shopify's carrier accounts" — checked 2026-09-17
18. EU tax reference — https://help.shopify.com/en/manual/taxes/eu/eu-tax-reference — "The Import One-Stop Shop (IOSS) scheme is for merchants outside the EU that sell to customers located in any EU member country." — checked 2026-09-17
19. Shopify Tax — https://help.shopify.com/en/manual/taxes/shopify-tax — "Shopify Tax offers the highest level of sales tax compliance with the least amount of upkeep for merchants that sell to customers in the United States, European Union, United Kingdom, and Canada." — checked 2026-09-17
20. Shopify Tax pricing — https://help.shopify.com/en/manual/taxes/shopify-tax/pricing — "Sales from the online store to any destination country" count toward the free threshold, after which per-order fees apply. — checked 2026-09-17
21. Tax registration — https://help.shopify.com/en/manual/taxes/registration — "It's your responsibility to consult with local tax authorities or a tax professional to verify that you charge your customers the correct tax rates" — checked 2026-09-17
22. Overview of expansion stores — https://help.shopify.com/en/manual/organization-settings/expansion-stores — "Store settings, products, collections, and inventory aren't synced between stores. They don't share data by default." — checked 2026-09-17
