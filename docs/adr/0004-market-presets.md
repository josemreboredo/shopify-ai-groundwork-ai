# ADR 0004 — Market-specific defaults become opt-in presets

- **Status:** Proposed
- **Date:** 2026-09-16

## Context

The old store-spec schema defaulted to Switzerland (CH, CHF, de/fr/it, TWINT/PostFinance),
price bands were in CHF, and the Frame Agent prompt said "Merkle DACH". Non-Swiss clients got
wrong defaults and had nowhere to record their local payment methods.

## Decision

1. `engagement.schema.json` has **no market defaults**. Country, currency, languages and local
   payment methods are free values (ISO codes / strings).
2. Market knowledge lives in presets: `lwc-library/swiss-baseline/` becomes the first preset
   (`ch`). Future presets (e.g. `de`, `uk`, `nordics`) follow the same layout: locales, tax &
   shipping, payments, markets playbook.
3. The build agents (Phase 6) apply a preset only when the engagement's markets include it.
4. Offer prices are EUR (ADR 0001); client-facing currency conversion is a proposal concern, not a schema concern.

## Consequences

- `lwc-library/README.md` describes swiss-baseline as a preset, not the baseline for all clients.
- Stories and prompts stop assuming CH (Phase 4).
