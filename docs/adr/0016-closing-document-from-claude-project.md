# ADR 0016 — Discovery Closing Document drafted from the Claude Project

- **Status:** Accepted (2026-09-17, owner decision)
- **Date:** 2026-09-17
- **Relates to:** ADR 0010 (deck is the Lead Consultant draft), ADR 0015 (Claude connector)

## Context

In 1.0.0 the Discovery Closing Document came from Claude Code: `/discover` or `/interview` (engagement and approach),
then `/deck` (deck data and document). Consultants now work in the web app and in Claude Projects, and asked for the same
Shopify consulting deliverable there: project definition, Shopify plan, features, apps, risks, roadmap.

## Decision

1. **Drafted in the Claude Project** (owner decision, no API key or API cost on the hosting): connector tools
   `prepare_closing_document` → `save_approach` → `save_closing_document`, plus `get_closing_document`.
2. **Same pipeline in memory:** the engine decides the engagement from the interview answers; the approach Claude drafts
   is validated against the approach schema and the engagement (errors go back to Claude); the deck builder produces
   the deck data; Claude writes the document from the deck prompt (`discovery/docs/deck-prompt.md`, mirrored in
   `discovery/agents/discovery-deck/prompt.js` by `npm run deck:prompt`, tested to stay identical).
3. **Stored with the engagement** (latest plus five previous versions) and **downloaded as Markdown** from the web app's
   Closing document tab (owner decision on format). The document stays the Lead Consultant draft with section 18.
4. A STOP without a chosen route (Q10.5.5) is refused until the route is recorded.

## Consequences

- One click in the web app is not available; the Lead Consultant asks Claude in the Project.
- The approach step never receives internal pricing; the deck data (section 18) does, as in Claude Code.
