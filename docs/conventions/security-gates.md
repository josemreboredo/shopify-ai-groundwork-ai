# Security Gates — shopify-ai-builder

> Applied on every client engagement. Non-negotiable.

---

## Gate 1 — Store access

- One dedicated OAuth token per client engagement.
- Token stored in `.env` only — never in code, never committed.
- `.env` is always in `.gitignore`.
- Token is scoped to minimum required permissions (read-only until a write action
  is approved by the consultant).

```bash
# .env (gitignored)
SHOPIFY_STORE_URL=your-client-dev-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=shpat_...   # never committed
```

---

## Gate 2 — PII protection (Gaia Gate 6)

Customer data (emails, names, addresses, order history) is GDPR/CCPA PII.

- Never log PII.
- Never include PII in prompts or agent context.
- Never export PII to external systems without explicit client consent + legal basis.
- If a query would return PII (e.g. customer list), anonymise or summarise in the
  agent's response — never echo raw records.

---

## Gate 3 — Scope control (T2+ plan approval)

- Any action that mutates a store (theme push, metafield create, app config) is a
  T2+ action and requires a written plan approved by the consultant before execution.
- The agent MUST present the plan and wait for `yes` / `approve` before running
  any mutating CLI command.
- The agent MUST NOT interpret ambiguous replies as approval.

---

## Gate 4 — No production without explicit confirmation

- Default target is always the development store theme.
- Production store mutations require the consultant to type:
  `CONFIRM PRODUCTION: [description of change]`
- This string is the explicit override — no shorter phrase unlocks production.

---

## Gate 5 — Dependency vetting

- Never install an npm package or Shopify app that hasn't been explicitly scoped.
- For apps: check App Store reviews, pricing, and data access permissions before
  recommending. Flag apps that request broad data access.

---

## Gate 6 — Web app hardening (frontend / discovery service)

Applied following the 2026-09-22 Dentsu security review of the codebase.

- **Rate limiting**: sensitive endpoints (`/oauth/token`) use `frontend/app/utils/rate-limiter.js`
  (10 requests/minute per client IP) to slow brute-force and token-enumeration attempts.
  Each endpoint must create its own limiter instance — limiters must never share
  buckets across endpoints.
- **Security headers**: `frontend/app/root.jsx` exports `headers()` (via
  `frontend/app/utils/security-headers.js`) setting CSP, `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, and
  HSTS in production. `form-action` includes `https://github.com` — it gates not
  just the form's own target but redirects the submission triggers, and the
  sign-in form's POST to `/auth/github` 302s to GitHub's OAuth authorize page.
- **Safe logging**: `discovery/service/safe-log.js` wraps `console.*` and refuses
  to log (throws) any payload that matches the PII patterns in
  `discovery/agents/discovery/input.js` (`findPersonalData`) when
  `NODE_ENV=production`. Wired in at the MCP connector's tool-call logger
  (`discovery/service/mcp.js`). Use it instead of `console.log`/`console.error`
  for any other log statement that might carry engagement data — it was
  previously written but not called anywhere, so it protected nothing.
- **PII detection also covers a named individual next to a C-suite title**
  ("Jane Doe, the CFO" / "the CFO, Jane Doe") in `findPersonalData` and
  `redactQuestionnaire` (`discovery/agents/discovery/input.js`). This is a
  narrow heuristic, not general name detection — a bare name in prose with no
  adjacent title still gets through; that needs a language model to catch
  reliably, which would defeat the purpose of screening before the LLM call.
- **Client-facing document leak check now runs on the live/MCP path too**:
  `saveClosingDocument` (`discovery/service/index.js`) calls `findLeaks` (built
  for the CLI deck builder, `discovery/agents/discovery-deck/build.js`) so a
  deck drafted live with Claude can't save with Merkle's internal pricing,
  modifiers or commercial warnings in it — previously only the CLI path had
  this check, and only as an optional manual `deck:check` step.
- **Claude account tier is a policy control, not a code one** (ADR 0007,
  amended 2026-09-22): every execution mode must run on a dentsu Claude
  Enterprise seat. The app cannot verify which Anthropic account tier a
  calling Claude Code or Claude Projects session is authenticated with, so
  this is enforced by only giving tool access to consultants who hold a
  dentsu Enterprise seat — not by anything in this codebase.
- **Known architectural limit, not fixed by the above**: when Claude reads a
  document directly from a Claude Project (the `prefill_from_documents`
  flow, ADR 0015), this app never receives the file, so `redactQuestionnaire`
  never runs on it — the document reaches Claude exactly as uploaded. This is
  acceptable only because that Claude session runs on the dentsu Enterprise
  tier above; it would not be if it did not.
- **Dependency audit**: run `npm audit` as part of routine maintenance (monthly,
  or before any release); `npm audit fix` / `--force` for anything with an
  available non-breaking fix. Test PPTX/deck generation after any `pptxgenjs`
  version bump — check whether the vulnerable code path (image dimension
  parsing) is even reachable before forcing a downgrade to "fix" it.

---

## Incident response

If a mutation is made to the wrong theme or store:
1. Run `shopify theme pull` immediately to get current state.
2. Report to consultant with exact diff of what changed.
3. Revert via `shopify theme push` with the last known-good state.
4. Document in `docs/learnings/` what happened and why.
