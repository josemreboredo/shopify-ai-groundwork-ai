# Discovery AI tool

Runs a Shopify discovery with the Lead Consultant and produces everything needed to propose and plan the build.

| Step | How | Output in `clients/<slug>/` |
|---|---|---|
| Interview (consultant-run) or questionnaire | `/interview`, `/discover <file>` in Claude Code | `engagement.json` |
| Offer, scope gates, exit rules, Shopify plan, app signals | code (`agents/discovery/`) | inside `engagement.json` |
| Implementation approach | LLM, validated by code | `delivery-plan.md`, `capability-map.md`, `app-shortlist.md`, `risks.md` (or a Larger Engagement brief / STOP report) |
| Discovery Closing Deck | `npm run deck`, `/deck <slug>` | `discovery-deck.xml`, `discovery-deck.md` |
| Jira backlog (GO only) | `npm run backlog -- --client <slug>` | `backlog.csv`, `backlog.json` |
| Store configuration workbook | `npm run workbook -- --client <slug>` | `configuration-workbook.md` |

| Folder | Contents |
|---|---|
| `agents/discovery/` | Engine: extraction, classification, exit rules, plan benchmark, app signals, approach, rendering |
| `agents/interview/` | Consultant interview: session, next questions, answers, preview, finish |
| `agents/discovery-deck/` | Deck data (XML) for the Lead Consultant draft |
| `agents/backlog/` | Jira stories per epic, CSV export |
| `agents/workbook/` | Tax and shipping configuration workbook |
| `schema/` | Question bank, offering (internal pricing), app registry, option labels, loaders |
| `scripts/` | `render-questionnaire.js` (generated questionnaire and consultant guide), `apps.js` (app approvals) |
| `docs/` | Questionnaire (generated), consultant guide (generated), deck template and prompt, mainland China, architecture, validation |
| `tests/` | Unit tests and engagement fixtures |

Engagement shape: [`../contracts/engagement.schema.json`](../contracts/engagement.schema.json). Decisions: [`../docs/adr/`](../docs/adr/README.md).
