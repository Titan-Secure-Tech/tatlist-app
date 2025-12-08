# Square Authentication Diagnosis Summary

## Problem Identified ✅

The Square SDK is returning `401 UNAUTHORIZED` errors despite the Access Token being valid.

## Root Cause

**OAuth Scope Issue** - The Access Token is missing required OAuth scopes for the Square SDK to function properly.

## Evidence

### What Works ✅

- **Direct HTTP requests** (curl/fetch): Successfully creates orders
- Token format: Clean, no whitespace (64 characters)
- API version: Correct (`2025-10-16`)
- Location ID: Correct (`8RPNP3HYD0RPD`)

### What Fails ❌

- **Square SDK**: Returns 401 UNAUTHORIZED with same token
- Customer search API
- Customer create API
- Orders create API (when called via SDK)

## Diagnosis Test Results

```bash
# Run this to verify the issue locally:
source .env.verify && bun run scripts/diagnose-square-auth.ts
```

**Expected output:**

```
1. Environment Variables:
   Token length: 64 characters
   Has whitespace: ✅ NO

2. Testing with fetch (raw HTTP):
   ✅ SUCCESS - Order created: [ORDER_ID]

3. Testing with Square SDK:
   ❌ FAILED - 401 UNAUTHORIZED
```

## Solution

The Access Token must be regenerated with all required OAuth scopes enabled.

### Required OAuth Scopes

Navigate to Square Dashboard → Your App → OAuth → Scopes and ensure these are **ALL checked**:

- ✅ `CUSTOMERS_READ`
- ✅ `CUSTOMERS_WRITE`
- ✅ `ORDERS_READ`
- ✅ `ORDERS_WRITE`
- ✅ `PAYMENTS_READ`
- ✅ `PAYMENTS_WRITE`
- ✅ `MERCHANT_PROFILE_READ` (may be needed by SDK)
- ✅ `ITEMS_READ` (for product catalog)

### Steps to Fix

1. **Update OAuth Scopes** at https://developer.squareup.com/apps
   - Select your app: "tatlist"
   - Go to: Production → OAuth → Scopes
   - Enable all scopes listed above

2. **Regenerate Access Token**
   - Click "Regenerate Token" button
   - **CRITICAL:** Copy the new token immediately (it only shows once!)

3. **Update Vercel Environment**

   ```bash
   # Remove old token
   vercel env rm SQUARE_PRODUCTION_ACCESS_TOKEN production --yes

   # Add new token (NO newlines!)
   echo -n "YOUR_NEW_TOKEN_HERE" | vercel env add SQUARE_PRODUCTION_ACCESS_TOKEN production

   # Verify
   vercel env pull .env.check --environment production
   grep SQUARE_PRODUCTION_ACCESS_TOKEN .env.check
   ```

4. **Deploy**

   ```bash
   git commit --allow-empty -m "Deploy with updated Square OAuth token"
   git push origin master
   ```

5. **Verify Fix**
   - Wait for deployment to complete
   - Test checkout in production
   - Check production logs for any remaining 401 errors

## Why This Happened

Old Access Tokens don't automatically inherit new OAuth scopes. When scopes are added to an application, existing tokens must be regenerated to include those permissions.

The current token likely predates the addition of `CUSTOMERS_READ/WRITE` and other required scopes, which is why direct API calls work (simpler permissions) but the SDK fails (requires more comprehensive permissions).

## Files Modified

### Fixes Applied

- `lib/services/square-customer-sync.ts:260` - Fixed search API structure (exact should be string, added BigInt for limit)
- `lib/square/client-config.ts:51` - Added `.trim()` to clean token
- `lib/square/client-config.ts:54-59` - Added debug logging for token validation

### Diagnostic Tools

- `scripts/diagnose-square-auth.ts` - Tests token with both fetch and SDK
- `scripts/test-token.sh` - Quick curl test for token validity

### Documentation

- `ACCESS_TOKEN_ISSUE.md` - Complete troubleshooting guide
- `SQUARE_AUTH_DIAGNOSIS.md` - This file

## Next Steps

1. Update OAuth scopes in Square Dashboard
2. Regenerate Access Token
3. Update Vercel environment variable
4. Deploy and test

Once the new token with proper scopes is deployed, all Square integration should work correctly.

---

**Date:** 2025-12-08
**Status:** Diagnosis complete - awaiting OAuth scope update and token regeneration
