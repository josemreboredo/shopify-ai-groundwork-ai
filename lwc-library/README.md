# LWC Library

The reusable core of the Merkle DACH Lightweight Commerce (LWC) delivery model.

> **The library is the product.** Each client engagement applies brand tokens and selects components from this library — it does not rebuild from scratch. That is why the economics work.

---

## Structure

```
lwc-library/
├── tokens/                     # Design token layer (brand-swappable)
│   ├── _base.css               # Spacing, layout, motion, shadow — never changes
│   ├── _typography.css         # Font families, scale, semantic type roles
│   ├── _colour.css             # Brand palette + semantic aliases + radius preset
│   └── README.md               # How to apply to a new brand
│
├── store-spec.schema.yaml      # Canonical store spec schema (all fields + exit triggers)
│
├── swiss-baseline/             # L-3: Swiss market baseline (drop-in per project)
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
│  agents/frame-   │  OUTPUT: clients/<slug>/store-spec.yaml
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
│  (planned)       │  Clones lwc-library/tokens/ + selects components
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

## Tier Summary

| Tier | Price (CHF) | Markets | Languages | Components | Integrations |
|---|---|---|---|---|---|
| **Starter** | 45–70k | 1 | ≤ 3 | 8–15 | 0 |
| **Medium** | 70–100k | 2–3 | ≤ 5 | 10–18 | 0–1 |
| **Large** | 100–150k | 4–5 | ≤ 6 | 20–45 | ≤ 3 |

**Lead with Medium.** It is the only tier where the price step exceeds the effort step, and it opens the Grow retainer conversation naturally.

---

## Exit Triggers (hard stops)

These fire in the Frame Agent and block all downstream work until resolved:

| Condition | Exit |
|---|---|
| Markets at launch > 5 | Scale programme |
| Total languages > 6 | Scale programme |
| Variant options > 3 | Architecture review |
| Custom integrations > 3 | Bespoke quote |
| B2B with RFQ workflow | Composable platform |
| Custom checkout | Composable platform |
| Large tier + no Shopify Plus | Upgrade plan first |

---

## How to Start a New Engagement

### 1. Run the Frame Agent
```bash
python agents/frame-agent/frame_agent.py --brief "path/to/brief.txt"
# OR
python agents/frame-agent/frame_agent.py --interactive
```

This creates `clients/<slug>/store-spec.yaml`.

### 2. Review the spec
Open `clients/<slug>/store-spec.yaml` and verify:
- Tier selection matches client expectations and budget
- All exit triggers are `false` (or flagged ones are consciously accepted)
- `delivery.grow_retainer_signed` is `true` before Medium/Large delivery begins

### 3. Run Commerce Agent
```bash
# Configure Shopify Admin (markets, locales, currencies, tax, shipping)
bash scripts/shopify-check.sh          # verify current store state
bash scripts/01-create-locations.sh    # if new store
# Then use swiss-baseline/ runbooks for manual/scripted config steps
```

### 4. Apply brand tokens
Copy `lwc-library/tokens/` into the client's theme directory.
Edit `_colour.css` (brand palette) and `_typography.css` (brand fonts).
See `tokens/README.md` for the 30-minute brand application guide.

### 5. Assemble and push theme
```bash
shopify theme push --store <client>.myshopify.com
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
| L-3 | Swiss commerce baseline | ✅ Done — `swiss-baseline/` |
| L-4 | Markets + multicurrency playbook | ✅ Done — `swiss-baseline/markets-playbook.md` |
| L-5 | ~15 component baseline library | 🔲 Planned — extracting from Bucherer reference |

**Do not sell Large tier until L-5 is complete and proven on a live class-C deal.**

---

## The Load-Bearing Rule

> LWC pricing only holds with a **12-month Grow retainer signed in the same contract**.
> Without it, quote at list price +25% (bespoke).
>
> If `delivery.grow_retainer_signed: false` in the store-spec, the Frame Agent warns.
> Finance, Sales, and Media practice leads must agree the credit model before the first invoice.
