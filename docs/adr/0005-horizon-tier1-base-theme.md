# ADR 0005 — Horizon is the Delivery Tier 1 base theme

- **Status:** Accepted (2026-09-16)
- **Date:** 2026-09-16

## Context

`docs/strategy.md` names Horizon for Delivery Tier 1, the story registry targets Horizon, the
old story parser defaulted to Dawn, and the LWC tokens were harvested from a Skeleton-based
build (Bucherer). No theme applied the `--lwc-*` tokens.

## Decision

1. Offers S and M are built on Shopify **Horizon** (Online Store 2.0 theme blocks).
2. Brand tokens are applied through Horizon's theme settings (`config/settings_data.json`:
   colour schemes, font pickers, radius) via a token → settings converter (Phase 6b); `--lwc-*`
   CSS custom properties are used only for custom sections.
3. Custom sections harvested from the Skeleton reference are rebuilt as brand-neutral Horizon
   blocks in `lwc-library/components/`.
4. Dawn and Skeleton are not used as a base for new engagements.

## Consequences

- `docs/conventions/shopify-theme.md` (Phase 6c) documents Horizon block architecture, Theme Check in CI and self-hosted fonts.
- Horizon version upgrades need a regression pass over `lwc-library/components/`.
