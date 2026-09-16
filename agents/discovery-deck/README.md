# Discovery Closing Deck

Client-facing closing document for a discovery engagement, built from `clients/<slug>/engagement.json`
(and `backlog.json` when present). Section specification: [`docs/discovery/deck-template.md`](../../docs/discovery/deck-template.md).

```bash
npm run backlog -- --client <slug>     # optional but recommended: epic and story sections
npm run deck -- --client <slug>        # → discovery-deck.xml (client-safe) + deck-internal-notes.md (internal)
# In Claude Code: /deck <slug>  → writes discovery-deck.md from the XML and deck-prompt.md
npm run deck:check -- --client <slug>  # verify discovery-deck.md has no internal data
```

**Client sees the price band only (D1).** Modifiers, price adds, effort weeks, story points and commercial
warnings (exit rule 11.11) never enter the XML; `build.js` refuses to write XML that contains them, and
`deck:check` scans the final document. They are summarised for the consultant in `deck-internal-notes.md`.

STOP engagements produce a short document: cover, summary, blockers with resolution paths, next steps.

Tests: `tests/unit/deck.test.js`.
