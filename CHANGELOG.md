# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).
Pre-1.0: the discovery → deck → backlog → build pipeline is not yet end to end (see `docs/implementation-plan.md`).

## [Unreleased]

Fixes from the ReboLabs demo interview (ADR 0009).

### Added
- **Larger Engagement:** after a STOP the lead consultant records the route (`delivery.route`, question Q10.5.5, asked in every interview mode while a STOP is open): `larger_engagement` (Merkle Enterprise Engagement with a dedicated Discovery Phase) or `no_bid`. The STOP stays open
- Larger Engagement output: drafted approach (Phase 1 = Discovery Phase, one workstream per open STOP), `larger-engagement-brief.md`, capability map, delivery plan, app shortlist and risks
- Larger Engagement client deck (`mode="LARGER_ENGAGEMENT"`): solution sections without offer, price band, epics or stories; investment and build backlog defined in the Discovery Phase; `deck:check` fails on an offer name or price band
- Exit rule 11.17 (FLAG): sensitive personal data (health, age, biometric, financial) needs a DPIA and legal sign-off
- Shopify Plus suggestion while the plan is open and native B2B, Checkout Extensibility or expansion stores are in scope — in the interview preview, the plan open item and the approach input
- App signals from a returns or post-purchase tool the client uses or prefers, or a returns system in the integration landscape

### Changed
- Exit rule destinations "Scale programme" (11.3, 11.4) and "Bespoke quote" (11.7) are now Larger Engagement workstreams
- No Jira backlog for a Larger Engagement (`npm run backlog` explains why)
- `markets.primary_market` (one country) is now `markets.primary_markets` (one or more) — re-run discovery for existing engagements
- Consultant notes from the interview are stored in `engagement.notes` and shown in the STOP report, risks and brief (never sent to the model, never in the client deck)
- Every interview mode asks the questions that feed the offer, an exit rule or an app signal (quick mode previously skipped e.g. SKU complexity, 11.1, 11.13, 11.14 and all returns / post-purchase signals)
- `interview finish` warns when the offer is still provisional and returns the route
- Offering 1.1.0

## [0.5.0] — 2026-09-17

Phase 5 of the implementation plan — consultant interview.

### Added
- `agents/interview/` and the `/interview` Claude Code skill: consultant-run discovery interview in any language with answers stored in English; consent first; quick / standard / full modes; skip logic; gate-feeding questions first; per-answer schema validation with personal-data refusal; provenance, TBC, skip and notes; resumable sessions; live preview of offer, scope gates, exit rules, app signals and coverage; `finish` hands over to the discovery pipeline
- `npm run interview -- <start|next|answer|tbc|skip|note|preview|finish> --client <slug>` (JSON output)
- ADR 0008 (interview surface and session model), architecture note and validation plan for the consultant pilot
- Parity tests: the same answers through the interview and the questionnaire give identical offer, exit rules and GO/STOP

### Changed
- `meta.source` is `chatbot` for interview engagements

## [0.4.0] — 2026-09-16

Phases 3 and 4 of the implementation plan — Discovery Closing Deck and Jira-ready backlog.

### Added
- `agents/backlog/` — story model v2 (stable keys, epics, user stories, Given/When/Then acceptance criteria, Gaia tier, points, dependencies, security flags, agent prompts), selection from `engagement.json`, `npm run backlog -- --client <slug>` → `backlog.csv` (Jira Cloud CSV import with epics), `backlog.md`, `backlog.json`
- Story catalogue across 14 epics, including migration and redirects, shipping and tax, B2B, page builds, analytics and consent, accessibility and performance, QA/UAT, launch and hypercare
- `agents/discovery-deck/build.js` — deck data from `engagement.json` + `backlog.json`: `npm run deck` → `discovery-deck.xml` (client-safe, price band only) and `deck-internal-notes.md` (modifiers, gate evidence, budget vs band, commercial warnings, story points); `npm run deck:check` scans the final deck for internal data
- `/deck` Claude Code skill writes `discovery-deck.md` from the XML
- Tests for the backlog contract, CSV structure, deck sections, STOP deck and leak guards

### Changed
- `docs/discovery/deck-template.md` and `deck-prompt.md` rewritten for `engagement.json` and D1

### Removed
- `agents/discovery-deck/build_xml.js`, `parseMarkdown.js`, `estimateCalc.js`
- Old story generator (`scripts/generate-stories/`, YAML store-spec fixtures) — replaced by `agents/backlog/`
- Interactive merchant questionnaire CLI (`scripts/questionnaire/`) — incompatible with the engagement schema; the Phase 5 chatbot replaces it

### Added (post-purchase discovery)
- 26 questions in § 5 (210 total): returns (window, return rate, labels, who pays, exchange types, international and B2B returns, inspection, reasons), cancellations and order editing, refunds (methods, trigger, shipping refund, restocking fee, approval, finance sync) and post-purchase experience (branded tracking page, proactive delivery updates, delivery estimates, warranty and repair claims, platform preference)
- Engagement schema: extended `shipping.returns` and new `post_purchase` block
- `agents/discovery/app-signals.js`: deterministic reasons a requirement goes beyond native Shopify (returns platform, post-purchase tracking platform such as Narvar/AfterShip/parcelLab, order editing app, warranty claims); passed to the approach step so apps are recommended only with evidence
- Backlog stories LWC-SHP-007 (cancellations and order editing), SHP-008 (refund rules and finance sync), SHP-009 (post-purchase tracking and delivery updates), SHP-010 (warranty and repair claims); returns story uses the new answers

### Changed (data ownership)
- Integrations default to PIM → products, content and attributes; ERP → prices, inventory and orders. ERP stories never overwrite product content; Q8.1.1 explains the split; ACME example uses a generic ERP plus a PIM (no vendor names)

## [0.3.0] — 2026-09-16

Phase 2 of the implementation plan — discovery engine.

### Added
- `agents/discovery/` — discovery engine (`npm run discover -- --questionnaire <file>`): consent check, personal-data redaction, LLM extraction with structured outputs, deterministic offer classification and exit rules 11.1–11.16, LLM-drafted approach on GO, schema validation, Markdown renderings or STOP report
- **Claude Code mode** (default): `/discover` skill + `npm run discover:prepare|assemble|finish` — the Claude Code session extracts and drafts, code decides; no API billing
- ⚠ Interim: Claude Code mode runs on a personal Claude Pro account — migrate to dentsu Claude Enterprise before adoption (ADR 0007 amendment, adoption gate in the plan)
- API mode: default model `claude-opus-5` with server-side refusal fallbacks; override with `DISCOVERY_MODEL`; `ANTHROPIC_WORKSPACE_ID` for keys not scoped to a workspace
- Structured outputs fit the API limit of 24 optional parameters: flat pointer/value extraction with one repair call; all-required approach schema
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

[0.4.0]: https://github.com/jose-reboredo/shopify-ai-builder/releases/tag/v0.4.0
[0.3.0]: https://github.com/jose-reboredo/shopify-ai-builder/releases/tag/v0.3.0
[0.2.0]: https://github.com/jose-reboredo/shopify-ai-builder/releases/tag/v0.2.0
[0.1.0]: https://github.com/jose-reboredo/shopify-ai-builder/releases/tag/v0.1.0
