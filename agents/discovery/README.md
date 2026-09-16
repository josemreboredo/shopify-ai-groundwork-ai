# Discovery engine

Turns a completed discovery questionnaire into `clients/<slug>/engagement.json` — the single
source of truth for the deck, backlog and build (ADR 0002).

```bash
npm run discover -- --questionnaire path/to/<client>-questionnaire.md
npm run discover -- --questionnaire q.md --client acme-watches --dry-run   # print result, write nothing
```

Needs `ANTHROPIC_API_KEY` in the environment (`.env`, gitignored) or an `ant auth login` profile.
Model: `claude-opus-5` by default; override with `DISCOVERY_MODEL`.

## Pipeline

| Step | Module | LLM? |
|---|---|---|
| 1. Consent check — Q10.5.2 must be ticked "Yes" | `input.js` | no |
| 2. Redaction — e-mails, international phone numbers, stakeholder names; refuses card numbers and customer e-mail lists | `input.js` | no |
| 3. Extraction — answers, provenance, open items, exit-rule candidates | `extract.js` | yes (structured output) |
| 4. Offer — scope gates, L triggers, S/M/L, modifiers, price band | `classify.js` | no |
| 5. Exit rules 11.1–11.16, merged with LLM candidates | `exits.js` | no |
| 6. Approach — capability map, app shortlist, assumptions, phases (GO only) | `approach.js` | yes (structured output) |
| 7. Validation against `schema/engagement.schema.json` | `engine.js` | no |
| 8. Output — `engagement.json` + Markdown renderings, or `stop-report.md` | `render.js`, `cli.js` | no |

The model extracts and drafts; code decides the offer and exit rules. Structured outputs cannot
enforce patterns, numeric limits or map-shaped objects, so `extraction-schema.js` sends a simplified
schema and the full schema is enforced locally before anything is written.

## Outputs

| Status | Files in `clients/<slug>/` |
|---|---|
| GO | `engagement.json`, `delivery-plan.md`, `capability-map.md`, `app-shortlist.md`, `risks.md` |
| STOP | `engagement.json`, `stop-report.md` |

Re-running replaces the Markdown files. Internal pricing and modifiers never appear in them.

## Tests

`tests/unit/discovery-rules.test.js` (gates, offer, exit rules against the golden fixtures) and
`tests/unit/discovery-engine.test.js` (full pipeline with recorded LLM responses — no network).
Threat model: [`docs/architecture/discovery-engine-threat-model.md`](../../docs/architecture/discovery-engine-threat-model.md).
