# Discovery interview

Consultant-run discovery interview in Claude Code (ADR 0008). In Claude Code: `/interview`.
Architecture: [`discovery/docs/architecture/interview-chatbot.md`](../../docs/architecture/interview-chatbot.md) ·
validation plan: [`discovery/docs/validation/interview-chatbot-validation.md`](../../docs/validation/interview-chatbot-validation.md).

| Module | Does |
|---|---|
| `session.js` | Resumable session in `clients/.work/<slug>/interview.json` |
| `next.js` | Next questions: consent first, route decision while a STOP is open, mode (quick / standard / full) plus every question that feeds the offer or an exit rule, app-signal questions when an earlier answer makes them relevant (`ask_if`), skip logic |
| `answer.js` | Validates each answer against the engagement schema, refuses personal data, records provenance; TBC, skip, comment (answers a question in words when no value fits — kept as an open item), notes |
| `preview.js` | Offer, scope gates (active / inactive / unknown), L triggers, exit rules, route, Shopify plan suggestion, app signals, coverage |
| `finish.js` | Writes `extraction.json` and `state.json` (with consultant notes) for the discovery pipeline and runs `assemble` |
| `cli.js` | JSON CLI used by the skill: `npm run interview -- <start\|next\|answer\|tbc\|skip\|comment\|note\|preview\|finish> --client <slug>` |

The model only converses, translates (answers stored in English) and maps answers to fields. Tests
(`discovery/tests/unit/interview.test.js`) include parity: the same answers through the interview and through the
questionnaire give the same offer, exit rules and GO/STOP.
