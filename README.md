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

1. **Discovery AI tool** (`discovery/`, in use). The Lead Consultant runs the interview in Claude Code (`/interview`) or
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
├── discovery/                  Discovery AI tool
│   ├── agents/
│   │   ├── discovery/          engine: extraction, offer, exit rules, plan benchmark, app signals, approach
│   │   ├── interview/          consultant-run interview: sessions, next questions, answers, preview
│   │   ├── discovery-deck/     Discovery Closing Deck data (Lead Consultant draft)
│   │   ├── backlog/            Jira stories per epic and CSV export
│   │   └── workbook/           tax and shipping configuration workbook
│   ├── schema/                 question bank, offering (internal pricing and rules), App Store registry, labels
│   ├── scripts/                questionnaire and consultant guide generator, app approvals
│   ├── docs/                   client questionnaire and consultant guide (generated), deck template and prompt,
│   │                           mainland China briefing, architecture, validation
│   ├── tests/                  unit tests and engagement fixtures
│   └── paths.js                repository locations used by the tool
├── build/                      Build AI tool
│   ├── lwc-library/            design tokens and market presets (e.g. Switzerland)
│   └── docs/conventions/       build conventions
├── contracts/
│   └── engagement.schema.json  the handover shape shared by both tools
├── docs/                       shared: decisions (adr/), commercial model (strategy.md, internal),
│                               roadmap (implementation-plan.md), security gates
├── .claude/skills/             Claude Code skills: /interview, /discover, /deck
├── clients/                    client engagements and outputs — gitignored, never committed
├── CLAUDE.md                   project instructions for Claude Code
└── CHANGELOG.md
```

More detail: [`discovery/README.md`](discovery/README.md) · [`build/README.md`](build/README.md) ·
decisions in [`docs/adr/`](docs/adr/README.md) (ADR 0013 explains this layout).

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
| Discovery Closing Deck | `/deck <slug>` (data: `npm run deck -- --client <slug>`) |
| Jira backlog (GO engagements) | `npm run backlog -- --client <slug>` |
| Tax and shipping configuration workbook | `npm run workbook -- --client <slug>` |
| Regenerate the questionnaire and consultant guide | `npm run questionnaire:render` (after editing the question bank) |
| Approve an App Store app after an engagement | `npm run apps -- approve --handle <handle> --by <role>` |

## Data and security

- **Client data** lives only in `clients/` (gitignored). Engagement records hold no customer personal data; stakeholders
  are recorded by role.
- **LLM processing** needs the client's consent (questionnaire Q10.5.2); questionnaires are redacted before the model
  sees them (ADR 0007). Claude Code currently runs on a personal Claude Pro account — move to dentsu's Claude
  Enterprise before any dentsu / Merkle adoption.
- **Internal pricing** (offer bands, modifiers, commercial warnings) stays in `discovery/schema/offering.json` and the
  deck's consultant-notes section; client-facing documents are checked for leaks (`npm run deck:check`).
- **Secrets** stay in `.env` (gitignored); see [`docs/conventions/security-gates.md`](docs/conventions/security-gates.md).

## Status

**1.0.0** — Discovery AI tool released (see [`CHANGELOG.md`](CHANGELOG.md)). **2.0.0** — Lead Consultant frontend connected to Claude Projects, in progress; build agents follow
([`docs/implementation-plan.md`](docs/implementation-plan.md)).
