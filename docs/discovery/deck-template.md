# Discovery Closing Deck — Section Specification

> **Purpose:** the Discovery Closing Document a Merkle lead consultant presents to the client at the end of
> discovery. Data comes from `clients/<slug>/engagement.json` (and `backlog.json` when generated) through
> `npm run deck -- --client <slug>`, which writes `discovery-deck.xml`. The `/deck` skill (or
> [`deck-prompt.md`](deck-prompt.md) pasted into Claude) turns the XML into `discovery-deck.md`.
>
> **Client-safe by construction (decision D1):** the client sees the offer's **price band** only.
> Internal modifiers, price adds, effort weeks, story points and commercial warnings (exit rule 11.11) never
> enter the XML — they go to `deck-internal-notes.md` for the consultant. `npm run deck:check` verifies the
> final deck.

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
| 16 | Investment | `investment` | `offer.price_band` (open-ended for L), client budget, recurring third-party costs (Shopify plan, apps) |
| 17 | Appendix — user stories | `appendix-stories` | `backlog.json` stories: key, epic, title — **no points** |

**STOP engagements** produce sections 1, 2, 12 and 14 only: the document explains the blockers and how to
resolve them instead of presenting a solution.

**Missing data** appears as `<missing reason="…"/>` and is listed in `<warnings>` at the top of the XML.
The deck writes `[TBC — consultant to complete]` for each.

## Files per client

| File | Audience |
|---|---|
| `discovery-deck.xml` | Input for the deck — client-safe |
| `discovery-deck.md` | The Discovery Closing Document — client-facing |
| `deck-internal-notes.md` | Consultant only — offer rationale, gate evidence, modifiers, budget vs band, commercial warnings, story points |
