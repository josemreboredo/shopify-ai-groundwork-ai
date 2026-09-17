# ADR 0010 — The deck is the Lead Consultant's full-information draft

- **Status:** Accepted (2026-09-17, owner decision)
- **Date:** 2026-09-17
- **Amends:** decision D1 (implementation plan) and ADR 0001 point 7 — how internal pricing reaches the deck
- **Relates to:** ADR 0009 (Larger Engagement)

## Context

D1 made the generated deck client-safe by construction: modifiers, price adds, effort, story points and
commercial warnings were kept out of `discovery-deck.xml` and written to a separate `deck-internal-notes.md`.
In practice the generated deck is not sent to the client: it is delivered to the Lead Consultant (LC), who
decides what the client sees. Splitting the information across two files made the LC's job harder.

## Decision

1. `npm run deck` / `/deck` produce **one full-information draft** for the LC: sections 1–17 are written for
   the client; section 18 **Consultant notes** (`audience="lead-consultant"`) holds everything else — offer or
   nearest offer and price band, rationale, scope-gate evidence, modifiers with effort and price adds, budget vs
   band, every exit rule with source and feeding questions and internal notes (e.g. 11.11), plan requirements
   with Shopify docs, app signals, story points, answers to confirm, consultant notes.
2. The "Before presenting" warnings, `[TBC — consultant to complete]` markers and question IDs stay in the draft.
3. `deck-internal-notes.md` is no longer produced (its content is section 18).
4. **D1 still governs what reaches the client:** the LC filters the draft; `npm run deck:check -- --client <slug>
   [--file <client version>]` fails while internal data remains. The builder still guarantees that sections
   1–17 contain no internal pricing, so removing section 18 is enough for a client-safe version.

## Consequences

- The LC has one document with all the context; nothing internal is hidden from them.
- Sharing the draft unfiltered would expose internal pricing — the deck skill, the XML header and the CLI say so.
