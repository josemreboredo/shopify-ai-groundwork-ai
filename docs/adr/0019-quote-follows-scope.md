# ADR 0019 — The quote follows the scope; packs are packaging

- **Status:** Accepted (2026-09-23, Lead Consultant decision)
- **Date:** 2026-09-23
- **Amends:** ADR 0001 (offer model)

## Context

The engine classified an engagement into S, M or L and quoted the pack's price band, adding only the gate weeks that
overflowed the pack's capacity. The floor followed the scope; the ceiling snapped to the pack. An offering audit on
2026-09-23 (six dimensions, every finding checked by an adversarial skeptic, every competitor price re-fetched) measured
the consequence:

- half a week of extra scope moved a quote by CHF 75–105k and nine weeks (S→M +80–90k, M→L +105k);
- an M that discovery found needed a second store was re-quoted as an L at CHF 140–260k, for two weeks of work;
- add-ons listed at one price changed the quote by anything from CHF 0 to 105k depending on the pack;
- modifier rates had drifted to CHF 7–13k a week, with migrations, B2B and design the cheapest work.

The Lead Consultant's framing: the packs on the offering pages open a commercial conversation; an RFP and its answers
give an estimate of the scope identified; a discovery closes the scope. Human developers then estimate the approach and
give the final figure, and the commercial team adds contingency and services such as Design and QA testing.

## Decision

1. **The quote is the Foundation base plus every active scope gate at its own weeks and price**, floor and ceiling alike —
   the rule S already used for its one gate, generalised. A headless storefront is quoted at no less than the L band
   until Hydrogen has a modifier of its own.
2. **One weekly rate prices every modifier** (`offering.pricing.weekly_rate`, CHF 10.5k), so a gate's price is its weeks.
3. **The name is the largest pack whose price floor the quote reaches, among the packs that sell as add-ons everything
   past their promise**; what goes past is listed as `offer.addons`. A pack's promise is `closed_scope.limits` built into
   an engagement (`ai/engine/promise.js`) and run through the same gates. A second store is an add-on on M; L includes
   three.
4. **A pack's band is what an engagement at its promise costs**, and a test keeps the promise inside the published band.
5. **Estimates carry their stage** (RFP estimate, discovery in progress, discovery closed), and a won bid keeps the
   estimate it was won on, so a re-estimate reads gate by gate against it.

## Consequences

- Quotes are continuous and monotone (property-tested on all four numbers over every dimension). Most fall: the ceiling of
  a typical M by about CHF 10k, of an L by about CHF 20k; they rise only where the scope exceeds a pack's promise.
- M's band tops out at CHF 170k, where M's own promise lands at the one rate.
- The capacity arithmetic (`gate_capacity_weeks`) no longer prices anything; it is kept for the pack pages and for
  rule 11.3, which reads the largest pack's envelope.
- Offering 3.0.0.
- L is renamed **Ecommerce Flagship** (was Ecommerce Growth): "Growth" read as the small option next to the Grow retainer
  and Shopify's Grow plan (audit CB-17), and "Enterprise" is the Merkle Enterprise Engagement route.
