# Market topology — what changed and where

Companion to [`market-topology-audit.md`](market-topology-audit.md), which is Step 1 and the
precondition for everything below. Delivered 2026-09-18 on branch `feat/market-topology`.

**The rule the whole change enforces:** the questionnaire asks about the client's business; the
engine decides the architecture. Nothing below asks a client, or a Lead Consultant mid-interview,
to choose a store shape.

---

## Step 2 — Questions

Net effect on the interview: **−1 question, and three of the four retirements were `required`.**

| Action | id | What |
|---|---|---|
| Amended | **Q3.1.1** | The markets table gains three columns a country manager can fill: `selling_entity` (which of your companies invoices the customer here), `assortment` (`same` / `subset` / `different`), `run_by` (`central` / `local_team`). Per-market granularity is what makes a *hybrid* recommendation possible. |
| Amended | **Q5.1.3** | Now a group: the count of fulfilling locations **and** the country of each (`/shipping/fulfilment_countries`). |
| Added | **Q3.4.13** | "If selling in a country meant registering for tax there and filing returns, would you take that on yourself, or would you rather a partner were the legal seller?" Business appetite, not architecture — the legitimate half of the retired Q3.1.6. |
| Added | **Q6.2.14** | "Is the wholesale side run by its own team, with its own targets or P&L?" |
| Demoted | **Q3.1.4** | Optional **stated preference**, labelled as such, and no longer feeds any rule. |
| Retired | **Q3.1.6** | Merchant of record is derived. Eligibility is a closed documented set; the commercial call belongs in the approach. |

Every new or amended question carries the Step 2 contract: `wording`, `why_it_matters` (shown to
the client, in the questionnaire), `what_good_looks_like` and `who_can_answer` (shown to the Lead
Consultant, in the consultant guide), a mandatory `unknown_path` (fallback, assumption, confidence,
how to resolve), `maps_to` and, where relevant, `derived_from`. No id was renumbered or reused.

## Step 3 — The topology engine

`discovery/agents/discovery/topology.js`, called from `decide()` before the offer and the exit
rules, on any engagement with more than one market.

Outputs `recommendation` · `confidence` · `triggers[]` · `rejected[]` · `assumptions[]` ·
`open_inputs[]` (ranked by swing) · `separate_store_markets[]` · `managed_markets{}` ·
`stated_preference` · `disagreement{}`, all written to `/markets/topology` in the contract.

Seven criteria in decreasing weight, each citing the answers that fire it: legal entity per market
(5) · invoicing and tax footprint (4) · distinct assortment (4) · incompatible apps (3) · B2B as its
own operation (3) · governance isolation (3) · market-specific regulation (5, mainland China).
A *subset* of the range never fires — that resolves with a market catalog.

- No criterion fires → `single_store_markets`.
- Criteria fire on a minority of markets → `hybrid`, naming the markets that leave the core store.
- Entity or tax footprint fires broadly → `expansion_stores`, which feeds Plus into the plan
  suggestion through the plan rule (now reading the **derived** recommendation, not the client's
  preference).
- **Never "cannot determine".** An engagement with nothing answered still gets a recommendation at
  confidence `to_validate`, with every assumption and the ranked open inputs.

**Incompatible apps is honest about itself:** the questionnaire cannot capture a per-market app
estate, so the criterion never fires from data. It is recorded as an assumption instead, which is
stated in the code and in the output.

**Managed Markets** is evaluated strictly and reported either way, with the Shopify page next to
every condition. Verified against official documentation on 2026-09-18: the continental-US /
Canada / UK eligibility, Basic or higher, Shopify Payments, store currency, home-country fulfilment,
and the documented exclusions — B2B, subscriptions, **multiple business entities**, zero-value
orders, Collabs, manual bundles, order editing after a label. The cost signal is computed from the
engagement's own orders per month and AOV: 3.25% (Plus) or 3.5% plus a 1.5% FX fee, **on top of**
normal Shopify Payments processing, with per-order and per-month figures. The mandatory,
non-removable checkout disclaimer naming Global-e as the seller is documented and now in the chapter.

## Step 4 — Stated preference

`Q3.1.4` is recorded as `topology.stated_preference`. Where it differs from the computed answer,
`topology.disagreement` carries stated, computed and why_computed. **The recommendation does not
move.** The deck argues the gap.

## Step 5 — Exit rule

**11.23**, FLAG, owner Lead Consultant, destination "Market topology and legal-entity mapping
workshop before the solution architecture is baselined." It fires on **missing facts** — several
entities with no per-market mapping, unknown assortment relationship, unknown invoicing footprint —
never on a missing decision, because the engine still recommends.

## Step 6 — Approach

- `architecture_decisions` gains `why_not[]` and `impact{technical, project, merchant, customer}`.
  Optional on the payload schema so **previously saved approaches stay valid**; required for the
  topology decision by the validator.
- The validator rejects a multi-market approach with no "Market topology" decision, in the same
  voice as the integration-coverage errors, and additionally requires three options, `why_not`,
  all four impact lenses, an explicit Managed Markets position, and — where confidence is
  `to_validate` — a rationale that separates what the client stated from what the engine derived.
- The drafting instructions returned by `prepare_closing_document` now open with market topology,
  including the delivery-track branch (Step 8).

## Step 7 — Deck

- `deckErrors` rejects a multi-market deck without the topology decision slide, and enforces the
  sequence: a `two_column` that **teaches the trade-off before the recommendation lands**, then the
  `decision` slide (topic "Market topology", three options), then a `table` carrying the four
  impact lenses. The topology decision must come **first among the decision slides**, because it
  constrains the storefront.
- `table` rather than `two_column` for the impact slide: four labelled audiences are four rows, and
  the renderer already lays a table out cleanly; `two_column` is built for two sides of one point.
- Where confidence is `to_validate`, the slide must say so.
- `deck_xml` carries `<topology>` under solution-design — recommendation, confidence, triggers with
  evidence and question ids, rejected options, assumptions, open inputs and the Managed Markets
  verdict with its cost signal — as data, so the writer argues it instead of re-deriving it.

## Step 8 — Delivery track

Encoded as content the writer must cover, in both the approach instructions and the deck prompt.
**Liquid:** the theme is store-wide; per-market divergence runs through market customisations and
Rollouts; a second store means a second theme to maintain. **Hydrogen:** routing, locale context
and market resolution are application concerns; a second store means either a second storefront
deployment or one application serving two Storefront API endpoints — the deck must say which, and
what it does to caching, CI/CD, preview environments and the shared design system.

## Step 9 — Reference chapters

- `shopify-markets` gains **"Choosing the topology: what actually decides it"** — the six business
  facts as a table — and an explicit statement of what Shopify does **not** publish: there is no
  official side-by-side comparison of one store with Markets against expansion stores (the
  comparison is Merkle's, drawn from two separate pages), and no published cap on markets,
  currencies or price lists per store. Those ceilings are framed as architectural consequences.
- `managed-markets` gains the re-verified exclusion list, the checkout disclaimer, and
  **"Managed Markets is not a topology"** — it answers who sells, not how many stores.
- Both keep the verification format; `verified` moves to 2026-09-18 with the new quotes sourced.

## Step 10 — Tests

`discovery/tests/unit/topology.test.js`, 10 tests, all eight golden paths from the brief:

1. Single market → no topology at all
2. Three markets, one entity, shared range, all stated → `single_store_markets`, `high`
3. Five entities unmapped → `expansion_stores`, `to_validate`, 11.23 fires, Plus required **from the derived field**
4. Mainland China alongside others → `hybrid`, China out of the build
5. B2B with its own team → `hybrid`
6. Every Managed Markets condition met → live option with the cost on the client's own numbers (and 6b: ineligibility reported with the failing condition)
7. **The 80% case** — every topology question unanswered → recommendation returned, `to_validate`, assumptions complete, open inputs ranked, 11.23 fires
8. Stated preference contradicts the computed answer → recommendation unchanged, `disagreement` populated

Plus: the approach validator rejects a multi-market approach without the topology decision and
enforces its quality bar; the deck validator rejects a multi-market deck without the slides.

Suite: **224 passing, 0 failing.**

## Invariants added along the way

- `/markets/topology` and `/markets/cross_border_model` are in `COMPUTED_POINTERS`: they cannot be
  recorded as an answer by the interview, the web app or the connector, and `flattenAnswers` skips
  them when a recorded engagement is replayed.
- The plan rule for expansion stores reads `/markets/topology/recommendation`; exit rule 11.1's
  inputs moved with it.
- The backlog story and the app registry no longer reference the retired question.

## Not done, and why

- **Solution leakage outside market topology is reported, not fixed** (audit § 1a), per the brief.
  Two of those findings are blocking and should get their own pass: **Q6.2.8** ("Native Shopify B2B
  or an app?", which still offers `separate_b2b_expansion_store` — a topology answer living outside
  section 3) and **Q9.2.6** ("Why headless?"). Q6.2.8 is the more urgent: the topology engine now
  decides B2B separation from Q6.2.14, so the two can disagree on the same engagement.
- No ADR was written for this change. It deserves one.
