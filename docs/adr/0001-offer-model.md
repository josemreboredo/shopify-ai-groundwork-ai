# ADR 0001 — Offer model: S/M/L with scope gates as data

- **Status:** Accepted (2026-09-16)
- **Date:** 2026-09-16
- **Deciders:** Jose Reboredo (offering owner)

## Context

Three incompatible tier models existed: S/M/L in EUR with scope gates (`docs/strategy.md`),
Starter/Medium/Large in CHF counting markets and components (`lwc-library/README.md`, the old
store-spec schema, `frame_agent.py`), and Gaia T1–T4 feature tiers. Run on the ACME example,
the Frame Agent code would classify Large → STOP while the offering says M → GO. "Integration"
had three different definitions.

## Decision

1. The commercial model is the one in `docs/strategy.md`: **S Ecommerce Foundation**,
   **M Ecommerce Scale**, **L Ecommerce Growth**, priced in **EUR**.
2. The offering is encoded as data in [`schema/offering.json`](../../schema/offering.json):
   offers (price band, duration, delivery track), six scope gates, three L triggers,
   internal modifiers, the integration definition and the exit rules (ADR 0003).
3. Classification, in order: any L trigger → **L**; ≥ 2 active gates → **M**;
   exactly 1 gate → **S** with that gate's internal modifier; 0 gates → **S**.
4. **Integration** = a live system-to-system data connection in a counted category
   (ERP, PIM, CRM, 3PL/WMS, OMS, custom). App Store apps with native connectors (email,
   reviews, search, loyalty, analytics) are apps, not integrations, unless the connector is custom-built.
5. Vocabulary: **offer** (S/M/L, commercial), **delivery track** (liquid/hydrogen, technical),
   **Gaia tier** (T1–T4, per feature). "Tier" alone is no longer used for the offer.
6. Starter/Medium/Large and CHF price bands are retired.
7. Modifiers and price adds are internal and never appear in client-facing output (D1).

## Consequences

- The discovery engine (Phase 2) computes `offer` from answers; nobody sets it by hand.
- Every gate and trigger is fed by at least one question — enforced by
  `tests/unit/engagement-contract.test.js`.
- `lwc-library/README.md` tier tables are updated to S/M/L.

## Resolved questions (2026-09-16)

Recorded with rationale in `offering.json → resolved_questions`:

- **Luxury positioning alone triggers L** (as in strategy.md). The Bucherer Liquid build was a test, not a precedent.
- **Migration gate:** any non-Shopify ecommerce platform counts; rebuilding an existing Shopify store does not.
- **Multi-currency gate** uses the `+Markets` modifier when it is the only active gate.
- **11.2** (B2B RFQ / negotiated pricing) stays a STOP, routed to an architecture review of Shopify Plus B2B with a quote app or draft-order workflow, or a composable platform.
