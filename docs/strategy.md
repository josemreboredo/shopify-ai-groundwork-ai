# shopify-ai-builder — Product Strategy

> **Status:** Approved · **Date:** 2025-06 · **Updated:** 2026-09-16 (Phase 1 — offering as data, multi-consultant scope) · **Owner:** Jose Reboredo

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

> *"I use an AI-assisted delivery system that translates your business requirements
> directly into a working Shopify store — with the same quality gates and structured
> process a technical agency would use, at a fraction of the cost and timeline."*

---

## Competitive position

| Who | Target | Gap they leave |
|---|---|---|
| Shopify AI Store Builder | Merchant, own store, self-serve | No governance, no customisation, single-session |
| Shopify AI Toolkit | Developers who know Shopify | Requires technical knowledge, no delivery workflow |
| Freelance dev team | Anyone | 5–15× cost, slow, coordination overhead |
| Shopify agencies | Mid-market+ | Minimum engagement size, not SME-friendly |
| **`shopify-ai-builder`** | **Consultant delivering for clients** | ← fills this gap |

The moat is the **combination**: live Shopify knowledge (toolkit) + delivery
governance (Gaia) + non-technical operator path (consultant as UI).

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

**Classification rule** — five questions in order, stopping at the first yes:
1. **Headless storefront required → L** (Ecommerce Growth, on the headless track)
2. **Base weeks + active gate modifiers exceed the M ceiling → L** — the offer follows the work, not the number of boxes ticked
3. **≥ 2 gates → M** (Ecommerce Scale)
4. **1 gate only → S with its modifier**, added to the weeks and the band
5. **0 gates → S** (Ecommerce Foundation)

Brand positioning does not classify anything. A luxury brand with one market and
a small catalogue is a small engagement; one that wants every template designed
answers the design questions, and the storefront design gate prices those.

**Each band already holds scope-gate weeks** — S none, M two to eight, L nine to
fifteen. Inside that envelope the gates cost nothing more; past it each one is
added to the weeks and to the band. That is what stops an L with a Magento
estate and six markets being quoted the same as an L with neither.

Modifiers are **internal pricing tools only** — the consultant uses them to build
the engagement price; the client proposal always shows a single fixed number.
Two or more active modifiers automatically re-classify the engagement to M.
When multi-currency is the only active gate, the `+Markets` modifier applies.

#### Internal scope modifiers (never shown to a client)

| Modifier | Effort add | Price add |
|---|---|---|
| `+Markets` — Shopify Markets, Translate & Adapt, geo-routing, per market | +1–2.5 wk | +CHF 8–20k |
| `+MultiCurrency` — price lists, rounding, payout and reconciliation per currency | +0.5 wk | +CHF 4–7k |
| `+B2B` — wholesale pricing, company accounts, volume discounts | +1.5 wk | +CHF 10–15k |
| `+Integration` — per live ERP / PIM / CRM / OMS / 3PL connection | +1–3 wk | +CHF 10–30k |
| `+Design (extended)` — bespoke sections from a key-screens design | +1–2 wk | +CHF 8–18k |
| `+Design (bespoke)` — a full template set from a mapped design system | +3–5 wk | +CHF 25–45k |
| `+SKU` — 500+ SKUs, complex variants or bundles | +0.5 wk | +CHF 5–8k |
| `+Migration (light)` — WooCommerce | +1–2 wk | +CHF 8–15k |
| `+Migration (medium)` — Shopware, BigCommerce, an unnamed platform | +3–5 wk | +CHF 22–38k |
| `+Migration (heavy)` — Magento, Salesforce Commerce Cloud, custom | +5–7 wk | +CHF 38–55k |
| `+SEO (standard)` — the redirect map authored, imported and watched | +0.5–1 wk | +CHF 5–10k |
| `+SEO (large)` — 10,000+ URLs, or rankings the business runs on | +1.5–2.5 wk | +CHF 15–25k |
| `+Subscriptions (standard)` — Shopify Subscriptions, selling plans, the portal | +0.5–1 wk | +CHF 6–12k |
| `+Subscriptions (advanced)` — a paid app, or live contracts carried across | +1.5–2.5 wk | +CHF 16–28k |
| `+Checkout (standard)` — checkout and Thank you UI extensions, custom fields | +0.5–1 wk | +CHF 6–11k |
| `+Checkout (functions)` — validation, delivery or payment customisation | +1.5–3 wk | +CHF 16–32k |
| `+Analytics (standard)` — customer events, destinations, consent on each | +0.5–1 wk | +CHF 5–10k |
| `+Analytics (advanced)` — server-side tagging or a third-party consent platform | +1.5–2.5 wk | +CHF 15–26k |
| `+Support (standard)` — written SOPs, or a handover into a retainer | +0.5–1 wk | +CHF 6–11k |
| `+Support (extended)` — both, with the training programme behind it | +1–2 wk | +CHF 12–22k |
| `+Retail` — Shopify POS or integrated POS, per location, up to 5 stores | +1–5 wk | +CHF 8–40k |
| `+Languages` — the fourth language onward | +0.5–2.5 wk | +CHF 6–30k |

**These are the values the engine runs.** `discovery/schema/offering.json` is the
record; `/offering` renders it live, and the tables here are a snapshot of it. If
the two ever disagree, the engine is right and this page is stale.

**Retail roll-outs are never priced per store.** A store with its own line item gets compared to 40 hours of work. Above 5 stores (rule 11.22, WARN) quote the programme and its roll-out increments, or a rate-carded run team.

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
| **Ecommerce Foundation** | S | 0–1 scope gates | A brand starting ecommerce. New Shopify store on the plan the requirements need (ADR 0011) · Horizon theme · core catalogue · payments · standard checkout | CHF 40–65k | 4–5 weeks |
| **Ecommerce Scale** | M | ≥ 2 scope gates | A brand that already sells and cannot scale. Everything in S · the gates that fired, each as its own workstream · the markets, catalogue and systems behind them | CHF 65–145k | 6–14 weeks |

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
| **Ecommerce Growth** | L | A headless requirement, or scope past the M ceiling | A brand already selling professionally on an enterprise platform. The enterprise migration · measurement that stands up · personalisation and experimentation live at launch · the design system built once over one token layer | CHF 140–230k+ | 13–21 weeks |

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
Ecommerce Growth      (L)  ──►  Liquid / Horizon                 scope past the M ceiling
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
Shopify build and Ecommerce Growth prices it. The line is a second system:
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
