# Square Sandbox Testing Guide for Production Deployment

This guide provides comprehensive instructions for testing Square sandbox functionality on the production deployment of tatlist.com. The Square integration automatically switches between sandbox and production environments based on `NODE_ENV`.

## Table of Contents

1. [Environment Configuration](#environment-configuration)
2. [Testing Prerequisites](#testing-prerequisites)
3. [Sandbox Testing Procedures](#sandbox-testing-procedures)
4. [Test Card Numbers and Scenarios](#test-card-numbers-and-scenarios)
5. [Verification Steps](#verification-steps)
6. [Troubleshooting](#troubleshooting)
7. [Transition to Production](#transition-to-production)

## Environment Configuration

### Current Square Client Configuration

The Square client automatically switches environments based on `NODE_ENV`:

```typescript
// From lib/square/client.ts
const isProduction = process.env.NODE_ENV === 'production'

export const squareClient = new SquareClient({
  accessToken: isProduction
    ? process.env.SQUARE_PRODUCTION_ACCESS_TOKEN!
    : process.env.SQUARE_SANDBOX_ACCESS_TOKEN!,
  environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
})
```

### Required Environment Variables

#### For Sandbox Testing in Production

Set these environment variables on Vercel for production deployment:

```bash
# Square Sandbox Credentials
SQUARE_SANDBOX_ACCESS_TOKEN=your_sandbox_access_token
SQUARE_SANDBOX_APPLICATION_ID=your_sandbox_app_id
SQUARE_SANDBOX_LOCATION_ID=your_sandbox_location_id

# Square Production Credentials (for future use)
SQUARE_PRODUCTION_ACCESS_TOKEN=your_production_access_token
SQUARE_PRODUCTION_APPLICATION_ID=your_production_app_id
SQUARE_PRODUCTION_LOCATION_ID=your_production_location_id

# Webhook Configuration (production only)
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_signature_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://tatlist.vercel.app
```

### Setting Environment Variables on Vercel

1. **Via Vercel Dashboard:**

   ```bash
   # Navigate to your project settings
   https://vercel.com/titan-tech-9d2bd055/tatlist/settings/environment-variables
   ```

2. **Via Vercel CLI:**

   ```bash
   # Set individual environment variables
   vercel env add SQUARE_SANDBOX_ACCESS_TOKEN
   vercel env add SQUARE_SANDBOX_APPLICATION_ID
   vercel env add SQUARE_SANDBOX_LOCATION_ID

   # Pull current environment variables to verify
   vercel env pull .env.production --environment production
   ```

### Override for Sandbox Testing in Production

To force sandbox mode in production for testing:

1. **Temporary Environment Override:**

   ```bash
   # Set NODE_ENV to 'development' temporarily on Vercel
   vercel env add NODE_ENV development

   # Redeploy to apply changes
   vercel --prod
   ```

2. **Code-based Override (Alternative):**
   Add a temporary environment variable for testing:
   ```typescript
   // Temporary override in lib/square/client.ts
   const forceSandbox = process.env.FORCE_SQUARE_SANDBOX === 'true'
   const isProduction = process.env.NODE_ENV === 'production' && !forceSandbox
   ```

## Testing Prerequisites

### Square Developer Account Setup

1. **Access Square Developer Dashboard:**
   - Visit: https://developer.squareup.com/
   - Log in with your Square account
   - Navigate to your application

2. **Verify Sandbox Application:**
   - Ensure sandbox application is created
   - Note down Application ID and Location ID
   - Generate sandbox access token if needed

3. **Apple Pay Domain Verification:**
   - Verify domain association file is accessible:
   - URL: `https://tatlist.vercel.app/.well-known/apple-developer-merchantid-domain-association`
   - Status should return 200 OK

### Database Verification

Ensure Supabase database has required tables:

```sql
-- Verify tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('orders', 'order_items', 'payments', 'webhooks');
```

## Sandbox Testing Procedures

### 1. Product Catalog Testing

**Test URL:** `https://tatlist.vercel.app/shop`

1. **Verify Product Loading:**
   - Navigate to shop page
   - Confirm products load correctly
   - Check that prices display properly

2. **Cart Functionality:**
   - Add items to cart
   - Modify quantities
   - Remove items
   - Verify cart persistence

### 2. Checkout Flow Testing

**Test URL:** `https://tatlist.vercel.app/shop/checkout` or `https://tatlist.vercel.app/shop/checkout-v2`

1. **Order Creation:**
   - Fill out customer information
   - Enter delivery address
   - Add order notes (optional)
   - Submit checkout form

2. **Square Integration:**
   - Verify order is created in Square sandbox
   - Check that payment link is generated
   - Confirm order is stored in Supabase database

3. **Payment Processing:**
   - Click payment link
   - Use test card numbers (see below)
   - Complete payment flow
   - Verify redirect to success page

### 3. Database Verification

Check order creation in Supabase:

```sql
-- Recent orders
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Order items for specific order
SELECT * FROM order_items WHERE order_id = 'your-order-id';

-- Payment records
SELECT * FROM payments WHERE order_id = 'your-order-id';
```

## Test Card Numbers and Scenarios

### Successful Payment Tests

```bash
# Visa Success
Card Number: 4111 1111 1111 1111
CVV: Any 3 digits
Expiration: Any future date
ZIP: Any valid ZIP code

# Visa Success (Alternative)
Card Number: 4532 1234 5678 9012
CVV: 123
Expiration: 12/25
ZIP: 12345

# Mastercard Success
Card Number: 5555 5555 5555 4444
CVV: 123
Expiration: 12/25
ZIP: 12345

# American Express Success
Card Number: 3782 822463 10005
CVV: 1234
Expiration: 12/25
ZIP: 12345
```

### Decline Scenarios

```bash
# Generic Decline
Card Number: 4000 0000 0000 0002
CVV: 123
Expiration: 12/25
ZIP: 12345

# Insufficient Funds
Card Number: 4000 0000 0000 9995
CVV: 123
Expiration: 12/25
ZIP: 12345

# Invalid CVV
Card Number: 4000 0000 0000 0127
CVV: 123
Expiration: 12/25
ZIP: 12345

# Expired Card
Card Number: 4000 0000 0000 0069
CVV: 123
Expiration: 01/20  # Past date
ZIP: 12345
```

### Special Scenarios

```bash
# Processing Error
Card Number: 4000 0000 0000 0119
CVV: 123
Expiration: 12/25
ZIP: 12345

# Address Verification Failure
Card Number: 4000 0000 0000 0028
CVV: 123
Expiration: 12/25
ZIP: 12345
```

## Verification Steps

### 1. Order Processing Verification

After each test transaction:

1. **Check Square Developer Dashboard:**
   - Navigate to Sandbox → Orders
   - Verify order appears with correct details
   - Check payment status

2. **Database Verification:**

   ```sql
   -- Verify order in Supabase
   SELECT
     id,
     square_order_id,
     customer_name,
     status,
     payment_status,
     total_amount,
     created_at
   FROM orders
   WHERE square_order_id = 'YOUR_SQUARE_ORDER_ID';
   ```

3. **Application Logs:**
   - Check Vercel function logs for any errors
   - Verify successful API calls to Square
   - Monitor database insert operations

### 2. Payment Success Page

**URL Pattern:** `https://tatlist.vercel.app/payment-success?orderId=XXX&orderNumber=YYY&total=ZZZ`

Verify:

- Order details display correctly
- Customer information is accurate
- Total amount matches checkout
- Order status is updated

### 3. Webhook Testing (if configured)

1. **Square Webhook Configuration:**
   - Set webhook URL: `https://tatlist.vercel.app/api/webhooks/square`
   - Enable relevant events (payment.updated, order.updated)

2. **Webhook Verification:**
   ```sql
   -- Check webhook events
   SELECT * FROM webhooks
   WHERE created_at > NOW() - INTERVAL '1 hour'
   ORDER BY created_at DESC;
   ```

## Troubleshooting

### Common Issues and Solutions

#### 1. Authentication Errors

**Error:** "Unauthorized" or 401 responses

**Solutions:**

- Verify `SQUARE_SANDBOX_ACCESS_TOKEN` is set correctly on Vercel
- Check that token hasn't expired
- Ensure application ID matches the access token

#### 2. Location ID Issues

**Error:** "Location not found" or invalid location

**Solutions:**

- Verify `SQUARE_SANDBOX_LOCATION_ID` matches your sandbox account
- Check Square Developer Dashboard for correct location ID
- Ensure location is active in sandbox environment

#### 3. Payment Link Creation Failures

**Error:** Failed to create payment link

**Solutions:**

- Check that all required fields are provided
- Verify pricing calculations (amounts in cents)
- Ensure redirect URL is properly formatted

#### 4. Database Connection Issues

**Error:** Supabase connection failures

**Solutions:**

- Verify Supabase environment variables are set
- Check database connection from Vercel functions
- Ensure tables exist and have correct permissions

### Debug Tools and Commands

1. **Check Environment Variables:**

   ```bash
   vercel env ls --environment production
   ```

2. **View Function Logs:**

   ```bash
   vercel logs --follow
   ```

3. **Test API Endpoints:**

   ```bash
   # Test products endpoint
   curl https://tatlist.vercel.app/api/square/products

   # Test checkout endpoint (requires POST with data)
   curl -X POST https://tatlist.vercel.app/api/square/checkout \
     -H "Content-Type: application/json" \
     -d '{"items":[...], "deliveryAddress":{...}, "customerInfo":{...}}'
   ```

## Transition to Production

### Phase 1: Pre-Production Checklist

- [ ] All sandbox tests pass successfully
- [ ] Database operations work correctly
- [ ] Payment flows complete without errors
- [ ] Webhook handling is functional
- [ ] Error handling works as expected
- [ ] Apple Pay domain verification is complete

### Phase 2: Production Environment Setup

1. **Square Production Application:**
   - Create production application in Square Developer Dashboard
   - Generate production access tokens
   - Configure production webhook endpoints
   - Verify production location settings

2. **Environment Variable Updates:**

   ```bash
   # Remove sandbox override
   vercel env rm NODE_ENV

   # Set production credentials
   vercel env add SQUARE_PRODUCTION_ACCESS_TOKEN
   vercel env add SQUARE_PRODUCTION_APPLICATION_ID
   vercel env add SQUARE_PRODUCTION_LOCATION_ID
   vercel env add SQUARE_WEBHOOK_SIGNATURE_KEY
   ```

### Phase 3: Production Deployment

1. **Deploy with Production Settings:**

   ```bash
   # Deploy to production
   vercel --prod

   # Verify deployment
   vercel inspect https://tatlist.vercel.app
   ```

2. **Production Testing:**
   - Test with small amount transactions first
   - Use real payment methods in controlled environment
   - Monitor all systems closely
   - Have rollback plan ready

### Phase 4: Go-Live Verification

- [ ] Real payment processing works
- [ ] Order fulfillment system receives orders
- [ ] Customer notifications are sent
- [ ] Database records are accurate
- [ ] Webhook events are processed
- [ ] Error monitoring is active

## Monitoring and Alerting

### Key Metrics to Monitor

1. **Transaction Success Rate**
2. **API Response Times**
3. **Database Connection Health**
4. **Webhook Processing Success**
5. **Error Rates and Types**

### Recommended Monitoring Setup

1. **Vercel Analytics:** Monitor function performance
2. **Sentry:** Error tracking and alerting
3. **Supabase Monitoring:** Database performance
4. **Square Developer Dashboard:** Transaction monitoring

## Support and Resources

### Square Developer Resources

- **Documentation:** https://developer.squareup.com/docs
- **API Reference:** https://developer.squareup.com/reference/square
- **Sandbox Testing:** https://developer.squareup.com/docs/testing/sandbox
- **Support:** https://developer.squareup.com/support

### Internal Resources

- **Project Repository:** `/Users/jbwashington/Developer/projects/tatlist-app`
- **Square Client Configuration:** `/lib/square/client.ts`
- **Checkout API:** `/app/api/square/checkout/route.ts`
- **Database Schema:** Supabase project `yzpiadsnllrycdfxlneb`

---

**Last Updated:** September 7, 2025  
**Version:** 1.0  
**Maintainer:** Development Team
