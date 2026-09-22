# ADR 0018 — `discovery/` reorganised as `ai/`: engine, bid, engagement, shared, mcp

- **Status:** Accepted (2026-09-22, owner decision)
- **Date:** 2026-09-22
- **Relates to:** ADR 0013 (discovery and build tools), ADR 0015 (Claude connector shared memory)

## Context

Preparing for a Dentsu tech-lead review surfaced two organisation problems inside `discovery/`:

1. `discovery/agents/discovery/` shared its name with one of the two processes the tool runs ("discovery" vs "rfp",
   named in `discovery/service/process.js`), even though that folder is the shared engine both processes call — a new
   engineer skimming `agents/{backlog, discovery, discovery-deck, interview, workbook}` could reasonably guess
   `agents/discovery` was the Engagement-only counterpart to `agents/interview`, when it is not.
2. There was no home for MCP connectors as more than one is coming: today the Merkle Discovery connector
   (`discovery/service/mcp.js`, ADR 0015); next, a Shopify MCP connector for the build tool, once it starts
   configuring stores from the discovery handover.

Separately, the small number of files genuinely specific to one process or the other — `clarifications.js` (the
RFP-only clarification questions) and the live-conversation interview flow — had no clearly labelled place either,
sitting inside folders named after something else.

## Decision

`discovery/` is renamed `ai/`, restructured as:

- `ai/engine/` — the shared engine (classification, exit rules, topology, plan benchmark, extraction, redaction,
  approach drafting). Used by both the bid and engagement paths identically; never duplicated. Was
  `discovery/agents/discovery/`, minus `clarifications.js`.
- `ai/bid/` — RFP-only content. Today: `clarifications.js`. Deliberately created before it holds much, the same way
  `build/` already exists as a placeholder ahead of the build tool — so bid-specific work has an obvious place to
  land as it grows, instead of getting folded into the shared engine for lack of anywhere else to put it.
- `ai/engagement/` — the live-conversation interview flow (session, next question, answer, preview, open items). Was
  `discovery/agents/interview/`.
- `ai/shared/` — the service layer both the web app and the Claude connector call through (session storage, access
  control, provenance, closing documents). Was `discovery/service/`.
- `ai/mcp/<connector>/` — one subfolder per MCP server. Today: `ai/mcp/merkle-discovery/` (was
  `discovery/service/mcp.js`). The Shopify MCP connector for the build tool gets its own subfolder here when it
  starts.
- `ai/backlog/`, `ai/discovery-deck/`, `ai/workbook/` — unchanged in role (Jira backlog, Discovery Closing Deck data,
  tax/shipping workbook), moved up to sit alongside the above rather than nested under a folder named after one
  process.
- `ai/schema/`, `ai/scripts/`, `ai/docs/`, `ai/tests/`, `ai/paths.js` — unchanged in role, moved up one level.

**Not duplicated:** the shared engine and service layer stay single modules. This reorganisation moves and relabels
files; it does not split any shared logic into two copies. The bug this guards against already happened once —
`ai/tests/unit/one-engine.test.js` exists specifically because the engine and the interview preview once each carried
their own copy of the decision logic and silently disagreed (see that test and `ai/engine/engine.js`'s `weigh`/`decide`
history). A folder rename cannot reintroduce that; only writing a second implementation of shared logic can, and
`ai/bid/` and `ai/engagement/` are deliberately kept to content that has no shared counterpart to duplicate.

**Historical documents are not rewritten.** ADRs before this one, and `CHANGELOG.md`, keep the `discovery/...` paths
they were written against — they are a record of what was decided at the time, the same way a past git commit message
is not edited when code it describes later moves. `CLAUDE.md`, `README.md`, skill files, and code comments were
updated, since those describe the codebase as it stands today.

## Consequences

- Every relative import across the repo (`ai/`, `frontend/`) was mechanically recomputed against the new file
  locations, not hand-edited — `npm test` (552/553 passing before and after; the one failure is a pre-existing local
  Node-version gap, unrelated) and `npm run lint` (0 errors before and after) are the checks that this held.
- `package.json` scripts, `.claude/skills/*/SKILL.md`, `CLAUDE.md`'s repository layout table, and both `README.md`
  files were updated to the new paths.
- Future MCP connectors (Shopify, for the build tool) have a defined place: `ai/mcp/<connector>/`, alongside
  `ai/mcp/merkle-discovery/`.
