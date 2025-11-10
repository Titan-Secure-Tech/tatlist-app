#!/bin/bash

# Square Product Sync Runner
# This script ensures a clean environment for running the Square product sync

echo "🔄 Square Product Sync"
echo "====================="
echo ""
echo "This script will sync products from Black Eye Naturals Square store to Tatlist database."
echo ""

# Clear any cached Square environment variables
unset SQUARE_PRODUCTION_ACCESS_TOKEN
unset SQUARE_PRODUCTION_APPLICATION_ID
unset SQUARE_PRODUCTION_LOCATION_ID
unset SQUARE_PRODUCTION_REDIRECT_URL
unset SQUARE_SANDBOX_ACCESS_TOKEN
unset SQUARE_SANDBOX_APPLICATION_ID
unset SQUARE_SANDBOX_LOCATION_ID
unset SQUARE_SANDBOX_REDIRECT_URL

# Set NODE_ENV to production
export NODE_ENV=production

echo "✅ Environment prepared"
echo "🚀 Starting sync..."
echo ""

# Run the sync script
bun run scripts/sync-square-products.ts

exit_code=$?

if [ $exit_code -eq 0 ]; then
  echo ""
  echo "✅ Sync completed successfully!"
else
  echo ""
  echo "❌ Sync failed with exit code: $exit_code"
  echo "Please check the error messages above."
fi

exit $exit_code
