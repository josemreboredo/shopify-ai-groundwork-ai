---
title: Migrating a store to Shopify
verified: 2026-09-17
topics: migration
summary: What Shopify's migration tooling imports, what it does not, and the documented limits on customers, orders, redirects and bulk imports.
---

# Migrating a store to Shopify

Most replatforming risk sits in data that cannot be moved cleanly: order history, customer
passwords, and the URLs carrying a client's search traffic. This chapter sets out what Shopify's
own tooling covers and where a third-party or custom route is needed.

## Shopify's Store Migration app

Shopify publishes a first-party **Store Migration** app on the Shopify App Store [1]. The
documented source platforms are Amazon, Clover, Etsy, eBay, GoDaddy, Lightspeed, Square,
Squarespace, Wix and WooCommerce [1].

The app works from a CSV exported from the source platform: for WooCommerce you "export your
products from WooCommerce in a CSV format and upload the CSV into the app, without needing to
make changes to the CSV" [3]. For Wix it will "import your products and customers from Wix to
your Shopify admin" [4]. After the import, the app reports how many items were imported and lists
failures with a description of the issue [3].

### What it does not import

Shopify documents the following constraints:

- **Product options.** "Shopify only allows for 3 product options. Products with greater than 3
  options won't have their options imported" [3].
- **Location-specific pricing.** "Prices by location aren't supported — prices are automatically
  set to the product's highest price" [4].
- **Historical orders.** The platform guides direct merchants to third-party migration apps for
  order history rather than the Store Migration app [3].
- **Reviews.** For Squarespace, "You can't export or migrate reviews from Squarespace to
  Shopify" [5]; a review app is needed.

### Import order

Shopify is explicit: "Import your products first, then your customers, and then any historical
orders so that products and customers can be properly connected to the orders" [1].

## Customers, and the password problem

Customers are imported by CSV. The limitation that most affects a launch: "Because passwords are
encrypted outside of Shopify, you can't migrate customer passwords from another online store using
a CSV" [6]. After import, the merchant must invite customers to create new passwords so that they
can register their accounts [6]. Customer CSV files must be 15 MB or smaller; larger bases are
split across several files [6].

This matters less than it used to. With Shopify's current customer accounts, a returning customer
"enters their email address and receives a one-time 6-digit verification code" and "a password
isn't required to sign in" [7]. Where the imported profile exists in the admin, the customer
already has an account and can sign in with that email address [7].

**Consultant note.** Plan the comms, not a password migration. If the client insists on legacy
customer accounts with passwords, the reset journey becomes a launch-day risk.

## Historical orders

Two documented routes:

1. **Migration apps.** Shopify's partner guidance states that for a client on the Shopify Plus
   plan "you can use a third-party store data importer app such as Matrixify to import their
   customer, product, and order records" [14].
2. **The API.** "Use the `orderCreate` mutation to programmatically generate orders in scenarios
   where orders aren't created through the standard checkout process, such as when importing
   orders from an external system" [8]. It requires the `write_orders` access scope and is only
   accessible to apps authenticated with offline tokens [8]. On a trial or development store the
   mutation is capped at **five new orders per minute** [8], which makes a full-volume rehearsal
   on a dev store impractical — call this out in the migration plan.

One operational trap: "When you migrate your historical orders, any staff member, including the
account owner, that is set to receive new order notifications will receive a new order email for
each imported order" [15]. Turn notifications off first.

## Bulk operation limits for large imports

At scale, the Admin API bulk import path applies, with these documented limits [9]:

| Limit | Value |
|---|---|
| JSONL file size | Cannot exceed 100 MB |
| Concurrent bulk mutations per shop, per app | Up to five (API version 2026-01 and later); one of each type on earlier versions |
| Operation duration | Must complete within 24 hours, or it is stopped and marked as failed |
| Mutation shape | Limited to one connection field; `bulkOperationRunMutation` and `bulkOperationRunQuery` cannot be nested |

Each line of the JSONL file is one input unit; the mutation runs once per line [9].

## URL redirects

Redirects are the highest-value SEO artefact in a migration.

- Documented maximum: "You can create a maximum of 100,000 URL redirects unless your store is on
  the Plus plan, which has a maximum of 20,000,000 URL redirects" [10].
- Redirects are imported by CSV from **Content > Menus > URL redirects > Import**; Shopify
  publishes a sample redirect CSV template [10].
- Shopify's guidance is to "set up URL redirects in advance for any pages that your customers
  might have bookmarked, or links from third-party sources" [2]. After launch, test by entering
  the original URL in a browser and confirming it resolves to the target [10].

## SEO considerations Shopify documents

- **Sitemap.** "All Shopify stores automatically generate a `sitemap.xml` file that contains links
  to all your products, primary product image, pages, collections, and blog posts" [2]. Verify the
  site with Google and submit the sitemap so it is discovered [11].
- **Indexing is not immediate.** "It can take 48 to 72 hours for Google and other search engines
  to index new pages" [11]; the broader migration guidance says indexing can take "anywhere from a
  few days to a few weeks" [2]. Set traffic-recovery expectations accordingly.
- **Mixed protocols.** Remove explicit `http:` and `https:` protocols from asset URLs [11].

## Product and variant limits that matter during import

| Limit | Value | Source |
|---|---|---|
| Variants per product | Up to 2,048 | [12] |
| Options per product | Up to three | [12] |
| Images per product | Up to 250 | [13] |
| Barcodes per product | Up to 20 | [13] |
| Customer CSV file size | 15 MB or smaller | [6] |

To exceed the variant or option limits, Shopify documents using a third-party app or customising
theme code to capture custom requirements as line item properties [12]. Product images must sit at
a publicly accessible URL behind `https://` with no password protection, because Shopify downloads
them during the import and re-uploads them to the store [13].

**Consultant note.** A source catalogue with four or more configurable options is the most common
cause of migration scope overrun. Audit option counts before estimating.

## Comparing the routes

| Route | Best for | Advantages | Limitations |
|---|---|---|---|
| Shopify Store Migration app | Small to mid catalogues from the ten documented platforms [1] | First-party, no licence cost, CSV-driven, import report with per-item errors [3] | Products and customers only; no order history; three-option ceiling; no prices by location [3][4] |
| Migration app (for example Matrixify) | Clients needing customer, product and order records moved together [14] | Covers order history, which the first-party app does not; no engineering build | Third-party app cost and support; Shopify's partner guidance frames this route for Plus clients [14] |
| Custom API scripts | Complex or non-standard source data, large volumes | Full control of mapping; `orderCreate` supports imported orders [8]; bulk import handles volume [9] | Build and test effort; 100 MB JSONL and 24-hour limits [9]; five orders per minute on dev stores blocks rehearsal [8] |

A mid-size replatform usually uses more than one: the first-party app or CSV for catalogue and
customers, an app or script for order history, a CSV import for redirects.

## Sources

1. Migrate to Shopify — https://help.shopify.com/en/manual/migrating-to-shopify — "Import your products first, then your customers, and then any historical orders so that products and customers can be properly connected to the orders." — checked 2026-09-17
2. What you need to consider when migrating — https://help.shopify.com/en/manual/migrating-to-shopify/considerations — "All Shopify stores automatically generate a `sitemap.xml` file that contains links to all your products, primary product image, pages, collections, and blog posts." — checked 2026-09-17
3. Migrate from WooCommerce — https://help.shopify.com/en/manual/migrating-to-shopify/migrating-from-woocommerce — "Shopify only allows for 3 product options. Products with greater than 3 options won't have their options imported." — checked 2026-09-17
4. Migrate from Wix — https://help.shopify.com/en/manual/migrating-to-shopify/migrating-from-wix — "Prices by location aren't supported - prices are automatically set to the product's highest price." — checked 2026-09-17
5. Migrate from Squarespace — https://help.shopify.com/en/manual/migrating-to-shopify/migrating-from-squarespace — "You can't export or migrate reviews from Squarespace to Shopify." — checked 2026-09-17
6. Importing and exporting customer lists — https://help.shopify.com/en/manual/customers/import-export-customers — "Because passwords are encrypted outside of Shopify, you can't migrate customer passwords from another online store using a CSV." — checked 2026-09-17
7. Customer accounts: customer experience — https://help.shopify.com/en/manual/customers/customer-accounts/new-customer-accounts/customer-experience — "They enter their email address and receive a one-time 6-digit verification code." — checked 2026-09-17
8. orderCreate mutation — https://shopify.dev/docs/api/admin-graphql/latest/mutations/ordercreate — "Use the `orderCreate` mutation to programmatically generate orders in scenarios where orders aren't created through the standard checkout process, such as when importing orders from an external system." — checked 2026-09-17
9. Bulk import data (GraphQL Admin API) — https://shopify.dev/docs/api/usage/bulk-operations/imports — "The size of the JSONL file can't exceed 100MB." — checked 2026-09-17
10. Creating and managing URL redirects — https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect — "You can create a maximum of 100,000 URL redirects unless your store is on the Plus plan, which has a maximum of 20,000,000 URL redirects." — checked 2026-09-17
11. Checklist for migrating your online store to Shopify — https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/new-to-shopify-checklists/migrating-to-shopify-checklist — "It can take 48 to 72 hours for Google and other search engines to index new pages" — checked 2026-09-17
12. Adding variants — https://help.shopify.com/en/manual/products/variants/add-variants — "You can create up to 2,048 variants for a product." — checked 2026-09-17
13. Using CSV files to import and export products — https://help.shopify.com/en/manual/products/import-export/using-csv — "Your product images must be uploaded to a publicly accessible URL." — checked 2026-09-17
14. Migrating clients to Shopify from another platform — https://help.shopify.com/en/partners/resources/migrating-clients — "you can use a third-party store data importer app such as Matrixify to import their customer, product, and order records" — checked 2026-09-17
15. Migrate to Shopify with CSV files — https://help.shopify.com/en/manual/migrating-to-shopify/csv-migration — "When you migrate your historical orders, any staff member, including the account owner, that is set to receive new order notifications will receive a new order email for each imported order." — checked 2026-09-17
