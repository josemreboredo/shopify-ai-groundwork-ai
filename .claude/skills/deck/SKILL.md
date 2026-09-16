---
name: deck
description: Generate the Discovery Closing Deck for a client from clients/<slug>/engagement.json (and backlog.json) — client-safe, price band only — and check it for internal data. Use when the user asks for the discovery deck, closing document or client presentation after discovery.
---

# Discovery Closing Deck

The deck is client-facing. It shows the offer's **price band** only — never internal modifiers, price adds,
effort, story points or commercial warnings (decision D1). Those live in `deck-internal-notes.md`.

## Steps

1. You need the client slug (`clients/<slug>/engagement.json` must exist; if not, run `/discover` first).
   If `clients/<slug>/backlog.json` is missing and the engagement is GO, offer to run
   `npm run backlog -- --client <slug>` first so the epic and story sections are complete.
2. Generate the data:
   ```bash
   npm run deck -- --client <slug>
   ```
3. Read `docs/discovery/deck-prompt.md` and `clients/<slug>/discovery-deck.xml`. Follow the prompt exactly and
   write the document to `clients/<slug>/discovery-deck.md`. Use only the XML — do not open
   `engagement.json`, `backlog.json` or `deck-internal-notes.md` while writing the client document.
4. Check it:
   ```bash
   npm run deck:check -- --client <slug>
   ```
   If it reports internal data, remove it from `discovery-deck.md` and run the check again.
5. Report: GO/STOP, offer and price band, number of sections completed, fields marked
   `[TBC — consultant to complete]`, and remind the consultant that `deck-internal-notes.md` is internal.
