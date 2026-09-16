# shopify-ai-builder — Product Strategy

> **Status:** Approved · **Date:** 2025-06 · **Owner:** Jose Reboredo

---

## What this is

`shopify-ai-builder` is a Gaia-governed AI delivery tool for a solo functional
(non-technical) Shopify consultant. The consultant describes what a client needs
in plain language; AI agents produce a scoped delivery plan, recommend Shopify
apps, and implement the solution — no technical team required.

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

### Phase 1 — Foundation ✅ (approved, in progress)
- Install Shopify AI Toolkit plugin in Claude Code
- Authenticate Shopify CLI against a dev store
- Write `docs/conventions/` files to give the agent Shopify domain knowledge
- **Gate:** Agent can interact with a real Shopify store safely

### Phase 2 — Discovery → Plan loop
- Consultant describes requirement → agent maps to Shopify capabilities
- Agent recommends: native feature vs app vs custom code
- Agent produces a Gaia-tiered delivery plan
- Consultant approves before anything is touched
- **Gate:** Consultant can scope a client project in a conversation, producing
  a professional plan, without writing a single spec document

### Phase 3 — Execution layer
Implementations in priority order:

| Priority | Capability | Why first |
|---|---|---|
| 1 | Theme customisations (Liquid sections, schema, CSS) | Low risk, high frequency, immediately visible |
| 2 | App configuration guidance | No code risk, huge time-saver |
| 3 | Metafields / metaobjects | Unlocks complex requirements, reusable pattern |
| 4 | Storefront API / Hydrogen | Only when client needs headless |

---

## Service offers & delivery tiers

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
| **Migration** | Platform migration from Shopware, Magento, WooCommerce, or SFCC |

**Classification rule:**
- **0 gates → S** (Ecommerce Foundation)
- **1 gate only → S with internal modifier** (price adjusted; client sees one number)
- **≥ 2 gates → M** (Ecommerce Scale)
- **Luxury / headless / full Figma design system → L** regardless of gate count

Modifiers are **internal pricing tools only** — the consultant uses them to build
the engagement price; the client proposal always shows a single fixed number.
Two or more active modifiers automatically re-classify the engagement to M.

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
| **Ecommerce Foundation** | S | 0–1 scope gates | New Shopify Plus store · Horizon theme · core catalogue · payments · standard checkout | €40–65k | 4–5 weeks |
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

## Frame Agent — input/output contract

The Frame Agent is the **first agent in the delivery pipeline**. It is not a chatbot.
It is a governed sub-agent that reads a completed discovery questionnaire and produces
a structured delivery spec — no back-and-forth required.

### Pipeline position

```
CONSULTANT fills in                FRAME AGENT runs                 DOWNSTREAM AGENTS consume
──────────────────────             ─────────────────────            ────────────────────────
docs/discovery/                    agents/frame-agent/              clients/<slug>/
  <client>-questionnaire.md  ──►   frame_agent.py          ──►       store-spec.yaml
  (§ 0–11 completed)               --questionnaire flag               delivery-plan.md
                                                                       capability-map.md
                                                                       app-shortlist.md
                                                                       risks.md
```

### How to trigger it

```bash
# Standard run — reads a completed questionnaire, writes spec to clients/<slug>/
python agents/frame-agent/frame_agent.py \
  --questionnaire docs/discovery/acme-questionnaire.md

# Dry run — prints spec to stdout, nothing written
python agents/frame-agent/frame_agent.py \
  --questionnaire docs/discovery/acme-questionnaire.md \
  --dry-run
```

### What it reads (input)

A completed `docs/discovery/<client>-questionnaire.md` containing:

| Section | What it drives |
|---------|----------------|
| § 0 — Business problems & growth blockers | Primary brief; frames outcome over inventory |
| § 1 — Business & brand | Client slug, Shopify plan, brand tier |
| § 2 — Catalogue & products | SKU count, variant depth, bundles → tier signal |
| § 3 — Markets & internationalisation | Market count, languages → exit-trigger check |
| § 4 — Payments & checkout | Payment providers, checkout complexity |
| § 5 — Shipping & fulfilment | 3PL, carriers, rules complexity |
| § 6 — Customer & account | B2B flag, loyalty, account portal |
| § 7 — Marketing & analytics | Tracking stack, email platform, GA4 |
| § 8 — Integrations & tech stack | Integration count → exit-trigger check |
| § 9 — Design & UX | Theme choice, Figma source, motion |
| § 10 — Operations & timeline | Launch date, team size, constraints |
| § 11 — Exit-trigger screening | Hard blockers; agent stops on first STOP trigger |

### What it writes (output)

On **GO** — all of these are written to `clients/<slug>/`:

| File | Contents |
|------|----------|
| `store-spec.yaml` | Structured project spec — tier, markets, integrations, flags |
| `delivery-plan.md` | Phased delivery breakdown with Gaia tier assignments (T1–T4) |
| `capability-map.md` | Requirement → Shopify capability (native → app → theme → custom) |
| `app-shortlist.md` | Recommended apps with cost, limitations, integration complexity |
| `risks.md` | Flagged risks, ambiguities, and items requiring consultant confirmation |

On **STOP** — nothing is written. The agent prints the exit reason and stops.
The consultant resolves the blocker and re-runs.

### Exit triggers (§ 11 mapping)

| § 11 row | Condition | Result |
|----------|-----------|--------|
| 11.1 | Shopify Plus feature required on Standard plan | STOP |
| 11.2 | B2B with RFQ / custom negotiated pricing | STOP (Plus prereq) |
| 11.3 | Markets count > 5 | STOP → Scale programme |
| 11.4 | Languages count > 6 | STOP → Scale programme |
| 11.5 | Variant options > 3 per product | STOP → Architecture review |
| 11.6 | Custom checkout UI (not Checkout Extensibility) | STOP → Composable platform |
| 11.7 | Integrations count > 3 at launch | STOP → Bespoke quote |
| 11.8 | Regulated industry (pharma, firearms, financial advice) | STOP → Legal review |
| 11.9 | PCI scope beyond Shopify Payments | STOP → Security review |
| 11.10 | GDPR/CCPA data export or deletion workflow required | Flag only (not a hard stop) |
| 11.11 | Grow retainer not signed (Medium/Large tier) | Warning printed; quote +25% |

---

## What we are NOT building (MVP scope boundary)

- ❌ A multi-tenant SaaS product
- ❌ A UI / dashboard (Claude Code conversation IS the UI)
- ❌ Automated deployment without consultant approval
- ❌ An app recommendation database (agent uses live knowledge)
- ❌ Non-Shopify e-commerce work

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
