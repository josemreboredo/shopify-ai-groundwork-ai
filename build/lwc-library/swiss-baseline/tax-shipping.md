# Swiss Tax & Shipping Runbook (L-3)

## Tax Configuration

### Swiss VAT rates (as of 2024)
| Rate | Category | Shopify tax class |
|---|---|---|
| **8.1%** | Standard (most goods, clothing, electronics, watches, jewellery) | Default / Standard |
| **2.6%** | Reduced (food, non-alcoholic beverages, books, medicine) | Reduced |
| **3.8%** | Special (accommodation services) | Special — rarely needed for commerce |

### Shopify Tax Setup

```
Admin → Settings → Taxes and duties → Switzerland (CH)

1. Enable "Charge taxes on this country"
2. Standard rate: 8.1%
3. Reduced rate: 2.6% (only if selling food/books/medicine)

Key setting: "Include taxes in prices" (tax-inclusive pricing)
→ Swiss B2C norm: prices MUST be displayed inclusive of VAT
→ Enable: "All prices include tax" in Shopify tax settings for CH market
→ B2B exception: if selling to registered VAT businesses, enable tax-exclusive display
   and use a customer tag to toggle (requires Shopify Plus + B2B features)
```

### Tax display rules (Swiss legal requirement)
- All consumer-facing prices must show the VAT-inclusive amount
- A line item showing "incl. 8.1% VAT" must appear on the checkout/order confirmation
- The total VAT amount must be visible on the order confirmation
- Shopify's hosted checkout handles this automatically when tax-inclusive is enabled

### Digital goods (MOSS / OSS)
- Digital products sold to EU customers may require EU VAT registration under OSS
- Out of scope for LWC Swiss-only Starter. Flag for Medium/Large if EU markets included.

---

## Shipping Configuration

### Standard Swiss shipping zones

```
Admin → Settings → Shipping and delivery → [shipping profile] → Add zone

Zone: Switzerland
Countries: Switzerland (CH)
```

#### Recommended rate structure (LWC default)
| Service | Rate | Condition | Carrier |
|---|---|---|---|
| Standard | CHF 6.90 | Orders < CHF 75 | Swiss Post / DHL |
| Free shipping | CHF 0.00 | Orders ≥ CHF 75 | Swiss Post / DHL |
| Express (2 business days) | CHF 14.90 | All orders | Swiss Post Priority |

Note: The free-shipping threshold is configurable per brand. CHF 75 is the Swiss market norm for mid-market; luxury brands often use CHF 150 or offer complimentary shipping always.

### Cross-border zones (Medium tier — if EU markets included)
| Zone | Countries | Rate | Carrier |
|---|---|---|---|
| EU West | DE, AT, FR, IT, NL, BE, LU | CHF 14.90 | DHL / FedEx |
| EU Extended | All other EU | CHF 19.90 | DHL |
| International | Rest of world | CHF 29.90 | DHL |

### Swiss-specific shipping carriers
- **Swiss Post** (Die Post / La Poste / La Posta): main carrier, integrated with many 3PLs
- **DHL Switzerland**: popular for D/A/CH cross-border
- **Planzer / Camion Transport**: B2B palletised freight, not needed for LWC standard
- **Bring (Zalando Logistics)**: fashion-specific, not standard

### Customs & duties (for cross-border into/from CH)
- Switzerland is NOT in the EU customs union
- Goods imported into CH from EU: subject to Swiss customs duty above CHF 300 value
- Use Shopify's **Duties and Import Taxes** feature (Shopify Plus) to collect duties at checkout
- For Medium tier with EU markets: recommend enabling DDP (Delivered Duty Paid) on EU shipments to CH
- Shopify's built-in harmonised code (HS code) + duties engine handles this when enabled

### Returns configuration
```
Admin → Settings → Shipping and delivery → Returns

Recommended for CH:
- Return label: Swiss Post returns portal (branded QR label)
- Return window: 14 days (Swiss OR minimum) — recommend 30 days for brand trust
- Return address: client warehouse address in CH
```

---

## Shopify Markets — Swiss Configuration Checklist

```bash
# Verify via GraphQL (Admin API, dev store only)
# Markets query: check CH market exists with all 3 languages + CHF currency

markets:
  - name: "Switzerland"
    handle: "switzerland"
    primary: true
    enabled: true
    languages: [de, fr, it]
    currency: CHF
    price_rules:
      - type: "percentage"
        adjustment: 0    # No price adjustment for home market
    tax_inclusive: true
    domain: null         # Use subfolders: /de/, /fr/, /it/
```

### URL structure for Swiss multilingual (recommended)
| Option | Example | Notes |
|---|---|---|
| Subfolders (recommended) | `store.com/de/`, `store.com/fr/` | Single domain, best for SEO |
| Subdomains | `de.store.com` | Requires DNS changes per language |
| Separate domains | `store-de.com`, `store-fr.com` | Out of scope for LWC |

Shopify Markets with Shopify's language router auto-handles subfolder routing. No custom code needed.

---

## Pre-launch Tax & Shipping Checklist

- [ ] CH VAT rate set to 8.1% standard
- [ ] "Include taxes in prices" enabled for CH market
- [ ] Tax line item appears on checkout and order confirmation
- [ ] Free shipping threshold configured and tested
- [ ] Shipping rates display correctly in CHF
- [ ] Returns address set (physical CH address)
- [ ] Test order placed end-to-end with CHF payment
- [ ] Order confirmation shows VAT breakdown in all 3 languages
- [ ] Customs settings reviewed if shipping cross-border
