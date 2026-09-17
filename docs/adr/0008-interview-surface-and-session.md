# ADR 0008 — Interview surface and session model

- **Status:** Accepted (2026-09-16 owner decisions)
- **Date:** 2026-09-17
- **Relates to:** ADR 0002 (engagement.json), ADR 0007 (LLM data handling), implementation plan Phase 5

## Context

The plan's decision D6 left the chatbot surface open until consultant validation. Options were a Claude Code
skill run by the consultant, a hosted client self-serve web chat, or both. A hosted chat needs hosting, sign-in,
EU data residency, consent capture and a security review; the discovery pipeline already runs in Claude Code.

## Decision

1. **Surface:** the lead consultant runs the interview in Claude Code with the `/interview` skill. No hosted
   client-facing chat in Phase 5; client self-serve pre-fill is revisited after the pilot.
2. **Language:** the interview follows the language the person uses; answers are stored in English, enum values
   always as schema values, original wording kept in provenance notes where meaning could be lost.
3. **Session:** a resumable session file `clients/.work/<slug>/interview.json`; code selects questions, validates
   answers and computes the preview; the model only converses, translates and maps answers to fields.
4. **Output:** the interview writes the same `extraction.json` as `discover:prepare` expects, so the existing
   pipeline (assemble → approach → finish → backlog → deck) is reused unchanged.
5. **Consent first:** Q10.5.2 is asked before any other answer is recorded.

## Consequences

- One discovery pipeline, two inputs (Markdown questionnaire, interview); a parity test guards equivalence.
- The pilot runs on the interim Claude Pro account; real client use at scale waits for the dentsu Enterprise
  adoption gate.
- A future hosted pre-fill only has to produce the same session file.
