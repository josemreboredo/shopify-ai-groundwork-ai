---
title: Shopify Payments, multi-currency selling and payouts
verified: 2026-09-17
topics: payments
summary: How Shopify Payments handles selling in multiple currencies, payouts in multiple currencies, conversion fees, local payment methods and fraud cover.
---

# Shopify Payments, multi-currency selling and payouts

Three things are routinely confused: the currency a customer is charged in, the currency the
merchant is paid in, and the fees for moving between them. They are separate settings with
separate plan requirements.

## 1. Selling in multiple currencies

Selling in a customer's local currency means the customer is *charged* in that currency, not
merely shown a converted figure.

- To process payments in multiple currencies, the store must use **Shopify Payments or Adyen**
  as its payment processor [1]. Compatible payment options are Shopify Payments credit card
  payments, Shop Pay, Apple Pay and Google Pay, and PayPal Express [2].
- With **any other payment provider**, local currency affects display only: "the local currency
  feature will only affect how prices are displayed to customers in your store. At checkout, the
  price will be converted to your store's default currency, and your customer will be charged in
  that currency" [2]. Customers may then incur conversion fees from their own bank or card
  issuer, and third-party providers apply their own conversion fee structures [1].
- **Shopify Markets** is where this is configured: currencies are set per market, and the
  currency a buyer sees is determined by the market their order is associated with [1][16].
- Shopify documents no additional plan requirement for selling in local currencies beyond using
  a supported processor [1]. Plan requirements do apply to payouts (section 2).

**Consultant note.** A client on a local acquirer or regional gateway can display local prices but
cannot charge in local currency. If charging in local currency is a requirement, the payment
processor decision is made for you.

## 2. Payouts in multiple currencies

Being paid in a currency is a separate feature, called Multi-Currency Payouts.

- **Plan requirement:** "Your store must be on the Advanced or Shopify Plus plan" [3]. Stores on
  Basic, Grow and Shopify can still sell in multiple currencies; their payouts are settled into
  their domestic currency [3].
- The merchant must have a business entity and a bank account in a region eligible for
  Multi-Currency Payouts, and only the store owner can activate it [3].
- **One bank account per currency:** "you can add one bank account for each supported payout
  currency available for your region and Shopify plan" [3].
- **Domestic currency** is set by the store's location in General settings and determines which
  payout currencies are available [4]. Some locations have two — Switzerland (CHF or EUR),
  Denmark (DKK or EUR), Sweden (SEK or EUR), Poland (PLN or EUR). United States stores always
  have USD as the default and may add AUD, CAD, EUR and GBP [4].
- **Multi-Currency Payout fee** applies to payouts received in a currency that is not the
  merchant's domestic currency; domestic-currency payouts carry no such fee [3]:

| Region | Advanced plan | Shopify Plus plan |
|---|---|---|
| Global (other regions) | 1.5% | 1% |
| Canada | 1.5% | 1.25% |
| United States | 1% | 0.75% |

The fee follows the payout currency, not whether a conversion happened [3].

## 3. Currency conversion and rounding

- A **currency conversion fee** applies when a transaction is captured in a currency other than
  the store's domestic currency. The rate "is based on your store's primary country": 1.5% for the
  United States, 2% for France and all other regions [5]. PayPal Wallet transactions carry a 3%
  conversion fee in the United States and France [5].
- **A matching bank account removes the conversion.** Where the merchant holds a payout account
  in the order's currency, funds are not converted and no foreign exchange fee arises; where they
  do not, funds are converted into the default account's currency and "a currency conversion fee
  applies to this conversion" [3]. The Multi-Currency Payout fee still applies to the
  non-domestic payout.
- **Automatic rates:** the price shown to the customer already includes the conversion cost —
  "Your converted prices include your currency conversion costs" [6].
- **Manual rates** are available through Managed Markets and fix a rate per market; the manual
  rate applies only to products in that market with no international price already set [6].
- **Rounding:** "When rounding rules are activated, prices are automatically rounded to the most
  common denominator for each currency. You can't customize your rounding rules to anything
  different from these defaults." Rounding does not apply to gift cards [7].
- From 6 April 2026, conversion fees and Multi-Currency Payout fees on Shopify Payments orders
  are calculated on the gross order amount, so the effective rate matches the stated rate [17].

## 4. Where Shopify Payments is available

Shopify Payments is available only in supported countries and regions. Use the index rather than a
copied list: each country has its own page covering "bank account and business verification
requirements, accepted payment methods, and payout details" [8]. Confirm the client's entity
country there before assuming Shopify Payments is an option.

## 5. Local payment methods

Shopify Payments offers cards, accelerated checkouts (Apple Pay, Google Pay, Shop Pay) and local
methods that appear based on the **customer's** location. The per-country page is the source of
truth. Documented examples:

| Store country | Cards | Local methods documented |
|---|---|---|
| Switzerland | American Express, Maestro, Mastercard, UnionPay, Visa [9] | TWINT (Swiss customers), Klarna, Bancontact, iDEAL \| Wero, MB WAY, Przelewy24, Satispay [9] |
| Germany | American Express, Maestro, Mastercard, UnionPay, Visa [10] | Klarna, Bancontact, BLIK, EPS, iDEAL \| Wero, MB WAY, MobilePay, Przelewy24, Satispay, TWINT [10] |
| Austria | Visa, Mastercard, Maestro, American Express, UnionPay [11] | EPS (Austrian customers), Klarna, Bancontact, BLIK, iDEAL \| Wero, MB WAY, MobilePay, Przelewy24, Satispay, TWINT [11] |

## 6. Third-party gateways, transaction fees and PayPal

- "Third-party transaction fees apply on all third-party and alternate payment gateways" [12].
  Rates are published on Shopify's pricing page, not in the help centre.
- On Shopify Plus, these fees may be waived when Shopify Payments is activated, depending on
  location [12].
- **PayPal and manual payments are excluded from third-party transaction fees** when Shopify
  Payments is activated [12], so running PayPal alongside it attracts no third-party fee.

## 7. Fraud, chargebacks and PCI

- **Fraud analysis** is available to stores using Shopify Payments, and to stores on Grow,
  Advanced or Shopify Plus using most third-party payment processors [13].
- **Shopify Protect** is narrowly scoped. The merchant "must be located in the United States and
  have a United States Shopify Payments account", it is "only available for orders processed
  through Shop Pay", it covers only orders containing exclusively physical items requiring
  shipping, and orders must be fulfilled with valid tracking within 7 days and in transit within
  10 days [14]. Treat it as a US-only benefit in European scoping.
- **PCI:** "Shopify is certified Level 1 PCI DSS compliant", and that compliance extends by
  default to stores on the platform, covering the store, its shopping cart and web hosting [15].
  It does not remove a merchant's own PCI obligations where they store, process or transmit
  cardholder data outside Shopify.

## 8. B2B

"To sell in multiple currencies using B2B, you must use Shopify Payments" [16]. For B2B orders the
currency is the market currency — either the market the buyer matches, or the backup region
currency where no market matches [16]. The currency set on a catalog does not change what the
buyer sees in the online store, cart, checkout or draft orders [16].

## Sources

1. Setting up currencies for markets — https://help.shopify.com/en/manual/markets/customizations/local-currencies — "your store must use Shopify Payments or Adyen as its payment processor" — checked 2026-09-17
2. Payments (international) — https://help.shopify.com/en/manual/international/payments — "the local currency feature will only affect how prices are displayed to customers in your store. At checkout, the price will be converted to your store's default currency" — checked 2026-09-17
3. Managing Multi-Currency Payouts with Shopify Payments — https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/payouts-in-multiple-currencies — "Your store must be on the Advanced or Shopify Plus plan." — checked 2026-09-17
4. Supported payout currencies — https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/supported-payout-currencies — "The payout currencies that you can choose depend on the location that you've entered in the General settings in your Shopify admin." — checked 2026-09-17
5. Fees and costs (multi-currency) — https://help.shopify.com/en/manual/payments/shopify-payments/multi-currency/conversion-fees — "The conversion fee amount is based on your store's primary country. If you accept transactions in a non-domestic currency, then a currency conversion fee is applied." — checked 2026-09-17
6. Currency conversions and exchange rates — https://help.shopify.com/en/manual/international/pricing/exchange-rates — "Your converted prices include your currency conversion costs." — checked 2026-09-17
7. Rounding prices — https://help.shopify.com/en/manual/international/pricing/rounding — "When rounding rules are activated, prices are automatically rounded to the most common denominator for each currency." — checked 2026-09-17
8. Supported countries for Shopify Payments — https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries — "information about bank account and business verification requirements, accepted payment methods, and payout details" — checked 2026-09-17
9. Payment methods with Shopify Payments in Switzerland — https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/switzerland/payment-methods — "American Express, Maestro, Mastercard, UnionPay, Visa" — checked 2026-09-17
10. Payment methods with Shopify Payments in Germany — https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/germany/payment-methods — "Electronic Payment Standard (EPS)" — checked 2026-09-17
11. Payment methods with Shopify Payments in Austria — https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/austria/payment-methods — "Visa, Mastercard, Maestro, American Express, UnionPay" — checked 2026-09-17
12. Third-party payment providers — https://help.shopify.com/en/manual/payments/third-party-providers — "Third-party transaction fees apply on all third-party and alternate payment gateways" — checked 2026-09-17
13. Preventing fraud — https://help.shopify.com/en/manual/payments/fraud-prevention/preventing-fraud — "Stores that use Shopify Payments. Stores that use most third-party payment processors and are on the Grow, Advanced, or Shopify Plus plan." — checked 2026-09-17
14. Protecting an order with Shopify Protect — https://help.shopify.com/en/manual/payments/shop-pay/shopify-protect/protect-order-with-shopify-protect — "To protect your orders with Shopify Protect, you must be located in the United States and have a United States Shopify Payments account." — checked 2026-09-17
15. PCI compliant hosting provider — https://www.shopify.com/security/pci-compliant — "Shopify is certified Level 1 PCI DSS compliant." — checked 2026-09-17
16. Selling internationally in B2B with Markets — https://help.shopify.com/en/manual/b2b/markets/international — "To sell in multiple currencies using B2B, you must use Shopify Payments." — checked 2026-09-17
17. Currency conversion fee calculation for Shopify Payments orders — https://help.shopify.com/en/manual/payments/shopify-payments/store-currency/currency-conversion-calculation — "currency conversion fees and Multi-Currency Payout fees on Shopify Payments orders are calculated directly on the gross order amount" — checked 2026-09-17
