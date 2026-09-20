<!-- GENERATED FILE — do not edit. Source: discovery/schema/question-bank.json + discovery/schema/offering.json + discovery/schema/apps.json. Re-render: npm run questionnaire:render -->

# Consultant guide — Shopify knowledge per question

> **Version:** question bank 1.2.0 · offering 2.0.0 · app registry checked 2026-09-17
>
> **Consultant only.** Shopify plan requirements, docs links and app candidates behind each discovery question.
> Use them to steer the conversation to what Shopify does natively; do not hand this guide to the client.
> 121 of 298 questions carry Shopify knowledge; facts are checked against Shopify documentation at each Edition.
>
> Apps marked ✓ are approved by a lead consultant after engagement work; all others are proposed candidates.

---

## Shopify plan benchmark (exit rule 11.1)

The offers do not assume Shopify Plus. The minimum plan is the highest plan any of these requirements needs; recommend the plan that best fits the client's market on top of it.

| Requirement | Minimum plan | Answers read | Docs |
|---|---|---|---|
| company-specific B2B catalogs | Shopify Plus | `/b2b/company_specific_catalogs`, `/b2b/price_lists` | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| more than 3 active B2B catalogs | Shopify Plus | `/b2b/catalog_count` | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| B2B deposits, partial payments or payment requests per fulfilment | Shopify Plus | `/b2b/payment_terms` | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| contextual B2B storefront and checkout | Advanced | `/b2b/contextual_experience` | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| checkout UI extensions on the information, shipping or payment steps / Checkout Branding API | Shopify Plus | `/checkout/customisation` | https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations |
| expansion stores | Shopify Plus | `/markets/topology/recommendation` | https://help.shopify.com/en/manual/organization-settings/expansion-stores |
| selling from several legal entities | Shopify Plus | `/meta/client/legal_entities` | https://help.shopify.com/en/manual/payments/shopify-payments/onboarding/selling-with-multiple-entities |
| combined listings | Shopify Plus | `/catalogue/combined_listings` | https://help.shopify.com/en/manual/products/combined-listings-app |
| sign-in from another site (Multipass) | Shopify Plus | `/customers/sign_in_methods` | https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api |
| more than 10 locations | Shopify Plus | `/shipping/fulfilment_locations` | https://help.shopify.com/en/manual/fulfillment/setup/locations/setup |
| more than 20 published languages | Shopify Plus | `/markets/list` | https://help.shopify.com/en/manual/international/localization-and-translation |
| several product discounts on the same item | Shopify Plus | `/promotions/stacking` | https://help.shopify.com/en/manual/discounts/discount-combinations |
| theme, checkout or account customisation per market | Advanced | `/markets/per_market_customisation` | https://help.shopify.com/en/manual/online-store/themes/customizing-themes-for-markets |
| carrier-calculated shipping rates | Advanced | `/shipping/rates` | https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/third-party-carrier-calculated-shipping |
| multi-currency payouts | Advanced | `/payments/multi_currency_settlement` | https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/payouts-in-multiple-currencies |
| more than 15 staff accounts | Shopify Plus | `/shopify/staff_users` | https://help.shopify.com/en/manual/your-account/users/users-plan-requirements |
| more than 5 staff accounts | Advanced | `/shopify/staff_users` | https://help.shopify.com/en/manual/your-account/users/users-plan-requirements |
| staff accounts | Grow | `/shopify/staff_users` | https://help.shopify.com/en/manual/your-account/users/users-plan-requirements |
| A/B testing with Rollouts | Grow | `/design/ab_testing` | https://help.shopify.com/en/manual/markets/rollouts |

---

## § 0 — Business outcomes

### 0.1 The core problem

**Q0.1.1** — What is the single biggest thing preventing your ecommerce from growing right now? *(required · client)*

**Why it matters.** The whole offer is sized against one problem statement. It decides whether this is a storefront build, a replatform, an operations fix or a growth programme, and it is the line the closing document and the backlog are judged against.

**Q0.1.2** — How long has this been a problem, and what have you already tried to fix it? *(recommended · client)*

**Why it matters.** Tells you whether the problem is platform-shaped or organisational. A client who has already bought three apps for this has a diagnosis problem, not a build problem. It also shows which solutions have been tried and rejected.

**Q0.1.3** — If we solved only one thing in this engagement, what would have the highest business impact? *(recommended · client)*

**Why it matters.** Forces one priority before scope is negotiated. It sets phase one of the backlog and gives you the line to defend when items are added later.

### 0.2 Revenue & conversion

**Q0.2.1** — What is your current monthly ecommerce revenue (range and currency)? *(required · client)*

**Why it matters.** The revenue band sizes the offer and sanity-checks plan and budget. Card rates and transaction fees fall as the plan rises, so volume decides whether a higher plan pays for itself.

**Limits.** Prices and card rates are shown in local currency and differ by region — re-check Shopify's pricing page for the client's own market before quoting any number.

Sources: https://www.shopify.com/pricing · https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features/choosing-a-plan

**Q0.2.2** — What is your current conversion rate (%)? *(required · client)*

**Why it matters.** The baseline conversion rate tells you whether the brief is a build or an optimisation programme, and gives the KPI the project will be measured on. A very low rate points at checkout, catalogue and performance work rather than a new theme.

**Q0.2.3** — Which product categories, markets or customer segments under-perform? *(optional · client)*

**Why it matters.** Names where the money is being lost. Under-performing countries pull in Markets scope — currency, pricing, language, domains; under-performing categories usually point at merchandising, search and product data instead.

**Q0.2.4** — Is the main bottleneck acquisition (traffic), conversion (traffic doesn't buy) or retention (customers don't return)? *(required · client)*

**Why it matters.** This routes the whole solution. Acquisition points at sales channels, SEO and new markets; conversion at theme, search and checkout; retention at customer accounts, subscriptions and messaging. Each gives a different backlog and a different app shortlist.

**Q0.2.5** — What share of revenue comes from each channel today (online store, retail stores, marketplaces, social commerce, wholesale / B2B, other)? *(recommended · client)*

**Why it matters.** Channel mix shows how much of the work sits outside the online store. Retail brings POS and inventory locations, wholesale brings B2B scope, marketplaces and social bring extra sales channels — each is separate configuration and separate backlog.

**Q0.2.6** — How many orders per month do you expect in the first year? *(required · client)*

**Why it matters.** Order volume drives recurring cost more than build cost: returns, tracking, fraud and review apps are priced by order band. It also sizes the order-history migration and the fulfilment set-up.

**Limits.** On a trial or development store the orderCreate mutation is capped at five new orders per minute, so a full-volume order import cannot be rehearsed there.

Sources: https://shopify.dev/docs/api/admin-graphql/latest/mutations/ordercreate

### 0.3 Operational pain

**Q0.3.1** — What manual work does your team do today that the platform should automate, and which processes break most often? *(required · client)*

**Why it matters.** Manual work is where a Shopify project earns its return. Each item becomes a Flow automation, an integration, an app or an admin change — this is the main source of backlog items outside the storefront.

**Q0.3.2** — How many hours per week does the team spend on workarounds? *(optional · client)*

**Why it matters.** Puts a number on the operational case, so automation scope can be argued on cost rather than opinion. Feeds the business case and the offer, not the architecture.

### 0.4 Growth goals & KPIs

**Q0.4.1** — What does success look like in 12 months (revenue, new markets, channels, customer volume)? *(required · client)*

**Why it matters.** Twelve-month goals decide what must be designed for now rather than later: new countries mean Markets, new channels mean sales channels, volume means plan and API headroom. It separates launch scope from roadmap.

**Q0.4.2** — Which KPIs will measure success? For each: metric, today's baseline, target, horizon in months. *(required · client)*

**Why it matters.** Baselines and targets give the project measurable acceptance. Without today's number no post-launch claim can be made. It also tells you which analytics and tracking must be live at launch, not after it.

### 0.5 Platform context

**Q0.5.1** — What triggered this engagement — why Shopify, and why now? *(required · client)*

**Why it matters.** The trigger tells you who is really driving and what the deadline is — a contract renewal, a failed replatform, a funding round. It sets urgency, the decision-maker, and how much of the current set-up is genuinely open to change.

**Q0.5.2** — If you are moving from another platform, what must not be lost in the transition? *(recommended · client)*

**Why it matters.** The must-not-be-lost list is the migration risk register: URLs and search ranking, order history, customer accounts, integrations, reviews. Each item is either inside Shopify's import path or a separate, costed workstream.

**Limits.** Customer passwords cannot be migrated by CSV, because they are encrypted outside Shopify; customers are invited to set a new password, or sign in with an emailed 6-digit code. Reviews cannot be exported from Squarespace. Indexing of new pages can take 48 to 72 hours, and traffic recovery longer.

Sources: https://help.shopify.com/en/manual/customers/import-export-customers · https://help.shopify.com/en/manual/migrating-to-shopify/migrating-from-squarespace · https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/new-to-shopify-checklists/migrating-to-shopify-checklist

**Q0.5.3** — What are you most unhappy with in the current store or set-up? *(recommended · client)*

**Why it matters.** Frustrations name what the client will judge the new store against on day one. They convert directly into backlog items and into the design brief — and sometimes show the platform was never the problem.

**Q0.5.4** — Which platform are you migrating from (or none — greenfield)? *(required · client)*
Drives: gate Migration

**Why it matters.** Decides the migration route and its cost. Shopify's own Store Migration app covers a documented list of source platforms, products and customers only; anything else, and all order history, needs a migration app or API work. It triggers the Migration scope modifier.

| Option | Pros | Cons |
|---|---|---|
| Shopify Store Migration app (CSV, documented source platforms) | First-party, no licence cost, per-item error report. | Products and customers only — no order history, no prices by location, three product options maximum. |
| Third-party migration app (for example Matrixify) | Moves products, customers and order history together with no engineering build. | App licence and third-party support; Shopify's partner guidance frames this route for Plus clients. |
| Custom API scripts (bulk import, orderCreate) | Full control of mapping for non-standard source data and large volumes. | Build and test effort; 100 MB JSONL and 24-hour operation limits; dev-store order rate cap blocks rehearsal. |

**Limits.** The Store Migration app documents Amazon, Clover, Etsy, eBay, GoDaddy, Lightspeed, Square, Squarespace, Wix and WooCommerce as sources, and imports products and customers, not historical orders. Products with more than three options lose their options on import; prices by location are not supported. Import order is products, then customers, then orders. URL redirects are capped at 100,000, or 20,000,000 on Plus. Turn off new-order notifications before importing orders, or every imported order emails staff.

Sources: https://apps.shopify.com/store-migration · https://help.shopify.com/en/manual/migrating-to-shopify · https://help.shopify.com/en/manual/migrating-to-shopify/migrating-from-woocommerce · https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect · https://help.shopify.com/en/partners/manage-clients-stores/migrating-clients

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Store Migration app | Basic |  | https://apps.shopify.com/store-migration |

If native is not enough: [Store data importer](https://apps.shopify.com/categories/sales-channels-selling-online-store-data-importer/all) — [Shopify Store Migration](https://apps.shopify.com/store-migration), [Matrixify](https://apps.shopify.com/excel-export-import)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 0.6 Budget

**Q0.6.1** — What is the approximate budget envelope for this project (range and currency)? *(required · client)*

**Why it matters.** The budget band picks the offer size and decides how much can be native configuration rather than custom build. It also surfaces the mismatch case early, where the requirements need a plan or a build the envelope will not carry.

**Q0.6.2** — Is the priority to minimise upfront cost (apps and configuration), to own the solution (custom build), or a balance? *(required · client)*

**Why it matters.** Sets the build philosophy. Apps and configuration launch faster and cost monthly; a custom build costs more upfront and is owned outright. It changes the architecture, the app shortlist and the store's running cost.

| Option | Pros | Cons |
|---|---|---|
| Apps and configuration first | Fastest to launch, lowest upfront cost, vendor maintains the functionality. | Permanent monthly subscriptions, limited control, and a vendor's roadmap decides what changes. |
| Custom build (custom app or extensions) | Exactly the required behaviour, owned by the client, no per-app subscription. | Higher upfront cost and an ongoing maintenance commitment; a Shopify Function inside a custom app requires Plus. |

**Limits.** Public App Store apps containing Shopify Functions install on any plan; Functions inside a custom app built for one merchant require Plus.

Sources: https://shopify.dev/docs/apps/build/functions

**Q0.6.3** — Is there a monthly ceiling for app subscriptions? *(optional · client)*

**Why it matters.** App subscriptions are a permanent line in the client's P&L, so a stated ceiling constrains the shortlist. Check Shopify's own apps first — Subscriptions, Bundles, Search & Discovery, Translate & Adapt, Flow, Messaging — before proposing paid third parties.

---

## § 1 — Company, brand & Shopify

### 1.1 Company identity

**Q1.1.1** — Trading name and legal entity name (if different). *(required · client)*

**Why it matters.** The legal entity is what the Shopify account, the bank account and the store policies are held in; the trading name is what customers see. Capturing both now stops a mismatch appearing during payments verification.

**Limits.** Shopify Payments requires a business entity and a bank account in an eligible region, and each supported country has its own bank account and business verification requirements.

Sources: https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries

**Q1.1.2** — Country of incorporation / headquarters. *(required · client)*

**Why it matters.** The country of incorporation sets the store's primary country, which decides payment provider availability, payout currency, tax set-up and the base market everything else is configured around.

**Limits.** Shopify Payments is available only in supported countries and regions; confirm the client's entity country on Shopify's supported-countries index before assuming it is an option. The currency conversion fee is based on the store's primary country.

Sources: https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries · https://help.shopify.com/en/manual/payments/shopify-payments/multi-currency/conversion-fees

**Q1.1.3** — Industry and product vertical. *(required · client)*
Drives: rule 11.8 (STOP)

**Why it matters.** The vertical decides catalogue complexity, content needs and, critically, legal exposure. Regulated categories — pharma, alcohol, firearms, age-restricted goods, financial products, medical devices — trigger a STOP for legal and compliance review before any scope is committed.

**Q1.1.4** — Is the business direct-to-consumer, B2B, or hybrid? *(required · client)*
Drives: gate B2B / Wholesale

**Why it matters.** Decides whether wholesale scope is in play at all. B2B or hybrid opens the § 6.2 questions and the B2B scope modifier: companies, company locations, catalogs, payment terms and PO numbers — a different data model from D2C, not a discount setting.

| Option | Pros | Cons |
|---|---|---|
| Blended store — one store serving D2C and B2B | One catalogue, one admin, one theme to maintain; B2B pricing is layered on with catalogs. | Every storefront and checkout decision must work for both audiences, and B2B checkout restrictions apply. |
| Dedicated B2B store, separate from D2C | Clean separation of experience, pricing and operations; nothing D2C constrains the trade site. | A second store to build, run and keep in sync; expansion stores are a Plus feature. |

**Limits.** Native B2B runs on every plan from Basic: companies, locations, net terms, PO numbers, quantity rules and price breaks. Basic, Grow and Advanced allow up to 3 active catalogs across all B2B markets and require new Shopify Markets; unlimited catalogs, catalogs assigned to a company or location, deposits and partial payments are Plus. B2B checkout does not support accelerated payments (Shop Pay, Apple Pay, Google Pay, Amazon Pay), subscriptions or legacy customer accounts.

Sources: https://help.shopify.com/en/manual/b2b/getting-started/plan-features

**Q1.1.5** — Current website URL. *(optional · client)*

**Why it matters.** The current site is the fastest evidence you get: catalogue size, option complexity, content volume, current platform and the integrations visible from outside. It also grounds the redirect and SEO workstream if this is a replatform.

**Q1.1.6** — Do you sell through more than one legal entity (e.g. one per country or region)? List them. *(required · client)*
Drives: rule 11.1 (STOP) · rule 11.23 (FLAG)

**Why it matters.** Decides the store topology. Several selling entities in one store means one admin with per-market entities; one store per entity means several stores to build and run. It changes tax, payouts, invoicing and the plan, and it feeds the plan-gate STOP.

| Option | Pros | Cons |
|---|---|---|
| One store, several business entities per market | One catalogue, one admin and one theme, with per-market entity, payouts and tax. | Plus only, and requires Shopify Payments plus the new Markets. |
| One store per entity (expansion stores) | Hard separation of data, staff, finance and local operations. | Plus only; every catalogue, theme and app change has to be repeated across stores. |

**Limits.** Assigning separate business entities to markets is Plus only, and needs Shopify Payments and the new Markets; otherwise the route is expansion stores, which are also Plus (one main store plus nine expansion stores on the contract).

Sources: https://help.shopify.com/en/manual/payments/shopify-payments/onboarding/selling-with-multiple-entities · https://help.shopify.com/en/manual/organization-settings/expansion-stores

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Selling from multiple business entities | Shopify Plus | Needs Shopify Payments and the new Markets; otherwise expansion stores | https://help.shopify.com/en/manual/payments/shopify-payments/onboarding/selling-with-multiple-entities |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q1.1.7** — Where will you sell at launch? *(required · client)*

**Why it matters.** Launch channels decide how much is built beyond the online store. Each channel is its own set-up and its own backlog: POS, Shop, Marketplace Connect, Facebook and Instagram, Google and YouTube, TikTok, or a headless front end on the Storefront API.

| Option | Pros | Cons |
|---|---|---|
| Shopify's online store (Liquid theme) as the front end | Fastest to launch, editable by the client, works with theme apps and the standard checkout. | Front-end freedom is bounded by the theme and section model. |
| Headless front end on the Storefront API | Full control of the experience and of front-end technology choices. | A build and a hosting commitment; merchandising by theme editor is lost unless replaced. |

**Limits.** The standard sales channels and the headless channel are available from Basic. Agentic storefronts (ChatGPT, Google AI Mode and Gemini, Copilot, Meta) are active by default for eligible stores, so 'AI shopping agents' is usually a decision about what to leave on, not a build.

Sources: https://help.shopify.com/en/manual/online-sales-channels/marketplaces/marketplace-connect · https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Sales channels (Online Store, POS, Shop, Marketplace Connect, Facebook & Instagram, Google & YouTube, TikTok) | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/marketplaces/marketplace-connect |
| Headless channel (Hydrogen / Storefront API) | Basic |  | https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/manage-headless-channels |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 1.2 Shopify account

**Q1.2.1** — Is there an existing Shopify store? *(required · client)*

**Why it matters.** Decides the starting point: configure and improve what exists, or build a new store and migrate onto it. It changes the delivery approach, the risk profile and whether an audit of the current store is part of the engagement.

| Option | Pros | Cons |
|---|---|---|
| Build on the existing store | Keeps order and customer history, apps, domains and SEO in place; no data migration. | Inherits the existing theme, app estate and any deprecated features, and changes are made on a live, trading store. |
| Build a new store and migrate | Clean architecture and data model, and a safe place to build away from live trade. | A migration and cutover to plan and pay for, with redirect and SEO risk at launch. |

**Q1.2.2** — Existing store URL, current Shopify plan and current theme. *(recommended · client)*

**Why it matters.** The current plan and theme set the baseline: which features the client already has, whether the theme is a supported Online Store 2.0 theme or a customised legacy one, and how much of the existing build can be carried forward.

**Q1.2.3** — Which Shopify plan will the new store run on (if already decided)? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** The plan is the hardest constraint in a Shopify project — several features are plan-gated, not build-gated. Recommend it from the requirements, then check the client's assumption against it; a mismatch is a STOP, not a detail.

**Limits.** Documented gates that most often decide the plan: staff users (Basic 0, Grow 5, Advanced 15, Plus unlimited); more than 10 inventory locations, checkout UI extensions on the information, shipping or payment steps, the Checkout Branding API, expansion stores, business entities per market, more than 20 published languages, combined listings and Functions in a custom app are Plus; per-market theme customisation, carrier-calculated rates and multi-currency payouts start at Advanced.

Sources: https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Plan features | Basic | The minimum plan is derived from the requirements (exit rule 11.1) | https://help.shopify.com/en/manual/intro-to-shopify/pricing-plans/plans-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q1.2.4** — Which apps are installed today, what do they do, and which must stay? *(recommended · client)*

**Why it matters.** The installed app list is both a cost line and a requirements document — each app is a job the store does today. Which must stay decides what the new build has to keep working, and which can be replaced by a native feature.

**Q1.2.5** — Existing store audit: which retired or deprecated Shopify features does it still use? *(required · consultant)*
Drives: rule 11.18 (FLAG)

**Why it matters.** Retired and deprecated features are silent breakage: logic that has already stopped running, or will. Any hit becomes its own workstream — Scripts to Functions, script tags to theme app extensions, legacy to current customer accounts — flagged, not absorbed into theme work.

| Option | Pros | Cons |
|---|---|---|
| Fix the deprecations first, as their own workstream | Removes the breakage risk before new work is built on top of it. | Spends budget on parity rather than on anything the client can see. |
| Fold the replacements into the new build | One design pass, one test cycle, no work done twice. | Anything already retired stays broken until the new build ships. |

**Limits.** Shopify Scripts stopped running on 2026-06-30; checkout.liquid and additional scripts are retired; online store script tags stop on 2027-03-01; legacy customer accounts were deprecated on 2026-02-26; Stocky was retired on 2026-08-31, replaced by inventory purchase orders and transfers; the Geolocation app is retired.

Sources: https://shopify.dev/changelog/shopify-scripts-will-be-deprecated-on-june-30-2026 · https://shopify.dev/changelog/online-store-script-tags-deprecation · https://shopify.dev/changelog/legacy-customer-accounts-are-deprecated · https://help.shopify.com/en/manual/products/inventory/transitioning-from-stocky

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Functions (replaces Shopify Scripts) | Basic | Scripts stopped running 2026-06-30 | https://shopify.dev/changelog/shopify-scripts-will-be-deprecated-on-june-30-2026 |
| Customer accounts (legacy accounts deprecated 2026-02-26) | Basic |  | https://shopify.dev/changelog/legacy-customer-accounts-are-deprecated |
| Inventory purchase orders and transfers (Stocky retired 2026-08-31) | Basic |  | https://help.shopify.com/en/manual/products/inventory/transitioning-from-stocky |
Build with: Shopify Functions · Theme app extensions (replace script tags)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q1.2.6** — How many people need their own Shopify admin login after go-live? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** Named admin users are a plan gate, not a licence add-on. The headcount can move the store up a plan on its own, so it has to be counted before the plan is quoted.

**Limits.** Basic 0 staff accounts, Grow 5, Advanced 15, Plus unlimited. Collaborator accounts (agency access) and POS-only staff are not counted against the limit.

Sources: https://help.shopify.com/en/manual/your-account/users/users-plan-requirements

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Staff accounts | Grow | Basic 0, Grow 5, Advanced 15, Plus unlimited; collaborators and POS-only staff not counted | https://help.shopify.com/en/manual/your-account/users/users-plan-requirements |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 1.3 Brand & positioning

**Q1.3.1** — How would you describe the brand's positioning: value, mid-market, premium, luxury or enterprise? *(required · client)*
Drives: gate Storefront design

**Why it matters.** Positioning sets the design depth and the solution approach. Luxury and enterprise positioning triggers the L offer: bespoke design, more front-end build and a longer review cycle, rather than a configured theme.

**Q1.3.2** — Is the brand identity finalised (logo, colour palette, typography)? *(recommended · client)*

**Why it matters.** An unfinished identity is a schedule risk, not a design preference. If logo, palette and type are still moving, theme and design work either waits or is built twice — decide which, and price it.

| Option | Pros | Cons |
|---|---|---|
| Start the build on the current identity | Keeps the delivery dates; tokens and theme settings absorb later colour and type changes. | Anything structural that changes with the identity is rework. |
| Wait for the identity to be signed off | One design pass, no rework, cleaner approvals. | Idle delivery time and a launch date that depends on someone outside the project. |

**Q1.3.3** — In which formats are brand assets available (SVG, PNG, Figma, guidelines PDF)? *(optional · client)*

**Why it matters.** Asset formats decide how much production work sits in the design phase. Vector logos and a Figma file feed straight into the theme; a guidelines PDF and print-resolution assets mean redrawing and re-exporting before anything reaches the store.

**Q1.3.4** — Are there strict brand guidelines that must be followed? *(recommended · client)*

**Why it matters.** Strict guidelines mean a review and approval cycle on every screen, and less freedom to use the theme's own components. That is delivery time and effort, and it belongs in the estimate rather than in a surprise later.

**Q1.3.5** — What differentiates the brand — price, quality, exclusivity, community, sustainability? *(optional · client)*

**Why it matters.** Differentiators tell you what the storefront actually has to prove — sustainability needs product data and content, exclusivity needs gated or limited-release mechanics, community needs reviews and accounts. Each becomes concrete backlog, not brand language.

### 1.4 Competitive context

**Q1.4.1** — Who are your top three online competitors? *(optional · client)*

**Why it matters.** Competitors set the client's expectation of normal. They tell you which features will be asked for mid-project, and give a concrete reference for the design and UX conversation instead of adjectives.

**Q1.4.2** — Which stores (competitor or not) have a UX you want to reference? *(optional · client)*

**Why it matters.** UX references convert taste into specifics — navigation, product page, cart and checkout behaviour. Use them to agree scope on the front end before design starts, and to identify which behaviours need an app or custom work.

---

## § 2 — Catalogue & products

### 2.1 Catalogue size & variants

**Q2.1.1** — How many active SKUs are in the catalogue (approximate)? *(required · client)*
Drives: gate SKU complexity

**Why it matters.** Catalogue size sets the build and migration effort and feeds the SKU complexity scope gate: 500 SKUs or more, combined with multiple variant options, custom attributes or bundles, adds the +SKU modifier to the offer.

**Q2.1.2** — What is the maximum number of variant options on a product (e.g. size, colour, material = 3)? *(required · client)*
Drives: rule 11.5 (FLAG) · gate SKU complexity

**Why it matters.** Shopify models a product with at most three options (for example size, colour, material). A fourth option means the product model has to change, so this answer decides the data model before anything is priced or migrated.

**Limits.** Up to 3 options per product. Beyond that, Shopify documents combined listings (Plus only, up to 60 child products), a product options app for choices that are not stock, or splitting the product. During a CSV or migration-app import, options past the third are not imported. Exit rule 11.5 flags this for a product model review.

Sources: https://help.shopify.com/en/manual/products/variants/add-variants · https://help.shopify.com/en/manual/products/combined-listings-app · https://help.shopify.com/en/manual/migrating-to-shopify/migrating-from-woocommerce

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Product variants (3 options) | Basic |  | https://help.shopify.com/en/manual/products/variants/add-variants |
| Combined listings | Shopify Plus | Up to 60 child products | https://help.shopify.com/en/manual/products/combined-listings-app |

If native is not enough: [Custom products](https://apps.shopify.com/categories/selling-products-custom-products) — [Infinite Options](https://apps.shopify.com/custom-options), [Globo Product Options, Variant](https://apps.shopify.com/product-options-pro), [Easify Custom Product Options](https://apps.shopify.com/easify-product-options)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.1.3** — What is the maximum number of variants on a single product? *(required · client)*
Drives: rule 11.5 (FLAG)

**Why it matters.** The largest product in the catalogue tells you whether the variant ceiling is in play. A product over the limit has to be split or restructured, which changes SKUs, URLs and the import plan, so it is found now rather than at data load.

**Limits.** Up to 2,048 variants per product. Above 100 variants, apps must use the current GraphQL product APIs, which matters for any integration or bulk update tooling.

Sources: https://shopify.dev/changelog/the-product-variant-limit-is-now-2048-for-all-merchants · https://help.shopify.com/en/manual/products/variants/add-variants

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Up to 2,048 variants per product | Basic | Apps must use the current GraphQL product APIs above 100 variants | https://shopify.dev/changelog/the-product-variant-limit-is-now-2048-for-all-merchants |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.1.4** — Are variants such as colours managed as separate products (own SKUs, images, URLs) that should appear as one product on the storefront? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** Shopify calls this a combined listing: separate products, each with its own SKUs, images and URL, shown to shoppers as one product. It is a Plus-only app, so a yes here can force the plan up. Exit rule 11.1 triggers.

| Option | Pros | Cons |
|---|---|---|
| Combined listings on Plus | Each colour keeps its own SKU, images and URL while the storefront shows one product. | Requires the Plus plan, so the whole engagement carries the higher plan cost. |
| One product with colour as a variant option | Works from Basic, within the three-option and 2,048-variant limits. | Colours lose their own product URL, and SEO and paid feeds built on the per-colour URLs have to be reworked. |

**Limits.** The Combined Listings app is available only on Plus and enterprise plans, with up to 60 child products per listing.

Sources: https://help.shopify.com/en/manual/products/combined-listings-app

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Combined listings | Shopify Plus |  | https://help.shopify.com/en/manual/products/combined-listings-app |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 2.2 Product types

**Q2.2.1** — Which product types exist in the catalogue? *(required · client)*
Drives: gate SKU complexity · app signal Bundles beyond Shopify Bundles · app signal Pre-orders · gate Subscriptions

**Why it matters.** Product types decide what is native and what needs an app. Fixed bundles, multipacks, subscriptions and gift cards are native from Basic; mix-and-match bundles and pre-orders need apps. It also feeds the SKU complexity gate.

**Limits.** Shopify Bundles covers fixed bundles and multipacks. Mix-and-match bundles need an app. Pre-orders always need an app.

Sources: https://help.shopify.com/en/manual/products/bundles/shopify-bundles · https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions · https://help.shopify.com/en/manual/products/gift-card-products/overview

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Bundles (fixed bundles, multipacks) | Basic |  | https://help.shopify.com/en/manual/products/bundles/shopify-bundles |
| Shopify Subscriptions | Basic |  | https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions |
| Gift cards | Basic |  | https://help.shopify.com/en/manual/products/gift-card-products/overview |

If native is not enough: [Product bundles](https://apps.shopify.com/categories/marketing-and-conversion-upsell-and-bundles-product-bundles/all) — [FBP | Fast Bundle & Upsell App](https://apps.shopify.com/fast-bundle-product-bundles), [Bundler » Product Bundles App](https://apps.shopify.com/bundler-product-bundles)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.2.2** — Will subscriptions run on Shopify Subscriptions (Shopify's app) or a third-party subscription app? Name the app if known. *(recommended · client)*
Drives: app signal Subscriptions beyond Shopify Subscriptions · gate Subscriptions
Quick interview: ask if Q2.2.1 includes Subscription

**Why it matters.** Shopify's own Subscriptions app is free and lets customers skip, pause and cancel from their account, but it does not work with bundles, B2B or draft orders and supports a limited set of gateways. Those exclusions decide whether a paid app enters the cost model.

| Option | Pros | Cons |
|---|---|---|
| Shopify Subscriptions | First-party, no licence fee, self-service management in the customer account. | Ruled out by bundles, B2B or an unsupported gateway. |
| Third-party subscription app | Covers the cases Shopify's app excludes and richer subscriber management. | Monthly licence, often a revenue share, and a second system holding subscriber and payment data. |

**Limits.** Shopify Subscriptions is not compatible with bundles, B2B or draft orders, and supports limited payment gateways.

Sources: https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions/considerations

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Subscriptions | Basic | Not with bundles, B2B or draft orders; limited gateways | https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions/considerations |

If native is not enough: [Subscriptions](https://apps.shopify.com/categories/selling-products-payments-subscriptions) — [Recharge Subscriptions App](https://apps.shopify.com/subscription-payments), [Skio, a Recharge Company](https://apps.shopify.com/skio), [Loop Subscriptions App](https://apps.shopify.com/loop-subscriptions), [Appstle℠ Subscriptions App](https://apps.shopify.com/subscriptions-by-appstle)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.2.3** — If you sell bundles: what must they do? *(recommended · client)*
Drives: app signal Bundles beyond Shopify Bundles
Quick interview: ask if Q2.2.1 includes Fixed bundle, Multipack, Mix and match bundle or Bundle

**Why it matters.** The detail of what a bundle must do is what separates native Shopify Bundles from a paid bundle app. Nesting, mix-and-match, or bundles that are also subscriptions all fall outside the native app and become a licence line and a build task.

**Limits.** Shopify Bundles: up to 30 components per bundle, no nested bundles, and not compatible with subscriptions or pre-orders. Bundle behaviour in the cart is extended through the Cart Transform Function.

Sources: https://help.shopify.com/en/manual/products/bundles/eligibility-and-considerations

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Bundles | Basic | Up to 30 components; not with subscriptions or pre-orders | https://help.shopify.com/en/manual/products/bundles/eligibility-and-considerations |

If native is not enough: [Product bundles](https://apps.shopify.com/categories/marketing-and-conversion-upsell-and-bundles-product-bundles/all) — [FBP | Fast Bundle & Upsell App](https://apps.shopify.com/fast-bundle-product-bundles), [Bundler » Product Bundles App](https://apps.shopify.com/bundler-product-bundles)
Build with: Cart Transform Function
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.2.4** — Which subscription features are needed? *(recommended · client)*
Drives: app signal Subscriptions beyond Shopify Subscriptions · gate Subscriptions
Quick interview: ask if Q2.2.1 includes Subscription

**Why it matters.** Feature by feature is how you test whether Shopify Subscriptions is enough. Anything it does not cover raises the subscriptions_app signal and adds an app licence, a data migration of existing subscribers and integration work to the backlog.

Sources: https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Subscriptions | Basic |  | https://help.shopify.com/en/manual/products/purchase-options/subscriptions/shopify-subscriptions |

If native is not enough: [Subscriptions](https://apps.shopify.com/categories/selling-products-payments-subscriptions) — [Recharge Subscriptions App](https://apps.shopify.com/subscription-payments), [Skio, a Recharge Company](https://apps.shopify.com/skio), [Loop Subscriptions App](https://apps.shopify.com/loop-subscriptions), [Appstle℠ Subscriptions App](https://apps.shopify.com/subscriptions-by-appstle)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.2.5** — For pre-orders, when is the customer charged? *(recommended · client)*
Drives: app signal Pre-orders
Quick interview: ask if Q2.2.1 includes Pre order

**Why it matters.** Pre-orders run on selling plans and always need an app, and the charge timing decides the payment set-up: deferred payment is restricted to Shopify Payments or PayPal Express, and express checkout buttons do not appear on pre-orders.

| Option | Pros | Cons |
|---|---|---|
| Charge in full at order | Cash up front and no deferred-payment gateway restriction. | Higher refund exposure if the release date slips. |
| Charge later, at fulfilment | Customer only pays when the product ships, which lifts conversion on long lead times. | Tied to Shopify Payments or PayPal Express, and failed charges at fulfilment have to be handled. |

**Limits.** Pre-orders need an app. Shopify Payments or PayPal Express only, and Shop Pay, Apple Pay and Google Pay are not available for pre-orders.

Sources: https://help.shopify.com/en/manual/products/purchase-options/pre-orders

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Pre-orders via selling plans (app required) | Basic | Shopify Payments or PayPal Express only | https://help.shopify.com/en/manual/products/purchase-options/pre-orders |

If native is not enough: [Pre-orders](https://apps.shopify.com/categories/selling-products-purchase-options-pre-orders) — [Preorder, Back In Stock ‑ STOQ](https://apps.shopify.com/back-in-stock-restock-alerts), [Preorder Now Presale Timesact](https://apps.shopify.com/timesact-discount-pre-order)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.2.6** — Do customers personalise products with choices that are not stock variants (engraving, file upload, paid add-ons, configurators)? *(recommended · client)*
Drives: app signal Product options and personalisation
Quick interview: ask if Q2.1.2 is 3 or more, or Q2.2.1 includes Made to order

**Why it matters.** Engraving, uploads, paid add-ons and configurators are not stock variants, so they do not consume the three-option or variant limits. They need a product options app and usually theme work, which is a licence and a build item, not a configuration task.

**Limits.** Shopify has no native product personalisation; this is app territory (Custom products category).

Sources: https://apps.shopify.com/categories/selling-products-custom-products

If native is not enough: [Custom products](https://apps.shopify.com/categories/selling-products-custom-products) — [Infinite Options](https://apps.shopify.com/custom-options), [Globo Product Options, Variant](https://apps.shopify.com/product-options-pro), [Easify Custom Product Options](https://apps.shopify.com/easify-product-options)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 2.3 Catalogue data

**Q2.3.1** — Roughly how many collections? *(optional · client)*

**Why it matters.** Collection count sizes the merchandising set-up and the navigation build, and tells you how much of the catalogue structure has to be recreated or migrated rather than generated by rules.

**Q2.3.2** — Are collections manual, rule-based (automated), or mixed? *(optional · client)*

**Why it matters.** Automated collections are built from conditions on product data, so they only work if the product data carries the fields the rules need. The answer tells you how much merchandising is ongoing manual work and how much is a one-off data model job.

| Option | Pros | Cons |
|---|---|---|
| Rule-based (automated) collections | Products join and leave collections automatically as product data changes; little day-to-day upkeep. | Depends on clean, consistent product data, so it pushes work into attributes and tagging. |
| Manual collections | Full merchandising control and exact ordering, with no dependency on data quality. | Every new product has to be placed by hand, which does not scale with a large catalogue. |

**Q2.3.3** — Which product attributes go beyond Shopify's standard fields (technical specs, certifications, fit guides, ingredients)? *(required · client)*
Drives: gate SKU complexity

**Why it matters.** Anything beyond Shopify's standard product fields becomes metafields and metaobjects, and category attributes come from the Standard Product Taxonomy. This list drives the data model, the storefront filters, the Google and Meta feeds, and the SKU complexity gate.

**Limits.** Metaobject definitions are capped at 128 below Plus and 256 on Plus. Category metafields come from the Standard Product Taxonomy.

Sources: https://shopify.dev/docs/apps/build/metaobjects/metaobject-limits · https://help.shopify.com/en/manual/products/details/product-category

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Metafields and metaobjects | Basic | Metaobject definitions: 128 below Plus, 256 on Plus | https://shopify.dev/docs/apps/build/metaobjects/metaobject-limits |
| Standard Product Taxonomy (category metafields) | Basic |  | https://help.shopify.com/en/manual/products/details/product-category |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.3.4** — Where is catalogue data maintained today? *(recommended · client)*

**Why it matters.** Where product data is mastered decides the integration work: a PIM or ERP as the source means Shopify is a target system and needs a sync for products, prices and stock, rather than merchants editing in the admin.

**Q2.3.5** — Which attributes should shoppers filter by on collection and search pages? *(recommended · client)*

**Why it matters.** Filters are built from product data — options, metafields and taxonomy attributes — so the filter list is really a data requirement. It also decides whether native Search & Discovery is enough or a search app enters the cost model.

| Option | Pros | Cons |
|---|---|---|
| Native Search & Discovery | First-party, no licence fee, configured in the admin. | Capped at 25 filters and unavailable on collections over 5,000 products. |
| Search and filter app | Handles large collections, more filters and merchandising rules on search results. | Monthly licence, a catalogue index to keep in sync, and theme integration work. |

**Limits.** Shopify Search & Discovery supports up to 25 filters, and filters do not work on collections of more than 5,000 products.

Sources: https://help.shopify.com/en/manual/online-store/search-and-discovery/filters

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Search & Discovery filters | Basic | Up to 25 filters; no filters on collections over 5,000 products | https://help.shopify.com/en/manual/online-store/search-and-discovery/filters |

If native is not enough: App Store — [Algolia AI Search & Discovery](https://apps.shopify.com/algolia-search), [Boost AI Search & Filter](https://apps.shopify.com/product-filter-search), [Searchanise Search & Filter](https://apps.shopify.com/searchanise), [Klevu ‑ AI Search & Discovery](https://apps.shopify.com/klevu-smart-search)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 2.4 Pricing

**Q2.4.1** — Are there special prices for consumer groups (VIP or member prices)? *(recommended · client)*

**Why it matters.** Member and VIP prices for consumers are not a native price list: they are delivered as discounts on customer segments or with an app. Confirm whether they mean consumer groups or business customers, because business pricing runs on B2B catalogs instead (section 6.2).

**Limits.** B2B catalogs are capped at 3 active catalogs below Plus; catalogs assigned directly to a company or location are Plus only.

Sources: https://help.shopify.com/en/manual/b2b/getting-started/plan-features

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B catalogs | Basic | Up to 3 active catalogs below Plus | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| Company-specific catalogs | Shopify Plus |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.4.2** — Are there volume offers for shoppers (e.g. 3 for 2, tiered discounts)? *(recommended · client)*

**Why it matters.** Three for two and tiered offers are usually automatic discounts or buy X get Y, which are native and configured, not built. The answer decides whether promotions are a set-up task or a Shopify Function build in the backlog.

**Limits.** Applying several product discounts to one item is a Plus feature (exit rule 11.1).

**Q2.4.3** — Do prices differ by market (not just currency conversion)? *(recommended · client)*

**Why it matters.** Currency conversion alone is automatic; genuinely different prices per market are a Shopify Markets catalogue job, using percentage adjustments, rounding rules or fixed prices per product per country. That changes how the price feed from the ERP has to be built.

**Limits.** Shopify Markets offers percentage adjustment per market, rounding rules, and fixed prices per product by country or region. A fixed price takes precedence over any other adjustment, and price list currency must match the market's.

Sources: https://help.shopify.com/en/manual/international/pricing · https://help.shopify.com/en/manual/markets/customizations/catalogs

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Market-specific pricing | Basic |  | https://help.shopify.com/en/manual/international/pricing |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 2.5 Inventory

**Q2.5.1** — Where is the inventory source of truth — Shopify, ERP, WMS, other? *(recommended · client)*

**Why it matters.** The source of truth decides the direction of the stock integration and who resolves conflicts. Even when the ERP or WMS owns stock, Shopify still needs a quantity per location, so the feed has to be location-aware, not a single total.

| Option | Pros | Cons |
|---|---|---|
| Shopify as source of truth | No inbound stock sync; merchants adjust stock in the admin and the storefront is always accurate. | Does not fit if the warehouse or retail systems already move stock outside Shopify. |
| ERP or WMS as source of truth | One stock figure across all channels, owned by the system that actually holds the goods. | Needs a per-location feed into Shopify, and sync latency shows up as overselling. |

**Q2.5.2** — Are low-stock alerts needed? *(optional · client)*

**Why it matters.** Shopify does not send low-stock alerts out of the box. If the client expects them, it is a Shopify Flow workflow to build and maintain, so it belongs in the backlog rather than being assumed as a setting.

Sources: https://help.shopify.com/en/manual/shopify-flow

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Flow | Basic |  | https://help.shopify.com/en/manual/shopify-flow |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.5.3** — What should happen when a product is out of stock? *(optional · client)*
Drives: app signal Back-in-stock alerts · app signal Pre-orders
Quick interview: ask if Q2.2.1 includes Pre order, or Q2.1.1 is 500 or more

**Why it matters.** Out-of-stock behaviour splits cleanly: continuing to sell (backorder) is a native product setting, while back-in-stock alerts and pre-orders both need apps. The answer raises the back_in_stock_app and pre_order_app signals and their licences.

**Limits.** Continue selling when out of stock is native from Basic. Back-in-stock alerts and pre-orders require apps.

Sources: https://help.shopify.com/en/manual/products/inventory/setup/selling-when-out-of-stock

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Continue selling when out of stock | Basic |  | https://help.shopify.com/en/manual/products/inventory/setup/selling-when-out-of-stock |

If native is not enough: [Stock alerts](https://apps.shopify.com/categories/store-design-store-alerts-back-in-stock-alert) — [Amp Back in Stock & Preorder +](https://apps.shopify.com/back-in-stock), [Notify Me! Back in Stock Alert](https://apps.shopify.com/preorder-back-in-stock), [Appikon ‑ Back In Stock](https://apps.shopify.com/customer-back-in-stock-alert-user-notification-app)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q2.5.4** — Which inventory tasks will your team do in Shopify? *(optional · client)*

**Why it matters.** Purchase orders, transfers and stock adjustments are native in the Shopify admin, so this answer tells you how much of the client's stock operation moves into Shopify, which drives training, roles and permissions rather than build effort.

Sources: https://help.shopify.com/en/manual/products/inventory/purchase-orders

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Purchase orders and inventory transfers | Basic |  | https://help.shopify.com/en/manual/products/inventory/purchase-orders |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

---

## § 3 — Markets & internationalisation

### 3.1 Markets at launch

**Q3.1.1** — Which countries do you sell to at launch? For each: the country, the currency customers pay in, the languages, the web address customers use there today, how prices are set, which of your companies invoices the customer, whether the range is the same as in your main country, and who runs that country day to day. *(required · client)*
Drives: gate Markets · gate Multi-currency · gate Languages · rule 11.3 (STOP) · rule 11.4 (STOP) · rule 11.1 (STOP) · app signal Translation beyond Translate & Adapt · rule 11.20 (FLAG) · rule 11.21 (STOP) · rule 11.23 (FLAG)
Who holds this fact: Country manager or commercial lead for the range and the team; the controller for the invoicing company.

**What a usable answer looks like.** One row per launch country, with the invoicing company named even when it is the same everywhere, and the range marked same, subset or different. A vague answer sounds like "Europe" or "the usual countries". The follow-up that sharpens it: "which company name appears on the invoice a customer in that country receives?"

**If they do not know.** Markets with no selling entity are assumed to sell through the headquarters entity (Q1.1.2); a blank assortment is assumed to be the same range as the primary market; a blank owner is assumed to be the central team. Assumption recorded: One selling entity, one range, one team across all markets — the single-store case. Confidence: to_validate. To resolve: Name the invoicing company per country with the controller, and the range owner per country with the commercial lead.

**Why it matters.** Sets the whole international scope: markets, currencies, languages, domains and price strategy. The entity, range and owner columns are what the engine reads to decide one store with Markets, expansion stores or a hybrid — the client is never asked to choose the topology.

**Limits.** Shopify documents no limit on the number of country or region markets. Published languages are capped at 20 below Plus and 30 on Plus. Charging in a local currency (rather than only displaying one) requires Shopify Payments or Adyen; with any other provider the customer is charged in the store's default currency. Mainland China is excluded from this engagement and routed to a separate China discovery.

Sources: https://help.shopify.com/en/manual/markets/getting-started/market-types · https://help.shopify.com/en/manual/international/localization-and-translation · https://help.shopify.com/en/manual/markets/customizations/local-currencies

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Markets (no limit on country markets) | Basic |  | https://help.shopify.com/en/manual/markets/getting-started/market-types |
| Published languages | Basic | 20 languages below Plus, 30 on Plus | https://help.shopify.com/en/manual/international/localization-and-translation |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.1.2** — Which are the primary markets (one or more country or market codes)? *(required · client)*

**Why it matters.** Primary markets decide which currency, domain, payment methods and tax set-up get the design effort and get tested first. Every other market is sequenced behind them, and the roll-out waves are built from this answer.

Sources: https://help.shopify.com/en/manual/markets

**Q3.1.3** — Which countries are planned in the next 12 months? *(optional · client)*

**Why it matters.** A market added later is cheap if the domain, catalogue and pricing structure anticipated it, and expensive if it forces a re-cut. It also shows whether the plan you choose today survives the next twelve months.

**Limits.** Domain strategy is the hardest thing to change later: subfolders inherit the main domain's search ranking, while a ccTLD builds its own authority from scratch. Deleting a market later needs redirects or customers hit 404s.

Sources: https://help.shopify.com/en/manual/international/managing-international-domains

**Q3.1.4** — Stated preference only — does the client already have a view on running all countries from one store or giving some countries their own store? Record it as their view, not as the answer. *(optional · consultant)*
Who holds this fact: Ecommerce director or CTO, where one has already formed a view.

**What a usable answer looks like.** A view the client actually holds, with the reason they hold it. Leave it blank when they have none — a blank is better than a guess.

**If they do not know.** No stated preference is recorded and the computed recommendation stands alone. Assumption recorded: None — absence of a preference costs nothing. Confidence: high. To resolve: Nothing to resolve; this is an opinion, not a fact.

**Why it matters.** This is the one question in the bank that asks for an opinion rather than a fact, and it is kept only so the closing document can address the client's own view. The topology itself is derived from the business facts in Q3.1.1, Q1.1.6, Q3.4.2, Q3.4.13, Q5.1.3 and Q6.2.14.

| Option | Pros | Cons |
|---|---|---|
| One store with Shopify Markets | One admin, one catalogue, one theme; per-market currency, domain, language, catalogue and tax overrides; available from Basic; no duplicated app bills | Shared catalogue structure and app stack; per-market theme content needs Advanced or higher; one legal entity unless the client is on Plus |
| Expansion stores (Plus) | Each region runs its own catalogue, apps, team and settings — suits separately run regional businesses or different legal entities | Plus only; products, collections, inventory and settings are not synced; apps billed per store, theme licences not shared; every change is done more than once |

**Limits.** Never let this answer stand in for the analysis. Expansion stores need Shopify Plus and duplicate every catalogue, theme and app change; one store with Markets keeps them together but shares one theme, one app estate and one admin.

Sources: https://help.shopify.com/en/manual/organization-settings/expansion-stores · https://help.shopify.com/en/manual/markets/customizations/business-entities

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Expansion stores | Shopify Plus | Up to 9 expansion stores | https://help.shopify.com/en/manual/organization-settings/expansion-stores |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.1.5** — How should visitors reach their local market? *(optional · client)*

**Why it matters.** Clients assume visitors always land in the right market. Automatic redirection is native and free, but it has documented gaps that show up as the wrong currency on a live site, so agree the behaviour now.

| Option | Pros | Cons |
|---|---|---|
| Redirect visitors automatically | Right currency, language and prices on first view; native, no app, no build | Does not apply to EU visitors already on an EU ccTLD; annoys customers who deliberately want another market unless a selector is also offered |
| Show a country and language selector only | The customer chooses and keeps their choice; a selector is needed anyway when selling in local currencies | Some customers never use it and shop in the wrong currency; higher bounce on paid traffic landing from another country |

**Limits.** Customers from the EU arriving on an EU country-code domain (ccTLD) are not redirected automatically. Language redirection only works where the language is added, assigned, translated and published. Content on markets using shared domains is not indexed by search engines. The old Geolocation app is retired; it only ever recommended a market rather than switching it.

Sources: https://help.shopify.com/en/manual/international/automatic-redirection · https://help.shopify.com/en/manual/international/geolocation

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Automatic redirection | Basic | The Geolocation app is retired | https://help.shopify.com/en/manual/international/automatic-redirection |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.1.7** — Should any market have its own theme content, section order, checkout or customer-account settings? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** Per-market theme content requires the Advanced plan or higher. On Basic or Grow every market shares one theme customisation, so a yes here can move the plan — and the client's monthly cost — before any design work starts.

**Limits.** Adaptation fields may appear in Translate & Adapt on lower plans but will not display. Changing the information, shipping or payment steps of checkout, or restyling checkout through the Checkout Branding API, is Plus only; extensions on the thank-you and order-status pages work from Basic. A separate legal entity per market is Plus only.

Sources: https://help.shopify.com/en/manual/online-store/themes/customizing-themes-for-markets · https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-apps

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Theme customisation per market | Advanced |  | https://help.shopify.com/en/manual/online-store/themes/customizing-themes-for-markets |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.1.8** — Are some products not allowed to be sold in certain markets (regulation, registration, licensing or distribution agreements)? *(recommended · client)*

**Why it matters.** Market catalogs include or exclude products per market, so a licensing, registration or distribution restriction is configuration rather than custom code. But it has to be known before the catalogue structure and price lists are designed.

**Limits.** Shopify does not police this — the exclusion is a catalogue setting the client maintains as the range changes. Where a parent market and a submarket both price a product, the more specific price is used. Catalogue customisation for retail markets needs Shopify POS Pro or Plus.

Sources: https://help.shopify.com/en/manual/markets/customizations/catalogs

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Market catalogs: include or exclude products per market | Basic |  | https://help.shopify.com/en/manual/markets/customizations/catalogs |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 3.2 Language

**Q3.2.1** — How will translation be handled? *(recommended · client)*
Drives: app signal Translation beyond Translate & Adapt
Quick interview: ask if Q3.1.1 has 3+ languages

**Why it matters.** Translate & Adapt is free but auto-translates at most two languages, and once a language is used that choice cannot be switched. Beyond two, translation becomes a recurring human or app cost, not a one-off build task.

| Option | Pros | Cons |
|---|---|---|
| Translate & Adapt only | Free, native, no extra app in the stack; machine translation for up to two languages; per-market adaptation of the same content | Two auto-translated languages maximum and the choice is locked; policies and URL handles stay manual; no translator workflow, review or memory |
| A translation app (for example Weglot, Langify, Transcy) | More languages, translation memory, glossaries and review workflows; usually covers app and theme strings Translate & Adapt misses | A monthly cost that scales with words and languages; another dependency in the theme and in checkout-adjacent content; quality still needs review |
| Human or agency translation loaded into Shopify | Brand-quality copy, transcreation for each market, full control of tone and legal wording | Slowest and most expensive; needs an owner for every content change; without an app the loading and re-loading is manual work forever |

**Limits.** Translate & Adapt covers products, collections, blog posts, policies and pages, but does not auto-translate policies or URL handles. Checkout is pre-translated by Shopify. Published languages are capped at 20 below Plus and 30 on Plus. The fourth language and beyond is priced as scope — the first three are in every offer, because a Swiss engagement is DE/FR/IT. More than six is a stop rule: translation and content operations move to a Discovery Phase.

Sources: https://help.shopify.com/en/manual/international/translate-adapt-app · https://help.shopify.com/en/manual/international/localization-and-translation · https://apps.shopify.com/categories/store-design-internationalization

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Translate & Adapt | Basic | Auto-translates at most 2 languages; not policies | https://help.shopify.com/en/manual/international/translate-adapt-app |

If native is not enough: [Internationalization](https://apps.shopify.com/categories/store-design-internationalization) — [Weglot: AI Translation & SEO](https://apps.shopify.com/weglot), [langify](https://apps.shopify.com/langify), [Transcy](https://apps.shopify.com/transcy-multiple-languages)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.2.2** — Does any language need right-to-left layout? *(optional · client)*

**Why it matters.** Right-to-left is a theme engineering question, not a translation one — layout, navigation, icons, forms and email templates all mirror. It changes theme effort and the test matrix, so it cannot surface after the design is signed off.

**Q3.2.3** — Is SEO per language a priority? *(optional · client)*

**Why it matters.** Each published language gets its own URL and hreflang tags are added automatically, so the native baseline is decent. The real work is translated metadata, handles and content, which decides whether an app or a human translator is needed.

**Limits.** Published languages appear in sitemaps and hreflang is automatic for language-specific URLs. Translate & Adapt does not auto-translate URL handles. Markets that use shared domains are not indexed by search engines, so check the domain strategy before promising local SEO.

Sources: https://help.shopify.com/en/manual/international/localization-and-translation · https://help.shopify.com/en/manual/international/automatic-redirection

**Q3.2.4** — What must be translated? *(recommended · client)*
Drives: app signal Translation beyond Translate & Adapt
Quick interview: ask if Q3.1.1 has 3+ languages

**Why it matters.** Scope decides cost. Product and collection text is one job; policies, URL handles, metafields, emails, theme strings and app content are another. Translate & Adapt does not auto-translate policies or URL handles, so those stay manual or app work.

**Limits.** Translate & Adapt covers products, collections, blog posts, policies and pages — but its machine translation is limited to two languages and excludes policies and URL handles. Checkout itself is already translated by Shopify.

Sources: https://help.shopify.com/en/manual/international/translate-adapt-app

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Translate & Adapt | Basic |  | https://help.shopify.com/en/manual/international/translate-adapt-app |

If native is not enough: [Internationalization](https://apps.shopify.com/categories/store-design-internationalization) — [Weglot: AI Translation & SEO](https://apps.shopify.com/weglot), [langify](https://apps.shopify.com/langify), [Transcy](https://apps.shopify.com/transcy-multiple-languages)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 3.4 Tax & duties

**Q3.4.1** — Should duties and import taxes be collected at checkout (DDP)? *(recommended · client)*

**Why it matters.** DDP means the customer pays import costs at checkout and nothing on delivery; DAP means a courier bill at the door and refused parcels. It is a commercial and service decision with hard technical prerequisites behind it.

| Option | Pros | Cons |
|---|---|---|
| Collect duties and import taxes at checkout (DDP) | No surprise bill on delivery, so fewer refused parcels and support tickets; total price is honest at checkout; a better cross-border experience | Needs HS codes and country of origin on every product and a carrier supporting DDP labels; a per-order fee; rules out tax overrides, manual rates and exemptions; higher price shown at checkout hurts conversion |
| Leave duties to the customer on delivery (DAP) | Nothing to configure, no product customs data needed, no per-order duty fee, lowest price shown at checkout | Customers get an unexpected courier invoice; refused deliveries, returns and chargebacks; the brand takes the blame for a cost it never disclosed |

**Limits.** DDP needs HS codes (and country of origin) on products and a carrier that supports DDP labels. It is not compatible with tax overrides, manual tax rates or customer tax exemptions. You cannot offer both DDP and DAP in the same country. No duties in the Rest of world shipping zone, and twelve countries and regions are unsupported, including Northern Ireland. Charges are estimates at the time of order. Duties and taxes are collected together — taxes cannot be collected alone. Fee: 0.85% with Shopify Payments, 1.5% with other providers, on orders with duties calculated. Without a DDP label, the customer is still charged on delivery.

Sources: https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations · https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties · https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/ddp-ddu

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Duties and import taxes at checkout (DDP or DAP per country) | Basic | Plan not stated by Shopify; fee per order; not with tax overrides, manual rates or exemptions | https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations |

If native is not enough: App Store — [Zonos Duty and Tax](https://apps.shopify.com/duty-and-tax-calculator-iglobal-stores), [ESW International](https://apps.shopify.com/esw-international)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.2** — In which countries are you VAT-registered? *(recommended · client)*

**Why it matters.** Registrations are entered per region in Shopify and decide which VAT is charged where. Without the registration Shopify cannot collect that country's VAT at checkout — no configuration works around a registration the client does not hold.

**Limits.** Shopify Tax covers the United States, European Union, United Kingdom and Canada. Outside those, Basic Tax covers Norway, Switzerland, Australia, New Zealand and Singapore, and requires a tax registration number. Shopify calculates but never files or remits — that stays with the client and their tax adviser.

Sources: https://help.shopify.com/en/manual/taxes/registration · https://help.shopify.com/en/manual/taxes/shopify-tax

**Q3.4.3** — Do you sell into the US with state sales tax obligations? *(optional · client)*

**Why it matters.** US sales tax obligations are decided state by state by the client's own sales, not by Shopify. The answer tells you whether US registrations and rates are in scope and whether a tax adviser is needed before launch.

**Limits.** Shopify Tax covers the United States, and calculates rates, but the client is responsible for registering, filing and remitting. Shopify does not file or remit anywhere.

Sources: https://help.shopify.com/en/manual/taxes/shopify-tax · https://help.shopify.com/en/manual/taxes/registration

**Q3.4.4** — Do products have HS codes and country of origin, and where do they come from? *(recommended · client)*

**Why it matters.** No HS codes, no duties at checkout. This tells you whether the data exists at all, where it is mastered — ERP, PIM or supplier — and whether a data workstream sits on the critical path to a DDP launch.

**Limits.** Shopify requires HS codes applied to products (with country of origin) before duties and import taxes can be calculated at checkout. Under Managed Markets, Global-e assigns HS codes automatically instead.

Sources: https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties · https://help.shopify.com/en/manual/international/managed-markets/compare

**Q3.4.5** — Should prices include tax (VAT) in some markets and exclude it in others? *(required · client)*

**Why it matters.** European shoppers expect a VAT-inclusive price; US shoppers expect tax added at checkout. Shopify handles both from one price with dynamic tax-inclusive pricing, so this is a configuration answer, not a second set of price lists.

**Limits.** Dynamic tax-inclusive pricing is set per market and is documented from the Basic plan. It changes the displayed price, so confirm the resulting round numbers in each market with the client — rounding rules are Shopify's defaults and cannot be customised.

Sources: https://help.shopify.com/en/manual/international/pricing/dynamic-tax-inclusive-pricing · https://help.shopify.com/en/manual/international/pricing/rounding

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Dynamic tax-inclusive pricing | Basic |  | https://help.shopify.com/en/manual/international/pricing/dynamic-tax-inclusive-pricing |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.6** — Which tax service? *(recommended · consultant)*

**Why it matters.** For most European clients this is not really a choice: since 13 May 2026 new stores selling in the EU, UK or Canada cannot use Basic Tax. Shopify Tax calculates, but it never files or remits.

| Option | Pros | Cons |
|---|---|---|
| Shopify Tax | Native, no integration to build or maintain; rates for the US, EU, UK and Canada; product categories give reduced rates and exemptions; free up to a sales threshold | Per-order fee above the threshold; only four regions covered; no filing or remittance; nothing outside those regions unless Basic Tax applies |
| A third-party tax service (for example TaxJar) | Covers regions and edge cases Shopify Tax does not; usually adds filing and remittance workflows the client may already use with their accountant | Another subscription and another integration to test and maintain; duplicates work Shopify Tax already does in its four regions; the tax logic now lives in two places |

**Limits.** Shopify Tax covers the United States, European Union, United Kingdom and Canada. Outside those, Basic Tax covers Norway, Switzerland, Australia, New Zealand and Singapore and requires a tax registration number. Shopify Tax is free up to a sales threshold, then charged per order with a cap. Filing and remittance always stay with the client.

Sources: https://help.shopify.com/en/manual/taxes/shopify-tax/choose-tax-service · https://help.shopify.com/en/manual/taxes/shopify-tax/pricing · https://help.shopify.com/en/manual/taxes/registration

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Tax | Basic | Basic Tax closed to new EU, UK and Canada stores since 2026-05-13 | https://help.shopify.com/en/manual/taxes/shopify-tax/choose-tax-service |

If native is not enough: App Store — [Tax: TaxJar Sales Tax Automation](https://apps.shopify.com/taxjar)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.7** — Do business customers buy tax-exempt (VAT number validation, reverse charge)? *(optional · client)*

**Why it matters.** VAT ID validation at checkout is native, so reverse charge is configuration rather than a build. But the answer decides whether B2B buyers need their own market, customer group and catalogue — which reshapes pricing and the tax set-up.

**Limits.** Managed Markets does not support B2B orders, so a client needing both tax-exempt B2B trade and an outsourced merchant of record cannot have both. Selling B2B in more than one currency requires Shopify Payments.

Sources: https://help.shopify.com/en/manual/international/managed-markets/requirements-and-considerations · https://help.shopify.com/en/manual/b2b/markets/international

**Q3.4.8** — In which countries should duties and import taxes be collected at checkout (DDP)? In the others the customer pays on delivery (DAP). *(recommended · client)*

**Why it matters.** DDP is chosen per country and you cannot offer both DDP and DAP in the same country. The list drives shipping profiles, carrier choice and the per-order duty fee, so it belongs in scope rather than in go-live week.

**Limits.** Twelve countries and regions are unsupported, including Northern Ireland, Russia and Puerto Rico, and duties cannot be charged in the Rest of world shipping zone. Duties and taxes are collected together — taxes alone is not an option. DDP labels bought through Shopify's own carrier accounts are limited to Canada Post (US destinations only) and DHL Express (US and Canada); DHL eCommerce is DAP only. Other carriers must be confirmed directly.

Sources: https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations · https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/ddp-ddu

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| DDP or DAP per country or region | Basic | Not available for some destinations (e.g. Northern Ireland) or the Rest of world zone | https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.9** — When you ship low-value parcels into these territories from outside them, are you registered to collect the import VAT or GST at checkout? *(recommended · client)*
Quick interview: ask if Q3.1.1 has 2+ markets

**Why it matters.** This is the classic over-promise. Shopify can only collect EU import VAT at checkout on low-value orders if the client holds an IOSS registration. The same applies to the UK, Swiss, Norwegian VOEC, Australian and New Zealand schemes.

**Limits.** IOSS is for merchants outside the EU selling to EU customers, and lets them collect VAT at checkout on orders of €150 or less. Registration is optional in principle but required if VAT is to be charged during checkout. OSS registrations do not apply when the fulfilment location is outside the EU. Shopify recommends DDP alongside these schemes so orders above the threshold still get duties calculated. Shopify also documents that from 1 July 2026 the EU begins removing the €150 customs duty exemption — confirm the current position for the client's goods.

Sources: https://help.shopify.com/en/manual/taxes/eu/eu-tax-reference · https://help.shopify.com/en/manual/international/duties-and-import-taxes

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Low-value goods taxes (EU, UK, Switzerland, Norway, Australia, New Zealand) | Basic | Registration needed; Shopify recommends DDP so orders above the threshold get duties calculated | https://help.shopify.com/en/manual/international/duties-and-import-taxes |
| EU IOSS: collect VAT at checkout on low-value orders | Basic |  | https://help.shopify.com/en/manual/taxes/eu/eu-tax-reference |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.10** — Do some products have reduced or zero tax rates, or tax exemptions, in any market (e.g. medicines, books, food, children's clothing)? *(recommended · client)*

**Why it matters.** Reduced and zero rates are driven by product category in Shopify Tax, or by manual tax overrides. The answer decides whether the product data needs a tax category field — and it is Finance's call, never ours.

**Limits.** Product categories for reduced rates and exemptions apply to Shopify Tax in the US, EU and UK. Manual product tax overrides are set per country or state, but are ignored where duties are collected at checkout and are not compatible with DDP at all. Merkle does not give tax advice: the client's finance team or adviser confirms every rate.

Sources: https://help.shopify.com/en/manual/taxes/shopify-tax/product-categories-tax · https://help.shopify.com/en/manual/taxes/tax-overrides · https://help.shopify.com/en/manual/international/duties-and-import-taxes/considerations

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Product categories for reduced rates and exemptions (Shopify Tax: US, EU, UK) | Basic |  | https://help.shopify.com/en/manual/taxes/shopify-tax/product-categories-tax |
| Product tax overrides per country or state (manual collections) | Basic | Ignored where duties are collected at checkout | https://help.shopify.com/en/manual/taxes/tax-overrides |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.11** — Who issues invoices to customers? *(recommended · client)*
Drives: app signal Invoicing and e-invoicing
Quick interview: ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include GB / DE / FR / IT / PL / BE / ES / EU / AT / NL / PT / IE / SE / DK / FI

**Why it matters.** Shopify's VAT invoices cover EU and UK orders only, appear on the order status page rather than by email, and are not produced for orders with duties. Most cross-border clients therefore need an app or their ERP.

| Option | Pros | Cons |
|---|---|---|
| Shopify native VAT invoices plus Order Printer | Free and native; no extra app cost; enough for a simple EU or UK business with no duties at checkout | EU and UK orders only; not emailed to the customer; nothing for orders with duties; Portugal unsupported; no e-invoicing formats |
| An invoicing app (for example Sufio, Order Printer Pro) | Automatic emailed invoices, credit notes, branding, per-country numbering, and in some apps the EU e-invoicing formats | A monthly cost and another app holding order and customer data; invoice numbering rules must still be agreed with the client's finance team |
| The client's ERP or finance system issues invoices | One source of truth for accounting, numbering and credit notes; already audited; handles e-invoicing mandates the client faces elsewhere | Needs an order integration and a defined timing rule; invoices are late if the integration lags; customer service must know where to find them |

**Limits.** Native VAT invoices require Shopify Tax, are not emailed, are not generated for orders that include duties, and Portugal is not supported. The free Shopify Order Printer app prints invoices and packing slips from templates but is a document tool, not a compliance one.

Sources: https://help.shopify.com/en/manual/taxes/shopify-tax/vat-invoices · https://help.shopify.com/en/manual/fulfillment/managing-orders/printing-orders/shopify-order-printer

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| VAT invoices for EU and UK orders | Basic | Shopify Tax; not emailed; not for orders with duties; Portugal not supported | https://help.shopify.com/en/manual/taxes/shopify-tax/vat-invoices |
| Shopify Order Printer (invoices, packing slips) | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/printing-orders/shopify-order-printer |

If native is not enough: App Store — [Sufio: Professional Invoices](https://apps.shopify.com/sufio), [Order Printer Pro: Invoice App](https://apps.shopify.com/order-printer-pro)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.12** — Which electronic invoicing (e-invoicing) obligations apply to your sales? *(recommended · client)*
Drives: app signal Invoicing and e-invoicing
Quick interview: ask if Q1.1.4 is Business to business (B2B) or Hybrid (DTC and B2B), or the launch markets include DE / FR / IT / PL / BE / ES / EU

**Why it matters.** Shopify has no built-in e-invoicing. Peppol, XRechnung, ZUGFeRD, Factur-X, SdI, KSeF and VeriFactu are all ERP or app work, so a mandate in any market becomes a named integration with a legal deadline attached.

**Limits.** Shopify's native VAT invoices for EU and UK orders are documents, not e-invoices, and do not satisfy any of these schemes. Confirm each obligation with the client's finance team or tax adviser — Merkle does not give tax advice.

Sources: https://help.shopify.com/en/manual/taxes/shopify-tax/vat-invoices

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| VAT invoices for EU and UK orders (not e-invoicing) | Basic |  | https://help.shopify.com/en/manual/taxes/shopify-tax/vat-invoices |

If native is not enough: App Store — [Sufio: Professional Invoices](https://apps.shopify.com/sufio), [Order Printer Pro: Invoice App](https://apps.shopify.com/order-printer-pro), [POP: compliant EU invoicing](https://apps.shopify.com/pop-european-invoicing)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.4.13** — If selling in a country meant registering for tax there and filing returns, would you take that on yourself, or would you rather a partner were the legal seller for those orders? *(recommended · client)*
Who holds this fact: Controller, head of finance or the external tax adviser.

**What a usable answer looks like.** A position the finance function actually holds, ideally with the countries they will and will not register in. A vague answer sounds like "whatever is easiest". The follow-up that sharpens it: "who files your VAT returns today, and how many countries is that?"

**If they do not know.** Assumed own_registrations: the business keeps its registrations and Shopify Markets handles duties and taxes itself. Assumption recorded: The client is willing to register where it sells. Confidence: to_validate. To resolve: One conversation with the controller about where they file today and where they refuse to.

**Why it matters.** Together with the market list and the current registrations (Q3.4.2), this decides the cross-border model: self-managed duties on Shopify Markets, or a merchant of record. It replaces the retired Q3.1.6, which asked the client to name a model they had never heard of.

**Limits.** Managed Markets is the only merchant-of-record route inside Shopify, and it is open only to businesses in the continental United States and certain stores in Canada and the United Kingdom, on Shopify Payments, and it does not support B2B. For everyone else the honest options are self-managed registrations or a third-party merchant-of-record app.

Sources: https://help.shopify.com/en/manual/international/managed-markets/requirements-and-considerations · https://help.shopify.com/en/manual/taxes/registration/setup

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Tax and Basic Tax registrations per region | Basic |  | https://help.shopify.com/en/manual/taxes/registration/setup |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 3.5 Mainland China

**Q3.5.1** — Do you want to sell to mainland China cross-border (from outside China) or onshore, behind the Great Firewall? *(required · client)*
Drives: rule 11.20 (FLAG)
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Shopify's servers are not located in mainland China, and selling onshore needs a PRC entity, an ICP filing or licence and local hosting. This answer routes China to a separate discovery — it is outside this engagement's scope.

| Option | Pros | Cons |
|---|---|---|
| Cross-border into China (from outside the mainland) | No PRC entity, ICP filing or onshore hosting needed; can start through marketplaces or a Hong Kong store; customs channels are designed for it | Per-order and yearly limits per consumer; goods must be on the cross-border positive list; marketplace fees and a local partner; Shopify is rarely the storefront the customer sees |
| Onshore, behind the Great Firewall | A normal Chinese shopping experience, domestic payment and logistics, no customs limits per shopper, full local marketing integration | Needs a PRC legal entity, an ICP filing or commercial licence and hosting inside China — Shopify has no infrastructure in mainland China, so it cannot be the platform; months of lead time and PRC counsel |

**Limits.** Mainland China is not part of the Merkle offering. Naming China as a launch market flags the engagement for a separate China discovery and removes China from this engagement's markets, languages, offer, plan and build scope. If mainland China is the only launch market, this engagement stops and becomes a China discovery.

Sources: https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify in China: Shopify's servers are not located in mainland China | Basic |  | https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.5.2** — Which channels for mainland China? *(required · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Each China channel is a different build: a cross-border marketplace, a WeChat mini-program, a Hong Kong store. Shopify is not the storefront in most of them, so this answer sizes the separate China discovery, not this engagement.

**Limits.** Shopify has no native China marketplace or WeChat channel; connectors such as the WalkTheChat apps sit between Shopify and those channels. Mainland China is excluded from this engagement's scope regardless of the channel chosen.

Sources: https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do

If native is not enough: App Store — [WalktheChat WeChat Connector](https://apps.shopify.com/walkthechat-wechat-connector), [WalktheChat Marketplace](https://apps.shopify.com/walkthechat-marketplace)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.5.3** — Do you have a legal entity in mainland China? *(required · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** No PRC entity means no ICP filing and no onshore hosting, so selling onshore is off the table before any technical discussion starts. It is the first fact the separate China discovery needs from the client.

**Limits.** Shopify cannot host a site inside mainland China in any case — its servers are not located there — so an entity alone does not make Shopify the onshore platform.

Sources: https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do

**Q3.5.4** — Do you have a Hong Kong or other overseas entity that can sell cross-border, and are your trademarks registered in China? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Cross-border marketplaces require both an overseas selling entity and trademarks registered in China. Without them the cross-border route is blocked on paperwork with long lead times, which the separate China discovery has to plan around.

**Limits.** This is a legal and brand-protection question, not a Shopify one. Merkle does not give PRC legal advice; the client's counsel confirms entity and trademark status.

**Q3.5.5** — ICP status for a China website? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** An ICP filing or a commercial ICP licence decides whether a China-hosted website is legally possible and how long it takes. Shopify cannot host it, so the answer belongs to the separate China discovery.

**Limits.** Shopify's servers are not located in mainland China, so an ICP filing does not turn a Shopify store into an onshore China site. The client's PRC counsel confirms whether a filing is enough or a commercial licence is needed.

Sources: https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do

**Q3.5.6** — What is Shopify's role for mainland China? *(optional · consultant)*
Drives: rule 11.20 (FLAG)
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Even where China sells through local channels, Shopify can stay the global master for products, inventory and orders. This answer defines the integration surface between this engagement and the separate China workstream.

| Option | Pros | Cons |
|---|---|---|
| Shopify stays the global master for products, inventory and orders | One catalogue and one stock picture; China channels are fed from the same data; reporting stays consolidated | Needs connectors and a China-specific data mapping; China channels impose their own attributes, claims rules and image requirements |
| China runs entirely separately from Shopify | No integration work in this engagement; the local partner owns the stack the local market expects | Two catalogues, two stock pictures and no consolidated reporting; the brand loses direct sight of Chinese customers and demand |

**Limits.** Shopify has no infrastructure in mainland China, so it cannot be the onshore storefront. Keeping it as the master system is a data and integration decision, not a selling one.

Sources: https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify in China: Shopify's servers are not located in mainland China | Basic |  | https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.5.7** — How will goods enter China: bonded warehouse (1210), direct mail (9610), general trade, or personal parcels? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Bonded warehouse, direct mail, general trade and personal parcels carry different duties, paperwork and per-order and yearly limits per consumer. None of it is Shopify configuration; it sizes the separate China discovery.

**Limits.** Cross-border channels have per-order and yearly limits per consumer. This is customs and logistics work owned by the client's trade partner and PRC advisers, not by the Shopify build.

**Q3.5.8** — Are your products on China's cross-border e-commerce positive list? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Goods off China's cross-border e-commerce positive list cannot move through the bonded or direct-mail channels, which can remove the whole cross-border route for a catalogue. It is a product fact, not a platform one.

**Limits.** The positive list is set by Chinese authorities and changes. The client's trade partner or PRC counsel confirms it — Merkle does not.

**Q3.5.9** — How are your products classified in China? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** China treats whitening, sunscreen and anti-hair-loss products as special cosmetics, and medicines are not cross-border goods at all. Classification decides which channel is even legal, so it comes before any China technical planning.

**Limits.** Classification is a Chinese regulatory judgement confirmed by the client's PRC counsel or trade partner, and it can differ from how the same product is classified in the EU or US.

**Q3.5.10** — Registration or filing status with China's medical products administration (NMPA)? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** General trade needs NMPA registration or filing; cross-border channels are exempt for goods on the positive list. The answer sets the lead time to a China launch and belongs in the separate China discovery.

**Limits.** Registration and filing timelines are set by the Chinese authorities and can run to months. Merkle does not provide PRC regulatory advice.

**Q3.5.11** — Do product claims need a review for China (medical, cosmeceutical or treatment claims)? *(optional · consultant)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** China does not allow cosmeceutical or medical claims for cosmetics, so copy translated straight from the global site can be non-compliant. It is a content workstream the separate China discovery has to own and resource.

**Limits.** This is a legal review of product claims, not a translation task. Approval sits with the client's PRC counsel or trade partner.

**Q3.5.12** — How will mainland customers pay? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Alipay and WeChat Pay are available through a Hong Kong Shopify Payments account in early access; domestic merchant accounts need a PRC entity. This answer decides whether a Shopify-hosted China checkout is possible at all.

**Limits.** Both methods require a Hong Kong SAR Shopify Payments account and are in early access. Customers pay in CNY. WeChat Pay has no chargebacks. Inside a marketplace, payment is the marketplace's, not Shopify's.

Sources: https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/wechat-pay · https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/alipay

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| WeChat Pay via Shopify Payments | Basic | Hong Kong SAR Shopify Payments account; early access; customers pay in CNY; no chargebacks | https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/wechat-pay |
| Alipay via Shopify Payments | Basic | Hong Kong SAR Shopify Payments account; early access | https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods/alipay |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.5.13** — How many mainland China customers do you expect per year? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** China's personal information law sets different data-export obligations by volume, so the expected customer count decides which compliance regime applies. Nothing about it is a Shopify setting; it feeds the separate China discovery.

**Limits.** Shopify's servers are not located in mainland China, so every China customer record is a cross-border transfer by default. The client's PRC counsel confirms the obligations.

Sources: https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do

**Q3.5.14** — Do you have a representative in China for personal information protection (PIPL)? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** PIPL requires a representative in China when an offshore business targets Chinese consumers. It is a named legal appointment the client must make, not a platform setting, and it gates a compliant China launch.

**Limits.** Merkle does not provide PRC legal advice; the appointment and its terms come from the client's counsel.

**Q3.5.15** — Where will China customer data (CRM, email, analytics) be stored? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Where China customer data sits decides whether a cross-border transfer mechanism is needed and which CRM, email and analytics tools may be used at all. Shopify's servers are not in mainland China.

**Limits.** Several common martech tools are unreachable or unlawful for China data, so the answer can change the whole stack for that market. The client's PRC counsel confirms the transfer mechanism.

Sources: https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/china-getting-started-to-do

**Q3.5.16** — Must scripts blocked in China (Google Fonts, Google Analytics, reCAPTCHA, Meta pixels, YouTube) be replaced? *(optional · consultant)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Google Fonts, Google Analytics, reCAPTCHA, Meta pixels and YouTube are commonly blocked in China — Shopify itself notes that firewalls there frequently block Google Fonts. Every replacement is real theme and tracking build work.

**Limits.** Blocked scripts do not fail quietly: they can stall page rendering for Chinese visitors even on a site that works everywhere else. Shopify documents the Google Fonts case; the rest must be tested from inside China.

Sources: https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/online-store-setup

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify notes that firewalls in China frequently block Google Fonts | Basic |  | https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/sell-in-china/online-store-setup |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q3.5.17** — Which marketing channels for China? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** China's marketing stack is entirely local — different platforms, different tracking, different content formats. The answer sizes the separate China discovery and shows how much of the global martech investment carries over. Usually very little.

**Limits.** Shopify's marketing integrations are built for Western channels; Chinese channels are reached through connectors or the local partner's own tooling.

**Q3.5.18** — Who provides Chinese-language customer service? *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Chinese-language service, in China hours, on the channels Chinese customers actually use, is an operating commitment the client must staff. It is a readiness check for the China route, not a Shopify configuration.

**Q3.5.19** — Do you work with a local partner or trade partner for China? Name it. *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Most successful China entries run through a trade partner or a local agency. Knowing who they are tells you who owns the storefront, the data and the customer — and what Merkle is actually being asked to deliver.

**Q3.5.20** — Target launch date for mainland China. *(optional · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** ICP filings, trademark registrations and NMPA filings take months. A target date shows whether China is a funded plan or an aspiration, and whether it can be sequenced safely after this engagement's launch.

**Limits.** Mainland China is excluded from this engagement's scope and offer, so this date belongs to the separate China discovery's plan, not to this delivery timeline.

**Q3.5.21** — Who provides PRC legal, tax and customs advice? *(required · client)*
Asked only if the launch markets include mainland China (CN)

**Why it matters.** Merkle does not provide PRC legal, tax or customs advice. If nobody is named here, the China route has no owner for its highest-risk decisions and the separate China discovery cannot responsibly start.

**Limits.** Entity set-up, ICP status, customs mode, product classification, claims review and PIPL obligations all need a named PRC adviser. Shopify's documentation covers none of them.

---

## § 4 — Payments & checkout

### 4.1 Payments

**Q4.1.1** — Which payment providers will you use (Shopify Payments, Adyen, Stripe, PayPal…)? *(required · client)*

**Why it matters.** The provider decides more than fees. Charging buyers in their own currency requires Shopify Payments or Adyen; with any other provider local prices are display only and the buyer is charged in your store's default currency.

| Option | Pros | Cons |
|---|---|---|
| Shopify Payments | Charges buyers in local currency; local payment methods, Shop Pay and fraud analysis come with it; no third-party transaction fee | Only in supported countries; the client must hold an eligible entity and bank account there |
| Third-party gateway (not Adyen) | Keeps an existing acquirer relationship and its negotiated rates | Local currency becomes display only - the buyer is charged in the store currency; third-party transaction fees apply; fraud analysis needs Grow or above |

**Limits.** Shopify Payments is available only in supported countries, each with its own bank account and verification requirements - check the client's entity country before assuming it is an option. Third-party transaction fees apply on all third-party gateways; PayPal and manual payments are excluded when Shopify Payments is active.

Sources: https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries · https://help.shopify.com/en/manual/markets/customizations/local-currencies · https://help.shopify.com/en/manual/international/payments · https://help.shopify.com/en/manual/payments/third-party-providers

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Payments | Basic | Available in 40 countries | https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.1.2** — Which local payment methods are required? *(recommended · client)*

**Why it matters.** Local methods decide conversion market by market. Shopify Payments offers them per country and shows them based on the buyer's location, so what is available is set by Shopify's country page rather than by the build.

**Limits.** The store country's payment-methods page is the source of truth, and the sets differ: Switzerland documents TWINT, Germany documents EPS and BLIK, Austria documents EPS. A method that is not listed needs a third-party gateway, with its own transaction fee.

Sources: https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods · https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Local payment methods via Shopify Payments | Basic |  | https://help.shopify.com/en/manual/payments/shopify-payments/local-payment-methods |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.1.3** — Which buy-now-pay-later options, if any? *(optional · client)*

**Why it matters.** Buy now, pay later moves average order value, and the native option is geographically fixed. Shop Pay Installments covers stores in the US, Canada and the UK only; anywhere else the client needs a third-party provider or app.

**Limits.** Shop Pay Installments: US, Canada and UK stores.

Sources: https://help.shopify.com/en/manual/payments/shop-pay-installments/eligibility

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shop Pay Installments | Basic | US, Canada and UK stores | https://help.shopify.com/en/manual/payments/shop-pay-installments/eligibility |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.1.4** — Do you need payouts in more than one currency? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** Being paid in a currency is a separate feature from charging in it, and it is the one that costs a plan. Multi-currency payouts need Advanced or Plus; below that the client still sells internationally but is settled in their domestic currency.

| Option | Pros | Cons |
|---|---|---|
| Payouts in each selling currency (Advanced or Plus) | A bank account matching the order currency removes the conversion and its fee; cleaner reconciliation per market | Forces Advanced or Plus; a Multi-Currency Payout fee applies to every non-domestic payout; one bank account per currency to open and maintain |
| Settle everything in the domestic currency | Works on any plan; one bank account; no Multi-Currency Payout fee | A currency conversion fee applies to non-domestic transactions; the client carries the FX exposure |

**Limits.** Advanced or Plus only. The client needs a business entity and bank account in an eligible region, only the store owner can activate it, and there is one bank account per supported payout currency. A Multi-Currency Payout fee applies to any payout in a non-domestic currency; domestic payouts carry none.

Sources: https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/payouts-in-multiple-currencies · https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/supported-payout-currencies

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Multi-currency payouts | Advanced |  | https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/payouts-in-multiple-currencies |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.1.5** — Will card data be handled only by Shopify-hosted checkout, by a third-party hosted payment page, or by custom card UI / tokenisation? *(required · consultant)*
Drives: rule 11.9 (STOP)

**Why it matters.** Shopify's hosted checkout keeps card data out of your build: Shopify is certified Level 1 PCI DSS and that covers stores on the platform. Handle card data anywhere else and PCI scope returns to the client, with a threat model mandatory.

| Option | Pros | Cons |
|---|---|---|
| Shopify-hosted checkout only | Card data never touches your code; Shopify's Level 1 PCI DSS compliance extends to the store | Checkout changes are limited to Checkout Extensibility, and the deeper steps need Plus |
| Third-party hosted payment page | Keeps the client's acquirer and its card-data scope; no card data in your build | Breaks the checkout journey; third-party transaction fees; local-currency charging is lost unless the provider is Adyen |
| Custom card UI or tokenisation | Full control of the payment experience | Puts the client back in PCI scope, triggers a mandatory security review and threat model, and is a STOP for the standard offer |

**Limits.** Shopify's certification covers the store, cart and hosting. It does not remove the merchant's own PCI obligations wherever they store, process or transmit cardholder data outside Shopify.

Sources: https://www.shopify.com/security/pci-compliant

**Q4.1.6** — Which express checkouts are required? *(recommended · client)*

**Why it matters.** Express wallets are the strongest single conversion lever at checkout, but they are not universal: B2B checkout and pre-orders do not support them. Confirm this before promising one-tap buying to a trade audience or a pre-order launch.

**Limits.** B2B checkout and pre-orders do not support express checkouts.

**Q4.1.7** — Must payment methods be hidden, renamed or reordered by market, customer type or cart? *(recommended · client)*

**Why it matters.** Hiding, renaming or reordering payment methods is not a setting. It is a Payment Customization Shopify Function, so it means an app. A public app carrying that Function installs on any plan; the same Function inside a custom app needs Plus.

**Limits.** Public apps from the App Store containing Shopify Functions install on any plan. A custom app containing a Function requires Plus - that distinction, not the rule itself, decides the plan.

Sources: https://shopify.dev/docs/apps/build/functions
Build with: Payment Customization Function (public apps: all plans; custom apps: Plus)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 4.2 Checkout

**Q4.2.1** — Which checkout changes are needed? *(required · client)*
Drives: rule 11.1 (STOP) · rule 11.6 (STOP) · gate Checkout extensibility

**Why it matters.** This is the plan question in disguise. Thank-you and order-status extensions run on every plan; anything touching the information, shipping or payment steps, or restyling through the Checkout Branding API, is Plus. A fully custom checkout UI is not possible at all.

**Limits.** checkout.liquid is retired - Checkout Extensibility (blocks, fields, Functions) is the only route, so a bespoke checkout front end is a STOP and a composable-platform conversation, not an estimate.

Sources: https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations · https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-apps

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Checkout and accounts editor; Thank you / Order status page extensions | Basic |  | https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations |
| Checkout UI extensions on information, shipping and payment steps; Checkout Branding API | Shopify Plus |  | https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations |

If native is not enough: [Checkout](https://apps.shopify.com/categories/marketing-and-conversion-checkout) — [Shopify Checkout Blocks](https://apps.shopify.com/checkout-blocks)
Build with: Checkout UI extensions · Shopify Functions (public apps: all plans; custom apps: Plus)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.2.2** — Which checkout extensions are needed? *(optional · consultant)*
Drives: gate Checkout extensibility

**Why it matters.** Names the actual extension points so the work is estimable: UI extensions for what the buyer sees, and Functions for delivery options, payment rules, cart and checkout validation and pickup points. Each Function is an app to build, review and maintain.

**Limits.** Checkout UI extensions run from Basic, but extensions on the information, shipping and payment steps are Plus. Functions inside a custom app are Plus; inside a public App Store app they are not.

Sources: https://shopify.dev/docs/api/checkout-ui-extensions/latest · https://shopify.dev/docs/apps/build/functions

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Checkout UI extensions | Basic | Step extensions: Plus | https://shopify.dev/docs/api/checkout-ui-extensions/latest |

If native is not enough: [Checkout](https://apps.shopify.com/categories/marketing-and-conversion-checkout) — [Shopify Checkout Blocks](https://apps.shopify.com/checkout-blocks)
Build with: Delivery Customization Function · Payment Customization Function · Cart and Checkout Validation Function · Pickup Point Delivery Option Generator
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.2.3** — Which custom checkout fields are needed (company, VAT number, PO number, delivery instructions)? *(optional · client)*
Drives: gate Checkout extensibility

**Why it matters.** Extra fields - company, VAT number, PO number, delivery instructions - are checkout UI extensions, so where they sit decides the plan: on the information, shipping or payment steps they are Plus, on the thank-you page they are not.

**Limits.** Each field also needs a destination downstream; capturing it at checkout is only half the requirement if the ERP or invoicing system must receive it.

Sources: https://help.shopify.com/en/manual/checkout-settings/customize-checkout-configurations/checkout-apps

**Q4.2.4** — Are post-purchase upsells needed? *(optional · client)*

**Why it matters.** Upsells after payment are the cheapest incremental revenue in checkout and, unlike changes to the checkout steps, do not need Plus. Thank-you page extensions run from Basic; the separate post-purchase page is still a Shopify beta.

**Limits.** Thank-you page upsell extensions: Basic and above. A separate post-purchase page is in beta - treat it as a risk, not a commitment.

Sources: https://shopify.dev/docs/apps/build/checkout/product-offers/build-a-post-purchase-offer

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Thank you page upsell extensions | Basic | Post-purchase page: beta | https://shopify.dev/docs/apps/build/checkout/product-offers/build-a-post-purchase-offer |

If native is not enough: App Store — [Upsell.com ‑ ReConvert Upsell](https://apps.shopify.com/reconvert-upsell-cross-sell), [Aftersell Post Purchase Upsell](https://apps.shopify.com/aftersell)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.2.6** — Is store credit needed? *(optional · client)*

**Why it matters.** Removes a common assumption that this needs an app. Shopify can refund to store credit or issue it outright, and customers spend it when signed in - which quietly makes customer accounts part of the journey you design.

**Limits.** Customers must be signed in to spend store credit.

### 4.3 Fraud & risk

**Q4.3.1** — Is manual fraud review needed for high-value orders? *(optional · client)*

**Why it matters.** Fraud review is native, but availability depends on the payment set-up as much as the plan. Fraud analysis covers Shopify Payments stores, and Grow, Advanced or Plus stores on most third-party processors, so a Basic store on a third-party gateway has none.

**Limits.** Fraud analysis: Shopify Payments stores, or Grow, Advanced and Plus stores on most third-party processors.

Sources: https://help.shopify.com/en/manual/payments/fraud-prevention/fraud-control-app · https://help.shopify.com/en/manual/payments/fraud-prevention/preventing-fraud

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Fraud analysis; Shopify Fraud Control | Basic |  | https://help.shopify.com/en/manual/payments/fraud-prevention/fraud-control-app |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.3.2** — Which order restrictions are needed? *(optional · client)*
Drives: gate Checkout extensibility

**Why it matters.** Splits the answer into free and paid. Blocking whole countries is native through markets and shipping zones; anything conditional - order value, quantity, product mix, customer type - is a Cart and Checkout Validation Function, which means an app.

**Limits.** A validation Function in a public App Store app works on any plan; the same Function in a custom app requires Plus.

Sources: https://shopify.dev/docs/apps/build/functions

If native is not enough: [Checkout](https://apps.shopify.com/categories/marketing-and-conversion-checkout) — [Shopify Checkout Blocks](https://apps.shopify.com/checkout-blocks)
Build with: Cart and Checkout Validation Function
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q4.3.3** — Do you want a guarantee that fraud chargebacks are reimbursed? *(optional · client)*
Drives: app signal Chargeback guarantee
Quick interview: ask if Q1.3.1 is Premium, Luxury or Enterprise

**Why it matters.** A reimbursement guarantee is rarely native. Shopify Protect requires a US-located merchant with a US Shopify Payments account and covers only Shop Pay orders of physical goods, so in Europe this is always a paid fraud app.

**Limits.** Shopify Protect also requires fulfilment with valid tracking within 7 days and the order in transit within 10 days. Treat it as a US-only benefit in European scoping.

Sources: https://help.shopify.com/en/manual/payments/shop-pay/shopify-protect/protect-order-with-shopify-protect

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Protect | Basic | US merchants, Shop Pay orders | https://help.shopify.com/en/manual/payments/shop-pay/shopify-protect/protect-order-with-shopify-protect |

If native is not enough: [Fraud](https://apps.shopify.com/categories/store-management-security-fraud/all) — [Signifyd](https://apps.shopify.com/signifyd), [Riskified](https://apps.shopify.com/riskified), [Wyllo (formerly NoFraud listing)](https://apps.shopify.com/nofraud-chargeback-prevention-and-protection)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

---

## § 5 — Shipping & fulfilment

### 5.1 Fulfilment model

**Q5.1.1** — Do you fulfil in-house, through a 3PL, or both? *(required · client)*

**Why it matters.** Decides who owns fulfilment in the build: Shopify locations worked in the admin, or a 3PL connector with its own order, inventory and tracking sync. It sets the integration effort, the go-live cutover and who handles exceptions.

**Q5.1.2** — Which 3PL provider? *(recommended · client)*

**Why it matters.** The named provider decides whether a ready-made Shopify connector exists or the integration has to be built and tested. It also fixes what flows back — stock levels, tracking numbers, returns — and the error handling you have to scope.

**Q5.1.3** — How many locations will fulfil online orders (warehouses, 3PL locations and stores that ship orders), and in which countries are they? *(required · client)*
Drives: rule 11.1 (STOP) · rule 11.13 (FLAG)
Who holds this fact: Head of logistics or operations.

**What a usable answer looks like.** A count and the country of each location, including 3PL sites. "Three warehouses" without countries is not usable — ask which countries they are in.

**If they do not know.** Locations are assumed to sit in the headquarters country (Q1.1.2), which keeps cross-border duties and the tax position as they are today. Assumption recorded: All fulfilment happens from the home country. Confidence: medium. To resolve: A list of warehouse and 3PL sites from operations.

**Why it matters.** Location count sets both plan and routing scope. Shopify allows 10 locations below Plus and 200 on Plus. More than two fulfilling locations with routing beyond the native rules triggers a multi-location inventory scoping exercise.

**Limits.** 10 inventory locations on Basic, Grow and Advanced; 200 on Plus. Locations created by apps are not counted.

Sources: https://help.shopify.com/en/manual/fulfillment/setup/locations/setup

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Locations | Basic | 10 locations below Plus, 200 on Plus; app locations not counted | https://help.shopify.com/en/manual/fulfillment/setup/locations/setup |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.4** — How should Shopify pick the fulfilling location? *(required · client)*
Drives: rule 11.13 (FLAG)

**Why it matters.** Shopify picks a location with native routing rules: minimise split shipments, stay within the market, closest location, ranked locations, location metafields. Anything else means a custom routing Function or the ERP deciding — a different, larger build.

| Option | Pros | Cons |
|---|---|---|
| Native order routing rules | Available from Basic, configured in the admin, no code, changeable by the client later. | Only the documented strategies; no bespoke logic such as capacity, cost or carrier cut-off times. |
| Custom Order Routing Location Rule Function, or the ERP/OMS decides | Any routing logic the business actually uses; fits clients whose OMS is already the source of truth. | Development and ongoing maintenance, and it triggers the multi-location inventory scoping flag (T3). |

Sources: https://help.shopify.com/en/manual/fulfillment/setup/order-routing/understanding-order-routing

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Order routing rules | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/order-routing/understanding-order-routing |
Build with: Order Routing Location Rule Function
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.5** — Which carriers do you use? *(recommended · client)*

**Why it matters.** The carrier list tells you which rates, labels and tracking can live inside Shopify and which stay in the carrier's own system or need an app. It is also the first input to the shipping-rate and label decisions below.

**Q5.1.6** — How are shipping rates calculated? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** Flat, weight-based and price-based rates are native from Basic. Live third-party carrier-calculated rates need Advanced or Plus, and on Grow only as a paid add-on or with annual billing. This answer can move the plan and the price.

| Option | Pros | Cons |
|---|---|---|
| Native rate tables (flat, weight, price conditions) | Works from Basic, no extra cost, fully configurable by the client. | Rates are your own estimates, so margin drifts when carrier pricing changes. |
| Live carrier-calculated rates | Checkout shows the carrier's real price for the basket and destination. | Needs Advanced or Plus (extra fee or annual billing on Grow), a carrier account, and accurate weights and package sizes. |

**Limits.** Third-party carrier-calculated shipping is available on Advanced and Plus; Grow stores can add it for an extra monthly fee or by switching to annual billing.

Sources: https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/setting-up-shipping-rates · https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/third-party-carrier-calculated-shipping

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shipping rates (flat, weight, price conditions) | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/setting-up-shipping-rates |
| Third-party carrier-calculated shipping | Advanced | Add-on on Grow | https://help.shopify.com/en/manual/fulfillment/setup/shipping-rates/third-party-carrier-calculated-shipping |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.7** — Are there product-specific shipping rules (heavy, hazardous, temperature-controlled)? *(optional · client)*

**Why it matters.** Heavy, hazardous or temperature-controlled products normally need their own delivery profile, their own rates and a separate carrier arrangement. Missed at discovery, they appear after launch as rates that quote impossible deliveries.

**Q5.1.9** — Which countries do you not ship to? *(optional · client)*

**Why it matters.** Shipping zones and market setup are built from where you will not ship. Get it wrong and customers reach checkout for destinations you cannot serve, which comes back as cancellations, refunds and support load.

**Q5.1.10** — Free-shipping thresholds per market (market, threshold, currency, which rates). *(recommended · client)*

**Why it matters.** Free shipping is native either as a price condition on a shipping rate or as an automatic free-shipping discount. Thresholds that differ by market and currency multiply the rates and discounts to configure and test — effort, not development.

**Limits.** Both mechanisms are native from Basic; the cost is per-market configuration and testing.

Sources: https://help.shopify.com/en/manual/discounts/discount-types/free-shipping

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Free-shipping rate condition or automatic free-shipping discount | Basic |  | https://help.shopify.com/en/manual/discounts/discount-types/free-shipping |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.11** — Which delivery methods do you offer? *(required · client)*
Drives: app signal Delivery slots and pickup points

**Why it matters.** Local delivery and pickup in store are native. Pickup points are native only for stores in France, Italy, Spain and the UK with certain carriers. Delivery time slots need an app; ship from store needs Shopify POS.

**Limits.** Outside France, Italy, Spain and the UK, pickup points need a custom app using the Pickup Point Delivery Option Generator Function on Plus, and are not available for B2B or express wallets.

Sources: https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/local-delivery · https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/pickup-in-store · https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/pickup-points

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Local delivery | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/local-delivery |
| Pickup in store | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/pickup-in-store |
| Pickup points (native carriers in France, Italy, Spain, UK) | Basic | Elsewhere: custom app with the pickup point Function on Plus; not for B2B or express wallets | https://help.shopify.com/en/manual/fulfillment/setup/delivery-methods/pickup-points |

If native is not enough: [Delivery and pickup](https://apps.shopify.com/categories/orders-and-shipping-shipping-solutions-delivery-and-pickup/all) — [Zapiet ‑ Pickup + Delivery](https://apps.shopify.com/click-and-collect)
Build with: Pickup Point Delivery Option Generator
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.12** — How are shipping labels created? *(optional · client)*

**Why it matters.** Where labels are created decides where tracking numbers come from, and therefore whether customers get shipping notifications automatically or someone has to type numbers back into Shopify. It also decides which team works in the admin daily.

| Option | Pros | Cons |
|---|---|---|
| Labels bought in Shopify | Tracking and fulfilment status update automatically; one place for the operations team to work. | Needs accurate weights and a default package, and label support depends on the carrier and country. |
| Labels from the carrier's or 3PL's system | Keeps existing carrier contracts, rates and warehouse processes untouched. | Tracking numbers must be written back to Shopify by integration, or notifications and the order status page go stale. |

**Q5.1.13** — Do all products have accurate weights (and package sizes), and where does that data come from? *(recommended · client)*
Quick interview: ask if Q5.1.6 includes Weight or price based, Live carrier rates or Rates from an app

**Why it matters.** Weight-based rates, carrier-calculated rates, shipping labels and some duty calculations all read product weights and packages. Missing or inherited-from-the-old-platform weight data is a migration task, and it breaks rates quietly after launch.

**Limits.** Labels need accurate weights and a default package configured.

Sources: https://help.shopify.com/en/manual/fulfillment/setup/packaging/packages-and-weights

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Product weights and saved packages | Basic | Labels need accurate weights and a default package | https://help.shopify.com/en/manual/fulfillment/setup/packaging/packages-and-weights |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.1.14** — Do any products count as dangerous goods for shipping? *(recommended · client)*

**Why it matters.** Dangerous goods stay the merchant's responsibility and restrict what Shopify can do: USPS and FedEx labels bought inside Shopify do not support hazardous materials. These products need their own delivery profile and a direct carrier arrangement.

**Limits.** USPS and FedEx labels bought through Shopify do not support hazardous materials.

Sources: https://help.shopify.com/en/manual/compliance/legal/shipping-dangerous-goods

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shipping dangerous goods (merchant responsibility; restricted with Shopify Shipping labels) | Basic | USPS and FedEx labels bought in Shopify don't support hazardous materials | https://help.shopify.com/en/manual/compliance/legal/shipping-dangerous-goods |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 5.2 Returns & exchanges

**Q5.2.1** — Summarise the returns policy (window, conditions, who pays return postage). *(recommended · client)*

**Why it matters.** The written policy is exactly what you configure as return rules — window, return fee, restocking fee, final sale — or what a returns app must reproduce. Capturing it early shows whether the native rules can express it at all.

**Q5.2.2** — Shopify includes return requests in customer accounts, controlled by return rules (window, return fee, restocking fee, final sale). Is that enough? *(recommended · client)*

**Why it matters.** This is the question that settles the returns line in the proposal: native self-serve returns and return rules, or a paid returns platform. Everything else in this subsection is evidence feeding this single decision.

| Option | Pros | Cons |
|---|---|---|
| Native self-serve returns and return rules | Included from Basic, no licence, one system for staff, works for B2B orders too. | Staff approve and handle exchanges manually; no QR drop-off; labels only for US locations. |
| Returns platform (app) | Customer-chosen exchanges and store credit, labels and QR drop-off outside the US, return reasons and reporting, automation at volume. | Recurring licence cost, another system for staff and support, and an integration to keep in step. |

**Limits.** Native return rules cover window, return fee, restocking fee and final sale. Return labels are only bought for US fulfilment locations, and customers cannot choose an exchange in the return form.

Sources: https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Self-serve returns and return rules | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns |

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [AfterShip Returns & Exchanges](https://apps.shopify.com/returns-center-by-aftership), [Narvar Return and Exchange](https://apps.shopify.com/narvar-returns), [Redo](https://apps.shopify.com/redo)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.3** — Do you process exchanges (not only refunds)? *(optional · client)*

**Why it matters.** Exchanges exist natively only as items staff add when approving a return — the customer never picks the replacement. A yes here is usually the first hard signal that a returns platform belongs in the recommendation.

Sources: https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns

**Q5.2.4** — Which returns, tracking or post-purchase apps do you use or prefer? *(optional · client)*
Drives: app signal Returns platform · app signal Post-purchase tracking platform
Quick interview: ask if Q1.2.1 is yes, or Q0.2.6 is 500 or more

**Why it matters.** An incumbent returns or tracking platform turns the recommendation from choosing a tool into integrating one, with its own contract, data and migration. Ask before the app shortlist is drafted, not after the client sees it.

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [AfterShip Returns & Exchanges](https://apps.shopify.com/returns-center-by-aftership), [Narvar Return and Exchange](https://apps.shopify.com/narvar-returns), [Redo](https://apps.shopify.com/redo), [AfterShip Order Tracking](https://apps.shopify.com/aftership), [parcelLab Order Tracking](https://apps.shopify.com/parcellab-engage)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.5** — How many days do customers have to return an order? *(recommended · client)*

**Why it matters.** The window is a native return rule, so the number itself is configuration. It matters here because unusual windows, or windows that change by market or product, are what push the client past what one native rule set can express.

**Q5.2.6** — What share of orders is returned today (%)? *(recommended · client)*
Drives: app signal Returns platform
Quick interview: ask if Q0.2.6 is 500 or more

**Why it matters.** Return volume is the commercial test for a returns platform: at a high rate, approving every return by hand in the admin becomes a staffing cost. This number is what justifies — or rules out — the app licence in the final document.

Sources: https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Return rules and self-serve returns | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules |

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [AfterShip Returns & Exchanges](https://apps.shopify.com/returns-center-by-aftership), [Narvar Return and Exchange](https://apps.shopify.com/narvar-returns), [Redo](https://apps.shopify.com/redo)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.7** — How do customers send items back: prepaid label, QR code drop-off, their own shipment, or mixed? *(recommended · client)*
Drives: app signal Returns platform
Quick interview: ask if Q0.2.6 is 500 or more

**Why it matters.** Shopify buys return labels only for US fulfilment locations, and QR-code drop-off is not native at all. For a European or cross-border client, prepaid labels or QR drop-off mean a returns app — this question exists to detect that.

| Option | Pros | Cons |
|---|---|---|
| Customer arranges and pays for their own shipment | No label infrastructure needed; native returns are enough; no app licence. | Worse customer experience, more support contact, and no tracking of inbound parcels. |
| Prepaid label or QR drop-off | Expected by consumers, gives inbound tracking and lets refunds be triggered on carrier scan. | Outside US fulfilment locations this needs a returns app plus a carrier account, both recurring costs. |

**Limits.** Native return labels are limited to US fulfilment locations.

Sources: https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/return-labels

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Return labels | Basic | US fulfilment locations only | https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/return-labels |

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [AfterShip Returns & Exchanges](https://apps.shopify.com/returns-center-by-aftership)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.8** — Who pays return shipping: you, the customer, or it depends on the market? *(recommended · client)*

**Why it matters.** Who pays decides whether a return fee belongs in the rules and whether labels have to be bought at all. An answer of "it depends on the market" is the point where one native rule set stops being enough.

**Q5.2.9** — Which exchanges do you offer: same product in another variant, any other product, or store credit first? *(optional · client)*
Drives: app signal Returns platform
Quick interview: ask if Q0.2.6 is 500 or more

**Why it matters.** Customers cannot choose an exchange in Shopify's return form; staff add exchange items when approving. Variant swaps, any-product exchanges and store-credit-first flows are app features, so any answer other than "none" is an app signal.

Sources: https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Exchanges added by staff on return approval | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns |

If native is not enough: App Store — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [Redo](https://apps.shopify.com/redo)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.10** — Do you accept international returns (including refunding duties)? *(optional · client)*
Drives: app signal Returns platform
Quick interview: ask if Q3.1.1 has 2+ markets

**Why it matters.** Returns and duty refunds for international orders are handled natively, but the return label is not — Shopify buys those only for US fulfilment locations. Cross-border returns therefore usually add a returns app plus carrier paperwork.

**Limits.** Native return labels only for US fulfilment locations.

Sources: https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/return-labels

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Returns and duties refunds for international orders | Basic | Native return labels only for US locations | https://help.shopify.com/en/manual/fulfillment/fulfilling-orders/shipping-labels/buying-labels/return-labels |

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [AfterShip Returns & Exchanges](https://apps.shopify.com/returns-center-by-aftership)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.2.11** — Must returned items be inspected before the refund or exchange is issued? *(recommended · client)*

**Why it matters.** Inspection puts a manual step between the parcel arriving and the money moving. It sets the refund trigger, who performs the check, where the result is recorded, and how long the customer waits — process and staffing as much as system.

**Q5.2.12** — Do you need to capture and report return reasons? *(optional · client)*

**Why it matters.** Reason capture is what turns returns into merchandising and quality data. Ask where the reporting must live — the Shopify admin, a returns app or the client's BI stack — because that is what decides whether a platform is needed.

**Q5.2.13** — Should B2B customers request returns online (if you sell B2B)? *(optional · client)*

**Why it matters.** Shopify's return requests also work for B2B orders, so this is usually configuration rather than a build. It matters because B2B return approval and credit handling often sit in the ERP, and that part is integration work.

**Q5.2.14** — Do return windows or conditions differ by market or product (e.g. final-sale items)? *(optional · client)*

**Why it matters.** Final sale is native per product or collection. Windows or conditions that vary by market are where a single native rule set runs out and a returns platform enters scope. This is a deliberate detector question.

### 5.3 Notifications

**Q5.3.1** — Do order, shipping and delivery notifications need custom design or content? *(optional · client)*

**Why it matters.** Shopify's notification templates are editable and SMS shipping notifications are native. The answer decides whether this is template work in the admin, or a reason to send from the client's email platform instead.

**Q5.3.2** — Are notifications sent by Shopify, by the email platform, or both? *(optional · client)*

**Why it matters.** Who sends decides the integration and who owns the content after go-live. Splitting between Shopify and the email platform also creates the duplicate-message risk, so agree the split per notification, not in principle.

| Option | Pros | Cons |
|---|---|---|
| Shopify sends all transactional notifications | No integration, order data is always current, SMS shipping notifications included. | Template and design control is limited to what the notification editor allows, and reporting sits apart from the marketing stack. |
| The email platform sends them | One brand template set and one reporting view across marketing and transactional mail. | Needs order events pushed to the platform, Shopify templates switched off carefully, and deliverability owned elsewhere. |

### 5.4 Cancellations & refunds

**Q5.4.2** — Should customers be able to cancel orders themselves? *(recommended · client)*
Drives: app signal Order editing / cancellation app
Quick interview: ask if Q0.2.6 is 500 or more

**Why it matters.** Customers can request cancellation of an unshipped order in their account, but a merchant must approve each request. If the client expects the order to disappear immediately, that is an app, not configuration.

| Option | Pros | Cons |
|---|---|---|
| Native cancellation requests with approval | Included from Basic, keeps a human check before stock and money move. | Not instant; someone must action every request, which is support effort at volume. |
| Order editing / cancellation app | Instant self-service cancellation and edits, fewer support contacts. | Recurring licence, and it must be aligned with fulfilment cut-offs so cancelled orders are not already picked. |

**Limits.** Native cancellation requests always need merchant approval.

Sources: https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Cancellation requests and cancellation rules | Basic | Requests need merchant approval | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/return-rules |

If native is not enough: [Order editing](https://apps.shopify.com/categories/orders-and-shipping-orders-order-editing/all) — [Revize: Order Editing & Upsell](https://apps.shopify.com/revize), [OrderEditing.com](https://apps.shopify.com/order-editing), [Orderify ‑ Order Edit Cancel](https://apps.shopify.com/orderify)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.4.3** — Until when can an order be cancelled? *(recommended · client)*

**Why it matters.** The cut-off has to match how quickly fulfilment picks orders, which with a 3PL can be minutes. It decides the rule you set, what support does with late requests, and whether "cancel" really means "refuse delivery".

**Q5.4.4** — Do you allow partial cancellations (some items of an order)? *(optional · client)*

**Why it matters.** Cancelling part of an order touches the refund calculation, restocking and the message sent to the warehouse or 3PL. The answer tells you whether cancellation is one simple rule or a case-by-case admin process with integration behind it.

**Q5.4.5** — Should customers be able to edit an order after placing it (address, items)? *(recommended · client)*
Drives: app signal Order editing / cancellation app
Quick interview: ask if Q0.2.6 is 500 or more

**Why it matters.** Staff can edit orders natively; customers editing their own order after checkout cannot. A yes here means an order-editing app, so treat this as an app detector rather than a configuration question.

**Limits.** Native order editing is a staff action in the admin only.

Sources: https://help.shopify.com/en/manual/fulfillment/managing-orders/editing-orders

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Staff order editing | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/editing-orders |

If native is not enough: [Order editing](https://apps.shopify.com/categories/orders-and-shipping-orders-order-editing/all) — [Revize: Order Editing & Upsell](https://apps.shopify.com/revize), [OrderEditing.com](https://apps.shopify.com/order-editing), [Orderify ‑ Order Edit Cancel](https://apps.shopify.com/orderify)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.4.6** — How are refunds paid: to the original payment method, as store credit, or as a gift card? *(recommended · client)*

**Why it matters.** The refund method decides the finance trail: original payment method, store credit and gift cards each land differently in reconciliation and in the ERP feed. Store credit also changes what customer accounts must show.

**Q5.4.7** — When is a refund issued: on request, when the carrier scans the return, on receipt, or after inspection? *(recommended · client)*
Drives: app signal Returns platform
Quick interview: ask if Q0.2.6 is 500 or more

**Why it matters.** Refunding on request, on approval or on receipt is native. Refunding when the carrier scans the parcel needs a returns platform wired to carrier tracking — a clean single-answer app signal, and one clients ask for without knowing the cost.

| Option | Pros | Cons |
|---|---|---|
| Refund on approval or on receipt (native) | No app, and the money only moves once you hold the goods. | Customer waits for transit plus handling, which drives "where is my refund" contacts. |
| Refund on carrier scan | Fast refund, measurably better returns experience. | Needs a returns platform connected to carrier tracking, and the client carries the risk on parcels that never arrive. |

Sources: https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Refunds on return approval or receipt | Basic |  | https://help.shopify.com/en/manual/fulfillment/managing-orders/returns/self-serve-returns |

If native is not enough: [Returns and exchanges](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty-returns-and-exchanges/all) — [Loop Returns & Exchanges](https://apps.shopify.com/loop-returns), [Redo](https://apps.shopify.com/redo)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.4.8** — Is the original shipping cost refunded: always, only when you are at fault, or never? *(optional · client)*

**Why it matters.** Whether outbound shipping comes back changes the refund calculation on every single return and the wording of the policy. It is a common dispute, so pin down the "only when we are at fault" case explicitly rather than in principle.

**Q5.4.9** — Do you charge a restocking fee? *(optional · client)*

**Why it matters.** A restocking fee is a native return rule, expressed as a percentage of the return, so a yes costs configuration rather than development. It still needs checking against consumer law in each market the client sells to.

**Q5.4.10** — Do you issue partial refunds (e.g. damaged or missing parts)? *(optional · client)*

**Why it matters.** Partial refunds for damage or missing parts are a manual judgement call. The real question is who may issue one, up to what value, and how it reaches finance — permissions and process, not platform capability.

**Q5.4.11** — Must refunds be approved by someone before they are paid? *(recommended · client)*

**Why it matters.** An approval step decides who holds refund permissions, how long the customer waits, and whether a returns tool has to model an approval queue at all. It is also the first control the client's finance team will ask about.

**Q5.4.12** — Must cancellations and refunds be passed to your ERP or finance system? *(recommended · client)*

**Why it matters.** Cancellations and refunds are the hardest events to keep consistent between Shopify and finance, because money has already moved. A yes adds integration work, failure handling and reconciliation testing — not just one more webhook.

**Q5.4.13** — Must cancellations be instant, without your approval? *(optional · client)*
Drives: app signal Order editing / cancellation app
Quick interview: ask if Q5.4.2 is yes

**Why it matters.** This question exists purely to detect an app. Shopify's cancellation requests always need merchant approval, so "instant, no approval" cannot be delivered by configuration — it needs an order editing and cancellation app.

**Limits.** Native cancellation requests need merchant approval; there is no native instant self-cancellation.

If native is not enough: [Order editing](https://apps.shopify.com/categories/orders-and-shipping-orders-order-editing/all) — [Revize: Order Editing & Upsell](https://apps.shopify.com/revize), [OrderEditing.com](https://apps.shopify.com/order-editing), [Orderify ‑ Order Edit Cancel](https://apps.shopify.com/orderify)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 5.5 Post-purchase experience

**Q5.5.1** — Do you want a branded order-tracking page on your own site? *(recommended · client)*
Drives: app signal Post-purchase tracking platform
Quick interview: ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise

**Why it matters.** Shopify gives an order status page and shipping notifications, not a branded tracking page on the client's own site. A yes is the main trigger for a post-purchase tracking app, so establish what "branded" actually has to include.

| Option | Pros | Cons |
|---|---|---|
| Native order status page and shipping emails | Included, no app, always in step with the order. | Limited branding, no carrier-event alerts, and traffic that a tracking page would capture goes to the carrier's site. |
| Post-purchase tracking app | Branded tracking on your domain, proactive delay alerts, a merchandising surface after purchase. | Recurring licence, another vendor holding order and address data, and theme work to embed it. |

Sources: https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Order status page and shipping notifications | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview |

If native is not enough: [Order tracking](https://apps.shopify.com/categories/orders-and-shipping-orders-order-tracking/all) — [AfterShip Order Tracking](https://apps.shopify.com/aftership), [parcelLab Order Tracking](https://apps.shopify.com/parcellab-engage)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.5.2** — On which channels should customers get proactive delivery updates (delays, out for delivery)? *(recommended · client)*
Drives: app signal Post-purchase tracking platform
Quick interview: ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise

**Why it matters.** Email and SMS shipping notifications are native. Proactive delay and out-for-delivery alerts come from a platform reading carrier events, so the channel list here is what decides whether a tracking app is in the recommendation.

Sources: https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Email and SMS shipping notifications | Basic |  | https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview |

If native is not enough: [Order tracking](https://apps.shopify.com/categories/orders-and-shipping-orders-order-tracking/all) — [AfterShip Order Tracking](https://apps.shopify.com/aftership), [parcelLab Order Tracking](https://apps.shopify.com/parcellab-engage)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.5.3** — Should product pages or checkout show estimated delivery dates? *(optional · client)*
Drives: app signal Post-purchase tracking platform
Quick interview: ask if Q0.2.6 is 500 or more, or Q1.3.1 is Premium, Luxury or Enterprise

**Why it matters.** Shopify can show delivery dates at checkout: manual dates anywhere, automatic dates only for US fulfilment locations. Outside the US, automatic estimates or dates on product pages need an app — a documented limit that decides this line item.

| Option | Pros | Cons |
|---|---|---|
| Manual delivery dates at checkout | Native, free, available wherever the client fulfils from. | Static promises someone must maintain; no product-page estimate; no adjustment for real carrier performance. |
| Delivery estimate app | Estimates on product pages and checkout outside the US, tuned per product and destination. | Licence cost, theme integration, and the estimate is only as good as the data the client feeds it. |

**Limits.** Automatic delivery dates are limited to US fulfilment locations; elsewhere dates at checkout are set manually.

Sources: https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Delivery dates at checkout | Basic | Automatic dates: US fulfilment locations only | https://help.shopify.com/en/manual/fulfillment/setup/delivery-expectations/overview |

If native is not enough: [Delivery and pickup](https://apps.shopify.com/categories/orders-and-shipping-shipping-solutions-delivery-and-pickup/all) — [Estimated Delivery Date ‑ ETA](https://apps.shopify.com/estimated-delivery-days), [Essent Estimated Delivery Date](https://apps.shopify.com/essential-estimated-delivery)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.5.4** — Do customers need to open warranty, repair or servicing claims online? *(recommended · client)*
Drives: app signal Warranty claims solution
Quick interview: ask if Q1.1.3 mentions watch, jewel, electronic, appliance, furniture, bike, bicycle, tool, device or luxury

**Why it matters.** Warranty, repair and servicing claims have no native Shopify flow. A yes means an app or a custom build plus an operational process behind it, so scope it as its own item rather than folding it into returns.

Sources: https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty

If native is not enough: [Returns and warranty](https://apps.shopify.com/categories/orders-and-shipping-returns-and-warranty) — [Extend Shopper Operations](https://apps.shopify.com/extend-protection), [Clyde | Warranty Platform](https://apps.shopify.com/clyde-warranty-platform), [Route ‑ Protection & Tracking](https://apps.shopify.com/route)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 5.6 Retail & POS

**Q5.6.1** — How many physical retail stores (including pop-ups) will sell with Shopify? *(required · client)*
Drives: gate Retail & POS · rule 11.22 (WARN)

**Why it matters.** Store count turns on the Retail and POS scope modifier and sizes the roll-out. More than five stores is quoted as a programme delivered in increments, or as a rate-carded run team — not as one project with one go-live.

Sources: https://help.shopify.com/en/manual/sell-in-person/getting-started/identify-your-pos-needs

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify POS | Basic |  | https://help.shopify.com/en/manual/sell-in-person/getting-started/identify-your-pos-needs |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.6.2** — Point of sale at launch? *(required · client)*
Drives: gate Retail & POS

**Why it matters.** Shopify POS and a third-party POS integrated to Shopify are very different builds: one is configuration, hardware and training; the other is an inventory, order and payment integration. This answer sets the whole retail workstream.

| Option | Pros | Cons |
|---|---|---|
| Shopify POS | One product catalogue, one inventory and one customer record across online and store; omnichannel services available natively. | Hardware, staff retraining and a POS Pro subscription per location for the omnichannel services. |
| Existing third-party POS integrated to Shopify | No change for store staff, keeps the incumbent retail contract and back-office reporting. | Inventory and order sync to build and monitor; native omnichannel services such as ship from store do not apply. |

Sources: https://help.shopify.com/en/manual/sell-in-person/shopify-pos/faq

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify POS | Basic |  | https://help.shopify.com/en/manual/sell-in-person/shopify-pos/faq |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.6.3** — Which omnichannel services are needed in store? *(required · client)*
Drives: gate Retail & POS

**Why it matters.** The in-store services listed here come with POS Pro, which is a subscription per location — a recurring cost the client carries, not a one-off build. Retail market catalogs need POS Pro or Plus. Flag both before the price is agreed.

**Limits.** POS Pro is charged per location; retail market catalogs require POS Pro or Plus.

Sources: https://help.shopify.com/en/manual/sell-in-person/getting-started/identify-your-pos-needs

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| POS Pro (omnichannel services per location) | Basic | POS Pro subscription per location; retail market catalogs need POS Pro or Plus | https://help.shopify.com/en/manual/sell-in-person/getting-started/identify-your-pos-needs |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q5.6.4** — In which countries are the stores? *(recommended · client)*

**Why it matters.** Store countries decide the payment, tax and hardware set-up each store needs and whether retail sits inside an existing market. Confirm them: POS hardware and retail payment availability are country-specific and must be checked per country.

---

## § 6 — Customers, B2B & privacy

### 6.1 Customer accounts

**Q6.1.1** — Is guest checkout the default, are accounts optional, or is registration required? *(recommended · client)*

**Why it matters.** This sets the login model for the whole storefront: whether a shopper can buy without an account. It also meets B2B — a B2B buyer must sign in with a customer account and be attached to a company location before contracted pricing applies.

| Option | Pros | Cons |
|---|---|---|
| Guest checkout is the default | Fewest steps to a first order; nothing to migrate on day one. | No account area, so order history, buy again, returns and store credit have nowhere to live. |
| Accounts optional | Guests still convert, and registered customers get the native account area (order history, buy again, returns, store credit). | Two journeys to design, test and support; account adoption has to be earned. |
| Registration required | Every order is attached to a customer record — which is how B2B has to work anyway. | A barrier in front of the first retail purchase. |

**Q6.1.3** — What should the account area include (order history, addresses, returns, wishlist, subscriptions)? *(required · client)*
Drives: app signal Wishlist

**Why it matters.** Order history, buy again, returns and store credit are native in customer accounts on every plan from Basic. Wishlists are not — they need an app. Anything beyond the native list is built as customer account UI extensions, so list the wanted features precisely.

**Limits.** Wishlist is an app decision: a vendor, a monthly cost and storefront integration, not a setting.

Sources: https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features · https://apps.shopify.com/categories/marketing-and-conversion-customer-loyalty-wishlists/all

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer accounts (order history, buy again, returns, store credit) | Basic |  | https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features |

If native is not enough: [Wishlists](https://apps.shopify.com/categories/marketing-and-conversion-customer-loyalty-wishlists/all) — [Swym Wishlist Plus](https://apps.shopify.com/swym-relay), [Swish (formerly Wishlist King)](https://apps.shopify.com/wishlist-king)
Build with: Customer account UI extensions
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.1.4** — How should customers sign in? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** Shopify's current customer accounts sign in with a one-time email code, plus Google or Facebook — no password. Signing in from another site uses Multipass, which is Plus and is not compatible with the Customer Account API a headless storefront uses.

**Limits.** Legacy customer accounts (password-based) are the older generation: B2B does not support them, and headless customer accounts require the auth code to be moved off them.

Sources: https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features · https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer accounts sign-in (one-time code, social) | Basic |  | https://help.shopify.com/en/manual/customers/customer-accounts/upgrade/compare-features |
| Multipass (sign in from another site) | Shopify Plus | Not compatible with the Customer Account API used by headless | https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 6.2 B2B & wholesale

**Q6.2.2** — Do B2B customers need company accounts with their own login? *(required · client)*
Drives: gate B2B / Wholesale

**Why it matters.** This turns on Shopify's B2B model: companies, company locations, and buyers who sign in with customer accounts. It opens the B2B scope gate — and note that most of B2B runs on every plan from Basic, not only Plus.

**Limits.** A B2B order must be placed by a buyer associated with a company location; without that association D2C rates apply. Legacy customer accounts are not supported, so customer accounts must be activated first.

Sources: https://help.shopify.com/en/manual/b2b/getting-started/plan-features · https://help.shopify.com/en/manual/b2b/getting-started/blended-store-checklist

**Q6.2.3** — Do B2B customers get company-specific price lists? *(required · client)*
Drives: gate B2B / Wholesale · rule 11.1 (STOP)

**Why it matters.** B2B price lists are catalogs. Below Plus you get up to three active catalogs and none can be assigned directly to a named company — company-specific pricing is the single most common reason a B2B project needs Plus. Confirm which they mean.

**Limits.** B2B catalogs on Basic, Grow and Advanced require the store to be on new Shopify Markets. Even on Plus, a company location can hold at most 25 catalogs.

Sources: https://help.shopify.com/en/manual/b2b/getting-started/plan-features

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B catalogs | Basic | Up to 3 active catalogs below Plus | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| Company-specific catalogs | Shopify Plus |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.4** — Are there B2B volume discounts or quantity rules? *(required · client)*
Drives: gate B2B / Wholesale

**Why it matters.** Quantity price breaks and quantity rules are native B2B on every plan from Basic, so a wholesale pricing ladder rarely needs an app. The answer also trips the B2B scope gate, which is what sizes the engagement.

Sources: https://help.shopify.com/en/manual/b2b/getting-started/features

**Q6.2.5** — Which payment terms are needed (net 30, invoice, purchase order)? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** Net terms (Net 7 to Net 90), PO numbers, vaulted cards and draft orders are native from Basic. Deposits, partial payments and payment requests per fulfilment are Plus. One answer here can force a plan upgrade, so pin down exactly which terms.

**Limits.** B2B checkout does not support accelerated checkouts — Shop Pay, Apple Pay, Google Pay, Amazon Pay.

Sources: https://help.shopify.com/en/manual/b2b/getting-started/plan-features · https://help.shopify.com/en/manual/b2b/considerations

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B payment terms, vaulted cards, draft orders | Basic |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| Deposits, partial payments, payment requests per fulfilment | Shopify Plus |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.6** — Is there a request-for-quote workflow, or is pricing negotiated per buyer? *(required · client)*
Drives: rule 11.2 (FLAG) · app signal B2B quotes

**Why it matters.** Shopify has no built-in request-for-quote. Natively the nearest thing is requiring B2B orders to be placed as drafts, reviewed and edited by staff before confirmation. Anything resembling real negotiation needs a quote app — either way this flags a B2B architecture review.

| Option | Pros | Cons |
|---|---|---|
| Native draft-order review | No extra vendor; works from Basic; can be required per company location and keeps one source of pricing truth. | It is a review-and-edit step, not a quote document with a negotiation trail. |
| A quote app (App Store category "Pricing quotes") | Covers quote request, negotiation and quote-to-order as a product feature. | Adds a vendor dependency and a second source of pricing truth; the capability is not documented by Shopify and must be evidenced per app. |

Sources: https://help.shopify.com/en/manual/b2b/checkout-and-orders/checkout-settings · https://apps.shopify.com/categories/selling-products-pricing-pricing-quotes/all

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Orders submitted for review as drafts | Basic |  | https://help.shopify.com/en/manual/b2b/checkout-and-orders/checkout-settings |

If native is not enough: [Pricing quotes](https://apps.shopify.com/categories/selling-products-pricing-pricing-quotes/all) — [QS Request a Quote, Hide Price](https://apps.shopify.com/request-for-quote-by-omega), [SparkLayer B2B & Wholesale](https://apps.shopify.com/sparklayer)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.7** — Must B2B accounts be approved before they can order? *(optional · client)*

**Why it matters.** B2B access is granted by the merchant: a buyer only becomes a B2B buyer once staff attach them to a company location. Natively, a company account request form (free Shopify Forms app) collects applications and Shopify Flow automates the approval steps.

**Limits.** Inside a company location there are two permission levels: ordering only (own orders), and location admin (all orders at the location, plus address updates).

Sources: https://help.shopify.com/en/manual/shopify-flow · https://help.shopify.com/en/manual/b2b/getting-started/blended-store-checklist

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Forms and Shopify Flow for company approval | Basic |  | https://help.shopify.com/en/manual/shopify-flow |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.8** — Native Shopify B2B or an app? *(recommended · consultant)*

**Why it matters.** The architecture fork for B2B. Shopify publishes no comparison of the three routes, so decide it against two things we can evidence: the documented gaps in native B2B, and the plan the catalog model actually needs.

| Option | Pros | Cons |
|---|---|---|
| Native Shopify B2B | One product and inventory source; companies, locations, net terms, PO numbers and price breaks on all plans; no third-party data processor. | Documented gaps: no accelerated checkout, subscriptions, local delivery, pickup points or tipping; several features off by default; catalogs capped at three below Plus. |
| A separate wholesale store | Full separation of catalogue, theme and checkout; on Plus it can be an expansion store on the same contract. | Two stores to build and run; stores in an organisation do not share data by default, and expansion stores are a Plus contract feature. |
| A B2B app | Can cover documented gaps — for example payment-method restriction, which Shopify points to apps or the Payment Customization Function API for. | Vendor dependency and a second source of pricing truth; app capability is not documented by Shopify and must be evidenced per app. |

Sources: https://help.shopify.com/en/manual/b2b/getting-started/plan-features · https://help.shopify.com/en/manual/b2b/considerations

**Q6.2.9** — How many B2B accounts are expected within 12 months? *(optional · client)*

**Why it matters.** Volume sets the effort: how many companies and locations have to be created, imported and kept in step with the client's systems, and how many distinct price lists the model really needs — which is where the three-catalog limit below Plus starts to bite.

**Limits.** A company can have up to 10,000 company locations; each company location can have at most 25 catalogs assigned.

Sources: https://help.shopify.com/en/manual/b2b/companies-and-customers/creating-companies

**Q6.2.10** — How many distinct B2B price lists (catalogs) do you need, and must any be specific to one company? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** The clearest plan test in B2B. Below Plus you get up to three active catalogs across all B2B markets, and none can be assigned directly to a company or location. More than three, or company-specific pricing, means Plus.

**Limits.** On Basic, Grow and Advanced the store must be on new Shopify Markets to use B2B catalogs at all.

Sources: https://help.shopify.com/en/manual/b2b/getting-started/plan-features

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B catalogs | Basic | Up to 3 active catalogs below Plus | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
| Unlimited and company-specific catalogs | Shopify Plus |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.11** — Should B2B buyers see a different storefront or checkout from consumers? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** A B2B-specific storefront and checkout is delivered through Markets, and customising the theme per market starts at Advanced. If buyers must see a different site from consumers, the plan floor moves up — establish that before quoting Basic or Grow.

Sources: https://help.shopify.com/en/manual/b2b/getting-started/plan-features · https://help.shopify.com/en/manual/online-store/themes/customizing-themes-for-markets

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Contextual B2B storefront and checkout (Markets) | Advanced |  | https://help.shopify.com/en/manual/b2b/getting-started/plan-features |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.12** — Do B2B orders need any of these: subscriptions, local delivery or pickup points, express checkouts, more than 500 line items, gift cards? *(required · consultant)*
Drives: rule 11.19 (FLAG)

**Why it matters.** The list of things Shopify B2B does not do at all: accelerated checkouts, subscriptions, local delivery, pickup points, tipping, and orders above 500 line items. A yes here is a flagged architecture review or a process change, never a configuration task.

**Limits.** Pickup in store, gift cards at checkout, line item scripts and abandoned checkouts are turned off by default for B2B and must be requested from Shopify Support by the store or organisation owner.

Sources: https://help.shopify.com/en/manual/b2b/getting-started/considerations

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B considerations (unsupported features) | Basic |  | https://help.shopify.com/en/manual/b2b/getting-started/considerations |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.13** — Which shipping rules differ for B2B buyers? *(recommended · client)*

**Why it matters.** By default B2B buyers see the same shipping methods as consumers. Different options need Checkout Blocks, an app or a delivery customisation function — and a function inside a custom app needs Plus, while a public app containing one works on any plan.

**Limits.** Local delivery and pickup points are not supported in B2B. Where shipping must be quoted per order, B2B orders can be submitted as drafts and priced before payment.

Sources: https://help.shopify.com/en/manual/b2b/checkout-and-orders/shipping-methods · https://shopify.dev/docs/apps/build/functions

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B shipping methods (same as consumers by default; customise per buyer) | Basic | Custom apps with Shopify Functions need Plus; public apps with functions work on any plan | https://help.shopify.com/en/manual/b2b/checkout-and-orders/shipping-methods |
| Submit B2B orders as drafts for review | Basic |  | https://help.shopify.com/en/manual/b2b/checkout-and-orders/checkout-settings |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.2.14** — Is the wholesale side of the business run by its own team, with its own targets or its own profit and loss? *(recommended · client)*
Quick interview: ask if Q1.1.4 is Business to business (B2B), or Q1.1.4 is Hybrid (DTC and B2B)
Who holds this fact: Sales director, wholesale lead or the head of ecommerce.

**What a usable answer looks like.** A clear yes or no about the organisation. The follow-up that sharpens it: "who decides wholesale prices and campaigns, and do they report to the same person as ecommerce?"

**If they do not know.** Assumed false: wholesale is run by the same team as the consumer business, which keeps it on the same store. Assumption recorded: One team runs both sides. Confidence: medium. To resolve: One question to the commercial lead about who owns the wholesale number.

**Why it matters.** Native B2B runs on the same store as the consumer business, which is the cheaper answer whenever one team runs both. A separate wholesale team with its own P&L is the documented reason Shopify gives for an expansion store, so this answer is one of the criteria that moves the topology to a hybrid.

**Limits.** An expansion store needs Shopify Plus, and nothing is shared between stores — products, inventory, apps and themes are all maintained twice. Weigh it against keeping B2B on one store with its own catalogs.

Sources: https://help.shopify.com/en/manual/organization-settings/expansion-stores · https://help.shopify.com/en/manual/b2b/getting-started/plan-features

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| B2B on one store: companies, locations and catalogs | Basic |  | https://help.shopify.com/en/manual/b2b |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 6.3 Loyalty & segmentation

**Q6.3.1** — Which loyalty components are planned? *(recommended · client)*
Drives: app signal Loyalty programme
Quick interview: ask if Q1.1.4 is Direct to consumer (DTC) or Hybrid (DTC and B2B)

**Why it matters.** Shopify has no native points programme, so loyalty means an app. What is native is store credit, which can serve as the reward currency and shows in the customer account. Naming the components now sizes the app choice and its integration work.

Sources: https://help.shopify.com/en/manual/customers/store-credit · https://apps.shopify.com/categories/marketing-and-conversion-customer-loyalty-loyalty-and-rewards/all

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Store credit | Basic |  | https://help.shopify.com/en/manual/customers/store-credit |

If native is not enough: [Loyalty and rewards](https://apps.shopify.com/categories/marketing-and-conversion-customer-loyalty-loyalty-and-rewards/all) — [Smile: Loyalty Program Rewards](https://apps.shopify.com/smile-io), [LoyaltyLion Loyalty Program](https://apps.shopify.com/loyaltylion), [Yotpo: Loyalty Rewards Program](https://apps.shopify.com/swell), [Rivo: Loyalty Program, Rewards](https://apps.shopify.com/rivo-loyalty)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.3.2** — Is loyalty needed at launch or in a later phase? *(recommended · client)*

**Why it matters.** Loyalty is an app plus integration and storefront work, not a toggle, so it belongs to a phase. Deciding launch or later stops it being quietly assumed into the first release and keeps the launch scope honest.

**Limits.** Store credit is native and can go live at launch even when the points programme comes later.

**Q6.3.3** — Which loyalty app is used or preferred? *(optional · client)*

**Why it matters.** If a loyalty app is already running, the job is migrating balances, tiers and history rather than selecting a vendor. If they only have a preference, it fixes the integration surface early. If neither, we shortlist from the App Store loyalty category.

**Q6.3.4** — Must loyalty status sync to the email platform or CRM? *(optional · client)*

**Why it matters.** Loyalty status living in the app while campaigns live in the email platform or CRM means a sync to build, monitor and keep correct. It is integration scope with its own failure modes, and it is where loyalty work usually overruns.

**Q6.3.5** — Which customer segments do you use today? *(optional · client)*

**Why it matters.** Today's segments show what customer data must arrive in Shopify and stay accurate. Shopify has native customer segments, so the list tells us what can be rebuilt natively and what depends on data another system holds.

**Q6.3.6** — Where is segmentation driven from — Shopify, the email platform, a CDP, or a mix? *(optional · client)*

**Why it matters.** Segments can live natively in Shopify, in the email platform, or in a CDP. Where they live decides who owns the definitions, which system triggers campaigns, and which way customer data has to flow — and a mix means reconciling both.

| Option | Pros | Cons |
|---|---|---|
| Shopify | Native customer segments, no extra licence; they sit next to the order and customer data that define them. | Any tool outside Shopify that needs the segment has to be fed by an integration. |
| The email platform or a CDP | One definition across channels wider than the store, in a tool the client may already run. | Shopify-side logic that keys off segments or tags — pricing, access, discounts — then has to be driven from outside. |
| A mix | Each system keeps the segments it is genuinely best placed to own. | Two sources of truth; the boundary has to be written down in the build, or it drifts. |

**Q6.3.7** — Which customer tags drive custom logic today (pricing, access, discounts)? *(optional · client)*

**Why it matters.** Customer tags are usually load-bearing on the old platform — gating access, pricing or discounts. They have to be migrated and re-implemented here, and some of what tags did there is a B2B catalog or a customer segment in Shopify.

### 6.4 Privacy & consent

**Q6.4.1** — Which privacy laws apply to your customers (GDPR, UK GDPR, CCPA, Swiss nFADP, other)? *(required · client)*

**Why it matters.** The regimes set the compliance baseline for everything else in this section: consent before tracking, opt-out pages, how data-subject requests are handled, and what legal must sign off. Ask it before the consent and data questions, not after.

**Q6.4.2** — Cookie consent: Shopify's cookie banner or a consent management platform? Name the tool if known. *(recommended · client)*
Drives: app signal Consent management platform · gate Analytics and consent
Quick interview: ask if Q6.4.1 includes GDPR (EU), UK GDPR, Swiss nFADP or CCPA (US)

**Why it matters.** Whichever banner is used, the consent decision must reach Shopify through the Customer Privacy API — otherwise Shopify's own tracking and the installed apps never learn it. Shopify's native cookie banner does that already; a third-party platform has to be integrated.

| Option | Pros | Cons |
|---|---|---|
| Shopify's native cookie banner | Native from Basic in the customer privacy settings, no licence, already wired into Shopify's consent handling. | It covers this store only — no help if the client runs a group-wide consent record across other sites. |
| A consent management platform | One consent approach across the client's whole estate, often already contracted and owned by their legal team. | It must integrate Shopify's Customer Privacy API — real delivery work and a testable requirement, plus the licence. |

Sources: https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/privacy-settings · https://apps.shopify.com/categories/store-design-internationalization-cookie-consent/all

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Cookie banner (customer privacy settings) | Basic |  | https://help.shopify.com/en/manual/privacy-and-security/privacy/customer-privacy-settings/privacy-settings |

If native is not enough: [Cookie consent](https://apps.shopify.com/categories/store-design-internationalization-cookie-consent/all) — [Pandectes GDPR Compliance](https://apps.shopify.com/gdpr-cookie-consent), [Consentmo GDPR Compliance](https://apps.shopify.com/gdpr-backpack), [Cookiebot CMP](https://apps.shopify.com/cookiebot-cmp-gdpr-compliance)
Build with: Customer Privacy API
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.4.3** — Is explicit opt-in required for marketing emails? *(recommended · client)*

**Why it matters.** Explicit opt-in changes the sign-up forms, the checkout consent box and what the email platform may send. Get the answer in writing: it decides which of the collected addresses can actually be marketed to, at launch and after a migration.

**Q6.4.4** — Do you collect sensitive personal data (health, age, biometric, financial)? *(required · client)*
Drives: rule 11.17 (FLAG)

**Why it matters.** Special-category data (health, age, biometric, financial) raises the bar: a data protection impact assessment and legal sign-off on minimisation, storage location and consent before build. It is flagged early because it can reshape the data model and the timeline.

**Q6.4.5** — Must data-access or deletion requests reach systems beyond Shopify (ERP, email platform) or run without staff involvement? *(required · client)*
Drives: rule 11.10 (FLAG)

**Why it matters.** Shopify handles customer data export and erasure requests inside the admin. The moment a request must also reach the ERP, email platform or warehouse, or run without a person, it becomes a delivery workstream with legal sign-off — not a Shopify setting.

**Limits.** Every connected system that holds customer data widens the request: each one needs an owner, a route and evidence that it was done.

Sources: https://help.shopify.com/en/manual/privacy-and-security/privacy/processing-customer-data-requests

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer data requests and erasure | Basic |  | https://help.shopify.com/en/manual/privacy-and-security/privacy/processing-customer-data-requests |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q6.4.6** — Do US state privacy laws require a 'Do not sell or share my personal information' page? *(optional · client)*

**Why it matters.** US state privacy laws can require a "Do not sell or share my personal information" page. Shopify's native opt-out page honours Global Privacy Control signals, so this is usually configuration rather than build — but it must be asked, decided and evidenced.

**Q6.4.7** — Where do you collect marketing consent? *(optional · client)*
Drives: gate Analytics and consent

**Why it matters.** Every point where consent is captured — newsletter form, checkout, account creation, pop-up, in store — is a point where the record must be created and carried. The list shows which integrations must write consent back, and where an audit would find gaps.

---

## § 7 — Marketing & promotions

### 7.1 SEO

**Q7.1.1** — Is organic search a significant traffic channel? *(recommended · client)*
Drives: gate SEO continuity

**Why it matters.** If organic traffic carries the business, URL structure, redirects, metadata and page speed become build tasks with a budget rather than good intentions. If search is a minor channel, that effort is better spent elsewhere.

**Q7.1.2** — Are custom URL structures needed? *(optional · client)*
Drives: gate SEO continuity

**Why it matters.** Tell us early if the brand depends on a particular URL pattern. What a platform can and cannot change has to be checked against the documentation before the content plan assumes it, and it sizes the redirect work on migration.

**Q7.1.3** — Who manages SEO? *(optional · client)*

**Why it matters.** SEO work does not stop at launch: redirects, metadata, structured data and content keep changing. This answer decides who holds that job and therefore whether we hand over an editable setup or carry the work ourselves.

| Option | Pros | Cons |
|---|---|---|
| Client or their SEO agency owns it | Keeps specialist knowledge with the people who own the traffic targets; no ongoing cost in our scope | The theme and the admin must be genuinely editable by a non-developer, and the handover and training become real deliverables |
| We own it as part of delivery | One team accountable for the migration, the redirect map and the recovery of rankings | Adds retained effort after launch, and someone on the client side still has to approve content and priorities |

**Q7.1.4** — Should products be discoverable in AI shopping assistants? *(optional · client)*

**Why it matters.** Shopify enrols eligible stores in agentic storefront channels by default, so doing nothing already answers this. The question confirms or reverses a channel that may be live now. Section 7.7 takes the decision apart in detail.

**Limits.** Eligibility is Shopify's: Starter plan or higher, store not in private mode, products with a title, an image, a price above zero and a published product URL. Business-only products are excluded automatically.

Sources: https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-home · https://help.shopify.com/en/manual/shopify-catalog/requirements

### 7.2 Analytics & tracking

**Q7.2.1** — Which analytics platforms do you use (GA4, Adobe, other)? *(recommended · client)*
Drives: gate Analytics and consent

**Why it matters.** Every analytics platform on Shopify is wired through the same event layer, but each needs its own setup, consent handling and test pass. The list sizes that work and tells us which numbers the client will judge the launch by.

**Q7.2.2** — Is server-side tracking needed? *(recommended · client)*
Drives: app signal Server-side tracking beyond Shopify · gate Analytics and consent
Quick interview: ask if Q0.2.6 is 500 or more, or Q0.1.1 mentions conversion, tracking, attribution, advert, ads, roas or acquisition

**Why it matters.** Shopify's customer events cover storefront and checkout with consent, and the Facebook & Instagram and Google & YouTube apps already send events server-side. Anything beyond that needs a tracking app or build work, and sharing customer data with ad platforms triggers the PII gate.

| Option | Pros | Cons |
|---|---|---|
| Stay with Shopify's customer events and the Meta and Google channel apps | No extra licence, no extra integration, consent handled by the platform | Limited to what those apps send; other ad or analytics destinations get browser-side data only |
| Add a server-side tracking app or a custom endpoint | Better event delivery and matching for platforms Shopify's own apps do not cover | Licence cost plus build and maintenance, and customer data leaving the store needs an explicit consent and PII decision |

**Limits.** Native server-side sending is documented for the Facebook & Instagram and Google & YouTube apps; anything else is an app or a build item.

Sources: https://help.shopify.com/en/manual/promoting-marketing/pixels/overview

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer events (web pixels); Facebook & Instagram and Google & YouTube apps | Basic |  | https://help.shopify.com/en/manual/promoting-marketing/pixels/overview |

If native is not enough: App Store — [Elevar Conversion Tracking](https://apps.shopify.com/gtm-datalayer-by-elevar), [Littledata ‑ The Data Layer](https://apps.shopify.com/littledata)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.2.3** — Which advertising pixels are needed (Meta, TikTok, Pinterest, Google Ads)? *(recommended · client)*
Drives: gate Analytics and consent

**Why it matters.** Each advertising pixel is a separate install, a separate consent case and a separate test. The list decides how much tracking work the build carries and which conversion numbers marketing will reconcile after launch.

**Q7.2.4** — Is a tag manager already configured? *(recommended · client)*
Drives: gate Analytics and consent

**Why it matters.** This matters more on Shopify than elsewhere: a tag manager runs as a custom pixel inside Shopify's sandbox, and scripts in checkout are no longer possible. An existing container has to be rebuilt to that model, not pasted across.

**Q7.2.5** — Which custom events must be tracked beyond standard ecommerce events? *(recommended · client)*
Drives: gate Analytics and consent

**Why it matters.** Standard storefront and checkout events come from Shopify's customer events. Anything else — configurator steps, wishlist adds, quiz completions, store locator use — is code someone writes and tests in a pixel. Listing them now puts a price on them.

### 7.3 Email & CRM

**Q7.3.1** — Which email / CRM platform do you use or plan to use: Shopify Messaging or another platform (name)? *(recommended · client)*

**Why it matters.** Shopify Messaging covers email, SMS and WhatsApp campaigns and automations natively. A third-party platform has to earn its licence through segmentation, deeper flows and data that lives outside Shopify. This answer sets the integration work and the customer-data path.

| Option | Pros | Cons |
|---|---|---|
| Shopify Messaging | Native, no integration to build, customer data stays in Shopify, one place for email, SMS and WhatsApp | Less sophisticated segmentation and flow logic than a dedicated platform; less useful if the CRM already lives elsewhere |
| A third-party email/CRM platform | Richer segmentation, lifecycle flows and reporting; fits a brand whose customer data spans more than the store | Licence cost, an integration to build and keep working, and customer data leaving Shopify — a PII decision, not just a technical one |

Sources: https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Messaging | Basic |  | https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging |

If native is not enough: [Email marketing](https://apps.shopify.com/categories/marketing-and-conversion-marketing-email-marketing) — [Klaviyo: Email Marketing & SMS](https://apps.shopify.com/klaviyo-email-marketing), [Omnisend Email Marketing & SMS](https://apps.shopify.com/omnisend)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.3.2** — Which automated flows are needed (welcome, abandoned cart, post-purchase, win-back)? *(recommended · client)*

**Why it matters.** Lifecycle flows are where recovered revenue comes from — abandoned cart above all. Each flow needs trigger data, content and a test pass, so the list sizes the marketing build and tells tracking which events it must actually produce.

**Q7.3.4** — Do you send SMS marketing, and to which countries? *(recommended · client)*
Drives: app signal SMS marketing outside Shopify Messaging countries
Quick interview: ask if Q0.2.6 is 500 or more, or Q0.4.1 mentions sms, retention or repeat

**Why it matters.** Shopify Messaging sends SMS only in a documented list of countries. Marketing by SMS outside that list means a third-party app, plus its own consent capture, sender registration and country rules — cost and legal work, not a switch.

| Option | Pros | Cons |
|---|---|---|
| Shopify Messaging SMS | Native, no extra app, same place as email and WhatsApp campaigns | Only the documented countries, so a multi-market brand can outgrow it mid-project |
| A third-party SMS app | Covers countries Shopify Messaging does not, usually with deeper automation | Licence and per-message cost, an integration, and consent data held outside Shopify |

**Limits.** Shopify Messaging SMS is documented for AT, CA, DK, FI, IT, LU, PL, PT, SE, UK and US; Spain has been paused since 15 September 2026.

Sources: https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/sms/requirements

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Messaging SMS | Basic | AT, CA, DK, FI, IT, LU, PL, PT, SE, UK, US; Spain paused since 2026-09-15 | https://help.shopify.com/en/manual/promoting-marketing/create-marketing/shopify-messaging/sms/requirements |

If native is not enough: [SMS marketing](https://apps.shopify.com/categories/marketing-and-conversion-marketing-sms-marketing/all) — [Klaviyo: Email Marketing & SMS](https://apps.shopify.com/klaviyo-email-marketing), [Attentive](https://apps.shopify.com/attentive), [Postscript SMS Marketing](https://apps.shopify.com/postscript-sms-marketing)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.3.5** — Do you send WhatsApp marketing? *(optional · client)*

**Why it matters.** WhatsApp marketing is native in Shopify Messaging, so a yes may cost no extra tool — but it still needs opt-in capture, message templates and someone to run the channel. A no keeps it out of scope and out of the estimate.

### 7.4 Reviews & affiliates

**Q7.4.1** — Which product reviews app is used or preferred? *(optional · client)*
Drives: app signal Product reviews
Quick interview: ask if Q1.2.1 is yes, or Q0.5.4 is not None

**Why it matters.** Product reviews are not native on Shopify; they need an app. The choice decides where review content lives, how it is migrated from the current provider, how the theme renders stars and how much the licence costs each month.

Sources: https://apps.shopify.com/categories/marketing-and-conversion-social-trust-product-reviews/all

If native is not enough: [Product reviews](https://apps.shopify.com/categories/marketing-and-conversion-social-trust-product-reviews/all) — [Judge.me Product Reviews App](https://apps.shopify.com/judgeme), [Yotpo: Product Reviews App](https://apps.shopify.com/yotpo-social-reviews), [Okendo: Reviews & Loyalty](https://apps.shopify.com/okendo-reviews), [Stamped Reviews & Loyalty](https://apps.shopify.com/product-reviews-addon)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.4.2** — Is user-generated content important (customer photos, social embeds)? *(optional · client)*

**Why it matters.** Customer photos and social walls are tool-plus-theme work: rights management, moderation, extra media on the product page and the page speed that comes with it. A yes adds a licence and template changes; a no keeps the page lean.

**Q7.4.3** — Which affiliate platform, if any? *(optional · client)*

**Why it matters.** An affiliate platform sits outside the store and needs feeding: order values, codes and attribution at the point of purchase. Naming it now tells us what has to be wired and reconciled, rather than discovering it when commissions do not match.

**Q7.4.4** — Do you use Shopify Collabs for influencers? *(optional · client)*

**Why it matters.** Shopify Collabs is not accepting new creator sign-ups, though existing programmes can still invite creators. If the influencer plan assumed Collabs would recruit for the brand, that has to be re-planned during discovery, not after launch.

**Q7.4.5** — Are affiliate and influencer sales tracked via discount codes, UTM parameters, or both? *(optional · client)*

**Why it matters.** This decides how commission is calculated and which reports have to agree. Codes attribute the order but discount it and travel further than intended; UTMs attribute the session but break across devices. Most brands end up reconciling both.

| Option | Pros | Cons |
|---|---|---|
| Discount codes | Attribution survives to the order and is visible in the store's own reporting; works offline and in video | Every sale is discounted, codes get shared on voucher sites, and codes collide with other promotions and combination rules |
| UTM links | No margin given away, and the click is tied to a real campaign source | Lost when the shopper switches device or buys later; needs analytics and consent to be working properly to count anything |

### 7.5 Discounts & coupons

**Q7.5.1** — Which discount types are used? *(recommended · client)*

**Why it matters.** Each discount type is one of three things: an admin setting, a native combination, or a discount function someone writes and maintains. Listing the types is what tells us which — and that is the whole difference in cost.

**Q7.5.2** — Which discounts must combine on one order? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** Stacking is where the promotion plan meets platform limits. Shopify combines product, order and shipping discounts natively; several product discounts on the same item is a Plus feature, and anything outside the native rules needs a discount function.

| Option | Pros | Cons |
|---|---|---|
| Stay inside Shopify's native combinations | Configuration only, no code to maintain, no plan change; merchandising can run promotions unaided | The promotion calendar has to respect the documented limits and the combination rules |
| Build a discount function | Any bespoke rule the business wants, applied consistently in cart and checkout | Development, testing and long-term ownership of code that touches every order's price |

**Limits.** Up to 5 discount codes plus 1 shipping code on an order, and up to 25 automatic discounts. Several product discounts on the same line item requires Plus — a plan requirement to recheck after Spring '26.

Sources: https://help.shopify.com/en/manual/discounts/discount-combinations

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Discount combinations | Basic | Up to 5 codes + 1 shipping code; 25 automatic discounts | https://help.shopify.com/en/manual/discounts/discount-combinations |
| Several product discounts on the same line item | Shopify Plus | Plan requirement to recheck after Spring '26 | https://help.shopify.com/en/manual/discounts/discount-combinations |
Build with: Discount Function
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.5.3** — Are coupon codes single-use, multi-use, or bulk-generated? *(optional · client)*

**Why it matters.** A handful of shared codes is admin configuration. Unique codes per customer, affiliate or gift are a generation, storage and reporting problem — usually an import or an app — and the volumes decide whether that is a small job or a real one.

| Option | Pros | Cons |
|---|---|---|
| A few shared, multi-use codes | Created in the admin in minutes, easy to communicate and to report on | Shared publicly the moment one customer posts it; no per-customer control |
| Unique, single-use or bulk-generated codes | One code per customer or partner, so misuse is contained and attribution is exact | Needs generation, distribution and reporting to be built or licensed, and the volumes have to be planned |

**Q7.5.4** — Must codes be brand-named (e.g. WELCOME20)? *(optional · client)*

**Why it matters.** Brand-named codes are memorable, which is the point and the risk: they are guessed, shared and posted to voucher sites. The answer tells us whether the promotion relies on secrecy, and therefore on usage limits and customer eligibility instead.

**Q7.5.5** — Do codes need minimum order values or quantities? *(optional · client)*

**Why it matters.** Thresholds are ordinary discount conditions, but they have to be agreed per market and currency by the business, and the storefront must tell the shopper how far off the threshold they are. That is configuration plus theme work plus testing.

**Q7.5.6** — Do codes expire on a fixed date, a rolling period, or never? *(optional · client)*

**Why it matters.** A fixed end date is a setting. A rolling period — thirty days from sign-up, say — means a code generated per customer by a flow or an app. The answer separates configuration from a small piece of engineering.

**Q7.5.7** — How are codes distributed (email, SMS, print, influencers)? *(optional · client)*

**Why it matters.** Where codes go decides who creates them and in what volume, whether the email or SMS platform has to generate them, and whether the store must honour codes it did not issue — print runs and influencer lists especially.

**Q7.5.8** — Do promotions differ by market, customer segment, sales channel or B2B company? *(recommended · client)*

**Why it matters.** Targeting turns a promotion from a setting into a rules problem: who qualifies, in which market, channel and currency, and what the storefront shows everyone else. It is also where plan requirements appear, so it is asked early.

**Limits.** Per-market customisation is documented as an Advanced plan feature; company-specific catalogues or more than three B2B catalogues require Plus (exit rule 11.1).

### 7.6 Gift cards & campaigns

**Q7.6.1** — Are gift cards sold as a product? *(optional · client)*

**Why it matters.** Gift cards are native — digital cards sent by email, physical cards through POS — and they never expire by default. So selling them is configuration, not a build; what needs work is the card design, the delivery email and the process behind them.

Sources: https://help.shopify.com/en/manual/products/gift-card-products/overview

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Gift cards | Basic |  | https://help.shopify.com/en/manual/products/gift-card-products/overview |

If native is not enough: App Store — [Rise Gift Cards & Store Credit](https://apps.shopify.com/gift-card-loyalty-program), [Gift Card Hero](https://apps.shopify.com/gift-card-hero)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.6.2** — Are gift cards issued as rewards or compensation? *(optional · client)*

**Why it matters.** Issuing cards as goodwill or compensation is a service process, not a storefront one: who may issue, up to what value, with what approval, and how finance sees the outstanding liability. It also decides who needs admin access.

**Q7.6.3** — Digital gift cards, physical, or both? *(optional · client)*

**Why it matters.** These are two different projects. Digital cards are sent by email and are close to configuration. Physical cards are sold and activated through POS, which brings retail hardware, stock, in-store process and staff training into scope.

| Option | Pros | Cons |
|---|---|---|
| Digital only | Native delivery by email, no stock, no retail process, live quickly | No product to put in a shop or a gift box; loses the in-store and last-minute gift occasion |
| Physical, or digital and physical | Sellable in store and as a gift object; supports retail and wholesale occasions | Card production, stock, POS activation and staff process — a retail workstream, not a storefront setting |

**Q7.6.4** — Must gift cards expire? *(optional · client)*

**Why it matters.** Gift cards never expire by default, so a yes is a deliberate change that has to be checked against the law in each market the brand sells in — and against how finance wants the balance treated. Ask before assuming either.

**Q7.6.5** — Are promotions triggered from email or SMS campaigns? *(optional · client)*

**Why it matters.** If a campaign platform triggers the promotion, someone has to create the matching codes or automatic discounts in Shopify and keep the two in step. That is an integration and a weekly operating routine, not a one-off setup.

**Q7.6.6** — Does each campaign need its own landing page? *(optional · client)*

**Why it matters.** A page per campaign is fine if marketing can build one from existing sections. If not, every campaign becomes a developer ticket. The answer shapes how flexible the theme has to be and how much handover training is needed.

**Q7.6.7** — Are countdown timers or urgency elements needed? *(optional · client)*

**Why it matters.** Countdown timers and urgency badges are not a setting: they need an app or theme work, and they touch page speed, caching and, in some markets, rules on pressure selling. Small, but a real build item with a real owner.

| Option | Pros | Cons |
|---|---|---|
| An app | Marketing can schedule and style timers without a developer | Monthly licence, another script on the page, and the look is constrained by the app |
| Theme work | Exactly the brand's design, no licence, no third-party script | Every new campaign format is a developer change, and caching has to be handled carefully |

**Q7.6.9** — Do you run scheduled drops or flash sales with high traffic? *(optional · client)*

**Why it matters.** Drops squeeze a month of traffic and stock contention into minutes. Scheduling theme and checkout changes is native through Rollouts, on the Grow plan; the rest — stock rules, queueing, load testing, a rehearsal — is planning that must start early.

**Limits.** Rollouts (scheduled theme and checkout changes) is documented on the Grow plan.

Sources: https://help.shopify.com/en/manual/markets/rollouts

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Rollouts (scheduled theme and checkout changes) | Grow |  | https://help.shopify.com/en/manual/markets/rollouts |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 7.7 AI & agentic commerce

**Q7.7.1** — Do you want your products to be found and bought inside AI assistants such as ChatGPT, Google AI or Copilot? *(recommended · client)*

**Why it matters.** This decides whether a new sales channel is open or closed. Shopify enrols eligible stores automatically, so doing nothing is itself a decision — the channel is on.

| Option | Pros | Cons |
|---|---|---|
| Sell through AI assistants | Reaches shoppers who start in an assistant instead of a search engine; no build work — Shopify feeds the catalogue | Less control over presentation; the assistant owns the conversation; customer data is shared when checkout happens inside it |
| Stay out | Full control of the journey and the data | Invisible where a growing share of product research starts; competitors listed instead |

**Limits.** Eligibility is decided by Shopify: Starter plan or higher, not a private store, and some channels only for merchants selling to US buyers. Business-to-business products are excluded automatically.

Sources: https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-home · https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Agentic storefronts (active by default for eligible stores) | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-home |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.2** — Should Shopify enrol you automatically in new AI channels as they appear, or do you want to approve each one? *(recommended · client)*

**Why it matters.** AI channels are being added regularly. This decides whether the brand appears in a new one automatically, or only after your review.

| Option | Pros | Cons |
|---|---|---|
| Let Shopify manage it | No admin work; the brand is present as new channels launch | The brand can appear in a channel nobody reviewed, with terms and data sharing accepted in advance |
| Approve each channel | Brand, legal and data review before each launch | Someone must own the review; the brand is late to new channels |

**Limits.** The default is Shopify-managed enrolment, with catalogue access and checkout inside the assistant switched on.

Sources: https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-home

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Agentic channel management (Shopify-managed or per channel) | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-home |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.3** — Should shoppers be able to pay inside the AI assistant, or should they come to your store to check out? *(recommended · client)*

**Why it matters.** This is the commercial trade-off of the channel: conversion against ownership of the customer journey and the data.

| Option | Pros | Cons |
|---|---|---|
| Checkout inside the assistant | Fewer steps, so better conversion from an assistant conversation | Your storefront, upsells and analytics are skipped; the channel receives the customer's name, e-mail, phone and address |
| Send them to your store | You keep merchandising, upsells, tracking and the customer relationship | More steps between intent and purchase |

**Limits.** ChatGPT always sends shoppers to your checkout; other channels can be set per channel.

Sources: https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements · https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/chatgpt · https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/data-privacy

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Direct checkout in agentic channels | Basic | Per channel; ChatGPT is referral only | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.4** — Do you sell to customers in the United States? *(recommended · client)*

**Why it matters.** It decides which AI channels are available at all, so it decides whether this section matters for launch.

**Limits.** ChatGPT and Copilot need US buyers; Google's AI channels are limited to selected US-based shops. A European merchant selling only in Europe may not be eligible today.

Sources: https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Agentic channel eligibility | Basic | Starter plan or higher; some channels need US buyers | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.5** — Who can accept Shopify's additional terms for selling through AI channels? *(recommended · client)*

**Why it matters.** The channel cannot go live until someone with authority accepts separate terms. Naming that person early avoids a launch-week block.

**Limits.** The supplemental terms are accepted in the Shopify admin, and acceptance covers the channels the store is enrolled in.

Sources: https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Agentic Storefronts supplemental terms | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/requirements |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.6** — Are you comfortable sharing the customer's name, e-mail, phone and address with an AI channel when they buy inside it? *(recommended · client)*

**Why it matters.** Checkout inside the assistant means order data reaches a third party. It is the same kind of decision as adding a new processor, and it belongs with the data-protection owner.

| Option | Pros | Cons |
|---|---|---|
| Approve sharing | Checkout inside the assistant stays available, with its conversion benefit | A third party processes customer data; needs a record and probably a contract |
| Refuse or postpone | No new processor; simpler privacy position | Checkout in the assistant must be switched off; the channel becomes referral only |

**Limits.** The data is shared only for orders placed through direct checkout in the channel.

Sources: https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/data-privacy

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer data shared with agentic channels on direct checkout | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/data-privacy |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.7** — How complete is your product data — titles, images, prices, descriptions and variants? *(recommended · client)*

**Why it matters.** Product-data quality decides visibility in AI channels, and it is the cheapest thing to fix before launch.

**Limits.** A product needs a title, at least one image, a price above zero, an identifiable URL and publication to the online store. Eligibility is reviewed over time, not only once.

Sources: https://help.shopify.com/en/manual/shopify-catalog/requirements

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Catalog product requirements | Basic |  | https://help.shopify.com/en/manual/shopify-catalog/requirements |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.8** — Is important product information kept in custom fields, separate records or inside the product title (for example “Steel 40mm — Automatic”)? *(optional · client)*

**Why it matters.** It decides whether there is a data workstream. Attributes that matter commercially — material, size, movement — are often in custom fields or packed into titles, where an assistant cannot read them reliably.

**Limits.** Shopify supports mapping custom fields and title patterns into the catalogue it sends to AI channels; that mapping is work to plan.

Sources: https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/products

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Catalog mapping for custom data | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/products |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.9** — Should AI crawlers be allowed, restricted or blocked on your website? *(optional · client)*

**Why it matters.** Brands often want to block AI crawlers to protect content, then find their products still appear — the two routes are separate.

| Option | Pros | Cons |
|---|---|---|
| Allow all | Editorial content, guides and brand story can be cited by assistants | Content can be summarised without a visit to the site |
| Selective or blocked | Protects editorial content and images from open-web crawling | No effect on the product data Shopify sends to AI channels; can reduce visibility in AI answers |

**Limits.** Crawler rules are advisory and are set in the theme; they do not stop the Shopify product feed.

Sources: https://help.shopify.com/en/manual/promoting-marketing/seo/editing-robots-txt

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| robots.txt through the theme (robots.txt.liquid) | Basic |  | https://help.shopify.com/en/manual/promoting-marketing/seo/editing-robots-txt |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.10** — Do you want to control the answers AI assistants give about shipping, returns and sizing? *(optional · client)*

**Why it matters.** Assistants answer service questions whether or not you supply the answers. Publishing them keeps the answers right and shows what customers actually ask.

**Limits.** The FAQ content is a free Shopify app; the query log shows what shoppers asked about the store.

Sources: https://help.shopify.com/en/manual/promoting-marketing/knowledge-base

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Knowledge Base app | Basic |  | https://help.shopify.com/en/manual/promoting-marketing/knowledge-base |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.11** — Do you plan to offer your own AI shopping assistant, or connect the store to agent platforms yourself? *(optional · client)*

**Why it matters.** It separates “be present where assistants already are” from “build your own assistant”. The second is a project in its own right and partly on pre-release technology.

**Limits.** Shopify publishes an open protocol and store endpoints for agents; the cart part is early access, and plan requirements are not documented yet.

Sources: https://shopify.dev/docs/agents · https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Universal Commerce Protocol and agent interfaces | Basic | Universal Cart API is early access | https://shopify.dev/docs/agents |
| Storefront MCP server | Basic |  | https://shopify.dev/docs/apps/build/storefront-mcp/servers/storefront |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.12** — Which Shopify AI tools do you want your team to use in day-to-day work? *(optional · client)*

**Why it matters.** It separates customer-facing AI from staff productivity, and flags a training and governance need rather than a build.

**Limits.** The assistant and content tools are included in the plans, with limits varying by plan; better on-site search needs a specific plan and a catalogue under 200,000 products.

Sources: https://help.shopify.com/en/manual/ai-powered-tools · https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-modify-search

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Sidekick and Shopify Magic | Basic | Included; features and limits vary by plan | https://help.shopify.com/en/manual/ai-powered-tools |
| Semantic search in Search & Discovery | Grow | Shopify or Advanced plan; under 200,000 products | https://changelog.shopify.com/posts/semantic-search-is-now-available-on-more-plans |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q7.7.13** — Existing Shopify store: what do the agentic sales-channel settings show today (Sales channels → Agentic)? *(recommended · consultant)*

**Why it matters.** On an existing store the settings are already live, so the consultant reads the current state instead of asking the client to imagine it.

**Limits.** Turning enrolment off can take up to seven days to take effect in some channels.

Sources: https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-home

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Agentic sales channel settings | Basic |  | https://help.shopify.com/en/manual/online-sales-channels/agentic-storefronts/agentic-home |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

---

## § 8 — Integrations & migration

### 8.1 Connected systems

**Q8.1.1** — List every system that exchanges product, inventory, order, customer or financial data with the store. For each: system, category, direction, data objects, frequency, connector (native app / iPaaS / custom / none), owner, status, and whether it has a test environment we can connect to before go-live. *(required · client)*
Drives: gate Integration · rule 11.7 (STOP) · rule 11.12 (FLAG) · rule 11.24 (FLAG)

**Why it matters.** This table decides the integration architecture - native connector, iPaaS or custom app - and the API surface each flow needs. It is also the count behind the STOP: more than three integrations at launch is a Discovery Phase, not a build sprint.

**Limits.** Webhook delivery is not guaranteed, so a reconciliation job - a scheduled read-back or bulk query - belongs in scope for every connection, whatever the connector. The Admin API budget also differs by plan: 100 points/second on Basic and Grow, 200 on Advanced, 1000 on Plus.

Sources: https://shopify.dev/docs/api/usage/limits · https://apps.shopify.com/categories/orders-and-shipping-inventory-erp/all

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Admin API, bulk operations and webhooks | Basic |  | https://shopify.dev/docs/api/functions/latest |

If native is not enough: [ERP](https://apps.shopify.com/categories/orders-and-shipping-inventory-erp/all)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q8.1.2** — Is there a middleware / iPaaS layer, or custom connectors? *(optional · client)*

**Why it matters.** Tells you who owns mapping, retries and error handling. An existing iPaaS turns most flows into configuration; no iPaaS and no off-the-shelf connector for the ERP or PIM flags a separate integration scoping track at T3 or T4.

| Option | Pros | Cons |
|---|---|---|
| Native App Store connector | Fastest and cheapest; the vendor maintains it against Shopify's API versions | Only covers the flows the vendor built; field mapping is often fixed; another subscription and another support boundary |
| Existing iPaaS or middleware | Mapping, retries, logging and monitoring already exist; the client's team can change flows without a release | Licence and per-message cost; a second place where commerce logic lives; still needs reconciliation against Shopify |
| Custom app against the Admin API | Exact control of mapping, batching and error handling; can use bulk operations for volume | You build and keep webhook handling, retries, reconciliation and API-version upgrades; a custom app containing Functions needs Plus |

**Q8.1.3** — How often do prices and stock change (updates per day), and must changes be live within minutes? *(recommended · client)*

**Why it matters.** Sizes the sync design and the API budget. High-volume, non-urgent updates belong in bulk operations; freshness measured in minutes means webhooks plus reconciliation. The answer also tests whether the target plan's Admin API rate limit is enough.

**Limits.** Bulk imports: the JSONL file cannot exceed 100 MB, and the operation must finish within 24 hours or it is stopped and marked failed. Admin API rate limits are per plan, so heavy sync can itself force Advanced or Plus.

Sources: https://shopify.dev/docs/apps/build/apis/graphql-admin/bulk-operations/imports · https://shopify.dev/docs/api/usage/limits

### 8.2 Data migration

**Q8.2.2** — Which data must be migrated? *(recommended · client)*

**Why it matters.** Shopify's own Store Migration app moves products and customers from ten named platforms. It does not move order history, reviews or prices per location. Everything outside that list is a migration app licence or a custom script, and that is where migration budgets go.

**Limits.** Passwords cannot be migrated because they are encrypted outside Shopify. Current customer accounts sign in with a one-time six-digit code, so plan the comms rather than a password migration. Products with more than three options lose their options on import; prices by location are set to the highest price.

Sources: https://help.shopify.com/en/manual/migrating-to-shopify · https://help.shopify.com/en/manual/customers/import-export-customers · https://help.shopify.com/en/manual/customers/customer-accounts/new-customer-accounts/customer-experience · https://help.shopify.com/en/manual/migrating-to-shopify/migrating-from-woocommerce

**Q8.2.3** — Approximate volumes: products, customers, orders, URL redirects. *(required · client)*
Drives: rule 11.14 (FLAG) · gate SEO continuity

**Why it matters.** Volumes decide the route: CSV, a migration app, or scripted bulk imports. Redirect count matters most, because redirects are what carry the client's search traffic across - and Shopify caps them at 100,000, or 20,000,000 on Plus.

**Limits.** Customer CSV files must be 15 MB or smaller, so large bases split across several files. Products allow up to 2,048 variants, three options and 250 images. Import products first, then customers, then historical orders, so orders can connect to both.

Sources: https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect · https://help.shopify.com/en/manual/customers/import-export-customers · https://help.shopify.com/en/manual/products/variants/add-variants · https://help.shopify.com/en/manual/migrating-to-shopify

**Q8.2.4** — Must historical orders be available inside Shopify? *(required · client)*
Drives: rule 11.14 (FLAG)

**Why it matters.** The first-party migration app does not import orders. Bringing history in means a third-party importer such as Matrixify or scripted orderCreate calls - plus a rehearsal problem, because development and trial stores cap orderCreate at five orders per minute.

| Option | Pros | Cons |
|---|---|---|
| Import history into Shopify | Support, returns and customer lifetime value all work from one admin; no second system for staff to learn | Not covered by the first-party app - an importer licence or a scripted build; dev-store rate caps make full-volume rehearsal impractical |
| Keep the old system read-only for history | Removes the largest and riskiest part of the migration from the launch critical path | Two places to look up an order; the legacy platform keeps costing money; reporting across the cut-over date has to be stitched together |

**Limits.** Turn off new-order notifications first: every imported order emails each staff member set to receive them, including the account owner. orderCreate needs the write_orders scope and an app with an offline token.

Sources: https://shopify.dev/docs/api/admin-graphql/latest/mutations/ordercreate · https://help.shopify.com/en/manual/migrating-to-shopify/csv-migration · https://help.shopify.com/en/partners/manage-clients-stores/migrating-clients

**Q8.2.5** — How much SEO equity (rankings, backlinks) must be preserved? *(required · consultant)*
Drives: rule 11.14 (FLAG) · gate SEO continuity

**Why it matters.** Sets whether migration rides along with the build sprint or needs its own track. Shopify generates sitemap.xml automatically, but rankings survive on the redirects you author - and reindexing takes 48 to 72 hours, sometimes a few weeks.

**Limits.** Redirects are imported by CSV under Content > Menus > URL redirects, capped at 100,000 or 20,000,000 on Plus. Also remove explicit http: and https: protocols from asset URLs during the move.

Sources: https://help.shopify.com/en/manual/migrating-to-shopify/considerations · https://help.shopify.com/en/manual/intro-to-shopify/initial-setup/new-to-shopify-checklists/migrating-to-shopify-checklist · https://help.shopify.com/en/manual/online-store/menus-and-links/url-redirect

**Q8.2.6** — Must active subscriptions move to the new store without customers re-entering cards? *(required · client)*
Drives: rule 11.14 (FLAG) · gate Subscriptions

**Why it matters.** Active subscriptions are the hardest thing to move: the contract, the stored payment credential and the billing schedule all have to survive together. If they cannot, every subscriber re-enters a card, which is a churn event rather than a task.

**Limits.** Our verified Shopify chapters document no first-party tooling for moving live subscriptions; treat it as a dedicated migration track and confirm what the current gateway and subscription app will release before committing to a date.

---

## § 9 — Design & experience

### 9.1 Design input

**Q9.1.1** — Is there a Figma file or design mockup for the new store? *(required · client)*
Drives: rule 11.27 (STOP)

**Why it matters.** Decides whether design is an input or a work package. No Figma means design effort sits inside the engagement; a complete Figma design system covering every template is an L trigger, because implementing someone else's system costs more, not less.

Sources: https://shopify.dev/docs/storefronts/themes/architecture

**Q9.1.2** — How complete is it — brand only, key screens, or every template? *(required · client)*
Drives: rule 11.27 (STOP) · gate Storefront design

**Why it matters.** Completeness is the estimate. Brand only means the theme's own sections carry the design. Key screens mean you interpolate the rest. Every template means matching each one in Liquid, which is where a theme build turns into a custom build.

Sources: https://shopify.dev/docs/storefronts/themes/architecture

**Q9.1.3** — Does the Figma file contain a full design system (tokens and components)? *(required · client)*
Drives: rule 11.27 (STOP) · gate Storefront design

**Why it matters.** Tokens and components map onto theme settings and theme blocks, which are defined at theme level and reused across sections. A file of flat screens does not, and each screen then becomes bespoke Liquid - the difference between configuring a theme and writing one.

Sources: https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/quick-start?framework=liquid

**Q9.1.4** — Is the design mapped to Shopify sections and blocks? *(optional · consultant)*
Drives: gate Storefront design

**Why it matters.** A design already mapped to sections and blocks is buildable as a theme. One that is not usually hides layouts the merchant could never rebuild in the theme editor. Ask early - remapping after design sign-off is rework on both sides.

**Limits.** Sections can be added to any page of the online store except the gift card and checkout pages, so a design that assumes editable checkout layout is mapped to something that does not exist.

Sources: https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend

**Q9.1.5** — Is a fully custom design required, rather than a theme with brand customisation? *(recommended · client)*
Drives: gate Storefront design

**Why it matters.** Separates brand customisation of a current-generation theme from a bespoke build. Theme architecture constrains layout; going outside it means custom sections. If the design cannot be expressed in theme architecture at all, that is a headless argument, not a styling one.

| Option | Pros | Cons |
|---|---|---|
| Theme with brand customisation | Shortest route to launch; marketing restructures pages in the theme editor; theme app extensions install with no code | Layout is constrained by theme architecture; a distinctive design may need custom sections anyway |
| Fully custom design | Unconstrained visual and interaction design | Custom sections to build and maintain; every merchant-editable area has to be designed as a setting or it becomes a developer ticket |

### 9.2 Storefront

**Q9.2.1** — Is a headless storefront required (Hydrogen, another framework, or a native app front end)? *(required · client)*
Drives: rule 11.26 (STOP)

**Why it matters.** The largest architectural decision in the questionnaire. The commerce engine is identical either way; what changes is who owns the presentation layer. Headless removes the theme editor, so marketing can no longer restructure pages without a release.

| Option | Pros | Cons |
|---|---|---|
| Online Store (Liquid theme) | Fastest to launch; merchant edits pages with sections and theme blocks; app features arrive through theme app extensions; features ship to the Online Store first | Design constrained by theme architecture; front-end stack is Liquid |
| Headless (Hydrogen or your own stack) | Unconstrained design; any framework; one front end can serve more than the store | Longest build; content editing, customer accounts, Markets, B2B, analytics and consent all have to be built; framework and security maintenance is ongoing |

**Limits.** Checkout stays Shopify-hosted - you send the buyer to the cart's checkoutUrl. Customer accounts, Markets and localisation, B2B, analytics and consent each become explicit work. Oxygen public environments: 1 below Plus, 25 on Plus.

Sources: https://shopify.dev/docs/storefronts/headless · https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals · https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage · https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Hydrogen and Oxygen | Basic | Oxygen public environments: 1 below Plus, 25 on Plus | https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q9.2.2** — Any theme licence to keep? *(optional · client)*

**Why it matters.** New builds start from Shopify's Horizon theme, so an existing licence only matters if the client insists on a non-Horizon base. Inheriting a third-party theme also inherits its upgrade path and its vendor's release cadence.

Sources: https://changelog.shopify.com/posts/horizon-10-new-free-themes-by-shopify · https://help.shopify.com/en/manual/online-store/themes/managing-themes/versions

**Q9.2.3** — What is the aesthetic direction (minimal, editorial, luxury, playful, utilitarian)? *(optional · client)*

**Why it matters.** Sets the theme shortlist and how much custom section work sits behind the design. Dense editorial layout, full-bleed video and heavy motion push effort into custom sections; a restrained direction is mostly theme settings and content.

Sources: https://shopify.dev/docs/storefronts/themes/architecture

**Q9.2.4** — Which interactive patterns are required (mega-menu, quick-add, swatches, predictive search, lookbook, video hero)? *(required · client)*
Drives: app signal Wishlist

**Why it matters.** Each pattern is native, an app or a build, and the split is not obvious. Predictive search, variant swatches and filters come with Search & Discovery. Wishlists need an app. Combined listings are Plus only.

**Limits.** Combined listings: Plus. Shopify's modified storefront search needs Grow or above and fewer than 200,000 products. A wishlist app is a recurring cost and a theme integration, not a theme setting.

Sources: https://help.shopify.com/en/manual/online-store/search-and-discovery/filters · https://help.shopify.com/en/manual/products/combined-listings-app · https://help.shopify.com/en/manual/online-store/storefront-search/search-and-discovery-modify-search

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Predictive search, variant swatches and filters (Search & Discovery) | Basic |  | https://help.shopify.com/en/manual/online-store/search-and-discovery/filters |
| Combined listings | Shopify Plus |  | https://help.shopify.com/en/manual/products/combined-listings-app |

If native is not enough: [Wishlists](https://apps.shopify.com/categories/marketing-and-conversion-customer-loyalty-wishlists/all) — [Swym Wishlist Plus](https://apps.shopify.com/swym-relay), [Swish (formerly Wishlist King)](https://apps.shopify.com/wishlist-king)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q9.2.5** — Is custom motion or animation required? *(recommended · client)*

**Why it matters.** Custom motion is front-end engineering, not a theme setting, and it lands on the same Core Web Vitals the store will be judged by - Largest Contentful Paint, Interaction to Next Paint and Cumulative Layout Shift. Price it accordingly.

Sources: https://help.shopify.com/en/manual/online-store/web-performance/web-performance-reports

**Q9.2.6** — Why headless? *(required · client)*

**Why it matters.** Tests the reason against the architecture. A front end serving more than the store, a design that theme architecture cannot express, or an existing CMS as source of truth are real reasons. Speed and 'modern stack' usually are not.

**Limits.** Current-generation themes with theme blocks cover far more than Online Store 2.0 did, so check the requirement against Horizon's block architecture before accepting a headless answer. A headless build also needs a standing front-end team after launch.

Sources: https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks/quick-start?framework=liquid · https://shopify.dev/docs/storefronts/headless/getting-started/build-options

**Q9.2.7** — Headless hosting? *(recommended · consultant)*

**Why it matters.** Oxygen is Shopify's serverless hosting for Hydrogen, included at no extra charge on Basic through Plus, but public environments are capped at one below Plus and 25 on Plus. Self-hosting escapes the cap and takes on the operational work.

| Option | Pros | Cons |
|---|---|---|
| Oxygen | Included at no additional charge from Basic to Plus; edge deployment; Shopify's own Hydrogen patterns for analytics and consent | Only one public environment below Plus, which constrains preview and staging; tied to Hydrogen; consent banner needs a custom domain |
| Your own hosting | Any framework, any number of environments, the client's existing platform and CI | Hosting cost and operational ownership; Shopify's Hydrogen hosting patterns no longer apply out of the box |

**Limits.** Oxygen is not available on the Agentic plan. Hydrogen's cookie banner does not work on default Oxygen URLs, so a custom domain is needed before consent behaves correctly.

Sources: https://shopify.dev/docs/storefronts/headless/hydrogen/environments · https://shopify.dev/docs/storefronts/headless/hydrogen/fundamentals · https://shopify.dev/docs/storefronts/headless/hydrogen/analytics/consent

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Oxygen hosting | Basic |  | https://shopify.dev/docs/storefronts/headless/hydrogen/environments |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q9.2.8** — Where is editorial content managed for the headless storefront? *(recommended · client)*

**Why it matters.** Headless removes the theme editor, so somebody has to own content editing: whatever you build inside the storefront, or a separate CMS the client licenses and you integrate. Decide it before the build, not after launch when marketing asks.

| Option | Pros | Cons |
|---|---|---|
| Content stays in Shopify | One system, one login, no extra licence; content sits beside the products it sells | Editors get whatever editing experience you build; the theme editor's page-structure freedom is gone |
| Separate CMS | Purpose-built editorial tooling, workflow and multi-channel reuse; suits a brand where content leads | Licence cost, an integration to build and maintain, and two systems that must agree on products, markets and languages |

**Limits.** A CMS is a licence, an integration and a second publishing workflow, and it adds a preview and cache story on the storefront side.

Sources: https://shopify.dev/docs/storefronts/headless

**Q9.2.9** — Headless platform features required? *(recommended · consultant)*

**Why it matters.** Each feature named here is work the Online Store gives you for nothing. Customer accounts mean OAuth against the Customer Account API; Markets means querying international prices and setting cart context yourself; analytics and consent follow Hydrogen's patterns or are built from scratch.

**Limits.** B2B works only with customer accounts, and buyer-specific routes cannot be cached because the queries return personalised data. Hydrogen's cookie banner does not work on default Oxygen URLs.

Sources: https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/hydrogen · https://shopify.dev/docs/storefronts/headless/hydrogen/analytics/consent · https://shopify.dev/docs/storefronts/headless/bring-your-own-stack/b2b · https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/markets

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Customer Account API for headless | Basic |  | https://shopify.dev/docs/storefronts/headless/building-with-the-customer-account-api/hydrogen |
| Hydrogen analytics and consent | Basic | Cookie banner does not work on default Oxygen URLs | https://shopify.dev/docs/storefronts/headless/hydrogen/analytics/consent |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q9.2.10** — Do you want to A/B test themes or checkout configurations? *(required · client)*
Drives: rule 11.1 (STOP)

**Why it matters.** Native theme and checkout experiments run on Shopify Rollouts, and Rollouts starts at the Grow plan. A Basic client who expects to A/B test is therefore a plan conversation or a third-party app - and it surfaces late unless you ask now.

**Limits.** Rollouts experiments: Grow plan and above.

Sources: https://help.shopify.com/en/manual/markets/rollouts

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Rollouts experiments | Grow |  | https://help.shopify.com/en/manual/markets/rollouts |

If native is not enough: App Store — [Shoplift ‑ CRO & A/B Testing](https://apps.shopify.com/shoplift)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 9.3 Accessibility

**Q9.3.1** — Which accessibility standard applies? *(required · client)*

**Why it matters.** Shopify's checkout is tested against WCAG 2.2 AA, but the theme, the apps and any headless front end are the client's responsibility. Under the European Accessibility Act that is legal exposure, not a quality preference - and it decides QA scope.

Sources: https://www.shopify.com/accessibility

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify checkout accessibility (WCAG 2.2 AA) | Basic |  | https://www.shopify.com/accessibility |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q9.3.2** — Has an accessibility audit been done on the current site? *(optional · client)*

**Why it matters.** An existing audit turns accessibility from an unknown into a defect list you can size. No audit, on a site heading for a legal deadline, means remediation scope is open-ended - put the audit in the plan rather than discovering it at UAT.

Sources: https://www.shopify.com/accessibility

### 9.4 Performance

**Q9.4.1** — Core Web Vitals targets: LCP (seconds), CLS, INP (milliseconds). *(optional · client)*

**Why it matters.** Numbers make performance testable rather than arguable. Shopify reports the same three Core Web Vitals - Largest Contentful Paint, Interaction to Next Paint and Cumulative Layout Shift - so targets in those units can be verified in the admin after launch.

**Limits.** The web performance report covers the Online Store; a headless storefront needs its own monitoring, and its performance depends on the code and hosting you choose. Data covers the last 90 days and can lag by up to 36 hours.

Sources: https://help.shopify.com/en/manual/online-store/web-performance/web-performance-reports

**Q9.4.2** — Is page speed a known problem today? *(recommended · client)*

**Why it matters.** If the current store is already on Shopify, its web performance report is evidence rather than opinion: the three Core Web Vitals, on real traffic. If the store is elsewhere, treat the answer as a hypothesis until you measure it.

**Limits.** The report holds only the last 90 days and can be delayed by up to 36 hours, so a recent change may not show yet.

Sources: https://help.shopify.com/en/manual/online-store/web-performance/web-performance-reports

**Q9.4.3** — Which third-party scripts must load (chat, personalisation, heatmaps)? *(optional · client)*

**Why it matters.** Third-party scripts are the usual reason a Shopify storefront is slow, and they arrive after you leave - chat, personalisation, heatmaps, tag managers. Listing them now lets you set a budget and decide what loads on which template before targets are agreed.

**Limits.** Scripts affect the same Core Web Vitals the client will measure you against, and each one is a consent and data-protection question as well as a performance one.

Sources: https://help.shopify.com/en/manual/online-store/web-performance/web-performance-reports

---

## § 10 — Delivery, governance & compliance

### 10.1 Timeline

**Q10.1.1** — What is the target go-live date? *(required · client)*
Drives: rule 11.15 (FLAG)

**Why it matters.** The go-live date sets the whole plan. Exit rule 11.15 compares the weeks from kick-off to go-live against the offer's minimum duration; if the date is too soon, the engagement is re-scoped MVP-first before any sprint begins.

**Limits.** Rule 11.15 counts from delivery.kickoff_date, falling back to the date discovery was created, so an unknown kick-off makes the check optimistic.

**Q10.1.2** — What drives the deadline (peak season, product launch, contract end)? *(recommended · client)*

**Why it matters.** A deadline fixed by something outside the project — peak season, a collection launch, a contract end — cannot move. That changes the risk register: scope absorbs any slippage, not the date. A soft internal target leaves you room to negotiate.

**Q10.1.3** — Is a phased launch planned? *(optional · client)*

**Why it matters.** Tells you whether you are planning one launch or several. A phased launch lets the first release stay narrow and pushes the risky parts back; a single launch means everything must be ready on the day.

| Option | Pros | Cons |
|---|---|---|
| Phased launch | Earlier go-live on a narrow scope; risky work moves to a later phase; real traffic informs what comes next. | More releases to plan, test and support, and the client lives with known gaps for a while. |
| Single launch | One cutover, one communications moment, nothing half-finished on the storefront. | Everything must be ready on the date; any slip moves the entire launch. |

**Q10.1.4** — Preferred project kick-off date. *(recommended · client)*

**Why it matters.** Kick-off starts the clock used by exit rule 11.15 — the available weeks are counted from here. A late kick-off against a fixed go-live shortens delivery without shortening scope, and you want that visible in discovery, not in sprint two.

### 10.2 Team & decisions

**Q10.2.1** — Who is involved on the client side? For each: role, RACI (R/A/C/I), decision-maker (yes/no). Names are optional. *(required · client)*

**Why it matters.** The RACI map tells you who approves, who must be consulted and who only needs telling. Every 'C' adds a feedback loop to each design, content and scope review, and approvers nobody named surface later as delay.

**Q10.2.2** — Is there a single decision-maker for scope, approvals and feedback? *(required · consultant)*
Drives: rule 11.16 (FLAG)

**Why it matters.** Exit rule 11.16 flags this. Without one named decision-maker, scope questions get several answers and approvals stall — the commonest cause of overrun. The name must be confirmed before the statement of work is signed.

**Limits.** Rule 11.16 is a FLAG, not a STOP: discovery continues, but the flag must be cleared before signature.

**Q10.2.3** — Is budget approval authority clear? *(required · consultant)*
Drives: rule 11.16 (FLAG)

**Why it matters.** The same exit rule 11.16. If nobody can say yes to money, the scope you agree is provisional — change requests, apps with monthly fees and the retainer all stall. Name the budget owner before the statement of work.

**Limits.** Rule 11.16 is a FLAG, not a STOP: discovery continues, but the budget owner must be confirmed before signature.

### 10.3 Support & training

**Q10.3.1** — Which training is needed (products, orders, discounts, reports)? *(optional · client)*

**Why it matters.** This decides how much handover you build and price. Training on products, orders, discounts and reports is real delivery work — sessions, materials, recordings. Anything not listed here is outside scope and returns later as support tickets.

**Q10.3.2** — Are written SOPs required? *(optional · client)*
Drives: gate Post-launch support

**Why it matters.** Written standard operating procedures are a deliverable in their own right: someone drafts, reviews and maintains them. Asking now stops them appearing as an unplanned request in the final sprint.

| Option | Pros | Cons |
|---|---|---|
| Written SOPs delivered | The client's team can run the store unaided; fewer support tickets and less key-person risk. | Drafting, reviewing and maintaining them is effort that must be scoped and priced. |
| No written SOPs | Lighter handover; live training and recordings may be enough for a small team. | Knowledge stays with individuals, and every change becomes a question for the retainer. |

**Q10.3.3** — What post-launch support model is expected? *(recommended · client)*
Drives: gate Post-launch support

**Why it matters.** This shapes everything after go-live: who fixes a broken checkout at the weekend, who loads next season's collection. The expected model drives the retainer conversation and decides what team stays in place after launch.

| Option | Pros | Cons |
|---|---|---|
| Ongoing retainer | Named team, agreed response times and planned improvements after go-live. | A recurring commitment the client must budget and approve. |
| Ad-hoc support on request | The client pays only when something is actually needed. | No guaranteed availability; urgent fixes compete with other work and cost more. |
| Client's own team runs it | Lowest ongoing cost and fastest internal turnaround for routine changes. | Requires full training and SOPs at handover, which enlarges the delivery scope. |

**Q10.3.4** — Is the Grow retainer signed? *(required · consultant)*
Drives: rule 11.11 (WARN)

**Why it matters.** Exit rule 11.11 warns when an M or L engagement has no signed Grow retainer. The build is priced assuming work continues after launch; without the signature the commercials are adjusted. Check the signature, not the intention.

**Limits.** Rule 11.11 is a WARN and applies to M and L engagements only; it does not stop discovery.

**Q10.3.5** — Retainer length in months. *(recommended · consultant)*

**Why it matters.** The length decides how long the team stays and how much post-launch work is already covered. It feeds the commercial model and tells the client exactly what they get after go-live instead of leaving it open.

**Q10.3.6** — Will the client re-verify apps and Shopify features at each Shopify Edition after launch? *(optional · consultant)*

**Why it matters.** Shopify announces platform changes at each Edition, and the apps and features the store depends on can change. Someone has to re-verify them. A no here means nobody is watching the store drift — which usually becomes retainer work.

### 10.4 Legal & regulated industries

**Q10.4.1** — Is the business in a regulated industry (pharma, alcohol, firearms, age-restricted goods, financial products, medical devices)? If yes, which? *(required · client)*
Drives: rule 11.8 (STOP)

**Why it matters.** This is a STOP. Exit rule 11.8 sends any regulated business — pharma, alcohol, firearms, age-restricted goods, financial products, medical devices — to legal and compliance review. Shopify has its own rules too, and some business types cannot use Shopify Payments.

**Limits.** Shopify's rules for regulated goods (alcohol, for example) apply from the Basic plan; age-verification apps are on the shortlist. Verified 2026-09-17.

Sources: https://help.shopify.com/en/manual/compliance/legal/alcohol

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify rules for regulated goods (e.g. alcohol) | Basic |  | https://help.shopify.com/en/manual/compliance/legal/alcohol |

If native is not enough: App Store — [Age Verifier by OTG](https://apps.shopify.com/age-verification), [SB Age Verification Popup 18+](https://apps.shopify.com/age-verification-popup), [AgeX ‑ Age Verification Popup](https://apps.shopify.com/agex-age-verification-popup)
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

**Q10.4.2** — Are legal pages (terms, privacy, cookies, returns) ready, in need of updates, or still to be drafted? *(recommended · client)*

**Why it matters.** Legal pages are content somebody must write, approve and publish before launch. 'Still to be drafted' is a client task on the critical path, usually with a lawyer in the loop — not a theme job you can finish in a sprint.

**Q10.4.3** — Any other industry-specific compliance requirements? *(optional · client)*

**Why it matters.** This catches the requirement nobody thought to mention — licensing, labelling, record-keeping, industry codes. It is the safety net for exit rule 11.8: anything raised here goes to the same legal review before scope is fixed.

**Q10.4.4** — Is the business and product range eligible for Shopify Payments (no restricted or prohibited categories)? *(required · consultant)*

**Why it matters.** Shopify Payments is not open to every country or every business category. If the client is not eligible, the payment stack, the fees and part of the checkout experience change, so this must be settled in discovery, not at launch.

**Limits.** Eligibility depends on the store's country and on the product categories sold; the supported-countries page is the reference. Verified 2026-09-17.

Sources: https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries

| Shopify feature | Minimum plan | Note | Docs |
|---|---|---|---|
| Shopify Payments eligibility | Basic |  | https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries |
*Verified 2026-09-17 against help.shopify.com (Spring '26).*

### 10.5 Project set-up (consultant)

**Q10.5.1** — Lead consultant. *(required · consultant)*

**Why it matters.** The named consultant owns the engagement record. Every artefact the tool produces — engagement file, deck, backlog, closing document — carries this name, so each answer and judgement can be traced back to a person.

**Q10.5.2** — Has the client agreed that their answers may be processed by AI (no customer personal data included)? *(required · consultant)*

**Why it matters.** Under ADR 0007 the engine refuses to run without recorded consent. Nothing is processed, stored or generated until the client has agreed to AI processing. Record it explicitly, and keep customer personal data out of the answers regardless.

**Limits.** Consent covers the discovery answers only; customer personal data must never be entered, with or without consent.

**Q10.5.3** — Jira site and project key for the backlog. *(recommended · consultant)*

**Why it matters.** The backlog is generated for import into the client's Jira. The site and project key tell the tool where the tickets belong; without them the export is generic and somebody re-keys it by hand.

**Q10.5.4** — Jira components to use. *(optional · consultant)*

**Why it matters.** Components let the generated tickets land inside the client's existing Jira structure rather than as a flat list. It is the difference between a backlog the delivery team can use on day one and one somebody has to sort first.

**Q10.5.5** — The requirements go beyond the S, M and L offers. How will Merkle proceed: a Larger Engagement, or Merkle Arc? *(recommended · consultant · only on STOP)*

**Why it matters.** After a STOP the engagement cannot continue as a standard offer, and the tool must know which output to produce. Larger Engagement drafts the approach, brief and client deck with no Jira tickets. Merkle Arc hands the storefront build to the Arc practice with the discovery behind it; this engine prices Shopify builds and does not price Arc.

| Option | Pros | Cons |
|---|---|---|
| Larger Engagement | Keeps the client; the blocker gets a dedicated Discovery Phase with the right people and budget. | Longer sales cycle, no Jira tickets and no delivery start now; needs a Merkle Enterprise Engagement to be viable. |
| Merkle Arc | Keeps the work inside Merkle, where a tokenised design system and a component library already exist. The commerce engine can still be Shopify. | A different practice, a different rate card and a different timeline. The S, M and L bands do not apply and nothing here estimates it. |

---

## § 11 — Exit rules (full conditions)

| Rule | Result | Condition | If triggered | Asked in |
|---|---|---|---|---|
| 11.1 | STOP | A required Shopify feature needs a higher plan than the target plan, per Shopify's plan documentation (Plus: company-specific or more than 3 B2B catalogs, B2B deposits and partial payments, checkout step extensions / Checkout Branding API, expansion stores, several legal entities, combined listings, Multipass sign-in, more than 10 locations, more than 20 languages, several product discounts on one item; Advanced: B2B contextual experience, per-market customisation, carrier-calculated rates, multi-currency payouts, more than 5 staff users; Grow: A/B testing with Rollouts). Shopify B2B itself runs on every plan from Basic. A fully custom checkout UI is handled by 11.6, not here | Confirm the plan the requirements need, or remove the feature from scope | Q1.1.6, Q1.2.3, Q1.2.6, Q2.1.4, Q3.1.1, Q3.1.7, Q4.1.4, Q4.2.1, Q5.1.3, Q5.1.6, Q6.1.4, Q6.2.3, Q6.2.5, Q6.2.10, Q6.2.11, Q7.5.2, Q9.2.10 |
| 11.2 | FLAG | B2B requires request-for-quote or prices negotiated per buyer (Shopify has no built-in RFQ) | B2B architecture review: Shopify B2B draft-order review or a quote app (App Store category "Pricing quotes"), before build | Q6.2.6 |
| 11.3 | STOP | Base weeks plus the active scope gates exceed the L duration — the work is a programme, not an offer | Larger Engagement: delivered as a programme with a template, plus an increment per market or brand | Q3.1.1 |
| 11.4 | STOP | More than 6 distinct languages across all markets | Larger Engagement: translation and content operations in the Discovery Phase | Q3.1.1 |
| 11.5 | FLAG | More than 3 variant options per product (Shopify limit), or more than 2,048 variants on one product | Product model review: combined listings, a product options app for non-stock options, or splitting products | Q2.1.2, Q2.1.3 |
| 11.6 | STOP | Fully custom checkout UI — not possible on Shopify (checkout.liquid is retired; only Checkout Extensibility) | Merkle Arc — composable commerce, scoped separately | Q4.2.1 |
| 11.7 | STOP | More than 3 integrations at launch (counted per integration_definition) | Larger Engagement: integration architecture in the Discovery Phase | Q8.1.1 |
| 11.8 | STOP | Regulated industry (pharma, alcohol, firearms, age-restricted, financial products, medical devices) | Legal / compliance review | Q1.1.3, Q10.4.1 |
| 11.9 | STOP | PCI scope beyond Shopify-hosted payments (custom card UI, tokenisation, handling card data) | Security review (threat model mandatory) | Q4.1.5 |
| 11.10 | FLAG | GDPR / CCPA data export or deletion workflow required | Legal sign-off on data-subject request handling | Q6.4.5 |
| 11.11 | WARN | Grow retainer not signed on an M or L engagement | Grow retainer to be signed before delivery starts; otherwise commercial adjustment | Q10.3.4 |
| 11.12 | FLAG | ERP or PIM with no existing Shopify connector and no iPaaS | Integration scoping as its own track, before the build is quoted | Q8.1.1 |
| 11.13 | FLAG | fulfilment_locations > 2 AND routing beyond Shopify's native order routing rules (a custom routing Function or the ERP / OMS decides) | Multi-location inventory scoped separately | Q5.1.3, Q5.1.4 |
| 11.14 | FLAG | Migration with significant SEO equity or complex historical data | Dedicated migration scoping track — not combined with the store build sprint | Q8.2.3, Q8.2.4, Q8.2.5, Q8.2.6 |
| 11.15 | FLAG | Weeks from kick-off (delivery.kickoff_date, else meta.created_at) to target go-live are fewer than the offer's minimum duration_weeks | Re-scope to an MVP-first delivery before any sprint begins | Q10.1.1 |
| 11.16 | FLAG | No single decision-maker, or budget approval authority is unclear | Named client decision-maker and budget owner confirmed before the statement of work is signed | Q10.2.2, Q10.2.3 |
| 11.17 | FLAG | Sensitive personal data is collected (health, age, biometric or financial data; special-category data under GDPR art. 9) | Data protection impact assessment and legal sign-off on data minimisation, storage location and consent before build | Q6.4.4 |
| 11.18 | FLAG | Existing Shopify store uses retired or deprecated features (Shopify Scripts, checkout.liquid / additional scripts, online store script tags, legacy customer accounts, Stocky, Geolocation app) | Deprecation migration scoped as its own workstream (e.g. Scripts to Functions, legacy to customer accounts) | Q1.2.5 |
| 11.19 | FLAG | B2B requirement that Shopify B2B does not support (subscriptions, local delivery or pickup points, express checkouts, more than 500 line items, gift cards) | B2B architecture review: app or process change before build | Q6.2.12 |
| 11.20 | FLAG | Mainland China (CN) is a launch market. Selling onshore behind the Great Firewall needs a PRC entity, an ICP filing or licence and onshore hosting, and Shopify has no infrastructure in mainland China; cross-border routes (marketplaces, mini-programs, a Hong Kong store) have their own customs and product rules. Not part of the Merkle offering: CN is excluded from this engagement's markets, languages, offer, plan and build scope | A separate China discovery — see the China note | Q3.1.1, Q3.5.1, Q3.5.6 |
| 11.21 | STOP | Mainland China is the only launch market — not part of the Merkle offering | A separate China discovery — see the China note | Q3.1.1 |
| 11.22 | WARN | More than 5 retail stores in scope | Quote the retail roll-out as a programme with roll-out increments, or as a rate-carded run team | Q5.6.1 |
| 11.23 | FLAG | More than one market AND the topology inputs are materially unresolved: more than one legal entity recorded with no per-market entity mapping, or the assortment relationship per market unknown, or the invoicing and tax-registration footprint unknown. Fires on missing facts, not on a missing decision — the engine still recommends a topology. | Market topology and legal-entity mapping workshop before the solution architecture is baselined. | Q1.1.6, Q3.1.1 |
| 11.24 | FLAG | A system Merkle has to build a connector for has no non-production environment to integrate against (test_environment none). Shopify itself needs no instance ladder — a theme stages as an unpublished theme in the production store and checkout is managed — so the only environment risk on a Shopify build sits on the client side. Without a sandbox, integration testing serialises against the client’s live system and the schedule stretches | A named owner on the client side and a decision before the build starts: provide a sandbox, or agree the testing window against production | Q8.1.1 |
| 11.26 | STOP | A headless or custom-framework storefront is required — Hydrogen, another framework, or a native app front end. The commerce engine may stay on Shopify; the storefront is no longer a theme, and no offer here builds one | Merkle Arc — not quoted or estimated here; the Arc practice scopes it | Q9.2.1 |
| 11.27 | STOP | A complete Figma design system covering every template is the design source, rather than a brand to apply to a theme. Building to it means owning the component layer, which is a composable engagement rather than a theme one | Merkle Arc — not quoted or estimated here; the Arc practice scopes it | Q9.1.1, Q9.1.2, Q9.1.3 |
