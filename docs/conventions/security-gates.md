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
  `NODE_ENV=production`. Use it instead of `console.log`/`console.error` for any
  log statement that might carry engagement data.
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
