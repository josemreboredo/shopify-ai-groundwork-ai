# LWC Library

The reusable core of the Merkle DACH Lightweight Commerce (LWC) delivery model.

> **The library is the product.** Each client engagement applies brand tokens and selects components from this library — it does not rebuild from scratch. That is why the economics work.

---

## Structure

```
build/lwc-library/
├── tokens/                     # Design token layer (brand-swappable)
│   ├── _base.css               # Spacing, layout, motion, shadow — never changes
│   ├── _typography.css         # Font families, scale, semantic type roles
│   ├── _colour.css             # Brand palette + semantic aliases + radius preset
│   └── README.md               # How to apply to a new brand
│
│
├── swiss-baseline/             # L-3: market preset for Switzerland (opt-in, ADR 0004)
│   ├── locales/
│   │   ├── de.json             # German (de-CH) locale pack
│   │   ├── fr.json             # French (fr-CH) locale pack
│   │   ├── it.json             # Italian (it-CH) locale pack
│   │   └── README.md           # Shopify locale setup instructions
│   ├── tax-shipping.md         # CH VAT (8.1%), shipping zones, Shopify Markets config
│   ├── payments.md             # TWINT, PostFinance, Adyen, Shopify Payments runbook
│   └── markets-playbook.md     # Markets vs expansion stores decision tree + configs
│
└── README.md                   # This file
```

---

## The Agent Pipeline

```
Client brief (plain language)
         │
         ▼
┌──────────────────┐
│  FRAME AGENT     │  Brief → store-spec.yaml + tier classification + exit check
│  discovery/agents/frame-   │  OUTPUT: clients/<slug>/store-spec.yaml
│  agent/          │  BLOCKS on exit triggers (non-negotiable)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  COMMERCE AGENT  │  store-spec.yaml → Shopify Admin config via GraphQL
│  (scripts/)      │  Markets, locales, currencies, tax, shipping, payments
│                  │  Uses: swiss-baseline/ runbooks as reference
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  THEME AGENT     │  store-spec.yaml → assembled theme
│  (planned)       │  Clones build/lwc-library/tokens/ + selects components
│                  │  Applies brand tokens from store-spec brand section
│                  │  Pushes via Shopify CLI
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  QA AGENT        │  Lighthouse, a11y, locale smoke test, exit condition check
│  (planned)       │  Produces handover report
└──────────────────┘
```

---

## Offers

The commercial model is S / M / L in EUR, defined as data in
[`discovery/schema/offering.json`](../../discovery/schema/offering.json) and explained in
[`docs/strategy.md`](../../docs/strategy.md) (ADR 0001). The earlier Starter / Medium / Large
tiers in CHF are retired.

| Offer | Name | Triggered by | Delivery track |
|---|---|---|---|
| **S** | Ecommerce Foundation | 0–1 scope gates | Liquid (Horizon) |
| **M** | Ecommerce Scale | ≥ 2 scope gates | Liquid (Horizon) |
| **L** | Ecommerce Growth | Luxury / headless / full Figma design system | Hydrogen |

---

## Exit rules

The canonical list is `discovery/schema/offering.json → exit_rules` (ADR 0003), shown in § 11 of the
generated questionnaire. STOP rules block all downstream work until resolved.

---

## How to Start a New Engagement

> Transitional: the shell scripts below are replaced by the Commerce Agent (Phase 6a) and
> Theme Agent (Phase 6b) of [`docs/implementation-plan.md`](../../docs/implementation-plan.md).

### 1. Run discovery
Complete [`discovery/docs/client-questionnaire.md`](../../discovery/docs/client-questionnaire.md)
with the client (see the ACME example), then run the discovery engine:
```bash
npm run discover -- --questionnaire path/to/<client>-questionnaire.md
```

This creates `clients/<slug>/engagement.json` plus the delivery plan, capability map, app shortlist
and risks (or a STOP report). See [`discovery/agents/discovery/README.md`](../../discovery/agents/discovery/README.md).

### 2. Review the spec
- The offer (S/M/L) matches the scope gates and the client's budget
- No STOP exit rule is open; FLAGs have an owner
- The Grow retainer is signed before M/L delivery begins

### 3. Configure Shopify Admin
Use the client's completed store configuration workbook (`npm run workbook -- --client <slug>`) and the market
preset runbooks (e.g. `swiss-baseline/`) for markets, tax, shipping and payments. The Commerce Agent (implementation
plan, Phase 6a) will apply them from `engagement.json`.

### 4. Apply brand tokens
Edit `tokens/_colour.css` (brand palette) and `tokens/_typography.css` (brand fonts);
see `tokens/README.md`. Mapping tokens to Horizon theme settings is Phase 6b (ADR 0005).

### 5. Push the theme
```bash
shopify theme push --store <client-dev-store>.myshopify.com
```

---

## Bucherer Reference

The Bucherer engagement (Shopify Skeleton theme with custom `buch-*` sections) is the **class-A reference** from which this library was harvested. Its themes contain client branding and third-party trademarks, so they live in a private client repo outside this repository — not here. Key mappings:

| Bucherer | LWC Library equivalent |
|---|---|
| `assets/bucherer.css` → `--buch-*` tokens | `tokens/_colour.css` → `--lwc-color-*` aliases |
| `sections/buch-hero-banner.liquid` | `components/hero/` (planned) |
| `sections/buch-featured-products.liquid` | `components/featured-products/` (planned) |
| `sections/buch-category-grid.liquid` | `components/collection-grid/` (planned) |
| `sections/buch-brand-story.liquid` | `components/brand-story/` (planned) |

---

## Library Maturity (L-1 through L-5)

| Level | Description | Status |
|---|---|---|
| L-1 | Token architecture | ✅ Done — `tokens/` |
| L-2 | Brand theming kit | ✅ Done — `tokens/_colour.css` brand guide |
| L-3 | Market preset: Switzerland | ✅ Done — `swiss-baseline/` (first market preset, ADR 0004) |
| L-4 | Markets + multicurrency playbook | ✅ Done — `swiss-baseline/markets-playbook.md` |
| L-5 | ~15 component baseline library | 🔲 Planned — extracting from Bucherer reference |

**Do not sell offer L until its Hydrogen delivery track and component library are proven on a live deal.**

---

## The Load-Bearing Rule

> LWC pricing only holds with a **12-month Grow retainer signed in the same contract**.
> Without it, quote at list price +25% (bespoke).
>
> If the retainer is not signed on an M or L engagement, exit rule 11.11 raises a WARN.
> Finance, Sales, and Media practice leads must agree the credit model before the first invoice.
