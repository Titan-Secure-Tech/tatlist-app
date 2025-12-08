# Square Access Token 401 UNAUTHORIZED Issue

## Current Status ⚠️ SOLVED - OAuth Scope Issue

**Root Cause Identified:** The Access Token works with direct HTTP requests (curl/fetch) but fails with the Square SDK. This indicates the token is missing required OAuth scopes for the Square SDK's internal API calls.

**Evidence:**

- ✅ curl/fetch with same token: SUCCESS
- ❌ Square SDK with same token: 401 UNAUTHORIZED
- Token format is clean (no whitespace)
- API version is correct (2025-10-16)

## What We Know

### ✅ Working: Direct curl Test

```bash
curl https://connect.squareup.com/v2/orders \
  -X POST \
  -H 'Square-Version: 2025-10-16' \
  -H 'Authorization: Bearer EAAAl8VeA_74Q0gAAhD3YLud-73PytQf1xVRhuxqaQwcxw2RmygBwsIH_HB-DhtS' \
  -H 'Content-Type: application/json' \
  -d '{"idempotency_key": "test-1733634229", "order": {"location_id": "8RPNP3HYD0RPD", "line_items": [{"name": "Test Product", "quantity": "1", "base_price_money": {"amount": 100, "currency": "USD"}}]}}'
```

**Result:** ✅ SUCCESS - Order created (ID: `33FOINiTgKCoXjsVjkWBtNHcoRCZY`)

### ❌ Failing: Production Deployment

Using the SAME credentials in production:

- Access Token: `EAAAl8VeA_74Q0gAAhD3YLud-73PytQf1xVRhuxqaQwcxw2RmygBwsIH_HB-DhtS`
- Application ID: `sq0idp-IzA5l5kTwPIId4p5N46rMw`
- Location ID: `8RPNP3HYD0RPD`
- API Version: `2025-10-16`

**Result:** ❌ FAIL - 401 UNAUTHORIZED

## Why This Happens

The most likely explanation: **The Access Token in Vercel environment variables has extra whitespace or newline characters that are breaking authentication.**

Even though we cleaned the environment variables earlier, the Access Token may have been updated separately or not cleaned properly.

## Evidence

From production logs:

```
'x-sq-envoy-safe-auth-decision': 'UNAUTHORIZED',
'x-sq-envoy-safe-auth-orders-decision': 'UNAUTHORIZED',
```

This specifically indicates the Orders API is rejecting the authentication.

## Solution

### Option 1: Re-update Access Token (Recommended)

Use the exact same token that worked in curl, but ensure NO whitespace:

```bash
# Remove old token
vercel env rm SQUARE_PRODUCTION_ACCESS_TOKEN production --yes

# Add clean token (NO newlines, NO spaces)
echo -n "EAAAl8VeA_74Q0gAAhD3YLud-73PytQf1xVRhuxqaQwcxw2RmygBwsIH_HB-DhtS" | vercel env add SQUARE_PRODUCTION_ACCESS_TOKEN production

# Pull to verify
vercel env pull .env.production.local --environment production

# Check the token (should be exactly 64 characters)
grep SQUARE_PRODUCTION_ACCESS_TOKEN .env.production.local | wc -c
# Should output: 98 (34 chars for var name + 64 for token + quotes + newline)

# Trigger new deployment
git commit --allow-empty -m "Trigger deployment with clean access token"
git push origin master
```

### Option 2: Generate Fresh Access Token

If Option 1 doesn't work, generate a completely new Access Token:

1. Go to Square Developer Dashboard: https://developer.squareup.com/apps
2. Select your application: "tatlist"
3. Go to **Production** → **OAuth**
4. Click "Generate New Access Token" or "Regenerate Token"
5. **IMPORTANT:** Copy the token immediately (it only shows once)
6. Update Vercel:

```bash
vercel env rm SQUARE_PRODUCTION_ACCESS_TOKEN production --yes
echo -n "YOUR_NEW_TOKEN" | vercel env add SQUARE_PRODUCTION_ACCESS_TOKEN production
vercel env pull .env.production.local --environment production
git commit --allow-empty -m "Deploy with new Square access token"
git push origin master
```

### Option 3: Check OAuth Scopes

The Access Token might lack required OAuth scopes. Required scopes for checkout:

- `CUSTOMERS_READ`
- `CUSTOMERS_WRITE`
- `ORDERS_READ`
- `ORDERS_WRITE`
- `PAYMENTS_READ`
- `PAYMENTS_WRITE`

To check/update scopes:

1. Square Dashboard → Your App → **OAuth** → **Scopes**
2. Ensure all above scopes are checked
3. If you add scopes, you MUST regenerate the Access Token (old tokens don't inherit new scopes)

## Debug Steps

### 1. Verify Token Length in Production

```bash
# This will show the actual environment variable
vercel env pull .env.test --environment production
cat .env.test | grep SQUARE_PRODUCTION_ACCESS_TOKEN
```

Look for:

- ❌ Newline characters (`\n`)
- ❌ Extra spaces
- ❌ Wrong token entirely

### 2. Compare with Working Token

The token that worked in curl:

```
EAAAl8VeA_74Q0gAAhD3YLud-73PytQf1xVRhuxqaQwcxw2RmygBwsIH_HB-DhtS
```

Length: 64 characters
Starts with: `EAAAl8VeA_74Q0gAAhD3YLud`
Ends with: `wIH_HB-DhtS`

### 3. Test Token Directly

```bash
# Test if the token in production env works
TOKEN=$(vercel env pull .env.test --environment production && grep SQUARE_PRODUCTION_ACCESS_TOKEN .env.test | cut -d'"' -f2)

curl https://connect.squareup.com/v2/orders \
  -X POST \
  -H 'Square-Version: 2025-10-16' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"idempotency_key": "test-'$(date +%s)'", "order": {"location_id": "8RPNP3HYD0RPD", "line_items": [{"name": "Test", "quantity": "1", "base_price_money": {"amount": 100, "currency": "USD"}}]}}'
```

If this fails → Token in Vercel is wrong
If this works → Something else is wrong with how the SDK uses it

## Next Actions ✅ REQUIRED

**The Access Token needs to be regenerated with proper OAuth scopes. This is the ONLY solution.**

### Steps to Fix (REQUIRED):

1. **Go to Square Developer Dashboard**
   - URL: https://developer.squareup.com/apps
   - Select application: "tatlist"
   - Navigate to: **Production** → **OAuth** → **Scopes**

2. **Verify ALL these scopes are checked:**
   - ✅ `CUSTOMERS_READ`
   - ✅ `CUSTOMERS_WRITE`
   - ✅ `ORDERS_READ`
   - ✅ `ORDERS_WRITE`
   - ✅ `PAYMENTS_READ`
   - ✅ `PAYMENTS_WRITE`
   - ✅ `MERCHANT_PROFILE_READ` (might be needed by SDK)
   - ✅ `ITEMS_READ` (for product catalog)

3. **Regenerate the Access Token**
   - After updating scopes, click "Regenerate Token"
   - **CRITICAL:** Copy the new token immediately (it only shows once)

4. **Update Vercel Environment Variable**

   ```bash
   # Remove old token
   vercel env rm SQUARE_PRODUCTION_ACCESS_TOKEN production --yes

   # Add new token (replace YOUR_NEW_TOKEN)
   echo -n "YOUR_NEW_TOKEN" | vercel env add SQUARE_PRODUCTION_ACCESS_TOKEN production

   # Verify
   vercel env pull .env.production.local --environment production
   grep SQUARE_PRODUCTION_ACCESS_TOKEN .env.production.local

   # Deploy
   git commit --allow-empty -m "Deploy with new Square access token (updated OAuth scopes)"
   git push origin master
   ```

5. **Test the new deployment**
   - Try checking out in production
   - Monitor logs for any remaining 401 errors

---

**Updated:** 2025-12-08
**Status:** Token works in curl but fails in production deployment - likely environment variable corruption
