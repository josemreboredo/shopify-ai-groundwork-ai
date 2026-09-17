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

> **Machine-readable source:** [`schema/offering.json`](../schema/offering.json) (ADR 0001).
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
| **Markets** | 2 or more Shopify Markets (geo-routing, tax, payments per market) |
| **Multi-currency** | More than one transactional currency (not display-only) |
| **B2B / Wholesale** | B2B customer accounts, wholesale pricing, or volume discounts |
| **Integration** | One or more live connections to ERP, PIM, CRM, or 3PL |
| **SKU complexity** | 500+ SKUs with complex variants, metafields, or product bundling |
| **Migration** | Migration from any non-Shopify ecommerce platform (e.g. Shopware, Magento, WooCommerce, SFCC, BigCommerce) |
| **Retail & POS** | Physical stores selling with Shopify POS or an integrated POS, or omnichannel services (pickup in store, ship from store, in-store returns) — no modifier until priced (ADR 0011) |

**Classification rule:**
- **0 gates → S** (Ecommerce Foundation)
- **1 gate only → S with internal modifier** (price adjusted; client sees one number)
- **≥ 2 gates → M** (Ecommerce Scale)
- **Luxury / headless / full Figma design system → L** regardless of gate count

Modifiers are **internal pricing tools only** — the consultant uses them to build
the engagement price; the client proposal always shows a single fixed number.
Two or more active modifiers automatically re-classify the engagement to M.
When multi-currency is the only active gate, the `+Markets` modifier applies.

#### Internal scope modifiers (Tier 1 only — never shown to client)

| Modifier | Effort add | Price add |
|---|---|---|
| `+Markets` — 2–4 Shopify Markets, Translate & Adapt, geo-routing | +1 week | +€8–12k |
| `+B2B` — wholesale pricing, B2B accounts, volume discounts | +1.5 weeks | +€10–15k |
| `+Integration` — one ERP / PIM / CRM / 3PL live connection | +1–2 weeks | +€10–18k |
| `+Migration` — platform migration, redirect mapping, data transfer | +1–2 weeks | +€8–15k |
| `+SKU` — 500+ SKUs, complex variants or bundles | +0.5 weeks | +€5–8k |

---

### Delivery Tier 1 — Liquid (Horizon theme)

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
| **Ecommerce Foundation** | S | 0–1 scope gates | New Shopify store on the plan the requirements need (Shopify plan benchmark, ADR 0011) · Horizon theme · core catalogue · payments · standard checkout | €40–65k | 4–5 weeks |
| **Ecommerce Scale** | M | ≥ 2 scope gates | Everything in S · plus qualifying gates (markets / B2B / integrations / migration) | €65–100k | 6–9 weeks |

Both S and M are deliverable by Consultant + AI + two part-time collaborators.
No permanent agency headcount required.

---

### Delivery Tier 2 — Hydrogen (headless)

**Stack:** Shopify Hydrogen (React) · Storefront API · Figma design source of truth ·
Figma-to-Hydrogen MCP pipeline (Builder.io Visual Copilot) · Oxygen deployment
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
| **Ecommerce Growth** | L | Luxury / enterprise brand · full Figma design system · headless requirement | Headless Hydrogen storefront · full Figma design system · custom motion + interactions · Storefront API · Oxygen · advanced personalisation | €100–150k+ | 10–14 weeks |

L requires one senior Figma designer and one senior Hydrogen developer as project
contractors. Scope gates do not apply — L is triggered by brand and technical
positioning, not gate count.

---

### Offer-to-tier reference

```
Ecommerce Foundation  (S)  ──► Delivery Tier 1 (Liquid / Horizon)   0–1 gates
Ecommerce Scale       (M)  ──► Delivery Tier 1 (Liquid / Horizon)   ≥ 2 gates
Ecommerce Growth      (L)  ──► Delivery Tier 2 (Hydrogen headless)  luxury/headless trigger
```

---

## Discovery engine — input/output contract

The discovery engine ([`agents/discovery/`](../agents/discovery/README.md), `npm run discover`) is the
**first stage of the delivery pipeline**; it replaced the Python Frame Agent. It reads a completed questionnaire — or,
from Phase 5, a chatbot interview — and produces the engagement spec.

### Inputs

| Input | Source |
|---|---|
| Completed questionnaire | Generated template [`docs/discovery/client-questionnaire.md`](discovery/client-questionnaire.md); worked example [`example-acme-questionnaire.md`](discovery/example-acme-questionnaire.md) |
| Question definitions | [`schema/question-bank.json`](../schema/question-bank.json) — each question maps to engagement fields and feeds gates / exit rules |
| Offering rules | [`schema/offering.json`](../schema/offering.json) |

Questionnaire sections: § 0 Business outcomes · § 1 Company, brand & Shopify · § 2 Catalogue ·
§ 3 Markets · § 4 Payments & checkout · § 5 Shipping & fulfilment · § 6 Customers, B2B & privacy ·
§ 7 Marketing & promotions · § 8 Integrations & migration · § 9 Design & experience ·
§ 10 Delivery, governance & compliance. Exit rules (§ 11) are listed in the consultant guide only, not in the client questionnaire (ADR 0011).

### Outputs (`clients/<slug>/`, gitignored)

| File | Contents |
|---|---|
| `engagement.json` | Single source of truth, validated by [`schema/engagement.schema.json`](../schema/engagement.schema.json) (ADR 0002) |
| `delivery-plan.md`, `capability-map.md`, `app-shortlist.md`, `risks.md` | Renderings of `engagement.json` — on GO |
| `stop-report.md` | Open STOP rules, evidence and resolution path — on STOP (no GO artefacts are written) |

The LLM extracts answers; deterministic code computes scope gates, the offer and exit rules
(ADR 0001, 0003). The engine refuses to run without recorded consent (ADR 0007).

### Exit rules (§ 11)

The canonical list is `offering.json → exit_rules` (ADR 0003). Summary:

| Rule | Condition | Result |
|---|---|---|
| 11.1 | A required Shopify feature needs a higher plan than the target plan (Shopify plan benchmark; B2B runs on every plan from Basic) | STOP |
| 11.2 | B2B with RFQ / negotiated pricing | FLAG → B2B architecture review (draft-order review or quote app) |
| 11.3 | More than 5 markets at launch | STOP → Larger Engagement |
| 11.4 | More than 6 distinct languages | STOP → Larger Engagement |
| 11.5 | More than 3 variant options, or more than 2,048 variants, per product | FLAG → Product model review (combined listings, options app) |
| 11.6 | Custom checkout UI (not Checkout Extensibility) | STOP → Composable platform |
| 11.7 | More than 3 integrations at launch | STOP → Larger Engagement |
| 11.8 | Regulated industry | STOP → Legal review |
| 11.9 | PCI scope beyond Shopify-hosted payments | STOP → Security review |
| 11.10 | GDPR/CCPA export or deletion workflow | FLAG |
| 11.11 | Grow retainer not signed (M/L) | WARN — quote +25% |
| 11.12 | ERP or PIM with no connector and no iPaaS | FLAG → Integration scoping track |
| 11.13 | More than 2 fulfilment locations with complex routing | FLAG → Multi-location scoping |
| 11.14 | Migration with significant SEO equity or historical data | FLAG → Migration scoping track |
| 11.15 | Go-live sooner than the offer's minimum duration | FLAG → Re-scope to MVP first |
| 11.16 | No single decision-maker or unclear budget authority | FLAG → Resolve before statement of work |
| 11.17 | Sensitive personal data (health, age, biometric, financial) | FLAG → DPIA and legal sign-off |
| 11.18 | Existing store uses deprecated Shopify features (Scripts, checkout.liquid, legacy accounts, Stocky) | FLAG → Deprecation migration workstream |
| 11.19 | B2B needs Shopify B2B does not support | FLAG → B2B architecture review |
| 11.20 | Mainland China is a launch market (Great Firewall: ICP licence, onshore hosting) | FLAG → Excluded from the offering; separate China discovery |
| 11.21 | Mainland China is the only launch market | STOP → China discovery |

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
