# Markets Playbook (L-4)

## The Decision: Shopify Markets vs Expansion Stores

This is the most common architecture question on Medium and Large tier projects. The decision is binary and must be locked in the store-spec.yaml before any commerce configuration begins — changing it mid-build requires a full rebuild.

---

## Decision Tree

```
Does the client need a single brand experience
across all target countries?
│
├─ YES ───────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  Do ALL markets share the same:                                              │
│    - Product catalogue (same SKUs, same product pages)?                     │
│    - Brand identity and checkout experience?                                 │
│    - Shopify admin (one team manages everything)?                            │
│                                                                              │
│  ├─ YES → Use SHOPIFY MARKETS ✅                                              │
│  │        Single store, multiple currencies/languages/price adjustments     │
│  │        This is the LWC default for Starter, Medium, and most Large.      │
│  │                                                                           │
│  └─ NO  → Check why they differ:                                             │
│                                                                              │
│     Separate legal entity per country? → EXPANSION STORES                   │
│     Radically different catalogue per country? → EXPANSION STORES           │
│     Different checkout experience per country? → EXPANSION STORES           │
│     Just different pricing? → SHOPIFY MARKETS (use price lists)             │
│     Just different language? → SHOPIFY MARKETS (use language settings)      │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
│
└─ NO → EXPANSION STORES (or separate brand strategy — out of LWC scope)
```

---

## Shopify Markets — When to Use

**Use Shopify Markets when:**
- Same brand, same catalogue across markets
- Different currencies, languages, and prices — but same products
- One Shopify admin, one theme, one code base
- Up to 5 markets (LWC Large limit; Shopify supports more but exit LWC scope)

**What Shopify Markets handles automatically:**
- Currency conversion and display (CHF, EUR, GBP, etc.)
- Price rounding rules per currency
- Language-specific URL subfolders (`/de/`, `/fr/`)
- `hreflang` tags (SEO)
- Market-specific product availability
- Market-specific discounts and price lists (Shopify Plus)
- Domain routing (subfolders, subdomains, or custom domains per market)

**Shopify Markets limitations to know:**
- No separate checkout per market (all markets share the store's checkout)
- No market-specific payment providers (all markets use the same payment methods)
- Duties/taxes must use Shopify's built-in system or Adyen's integration
- Product content translation requires Shopify Translate & Adapt app (free) or Weglot

---

## Expansion Stores — When to Use

**Use expansion stores when:**
- Client has separate legal entities per country (e.g., Swiss SA + German GmbH)
- Fundamentally different catalogues per market (e.g., CH sells watches, DE sells jewellery only)
- Separate P&L tracking per country requiring isolated Shopify reporting
- Different brand (sub-brand per country)

**Expansion store trade-offs:**
- Each store = separate Shopify subscription (additional monthly cost)
- Separate theme deployment per store (doubles maintenance)
- No shared cart or unified customer account across stores
- Each store must be built and maintained independently
- **Outside standard LWC scope — add 30–50% effort and quote accordingly**

---

## LWC Market Configurations by Tier

### Starter — Single Swiss market
```yaml
markets:
  count: 1
  strategy: shopify_markets
  market_list:
    - code: CH
      currency: CHF
      languages: [de, fr, it]
      price_adjustment_pct: 0
```

Setup steps:
1. Admin → Settings → Markets → Switzerland (default primary market)
2. Add languages: de, fr, it
3. Set currency: CHF
4. URL: subfolders `/de/`, `/fr/`, `/it/` (Shopify handles automatically)

---

### Medium — CH + 1–2 additional markets (e.g. DE + AT)
```yaml
markets:
  count: 3
  strategy: shopify_markets
  market_list:
    - code: CH
      currency: CHF
      languages: [de, fr, it]
      price_adjustment_pct: 0
    - code: DE
      currency: EUR
      languages: [de]
      price_adjustment_pct: -10   # Example: 10% lower for DE market
    - code: AT
      currency: EUR
      languages: [de]
      price_adjustment_pct: -10
```

Setup steps:
1. Admin → Settings → Markets → Add market: Germany
2. Add market: Austria
3. Configure EUR pricing for DE and AT
4. Set price adjustments if needed (price lists — Shopify Plus feature)
5. Enable Shopify Payments for EUR (or Adyen for multi-currency acquiring)
6. Verify hreflang tags are generated correctly (check via Google Search Console post-launch)

Note on EUR pricing without Shopify Plus:
- Without Plus, Shopify auto-converts CHF prices to EUR using current exchange rate
- With Plus: set fixed EUR prices per market using price lists (recommended for Medium+)

---

### Large — Up to 5 markets
```yaml
markets:
  count: 5
  strategy: shopify_markets
  market_list:
    - code: CH
      currency: CHF
      languages: [de, fr, it]
    - code: DE
      currency: EUR
      languages: [de]
    - code: AT
      currency: EUR
      languages: [de]
    - code: FR
      currency: EUR
      languages: [fr]
    - code: GB
      currency: GBP
      languages: [en]
```

Additional considerations for Large:
- Shopify Plus required for 5-market price lists
- Consider a separate market for "International" (catch-all for unlisted countries)
- Review VAT registration requirements per country (DE, AT, FR may require EU VAT/OSS registration)
- Duties/import taxes: enable Shopify's Duties feature for CH ↔ EU border crossings

---

## Market Configuration Checklist

### For each market:
- [ ] Market created in Shopify Admin → Settings → Markets
- [ ] Currency set correctly
- [ ] Languages added to market
- [ ] URL structure confirmed (subfolders recommended)
- [ ] Tax settings: tax-inclusive for CH; check per country for EU
- [ ] Shipping zones mapped to market
- [ ] Payment methods available in market currency (test!)
- [ ] Product availability checked (all products available in all markets?)
- [ ] Price lists configured (Shopify Plus) or auto-conversion reviewed
- [ ] hreflang tags verified (use Google's Rich Results Test or a crawler)
- [ ] Test purchase placed from each market (use a VPN to simulate country)

### Go-live market checklist:
- [ ] Primary market (CH) fully tested end-to-end
- [ ] Secondary markets tested with at least one test order each
- [ ] Currency switcher component (if using) tested on mobile and desktop
- [ ] Language switcher component tested: routes to correct subfolder
- [ ] SEO: check that `/de/`, `/fr/`, `/it/` pages are all indexed (not blocked by robots.txt)
- [ ] Analytics: GA4 / GTM firing correctly across all market subfolders
