#!/bin/bash
# Step 5 — Create 4 Catalogs, one per market, linked to correct pricelist
#
# Note: CHF and EUR pricelists require Shopify Payments with multi-currency
#       enabled on a live store. On a dev store only USD works natively.
#       CHF/EUR catalogs are created WITHOUT a pricelist — add one later
#       once multi-currency is enabled on the live store.
set -euo pipefail
source "$(dirname "$0")/../.env"

API="https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json"
TOKEN="${SHOPIFY_ACCESS_TOKEN}"

MARKET_CH="gid://shopify/Market/62233968795"
MARKET_FR="gid://shopify/Market/62234001563"
MARKET_US="gid://shopify/Market/62215225499"
MARKET_DK="gid://shopify/Market/62234034331"

# USD pricelist (the only one that succeeded in dev store)
PRICELIST_USD="gid://shopify/PriceList/29234692251"

# CHF and EUR pricelists — set when available on live store:
# PRICELIST_CHF="gid://shopify/PriceList/REPLACE_CHF"
# PRICELIST_EUR="gid://shopify/PriceList/REPLACE_EUR"

gql() {
  curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "X-Shopify-Access-Token: $TOKEN" \
    -d "$1"
}

echo ""
echo "=============================="
echo " Step 5: Creating Catalogs"
echo "=============================="

echo ""
echo "--- Catalog: Switzerland (no pricelist — CHF requires live store) ---"
gql "{\"query\":\"mutation { catalogCreate(input: { title: \\\"Switzerland Catalog\\\", status: ACTIVE, context: { marketIds: [\\\"${MARKET_CH}\\\"] } }) { catalog { id title } userErrors { field message } } }\"}" | python3 -m json.tool

echo ""
echo "--- Catalog: France (no pricelist — EUR requires live store) ---"
gql "{\"query\":\"mutation { catalogCreate(input: { title: \\\"France Catalog\\\", status: ACTIVE, context: { marketIds: [\\\"${MARKET_FR}\\\"] } }) { catalog { id title } userErrors { field message } } }\"}" | python3 -m json.tool

echo ""
echo "--- Catalog: United States (USD pricelist) ---"
gql "{\"query\":\"mutation { catalogCreate(input: { title: \\\"United States Catalog\\\", status: ACTIVE, context: { marketIds: [\\\"${MARKET_US}\\\"] }, priceListId: \\\"${PRICELIST_USD}\\\" }) { catalog { id title } userErrors { field message } } }\"}" | python3 -m json.tool

echo ""
echo "--- Catalog: Denmark (no pricelist — EUR requires live store) ---"
gql "{\"query\":\"mutation { catalogCreate(input: { title: \\\"Denmark Catalog\\\", status: ACTIVE, context: { marketIds: [\\\"${MARKET_DK}\\\"] } }) { catalog { id title } userErrors { field message } } }\"}" | python3 -m json.tool

echo ""
echo "=============================="
echo " Catalogs done. Save IDs above."
echo " ⚠️  CH/FR/DK need pricelist"
echo " updates on live store."
echo "=============================="
