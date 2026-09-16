#!/bin/bash
# Step 6 — Verify full multi-market setup
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
echo " Final Verification"
echo "=============================="

echo ""
echo "--- All Markets ---"
gql '{"query":"{ markets(first: 10) { edges { node { id name enabled primary regions(first: 5) { edges { node { ... on MarketRegionCountry { code name } } } } } } } }"}' | python3 -m json.tool

echo ""
echo "--- All Locations ---"
gql '{"query":"{ locations(first: 10) { edges { node { id name address { country } isActive } } } }"}' | python3 -m json.tool

echo ""
echo "--- All PriceLists ---"
gql '{"query":"{ priceLists(first: 10) { edges { node { id name currency } } } }"}' | python3 -m json.tool

echo ""
echo "--- All Catalogs ---"
gql '{"query":"{ catalogs(first: 10) { edges { node { id title status ... on MarketCatalog { markets(first: 5) { edges { node { id name } } } priceList { id name currency } } } } } }"}' | python3 -m json.tool

echo ""
echo "=============================="
echo " Verification complete."
echo "=============================="
