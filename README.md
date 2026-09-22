# shopify-ai-builder

AI tooling for Merkle's Shopify engagements: from the first discovery conversation with a client to a store built by
agents. The Lead Consultant stays in charge; the tools do the structured work — asking the right questions, applying
Merkle's offer rules, drafting the proposal and preparing the build. Governed by the Gaia methodology (`CLAUDE.md`).

## What the repository is for

A Shopify engagement runs in two stages, and the repository has one tool for each:

```
  Client conversation                    Discovery AI tool                          Build AI tool
 ─────────────────────   ─────────────────────────────────────────────────   ──────────────────────────
  interview or            offer (S / M / L) and exit rules                     Shopify configuration
  questionnaire     ──▶   Shopify plan benchmark, app signals          ──▶     theme or Hydrogen storefront
                          implementation approach                              apps
                          Discovery Closing Deck (Lead Consultant draft)
                          Jira backlog · store configuration workbook
                                          │
                                          └── handover: clients/<slug>/engagement.json
                                              + backlog + completed workbook
```

1. **Discovery AI tool** (`ai/`, in use). The Lead Consultant runs the interview in Claude Code (`/interview`) or
   processes a completed questionnaire (`/discover`). Code — not the model — decides the offer, scope gates, exit rules
   and Shopify plan; the model extracts answers and drafts the approach. Outputs: the engagement record, the Discovery
   Closing Deck, the Jira backlog and the tax and shipping configuration workbook. Engagements beyond the standard
   offers become a *Larger Engagement* (a Merkle Enterprise Engagement with a dedicated Discovery Phase).
2. **Build AI tool** (`build/`, next). Agents that configure the store and build the storefront from the discovery
   handover.

The questionnaire is Shopify-knowledge based: every question that decides the plan or an app links to Shopify
documentation and App Store candidates, checked at each Shopify Edition.

## Repository structure

```
shopify-ai-builder/
├── ai/                         Discovery AI tool
│   ├── engine/                 shared engine: extraction, offer, exit rules, plan benchmark, app signals, approach
│   │                           — used by both the bid and engagement paths (docs/adr/0018-ai-folder-layout.md)
│   ├── bid/                    RFP-only: the clarification questions sent back to a client before a proposal
│   ├── engagement/             consultant-run interview: sessions, next questions, answers, preview
│   ├── discovery-deck/         Discovery Closing Deck data (Lead Consultant draft)
│   ├── backlog/                Jira stories per epic and CSV export
│   ├── workbook/               tax and shipping configuration workbook
│   ├── shared/                 service layer both the web app and the Claude connector call (2.0.0)
│   ├── mcp/                    MCP connectors, one subfolder each — today: merkle-discovery/
│   ├── schema/                 question bank, offering (internal pricing and rules), App Store registry, labels
│   ├── scripts/                questionnaire and consultant guide generator, app approvals
│   ├── docs/                   client questionnaire and consultant guide (generated), deck template and prompt,
│   │                           mainland China briefing, architecture, validation
│   ├── tests/                  unit tests and engagement fixtures
│   └── paths.js                repository locations used by the tool
├── build/                      Build AI tool
│   ├── lwc-library/            design tokens and market presets (e.g. Switzerland)
│   └── docs/conventions/       build conventions
├── frontend/                   Lead Consultant web app (2.0.0, in progress)
├── contracts/
│   └── engagement.schema.json  the handover shape shared by both tools
├── docs/                       shared: decisions (adr/), commercial model (strategy.md, internal),
│                               roadmap (implementation-plan.md), security gates
├── .claude/skills/             Claude Code skills: /interview, /discover, /architect, /deck
├── clients/                    client engagements and outputs — gitignored, never committed
├── CLAUDE.md                   project instructions for Claude Code
└── CHANGELOG.md
```

More detail: [`ai/README.md`](ai/README.md) · [`build/README.md`](build/README.md) ·
decisions in [`docs/adr/`](docs/adr/README.md) (ADR 0013 explains the tool split, ADR 0018 the `ai/` layout).

## Getting started

Requirements: Node.js 22.9 or later, and Claude Code for the interview, discovery and deck skills.

```bash
npm install
npm test                                        # must pass before every commit
```

| Task | Command |
|---|---|
| Run a discovery interview | `/interview` in Claude Code (or `npm run interview -- start --client <slug>`) |
| Process a completed questionnaire | `/discover <questionnaire.md>` in Claude Code |
| Solution architecture and closing document (hosted engagement, Shopify Dev MCP) | `/architect <slug>` (ADR 0017) |
| Discovery Closing Deck | `/deck <slug>` (data: `npm run deck -- --client <slug>`) |
| Jira backlog (GO engagements) | `npm run backlog -- --client <slug>` |
| Tax and shipping configuration workbook | `npm run workbook -- --client <slug>` |
| Regenerate the questionnaire and consultant guide | `npm run questionnaire:render` (after editing the question bank) |
| Approve an App Store app after an engagement | `npm run apps -- approve --handle <handle> --by <role>` |
| Lead Consultant web app (2.0.0, in progress; demo data only) | `DEV_LOGIN=<github-login> npm run web` — see [`frontend/README.md`](frontend/README.md) |

## Data and security

- **Client data** lives only in `clients/` (gitignored). Engagement records hold no customer personal data; stakeholders
  are recorded by role.
- **LLM processing** needs the client's consent (questionnaire Q10.5.2); questionnaires are redacted before the model
  sees them (ADR 0007). Every execution mode must run under a dentsu Claude Enterprise seat — access to the tool is
  restricted to consultants who hold one, since the app cannot verify account tier at runtime.
- **Internal pricing** (offer bands, modifiers, commercial warnings) stays in `ai/schema/offering.json` and the
  deck's consultant-notes section; client-facing documents are checked for leaks (`npm run deck:check`).
- **Secrets** stay in `.env` (gitignored); see [`docs/conventions/security-gates.md`](docs/conventions/security-gates.md).

## Status

**1.0.0** — Discovery AI tool released (see [`CHANGELOG.md`](CHANGELOG.md)). **2.0.0** — Lead Consultant frontend connected to Claude Projects, in progress; build agents follow
([`docs/implementation-plan.md`](docs/implementation-plan.md)).
