# shopify-ai-builder — CLAUDE.md

This project inherits Gaia (the master methodology) via the `gaia` skill auto-loaded
from `~/.claude/skills/gaia`. Anything in Gaia is the **default behavior** —
14 roles, 3 tracks (A/B/C), 4-gate security regime, Definition of Enough,
token economy, documentation spec.

This file is for **project-specific context only** — never to override Gaia.
If a project's needs conflict with Gaia, file a proposal in
`<working-skills>/references/shopify-ai-builder/_intake/` per
`gaia/methodology/reverse-propagation.md`.

---

## What shopify-ai-builder is

A Gaia-governed delivery workspace for **Shopify projects** — covering themes, custom
apps, Hydrogen/Remix storefronts, and AI-assisted builder features. This is the primary
workspace for all Shopify client engagements.

## Project context

- **Stack:** Shopify ecosystem (Liquid, Node.js, Remix, Hydrogen, Shopify CLI)
- **Stage:** Active delivery biota
- **Lovelock:** No — this is a client-delivery biota, not a synthetic regime-test
- **Cadence:** Standard sprint cadence per `gaia/methodology/agile-process.md`

## Engagement contract (ADR 0002)

- `schema/engagement.schema.json` — one client engagement (`clients/<slug>/engagement.json`, gitignored)
- `schema/question-bank.json` — every discovery question and the fields it fills
- `schema/offering.json` — S/M/L offers, scope gates, exit rules (internal pricing — never client-facing)
- `docs/discovery/client-questionnaire.md` is **generated** — edit the question bank, then `npm run questionnaire:render`
- Roadmap: `docs/implementation-plan.md` · decisions: `docs/adr/` · `npm test` must pass before commit

## Shopify-specific conventions

All domain conventions live in `docs/conventions/`. Read the relevant file before
starting any sprint:

| File | Covers | Status |
|---|---|---|
| `docs/conventions/shopify-delivery.md` | Requirement → capability mapping, tier guide, CLI rules | ✅ exists |
| `docs/conventions/security-gates.md` | Store tokens, PII, scope control, production guard | ✅ exists |
| `docs/conventions/shopify-theme.md` | Liquid, Dawn/OS2, theme architecture, CLI | planned |
| `docs/conventions/shopify-app.md` | Node/Remix apps, App Bridge, webhooks, Shopify CLI | planned |
| `docs/conventions/shopify-hydrogen.md` | Hydrogen, Remix, Oxygen deployment | planned |
| `docs/conventions/shopify-api.md` | Admin API, Storefront API, versioning, rate limits | planned |

## Installed tooling

| Tool | Version | Purpose |
|---|---|---|
| Shopify AI Toolkit | 1.8.2 | Claude Code plugin — live docs, schema validation, store management |
| Shopify CLI | 4.8.0 | Store management, theme push/pull, app deployment |
| Node.js | 25.x | Runtime requirement for Shopify CLI |

Install the plugin (already done for this workspace):
```terminal
claude plugin install shopify-ai-toolkit@claude-plugins-official
```

## Tiering guidance (Shopify-specific additions)

These supplement (never replace) the Gaia tier definitions:

- **T1:** CSS/Liquid token tweak, copy change in a section schema, single-line fix
- **T2:** New section/block on existing theme, new webhook handler on existing app,
  new Storefront API query in existing Hydrogen route
- **T3:** New Shopify App (first integration), new Hydrogen storefront, adding
  metaobjects/metafields to a data model, AI feature with LLM calls
- **T4:** Migrating payment provider, adding PCI-scoped checkout customisation,
  re-platforming theme foundation, switching Shopify plan tier with API surface changes

## Security gates (Shopify-specific — mandatory)

The Gaia security regime applies fully. Additionally, for all Shopify work:

1. **API keys / access tokens** — never committed, never logged, always in `.env`
   (gitignored) or Shopify CLI environment injection
2. **Webhook HMAC verification** — every inbound webhook MUST verify the
   `X-Shopify-Hmac-Sha256` header before processing payload
3. **PII scope** — customer email, name, address, order data are PII under GDPR/CCPA;
   never log them, never send them to external LLMs without explicit consent gate
4. **Storefront API tokens** — public-facing tokens are scoped read-only; never expose
   Admin API tokens client-side
5. **App proxy / OAuth** — follow Shopify's OAuth 2.0 flow exactly; never store tokens
   in cookies without HttpOnly + Secure flags

See `docs/conventions/security-gates.md` for full detail.

## Roles engaged (Shopify-specific lens)

Gaia's 14 roles apply. These roles have Shopify-specific scope expansions:

- **Security Engineer** — adds Shopify PCI / webhook / OAuth gates (see above)
- **Architect** — reads `docs/conventions/` for the project type before designing
- **Tech Lead** — uses Shopify CLI for all scaffolding; never hand-rolls app structure
- **QE** — tests include Shopify webhook replay, App Bridge UI smoke tests, and
  Storefront API contract tests where applicable

## Project-specific learnings

Accumulate in `docs/learnings.md` as the biota surfaces Shopify-specific dynamics.
File cross-biota learnings as Track C proposals in
`<working-skills>/references/shopify-ai-builder/_intake/`.
