#!/bin/bash
# Step 3 — Create web presences per market
#
# ⚠️  PREREQUISITE — Enable languages in Shopify Admin FIRST:
#     Admin → Settings → Languages → Add language
#       • French (fr)
#       • German (de)
#       • Danish (da)
#     English (en) is always available.
#     Then re-run this script.
#
# Locale strategy:
#   Switzerland   → EN default  | FR, DE alternate  | /ch
#   France        → FR default  | EN alternate       | /fr
#   United States → EN default  | (none)             | /us  ← already done
#   Denmark       → EN default  | DA alternate       | /dk
set -euo pipefail
source "$(dirname "$0")/../.env"

API="https://${SHOPIFY_STORE}/admin/api/2024-10/graphql.json"
TOKEN="${SHOPIFY_ACCESS_TOKEN}"

MARKET_CH="gid://shopify/Market/62233968795"
MARKET_FR="gid://shopify/Market/62234001563"
MARKET_US="gid://shopify/Market/62215225499"
MARKET_DK="gid://shopify/Market/62234034331"

gql() {
  curl -s -X POST "$API" \
    -H "Content-Type: application/json" \
    -H "X-Shopify-Access-Token: $TOKEN" \
    -d "$1"
}

echo ""
echo "=============================="
echo " Step 3: Create Web Presences"
echo "=============================="

# United States is already done — skip if web presence exists
echo ""
echo "--- United States: EN default, /us (already created — skipping) ---"

echo ""
echo "--- Switzerland: EN default, FR + DE alternate, /ch ---"
gql "{\"query\":\"mutation { marketWebPresenceCreate(marketId: \\\"${MARKET_CH}\\\", webPresence: { defaultLocale: \\\"en\\\", alternateLocales: [\\\"fr\\\", \\\"de\\\"], subfolderSuffix: \\\"ch\\\" }) { market { id name } userErrors { field message } } }\"}" | python3 -m json.tool

echo ""
echo "--- France: FR default, EN alternate, /fr ---"
gql "{\"query\":\"mutation { marketWebPresenceCreate(marketId: \\\"${MARKET_FR}\\\", webPresence: { defaultLocale: \\\"fr\\\", alternateLocales: [\\\"en\\\"], subfolderSuffix: \\\"fr\\\" }) { market { id name } userErrors { field message } } }\"}" | python3 -m json.tool

echo ""
echo "--- Denmark: EN default, DA alternate, /dk ---"
gql "{\"query\":\"mutation { marketWebPresenceCreate(marketId: \\\"${MARKET_DK}\\\", webPresence: { defaultLocale: \\\"en\\\", alternateLocales: [\\\"da\\\"], subfolderSuffix: \\\"dk\\\" }) { market { id name } userErrors { field message } } }\"}" | python3 -m json.tool

echo ""
echo "=============================="
echo " Done. Check for userErrors."
echo " If languages not enabled yet,"
echo " add them in Admin → Settings"
echo " → Languages, then re-run."
echo "=============================="
