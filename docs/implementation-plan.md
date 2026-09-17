# Implementation Plan — shopify-ai-builder

> **Status:** Approved (D1–D7 accepted 2026-09-16) · Phase 0 released (v0.1.0) · Phase 1 released (v0.2.0) · Phase 2 released (v0.3.0) · Phases 3–4 released (v0.4.0) · Phase 5 released (v0.5.0), pilot pending · Larger Engagement and Lead Consultant deck released (v0.5.1) · Shopify-knowledge questionnaire released (v0.6.0) · Retail pricing, tax and shipping workbook released (v0.6.1) · consistency fixes (v0.6.2) · discovery and build tools split (v0.7.0) · **Date:** 2026-09-16 · **Owner:** Jose Reboredo
> **Input:** whole-project review (2026-09-16) — discovery chain, pipeline code/security, build layer.
> **Methodology:** Gaia tiers T1–T4 (`gaia/methodology/feature-tiers.md`). Estimates are indicative
> (one lead + AI agents) and are re-baselined at the end of Phase 1.

---

## Goal

A tool Merkle Shopify Lead Consultants use to run a client engagement end to end:

```
Interview (questionnaire → chatbot)
   → engagement spec (offer S/M/L, gates, exits, requirements)
      → implementation approach (capability map · app shortlist · risks · delivery plan)
         → Discovery Closing Deck
         → Jira backlog
            → Build (Commerce Agent + Theme Agent, per offering)
```

## Guiding decisions (accepted 2026-09-16)

| # | Decision | Recommendation | Why |
|---|---|---|---|
| D1 | What price does the client deck show? | Offer price band (S/M/L); modifiers and day ranges stay internal. *Amended by ADR 0010: the generated deck is the Lead Consultant's full-information draft; the LC filters before sharing* | `docs/strategy.md` — client sees one number, modifiers never shown |
| D2 | Source of truth between pipeline stages | One `engagement.json` validated by JSON Schema; Markdown/XML/Jira are renderings of it | Today 3 incompatible spec shapes; deck parses Markdown nothing generates |
| D3 | Frame Agent runtime | Port to Node (same runtime, one schema validator) | Only Python component; duplicated field logic drifted |
| D4 | Dependency policy | Allow a small vetted set: `@anthropic-ai/sdk`, `ajv`, `yaml` | Hand-rolled YAML parser is the source of several data-loss bugs |
| D5 | Bucherer theme copies | Move to a private client repo; harvest anonymised sections later | Client trademarks/copyright in a shared tooling repo |
| D6 | Chatbot surface | Decide after consultant validation (Phase 5); pilot as Claude Code skill | Strategy currently says "no UI / not a chatbot" |
| D7 | Jira | Sandbox project + Atlassian Rovo connector authorised | Needed for Phase 4 push |

---

## ⚠ Adoption gate — Claude account (open)

- [ ] **Migrate Claude Code usage from the personal Claude Pro account to dentsu's Claude Enterprise** before
  dentsu / Merkle adoption, onboarding other consultants, or processing real client data at scale (ADR 0007).
  Interim rule until then: "use my chats to improve models" switched off; prefer example or anonymised questionnaires.

## Phase overview

| Phase | Scope | Gaia tier | Indicative effort | Depends on |
|---|---|---|---|---|
| **0** | Security hygiene + crash fixes + test harness | T1/T2 | 1–2 days | — |
| **1** | Foundation: offering model + engagement schema v1 + question bank | **T4** | 1–1.5 weeks | 0 |
| **2** | Discovery engine v2 (Frame Agent rewrite) | T3 | 1.5–2 weeks | 1 |
| **3** | Discovery Closing Deck on engagement.json | T2 | 3–4 days | 2 |
| **4** | Jira-ready backlog + export/push | T3 | 1.5–2 weeks | 2 |
| **5** | Consultant interview chatbot | **T4** | 3–4 weeks (after validation) | 1, 2 |
| **6** | Build layer: Commerce Agent + Theme Agent | T3 each | 3–5 weeks | 1, 4 |

```
P0 ─► P1 ─► P2 ─┬─► P3
                ├─► P4 ─► P6 (build execution)
                └─► P5
      P1 ─────────────► P6a/P6b groundwork can start in parallel with P2
```

---

## Phase 0 — Hygiene & unblock (T1/T2)

**Security (do first)**
- [x] `.gitignore`: `.env*` + `!.env.example`, `clients/`, `__pycache__/`, `*.pyc`; add `.env.example` with names only
- [x] Delete `.envx` (byte-identical duplicate of `.env`; now gitignored); rotate the Shopify Admin token if there is any doubt it left the machine
- [x] Move `themes/bucherer/` and `bucherer-theme/` out of this repo (D5)
- [x] Frame Agent: sanitise client slug (reject `..`, `/`, absolute paths) before writing under `clients/`

**Crash fixes that block any end-to-end run** (each with a regression test)
- [x] `scripts/generate-stories.js:25-28` — imports resolve to `scripts/scripts/…`
- [x] `scripts/generate-stories/parseSpec.js:418-424` — `marketList` always `[]`
- [x] `scripts/questionnaire/questionnaire.js:483-485` — missing `--output` resolves to `argv[0]` (Node binary)
- [x] `discovery/agents/frame-agent/frame_agent.py:429-430` — spec written on STOP
- [x] `discovery/agents/frame-agent/frame_agent.py:399-407` — `--interactive` never builds a spec (fix or remove flag)

**Harness**
- [x] `npm test` using `node:test`; fixtures in `discovery/tests/fixtures/`
- [x] Commit the current untracked work (`discovery/agents/discovery-deck/`, `build/lwc-library/`, `scripts/`, `discovery/docs/`) as a clean baseline once the above is done

**Exit criteria:** `git status` shows no secrets or client data; `npm test` green; `generate-stories` runs on both fixtures.

---

## Phase 1 — Foundation: offering + engagement schema v1 (T4)

This is a Foundation update, not a sprint: every later phase consumes its output.
Roles: Strategy (offering), Architect (schema), BA (question bank), Sec (data handling), PO.

### 1.1 ADRs (`docs/adr/`)
| ADR | Decision |
|---|---|
| 001 | Offer model: S/M/L in EUR, six scope gates, internal modifiers, L = luxury/headless/Figma trigger. Retire `starter/medium/large` + CHF bands |
| 002 | `engagement.json` + JSON Schema as single source of truth; runtime Node (D2–D4) |
| 003 | Canonical §11 exit list (strategy.md is authoritative; questionnaire copies it) |
| 004 | Market presets: CH/DACH becomes an opt-in preset, not schema defaults |
| 005 | Horizon is the Delivery Tier 1 base theme |
| 006 | Jira is system of record after first push; generator upserts by stable story key |
| 007 | LLM data handling: consent flag, redaction of personal data, model choice, retention |

### 1.2 Engagement schema v1 (`contracts/engagement.schema.json`)
Top-level blocks, one naming convention (snake_case) shared by prompt, code and renderers:

- `meta` — schema_version, client {name, slug, industry, hq_country}, consultant, dates, consent
- `business` — problems, kpis [{metric, baseline, target, horizon}], budget {min, max, currency, priority}, deadline
- `stakeholders` — [{role, raci, decision_maker}] (names optional, redacted before LLM)
- `offer` — code (S/M/L), delivery_track (liquid/hydrogen), scope_gates {markets, multi_currency, b2b, integration, sku_complexity, migration} each `{active, evidence}`, modifiers[], price_band {currency, min, max}, l_triggers {luxury, headless, figma_system}
- `markets`, `catalogue`, `payments`, `checkout`, `shipping`, `customers`, `b2b`, `promotions`, `apps`
- `integrations` — [{system, category (erp/pim/crm/3pl/other), direction, objects, frequency, connector}]  — one definition of "integration" (ADR 001)
- `migration` — source_platform, volumes {products, customers, orders, redirects}
- `design` — theme, figma_scope, brand tokens, a11y_target, performance NFRs
- `compliance` — regulated_industry, pci_scope, gdpr_deletion, cookie_consent
- `exits` — triggered, reasons [{rule_id, detail, source: rule|llm, evidence}]
- `delivery` — go, grow_retainer {signed, months}, kickoff, launch
- `approach` — capability_map[], app_shortlist[], risks {blockers, flags, open_items, assumptions}, phases[]
- `jira` — project_key, components
- `provenance` — per answer: source (client/consultant/inferred), status (confirmed/tbc)

### 1.3 Question bank (`discovery/schema/question-bank.json`)
One question list that drives the Markdown questionnaire, the Frame Agent prompt mapping and (Phase 5) the chatbot.
Each question: `id`, `section`, `text`, `answer_type`, `maps_to` (JSON pointer), `skip_if`, `feeds` (gate / exit rule).
- [x] Add missing questions: market count, target Shopify plan, B2B RFQ, luxury/headless/Figma triggers, source platform + migration volumes, integration detail, GDPR deletion, Grow retainer, KPIs baseline/target, stakeholders/RACI, Jira project
- [x] Regenerate `discovery/docs/client-questionnaire.md` from the bank (fixes duplicate 2.2, §11 mismatch)
- [x] Renumber `discovery/docs/example-acme-questionnaire.md`; resolve its contradictions (plan vs B2B, retainer)

### 1.4 Documentation
- [x] Update `docs/strategy.md`: multi-consultant Merkle tool, chatbot as target interview surface, pipeline diagram
- [ ] Align `build/lwc-library/README.md` tier table with ADR 001

**Status (2026-09-16):** schema, question bank (184 questions; 210 after the post-purchase additions in Phase 4), offering, generated questionnaire,
ACME example and three golden fixtures delivered; contract + fixture tests green.
ADRs 0001–0007 accepted and offering questions resolved (2026-09-16) — see `offering.json → resolved_questions`.

**Exit criteria (met):** ADRs 001–007 accepted; schema validates three golden fixtures —
`acme` (expected **M / GO**), `foundation-minimal` (**S / GO**), `stop-custom-checkout` (**STOP**);
every gate and exit rule traces to ≥1 question and ≥1 schema field (automated traceability test).

---

## Phase 2 — Discovery engine v2 (T3)

Runtime LLM + client personal data → threat model and test strategy required before build.

**Design principle:** the LLM extracts, code decides.
- [x] `discovery/agents/discovery/extract.js` — questionnaire → `engagement.json` via structured output against the schema; validate, check `stop_reason` *(no automatic retry on schema errors — the run fails and reports the errors)*
- [x] `discovery/agents/discovery/classify.js` — pure functions: scope gates → offer, L triggers, modifiers, price band (ADR 001)
- [x] `discovery/agents/discovery/exits.js` — canonical §11 rules; LLM-detected exits are **merged** (with evidence), never overwritten; null-safe
- [x] `discovery/agents/discovery/approach.js` — capability map (Native → App → Theme → Custom), app shortlist (costs flagged "verify"), assumptions, phases
- [ ] Validate app and capability recommendations against live Shopify docs (Shopify AI Toolkit) — deferred
- [x] Consent gate: refuse to call the LLM without `meta.consent`; redact stakeholder names/emails before the call
- [x] Renderers: `delivery-plan.md`, `capability-map.md`, `app-shortlist.md`, `risks.md` from `engagement.json`; on STOP write `stop-report.md` only
- [x] CLI: `npm run discover -- --questionnaire <path> [--client <slug>] [--dry-run]` (API mode)
- [x] Claude Code mode: `/discover` skill + `discover:prepare|assemble|finish` — no API billing (ADR 0007 amendment)
- [x] Retire `discovery/agents/frame-agent/frame_agent.py` (brief / interactive modes return with the Phase 5 chatbot)
- [ ] Record explicit "none" answers for free-text fields (e.g. no affiliate platform) distinctly from unknown
- [ ] Render filled questionnaires (e.g. the ACME example) from `engagement.json` with the committed renderer

**Tests:** unit tests for classify/exits on all golden fixtures ✓; recorded-response tests for the full pipeline ✓; live run on the ACME example ✓ (Claude Code mode, 2026-09-16: M / GO, FLAGs 11.10 and 11.14, extraction valid on first attempt).

**Exit criteria:** ACME → M / GO with all four artefacts ✓ (recorded responses); STOP fixture → no GO artefacts ✓; zero schema errors ✓; threat model filed ✓ (`discovery/docs/architecture/discovery-engine-threat-model.md`). Live run on ACME ✓ (Claude Code mode).

---

## Phase 3 — Discovery Closing Deck (T2)

- [x] Rebuild the deck on `engagement.json` (+ `backlog.json`): `discovery/agents/discovery-deck/build.js`; Markdown parsing removed
- [x] Internal effort comes from backlog story points in `deck-internal-notes.md` (`estimateCalc.js` removed)
- [x] Investment section = offer price band (D1); modifiers, price adds, points and commercial warnings only in `deck-internal-notes.md`; XML write refused on leaks; `npm run deck:check` scans the final deck
- [x] Known issues fixed: STOP from `delivery.go`, percentages sum to 100, no local paths in output, control-character regex built without raw bytes
- [x] `deck-template.md` + `deck-prompt.md` rewritten; `npm run deck -- --client <slug>`; `/deck` skill writes `discovery-deck.md` in Claude Code
- [x] Tests: GO sections, STOP sections, band only, leak guards, internal notes, percentages (`discovery/tests/unit/deck.test.js`)

**Exit criteria:** ACME deck generated and reviewed by one lead consultant; no internal pricing in client output.

---

## Phase 4 — Jira-ready backlog (T3)

- [x] Story model v2: `key` (stable, e.g. `LWC-MKT-003`), `epic`, user-story `title`, `description`, `acceptance_criteria[]` (Given/When/Then), `dod`, `gaia_tier`, `points`, `depends_on[]`, `labels` (offer, gate, domain), `component`, `spec_ref` (JSON pointer), `security_flags`, `agent_prompt` (separate)
- [x] Guards read the engagement schema; prompts are functions of the engagement
- [ ] Correct Horizon/OS2 content (custom sections, back-in-stock, hreflang, cookie consent incl. CH)
- [ ] New domains: migration & redirects, shipping & tax, customer accounts & B2B, page builds (home/PDP/PLP/cart/nav), analytics & consent, accessibility & performance, QA/UAT, launch/cutover, training/hypercare
- [ ] Sanity check: backlog points vs offer weeks — deferred (needs an agreed velocity; points and duration are shown side by side in `deck-internal-notes.md`)
- [x] Export 1: Jira CSV import file (`npm run backlog -- --client <slug>`)
- [ ] Export 2: Jira push via Atlassian Rovo MCP / REST — dry-run default, consultant approval, idempotent upsert by `key` — deferred (CSV first, decision 2026-09-16)

**Tests:** every guard fires for ≥1 fixture; every active gate yields ≥1 story; CSV snapshot; re-push creates no duplicates.

**Exit criteria:** ACME backlog imported into a sandbox Jira project; second run updates, does not duplicate.

---

## Phase 5 — Consultant interview chatbot (T4)

Starts with validation (Gaia Track A `01-validation`) with 2–3 Merkle Lead Consultants.
- [x] Adaptive interview driven by `question-bank.json` (consent first, modes, `skip_if`, gate-feeding questions first) — `discovery/agents/interview/`, `/interview` skill
- [x] Live preview: gates (active / inactive / unknown), provisional offer, exits, app signals, coverage
- [x] Answer provenance (client vs consultant), consultant notes, TBC / skip, resumable sessions; any language, stored in English
- [x] Output identical decisions to the questionnaire path (parity test on all golden fixtures)
- [x] Surface decision (D6): consultant-run Claude Code skill (ADR 0008); hosted client pre-fill revisited after the pilot
- [ ] Validation pilot with 2–3 Merkle lead consultants (`discovery/docs/validation/interview-chatbot-validation.md`)

**Exit criteria:** one consultant completes an ACME-equivalent interview; output passes the same golden tests as Phase 2.

---

## Phase 6 — Build layer (T3 per agent)

**6a Commerce Agent** (replaces the removed demo-store shell scripts, `build/`)
- [ ] Node module reading `engagement.json`: locations, markets, locales, price lists, catalogs, shipping, taxes
- [ ] Lookup-then-create (idempotent), fail on `userErrors`, current Admin API version, dev-store guard + `CONFIRM PRODUCTION` prompt, dry-run plan diff, verify step (store vs spec)

**6b Theme Agent**
- [ ] Horizon base (ADR 005); converter LWC tokens → `settings_data.json` (colour schemes, font handles, radius)
- [ ] Harvest `buch-*` sections into brand-neutral `build/lwc-library/components/`
- [ ] Theme Check in CI; self-hosted fonts (GDPR)

**6c Conventions:** `docs/conventions/shopify-theme.md`, `shopify-api.md` (app/hydrogen when needed)

**6d Backlog → build:** agent takes a Jira story by key, uses `agent_prompt` + `spec_ref`, opens PR, links back to Jira; Gaia plan-approval gate on T2+.

**Deferred:** Delivery Tier 2 (Hydrogen, offer L) — ADR on whether L is sold before it exists.

**Exit criteria:** ACME dev store configured and themed from `engagement.json`; re-run is a no-op; verify step green.

---

## Cross-cutting

- **CI (GitHub Actions):** `npm test`, schema validation of fixtures, secrets scan, semgrep, Theme Check
- **Security gates:** threat model for Phases 2, 4 (Jira), 5, 6a; PII redaction tests
- **Docs:** ADRs per decision; `docs/learnings.md` after each phase; Confluence mirror once Atlassian is authorised
- **Superseded:** the in-progress deck plan (parse Frame Agent Markdown) is replaced by Phase 3. `estimateCalc.js` is reused; `parseMarkdown.js` and the `parseSpec.js` list patch become obsolete when D2–D4 land.
