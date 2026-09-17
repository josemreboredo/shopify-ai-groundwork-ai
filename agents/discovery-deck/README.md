# Discovery Closing Deck

Discovery Closing Document built from `clients/<slug>/engagement.json` (and `backlog.json` when present). Section
specification: [`docs/discovery/deck-template.md`](../../docs/discovery/deck-template.md).

```bash
npm run backlog -- --client <slug>     # GO only: epic and story sections
npm run deck -- --client <slug>        # → discovery-deck.xml (full information for the Lead Consultant)
# In Claude Code: /deck <slug>  → writes discovery-deck.md from the XML and deck-prompt.md
npm run deck:check -- --client <slug> [--file <client version>]  # passes only when internal data is removed
```

**The deck is the Lead Consultant's draft (ADR 0010).** It carries all information: sections 1–17 are written
for the client, section 18 *Consultant notes* holds offer rationale, price band, modifiers, budget vs band,
commercial warnings, story points, answers to confirm and consultant notes. The LC filters before sharing;
sections 1–17 never contain internal pricing, so removing section 18 gives a client-safe version (D1).

Modes: GO (17 client sections), Larger Engagement (no offer, price band or backlog in the client sections — ADR
0009), STOP (cover, summary, blockers, next steps). Every mode ends with section 18.

Tests: `tests/unit/deck.test.js`.
