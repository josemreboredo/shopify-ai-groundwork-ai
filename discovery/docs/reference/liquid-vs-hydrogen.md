---
title: Online Store (Liquid) or headless (Hydrogen and custom storefronts)
verified: 2026-09-17
topics: storefront
summary: Compares Shopify's Online Store themes with headless storefronts and sets out when each architecture is the right choice.
---

## Why this decision matters

Every Shopify project has to answer one question early: does the customer-facing
storefront run on Shopify's Online Store (Liquid themes) or on a front end you build
and host yourself against Shopify's APIs? The commerce engine — products, inventory,
orders, checkout, payments, taxes — is the same either way. What changes is who owns
the presentation layer, who maintains it, and what the merchant's own team can edit
without a developer.

## What the Online Store is

The Online Store is Shopify's hosted storefront, rendered from a Liquid theme. A theme
is made of layouts ("the base of the theme"), templates ("the template that controls
what's displayed on a page"), sections ("reusable, customizable modules of content that
merchants can add to JSON templates and section groups"), blocks, snippets and config
files [2].

Theme architecture has moved on twice. Online Store 2.0 themes "are themes that support
sections on all pages, as well as dynamic sources". The current generation adds theme
blocks: those themes "support all of the features available in Online Store 2.0 themes,
as well as advanced customization features with theme blocks" [4]. A theme block differs
from a section-defined block because it is "defined at the theme level. You can reuse
theme blocks across different sections of the theme, unlike section-defined blocks that
can only be used within the section where they're defined", and blocks can be "nested
within other theme blocks to create hierarchy" [3].

Horizon is the theme family built on that architecture — "a new collection of free
themes designed to enhance your Shopify store", released in May 2025 [5], and named in
Shopify's Help Centre as an example of themes that support theme blocks [4].

The practical consequence is editorial. In the theme editor, "templates are customized
by adding, removing, and rearranging sections and the blocks within", and "sections can
be customized and added to any page of your online store, with the exception of gift
card and checkout pages" [6]. A merchant's marketing team can restructure pages without
touching code. That capability disappears the moment you go headless.

## What headless is

Headless means "complete control over the frontend" while Shopify runs the back end [1].
Shopify documents three routes [7]:

| Route | What you get | Hosting |
|---|---|---|
| Hydrogen | "A set of components, utilities, and design patterns that make it easier to work with Shopify APIs. Hydrogen projects are React Router apps that are preconfigured with Shopify-specific features and functionality" [14] | Oxygen |
| Hydrogen React | Shopify's component library inside a third-party React framework | Yours |
| Headless channel (bring your own stack) | "framework of your choice and Shopify's backend using only the Storefront API" [7] | Yours |

Oxygen is "Shopify's global serverless hosting platform, built for deploying Hydrogen
storefronts at the edge" and is included at no additional charge on the Starter, Basic,
Grow, Advanced, Plus and Pause-and-build plans; it is not available on the Agentic
plan [14].

## What works differently when you go headless

| Capability | Online Store | Headless |
|---|---|---|
| Checkout | Built in | Still Shopify-hosted. "When the buyer is ready to complete checkout, you can query the `Cart` object for the `checkoutUrl`" and send the buyer there [8] |
| Customer accounts | Built in | Build against the Customer Account API — OAuth 2.0, confidential or public clients with PKCE, discovery endpoints, and the `openid email customer-account-api:full` scope [9] |
| B2B | Supported in the theme | "B2B only works with customer accounts. To use customer accounts, you'll need to update existing auth/login code that's related to legacy customer accounts" [10]. B2B queries return personalised data, so caching must be disabled on buyer-specific routes [10] |
| Markets and localisation | Handled by the platform | You implement it: "Query international prices for products and orders, and explicitly set the context of a cart and checkout", and retrieve translations yourself [13] |
| Apps | Theme app extensions "allow merchants to easily add dynamic elements to their themes without having to interact with Liquid templates or code" and "can integrate with Online Store 2.0 themes" [11] | Theme app extensions do not apply. Storefront-facing app functionality must be re-integrated through APIs |
| Analytics and consent | Built in | Hydrogen "provides recommended patterns for collecting and transmitting website metrics to Shopify analytics, which enables you to view metrics in real time, directly in the Shopify admin" [12]. On a bring-your-own stack you build this yourself |
| SEO and URLs | Standard | "The standard format for product URLs is `/products/:handle`. If your storefront uses a different structure, then it's recommended that you provide a server-side redirect (3XX)" [7] |
| Content editing | Theme editor, merchant-editable | Whatever you build, or a separate CMS you license and integrate |

Shop Pay remains available through Shopify's checkout, which headless storefronts reach
via the `checkoutUrl` [8]; accelerated buy-buttons on non-Shopify pages are a separate
Storefront Web Components feature and should be confirmed per project.

## Performance

Shopify measures the storefront against "the 3 Core Web Vitals" — Largest Contentful
Paint, Interaction to Next Paint and Cumulative Layout Shift — with a summary on the
Themes page and full reports under Analytics. "Web performance data is available for
only the last 90 days" and "the data in this report might be delayed by up to 36
hours" [15]. This reporting is tied to the Online Store. A headless storefront needs its
own performance monitoring, and its performance depends on the code and hosting you
choose rather than on Shopify's theme runtime.

## Pros and cons

| | Online Store (Liquid) | Headless |
|---|---|---|
| Time to launch | Shortest — start from a Theme Store theme | Longest — the front end is a build |
| Merchant self-service | High: sections and theme blocks in the theme editor | Only what you build |
| Hosting and ops | Shopify's responsibility | Yours (Oxygen removes the hosting bill for Hydrogen, not the operational work) |
| App ecosystem | Theme app extensions install with no code | Storefront app features must be rebuilt or re-integrated |
| Design freedom | Constrained by theme architecture | Unconstrained |
| Front-end stack choice | Liquid | Any framework |
| Ongoing cost | Theme maintenance | Framework upgrades, dependency and security maintenance, CMS licence if used |
| Feature parity risk | None — features ship to the Online Store first | Customer accounts, Markets, analytics, consent and B2B each need explicit work |

## Choose headless when

- The front end must serve more than the store (an existing app, kiosk, marketplace or
  multi-brand shell) and the Storefront API is the integration point.
- The design or interaction model cannot be expressed in theme architecture.
- A separate CMS or design system is already the source of truth for content, and the
  team accepts owning the content-editing experience.
- There is a standing front-end engineering team to maintain the build after launch.

## Stay on the Online Store when

- Marketing needs to change page structure without a release.
- The roadmap depends on app-store functionality delivered through theme app extensions.
- B2B, Markets, customer accounts or consent management are in scope and there is no
  budget to reimplement them.
- The commercial case rests on speed to launch and low ongoing maintenance.

A mixed answer is legitimate: keep the Online Store and take the theme-blocks
architecture (Horizon or another current-generation theme) as the default, and treat
headless as a decision to be justified against the list above.

## Sources

1. Headless commerce on Shopify — https://shopify.dev/docs/storefronts/headless — "Get all the power of Shopify under the hood, with complete control over the frontend." — checked 2026-09-17
2. Theme architecture — https://shopify.dev/docs/storefronts/themes/architecture — "Reusable, customizable modules of content that merchants can add to JSON templates and section groups." — checked 2026-09-17
3. Theme blocks — https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/quick-start?framework=liquid — "Theme blocks are blocks that are defined at the theme level. You can reuse theme blocks across different sections of the theme, unlike section-defined blocks that can only be used within the section where they're defined." — checked 2026-09-17
4. Theme architecture versions and sources — https://help.shopify.com/en/manual/online-store/themes/managing-themes/versions — "These themes support all of the features available in Online Store 2.0 themes, as well as advanced customization features with theme blocks." — checked 2026-09-17
5. Horizon: 10 new free themes by Shopify (21 May 2025) — https://changelog.shopify.com/posts/horizon-10-new-free-themes-by-shopify — "Horizon, a new collection of free themes designed to enhance your Shopify store." — checked 2026-09-17
6. Extending your theme — https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend — "Sections can be customized and added to any page of your online store, with the exception of gift card and checkout pages." — checked 2026-09-17
7. Options for building headless — https://shopify.dev/docs/storefronts/headless/getting-started/build-options and Bring your own headless stack — https://shopify.dev/docs/storefronts/headless/bring-your-own-stack — "The standard format for product URLs is `/products/:handle`. If your storefront uses a different structure, then it's recommended that you provide a server-side redirect (3XX)" — checked 2026-09-17
8. Manage a cart with the Storefront API — https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage — "When the buyer is ready to complete checkout, you can query the `Cart` object for the `checkoutUrl` by supplying the cart's ID as your input." — checked 2026-09-17
9. Customer Account API — https://shopify.dev/docs/api/customer/latest — customers can "view their orders, manage their profile and much more"; OAuth 2.0 with confidential and public (PKCE) clients — checked 2026-09-17
10. Headless with B2B — https://shopify.dev/docs/storefronts/headless/bring-your-own-stack/b2b — "B2B only works with customer accounts. To use customer accounts, you'll need to update existing auth/login code that's related to legacy customer accounts." — checked 2026-09-17
11. Theme app extensions — https://shopify.dev/docs/apps/build/online-store/theme-app-extensions — "Theme app extensions allow merchants to easily add dynamic elements to their themes without having to interact with Liquid templates or code." — checked 2026-09-17
12. Analytics with Hydrogen and Oxygen — https://shopify.dev/docs/storefronts/headless/hydrogen/analytics — "Hydrogen provides recommended patterns for collecting and transmitting website metrics to Shopify analytics, which enables you to view metrics in real time, directly in the Shopify admin." — checked 2026-09-17
13. Markets with the Storefront API — https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets — "Query international prices for products and orders, and explicitly set the context of a cart and checkout" — checked 2026-09-17
14. Hydrogen and Oxygen fundamentals — https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals — "Shopify's global serverless hosting platform, built for deploying Hydrogen storefronts at the edge." — checked 2026-09-17
15. Web performance reports — https://help.shopify.com/en/manual/online-store/web-performance/web-performance-reports — "Web performance data is available for only the last 90 days." — checked 2026-09-17
