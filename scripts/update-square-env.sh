#!/bin/bash

# Quick script to update Square production credentials
# This will prompt you for each value and clean it automatically

set -e

echo "🔑 Square Production Credentials Update"
echo "========================================"
echo ""
echo "Please have your Square Developer Dashboard open:"
echo "https://developer.squareup.com/apps"
echo ""
echo "You'll need:"
echo "  1. Production Access Token"
echo "  2. Production Application ID"
echo "  3. Production Location ID"
echo ""

read -p "Press Enter to continue..."
echo ""

# Function to clean and update an env var
update_var() {
  local var_name=$1
  local prompt=$2

  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Updating: $var_name"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "$prompt"
  echo ""
  echo "Paste the value (it will be hidden):"
  read -s raw_value

  # Clean the value - remove all whitespace characters
  cleaned_value=$(echo "$raw_value" | tr -d '[:space:]')

  if [ -z "$cleaned_value" ]; then
    echo "❌ Empty value. Skipping $var_name"
    echo ""
    return 1
  fi

  echo ""
  echo "Value length: ${#cleaned_value} characters"
  echo "First 10 chars: ${cleaned_value:0:10}..."
  echo ""

  read -p "Update this variable? (y/n): " -n 1 -r
  echo ""

  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping $var_name"
    echo ""
    return 1
  fi

  # Remove old value
  vercel env rm "$var_name" production --yes 2>/dev/null || true

  # Add new cleaned value
  echo "$cleaned_value" | vercel env add "$var_name" production

  echo "✅ Updated $var_name"
  echo ""
}

# Update each variable
update_var \
  "SQUARE_PRODUCTION_ACCESS_TOKEN" \
  "Get this from: Square Dashboard > Your App > Production > OAuth > Access token"

update_var \
  "SQUARE_PRODUCTION_APPLICATION_ID" \
  "Get this from: Square Dashboard > Your App > Production > Credentials > Application ID"

update_var \
  "SQUARE_PRODUCTION_LOCATION_ID" \
  "Get this from: Square Dashboard > Your App > Production > Locations"

# Also update the NEXT_PUBLIC_ versions if they exist
update_var \
  "NEXT_PUBLIC_SQUARE_PRODUCTION_APPLICATION_ID" \
  "Same as SQUARE_PRODUCTION_APPLICATION_ID (for client-side)"

update_var \
  "NEXT_PUBLIC_SQUARE_PRODUCTION_LOCATION_ID" \
  "Same as SQUARE_PRODUCTION_LOCATION_ID (for client-side)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Done!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Pull updated env vars: vercel env pull .env.local"
echo "2. Deploy: git push origin master (or vercel --prod)"
echo "3. Test checkout in production"
echo ""
