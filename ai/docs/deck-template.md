# Discovery Closing Deck — Section Specification

> **Purpose:** the Discovery Closing Document a Merkle lead consultant presents to the client at the end of
> discovery. Data comes from `clients/<slug>/engagement.json` (and `backlog.json` when generated) through
> `npm run deck -- --client <slug>`, which writes `discovery-deck.xml`. The `/deck` skill (or
> [`deck-prompt.md`](deck-prompt.md) pasted into Claude) turns the XML into `discovery-deck.md`.
>
> **Lead Consultant draft (ADR 0010):** the deck is delivered to the Lead Consultant with all information.
> Sections 1–17 are written for the client and never contain internal pricing (D1); section 18 *Consultant
> notes* holds modifiers, price adds, budget vs band, commercial warnings (e.g. 11.11), story points, answers to
> confirm and consultant notes. The LC filters before sharing; `npm run deck:check` passes only on a version
> without internal data.

---

| # | Section | XML `section id` | Source (engagement.json unless stated) |
|---|---|---|---|
| 1 | Cover | `cover` | `meta.client`, `meta.consultant`, `meta.updated_at`, offer name |
| 2 | Executive summary | `executive-summary` | `delivery.go`, open STOP rules, `business.primary_problem`, offer, delivery track, `shopify.target_plan`, top capabilities, KPIs and growth goals |
| 3 | Business context | `business-context` | `business.*` (revenue, conversion, bottleneck, pain, goals, KPIs, budget), `delivery.target_launch_date` |
| 4 | Discovery approach | `methodology` | Static method statement; provenance counts; open questions |
| 5 | As-is | `as-is` | `migration.source_platform`, `business.engagement_trigger`, `must_preserve`, `current_frustrations`, `underperforming_segments` |
| 6 | Solution design | `solution-design` | Offer, delivery track, plan, architecture, theme, `markets.list`, payments and checkout, B2B, `integrations`, `migration` |
| 7 | Capability map | `capability-map` | `approach.capability_map`, ordered Native → App → Theme → Custom |
| 8 | Scope & phases | `scope` | `approach.phases` (tasks with owner; deferred marked) |
| 9 | App recommendations | `apps` | `approach.app_shortlist` (recommended and rejected), monthly list-price totals per currency |
| 10 | Configuration vs customisation | `work-split` | Share of capability-map requirements by resolution; percentages always add to 100 |
| 11 | Scope by epic | `scope-by-epic` | `backlog.json` summary — story counts only, **no points** |
| 12 | Risks | `risks` | STOP and FLAG exit rules (never WARN), open questions, assumptions |
| 13 | Out of scope | `out-of-scope` | Deferred tasks + standard exclusions |
| 14 | Next steps | `next-steps` | Open exit-rule owners, questions to confirm, standard sign-off steps |
| 15 | Timeline | `timeline` | `offer.duration_weeks`, kick-off, go-live target, phases, rule 11.15 if fired |
| 16 | Investment | `investment` | the pack and its add-ons by name, `offer.price_band` (never open-ended: every quote is the scope’s sum, a headless one included), the first-estimate note, client budget, recurring third-party costs (Shopify plan, apps) |
| 17 | Appendix — user stories | `appendix-stories` | `backlog.json` stories: key, epic, title — **no points** |
| 18 | Consultant notes | `consultant-notes` | Lead Consultant only: offer / nearest offer, price band, duration, rationale, gate and L-trigger evidence, the add-ons past the pack, modifiers (effort, price add), public market references for the pack, budget vs band, all exit rules with source, questions and internal notes, plan requirements, app signals, story points, answers to confirm, consultant notes |

**STOP engagements** produce sections 1, 2, 12, 14 and 18 only: the document explains the blockers and how to
resolve them instead of presenting a solution.

**Larger Engagement** (`mode="LARGER_ENGAGEMENT"` — a STOP the consultant routed to a Merkle Enterprise Engagement
with a dedicated Discovery Phase, ADR 0009) produces sections 1–10, 12–16 and 18, without 11 and 17 (no Jira backlog).
Differences: the executive summary has `<why-larger-engagement>` (each STOP rule with its Discovery Phase
workstream) and `<engagement>` instead of the offer; in risks the STOP rules are `<discovery-phase-topics>`; next
steps lead to the Enterprise Engagement proposal and Discovery Phase kick-off; timeline duration and investment are
defined in the Discovery Phase — **no offer name and no price band** (`deck:check` fails if they appear).

**Missing data** appears as `<missing reason="…"/>` and is listed in `<warnings>` at the top of the XML.
The deck writes `[TBC — consultant to complete]` for each.

## Files per client

| File | Audience |
|---|---|
| `discovery-deck.xml` | Input for the deck — full information |
| `discovery-deck.md` | The Discovery Closing Document draft for the Lead Consultant (sections 1–17 for the client, 18 consultant notes) |
| client version (the LC's copy) | Client — after filtering; check with `npm run deck:check -- --client <slug> --file <name>` |
