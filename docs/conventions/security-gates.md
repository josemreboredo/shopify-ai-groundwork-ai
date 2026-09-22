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

## Incident response

If a mutation is made to the wrong theme or store:
1. Run `shopify theme pull` immediately to get current state.
2. Report to consultant with exact diff of what changed.
3. Revert via `shopify theme push` with the last known-good state.
4. Document in `docs/learnings/` what happened and why.
