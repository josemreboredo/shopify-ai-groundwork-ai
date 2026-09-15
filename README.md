# shopify-ai-builder

A **Gaia biota** for Shopify project delivery — themes, apps, Hydrogen storefronts, and
AI-assisted builder tooling.

## What this biota is

`shopify-ai-builder` is the Gaia-governed workspace for all Shopify client work. It
inherits the full Gaia master methodology (14 roles, 3 tracks, 4-gate security regime)
via the `gaia` skill and adds Shopify-specific conventions on top.

## Project types covered

| Type | Stack | Notes |
|---|---|---|
| **Themes** | Liquid + Dawn + Shopify CLI | Customisation of OS2 / custom themes |
| **Apps** | Node.js / Remix + Shopify CLI + App Bridge | Public or custom apps |
| **Hydrogen storefronts** | Remix + Hydrogen + Oxygen | Headless / composable commerce |
| **AI builder features** | Any of the above + LLM integrations | AI-assisted product/store tooling |

## Gaia inheritance

This biota inherits Gaia defaults. Project-specific overrides and learnings live in:
- `CLAUDE.md` — project context loaded by Claude Code automatically
- `docs/conventions/` — Shopify domain conventions per project type
- `docs/adr/` — Architecture Decision Records
- `references/shopify-ai-builder/_intake/` (in the working-skills repo) — Track C proposals

## Bootstrap history

| Date | Event |
|---|---|
| 2025-06 | Biota created — first Shopify biota in the Gaia N=2+ estate |

## What this biota is NOT for

- Non-Shopify e-commerce work (use a separate biota)
- Gaia methodology changes (file Track C proposals instead)
- General sandboxing unrelated to Shopify delivery
