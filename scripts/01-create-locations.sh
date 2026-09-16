#!/bin/bash
# Step 1 — Create 4 inventory locations: CH, FR, US, DK
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
echo " Step 1: Creating Locations"
echo "=============================="

echo ""
echo "--- Switzerland Warehouse ---"
gql '{"query":"mutation { locationAdd(input: { name: \"Switzerland Warehouse\", address: { address1: \"Bahnhofstrasse 1\", city: \"Zurich\", countryCode: CH, zip: \"8001\" } }) { location { id name } userErrors { field message } } }"}' | python3 -m json.tool

echo ""
echo "--- France Warehouse ---"
gql '{"query":"mutation { locationAdd(input: { name: \"France Warehouse\", address: { address1: \"1 Rue de Rivoli\", city: \"Paris\", countryCode: FR, zip: \"75001\" } }) { location { id name } userErrors { field message } } }"}' | python3 -m json.tool

echo ""
echo "--- US Warehouse ---"
gql '{"query":"mutation { locationAdd(input: { name: \"US Warehouse\", address: { address1: \"123 Main Street\", city: \"New York\", countryCode: US, provinceCode: \"NY\", zip: \"10001\" } }) { location { id name } userErrors { field message } } }"}' | python3 -m json.tool

echo ""
echo "--- Denmark Warehouse ---"
gql '{"query":"mutation { locationAdd(input: { name: \"Denmark Warehouse\", address: { address1: \"Stroget 1\", city: \"Copenhagen\", countryCode: DK, zip: \"1100\" } }) { location { id name } userErrors { field message } } }"}' | python3 -m json.tool

echo ""
echo "=============================="
echo " Locations created. Save the"
echo " IDs above before continuing."
echo "=============================="
