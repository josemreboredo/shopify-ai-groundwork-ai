# Swiss Payments Runbook (L-3)

## Payment Method Priority for Swiss Commerce

| Method | Swiss usage | LWC tier | Notes |
|---|---|---|---|
| **Credit/Debit card** (Visa/MC/Amex) | Universal | All tiers | Via Shopify Payments or Adyen |
| **TWINT** | ~60% of Swiss online purchases | Starter+ | Must-have for Swiss market |
| **PostFinance** | ~20% (older demographic, B2B) | Medium+ | Worth including |
| **Invoice / Rechnung** | 15-20% (B2C fashion, B2B) | Large / custom | Requires buy-now-pay-later app |
| **PayPal** | ~15% | All tiers | Easy via Shopify Payments |
| **Apple Pay / Google Pay** | Growing fast | All tiers | Auto-enabled with Shopify Payments |
| **Klarna** | Growing | Medium+ | Via Shopify Payments or direct |

---

## Option A: Shopify Payments (Starter / Medium default)

### What it covers
- Visa, Mastercard, Amex
- Apple Pay, Google Pay, Shop Pay
- TWINT (enabled via Shopify Payments Switzerland)
- PayPal (via Shopify Payments wallet)

### Setup steps
```
Admin → Settings → Payments → Shopify Payments → Set up

1. Complete Shopify Payments onboarding (business verification — takes 1-3 business days)
2. Enable Switzerland as a supported country
3. Set payout currency: CHF
4. Enable TWINT:
   - Settings → Payments → Payment providers → TWINT
   - Requires: Swiss business registration (CHE number)
   - Requires: Swiss bank account (IBAN CH...)
5. Enable Apple Pay / Google Pay:
   - Auto-enabled once Shopify Payments is live
   - Test via Shopify's sandbox card numbers
```

### Shopify Payments transaction fees (CH)
| Plan | Online card fee |
|---|---|
| Basic | 2.0% |
| Shopify | 1.7% |
| Advanced | 1.5% |
| Plus | 1.5% (negotiable via account manager) |

Note: 0% additional transaction fee when using Shopify Payments (vs. 0.5–2% with third-party gateways).

---

## Option B: Adyen (Medium / Large with volume)

### When to choose Adyen over Shopify Payments
- Client already has an Adyen merchant account
- Client needs unified payment reporting across channels (POS + online)
- Client is processing > CHF 500k/yr online (Adyen rates become competitive)
- Client needs specific acquiring bank relationships (luxury clients often have these)

### Adyen integration with Shopify
Adyen integrates via the **Shopify Payments + Adyen for Platforms** partnership OR via the **Adyen for Shopify** app:

```
Method 1: Adyen for Shopify (App Store app)
  - Install: Shopify App Store → "Adyen for Shopify"
  - Requires: Adyen live account (not test)
  - Configure: API key + merchant account + webhook URL
  - Supports: Cards, TWINT, PostFinance, Klarna, PayPal, Apple/Google Pay

Method 2: Adyen via Custom Payment Gateway (Shopify Plus only)
  - Admin → Settings → Payments → Alternative payment methods
  - Requires Shopify Plus plan
  - More control over payment flows
```

### Adyen configuration checklist
- [ ] Adyen live merchant account created (not sandbox)
- [ ] API credentials generated (API key, HMAC key for webhooks)
- [ ] Webhook URL configured in Adyen dashboard:
     `https://[store].myshopify.com/admin/webhooks`
- [ ] TWINT payment method enabled in Adyen board
- [ ] PostFinance enabled (if required)
- [ ] 3DS2 (3D Secure) configured (required for SCA compliance in CH/EU)
- [ ] Test payments run on all enabled methods before go-live
- [ ] PCI compliance scope confirmed with client (Shopify hosted checkout = SAQ A)

### Adyen + TWINT specific
TWINT via Adyen requires:
1. Adyen contract includes TWINT acquiring
2. Client has a Swiss entity and Swiss IBAN
3. TWINT app registration (done via Adyen — they handle it)
4. Note: TWINT is only available in CHF; cannot be used for EU market checkouts

---

## PostFinance

### Integration options
1. **Via Adyen** — Adyen supports PostFinance Card and PostFinance e-finance natively
2. **Via Shopify App**: "PostFinance Checkout" by PostFinance AG (available in Shopify App Store)

```
Admin → Settings → Payments → Add payment method
→ Search "PostFinance"
→ Install PostFinance Checkout app
→ Enter PostFinance merchant credentials
```

Note: PostFinance Checkout app charges a monthly fee (~CHF 25/month) plus per-transaction.

---

## TWINT Standalone (without Adyen)

If using Shopify Payments:
- TWINT is included natively for Swiss stores
- No additional app needed
- Verify: Settings → Payments → Shopify Payments → TWINT toggle

If NOT using Shopify Payments:
```
Admin → Settings → Payments → Alternative payment methods → TWINT
→ Use a TWINT-enabled gateway (Datatrans, Payrexx, Concardis, or Adyen)
```

---

## Payment Testing Checklist

### Pre-launch test matrix

| Payment method | Test tool | Pass condition |
|---|---|---|
| Visa / Mastercard | Shopify test mode cards | Order placed, confirmed, appears in admin |
| Apple Pay | Safari + Touch ID/Face ID in test mode | Completes checkout |
| Google Pay | Chrome + test card | Completes checkout |
| TWINT | TWINT test merchant (if Adyen sandbox) | QR code renders, payment completes |
| PostFinance | PostFinance test credentials | Redirect, payment, return to store |
| Klarna | Klarna sandbox | Instalment option shown, order placed |

### Test cards (Shopify Payments / Adyen sandbox)
```
Visa success:    4242 4242 4242 4242 | Exp: any future | CVV: any
Visa 3DS:        4000 0027 6000 3184 | triggers 3DS challenge
Mastercard:      5555 5555 5555 4444
Amex:            3782 8224 6310 005
Decline:         4000 0000 0000 0002
```

---

## Currency Display (CHF)

```liquid
{%- comment -%} Price formatting for CHF in Liquid templates {%- endcomment -%}
{{ product.price | money }}
{# Outputs: CHF 149.00 — Shopify auto-formats based on market currency #}

{%- comment -%} For manual formatting if needed: {%- endcomment -%}
{{ product.price | money_with_currency }}
{# Outputs: CHF 149.00 CHF — avoid this (redundant currency symbol) #}
```

Note: Swiss convention is `CHF 149.00` (currency code before amount, period as decimal separator). Shopify formats correctly when CHF is set as the market currency.

---

## Pre-go-live Payments Checklist

- [ ] Payment provider onboarding complete (Shopify Payments OR Adyen)
- [ ] TWINT enabled and tested (mandatory for CH)
- [ ] All card types tested with test cards
- [ ] Apple Pay / Google Pay tested on mobile device
- [ ] 3DS challenge flow tested (cards that require verification)
- [ ] Order confirmation email received with correct amount + currency
- [ ] VAT shown correctly on checkout and confirmation
- [ ] Refund flow tested (partial + full)
- [ ] Fraud prevention settings reviewed (Shopify Fraud Protect or Adyen RevenueProtect)
- [ ] Payout account confirmed (CHF to Swiss IBAN)
