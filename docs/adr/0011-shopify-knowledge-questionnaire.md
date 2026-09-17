# ADR 0011 — A Shopify-knowledge questionnaire

- **Status:** Accepted (2026-09-17, owner decisions on `docs/discovery/questionnaire-shopify-proposal.md`)
- **Date:** 2026-09-17
- **Amends:** ADR 0001 (offer model: Plus no longer assumed; Retail & POS gate), ADR 0003 (exit rules 11.2, 11.5 to FLAG;
  new 11.18–11.21)
- **Relates to:** ADR 0008 (interview), ADR 0009 (Larger Engagement), ADR 0010 (deck)

## Context

The owner asked that the questionnaire be Shopify-knowledge based: every question steers to what Shopify does natively
(and on which plan), and names the App Store category and established apps when native is not enough. A review against
Shopify documentation (checked 2026-09-17) found 36 outdated assumptions — for example Shopify B2B has run on every plan
from Basic since 2026-04-02, checkout step extensions are the Plus-only part of Checkout Extensibility, Translate & Adapt
auto-translates 2 languages, native return labels exist only for US locations, and legacy customer accounts, Shopify
Scripts and Stocky are retired.

## Decision

1. **Question bank 1.1.0:** the proposal's additions, changes and merges are applied (256 questions). Each question that
   decides the Shopify plan or an app signal carries a `shopify` block: native features with minimum plan and an
   official Shopify docs URL, App Store category, app handles, extension points, verification date and Edition.
2. **Shopify plan benchmark (O1):** S and M no longer assume Shopify Plus. `agents/discovery/plan.js` holds the plan rules
   (each with a Shopify docs link); exit rule 11.1 fires when a required feature needs a higher plan than the target plan,
   and the consultant recommends the plan that best fits the market on top of the minimum.
3. **Benchmark for 11.2 and 11.5 (O2, O4):** both are FLAGs — quotes via draft-order review or quote apps; more than 3
   options via combined listings or product options apps. New FLAGs: 11.18 deprecated Shopify features in an existing
   store, 11.19 B2B needs Shopify B2B does not support.
4. **Retail & POS is a scope gate (O5)** (`retail_pos`), without a modifier until the owner prices it; an integrated
   non-Shopify POS counts as an integration.
5. **Plan requirements are consultant-only (O7):** the client questionnaire carries no plan information (tested); the
   generated `docs/discovery/consultant-guide.md` and the interview show the `shopify` blocks to the consultant.
6. **App registry (O8):** `schema/apps.json` lists apps with their apps.shopify.com URL and check level; apps are
   `proposed` until the lead consultant approves them after the engagement work (`npm run apps -- approve`). App signals
   (19 areas) are corrected to the native baseline and the approach receives registry candidates per signalled area.
7. **Mainland China is not part of the offering:** when CN is a launch market, 11.20 (FLAG) excludes it from markets,
   languages, offer, plan and build scope and routes it to a separate China discovery; 11.21 (STOP) when CN is the only
   market. `docs/discovery/china-mainland.md` documents the China discovery from Shopify documentation, PRC regulator
   publications and public business cases. Key finding: Shopify has no infrastructure in mainland China and no public case
   of Shopify behind the Great Firewall was found — onshore selling means a separate onshore platform (PRC entity, ICP,
   onshore hosting) or marketplace channels, with Shopify as the global platform. When CN is a launch market the
   questionnaire adds § 3.5 Mainland China (21 questions, every mode, `only_if`); otherwise those questions are not asked.

## Consequences

- Several fields changed type (e.g. `checkout.customisation`, `shipping.rates`, `markets.geo_redirect`,
  `catalogue.inventory.out_of_stock_behaviour`); engagement files from 1.0.0 must be re-run through discovery.
- Shopify facts age: every `shopify` block records when it was verified; they are re-checked at each Shopify Edition
  (Architect owns §§ 3, 4, 9; BA owns §§ 2, 5, 6).
- Every question that feeds the offer or an exit rule is asked in every interview mode. Questions that feed only app
  signals carry `ask_if` conditions on earlier answers (e.g. orders per month ≥ 1,000, a pre-order product type, 3+
  languages) and join a quick interview only when relevant — a quick interview starts at 76 questions instead of 105.
