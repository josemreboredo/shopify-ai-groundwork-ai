#!/bin/bash
# Step 2 — Create 4 Markets: Switzerland, France, US (already exists), Denmark
# Note: This store is on "Basic App Development" plan — payment gateway does not
# support setting per-market baseCurrency. We omit currencySettings and control
# currency at the PriceList level instead (which is the correct B2B/multi-market
# pattern anyway). The US market already exists as primary — we skip re-creating it.
set -euo pipefail
source "$(dirname "$0")/../.env"

API="https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json"
TOKEN="${SHOPIFY_ACCESS_TOKEN}"

gql() {
  curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "X-Shopify-Access-Token: $TOKEN" \
    -d "$1"
}

echo ""
echo "=============================="
echo " Step 2: Creating Markets"
echo " (US already exists as primary)"
echo "=============================="

echo ""
echo "--- Switzerland (country: CH) ---"
gql '{"query":"mutation { marketCreate(input: { name: \"Switzerland\", conditions: { regionsCondition: { regions: [{ countryCode: CH }] } } }) { market { id name enabled } userErrors { field message } } }"}' | python3 -m json.tool

echo ""
echo "--- France (country: FR) ---"
gql '{"query":"mutation { marketCreate(input: { name: \"France\", conditions: { regionsCondition: { regions: [{ countryCode: FR }] } } }) { market { id name enabled } userErrors { field message } } }"}' | python3 -m json.tool

echo ""
echo "--- Denmark (country: DK) ---"
gql '{"query":"mutation { marketCreate(input: { name: \"Denmark\", conditions: { regionsCondition: { regions: [{ countryCode: DK }] } } }) { market { id name enabled } userErrors { field message } } }"}' | python3 -m json.tool

echo ""
echo "--- Fetching existing US market ID ---"
gql '{"query":"{ markets(first: 10) { edges { node { id name enabled primary } } } }"}' | python3 -m json.tool

echo ""
echo "=============================="
echo " Markets done. Save all 4 IDs."
echo "=============================="
