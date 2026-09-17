# Validation — Consultant interview chatbot (Phase 5)

- **Tier:** T4 (new product surface) · **Track:** A, light validation for an internal tool
- **Date:** 2026-09-17 · **Owner:** Jose Reboredo
- **Decisions (2026-09-16):** the lead consultant runs the interview in Claude Code (`/interview` skill pilot);
  the interview follows the language the person uses, answers are stored in English.

Market sizing, pricing and go-to-market are skipped: this is an internal Merkle tool.

## Problem

Lead consultants run discovery from a 210-question Markdown questionnaire. Filling it during or after a client
call is slow, easy to leave incomplete, and the consultant only learns the offer (S/M/L) and the exit rules
after running discovery. The interview should ask only relevant questions, in the client's language, and show
the offer and blockers as the conversation goes.

## Assumptions

| # | Assumption | Risk if wrong | Confidence today | Cost to test |
|---|---|---|---|---|
| A1 | Consultants will run discovery in Claude Code during or right after the client call | High — no adoption | Low | Cheap: pilot |
| A2 | Adaptive questions (skip logic, required first) cut interview time by at least a third vs the Markdown questionnaire | High | Medium | Cheap: timed pilot |
| A3 | A live offer and exit-rule preview changes what consultants ask (they probe gates earlier) | Medium | Low | Cheap: pilot observation |
| A4 | Answers captured in the interview produce the same engagement as the questionnaire path | High — breaks deck and backlog | Medium | Cheap: automated parity test |
| A5 | Interviewing in German, French or Italian and storing English answers loses no meaning that matters for scoping | Medium | Medium | Cheap: pilot with a DE or FR session |
| A6 | Consultants are comfortable typing client answers into Claude on the interim Claude Pro account | High — blocks real clients | Low | Cheap: ask; mitigated by the dentsu Enterprise adoption gate |

## Tests

| Test | Assumptions | Method | Success threshold |
|---|---|---|---|
| T1 Parity | A4 | Automated: ACME answers through the interview produce the same offer, exit rules and GO/STOP as the questionnaire path | 100% identical decisions |
| T2 Pilot interviews | A1, A2, A3, A5 | 2–3 Merkle lead consultants each run one real or role-played discovery (one in German or French) with `/interview`; a colleague plays the client using the ACME example | ≥ 2 of 3 would use it for their next discovery; median time ≤ 2/3 of the questionnaire; all required questions answered or marked TBC |
| T3 Data comfort | A6 | Ask each pilot consultant after the session | No consultant refuses on data grounds for example or anonymised clients; real clients wait for the adoption gate |

## Pilot protocol (T2)

1. 10 min: explain the goal; confirm the example client is fictional (ACME) or anonymised.
2. 45–60 min: the consultant runs `/interview`; the facilitator only observes.
3. Record: start and end time, questions asked vs skipped, number of TBC answers, moments the preview changed
   the conversation, errors or confusing questions.
4. 10 min debrief with the questions below.

**Debrief questions**
- Would you use this for your next discovery? What would stop you?
- Which questions felt irrelevant or were missing?
- Did the offer or blocker preview change what you asked? When?
- Did anything feel wrong about the language handling?
- How do you feel about client answers going to Claude today (example data) and for real clients?

## Decision

After the pilot: **build** (move from pilot to default discovery path), **pivot** (e.g. client pre-fill first)
or **kill** (keep the questionnaire). Findings go to `docs/validation/interview-chatbot-findings.md`.

## MVP

One sentence: *a consultant can run a complete discovery interview in Claude Code and get the same
engagement, offer and exit rules as the questionnaire path, with only the relevant questions asked.*
