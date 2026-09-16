#!/bin/bash
# Step 4 — Create 3 PriceLists: CHF, EUR, USD
# Denmark will reuse the EUR pricelist (created here for France)
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
echo " Step 4: Creating PriceLists"
echo "=============================="

echo ""
echo "--- PriceList: CHF (Switzerland) ---"
gql '{"query":"mutation { priceListCreate(input: { name: \"Switzerland CHF Pricelist\", currency: CHF, parent: { adjustment: { type: PERCENTAGE_DECREASE, value: 0 } } }) { priceList { id name currency } userErrors { field message } } }"}' | python3 -m json.tool

echo ""
echo "--- PriceList: EUR (France + Denmark) ---"
gql '{"query":"mutation { priceListCreate(input: { name: \"Europe EUR Pricelist\", currency: EUR, parent: { adjustment: { type: PERCENTAGE_DECREASE, value: 0 } } }) { priceList { id name currency } userErrors { field message } } }"}' | python3 -m json.tool

echo ""
echo "--- PriceList: USD (United States) ---"
gql '{"query":"mutation { priceListCreate(input: { name: \"United States USD Pricelist\", currency: USD, parent: { adjustment: { type: PERCENTAGE_DECREASE, value: 0 } } }) { priceList { id name currency } userErrors { field message } } }"}' | python3 -m json.tool

echo ""
echo "=============================="
echo " PriceLists created."
echo " Save the pricelist IDs above."
echo " EUR pricelist = used by both"
echo " France AND Denmark."
echo "=============================="
