# Threat model — discovery engine

- **Scope:** `agents/discovery/` (Phase 2) · **Tier:** T3 (runtime LLM, client data) · **Date:** 2026-09-16
- **Related:** ADR 0002, ADR 0003, ADR 0007, `docs/conventions/security-gates.md`

## Data flow

```
Consultant laptop                                   Anthropic API
questionnaire.md ──► consent ──► redaction ──► extraction call ──► JSON (schema-constrained)
                                                                     │
                     engagement.json ◄── validate ◄── exits ◄── offer ◄┘
                          │                              ▲
                          └────────► approach call ──────┘ (GO only; no pricing sent)
                          ▼
                 clients/<slug>/ (gitignored)
```

## Assets

| Asset | Sensitivity |
|---|---|
| Client questionnaire answers (business data, stakeholder roles) | Confidential — client |
| Personal data (stakeholder names, e-mails, phone numbers) | Personal data (GDPR / nFADP) |
| Offer rules, modifiers, price adds (`schema/offering.json`) | Confidential — Merkle internal |
| `ANTHROPIC_API_KEY` | Secret |
| `clients/<slug>/` outputs | Confidential — client |

## Threats and mitigations

| # | Threat (STRIDE) | Mitigation | Residual risk |
|---|---|---|---|
| T1 | **Prompt injection in answers** changes the offer or suppresses a STOP (Tampering) | Offer, gates and exit rules are computed in code from structured fields; the model cannot set `offer` or `exits` (not in its output schema). LLM exit candidates can only **add** rules. | The model can still mis-extract a field (e.g. record `checkout.customisation: none`). Consultant reviews `engagement.json` and provenance before the deck. Future: evidence quotes per gate. |
| T2 | **Personal data sent to the LLM** (Information disclosure) | Consent gate (Q10.5.2); redaction of e-mails, international phone numbers, stakeholder names; fail closed on card numbers or > 3 e-mail addresses. | Local-format phone numbers and names written in free text are not redacted — the questionnaire header tells consultants not to record personal data. |
| T3 | **Internal pricing leaks to clients** (Information disclosure) | Approach call receives no price band, modifiers or rationale; renderers never output them; tests assert no leak in rendered artefacts and questionnaire. | `engagement.json` itself contains the price band — it is internal and gitignored; the deck (Phase 3) must render the band only per D1. |
| T4 | **Path traversal via slug** (Tampering) | Slug pattern in schema and CLI; output path must resolve directly under `--out-dir`. | — |
| T5 | **Truncated or refused output written as if complete** (Tampering) | `stop_reason` `max_tokens` / `refusal` / context-exceeded abort the run; JSON parse and full schema validation before any write. | — |
| T6 | **Raw model output or answers in logs** (Information disclosure) | Errors never include raw output; CLI prints offer, exit evidence and counts only. | Exit evidence strings quote answers — acceptable (no personal data after redaction). |
| T7 | **API key exposure** (Information disclosure) | Key read from environment only; `.env*` gitignored. | — |
| T8 | **Runaway cost** (Denial of wallet) | One extraction + at most one approach call per run; no loops or retries beyond SDK defaults; STOP skips the approach call. | Large questionnaires cost more; monitor usage. |
| T9 | **Supply chain** (Tampering) | Vetted dependencies only (`@anthropic-ai/sdk`, `ajv`), lockfile committed, `npm audit` clean at install. | Keep dependencies updated. |

## Verification

Covered by `tests/unit/discovery-engine.test.js`: consent refusal without model calls; redaction and
fail-closed cases; stop-reason handling without echoing output; approach input free of pricing;
rendered artefacts free of pricing; slug path guard.
