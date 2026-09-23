# shopify-ai-groundwork-ai — CLAUDE.md

This project inherits Gaia (the master methodology) via the `gaia` skill auto-loaded
from `~/.claude/skills/gaia`. Anything in Gaia is the **default behavior** —
14 roles, 3 tracks (A/B/C), 4-gate security regime, Definition of Enough,
token economy, documentation spec.

This file is for **project-specific context only** — never to override Gaia.
If a project's needs conflict with Gaia, file a proposal in
`<working-skills>/references/shopify-ai-groundwork-ai/_intake/` per
`gaia/methodology/reverse-propagation.md`.

---

## What shopify-ai-groundwork-ai is

A Gaia-governed delivery workspace for **Shopify projects** — covering themes, custom
apps, Hydrogen/Remix storefronts, and AI-assisted builder features. This is the primary
workspace for all Shopify client engagements.

## Project context

- **Stack:** Shopify ecosystem (Liquid, Node.js, Remix, Hydrogen, Shopify CLI)
- **Stage:** Active delivery biota
- **Lovelock:** No — this is a client-delivery biota, not a synthetic regime-test
- **Cadence:** Standard sprint cadence per `gaia/methodology/agile-process.md`

## Repository layout (ADR 0013, reorganised under `ai/` per ADR 0018)

| Folder | What it is |
|---|---|
| `ai/` | **Discovery AI tool** — the shared engine (`ai/engine/`), the live-conversation path (`ai/engagement/`), the RFP-only path (`ai/bid/`), the service layer (`ai/shared/`), MCP connectors (`ai/mcp/<connector>/`), deck/backlog/workbook generators, question bank, offering, app registry, docs and tests |
| `build/` | **Build AI tool** (next) — build agents that configure stores and themes from the discovery handover; `build/lwc-library/` tokens and market presets |
| `contracts/` | The handover between both tools: `engagement.schema.json` |
| `docs/` | Shared: ADRs, strategy (commercial model), implementation plan, security gates |
| `clients/` | Client data (gitignored), used by both tools |
| `frontend/`, `ai/shared/` | **2.0.0 (in progress)** — Lead Consultant web app (`npm run web`, `frontend/README.md`) and discovery service; Claude Projects connector next (ADR 0014). Interim hosting: demo data only |

Handover from discovery to build: `clients/<slug>/engagement.json`, `backlog.csv` / `backlog.json` and the completed
`configuration-workbook.md`. The build tool never reads offer pricing from `ai/schema/offering.json`.

## Engagement contract (ADR 0002)

- `contracts/engagement.schema.json` — one client engagement (`clients/<slug>/engagement.json`, gitignored)
- `ai/schema/question-bank.json` — every discovery question and the fields it fills
- `ai/schema/offering.json` — S/M/L offers, scope gates, exit rules (internal pricing — never client-facing)
- `ai/schema/apps.json` — App Store registry; apps stay `proposed` until a lead consultant approves them after the engagement (`npm run apps -- approve`)
- `ai/docs/client-questionnaire.md` (client, no plan information) and `ai/docs/consultant-guide.md` (Shopify knowledge per question) are **generated** — edit the question bank, then `npm run questionnaire:render`
- Shopify facts (features, plans, apps) come from Shopify documentation with a verification date (ADR 0011); S/M do not assume Shopify Plus
- Mainland China is not part of the offering: rule 11.20 routes it to a separate China discovery (`ai/docs/china-mainland.md` — Shopify has no infrastructure in mainland China)
- Discovery: `/discover <questionnaire.md>` in Claude Code (or `npm run discover` with an API key) → `clients/<slug>/engagement.json` (see `ai/engine/README.md`)
- Every execution mode (Claude Code, Claude Projects) must run under a dentsu Claude Enterprise seat — a policy control, not a code one (ADR 0007)
- Interview: `/interview` in Claude Code (consultant-run, any language, answers stored in English) → same pipeline as `/discover`
- After a STOP the consultant records the route (Q10.5.5): Larger Engagement (Merkle Enterprise Engagement with a dedicated Discovery Phase) drafts the approach, a brief and the client deck — no Jira tickets; or no bid (ADR 0009)
- Tax and shipping set-up: `npm run workbook -- --client <slug>` → `configuration-workbook.md`, completed by the client after the scope is agreed (ADR 0012)
- Backlog: `npm run backlog -- --client <slug>` → `backlog.csv` for Jira import · Deck: `/deck <slug>` (or `npm run deck`) — full-information draft for the Lead Consultant, who filters before sharing (ADR 0010)
- Roadmap: `docs/implementation-plan.md` · decisions: `docs/adr/` · `npm test` must pass before commit

## Shopify-specific conventions

Shared conventions live in `docs/conventions/`; build conventions in `build/docs/conventions/`. Read the relevant file
before starting any sprint:

| File | Covers | Status |
|---|---|---|
| `build/docs/conventions/shopify-delivery.md` | Requirement → capability mapping, tier guide, CLI rules | ✅ exists |
| `docs/conventions/security-gates.md` | Store tokens, PII, scope control, production guard | ✅ exists |
| `build/docs/conventions/shopify-theme.md` | Liquid, Dawn/OS2, theme architecture, CLI | planned |
| `build/docs/conventions/shopify-app.md` | Node/Remix apps, App Bridge, webhooks, Shopify CLI | planned |
| `build/docs/conventions/shopify-hydrogen.md` | Hydrogen, Remix, Oxygen deployment | planned |
| `build/docs/conventions/shopify-api.md` | Admin API, Storefront API, versioning, rate limits | planned |

## Installed tooling

| Tool | Version | Purpose |
|---|---|---|
| Shopify AI Toolkit | 1.8.2 | Claude Code plugin — live docs, schema validation, store management |
| Shopify CLI | 4.8.0 | Store management, theme push/pull, app deployment |
| Node.js | 25.x | Runtime requirement for Shopify CLI |

Install the plugin (already done for this workspace):
```terminal
claude plugin install shopify-ai-toolkit@claude-plugins-official
```

## Tiering guidance (Shopify-specific additions)

These supplement (never replace) the Gaia tier definitions:

- **T1:** CSS/Liquid token tweak, copy change in a section schema, single-line fix
- **T2:** New section/block on existing theme, new webhook handler on existing app,
  new Storefront API query in existing Hydrogen route
- **T3:** New Shopify App (first integration), new Hydrogen storefront, adding
  metaobjects/metafields to a data model, AI feature with LLM calls
- **T4:** Migrating payment provider, adding PCI-scoped checkout customisation,
  re-platforming theme foundation, switching Shopify plan tier with API surface changes

## Security gates (Shopify-specific — mandatory)

The Gaia security regime applies fully. Additionally, for all Shopify work:

1. **API keys / access tokens** — never committed, never logged, always in `.env`
   (gitignored) or Shopify CLI environment injection
2. **Webhook HMAC verification** — every inbound webhook MUST verify the
   `X-Shopify-Hmac-Sha256` header before processing payload
3. **PII scope** — customer email, name, address, order data are PII under GDPR/CCPA;
   never log them, never send them to external LLMs without explicit consent gate
4. **Storefront API tokens** — public-facing tokens are scoped read-only; never expose
   Admin API tokens client-side
5. **App proxy / OAuth** — follow Shopify's OAuth 2.0 flow exactly; never store tokens
   in cookies without HttpOnly + Secure flags

See `docs/conventions/security-gates.md` for full detail.

## Roles engaged (Shopify-specific lens)

Gaia's 14 roles apply. These roles have Shopify-specific scope expansions:

- **Security Engineer** — adds Shopify PCI / webhook / OAuth gates (see above)
- **Architect** — reads `docs/conventions/` for the project type before designing
- **Tech Lead** — uses Shopify CLI for all scaffolding; never hand-rolls app structure
- **QE** — tests include Shopify webhook replay, App Bridge UI smoke tests, and
  Storefront API contract tests where applicable

## Project-specific learnings

Accumulate in `docs/learnings.md` as the biota surfaces Shopify-specific dynamics.
File cross-biota learnings as Track C proposals in
`<working-skills>/references/shopify-ai-groundwork-ai/_intake/`.
