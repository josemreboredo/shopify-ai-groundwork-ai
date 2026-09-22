# ADR 0002 — `engagement.json` + JSON Schema as the single source of truth

- **Status:** Accepted (decisions D2, D3, D4 — 2026-09-16)
- **Date:** 2026-09-16

## Context

The questionnaire CLI, the lwc store-spec schema and the story generator's `normaliseSpec`
used three different spec shapes. A real Frame Agent spec lost most fields on the way to the
story generator (18 of 36 story guards could never fire). The closing deck re-parsed Markdown
that nothing generated. A hand-rolled YAML parser silently dropped data.

## Decision

1. One document per engagement: `clients/<slug>/engagement.json`, validated by
   [`contracts/engagement.schema.json`](../../contracts/engagement.schema.json) (JSON Schema 2020-12,
   `additionalProperties: false` everywhere, snake_case).
2. Unknown answers are **omitted**, never `null`; they are listed in
   `approach.risks.open_items`. Where each answer came from lives in `provenance`, keyed by JSON pointer.
3. All other artefacts — Markdown plan files, the closing deck, Jira stories — are **renderings**
   of `engagement.json`. Nothing parses them back.
4. Questions live in [`discovery/schema/question-bank.json`](../../discovery/schema/question-bank.json); each maps to
   schema pointers. The Markdown questionnaire is generated from it (`npm run questionnaire:render`).
5. Runtime is **Node** for the whole pipeline; the Python Frame Agent was retired in Phase 2 (`discovery/agents/discovery/`).
6. Vetted dependencies are allowed: `ajv` (now), `@anthropic-ai/sdk` and `yaml` when first needed.
7. The schema is versioned (`schema_version`). Breaking changes bump the major version and ship a migration.

## Consequences

- The old `build/lwc-library/store-spec.schema.yaml` was removed in Phase 2; the old story generator (`scripts/generate-stories/`) and the
  interactive merchant questionnaire CLI (`scripts/questionnaire/`) were removed in Phase 4 (the Phase 5 chatbot replaces the CLI).
- The deck (Phase 3) and backlog (Phase 4) read `engagement.json` directly; `parseMarkdown.js`, `estimateCalc.js` and the old story generator were removed.
- Contract tests guard the schema ↔ question bank ↔ offering links.
