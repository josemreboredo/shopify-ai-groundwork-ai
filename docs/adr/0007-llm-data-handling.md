# ADR 0007 — LLM data handling: consent, redaction, model choice

- **Status:** Accepted (2026-09-16) · Amended 2026-09-16 (execution modes, interim account tier)
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
4. **Model:** configured in one place (`discovery/agents/discovery/llm.js`): default `claude-opus-5`, overridable with
   `DISCOVERY_MODEL`; server-side refusal fallbacks enabled; `stop_reason` is checked so refused or
   truncated output is rejected and nothing is written.
5. **Keys:** `ANTHROPIC_API_KEY` from the environment only (`.env`, gitignored).
6. **Retention:** client files live under `clients/` (gitignored). Engagement data is not written
   to logs, caches or telemetry.

## Execution modes and account tier (amended 2026-09-22)

- **Claude Code mode (default for now):** `/discover` skill + `npm run discover:prepare|assemble|finish`.
  The Claude Code session does extraction and approach drafting; consent, redaction, validation, offer and
  exit rules stay in code. The agent reads only the redacted questionnaire in `clients/.work/<slug>/`.
- **API mode:** `npm run discover` with `ANTHROPIC_API_KEY` — kept for automation and the Phase 5 chatbot.
- **Account tier — policy, not code-enforced:** every execution mode (Claude Code, the Claude Projects /
  MCP connector) must run on a **dentsu Claude Enterprise** seat. This is an organisational access control,
  not something this codebase can verify at runtime — the app has no way to introspect which Anthropic
  account tier the calling Claude session is authenticated with, for either Claude Code or Claude Projects.
  Access to the tool is therefore restricted at the org level: only consultants who hold a dentsu Claude
  Enterprise seat are authorised to use it, on any real engagement. A consultant without one cannot be
  given access to the tool.

Previously (until 2026-09-22) this ADR recorded an interim decision to run Claude Code mode on the owner's
personal Claude Pro account during early development. That interim period has ended: development and any
engagement use now run only under dentsu's Claude Enterprise organisation.

## Consequences

- Phase 2 has a threat model and tests for consent refusal, redaction and truncated responses.
- The chatbot (Phase 5) records consent at session start using the same field.
