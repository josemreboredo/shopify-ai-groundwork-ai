#!/bin/bash
set -euo pipefail
source "$(dirname "$0")/../.env"

curl -s -X POST \
  "https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_ACCESS_TOKEN}" \
  -d '{
    "query": "{ shop { name plan { displayName } } markets(first: 10) { edges { node { id name enabled primary } } } locations(first: 10) { edges { node { id name } } } }"
  }'
