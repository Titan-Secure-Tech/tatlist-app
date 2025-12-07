#!/bin/bash

# Script to clean environment variables by removing trailing newlines
# This script will help you update Vercel environment variables

set -e

echo "🧹 Environment Variable Cleanup Script"
echo "======================================="
echo ""
echo "This script will help you remove trailing newlines from Vercel environment variables."
echo ""

# List of environment variables that commonly have newline issues
ENV_VARS=(
  "SQUARE_PRODUCTION_ACCESS_TOKEN"
  "SQUARE_PRODUCTION_APPLICATION_ID"
  "SQUARE_PRODUCTION_LOCATION_ID"
  "NEXT_PUBLIC_SQUARE_PRODUCTION_APPLICATION_ID"
  "NEXT_PUBLIC_SQUARE_PRODUCTION_LOCATION_ID"
  "SQUARE_SANDBOX_ACCESS_TOKEN"
  "SQUARE_SANDBOX_APPLICATION_ID"
  "SQUARE_SANDBOX_LOCATION_ID"
  "NEXT_PUBLIC_SQUARE_SANDBOX_APPLICATION_ID"
  "NEXT_PUBLIC_SQUARE_SANDBOX_LOCATION_ID"
  "SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_URL"
  "SUPABASE_ANON_KEY"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
)

echo "The following environment variables will be checked and cleaned:"
for var in "${ENV_VARS[@]}"; do
  echo "  - $var"
done
echo ""

read -p "Do you want to continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborted."
  exit 0
fi

echo ""
echo "For each variable, you'll be prompted to enter the value."
echo "Paste the value and the script will automatically strip newlines."
echo ""

for var in "${ENV_VARS[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Processing: $var"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

  read -p "Do you want to update $var? (y/n/skip) " -n 1 -r
  echo ""

  if [[ $REPLY =~ ^[Ss]$ ]]; then
    echo "Skipping $var"
    echo ""
    continue
  fi

  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping $var"
    echo ""
    continue
  fi

  echo "Enter the value for $var (it will be hidden):"
  read -s raw_value

  # Strip all newlines, carriage returns, and trailing whitespace
  cleaned_value=$(echo -n "$raw_value" | tr -d '\n\r' | sed 's/[[:space:]]*$//')

  if [ -z "$cleaned_value" ]; then
    echo "⚠️  Empty value detected. Skipping $var"
    echo ""
    continue
  fi

  echo ""
  echo "Value length: ${#cleaned_value} characters"
  echo "First 10 chars: ${cleaned_value:0:10}..."
  echo "Last 10 chars: ...${cleaned_value: -10}"
  echo ""

  read -p "Does this look correct? (y/n) " -n 1 -r
  echo ""

  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Skipping $var"
    echo ""
    continue
  fi

  # Remove the old variable from production
  echo "Removing old value..."
  vercel env rm "$var" production --yes 2>/dev/null || true

  # Add the cleaned value
  echo "Adding cleaned value..."
  echo "$cleaned_value" | vercel env add "$var" production

  echo "✅ Successfully updated $var"
  echo ""
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Cleanup complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "1. Trigger a new deployment: vercel --prod"
echo "2. Test the checkout flow"
echo ""
