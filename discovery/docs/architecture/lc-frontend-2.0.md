# Architecture — Lead Consultant frontend (2.0.0)

- **Status:** Accepted (owner decisions 2026-09-17, section 8; hosting and SSO pending dentsu IT) · **Tier:** T4 · **ADR:** [0014](../../../docs/adr/0014-lc-frontend-hybrid-staged.md)
- **Builds on:** 1.0.0 discovery AI tool (ADR 0002, 0008, 0009, 0010, 0012, 0013)
- **Hosting requirements for dentsu IT:** [`lc-frontend-hosting-requirements.md`](lc-frontend-hosting-requirements.md)

## 1. Goal

Lead Consultants (LCs) run discoveries without Claude Code or a terminal. In 2.0.0 they can:

1. See their engagements and their status (interview in progress, GO, Larger Engagement, STOP, deck ready).
2. Run the interview live with the client: relevant questions only, answers validated, offer, scope gates, exit rules and
   Shopify plan updating as they answer.
3. Work the same engagement from a **Claude Project** — talk through answers, draft the approach and the deck — with the
   discovery engine doing the checks.
4. Review and download the outputs: Lead Consultant deck draft, client version check, Jira backlog, configuration
   workbook, Larger Engagement brief; approve App Store apps after the engagement.

What does not change: **code decides** (offer, rules, validation, plan, app signals); the model converses, extracts and
drafts. Client-facing outputs never contain internal pricing.

## 2. Architecture (hybrid)

```
   LC in the browser                          LC in a private Claude Project
 ┌───────────────────────┐                  ┌───────────────────────────────────┐
 │ LC web app            │                  │ Project instructions (interview   │
 │ engagements · interview│                  │ skill) + knowledge (consultant    │
 │ live offer and rules  │                  │ guide, deck template)             │
 │ outputs · approvals   │                  │ Merkle Discovery connector ───────┼──┐
 └──────────┬────────────┘                  └───────────────────────────────────┘  │ remote MCP (OAuth)
            │ HTTPS (SSO)                                                            │
            ▼                                                                        ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │ Discovery service (one backend, the only writer of engagement data)                    │
 │  REST API for the web app            MCP server for Claude (same operations as tools)   │
 │  engagements · interview (next, answer, tbc, preview, finish) · approach · deck ·       │
 │  backlog · workbook · app approvals · audit log                                         │
 │  ── uses discovery/agents/* unchanged as a library (code decides) ──                    │
 │  Claude API for server-side LLM steps (extraction, approach) — only in web-app flows     │
 └───────────────────────────────────────┬─────────────────────────────────────────────────┘
                                         ▼
                        Engagement store (location: decision D1)
                        engagement.json · interview sessions · outputs · audit
```

- **One service, two front doors.** The web app and the Claude connector call the same operations, so an interview
  started in the browser can continue in the Claude Project and the other way round.
- **LLM steps:** in the Claude Project, Claude itself converses and drafts (as Claude Code does in 1.0.0) and the
  service validates. In the web app, the service calls the Claude API for extraction and the approach draft.
- **Existing CLI and skills stay** for development and as a fallback.

## 3. Claude Projects — what is possible (checked 2026-09-17, support.claude.com)

| Fact | Consequence for the design |
|---|---|
| Custom connectors (remote MCP servers) work on Free, Pro, Max, Team and Enterprise; on Team and Enterprise only an Owner adds a connector, then each user connects to it | dentsu / Merkle Owner adds the "Merkle Discovery" connector once; each LC signs in to it |
| On Team and Enterprise, **connectors are only available in private projects** | Each LC works in **their own private Project**; sharing between LCs happens in the discovery service and web app, not by sharing a Project |
| The server must be reachable from Anthropic's infrastructure over the public internet (private networks need Anthropic's IP ranges allowlisted); OAuth client ID and secret supported | The service needs a public HTTPS endpoint with OAuth (tied to Merkle SSO) — no local-only option for the Claude path |
| No documented API to create or update Projects | Project set-up is a one-time manual step per LC: the web app offers a **Project kit** (instructions text and knowledge files) |
| Skills can be provisioned organisation-wide by Team and Enterprise Owners | The interview and deck skills can be provided centrally instead of pasted into each Project |
| Interactive connectors can render app interfaces inside Claude conversations | Later option: interview question cards and the live offer panel inside Claude |
| Enterprise-managed auth provisions connector access through the organisation's identity provider | Fits Merkle SSO; confirm with dentsu IT |

Sources: [custom connectors](https://support.claude.com/en/articles/11175166-get-started-with-custom-connectors-using-remote-mcp),
[use connectors](https://support.claude.com/en/articles/11176164-use-connectors-to-extend-claude-s-capabilities),
[projects](https://support.claude.com/en/articles/9517075-what-are-projects),
[skills](https://support.claude.com/en/articles/12512180-use-skills-in-claude),
[interactive connectors](https://support.claude.com/en/articles/13454812-use-interactive-connectors-in-claude).

**Prerequisite:** the dentsu Claude Enterprise account (ADR 0007). A connector added to a personal Pro account must not
receive real client data.

## 4. Where engagement data lives (decision D1)

The Claude Project path needs a publicly reachable service, so the data location decides more than hosting.

| Option | How it works | Claude Projects | Sharing between LCs | Effort and review |
|---|---|---|---|---|
| **A. Hosted service, EU region** | Service and store in a Merkle / dentsu cloud tenant in the EU; SSO; per-engagement access | ✅ full | ✅ | Highest: security and data-residency review, hosting, operations |
| **B. Local companion** | Service runs on each LC's laptop over `clients/`; web app on localhost | ❌ not reachable by Anthropic's servers | ❌ | Lowest: no hosting; Claude path only in Claude Code (as 1.0.0) |
| **C. Staged: B then A** | 2.0.0-beta ships the web app locally (B) while the review runs; 2.0.0 moves the same service to A and adds the connector | ✅ from 2.0.0 | ✅ from 2.0.0 | Medium: LCs get the web app early; the Claude Projects link waits for the review |

**Recommendation: C.** The hybrid and the Claude Projects link need A in the end; staging lets LCs use the web app while
the review, the Enterprise account and hosting are sorted.

### Interim hosting until dentsu systems (owner decision 2026-09-17)

The service is built and hosted on **personal accounts** first and migrated to dentsu systems later.

| Part | Interim choice | Why | Checked (2026-09-17) |
|---|---|---|---|
| Platform | **Vercel Pro** (personal account) | Standard Node runtime: the 1.0.0 engine and ajv run unchanged; React Router preset; remote MCP with OAuth (`mcp-handler`) | Hobby plan is "restricted to non-commercial personal use only" — a paid employee writing the code counts as commercial, so Pro is required ([fair use](https://vercel.com/docs/limits/fair-use-guidelines)) |
| Region | Functions in **Frankfurt (`fra1`)** via `vercel.json` `regions` | Keep processing in the EU | New projects default to Washington, D.C. (`iad1`) — the region must be set ([regions](https://vercel.com/docs/functions/configuring-functions/region)) |
| Storage | **Postgres in an EU region** (Neon via the Vercel Marketplace), behind a storage adapter | Portable to a dentsu Postgres | Region picked at set-up ([Neon for Vercel](https://vercel.com/marketplace/neon)) |
| Sign-in | **GitHub login with an allowlist** (web app and the connector's OAuth) | No extra vendor; replaced by dentsu SSO at migration | — |
| Claude | Connector added to the owner's personal Claude account for the pilot | Private Projects only; see section 3 | — |

Considered and not chosen: Cloudflare Workers — `eval()` and `new Function` are not allowed
([web standards](https://developers.cloudflare.com/workers/runtime-apis/web-standards/)), so the engine's ajv validation,
file-based JSON loading and storage would need rework, and the code would be tied to the Workers runtime.

**Interim rules:** demo or anonymised engagements only — no real client data on personal hosting or a personal Claude
account; secrets only in Vercel environment variables; the allowlist is managed by the owner.

**Migration to dentsu:** the service is plain Node behind a storage adapter and an auth adapter, so moving means a new
host, a Postgres restore and the dentsu identity provider — no engine changes.

## 5. Security and data handling (review items for A)

- Personal data: engagements hold no customer personal data (roles only); the consent gate (Q10.5.2) stays mandatory
  before any LLM step; redaction stays on uploaded questionnaires.
- Internal pricing: offer bands, modifiers and commercial warnings visible only to LC and owner roles; client-safe
  exports keep the `deck:check` leak test.
- Access: SSO; engagement-level permissions (owning LC, reviewers); audit log of answers, approvals and exports.
- Data residency and retention in the EU; deletion of an engagement on request; backups.
- Claude: Enterprise organisation only; connector OAuth scopes limited to the LC's engagements; model training on
  customer data off (check the Enterprise terms with dentsu IT and legal).
- Secrets: Claude API key and OAuth secrets in the platform's secret store, never in the repository.

## 6. Roles

| Role | Can |
|---|---|
| Lead Consultant | Create engagements, run interviews, draft and export outputs for their engagements |
| Reviewer (LC lead) | Read all engagements, comment, approve decks before client sharing |
| Owner | Approve App Store apps, manage the question bank and offering releases, manage users |

## 7. Delivery plan (option C)

| Release | Scope |
|---|---|
| 2.0.0-alpha | Discovery service (REST) over `discovery/agents` with a storage adapter (files locally, Postgres on Vercel) and tests; engagement list and interview screens; runs locally and on a Vercel preview with GitHub login |
| 2.0.0-beta | Outputs (deck draft and client check, backlog, workbook, brief), app approvals, Project kit download; owner pilot on Vercel (demo data) |
| 2.0.0 | MCP connector for private Claude Projects (OAuth via the interim login), roles and audit log — on Vercel with demo data |
| 2.x | Migration to dentsu systems (hosting, SSO, Claude Enterprise) after the security review; first real client data |
| 2.1 | Interactive connector (question cards and live offer inside Claude), reviewer workflow |

Repository: a new `frontend/` (web app) and `discovery/service/` (API and MCP server), both on the
`contracts/engagement.schema.json` contract; ADR 0014 records the decisions below.

## 8. Owner decisions (2026-09-17)

| # | Decision | Outcome |
|---|---|---|
| D1 | Data location | **C — staged:** build on interim personal hosting with demo data; move to dentsu systems for real client data |
| D2 | Hosting platform | **Interim: Vercel Pro (personal account), functions in `fra1`, Postgres in the EU.** Target: dentsu IT — requirements in [`lc-frontend-hosting-requirements.md`](lc-frontend-hosting-requirements.md) |
| D3 | Web app stack | **React with React Router** (the framework Shopify Hydrogen builds on) and a Node service reusing `discovery/agents` |
| D4 | Identity | **Interim: GitHub login with an allowlist.** Target: dentsu SSO (pending dentsu IT) |
| D5 | Pilot | **Owner first, with demo clients** (ACME, ReboLabs) until the hosted service is approved |
