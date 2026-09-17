# Architecture — Consultant interview (Phase 5)

- **Tier:** T4 · **Date:** 2026-09-17 · **ADR:** [0008](../adr/0008-interview-surface-and-session.md)
- **Validation plan:** [`docs/validation/interview-chatbot-validation.md`](../validation/interview-chatbot-validation.md)

## Goal

A lead consultant runs discovery as a conversation in Claude Code (`/interview`). The interview asks only the
relevant questions, follows the language being spoken, stores answers in English with provenance, shows the
offer and exit rules as they emerge, and ends in the same `engagement.json` as the questionnaire path.

## Components

```
Claude Code session (/interview skill)          Repository code (deterministic)
────────────────────────────────────           ──────────────────────────────────
converse in the person's language   ──CLI──►   agents/interview/
map answer → field value (English)              session.js   load / save clients/.work/<slug>/interview.json
                                                next.js      next questions: order, skip_if, priority, answered
                                                answer.js    validate value against the schema, record provenance
                                                preview.js   offer, scope gates, exit rules from current answers
                                                finish.js    write extraction.json → discover:assemble
                                                     │
                                                     ▼
                                     existing discovery pipeline (Phase 2)
                              assemble → approach (Claude Code) → finish → backlog / deck
```

The model converses and translates; code decides which question comes next, whether a value is valid, and what
the offer and exit rules are. Nothing about the offer is computed by the model.

## Session file

`clients/.work/<slug>/interview.json` (gitignored):

| Field | Purpose |
|---|---|
| `client` | slug |
| `language` | language the interview is held in (ISO 639-1) |
| `mode` | `quick` (required only), `standard` (required + recommended), `full` (all) |
| `answers` | `{ pointer: value }` in English, schema-valid |
| `provenance` | `{ pointer: { source: client \| consultant, status: confirmed \| tbc, question_id, note } }` |
| `skipped` | question ids answered "not applicable" or deferred |
| `tbc` | question ids the client could not answer yet (become `open_items`) |
| `notes` | consultant context notes (English), not part of the engagement answers |
| `started_at`, `updated_at` | dates |

Resumable: every CLI call reads and writes the file; the skill can stop and continue in another session.

## Question selection (`next.js`)

1. Consent first: Q10.5.2 must be answered "yes" before any other question is recorded.
2. Then the question bank order (§ 0 → § 10), filtered by:
   - already answered, skipped or TBC → not asked again;
   - `skip_if` evaluated against current answers;
   - `mode`: quick = required, standard = required + recommended, full = all.
3. Priority boost: unanswered questions that `feeds` a scope gate or exit rule are asked before other questions
   in the same section, so the preview becomes reliable early.
4. Returns up to N questions (default 3) with id, text, help, answer type, allowed values (from the schema) and
   target fields.

## Answer validation (`answer.js`)

- The skill sends `pointer` + JSON value (+ `question_id`, `source`, `status`, `note`).
- The value is written into a copy of the answers, the engagement envelope is assembled and validated against
  `schema/engagement.schema.json`; errors for that pointer are returned and nothing is saved.
- Values containing e-mail addresses or card-like numbers are rejected (same guards as `input.js`).
- The consultant can overwrite an answer; provenance records the latest source and status.

## Live preview (`preview.js`)

Runs `classifyOffer` and `evaluateExits` on the current answers: offer code and name, active gates, L triggers,
fired exit rules, plus a coverage figure (answered required questions / total required). Unanswered inputs make
a gate or rule "not yet known" rather than "clear".

## Finish (`finish.js`)

- Every unanswered required or recommended question in the chosen mode becomes an `open_items` entry.
- Writes `extraction.json` in the work directory in exactly the format of `discover:prepare`, then the normal
  pipeline continues: `discover:assemble` → approach → `discover:finish`.
- Parity: for the same answers, the interview and the questionnaire produce identical decisions (tested).

## Language

- The skill converses in the person's language and translates questions on the fly from the English bank.
- Stored values are English; enum values are always the schema values. Free-text answers are translated to
  English; the original wording goes into the provenance `note` when meaning could be lost (names of products,
  legal terms).

## Security and data

| Risk | Mitigation |
|---|---|
| Customer personal data typed into the conversation | Skill tells the consultant not to record it; `answer.js` rejects e-mail addresses and card-like numbers; stakeholder names are optional and never required |
| Client data processed on a personal Claude Pro account | Interim decision (ADR 0007); consent question first; adoption gate to dentsu Claude Enterprise before real client use at scale |
| Model records a value the client did not give | Provenance source and status on every answer; `preview` and `finish` show TBC items; consultant confirms before finishing |
| Model computes or edits the offer | Offer and exits only from `preview.js` / `assemble`; the skill never writes `decision.json` or `engagement.json` |
| Path traversal via slug | Same kebab-case slug validation as discovery |
