# Square Integration Guide

## Overview

This guide covers the Square integration for Tatlist, including product sync, checkout flow, and payment processing.

## Setup Steps

### 1. Database Migration

Run the Square integration migration to set up required tables:

```bash
bunx supabase db push
```

This creates:
- Extended `products` table with Square fields
- `orders` table for order tracking
- `order_items` table for line items
- `square_webhooks` table for webhook events
- `square_sync_logs` table for sync tracking

### 2. Environment Variables

Add to `.env.local`:

```bash
# Square Sandbox (Development)
SQUARE_SANDBOX_ACCESS_TOKEN=your_sandbox_token
SQUARE_SANDBOX_APPLICATION_ID=your_sandbox_app_id
SQUARE_SANDBOX_LOCATION_ID=your_sandbox_location_id

# Square Production (when ready)
SQUARE_PRODUCTION_ACCESS_TOKEN=your_prod_token
SQUARE_PRODUCTION_APPLICATION_ID=your_prod_app_id
SQUARE_PRODUCTION_LOCATION_ID=your_prod_location_id

# Webhook Signature (for production)
SQUARE_WEBHOOK_SIGNATURE_KEY=your_webhook_key
```

### 3. Sync Square Products

Import your Square catalog to Supabase:

```bash
bun run scripts/sync-square-products.ts
```

This will:
- Fetch all products from Square
- Import them with variations, images, and pricing
- Track sync status in `square_sync_logs`

## Features

### Product Management
- **Sync Script**: `scripts/sync-square-products.ts`
- Imports Square catalog items with variations
- Downloads and stores product images
- Maps categories and pricing

### Checkout Flow
- **API Route**: `/api/square/checkout`
- Creates Square orders and payment links
- Saves orders to Supabase database
- Falls back to mock data if Square is unavailable

### Payment Processing
- **API Route**: `/api/square/process-payment`
- Processes Square payments
- Updates order status
- Sends confirmation emails

### Webhook Handling
- **API Route**: `/api/square/webhooks`
- Receives Square webhook events
- Updates order status automatically
- Tracks payment confirmations
- Handles refunds and fulfillment updates

### Payment Success Page
- **Page**: `/payment-success`
- Displays order confirmation
- Shows order details from database
- Includes delivery information

## Testing

### 1. Test Product Sync

```bash
# Sync products from Square
bun run scripts/sync-square-products.ts

# Check imported products
bunx supabase db query "SELECT * FROM products WHERE sync_source = 'square'"
```

### 2. Test Checkout Flow

1. Go to `/shop`
2. Add items to cart
3. Proceed to checkout
4. Complete payment (use Square test cards in sandbox)
5. Verify order in database

### 3. Test Webhooks

Square Sandbox provides webhook testing:

1. Go to Square Dashboard > Webhooks
2. Configure webhook URL: `https://your-domain.com/api/square/webhooks`
3. Test events will update orders automatically

## Square Test Cards (Sandbox)

Use these for testing:

- **Success**: 4111 1111 1111 1111
- **Decline**: 4000 0000 0000 0002
- **CVV Failure**: 4000 0000 0000 0010

## Production Deployment

### 1. Update Environment Variables

In Vercel/production, set:
- All `SQUARE_PRODUCTION_*` variables
- `SQUARE_WEBHOOK_SIGNATURE_KEY`
- `NODE_ENV=production`

### 2. Configure Square Webhooks

In Square Dashboard:
1. Go to Webhooks
2. Add endpoint: `https://tatlist.com/api/square/webhooks`
3. Select events:
   - payment.created
   - payment.updated
   - order.updated
   - refund.created

### 3. Run Initial Sync

After deploying:

```bash
NODE_ENV=production bun run scripts/sync-square-products.ts
```

## Monitoring

### Check Sync Status

```sql
-- View recent syncs
SELECT * FROM square_sync_logs 
ORDER BY started_at DESC 
LIMIT 10;

-- Check webhook processing
SELECT * FROM square_webhooks 
WHERE processed = false;

-- View recent orders
SELECT * FROM orders 
ORDER BY created_at DESC 
LIMIT 10;
```

### Admin Dashboard (TODO)

Future enhancement: Add Square sync controls to admin dashboard at `/admin/square-sync`

## Troubleshooting

### Products Not Syncing
- Verify Square API credentials
- Check location ID matches
- Review sync logs for errors

### Orders Not Creating
- Ensure database migration ran
- Check Supabase service role key
- Verify Square API access

### Webhooks Not Processing
- Confirm webhook URL is accessible
- Check signature key (production only)
- Review webhook logs in database

## Security Notes

- Never commit API keys to git
- Use environment variables for all secrets
- Validate webhook signatures in production
- Use RLS policies on Supabase tables
- Sanitize user input in checkout flow