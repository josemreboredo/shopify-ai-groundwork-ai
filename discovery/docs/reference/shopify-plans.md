---
title: Shopify plans — what each plan actually unlocks
verified: 2026-09-17
topics: plans
summary: Reference on Shopify's plans and the documented limits and features that decide plan choice on a project.
---

## What the plans are

Shopify documents its plans in the Help Center as Starter, Lite, Retail, Basic, Grow,
Advanced, Shopify Plus, Shopify for enterprise and Agentic [1]. For a typical online
store project the choice is between **Basic, Grow, Advanced and Plus**. Shopify
positions them by trading experience and volume rather than by feature checklist:
"The best plan for your business depends on your experience with ecommerce and your
expected sales volume" [18], with Basic "for new businesses", Grow for "growing
businesses with consistent sales" and Advanced for "high-volume businesses that need
the lowest transaction fees, or businesses migrating from another platform" [18].

Two plans sit outside that ladder. The **Starter** plan "isn't available to new
stores" and cannot be returned to once left, so it is not a live option on new
engagements [20]. The **Agentic** plan "is for merchants
that don't already use Shopify as their ecommerce platform" [19]; it has no monthly
subscription fee and exists to sell through AI-powered channels and the Shopify
Catalog without migrating the existing platform [19]. It is not a substitute for a
store plan.

Prices and card rates are shown in local currency and differ by region. On the
Swiss pricing page checked today, online standard card rates were quoted as
Basic 2.95% + CHF0.30, Grow 2.75%, Advanced 2.55% and Plus 2.3% [3]. Always re-check
the pricing page for the client's own market before quoting a number.

## What actually drives plan choice

| Feature or limit | Basic | Grow | Advanced | Plus |
|---|---|---|---|---|
| Staff users (excludes collaborators, POS-only staff) [2][21] | 0 | 5 | 15 | Unlimited |
| Inventory locations [3][17] | 10 | 10 | 10 | 200 |
| Admin GraphQL rate limit [4] | 100 points/s | 100 points/s | 200 points/s | 1000 points/s |
| B2B catalogs [3][5] | up to 3 | up to 3 | up to 3 | Unlimited |
| Catalogs assigned directly to a company or location [5] | No | No | No | Yes |
| Checkout UI extensions on information, shipping, payment steps [6] | No | No | No | Yes |
| Checkout UI extensions on thank-you / order-status pages [6] | Yes | Yes | Yes | Yes |
| Checkout Branding API [7] | No | No | No | Yes |
| Expansion stores [8][17] | — | — | — | 9 (plus the main store) |
| Business entities per market [9] | No | No | No | Yes |
| Published languages [10] | 20 | 20 | 20 | 30 |
| Theme customisation per market [11] | No | No | Yes | Yes |
| Combined listings [12] | No | No | No | Yes |
| Third-party carrier-calculated shipping [13] | No | Paid add-on or annual billing | Yes | Yes |
| Multi-currency payouts [14] | No | No | Yes | Yes |
| Shopify Functions inside a **custom** app [15] | No | No | No | Yes |
| Semantic storefront search (fewer than 200,000 products) [16] | No | Yes | Yes | Yes |

Notes on the table. Shopify's rate-limit documentation uses "Standard", "Advanced
Shopify", "Shopify Plus" and "Shopify for enterprise" rather than the current
commercial plan names, so Basic and Grow both fall under "Standard" at 100
points/second; enterprise is documented at 2000 points/second [4]. Storefront API
has no fixed request-per-minute limit for real buyer traffic [4].

Public apps from the App Store that contain Shopify Functions can be installed on any
plan; the Plus requirement applies only to Functions shipped inside a custom app you
build for one merchant [15]. That distinction decides
whether a discount, delivery or payment customisation has to be packaged as a public
app or forces a Plus upgrade.

B2B catalogs on Basic, Grow and Advanced carry a prerequisite: "To use B2B catalog
features on the Basic, Grow, or Advanced plans, your store must be using new Shopify
Markets" [5].

## How to choose

Work through these questions in order; each maps to a row above.

1. **How many people need admin access?** More than five named staff pushes past Grow;
   more than fifteen pushes past Advanced [2].
2. **How many stock locations?** Over ten locations requires Plus [3][17].
3. **Does checkout itself need to change?** Anything that adds fields, validation or UI
   to the information, shipping or payment steps, or restyles checkout through the
   Checkout Branding API, is Plus [6][7]. Post-purchase changes are not [6].
4. **Do we need a Shopify Function in a bespoke app?** If yes, and it cannot be a
   public app, that is Plus [15].
5. **How international is the roll-out?** Per-market theme content starts at Advanced
   [11]; separate legal entities per market, more than 20 published languages, and
   expansion stores are Plus [8][9][10].
6. **How much API traffic will integrations generate?** Advanced doubles and Plus gives
   ten times the Standard Admin API budget [4].
7. **Is there a B2B side?** See the companion B2B chapter; only unlimited catalogs,
   direct company catalogs, deposits and partial payments are Plus [5].
8. **Are live carrier rates or payouts in several currencies needed?** Both start at
   Advanced, with carrier rates available on Grow for an extra fee [13][14].

## Common misconceptions

- **"B2B is Plus-only."** It is not. Companies, company locations, net payment terms,
  PO numbers, quantity rules, quantity price breaks, draft-order-to-invoice and the
  Trade theme are documented as available on all plans, with up to three catalogs on
  Basic, Grow and Advanced [5].
- **"Any checkout customisation needs Plus."** Extensions on the thank-you and
  order-status pages are available on all plans except Starter [6].
- **"Advanced gets you expansion stores."** Expansion stores are a Plus organisation
  feature — one main store and nine expansion stores on the contract [8].
- **"Markets means multi-entity."** Markets are available broadly; assigning a separate
  legal entity to a market is Plus [9].
- **"Plus removes all rate limits."** Plus raises the Admin API budget to 1000
  points/second; higher limits are by request, not automatic [4][17].
- **"Shopify's documentation always names the plan."** It often does not. The B2B
  landing page says only that features are "included on plans that support B2B
  capabilities" — vague wording that has to be resolved against the B2B features-by-plan
  page before it goes in a proposal [5].

## Sources

1. Plan features — https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features — "Starter plan, Lite plan, Retail plan, Basic plan, Grow plan, Advanced plan, Shopify Plus plan, Shopify for enterprise, Agentic plan" — checked 2026-09-17
2. Maximum number of users for each pricing plan — https://help.shopify.com/en/manual/your-account/users/users-plan-requirements — "Starter: 0 users. Basic: 0 users. Grow: 5 users. Advanced: 15 users. Shopify Plus: Unlimited users" — checked 2026-09-17
3. Shopify pricing — https://www.shopify.com/pricing — "Up to 5 staff accounts"; "Up to 15 staff accounts"; "Unlimited staff accounts"; "Up to 3 catalogs"; "Unlimited catalogs" — checked 2026-09-17
4. Shopify API rate limits — https://shopify.dev/docs/api/usage/limits — "100 points/second"; "200 points/second"; "1000 points/second"; "2000 points/second" — checked 2026-09-17
5. Shopify B2B features by plan — https://help.shopify.com/en/manual/b2b/getting-started/plan-features — "To use B2B catalog features on the Basic, Grow, or Advanced plans, your store must be using new Shopify Markets." — checked 2026-09-17
6. Customizing your checkout and customer accounts with apps — https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-apps — plan table: "Apps built with UI extensions for the information, shipping, and payment pages" — Shopify Plus only; "Apps built with UI extensions for the thank you and order status pages" — Basic Shopify plan or higher — checked 2026-09-17
7. checkoutBrandingUpsert mutation — https://shopify.dev/docs/api/admin-graphql/latest/mutations/checkoutBrandingUpsert — "Requires access to checkout branding settings and the shop must be on a Plus plan or a Development store plan." — checked 2026-09-17
8. Overview of expansion stores — https://help.shopify.com/en/manual/organization-settings/expansion-stores — "Shopify Plus plan organizations can have a maximum of ten stores on their contract with no additional cost" (one main store and nine expansion stores) — checked 2026-09-17
9. Setting up business entities for markets — https://help.shopify.com/en/manual/markets/customizations/business-entities — "Business entities are available on the Plus plan only." — checked 2026-09-17
10. Languages — https://help.shopify.com/en/manual/international/localization-and-translation — "up to 20 languages from a single Shopify store"; "up to 30 languages on the Shopify Plus plan and Shopify Enterprise Commerce plan" — checked 2026-09-17
11. Adapting themes for specific markets — https://help.shopify.com/en/manual/online-store/themes/customizing-themes-for-markets — "Customizing themes for specific markets is available only to stores on the Advanced or Plus plan." — checked 2026-09-17
12. Combined listings — https://help.shopify.com/en/manual/products/combined-listings-app — "The Shopify Combined Listings app is available only on Plus and enterprise commerce plans." — checked 2026-09-17
13. Third-party carrier-calculated shipping — https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/third-party-carrier-calculated-shipping — "Third-party carrier-calculated shipping (CCS) is available on Shopify Advanced and Shopify Plus plans."; "Shopify Grow stores can add CCS for an additional monthly fee or by switching to annual billing." — checked 2026-09-17
14. Managing Multi-Currency Payouts with Shopify Payments — https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/payouts-in-multiple-currencies — "Your store must be on the Advanced or Shopify Plus plan." — checked 2026-09-17
15. About Shopify Functions — https://shopify.dev/docs/apps/build/functions — "Only stores on a Shopify Plus plan can use custom apps that contain Shopify Function APIs."; "Stores on any plan can use public apps that are distributed through the Shopify App Store and contain functions." — checked 2026-09-17
16. Modifying search with Shopify Search & Discovery — https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-modify-search — "Your store has fewer than 200,000 products."; "Your store is on one of the following pricing plans: Grow, Advanced, Plus" — checked 2026-09-17
17. Shopify Plus plan — https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-plus-plan — "Unlimited staff accounts"; "9 expansion stores"; "Up to 200 locations"; "Checkout Branding API for visual modifications" — checked 2026-09-17
18. Choosing the right plan — https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/choosing-a-plan — "The best plan for your business depends on your experience with ecommerce and your expected sales volume." — checked 2026-09-17
19. Agentic plan — https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-agentic-plan — "The Agentic plan is for merchants that don't already use Shopify as their ecommerce platform." — checked 2026-09-17
20. Starter plan — https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-starter-plan — "The Starter plan isn't available to new stores."; "If you're a merchant currently on the Starter plan and you decide to change your plan, then you can't revert back to the Starter plan." — checked 2026-09-17
21. Advanced plan — https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/shopify-advanced-plan — "The Advanced plan supports 15 user accounts" — checked 2026-09-17
