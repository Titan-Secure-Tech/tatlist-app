# Square Sandbox User-Specific Testing Guide

## Overview

The Tatlist checkout system now supports user-specific sandbox mode, allowing certain test users to see Square sandbox checkout while regular users see production checkout. This enables safe testing on the production site without affecting real customers.

## Test Users Configuration

### Current Test Users

The following emails are configured for sandbox mode:

- `crushjunkmail@gmail.com`
- `james@familiawashington.com`

When these users enter their email during checkout, they will automatically be routed to Square's sandbox payment system.

## How It Works

### 1. User Detection

The system checks if a customer email matches sandbox users in two ways:

- **Hardcoded list**: Quick check against known test emails in `lib/square/client-config.ts`
- **Database table**: Checks `sandbox_users` table for dynamic configuration

### 2. Visual Indicators

When a sandbox user is detected:

- Checkout form shows: **"🧪 Sandbox Mode Active"** next to Customer Information
- Success toast displays: **"🧪 Redirecting to Square Sandbox payment..."**
- Payment success page shows sandbox indicator

### 3. Square Environment

- **Sandbox users**: Routed to `https://sandbox.squareup.com`
- **Regular users**: Routed to `https://squareup.com`

## Testing on Production (tatlist.com)

### Prerequisites

1. Deploy to Vercel with environment variables:

```bash
# Sandbox credentials (always present)
SQUARE_SANDBOX_ACCESS_TOKEN
SQUARE_SANDBOX_APPLICATION_ID
SQUARE_SANDBOX_LOCATION_ID

# Production credentials (when ready)
SQUARE_PRODUCTION_ACCESS_TOKEN
SQUARE_PRODUCTION_APPLICATION_ID
SQUARE_PRODUCTION_LOCATION_ID
```

### Testing Process

#### Step 1: Test with Sandbox User

1. Visit `https://tatlist.com/shop`
2. Add products to cart
3. Go to checkout
4. Enter test user email:
   - Email: `crushjunkmail@gmail.com`
   - Name: Test User
   - Phone: (555) 123-4567
5. Verify "🧪 Sandbox Mode Active" appears
6. Complete checkout
7. Use test card: `4111 1111 1111 1111`
8. Verify redirect to sandbox Square payment

#### Step 2: Test with Regular User

1. Clear cart and return to shop
2. Add products to cart
3. Go to checkout
4. Enter regular email:
   - Email: `customer@example.com`
   - Name: Real Customer
   - Phone: (555) 987-6543
5. Verify NO sandbox indicator appears
6. Complete checkout
7. Verify redirect to production Square (or mock if not configured)

### Test Card Numbers (Sandbox Only)

#### Success Cards

- Visa: `4111 1111 1111 1111`
- Mastercard: `5105 1051 0510 5100`
- Amex: `3782 822463 10005`
- Discover: `6011 0000 0000 0004`

#### Decline Cards

- Generic Decline: `4000 0000 0000 0002`
- Insufficient Funds: `4000 0000 0000 0069`
- Invalid CVV: `4000 0000 0000 0127`
- Expired Card: `4000 0000 0000 0051`

## Managing Sandbox Users

### Add New Test User

```sql
-- Add via Supabase SQL Editor
INSERT INTO sandbox_users (email, notes)
VALUES ('newtest@example.com', 'QA testing account')
ON CONFLICT (email) DO UPDATE SET enabled = TRUE;
```

### Remove Test User

```sql
-- Disable sandbox mode for user
UPDATE sandbox_users
SET enabled = FALSE
WHERE email = 'test@example.com';
```

### Check Current Test Users

```sql
-- List all active sandbox users
SELECT email, enabled, notes, created_at
FROM sandbox_users
WHERE enabled = TRUE
ORDER BY created_at DESC;
```

## Monitoring & Debugging

### Check Logs

```bash
# View Vercel function logs
vercel logs --follow

# Look for:
# [Square Checkout] Using sandbox mode for crushjunkmail@gmail.com (reason: hardcoded_test_user)
# [Square Checkout] Using production mode for regular@user.com (reason: production)
```

### Verify in Square Dashboard

- **Sandbox**: https://sandbox.squareup.com/dashboard
- **Production**: https://squareup.com/dashboard

### Database Verification

```sql
-- Check recent orders
SELECT
  id,
  customer_email,
  square_order_id,
  payment_status,
  total_amount,
  created_at
FROM orders
WHERE customer_email IN ('crushjunkmail@gmail.com', 'james@familiawashington.com')
ORDER BY created_at DESC
LIMIT 10;
```

## Transitioning to Production

When ready to go fully live:

1. **Test thoroughly** with sandbox users
2. **Verify production credentials** are set in Vercel
3. **Regular users** will automatically use production
4. **Keep test users** in sandbox for ongoing QA

## Troubleshooting

### Issue: Sandbox mode not activating

- Check email is lowercase
- Verify user is in `sandbox_users` table
- Check hardcoded list in `lib/square/client-config.ts`

### Issue: Payment fails in sandbox

- Ensure using test card numbers
- Check Square sandbox credentials
- Verify location ID matches sandbox account

### Issue: Can't see sandbox indicator

- Clear browser cache
- Check React component state
- Verify email detection logic

## Security Notes

- Sandbox mode is determined server-side
- Test cards only work in sandbox environment
- Production cards will fail in sandbox
- Sandbox transactions don't affect real money

## Support

For issues or questions:

- Check Square sandbox logs
- Review Supabase database entries
- Monitor Vercel function logs
- Test with `scripts/test-sandbox-mode.ts`
