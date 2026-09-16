# ADR 0007 — LLM data handling: consent, redaction, model choice

- **Status:** Proposed
- **Date:** 2026-09-16
- **Relates to:** CLAUDE.md security gate 3, `docs/conventions/security-gates.md` Gate 2

## Context

The Frame Agent sent the complete questionnaire — including stakeholder names — to the LLM with
no consent step or redaction, printed raw model output on failure, and hard-coded a model with
no truncation check.

## Decision

1. **Consent:** the discovery engine refuses to call the LLM unless
   `meta.consent.llm_processing` is true (question Q10.5.2, answered by the consultant).
2. **No customer personal data:** questionnaires hold business answers only. Before any LLM
   call the engine redacts email addresses, phone numbers and stakeholder names
   (`stakeholders[].name`), and fails closed if redaction finds customer records.
3. **Structured output:** the LLM extracts answers into the schema; deterministic code computes
   the offer, gates and exits (ADR 0001, 0003). Model output is schema-validated; on failure the
   engine logs validation errors, never the raw response.
4. **Model:** configured in one place (default: current Claude Sonnet-class model for extraction),
   overridable by environment variable; `stop_reason` is checked so truncated output is rejected.
5. **Keys:** `ANTHROPIC_API_KEY` from the environment only (`.env`, gitignored).
6. **Retention:** client files live under `clients/` (gitignored). Engagement data is not written
   to logs, caches or telemetry.

## Consequences

- Phase 2 has a threat model and tests for consent refusal, redaction and truncated responses.
- The chatbot (Phase 5) records consent at session start using the same field.
