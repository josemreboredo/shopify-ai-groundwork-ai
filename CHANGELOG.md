# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).
Pre-1.0: the discovery → deck → backlog → build pipeline is not yet end to end (see `docs/implementation-plan.md`).

## [Unreleased]

Phase 2 of the implementation plan — discovery engine.

### Added
- `agents/discovery/` — discovery engine (`npm run discover -- --questionnaire <file>`): consent check, personal-data redaction, LLM extraction with structured outputs, deterministic offer classification and exit rules 11.1–11.16, LLM-drafted approach on GO, schema validation, Markdown renderings or STOP report
- Default model `claude-opus-5` with server-side refusal fallbacks; override with `DISCOVERY_MODEL`
- Threat model: `docs/architecture/discovery-engine-threat-model.md`
- Tests: offer and exit rules against the golden fixtures; full pipeline with recorded LLM responses; redaction, consent, stop-reason and pricing-leak guards
- Dependency: `@anthropic-ai/sdk` (D4)

### Removed
- Python Frame Agent (`agents/frame-agent/`) and its tests — replaced by the discovery engine; brief / interactive modes return with the Phase 5 chatbot
- `lwc-library/store-spec.schema.yaml` — superseded by `schema/engagement.schema.json`

### Known issues
- `agents/discovery-deck/build_xml.js` still reads `store-spec.yaml`; it moves to `engagement.json` in Phase 3

## [0.2.0] — 2026-09-16

Phase 1 of the implementation plan — foundation (offering model, engagement schema, question bank).

### Added
- `schema/offering.json` — S/M/L offers, six scope gates, L triggers, internal modifiers, integration definition and exit rules 11.1–11.16 as data (ADR 0001, 0003)
- `schema/engagement.schema.json` — JSON Schema for one client engagement, the single source of truth between pipeline stages (ADR 0002)
- `schema/question-bank.json` — 184 discovery questions, each mapped to schema fields and to the gates / exit rules it feeds
- `schema/index.js` — loaders, schema validation (ajv) and pointer helpers
- `npm run questionnaire:render` — generates `docs/discovery/client-questionnaire.md` from the question bank; § 11 is generated from the exit rules
- ADRs 0001–0007 in `docs/adr/`
- Contract tests: schema ↔ question bank ↔ offering traceability; rendered questionnaire must be up to date
- Dependency: `ajv` (D4)

### Changed
- `docs/discovery/client-questionnaire.md` is now generated (new section numbering; § 10 Delivery, governance & compliance; § 11 exit screening)
- `docs/strategy.md` — multi-consultant scope, pipeline diagram, discovery engine contract, exit rules point to `offering.json`
- `lwc-library/README.md` — S/M/L offers replace Starter/Medium/Large (CHF); Swiss baseline is an opt-in market preset (ADR 0004)

### Decisions
- ADRs 0001–0007 accepted
- Exit rules 11.12–11.15 accepted as FLAG; 11.16 (no single decision-maker) is a FLAG resolved before the statement of work
- Migration gate counts any non-Shopify source platform; multi-currency uses the `+Markets` modifier; luxury positioning alone triggers offer L; 11.2 routes to an architecture review (see `offering.json → resolved_questions`)

### Deprecated
- `lwc-library/store-spec.schema.yaml` — superseded by `schema/engagement.schema.json`; removed when the Frame Agent is retired (Phase 2)

## [0.1.0] — 2026-09-16

First tagged baseline. Phase 0 of the implementation plan.

### Added
- Discovery questionnaire (`docs/discovery/client-questionnaire.md`) and filled ACME example
- Frame Agent `--questionnaire` mode (questionnaire → `store-spec.yaml`, tier + exit-trigger evaluation)
- LWC library: design tokens, store-spec schema, Swiss commerce baseline (locales, tax/shipping, payments, markets)
- Story generator (`npm run generate-stories`) and interactive questionnaire CLI (`npm run questionnaire`)
- Discovery Closing Deck work in progress (`agents/discovery-deck/`, deck template and prompt) — to be replaced in Phase 3
- Implementation plan with accepted decisions D1–D7 (`docs/implementation-plan.md`)
- Test harness: `npm test` (node:test + Python unittest, LLM mocked)

### Fixed
- `generate-stories` crashed on start (wrong import paths)
- `market_list` was always emptied during spec normalisation; PyYAML-style lists and quoted `"EXIT: …"` items were misparsed
- Questionnaire wrote answers to the Node binary path when `--output` was omitted
- Frame Agent wrote the spec even when exit triggers stopped delivery; `--interactive` crashed
- Deck builder source contained raw control bytes

### Security
- `.gitignore` covers `.env*`, `clients/` and Python caches; `.env.example` added
- Frame Agent rejects client slugs that could write outside `clients/`
- Client-branded theme copies removed from the repository

### Known issues
- Frame Agent classification does not yet follow the S/M/L offering scope gates (Phase 1–2)
- Store-spec fields from the Frame Agent are only partly read by the story generator (Phase 1)
- Admin setup scripts (`scripts/01–06`) are single-store, non-idempotent and lack a production guard (Phase 6)

[0.2.0]: https://github.com/jose-reboredo/shopify-ai-builder/releases/tag/v0.2.0
[0.1.0]: https://github.com/jose-reboredo/shopify-ai-builder/releases/tag/v0.1.0
