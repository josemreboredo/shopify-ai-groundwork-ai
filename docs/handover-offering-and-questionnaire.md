# Handover — offering and questionnaire

**Written for:** whoever continues this work in a new session, from either
machine. It assumes the repository and `npm test`, and nothing else.

This carries the *why* behind three days of changes to the offering and the
question bank, and the decisions still open. The commit messages hold what
changed; this holds what it cost to learn and what is still undecided.

State when written: `main` at `2f2b6c4`, **594 tests passing**, offering
`2.13.0` — 16 scope gates, 29 exit rules, 28 modifiers, 22 closed-scope rows.

> **Note on history.** Part of this work was done in a parallel session against
> the previous repository (`discovery/`, branch `v2.0.0-lc-frontend`) and was
> carried into this one during the restructure to `ai/`. Where a commit message
> here mentions "the parallel session", that is what it means. Nothing is
> missing; the paths changed.

---

## 1. The offers today

| | Duration | Internal band | Gate weeks the band carries |
|---|---|---|---|
| S · Ecommerce Foundation | 4–5 wk | CHF 40–65k | 0 |
| M · Ecommerce Scale | 6–14 wk | CHF 65–145k | 2–9 |
| L · Ecommerce Growth | 13–21 wk | CHF 140–230k | 9–16 |

The third column is the one that explains everything else: it is how much
scope-gate work each band already contains. In S it is zero, so a gate is added
on top in full and only one is allowed before it becomes an M. In M and L a gate
comes out of the band first, and only the excess is quoted on top.

**Rule 2 of the classification escalates to L when scope passes the M ceiling**,
and that ceiling is 14 weeks. It moved from 13 when the bands grew to hold the
Thank you page work — scope that landed just past the old line now stays an M.

---

## 2. The closed scope, and why it is not a leaflet

`offering.json` carries `closed_scope`: one row per scope gate saying what S, M
and L include, and what is an add-on. This answers "if I buy an M, what exactly
do I get" — a question the tool could not answer at all before, so a consultant
improvised it in the room and the next one improvised differently.

`closed_scope.limits` declares each pack's promise **as answers**.
`ai/tests/unit/closed-scope.test.js` builds an engagement that takes exactly
that, runs it through the real classifier, and requires two things:

1. it comes out as that pack, and
2. its gates fit inside the weeks that pack's band carries.

**The bundles were chosen by the engine, not by judgement.** Promise one market
too many and the engagement quietly becomes the next offer up and the test goes
red. Two things the engine refused: B2B alongside a migration does not fit an M,
and a heavy migration does not fit an L beside a full template set.

---

## 3. Defects found, and what each one teaches

These are worth reading before changing a number, because the same shapes recur.

**Numbers that contradict their own price.** Half a week per market against CHF
8,000 is CHF 16k a week, where all three offers and every other modifier sit at
10–11k. Nothing in the suite could see that two numbers describing the same work
disagreed. There is now a test that every modifier's rate sits within the range
the offers themselves charge.

**The same work billed twice.** The redirect estate was priced inside the
migration tier *and* as the SEO continuity gate, which arrived later and nobody
took it out of migration. A Magento replatform with a large estate paid for the
same redirects in both places. The same mistake was nearly repeated when markets
were first surcharged for languages and integrations — both already priced per
unit. **When adding a surcharge, ask what it is for and whether something else
already owns that work.**

**A clamp that silently cancels per-unit pricing.** Markets scaled per market
into a band that topped out, so four markets and fourteen were quoted
identically. Every per-unit modifier clamps to its band; the other dimensions
have a rule that stops the count first, and markets deliberately do not.

**Two code paths answering the same question differently.** `decide()` derives
the market topology, classifies, evaluates exits and sets GO/STOP. The interview
preview did two of those four, skipping the topology — which nobody can answer,
so rule 11.23 could only ever fire on one side. A live engagement's summary said
"Within the standard offers" and, two lines below, "outside the standard
offers". There is one `weigh()` now and a test that runs both paths on the same
answers. **Other consumers have not been audited** — see section 5.

**A document cited as a source that no longer matched.** `docs/strategy.md` is
named by `offering.json` as where its offers come from, and still carried the
old bands. A test now reads the document.

---

## 4. Shopify facts that were wrong, and the limits worth knowing

All verified against official documentation with dates recorded on the gates.

- **Checkout is gated in three steps.** Thank you / Order status extensions run
  on every plan except Starter; the information, shipping and payment steps are
  **Plus only**; backend rules are Functions. The offering said "settings and
  editor branding" for all three packs, which reads as "no extensions here".
- **Every store already has Shopify Analytics** — pre-built reports, the
  dashboard, the ShopifyQL query editor — and GA4 connects through the Google &
  YouTube channel with ecommerce events tracked automatically.
- **Search & Discovery has four documented limits and we quoted two.** The two
  that surface later: a filter shows at most **100 values** on the storefront,
  and a search returning more than **100,000 results** shows no filters. The
  first catches people — a Brand filter with 300 brands shows a hundred,
  silently.
- **A second legal entity is not automatically a second store.** A Plus store
  assigns a business entity per market, so orders route through that entity's
  Shopify Payments account. The page is explicit that it covers **payment
  processing only** and says nothing about invoicing or tax registrations.
- **A store beyond the first costs 2–2.5× a further market.** Ten stores come
  with a Plus contract at no licence cost, which is why nobody counts them. The
  cost is that expansion stores **share no data by default**, apps are **billed
  per store**, and **theme licences cannot be shared** — so every integration is
  wired again, every theme deployed again, every app bought again.

Where Shopify enforces a hard limit, both it and the Merkle line are recorded,
and a test keeps ours inside:

| | Shopify | Plus | Our line |
|---|---|---|---|
| Inventory locations | 10 | 200 | 5 |
| Published languages | 20 | 30 | 6 |
| URL redirects | 100,000 | 20,000,000 | 10,000 |
| Filters per store | 25 | 25 | 25 |

---

## 5. Open decisions

### 5a. Markets vs stores in the offer language — unanswered

The question as asked: *should the offers talk about stores and expanded
markets rather than markets? Creating a market inside a store is not very
costly.*

Measured: a further **market** is 0.75 wk / CHF 8,000, ×1.33 where the pack
builds a bespoke template set. A further **store** is 1.5 wk / CHF 16,000,
×1.66 with integrations and bespoke design. **A store is 2× a market before
surcharges and 2.5× with them.**

The instinct is right that markets are the cheap axis. The pack table currently
carries both rows. The naming was never settled.

### 5b. M and L both hold three markets

Once markets were priced properly the packs held fewer, and L came down to the
same three as M. That collides with the stated go-to-market — Swiss exporters
running several markets. Three ways out, none chosen: accept it and differentiate
on templates, migration, languages and checkout; take something out of L (6
languages to 5 frees exactly the half week a fourth market needs); or widen L
again as was done for the Thank you page.

### 5c. The M→L cliff

Measured: 6 markets + 1 integration quotes **M, CHF 116–145k**. One more
integration — CHF 10k of work — quotes **L, CHF 140–230k**. The ceiling jumps
CHF 85k. Inherent to banded offers, but two near-identical engagements are
quoted 85,000 francs apart and the consultant in the room has nothing to explain
it with. Either soften the transition or warn on the page when an engagement is
within half a week of the jump.

### 5d. Four questions cannot be conditioned at all

`ask_if` promotes a question into a quick interview when an earlier answer makes
it relevant; it **restricts nothing**, so a full interview asks it whatever the
answers say. Most of those are fine — they stand on their own. Four cannot be
expressed: `skip_if` reads one earlier answer and compares it, so *"only when
there are two or more markets"* has no way to say itself. That is why
translation, low-value parcels and international returns are still asked of a
single-market store. Fixing it means giving `skip_if` a count condition, which
touches the evaluator that decides what every interview asks.

### 5e. Sources verify the page, not the threshold

Every gate cites Shopify pages with a verification date, and the source checker
reads `offering.json` as well as the question bank. But those citations confirm
**the page exists and covers the topic**. Whether 500 SKUs or 3 integrations is
the right line is a Merkle judgement wearing the same clothes as a Shopify fact.

### 5f. No delivery actuals

Every effort figure is judgement calibrated against third-party published data.
**The loop does not close with Merkle actuals.** Until a project finishes and
estimate is compared with spend, the model is coherent but not validated. The
framing that matters: this is a first estimate to open commercial
conversations — humans estimate the approach, commercial adds contingency,
services go on top.

### 5g. Other consumers may have the preview/decide bug

Fixed between those two. **Not audited**: go/no-go, readiness, summary, deck and
backlog each build their own view of the engagement. It is the same shape of bug
and it cost a page that contradicted itself in production.

---

## 6. Working method

Three rules earned the hard way.

**Measure, do not reason.** Every layout claim made by reading CSS was wrong or
unverifiable; screenshots caught a button that never rendered and a table still
clipping its text. Every pricing claim made from memory was wrong too — a "40
hour" market benchmark turned out to be documented for retail stores, not
markets. Chrome is installed; drive it over the DevTools Protocol and look.

**Mutation-test every new test.** Break the code on purpose and confirm the test
goes red. One test passed against a deliberately broken engine and had to be
tightened; another had a regex that matched "storefront-**search**" as a search
query.

**"Are you sure?" is usually a correct instinct.** Three of the five pricing
defects were found because the question was asked, and two of the first answers
given were themselves wrong.

---

## 7. Constraints in force

- **Internal pricing** (`price_band`, `price_add`, `internal_note`) must never
  reach a client-facing document. The deck has a leak guard; it has fired twice,
  both times on a reworded rule that named a modifier.
- **`clients/` is client data** and gitignored. Never commit it.
- **No personal data** in engagement answers; consent (Q10.5.2) before any other
  answer is recorded.
- **Every Shopify fact carries an official source and a verification date**
  (ADR 0011) — now enforced for the offering as well as the question bank via
  `npm run sources:check`.
- **ADR 0007** restricted the pilot to demo or anonymised engagements because
  the tool ran on a personal Claude account. That has been migrated to dentsu
  Claude Enterprise, so the constraint lapses — **but the ADR still says
  otherwise and should be updated to record it.**

### Two things that do not travel with git

`.gaia/` holds the Gate 5 MCP allowlist and its audit log; `.env` holds local
credentials. Both are gitignored, so a fresh clone has neither. Without the
allowlist the Merkle Discovery connector is closed — which is fail-closed and
therefore safe, but silent. Worth deciding whether Gaia allowlists should be
versioned, since Gaia requires dual sign-off and that implies a review trail.

---

## 8. First moves in a new session

1. `npm test` (expect 594) and `npm run sources:check` (expect 0 dead).
2. Settle **5a** — markets vs stores in the offer language. It is the live
   question and it changes the pack table.
3. Then **5b**, because L holding the same markets as an M is a go-to-market
   problem already flagged twice.
4. Update ADR 0007 to record the Enterprise migration.
5. Everything else in section 5 is real but not urgent.
