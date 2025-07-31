#!/bin/bash

# Production Supabase project ref
PROJECT_REF="yzpiadsnllrycdfxlneb"
SUPABASE_URL="https://yzpiadsnllrycdfxlneb.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGlhZHNubGxyeWNkZnhsbmViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ2MTk3MywiZXhwIjoyMDY5MDM3OTczfQ.ACpxpS6U1_nIlxktAvGiUoUyozPRoPez-SXP1M9Zmb0"

# Production URLs
PRODUCTION_URL="https://tatlist-qzuwnnsg1-titan-tech-9d2bd055.vercel.app"
CALLBACK_URL="${PRODUCTION_URL}/api/auth/callback"

# Update auth configuration using Supabase Management API
echo "Updating Supabase auth configuration..."

# Note: Supabase doesn't provide a direct CLI way to update auth settings
# You'll need to update these in the Supabase Dashboard:
# 1. Go to https://supabase.com/dashboard/project/${PROJECT_REF}/auth/url-configuration
# 2. Set Site URL to: ${PRODUCTION_URL}
# 3. Add Redirect URL: ${CALLBACK_URL}

echo "Please manually update the following in your Supabase Dashboard:"
echo "1. Site URL: ${PRODUCTION_URL}"
echo "2. Redirect URLs: ${CALLBACK_URL}"
echo ""
echo "Dashboard URL: https://supabase.com/dashboard/project/${PROJECT_REF}/auth/url-configuration"