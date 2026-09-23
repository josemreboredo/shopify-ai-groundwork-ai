# shopify-ai-builder — Product Strategy

> **Status:** Approved · **Date:** 2025-06 · **Updated:** 2026-09-23 (offering 3.0.0 — the quote follows the scope, ADR 0019) · **Owner:** Jose Reboredo

---

## What this is

`shopify-ai-builder` is a Gaia-governed AI delivery tool for **Merkle Shopify Lead
Consultants**. The consultant runs discovery with the client (questionnaire today, an
interview chatbot next); AI agents turn the answers into an engagement spec, classify the
offer (S/M/L), produce the implementation approach, the Discovery Closing Deck and a Jira
backlog, and then build the store — with the consultant approving every step.

```
Interview (questionnaire → chatbot)
   → engagement.json (offer S/M/L, scope gates, exit rules, requirements)
      → implementation approach (capability map · app shortlist · risks · delivery plan)
         → Discovery Closing Deck
         → Jira backlog
            → Build (Commerce Agent + Theme Agent, per offering)
```

Delivery roadmap and status: [`docs/implementation-plan.md`](implementation-plan.md).
Architecture decisions: [`docs/adr/`](adr/README.md).

---

## The three-layer model

```
┌─────────────────────────────────────────────────────────────────┐
│         CONSULTANT  (functional, non-technical)                 │
│         "My client needs wholesale pricing for B2B buyers..."   │
├─────────────────────────────────────────────────────────────────┤
│                     GAIA BIOTA                                  │
│  14-role agents · T1–T4 delivery tiers · security gates        │
│  Scoping · planning · QA · client handoff · audit trail        │
├─────────────────────────────────────────────────────────────────┤
│              SHOPIFY AI TOOLKIT  (Claude Code plugin)           │
│  Live Shopify docs · GraphQL/Liquid schema validation          │
│  CLI store management · authenticated store context             │
├─────────────────────────────────────────────────────────────────┤
│                   SHOPIFY PLATFORM                              │
│         Themes · Apps · APIs · Admin · Storefront               │
└─────────────────────────────────────────────────────────────────┘
```

### Layer 1 — Gaia biota
Provides **delivery governance**: quality tiers (T1–T4), multi-role agent
coordination, plan-approval gates, security regime, audit trail. The consultant
never approves code they cannot read — the gates enforce it structurally.

### Layer 2 — Shopify AI Toolkit
Installs as a single Claude Code plugin:

```terminal
claude plugin install shopify-ai-toolkit@claude-plugins-official
```

Provides: live Shopify developer docs, GraphQL/Liquid/Extension schema validation
against real Shopify schemas, store management via Shopify CLI. Eliminates
hallucination on Shopify-specific syntax and lets the agent act on real stores.

### Layer 3 — Shopify Platform
The actual delivery target: stores, themes, apps, Admin API, Storefront API.

---

## Value proposition

> *"We translate your business requirements into a Shopify scope you can read, estimate
> and sign — every feature grounded in Shopify's own documentation, every question
> asked that the approach needs, and the estimate built from the scope rather than
> guessed from a package."*

The packs open the conversation; the answers make the estimate; a discovery closes
the scope and the delivery team gives the final figure. Contingency and services such
as Design and QA testing are added in the proposal.

---

## Competitive position

Merkle does not compete with Shopify agencies on cost. The public DACH market sells
fixed packages from CHF 1.5–15k for a configured theme in two to six weeks, and a
Shopify Plus or enterprise tier from about EUR 50–150k over twelve to twenty-four
weeks (market references in `ai/schema/offering.json`, read 2026-09-23). Merkle's
bands buy a staffed team — about two people full time for the pack's weeks — not a
package's hours: governance, a Shopify-sourced scope, accessibility and Core Web
Vitals measured, quality gates and hypercare, with network capacity behind it.

| Who | Target | What they sell | Where Merkle differs |
|---|---|---|---|
| Swiss and DACH boutiques | SMEs launching online | Fixed packages, CHF 1.5–15k, 2–8 weeks | A staffed team and quality gates; S is for a brand launching D2C properly, not a test |
| DACH Plus agencies | Mid-market | EUR 20–150k+, 8–24 weeks | Scope decided by gates from the client's answers, add-ons priced at one rate |
| Enterprise Plus partners (NL, UK, US) | Enterprise replatforms | EUR 150–700k+, five to ten months | L with the replatform quoted beside it, by source platform |
| Shopify AI Store Builder / AI Toolkit | Merchants and developers | Self-serve tooling | Governance, discovery and a delivery workflow |
| **Merkle (this tool)** | **Lead Consultants in pre-sales and discovery** | **Packs to open, an estimate from the answers, a closed scope** | ← the combination |

The moat is the **combination**: live Shopify knowledge (toolkit) + delivery
governance (Gaia) + a consultant-run discovery whose answers decide the scope.

---

## MVP definition

**One client engagement, end to end, in a Shopify development store.**

1. Consultant describes a business requirement in plain language
2. Agent produces a tiered plan (T1/T2/T3) with: approach, app recommendations
   with rationale, effort estimate, risks
3. Consultant approves
4. Agent implements in the dev store via CLI
5. Consultant reviews the result (business logic, not code)

---

## Capability phasing

Superseded by [`docs/implementation-plan.md`](implementation-plan.md) (Phases 0–6).

---

## Service offers & delivery tiers

> **Machine-readable source:** [`discovery/schema/offering.json`](../discovery/schema/offering.json) (ADR 0001).
> If this section and `offering.json` disagree, `offering.json` wins and this section is corrected.

Two delivery tiers map to three commercial offers (S / M / L). The offer is
determined during First Engagement discovery by **scope gates** — observable
yes/no criteria captured in the FE questionnaire, not by feature name or lifecycle
stage. This prevents ambiguous overlaps and protects the consultant from scope
creep post-signature.

---

### Scope gates — how S, M, L are assigned

#### Gate set (S vs M classification)

| Gate | Condition |
|---|---|
| **Markets** | 2 or more Shopify Markets at launch (geo-routing, tax, payments per market) |
| **Multi-currency** | More than one transactional checkout currency (not display-only) |
| **B2B / Wholesale** | B2B customer accounts, wholesale pricing, or volume discounts. Wholesale-only is the base of an offer, not an addition to it — the gate is the second channel |
| **Integration** | One or more live connections to ERP, PIM, CRM, OMS, 3PL/WMS or POS. An App Store app with a native connector is an app, not an integration |
| **Storefront design** | More than theme configuration: bespoke sections from a key-screens design, or a full template set from a mapped design system |
| **SKU complexity** | 500+ SKUs with two or more variant options, metafields, or bundles |
| **Migration** | Migration from any non-Shopify ecommerce platform — priced by where the data comes from, not by the fact of moving (light / medium / heavy) |
| **Retail & POS** | Physical stores selling with Shopify POS or an integrated POS, or omnichannel services (pickup in store, ship from store, in-store returns) — up to 5 stores (ADR 0011) |
| **Languages** | 4 or more distinct languages. Translate & Adapt covers two and Swiss DE/FR/IT is in every offer, so the gate opens at the fourth |
| **SEO continuity** | The URLs change on a business that lives on search: significant SEO equity, 1,000+ redirects, or custom URL structures on a priority organic channel. Deliberately independent of migration — a rebuild on Shopify moves every URL without changing platform |
| **Subscriptions** | Recurring selling: a subscription approach or features, subscription products, or live contracts to carry across without the customer re-entering a card |
| **Checkout extensibility** | More than checkout settings and editor branding: extensions, custom fields, or backend logic as Shopify Functions |
| **Analytics and consent** | Measurement past what every store already has. GA4 and a pixel are in every offer; a third destination, a tag manager, custom events, server-side tagging or a third-party CMP are not |
| **Post-launch support** | An operating model past go-live: written SOPs the client's team runs the store from, or a handover into a retainer. The hypercare window and launch-day training are in every offer |

<!-- generated:classification -->
**Classification rule** — the quote first, then the name. The quote is the Foundation base (4–5 weeks, CHF 30k–55k) plus every active scope gate at its own weeks, each week at one rate of CHF 10.5k. The pack it is named after, in order:
1. A headless storefront — only Ecommerce Flagship builds one → **L**
2. The quote reaches Ecommerce Flagship’s floor, and everything past its promise is sold as an add-on to it → **L**
3. The quote reaches Ecommerce Scale’s floor, and everything past its promise is sold as an add-on to it → **M**
4. Below that, Ecommerce Foundation, with whatever goes past its promise as add-ons → **S**
5. Below Ecommerce Scale’s floor but needing what only a larger pack sells — a further store — the smallest pack that sells it → **M**

Whatever goes past the named pack’s promise is listed as add-ons, so a re-estimate that finds a second store reads as the same pack with a store more. The packs are what a conversation opens with; the quote is what the answers add up to.
<!-- /generated:classification -->

Brand positioning does not classify anything. A luxury brand with one market and
a small catalogue is a small engagement; one that wants every template designed
answers the design questions, and the storefront design gate prices those.

**Every week is priced at one rate.** A modifier's price is its weeks at the
rate, so no gate is cheaper per week than another and the riskiest work —
migrations, B2B, design — is no longer the cheapest. A pack's band is what an
engagement named after it costs: from the floor at which the conversation is in
that budget, up to the pack's own promise priced gate by gate.

Modifiers are **internal pricing tools only** — the consultant uses them to build
the engagement price; the client sees the estimate, never the modifiers.

#### Internal scope modifiers (never shown to a client)

<!-- generated:modifiers -->
| Modifier | Effort add | Price add |
|---|---|---|
| `+Markets` — shopify Markets set-up: geo-routing, Translate & Adapt, tax, duties and payment methods per market, and the checkout tested in each one — three quarters of a week per market beyond the first, and a third more where that market meets a bespoke template set rather than a configured theme | +0.75–20 wk | +CHF 7.9k–210k |
| `+Stores` — each Shopify store beyond the first: set-up, users, domain, tax and payments of its own, the theme deployed and kept in step, and every integration wired again per store — expansion stores share no data, so the more integrations there are, the more this costs per additional store | +1.5–31.5 wk | +CHF 15.8k–330.8k |
| `+B2B (standard)` — shopify’s own B2B: company accounts, price lists, volume rules and payment terms | +1–1.5 wk | +CHF 10.5k–15.8k |
| `+B2B (advanced)` — b2B past Shopify’s own set-up: catalogues per company, quote or negotiated pricing, a separate B2B storefront or checkout, or needs Shopify’s B2B does not cover | +2–3 wk | +CHF 21k–31.5k |
| `+Design (extended)` — bespoke sections and blocks built as Online Store 2.0 theme blocks from a key-screens design: schema, presets, translatable labels, Theme Check | +1–2 wk | +CHF 10.5k–21k |
| `+Design (bespoke)` — a full template set from a mapped design system: every template, tokens wired to theme settings, motion and right-to-left where the markets need it | +3–5 wk | +CHF 31.5k–52.5k |
| `+Theme design` — each further storefront design, built from the client’s second design against the same token layer: its own theme installed, configured and Theme Checked, every template built again — more of them when the first design is a full template set — and the theme kept in step with the first on every release | +2–31.5 wk | +CHF 21k–330.8k |
| `+Integration` — each live connection to a counted system — ERP, PIM, CRM, OMS or 3PL | +1–3 wk | +CHF 10.5k–31.5k |
| `+SKU (standard)` — 500 to 4,999 SKUs with complex variants, metafields or bundles: the product model designed once and applied | +0.5 wk | +CHF 5.3k |
| `+SKU (large)` — 5,000 to 49,999 SKUs: the model is the same, the data is not — import batching, reconciliation per object, and the share of products that need a human before they load | +1.5–2.5 wk | +CHF 15.8k–26.3k |
| `+SKU (very large)` — 50,000 SKUs and above: catalogue operations in their own right — staged loads, a rehearsal run, and a data owner on the client side | +3–5 wk | +CHF 31.5k–52.5k |
| `+Search (native)` — search & Discovery taken to its limits: the filter set designed against the product data that backs it, boosts and synonyms per collection, and a merchandiser who can change them afterwards | +0.5–1 wk | +CHF 5.3k–10.5k |
| `+Search (app)` — past a documented Shopify limit, so a third-party search app: indexing and re-indexing, the sync that keeps it true, and the merchandising rules moved into it with an owner | +1.5–2.5 wk | +CHF 15.8k–26.3k |
| `+SEO (standard)` — the redirect map authored and imported, metadata and canonicals carried across, sitemap and indexation checked through cut-over | +0.5–1 wk | +CHF 5.3k–10.5k |
| `+SEO (large)` — a redirect estate of 10,000 URLs or more, or rankings the business runs on: the map built from a crawl rather than a pattern, verified on staging, and indexation watched after launch | +1.5–2.5 wk | +CHF 15.8k–26.3k |
| `+Subscriptions (standard)` — shopify Subscriptions: selling plans, the storefront widget, the customer portal and the billing states the support team has to recognise | +0.5–1 wk | +CHF 5.3k–10.5k |
| `+Subscriptions (advanced)` — a third-party subscription app, or prepaid, build-a-box, B2B or international plans — and live contracts carried across without the customer re-entering a card, which is where these migrations fail | +1.5–2.5 wk | +CHF 15.8k–26.3k |
| `+Checkout (post-purchase)` — uI extensions on the Thank you and Order status pages — order tracking, surveys, referrals, an app block after the sale. Available on every plan except Starter, so this needs no Plus | +0.5–1 wk | +CHF 5.3k–10.5k |
| `+Checkout (in-checkout)` — uI extensions and custom fields on the information, shipping and payment steps. Shopify Plus only — on any other plan this is not a scope decision, it is a plan decision | +1–2 wk | +CHF 10.5k–21k |
| `+Checkout (functions)` — backend logic as Shopify Functions — validation, delivery or payment customisation, order rules: a deployed app with its own tests and release path, not a setting | +1.5–3 wk | +CHF 15.8k–31.5k |
| `+Analytics (standard)` — customer events, the destinations wired through them and consent respected on each — measurement that agrees with Shopify's own numbers | +0.5–1 wk | +CHF 5.3k–10.5k |
| `+Analytics (advanced)` — server-side tagging or a third-party consent platform: consent state carried to every destination, capture points beyond checkout, and the reconciliation that proves the numbers still line up | +1.5–2.5 wk | +CHF 15.8k–26.3k |
| `+Support (standard)` — one of the two: written SOPs, or a handover into a retainer that is not the Grow retainer — the runbooks and the owner named against each, past the launch-day training every offer carries | +0.5–1 wk | +CHF 5.3k–10.5k |
| `+Support (extended)` — both: a documented operating model the client’s team runs the store from, handed into a retainer that has to receive it, with a training programme behind it | +1–2 wk | +CHF 10.5k–21k |
| `+Retail` — each location selling with Shopify POS: hardware, inventory, staff and the in-store test pass | +1–5 wk | +CHF 10.5k–52.5k |
| `+Migration (light)` — wooCommerce or Shopify-to-Shopify: catalogue, customers and order history. The redirect estate is the SEO continuity gate, not this one. | +1–1.5 wk | +CHF 10.5k–15.8k |
| `+Migration (medium)` — shopware or BigCommerce: data model differences to map, order history, customer and price-list structures. Redirects are priced by the SEO continuity gate. | +2.5–4 wk | +CHF 26.3k–42k |
| `+Migration (heavy)` — magento, Salesforce Commerce Cloud or a custom platform: a bespoke data model to map and integrations to re-point. Redirects are priced by the SEO continuity gate. | +4–5.5 wk | +CHF 42k–57.8k |
| `+MultiCurrency` — more than one checkout currency: price lists, rounding rules, payout and reconciliation per currency | +0.5 wk | +CHF 5.3k |
| `+Languages` — each language beyond the third: translation of products, collections, policies, URL handles, theme and app strings — and again on every release | +0.5–2.5 wk | +CHF 5.3k–26.3k |
<!-- /generated:modifiers -->

**These are the values the engine runs.** `ai/schema/offering.json` is the
record; the classification rule and this table are generated from it
(`npm run strategy:render`), and a test fails when they drift.

**Retail is priced per location up to five** — each location's set-up, hardware and staff training is the work it is. Above five (rule 11.22, WARN) the roll-out is a programme: quote it with its increments or a rate-carded run team, never as a per-store line item a client compares with 40 hours.

---

### Delivery track 1 — Liquid (Horizon theme)

S and M always. L by default.

**Stack:** Shopify Horizon theme · LWC token system · Gaia pipeline · Shopify AI Toolkit
**Figma role:** Source of truth for brand identity and per-template specs
**AI role:** Token application, section development, schema, metafields, app config,
store-spec.yaml → `shopify theme push` pipeline (~85% of implementation)
**Human layer (the irreducible 15%):**
- **Consultant** — discovery, client relationship, functional QA, delivery management
- **Senior Designer (part-time)** — Figma brand system, per-template specs, design
  intent review; theme selection or Figma-to-Horizon token mapping
- **Senior Liquid Developer (part-time)** — custom animations, micro-interactions,
  cross-device pixel QA, performance (Core Web Vitals), GSAP/scroll work

| Offer | Code | Triggered by | Base scope | Typical value | Delivery |
|---|---|---|---|---|---|
| **Ecommerce Foundation** | S | A quote below the M floor | An established brand launching direct-to-consumer, or relaunching it properly. New Shopify store on the plan the requirements need (ADR 0011) · Horizon theme configured · core catalogue · payments · standard checkout · accessibility and Core Web Vitals measured | CHF 30–55k | 4–5 weeks |
| **Ecommerce Scale** | M | A quote from the M floor, or a further store | A brand that already sells and cannot scale, with one back-office system to wire. Everything in S · up to three markets and four languages · bespoke sections · one integration · a WooCommerce or Shopify migration · events per market | CHF 65–163k | 6–15 weeks |

Both S and M are deliverable by Consultant + AI + two part-time collaborators.
No permanent agency headcount required.

---

### Delivery track 2 — Hydrogen (headless)

L only, and only where the answers ask for it. Content stays in Shopify—metaobjects
and metafields through the Storefront API—which is what keeps it a Shopify build.
Content or a front end outside Shopify is **Merkle Arc**, below.

**Stack:** Shopify Hydrogen (React) · Storefront API · Shopify metaobjects and
metafields as the content source · Figma design source of truth · Figma-to-Hydrogen
MCP pipeline (Builder.io Visual Copilot) · Oxygen deployment
**Figma role:** Complete design source — every template has a Figma frame; Figma
variables drive the token system; MCP translates component specs to React
**AI role:** Storefront API queries, Hydrogen route loaders, component wiring,
token application, boilerplate, automated QA (~60% of implementation)
**Human layer (the irreducible 40%):**
- **Consultant** — discovery, client relationship, functional QA, delivery management
- **Senior Figma Designer** — full brand system, all template frames, design intent,
  MCP output review (~60h per engagement)
- **Senior Hydrogen Developer** — MCP output cleanup, custom animations (GSAP),
  performance tuning, cross-device pixel QA, accessibility (WCAG 2.1 AA) (~80h per engagement)

| Offer | Code | Triggered by | Scope | Typical value | Delivery |
|---|---|---|---|---|---|
| **Ecommerce Flagship** | L | A headless requirement, or a quote from the L floor | A brand already selling professionally that needs more than one store, a storefront built out and measurement that stands up. Up to three Shopify stores · six languages · the full template set over one token layer · blocks inside the checkout steps (Plus) · a custom GA4 event layer · one experiment live at launch. The replatform is quoted beside the pack, by source platform | CHF 140–260k+ | 13–24 weeks |

L builds either way and spends the same weeks differently — as theme sections and
blocks, or as owned components on Hydrogen — so the track follows the answers
rather than the offer. On the headless track it takes one senior Figma designer
and one senior Hydrogen developer as project contractors.

Scope gates do apply to L, unlike every earlier version of this page: past the
nine to fifteen weeks of them its band already holds, each one is added to the
quote.

---

### Offer-to-tier reference

```
Ecommerce Foundation  (S)  ──►  Liquid / Horizon                 0–1 gates
Ecommerce Scale       (M)  ──►  Liquid / Horizon                 ≥ 2 gates
Ecommerce Flagship      (L)  ──►  Liquid / Horizon                 scope past the M ceiling
                           └─►  Hydrogen on Oxygen              headless required
                                                                 (content still in Shopify)

Merkle Arc                 ──►  composable, scoped by the Arc practice
                                content or a front end outside Shopify
```

### Where the offers stop — Merkle Arc

Arc is Merkle's enterprise platform for unifying brand design, content and
commerce in one architecture: a tokenised design system, a multi-channel
component library, GraphQL middleware and its own console — composable and
headless, without the vendor lock-in.

**The line is not headless.** Hydrogen with content in Shopify metaobjects is a
Shopify build and Ecommerce Flagship prices it. The line is a second system:
editorial content in an external CMS or PIM, or a front end Shopify does not
build — another framework, a native app, several front ends on one backend.
Either is exit rule 11.26, a STOP with a destination.

**Nothing here quotes Arc and nothing here estimates it.** This engine prices
Shopify builds; the Arc practice scopes its own. What crosses is the discovery —
every answer, every requirement, and the rule that named the reason.

The other route past the offers is a **Larger Engagement**: a Merkle Enterprise
Engagement opening with a consultant-led Discovery Phase, where the requirements
go beyond S, M and L for reasons that are not the storefront. Deciding not to
bid is recorded on the outcome ledger when the decision is taken — it is not a
route chosen in the room.

---

## Discovery engine — input/output contract

The discovery engine ([`discovery/agents/discovery/`](../discovery/agents/discovery/README.md), `npm run discover`) is the
**first stage of the delivery pipeline**; it replaced the Python Frame Agent. It reads a completed questionnaire — or,
from Phase 5, a chatbot interview — and produces the engagement spec.

### Inputs

| Input | Source |
|---|---|
| Completed questionnaire | Generated template [`discovery/docs/client-questionnaire.md`](../discovery/docs/client-questionnaire.md); worked example [`example-acme-questionnaire.md`](../discovery/docs/example-acme-questionnaire.md) |
| Question definitions | [`discovery/schema/question-bank.json`](../discovery/schema/question-bank.json) — each question maps to engagement fields and feeds gates / exit rules |
| Offering rules | [`discovery/schema/offering.json`](../discovery/schema/offering.json) |

Questionnaire sections: § 0 Business outcomes · § 1 Company, brand & Shopify · § 2 Catalogue ·
§ 3 Markets · § 4 Payments & checkout · § 5 Shipping & fulfilment · § 6 Customers, B2B & privacy ·
§ 7 Marketing & promotions · § 8 Integrations & migration · § 9 Design & experience ·
§ 10 Delivery, governance & compliance. Exit rules (§ 11) are listed in the consultant guide only, not in the client questionnaire (ADR 0011).

### Outputs (`clients/<slug>/`, gitignored)

| File | Contents |
|---|---|
| `engagement.json` | Single source of truth, validated by [`contracts/engagement.schema.json`](../contracts/engagement.schema.json) (ADR 0002) |
| `delivery-plan.md`, `capability-map.md`, `app-shortlist.md`, `risks.md` | Renderings of `engagement.json` — on GO |
| `stop-report.md` | Open STOP rules, evidence and resolution path — on STOP (no GO artefacts are written) |

The LLM extracts answers; deterministic code computes scope gates, the offer and exit rules
(ADR 0001, 0003). The engine refuses to run without recorded consent (ADR 0007).

### Exit rules (§ 11)

The canonical list is `offering.json → exit_rules` (ADR 0003). This table is
generated from it — if the two disagree, the engine is right and this page is stale.

| Rule | Condition | Result |
|---|---|---|
| 11.1 | A requirement needs a higher Shopify plan than the one we are quoting | STOP → Confirm the plan the requirements need, or remove the feature from scope |
| 11.2 | B2B needs quotes or prices negotiated per buyer, which Shopify has no built-in way to do | FLAG → B2B architecture review |
| 11.3 | The scope is beyond what the largest offer holds | STOP → Larger Engagement |
| 11.4 | More than six languages across the markets | STOP → Larger Engagement |
| 11.5 | More product options or variants than Shopify allows on one product | FLAG → Product model review |
| 11.6 | A fully custom checkout, which Shopify no longer permits | STOP → Merkle Arc |
| 11.7 | More than three systems connected at launch | STOP → Larger Engagement |
| 11.8 | A regulated industry — pharma, alcohol, firearms, age-restricted, financial or medical | STOP → Legal / compliance review |
| 11.9 | Card data handled outside Shopify’s own payment pages | STOP → Security review (threat model mandatory) |
| 11.10 | Customers must be able to export or delete their data on request | FLAG → Legal sign-off on data-subject request handling |
| 11.11 | An M or L engagement with no Grow retainer signed | WARN → Grow retainer to be signed before delivery starts; otherwise commercial adjustment |
| 11.12 | An ERP or PIM with no ready-made Shopify connector and no integration platform in place | FLAG → Integration scoping as its own track, before the build is quoted |
| 11.13 | More than two fulfilment locations, with routing Shopify cannot do on its own | FLAG → Multi-location inventory scoped separately |
| 11.14 | A migration carrying real search traffic or complex history | FLAG → Dedicated migration scoping track |
| 11.15 | Less time to go-live than the offer needs | FLAG → Re-scope to an MVP-first delivery before any sprint begins |
| 11.16 | No single decision-maker, or unclear budget authority | FLAG → Named client decision-maker and budget owner confirmed before the statement of work is signed |
| 11.17 | Sensitive personal data — health, age, biometric or financial | FLAG → Data protection impact assessment and legal sign-off on data minimisation, storage location and consent before build |
| 11.18 | The existing store runs on Shopify features that are being retired | FLAG → Deprecation migration scoped as its own workstream (e.g. Scripts to Functions, legacy to customer accounts) |
| 11.19 | A B2B requirement Shopify’s own B2B does not support | FLAG → B2B architecture review |
| 11.20 | Mainland China is one of the launch markets | FLAG → A separate China discovery |
| 11.21 | Mainland China is the only launch market | STOP → A separate China discovery |
| 11.22 | More than five retail stores in scope | WARN → Quote the retail roll-out as a programme with roll-out increments, or as a rate-carded run team |
| 11.23 | Several markets, with the legal entities and pricing still unresolved | FLAG → Market topology and legal-entity mapping workshop before the solution architecture is baselined. |
| 11.24 | A system to be connected has no test environment to build against | FLAG → A named owner on the client side and a decision before the build starts |
| 11.25 | A headless storefront below Plus, where only one deployment can be public | FLAG → Agree who reviews where, or price the Plus plan |
| 11.26 | Content or a front end that lives outside Shopify | STOP → Merkle Arc |
| 11.27 | One order, more than one delivery address | FLAG → One order per address, an app that does it, or drop the requirement — said in the proposal |
| 11.28 | A Shop Mini — a build these offers do not price | FLAG → Scoped and priced separately, in this engagement or after it |

---

## What we are NOT building (scope boundary)

- ❌ A public multi-tenant SaaS product — this is an internal Merkle consultant tool
- ❌ Automated deployment or store mutation without consultant approval
- ❌ An app recommendation database (agents use live Shopify knowledge)
- ❌ Non-Shopify ecommerce work
- ⏳ A client-facing interview chatbot — planned (implementation plan Phase 5), starting as a Claude Code skill pilot

---

## Critical security constraints

1. **Store access** — dedicated OAuth per client engagement; Admin API tokens
   never committed, always in `.env` (gitignored)
2. **PII** — customer emails, names, order data are GDPR/CCPA PII; never logged,
   never sent to external LLMs without explicit consent gate (Gaia Gate 6)
3. **Scope control** — T2+ plan-approval gates enforce consultant confirmation
   before any mutation to a client store
4. **Quality assurance** — consultant's inability to review code is mitigated by
   Gaia gates + Shopify Toolkit schema validation as the automated review layer

See `docs/conventions/security-gates.md` for full detail.

---

## Success metric for MVP

> The consultant can take a real client requirement from conversation → approved
> plan → implemented change in a dev store, in a single Claude Code session,
> without asking a developer for help.
