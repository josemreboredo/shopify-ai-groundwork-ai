---
name: deck
description: Generate the Discovery Closing Deck for a client from clients/<slug>/engagement.json (and backlog.json) — client-safe, price band only — and check it for internal data. Use when the user asks for the discovery deck, closing document or client presentation after discovery.
---

# Discovery Closing Deck

The deck is the **Lead Consultant's draft** (ADR 0010): it contains all information. Sections 1–17 are written for
the client and never contain internal modifiers, price adds, effort, story points or commercial warnings (D1);
section 18 *Consultant notes* holds all of those. The Lead Consultant filters before sharing.
A **Larger Engagement** deck (`mode="LARGER_ENGAGEMENT"`) shows no offer and no price band at all: it recommends a
Merkle Enterprise Engagement with a dedicated Discovery Phase (ADR 0009).

## Steps

1. You need the client slug (`clients/<slug>/engagement.json` must exist; if not, run `/discover` first).
   If `clients/<slug>/backlog.json` is missing and the engagement is GO, offer to run
   `npm run backlog -- --client <slug>` first so the epic and story sections are complete. A Larger Engagement
   has no backlog — do not offer it.
2. Generate the data:
   ```bash
   npm run deck -- --client <slug>
   ```
3. Read `discovery/docs/deck-prompt.md` and `clients/<slug>/discovery-deck.xml`. Follow the prompt exactly and
   write the document to `clients/<slug>/discovery-deck.md`. Use only the XML — do not open
   `engagement.json` or `backlog.json` while writing it. Include section 18 completely.
4. Do not run `deck:check` on the draft — it is expected to fail while section 18 is there. When the Lead
   Consultant has a client version, check it:
   ```bash
   npm run deck:check -- --client <slug> --file <client version file>
   ```
5. Report: GO / Larger Engagement / STOP, offer and price band (GO only), number of sections completed, fields marked
   `[TBC — consultant to complete]`, and remind the Lead Consultant that section 18 and the "Before presenting"
   block are internal and must be filtered before sharing.
