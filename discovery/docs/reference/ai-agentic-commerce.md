---
title: AI and agentic commerce on Shopify
verified: 2026-09-17
topics: ai
summary: Explains UCP, agentic storefronts, Shopify Catalog, MCP endpoints and merchant-facing AI, and what a merchant must decide.
---

## Why this is a decision, not a feature

Shopify's agentic commerce capability is opt-out, not opt-in. "Agentic storefronts is
active by default for eligible stores" [3], and a merchant "can't opt out of Shopify
Catalog itself" [12]. The question is which parts to leave on and what data the merchant
is comfortable syndicating. Several pieces below are pre-general-availability.

## UCP — the Universal Commerce Protocol

Shopify describes UCP as "an open standard for integrating commerce with agents, forged
from billions of transactions and supported by millions of merchants", "co-developed with
Google, open to everyone" [2]. For agent developers it covers four stages: "negotiate and
authenticate", "discover products", "carts and checkout" and "monitor orders" [1].

A merchant does not onboard to UCP separately — reachability follows from Shopify Catalog
eligibility and the settings below. The Universal Cart API, which lets an agent assemble
a cart across merchants, is still early access behind a waitlist [1].

## Agentic storefronts

Agentic storefronts are the AI channels through which Shopify surfaces products. The
documented channels are ChatGPT, Google AI Mode and Gemini, Microsoft Copilot, and
Meta [3].

**Default state.** "Agentic storefronts is active by default for eligible stores" [3].
The admin control is **Sales channels > Agentic** [6], and the default setting is **"Allow
Shopify to manage for me"**: it enrols the store in all agentic storefront channels,
grants them Shopify Catalog access, activates direct checkout where supported, and
auto-enrols the store in future channels. Turning it off lets the merchant manage Catalog
access, auto-enrolment and direct checkout per channel; a seven-day delay applies before
a Catalog access deactivation takes effect [4].

**Direct checkout versus referral.** Two models, with different data and attribution
consequences:

| Channel | Model | Notes |
|---|---|---|
| ChatGPT | Referral | "ChatGPT acts as a discovery-focused referrer platform... ChatGPT users complete their purchase on your online store checkout in a ChatGPT in-app browser, or in a new tab when customers use ChatGPT web" [9]. The only ChatGPT control is Shopify Catalog access [6] |
| Google AI Mode and Gemini | Direct checkout | "Direct checkout is activated by default for eligible stores", still rolling out, so it "might not yet be available in your store" [7] |
| Microsoft Copilot | Direct checkout | Customers pay "by clicking a 'Pay now' button and paying with a credit card or debit card". "There are no fees... You pay only your standard payment processing fees" [8] |
| Meta | Direct checkout where activated | Documented among the channels supporting direct checkout [9] |

**Eligibility.** Google AI Mode and Gemini require that "your store must be based in the
United States and you must sell to customers in the United States", plus a Google
Merchant Center account with products available there [7]. Microsoft Copilot's "direct
checkout displays only to customers based in the United States" [8]. Agentic storefronts
"support only direct-to-consumer (D2C) sales", and "products that are sold exclusively to
business or wholesale customers are automatically excluded from AI channels when Shopify
can identify them" [11]. On the Agentic plan, direct checkout is deactivated by
default [3][5]. The merchant must agree to the Shopify Agentic Storefronts Supplemental
Terms of Service and complete Terms of service, Privacy policy, and Return and refund
policy in **Settings > Policies** [5][7].

**What the channels receive.** All AI channels receive product titles, descriptions,
images, pricing and availability. Channels with direct checkout receive, on an order,
"order details such as the customer's name, email address, phone number, and physical
address". Shopify states that "your private Shopify admin data and protected information
remain confidential and aren't shared", and that channels receive neither the full order
history nor the customer database [10]. Orders "display in your Shopify admin with
channel or referrer attribution" [9].

## Shopify Catalog

"Shopify Catalog is a structured source of product information gathered from eligible
products that are sold by stores on Shopify", used by "Shop, select AI platforms,
shopping sites, and AI agents" [12]. Inclusion is automatic where requirements are met.

Documented requirements [13]: the store on the Starter plan or higher and not in private
mode; each product with a title, at least one image, "a price greater than zero", an
identifiable product URL, and publication to the Online Store, Hydrogen or Headless
channel; products not unlisted, not hidden from search engines, and free of sensitive or
mature content. Account standing conditions also apply.

**Catalog Mapping** controls how title, description and category are sourced for AI
channels — from "product attributes, product metafields, or metaobject references" — with
custom variant grouping via title delimiters, metafields or tags. It is "most helpful if
your store uses custom data and grouping logic for products, such as metafields,
metaobjects, tag prefixes, or separators/delimiters in product titles" [14]. This is the
main lever for non-standard data models.

**Agent discovery files.** "Your store includes a default `agents.md` file accessible at
`/agents.md`. The paths `/llms.txt` and `/llms-full.txt` also point to this content by
default." Each can be overridden with a Liquid template — `templates/agents.md.liquid`,
`templates/llms.txt.liquid`, `templates/llms-full.txt.liquid` — falling back to the
agents.md template, then to Shopify's generated content [15]. Published 28 May 2026.

## MCP endpoints

Shopify exposes Model Context Protocol servers so an AI assistant can act against a
store [16].

| Server | Exposes | Endpoint | Authentication |
|---|---|---|---|
| Storefront MCP | `search_catalog`, `lookup_catalog`, `get_product`, `search_shop_policies_and_faqs`, `get_cart`, `update_cart` [17] | `https://{shop}.myshopify.com/api/mcp`, and `https://{shop}.myshopify.com/api/ucp/mcp` for UCP catalog tools [17] | "Storefront MCP servers don't require authentication" [17] |
| Customer accounts MCP | "Tools for customer-specific actions, including order management and account details" [18] | Discovered from `https://{shopDomain}/.well-known/customer-account-api`, resolving to `https://{shopDomain}/customer/api/mcp` [18] | OAuth 2.0 access token via the authorisation code grant with PKCE [18] |

Unconfirmed: the MCP pages checked state neither a release status (GA, beta or early
access) nor rate limits. Re-verify before a project depends on them.

## Merchant-facing AI in the admin

| Capability | What Shopify documents |
|---|---|
| Sidekick | "An AI-enabled commerce assistant in your Shopify admin, to get guidance, generate content, build apps, and complete tasks using everyday language" [19]. Plan-based limits are unconfirmed |
| Shopify Magic | "A suite of free AI-powered features that are integrated across Shopify's products and workflows" — text generation, media editing, theme and theme block generation, analysis. "Available for free, regardless of your subscription plan" [20] |
| Semantic search | Store must be "on one of the following pricing plans: Grow, Advanced, or Plus" with "fewer than 200,000 products". Not supported "for the Japanese locale" and "doesn't apply to predictive search" [21] |
| Product recommendations | Through the Shopify Product Network, "recommendations are optimized based on customer data and your existing catalog" [24] |
| Knowledge Base app | Helps "optimize your business presence across AI shopping platforms". "Your FAQs aren't displayed directly on your storefront — instead, they serve as a trusted data source for AI platforms" [22] |

## AI crawler controls

Crawler access is controlled through the theme: "you can use Liquid to add or remove
directives from the `robots.txt.liquid` template", allowing or blocking specific
user-agent crawlers [23]. Two limits matter. "The rules that you set in your
`/robots.txt` file are directional and advisory, and not all crawlers are guaranteed to
follow them." And blocking AI crawlers there "affects only open-web discoverability. It
doesn't stop your product data from being sent by Shopify Catalog to the agentic
storefronts that you've activated" [23]. Shopify treats this as an unsupported
customisation where "incorrect use of the feature can result in loss of all traffic" [23].

## What a merchant must decide

1. Keep **"Allow Shopify to manage for me"**, or manage each AI channel individually
   (Catalog access and direct checkout per channel, with the seven-day deactivation
   delay)?
2. Accept the Supplemental Terms and publish complete Terms of service, Privacy policy
   and Return and refund policy.
3. Reconcile the customer data direct-checkout channels receive — name, email, phone,
   address — with the merchant's own privacy notice.
4. Whether custom data models need Catalog Mapping.
5. Whether to customise `/agents.md`, `/llms.txt` and `/llms-full.txt`, and whether to
   publish FAQs through the Knowledge Base app as the trusted agent source.
6. Whether to restrict AI crawlers in `robots.txt.liquid`, accepting that it is advisory
   and does not affect Shopify Catalog syndication.
7. Plan fit for semantic search (Grow, Advanced or Plus; under 200,000 products).

## Pre-GA or unconfirmed

- **Universal Cart API** — early access, waitlist only [1].
- **Google AI Mode and Gemini direct checkout** — rolling out; "might not yet be
  available in your store" [7].
- **Storefront MCP and Customer accounts MCP** — no release status or rate limits stated.
- **Sidekick plan limits and language coverage** — not confirmed on the Help Centre page.
- **Knowledge Base app pricing and plan availability** — not stated on the page checked.
- **Direct checkout outside the United States** — documented as US-only for Google and
  Microsoft Copilot; nothing published for other countries.
- **Meta channel specifics** — listed as a channel; its own eligibility page was not
  verified.

## Sources

1. Build commerce agents with UCP — https://shopify.dev/docs/agents — "Carts and checkout: Build carts, convert them to checkouts, and hand off to the merchant for payment." Universal Cart API is offered via an early access waitlist. — checked 2026-09-17
2. Universal Commerce Protocol — https://www.shopify.com/ucp — "An open standard for integrating commerce with agents, forged from billions of transactions and supported by millions of merchants." — checked 2026-09-17
3. Shopify agentic storefronts — https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts — "Agentic storefronts is active by default for eligible stores." — checked 2026-09-17
4. Managing agentic storefronts — https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-home — "Agentic storefronts channels have access to your products through Shopify Catalog" under the "Allow Shopify to manage for me" default. — checked 2026-09-17
5. Requirements and considerations for selling on agentic storefronts — https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements — merchants must "read and agree to the Shopify Agentic Storefronts Supplemental Terms of Service". — checked 2026-09-17
6. Selling on ChatGPT — https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/chatgpt — "There's no option to activate or deactivate a ChatGPT direct checkout setting in your Shopify admin." — checked 2026-09-17
7. Selling on Google AI Mode and Gemini — https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/google — "Your store must be based in the United States and you must sell to customers in the United States." — checked 2026-09-17
8. Using AI channels with direct checkout — https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/ai-channels-with-built-in-checkout — "There are no fees associated with selling in Microsoft Copilot's direct checkout. You pay only your standard payment processing fees." — checked 2026-09-17
9. Customer experience with agentic storefronts — https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/customer-experience — "For orders that are placed through AI channels, you retain full ownership of the customer relationship and post-purchase experience." — checked 2026-09-17
10. Data sharing and privacy for selling with agentic storefronts — https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/data-privacy — channels with direct checkout receive "order details such as the customer's name, email address, phone number, and physical address". — checked 2026-09-17
11. Shopify Catalog and product discovery for agentic storefronts — https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/products — "Shopify's agentic storefronts support only direct-to-consumer (D2C) sales." — checked 2026-09-17
12. Shopify Catalog — https://help.shopify.com/en/manual/shopify-catalog — "Shopify Catalog is a structured source of product information gathered from eligible products that are sold by stores on Shopify." and "You can't opt out of Shopify Catalog itself." — checked 2026-09-17
13. Requirements for being included in Shopify Catalog — https://help.shopify.com/en/manual/shopify-catalog/requirements — "Your products must have a price greater than zero" and "Your products must be published with an identifiable product URL." — checked 2026-09-17
14. Mapping your product data sources for Shopify Catalog — https://help.shopify.com/en/manual/promoting-marketing/seo/shopify-catalog/default-listing — mapping is "most helpful if your store uses custom data and grouping logic for products, such as metafields, metaobjects, tag prefixes, or separators/delimiters in product titles". — checked 2026-09-17
15. Customize /llms.txt, /llms-full.txt and /agents.md (28 May 2026) — https://shopify.dev/changelog/customize-llmstxt-llms-fulltxt-and-agentsmd — "Your store includes a default `agents.md` file accessible at `/agents.md`. The paths `/llms.txt` and `/llms-full.txt` also point to this content by default." — checked 2026-09-17
16. About Storefront MCP — https://shopify.dev/docs/apps/build/storefront-mcp — "Connect any AI assistant to real-time commerce data from Shopify stores with Model Context Protocol (MCP) servers." — checked 2026-09-17
17. Storefront MCP server — https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront — "Storefront MCP servers don't require authentication." — checked 2026-09-17
18. Customer accounts MCP server — https://shopify.dev/docs/apps/build/storefront-mcp/servers/customer-account — "The Customer accounts MCP server provides tools for customer-specific actions, including order management and account details." — checked 2026-09-17
19. Sidekick — https://help.shopify.com/en/manual/shopify-admin/productivity-tools/sidekick — "an AI-enabled commerce assistant in your Shopify admin, to get guidance, generate content, build apps, and complete tasks using everyday language." — checked 2026-09-17
20. Shopify Magic — https://help.shopify.com/en/manual/ai-powered-tools/shopify-magic — "Shopify Magic tools and experiences are available for free, regardless of your subscription plan." — checked 2026-09-17
21. Modifying search with Shopify Search & Discovery — https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-modify-search — "Your store is on one of the following pricing plans: Grow, Advanced, or Plus" and "Your store has fewer than 200,000 products". — checked 2026-09-17
22. Shopify Knowledge Base — https://help.shopify.com/en/manual/promoting-marketing/knowledge-base — "Your FAQs aren't displayed directly on your storefront - instead, they serve as a trusted data source for AI platforms to generate accurate responses about your store." — checked 2026-09-17
23. Editing robots.txt.liquid — https://help.shopify.com/en/manual/promoting-marketing/seo/editing-robots-txt — "The rules that you set in your /robots.txt file are directional and advisory, and not all crawlers are guaranteed to follow them." — checked 2026-09-17
24. Product recommendations — https://help.shopify.com/en/manual/products/product-recommendations — "Recommendations are optimized based on customer data and your existing catalog." — checked 2026-09-17
