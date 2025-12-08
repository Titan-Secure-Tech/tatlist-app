#!/bin/bash

TOKEN=$(grep SQUARE_PRODUCTION_ACCESS_TOKEN .env.verify | cut -d'"' -f2)

echo "Testing Access Token with Square Orders API..."
echo "Token: ${TOKEN:0:20}...${TOKEN: -10}"
echo ""

curl -s https://connect.squareup.com/v2/orders \
  -X POST \
  -H 'Square-Version: 2025-10-16' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"idempotency_key": "test-1733645000", "order": {"location_id": "8RPNP3HYD0RPD", "line_items": [{"name": "Test", "quantity": "1", "base_price_money": {"amount": 100, "currency": "USD"}}]}}'
