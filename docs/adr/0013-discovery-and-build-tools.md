# ADR 0013 — Discovery and build tools in one repository

- **Status:** Accepted (2026-09-17, owner decision)
- **Date:** 2026-09-17
- **Relates to:** ADR 0002 (engagement.json as source of truth), ADR 0006 (Jira backlog), ADR 0012 (configuration workbook)

## Context

The repository grew as a discovery tool (interview, engine, deck, backlog, workbook) next to early build material
(design tokens, market presets, hand-written demo-store set-up scripts) and an obsolete intake form. The owner decided to
clean up before building the Lead Consultant frontend, and to separate the discovery AI tool from the build AI tool that
follows.

## Decision

1. **One repository, two tool folders and a contract:**
   - `discovery/` — the discovery AI tool: `agents/`, `schema/` (question bank, offering, app registry, labels), `scripts/`,
     `docs/`, `tests/`, and `paths.js` (repository locations in one place).
   - `build/` — the build AI tool: `lwc-library/` and build conventions now; build agents next.
   - `contracts/engagement.schema.json` — the handover shape both tools use.
   - Shared at the root: `docs/` (ADRs, strategy, implementation plan, security gates), `.claude/skills/`, `clients/`
     (gitignored), `CLAUDE.md`, one `package.json`.
2. **Handover:** `clients/<slug>/engagement.json`, the Jira backlog and the completed configuration workbook. The build tool
   does not read offer pricing.
3. **Removed:** `forms/client-brief.md` (replaced by the questionnaire), the demo-store shell scripts `scripts/01…06` and
   `shopify-check.sh` (unused; the Commerce Agent replaces them), the Shopify store variables in `.env.example`, the client
   name in an offering rationale, and 38 exports used only inside their own file.

## Consequences

- Imports inside `discovery/` are unchanged; repository paths come from `discovery/paths.js`.
- The CHANGELOG keeps historical paths; ADRs and docs point to the new locations.
- Bucherer theme copies were never in this repository (moved out under D5); ADR history keeps its references.
