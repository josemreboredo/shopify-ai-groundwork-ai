# Discovery interview

Consultant-run discovery interview in Claude Code (ADR 0008). In Claude Code: `/interview`.
Architecture: [`docs/architecture/interview-chatbot.md`](../../docs/architecture/interview-chatbot.md) ·
validation plan: [`docs/validation/interview-chatbot-validation.md`](../../docs/validation/interview-chatbot-validation.md).

| Module | Does |
|---|---|
| `session.js` | Resumable session in `clients/.work/<slug>/interview.json` |
| `next.js` | Next questions: consent first, mode (quick / standard / full), skip logic, gate-feeding questions first |
| `answer.js` | Validates each answer against the engagement schema, refuses personal data, records provenance; TBC, skip, notes |
| `preview.js` | Offer, scope gates (active / inactive / unknown), L triggers, exit rules, app signals, coverage |
| `finish.js` | Writes `extraction.json` for the discovery pipeline and runs `assemble` |
| `cli.js` | JSON CLI used by the skill: `npm run interview -- <start\|next\|answer\|tbc\|skip\|note\|preview\|finish> --client <slug>` |

The model only converses, translates (answers stored in English) and maps answers to fields. Tests
(`tests/unit/interview.test.js`) include parity: the same answers through the interview and through the
questionnaire give the same offer, exit rules and GO/STOP.
