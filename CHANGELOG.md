# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).
Pre-1.0: the discovery → deck → backlog → build pipeline is not yet end to end (see `docs/implementation-plan.md`).

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

[0.1.0]: https://github.com/jose-reboredo/shopify-ai-builder/releases/tag/v0.1.0
