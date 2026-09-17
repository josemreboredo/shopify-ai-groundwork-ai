# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow [SemVer](https://semver.org/).
Pre-1.0: the discovery → deck → backlog → build pipeline is not yet end to end (see `docs/implementation-plan.md`).

## [Unreleased] — 2.0.0

### Added
- Architecture for the Lead Consultant frontend (`discovery/docs/architecture/lc-frontend-2.0.md`) and ADR 0014: one discovery service used by a web app and by a connector in each consultant's private Claude Project; staged data location (local beta, EU-hosted 2.0.0); React with React Router; owner pilot with demo clients.
- Hosting and sign-in requirements for dentsu IT (`discovery/docs/architecture/lc-frontend-hosting-requirements.md`); implementation plan Phase 7.
- Interim hosting decision: Vercel Pro on a personal account (functions and Neon Postgres in London, `lhr1` — no EU region offered for Neon on the Vercel Marketplace), GitHub login with an allowlist, demo data only; migration to dentsu systems in 2.x.
- 2.0.0-alpha: discovery service (`discovery/service/`) — shared operations for the web app and the future Claude connector on top of the unchanged interview engine; file, Postgres and memory stores; access by owner and role; GitHub allowlist.
- 2.0.0-alpha: Lead Consultant web app (`frontend/`, React Router 7, `npm run web`) — GitHub sign-in, engagement list, interview screens generated from the schema, live offer, scope gates, exit rules, Shopify plan and app signals; Vercel config for London.

### Changed
- The schema loader imports its JSON files as modules so bundled server code carries them.

- 2.0.0: Claude connector (ADR 0015) — MCP endpoint `/mcp` with ten discovery tools, OAuth authorization server (CIMD from claude.ai, PKCE S256, hashed and rotating tokens), consent page after GitHub sign-in; shared memory with the web app: answers from documents recorded "to confirm" with citations, confirmation on the engagement page, document register, channel and author per answer; Claude Project page with connector set-up and Project instructions.
- Table questions are answered row by row in the web app (no JSON).
- Open sign-in (owner decision): every GitHub account signs in as consultant by default during the pilot (`SIGN_IN_MODE=allowlist` restores the allowlist; `CONSULTANT_GITHUB_LOGINS=*` also opens it); owners stay named; a taken client slug is reported without revealing another consultant's engagement.
- Discovery Closing Document from the Claude Project (ADR 0016): connector tools `prepare_closing_document`, `save_approach`, `save_closing_document`, `get_closing_document` run the same pipeline as `/interview` + `/deck` in memory (engine decision, validated approach, deck data, deck prompt); the web app's Closing document tab shows readiness and downloads the saved Markdown (versions kept).
- Review and change answers: every question by section with its state and answer in words; edit pre-filled, clear an answer or reopen a TBC, not-applicable or commented question (web app tabs Interview · Review answers · Summary).
- Summary from code (no AI): offer, GO or STOP, gates, exit rules, Shopify plan, app signals, open items and answers by section — as a page, a Markdown download and the Claude connector tool `get_summary`.
- Dates: date questions use a calendar input in the web app, and typed dates are accepted day first (01/05/27, 1.5.2027) or as YYYY-MM-DD, for the web app and Claude.
- Shared engagements (owner decision): every signed-in user sees and works on every engagement during the pilot, in the web app and the Claude connector; `ENGAGEMENT_VISIBILITY=own` restricts consultants to their own.
- A comment alone is a valid answer: when no value fits (e.g. “we only ship inside the EU”), the question counts as clarified by comment, leaves the queue and stays an open item for the offer and deck; web app, Claude connector (`mark_questions` commented) and CLI (`interview -- comment`).
- Countries, currencies and languages can be entered as names in English, German, French, Italian or Spanish (“Switzerland”, “Schweiz”, “UK”, “euros”, “German”) or as codes, with suggestions in the web app; the service converts them to ISO codes before validation, for the web app and Claude.

### Deployed
- 2.0.0-alpha on Vercel (interim, demo data only): GitHub sign-in, engagement list and interview verified end to end with Neon Postgres in London. Fixes found on the first deploy: `ajv` declared by the web app (Vercel installs `frontend/` only), framework pinned to React Router in `vercel.json`.

## [1.0.0] — 2026-09-17

**Discovery AI tool — first major release.** Same code as 0.7.0, released as the 1.0.0 baseline. Version 2.0.0 adds the
Lead Consultant frontend and its connection to Claude Projects.

- Consultant-run interview (`/interview`) and questionnaire processing (`/discover`) with a Shopify-knowledge question bank
- Offer (S / M / L), scope gates, exit rules, Shopify plan benchmark and App Store signals decided by code
- Larger Engagement and no-bid routes after a STOP; mainland China routed to a separate China discovery
- Implementation approach, Discovery Closing Deck (Lead Consultant draft), Jira backlog, store configuration workbook
- Repository split into the discovery tool, the build tool and the shared engagement contract

## [0.7.0] — 2026-09-17

### Changed
- Repository split into the discovery AI tool (`discovery/`: agents, schema, scripts, docs, tests) and the build AI tool (`build/`: lwc-library, build conventions), with the shared engagement contract in `contracts/engagement.schema.json` (ADR 0013). Repository paths come from `discovery/paths.js`; npm commands are unchanged.
- README rewritten: what the repository is for, the discovery-to-build flow, structure, commands, data and security; `discovery/README.md` and `build/README.md` added.

### Removed
- `forms/client-brief.md` (replaced by the questionnaire), the demo-store shell scripts (`scripts/01…06`, `shopify-check.sh`) and the Shopify store variables in `.env.example`.
- Client name in an offering rationale; 38 exports used only inside their own file.

## [0.6.2] — 2026-09-17

### Fixed
- Exit rule 11.11 (Grow retainer) no longer fires on a routed STOP (Larger Engagement or no bid): no S/M/L offer is quoted.
- App Store candidates stay in their area: apps a question lists for several areas carry `areas` in the app registry (tracking apps are no longer returns candidates, bundle apps no longer pre-order candidates).
- Deck: a launch market without a pricing approach is a field to complete; expected outcomes list a goal that restates a KPI only once.

## [0.6.1] — 2026-09-17

Open items from 0.6.0: Retail & POS pricing, ask_if thresholds, mainland China licensing, tax and shipping set-up (ADR 0012).

### Added
- `+Retail` modifier for the Retail & POS scope gate: +1 week, +€8–12k, up to 5 stores (owner decision; `offering.json` 1.3.0).
- Exit rule 11.22 (WARN): more than 5 retail stores — quote the programme and roll-out increments, or a rate-carded run team; never a per-store price (internal note, consultant notes only).
- Tax and shipping questions (question bank 1.2.0, ADR 0012): products restricted by market (Q3.1.8), DDP countries (Q3.4.8), low-value import schemes (Q3.4.9), reduced rates and exemptions (Q3.4.10), invoice issuer (Q3.4.11), e-invoicing obligations (Q3.4.12), product weights source (Q5.1.13), dangerous goods (Q5.1.14), B2B shipping rules (Q6.2.13).
- App signal `invoicing_app` (Sufio, Order Printer Pro, POP added to the app registry as proposed).
- Store configuration workbook: `npm run workbook -- --client <slug>` writes a client-facing, pre-filled tax and shipping set-up workbook; backlog tax, shipping and duties stories point to it.

### Changed
- `ask_if` thresholds (owner decisions): post-purchase, returns, SMS and server-side tracking questions are asked from 500 orders per month (was 1,000).
- Account area (Q6.1.3) and interactive patterns (Q9.2.4) are required in every interview mode (no 100-SKU threshold).
- Loyalty (Q6.3.1) is asked for DTC and hybrid business models instead of a keyword match on goals.
- Pickup points are native for stores in France, Italy, Spain and the UK (no app signal there); duties help text: DDP or DAP per country, not combinable with tax overrides, manual rates or exemptions.
- Mainland China briefing: ICP filing vs licence resolved on MIIT's 2022 notice (self-operated own-site sales need an ICP filing, no licence); adds the 2025 drug and medical-device filing change, online drug and cosmetics sales rules, and questions for PRC counsel (§ 6.10).

## [0.6.0] — 2026-09-17

Shopify-knowledge questionnaire (ADR 0011) — owner decisions on `docs/discovery/questionnaire-shopify-proposal.md`.

### Added
- § 3.5 Mainland China (21 questions from the China discovery checklist: selling model, channels, entities, ICP, Shopify's role, customs, product classification and NMPA, payments, PIPL, blocked services, marketing, service, legal advice), asked only when CN is a launch market (`only_if`): 4 required triage questions in the call, 17 optional for the China discovery; answers in `engagement.china`, the Larger Engagement brief and deck section 18
- Consultant experience review: consultant wrap-up block (STOP route question asked there); unlocking questions moved earlier (orders per month Q0.2.6, current platform Q0.5.4, personalisation Q2.2.6); one question per fact (Q3.3.1 and Q6.2.1 removed — pricing in the markets table, B2B from the business model); § 2.4 consumer pricing only; decisive questions and the deck's business-case questions required; China triage (4 required, 17 optional); neutral client wording and § 11 in the consultant guide only; standard "None" / "Not sure yet" options (not sure becomes an open item); readable option labels (`schema/option-labels.json`)
- `ask_if` relevance conditions: questions that feed only app signals join a quick interview only when an earlier answer makes them relevant (e.g. orders per month ≥ 1,000, pre-order products, 3+ languages); the consultant guide shows each condition
- Question bank 1.1.0 (256 questions): Retail & POS subsection, channels, legal entities, installed apps and deprecated-feature audit, staff users, combined listings, personalisation, bundles, subscriptions, pre-orders, filters, merchant of record, per-market customisation, translation scope, tax display and tax service, express checkouts, payment method rules, chargeback guarantee, routing rules, free-shipping thresholds, delivery methods, sign-in methods, B2B catalogs and unsupported needs, consent approach, SMS and WhatsApp, promotion targeting, headless reasons, hosting, content and features, A/B testing, Shopify Payments eligibility
- `shopify` knowledge blocks (native feature, minimum plan, Shopify docs URL, App Store category, apps, extension points, verification date) and the generated `docs/discovery/consultant-guide.md`
- `schema/apps.json` App Store registry (88 apps with listing check level); apps are proposed until a lead consultant approves them after the engagement (`npm run apps -- approve`)
- Shopify plan benchmark (`agents/discovery/plan.js`): 19 plan rules with Shopify docs; 11.1 compares each required feature's minimum plan with the target plan
- Exit rules 11.18 (deprecated Shopify features, FLAG), 11.19 (B2B needs Shopify B2B does not support, FLAG), 11.20 (mainland China excluded, separate China discovery, FLAG), 11.21 (mainland China only, STOP)
- Retail & POS scope gate (no modifier until priced); integrated POS counts as an integration
- 15 new app signals (back-in-stock, pre-orders, product options, bundles, subscriptions, B2B quotes, loyalty, reviews, translation, consent, fraud guarantee, SMS, delivery scheduling, server-side tracking, wishlist) and App Store candidates per signalled area in the approach input and deck section 18

### Changed
- S and M no longer assume Shopify Plus; 11.2 (quotes) and 11.5 (options, now also > 2,048 variants) are FLAGs
- App signals follow Shopify's native baseline: B2B returns and customer cancellation requests are native; return labels and automatic delivery dates are signals only outside the US
- The client questionnaire carries no Shopify plan information (tested); § 11 uses a client wording for 11.1
- Mainland China is excluded from markets, languages, offer, plan and build stories
- Field types follow Shopify's feature names (e.g. `checkout.customisation`, `shipping.rates`, `payments.local_methods` are multi-select; `markets.geo_redirect`, `shipping.returns.portal` are enums; `shipping.routing_rules` replaces `complex_routing`) — re-run discovery for 1.0.0 engagements
- Removed or merged: Q4.2.5, Q5.1.8, Q5.5.5, Q6.1.2 (legacy accounts deprecated), Q7.3.3, Q7.6.8, Q10.2.4
- Offering 1.2.0

## [0.5.1] — 2026-09-17

Fixes from the ReboLabs demo interview (ADR 0009).

### Added
- **Larger Engagement:** after a STOP the lead consultant records the route (`delivery.route`, question Q10.5.5, asked in every interview mode while a STOP is open): `larger_engagement` (Merkle Enterprise Engagement with a dedicated Discovery Phase) or `no_bid`. The STOP stays open
- Larger Engagement output: drafted approach (Phase 1 = Discovery Phase, one workstream per open STOP), `larger-engagement-brief.md`, capability map, delivery plan, app shortlist and risks
- Larger Engagement client deck (`mode="LARGER_ENGAGEMENT"`): solution sections without offer, price band, epics or stories; investment and build backlog defined in the Discovery Phase; `deck:check` fails on an offer name or price band
- Exit rule 11.17 (FLAG): sensitive personal data (health, age, biometric, financial) needs a DPIA and legal sign-off
- Minimum Shopify plan suggestion while the plan is open — in the interview preview, the plan open item and the approach input
- App signals from a returns or post-purchase tool the client uses or prefers, or a returns system in the integration landscape

### Changed
- **Deck = Lead Consultant draft (ADR 0010, amends D1):** one full-information document; sections 1–17 for the client, section 18 *Consultant notes* with offer rationale, price band, modifiers, budget vs band, commercial warnings, story points, answers to confirm and consultant notes. `deck-internal-notes.md` is no longer written; `deck:check --file` checks the LC's client version
- **Shopify plan logic per Shopify's documentation:** Shopify B2B runs on every plan from Basic, so native B2B no longer fires 11.1; company-specific B2B catalogs, checkout step extensions / Checkout Branding API and expansion stores need Plus. The plan suggestion names the minimum plan and its reasons
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
