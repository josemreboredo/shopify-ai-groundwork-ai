# ADR 0003 — One canonical list of exit rules

- **Status:** Accepted (2026-09-16)
- **Date:** 2026-09-16

## Context

The blank questionnaire's § 11 table listed different triggers from `docs/strategy.md`, the
ACME example and the Frame Agent prompt (only 11.6 roughly matched). The Frame Agent code
implemented a third variant and overwrote exit reasons the LLM had detected.

## Decision

1. `offering.json → exit_rules` is the only list. Rules 11.1–11.11 are taken from
   `docs/strategy.md` and marked `canonical`.
2. Five checks from the previous questionnaire are added as FLAGs: 11.12 ERP/PIM without a
   connector or iPaaS, 11.13 more than two fulfilment locations with complex routing, 11.14 migration
   with significant SEO equity or historical data, 11.15 go-live sooner than the offer's minimum
   duration, 11.16 no single decision-maker or unclear budget authority (resolved before the
   statement of work). Each covers effort or risk beyond what the offer's modifiers and fixed durations assume.
3. Results: **STOP** blocks GO; **FLAG** needs a named owner before build; **WARN** is a
   commercial adjustment.
4. Rules are evaluated from normal answers (§§ 0–10). § 11 of the questionnaire is a generated
   confirmation table showing which questions answer each rule — there are no separate yes/no trigger questions.
5. The engine records each fired rule in `exits.items` with `source` (rule / llm / consultant),
   evidence and a resolution. LLM-detected exits are **merged**, never overwritten.
   `exits.triggered` is true while any STOP is open; `delivery.go` is its negation.

## Consequences

- strategy.md's § 11 table points to `offering.json` instead of restating the rules.
- Rule changes are made in `offering.json` only; the questionnaire § 11 and strategy.md summary follow it.
