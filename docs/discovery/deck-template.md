# Discovery Closing Deck — Section Specification

> **Purpose:** Defines every section of the Discovery Closing Document produced by
> `agents/discovery-deck/build_xml.js`. Each section maps to an XML element in
> `discovery-deck.xml`, which the consultant pastes into Claude with `deck-prompt.md`
> to generate the final PDF.
>
> **Audience:** Lead consultant presenting to a client executive at the close of
> the discovery phase. Tone: confident, structured, commercially aware.
>
> **Source data:** All content is derived from the questionnaire, store-spec.yaml,
> Frame Agent outputs (capability-map, delivery-plan, app-shortlist, risks), and
> the user-story JSON. No data is invented.

---

## Section 1 — Cover

| Field | Source |
|---|---|
| Client name | `store-spec.store.name` |
| Project name | `store-spec.store.project_name` or `"Shopify [Tier] Implementation"` |
| Consultant name | `store-spec.delivery.consultant` |
| Date | generation date (ISO 8601) |
| Confidentiality notice | static: `"Confidential — prepared for [Client] by [Consultant]"` |

---

## Section 2 — Executive Summary

**Purpose:** Three bullets. Problem → Solution → Outcome. C-suite readable in 30 seconds.

| Field | Source |
|---|---|
| Core problem | questionnaire §0.1 — single biggest problem |
| Proposed solution | tier + platform + top 2 capabilities |
| Expected outcome | questionnaire §0.4 — 12-month success metric |
| Engagement tier | `store-spec.tier.selected` |
| GO / STOP status | `store-spec.delivery.go` |

> **Rule:** if `go=false`, this section leads with the STOP reason and exit path only.
> Sections 3–18 are omitted in STOP mode.

---

## Section 3 — Business Context

| Field | Source |
|---|---|
| Revenue & conversion gaps | questionnaire §0.2 |
| Operational pain points | questionnaire §0.3 |
| 12-month growth goals | questionnaire §0.4 |
| Hard deadline (if any) | questionnaire §0.4 — external deadline |
| Budget envelope | questionnaire §0.6 |
| Budget priority | questionnaire §0.6 — minimise cost vs. own the solution |

---

## Section 4 — Discovery Methodology

| Field | Source |
|---|---|
| Questionnaire sections completed | auto-detected from which §§ have answers |
| Artefacts produced | questionnaire · store-spec · capability-map · delivery-plan · app-shortlist · risks · user stories |
| Methodology | static: `"Gaia-governed delivery · LWC biota · T1–T4 tier system"` |

---

## Section 5 — As-Is State

| Field | Source |
|---|---|
| Current platform | questionnaire §0.5 / §1 |
| Migration type | questionnaire §3 (greenfield / rebuild / extension / migration) |
| What must be preserved | questionnaire §0.5 |
| Top 3 pain points | questionnaire §0.5 |
| Current performance metrics | questionnaire §0.2 — conversion rate, revenue |

---

## Section 6 — Solution Design & Shopify Architecture

| Field | Source |
|---|---|
| Platform tier | `store-spec.tier.selected` |
| Shopify plan recommended | derived from tier + B2B flag (Plus if B2B) |
| Architecture pattern | multi-market / single-market / headless / standard |
| Theme approach | `store-spec.theme.*` |
| Markets & i18n | `store-spec.markets.*` |
| Checkout approach | `store-spec.checkout.*` |
| Payment providers | `store-spec.payments.providers` |
| B2B setup | `store-spec.catalogue.b2b` |
| Key integrations | `store-spec.integrations.*` |
| Architecture diagram | text-based block diagram (Claude generates from above fields) |

**Diagram template Claude fills:**
```
┌─────────────────────────────────────────────────────┐
│              SHOPIFY [PLAN]                         │
│  ┌─────────────┐   ┌──────────────┐               │
│  │  Storefront │   │  Admin / API │               │
│  │  [THEME]    │   │  [MARKETS]   │               │
│  └──────┬──────┘   └──────┬───────┘               │
│         │                 │                        │
│  ┌──────▼─────────────────▼───────┐               │
│  │        Shopify Core            │               │
│  │  Catalogue · Orders · Accounts │               │
│  └──────────────┬─────────────────┘               │
│                 │                                  │
│  ┌──────────────▼─────────────────┐               │
│  │     Integrations               │               │
│  │  [ERP] · [CRM] · [3PL]        │               │
│  └────────────────────────────────┘               │
└─────────────────────────────────────────────────────┘
```

---

## Section 7 — Capability Map

| Field | Source |
|---|---|
| Requirements table | `capability-map.md` parsed rows |
| Resolution legend | Native ✅ / App 📦 / Theme 🎨 / Custom 🔧 |
| Gaia tier per requirement | from capability-map rows |

**Rule:** order is Native → App → Theme → Custom.

---

## Section 8 — Scope & Implementation Approach

| Field | Source |
|---|---|
| Phase 1 tasks | `delivery-plan.md` Phase 1 |
| Phase 2 tasks | `delivery-plan.md` Phase 2 (if present) |
| Out-of-scope items | `store-spec.exits.*` + deferred/rejected items |
| Approach | static: `"Agile sprint delivery · T1–T4 gated · consultant-approved plans"` |

---

## Section 9 — App Recommendations

| Field | Source |
|---|---|
| Recommended apps | `app-shortlist.md` recommended section |
| Apps NOT recommended | `app-shortlist.md` rejected section |
| Total monthly app cost | sum from app-shortlist cost column |
| Total annual app cost | monthly × 12 |

---

## Section 10 — Customisation vs Configuration Split

| Category | Definition |
|---|---|
| Configuration % | stories with complexity XS or S, domain NOT theme/store-identity |
| Theme % | stories with domain `store-identity` or containing `theme` |
| Custom development % | stories with complexity L or XL |

> Interpretation note (static): "Higher configuration % = lower risk and faster delivery."

---

## Section 11 — Initial Estimate per Epic

| Field | Source |
|---|---|
| Epic name | domain slug → human label |
| Story count | count per domain |
| Story points | XS=0.5 · S=1 · M=2 · L=4 · XL=8 |
| Days low | points × 0.8 |
| Days high | points × 1.4 |
| Total | sum of all epics |
| Confidence | static: `"±30% indicative; refined in sprint planning"` |

**Complexity → points:**

| Size | Points | Low days | High days |
|------|--------|----------|-----------|
| XS   | 0.5    | 0.4      | 0.7       |
| S    | 1      | 0.8      | 1.4       |
| M    | 2      | 1.6      | 2.8       |
| L    | 4      | 3.2      | 5.6       |
| XL   | 8      | 6.4      | 11.2      |

---

## Section 12 — Risks & Mitigations

| Severity | Source |
|---|---|
| 🔴 Hard blockers | `risks.md` hard blockers section |
| 🟡 Flags | `risks.md` flags section |
| 🟠 Open items | `risks.md` open items section |
| 🔵 Assumptions | `risks.md` assumptions section |

**Rule:** every 🔴 risk needs a named owner + resolution deadline before GO.

---

## Section 13 — Out of Scope

| Field | Source |
|---|---|
| Exit-triggered exclusions | `store-spec.exits.reasons` |
| Deferred to Phase 2 | `delivery-plan.md` rows marked deferred |
| Standard exclusions (static) | content migration · SEO copywriting · photography · third-party SLAs · post-launch support (unless retainer signed) |

---

## Section 14 — Open Questions & Next Steps

| Field | Source |
|---|---|
| Open questions | `risks.md` open items |
| Client actions required | `risks.md` flags — "action required" column |
| Next milestone | static: `"Discovery sign-off → Sprint 1 kick-off"` |
| Sign-off requirement | static: `"Client confirms: scope · out-of-scope list · risk register"` |

---

## Section 15 — Timeline

| Field | Source |
|---|---|
| Phase 1 sprint count | ceil(total_days_high / 10) |
| Phase 2 sprint count (if applicable) | same |
| Go-live target | questionnaire §0.4 — external deadline |
| Key milestones | Sprint 1 kick-off · Phase 1 complete · UAT · Go-live |
| Buffer | static: `"+20% contingency built into day-range estimates"` |

---

## Section 16 — Investment Summary

| Field | Source |
|---|---|
| Budget envelope (stated) | questionnaire §0.6 |
| Delivery cost range | `[days-low × RATE]` – `[days-high × RATE]` (rate = `[CONSULTANT RATE]` placeholder) |
| Monthly app cost | app-shortlist total |
| Annual app cost | monthly × 12 |
| Shopify plan cost | derived from plan recommendation |
| Total year-1 estimate | delivery + annual apps + Shopify plan |
| Note | static: `"Indicative. Fixed-price quote issued after sprint planning."` |

---

## Section 17 — Appendix A: Full User Story List

All stories: `slug · domain · complexity · title`. Full prompts excluded (size).

---

## Section 18 — Appendix B: Full Capability Map

Complete capability-map table + full app-shortlist including rejected apps.

---

## XML output contract

`build_xml.js` must produce XML that:

1. Is valid XML (UTF-8, no entity errors)
2. Has one `<section id="...">` per section above
3. Uses `<missing reason="..."/>` for any absent source field
4. Includes a `<warnings>` block listing all missing/defaulted fields
5. Keeps story appendix compact (slug + title + complexity only — no full prompts)
6. Stays under 100 KB for typical engagements
