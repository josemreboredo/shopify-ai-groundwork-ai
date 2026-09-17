# Discovery engine

Turns a completed discovery questionnaire into `clients/<slug>/engagement.json` — the single
source of truth for the deck, backlog and build (ADR 0002).

Two ways to run it — same code, same outputs:

### Claude Code mode (default — no API billing)

In Claude Code: `/discover path/to/<client>-questionnaire.md`. The skill runs:

```bash
npm run discover:prepare  -- --questionnaire q.md --client <slug>   # consent + redaction → clients/.work/<slug>/
# Claude Code writes extraction.json from the redacted questionnaire
npm run discover:assemble -- --work clients/.work/<slug>            # validation, offer, exit rules
# Claude Code writes approach.json (GO only)
npm run discover:finish   -- --work clients/.work/<slug>            # full validation → clients/<slug>/
```

> ⚠ Runs on a **personal Claude Pro** account for now. Migrate to **dentsu's Claude Enterprise** before
> dentsu / Merkle adoption or real client data at scale (ADR 0007, adoption gate in the implementation plan).

### API mode

```bash
npm run discover -- --questionnaire path/to/<client>-questionnaire.md
npm run discover -- --questionnaire q.md --client acme-watches --dry-run   # print result, write nothing
```

Needs `ANTHROPIC_API_KEY` in `.env` (gitignored) and API credit. Model: `claude-opus-5` by default; override
with `DISCOVERY_MODEL`. If the key is not scoped to a workspace, also set `ANTHROPIC_WORKSPACE_ID`.

## Pipeline

| Step | Module | LLM? |
|---|---|---|
| 1. Consent check — Q10.5.2 must be ticked "Yes" | `input.js` | no |
| 2. Redaction — e-mails, international phone numbers, stakeholder names; refuses card numbers and customer e-mail lists | `input.js` | no |
| 3. Extraction — answers, provenance, open items, exit-rule candidates | `extract.js` | yes (structured output) |
| 4. Offer — scope gates, L triggers, S/M/L, modifiers, price band | `classify.js` | no |
| 5. Exit rules 11.1–11.21, Shopify plan benchmark, merged with LLM candidates | `exits.js`, `plan.js` | no |
| 6. Approach — capability map, app shortlist, assumptions, phases (GO, or Larger Engagement) | `approach.js` | yes (structured output) |
| 7. Validation against `schema/engagement.schema.json` | `engine.js` | no |
| 8. Output — `engagement.json` + Markdown renderings, or `stop-report.md` | `render.js`, `cli.js` | no |

The model extracts and drafts; code decides the offer and exit rules. Structured outputs cannot
enforce patterns, numeric limits or map-shaped objects, so `extraction-schema.js` sends a simplified
schema and the full schema is enforced locally before anything is written.

## Outputs

| Status | Files in `clients/<slug>/` |
|---|---|
| GO | `engagement.json`, `delivery-plan.md`, `capability-map.md`, `app-shortlist.md`, `risks.md` |
| STOP, route not decided or `no_bid` | `engagement.json`, `stop-report.md` |
| Larger Engagement (STOP → `larger_engagement`) | `engagement.json`, `larger-engagement-brief.md`, `delivery-plan.md`, `capability-map.md`, `app-shortlist.md`, `risks.md` — client deck yes, Jira backlog no |

The route is the consultant's decision after a STOP (`delivery.route`, question Q10.5.5 — ADR 0009); the STOP stays
open. Re-running replaces the Markdown files. Internal pricing and modifiers never appear in them.

## Tests

`tests/unit/discovery-rules.test.js` (gates, offer, exit rules against the golden fixtures) and
`tests/unit/discovery-engine.test.js` (full pipeline with recorded LLM responses — no network).
Threat model: [`docs/architecture/discovery-engine-threat-model.md`](../../docs/architecture/discovery-engine-threat-model.md).
