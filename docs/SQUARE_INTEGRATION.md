# Square Integration Documentation

## Overview

The Tatlist app is now integrated with Square for product catalog management, local delivery orders, and payment processing.

## Features Implemented

### 1. Square Product Catalog Integration

- Products are fetched from Square Catalog API
- Product variants with pricing are supported
- Product images are loaded from Square
- Real-time inventory tracking (when enabled in Square)

### 2. Shopping Cart with Zustand

- Local state management using Zustand
- Persistent cart across page refreshes
- Support for product variants
- Cart totals calculation

### 3. Local Delivery Checkout

- Customer information collection (name, email, phone)
- Delivery address validation
- ZIP code validation for delivery zones
- Business hours enforcement
- Flat $5 delivery fee (configurable)
- Minimum order amount: $25

### 4. Square Payment Processing

- Creates orders in Square with delivery fulfillment
- Generates Square payment links
- Redirects to Square hosted checkout
- Success page after payment completion

## API Endpoints

### GET /api/square/products

Fetches all active products from Square Catalog.

### POST /api/square/checkout

Creates a Square order with delivery details and returns a payment link.

Required body:

```json
{
  "items": [
    {
      "id": "variation_id",
      "name": "Product Name",
      "price": 10.0,
      "quantity": 1,
      "variant": "Variant Name"
    }
  ],
  "deliveryAddress": {
    "line1": "123 Main St",
    "line2": "Apt 4",
    "city": "Los Angeles",
    "state": "CA",
    "postalCode": "90001"
  },
  "customerInfo": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "555-0123"
  }
}
```

### GET /api/square/inventory

Fetches inventory counts for specified catalog object IDs.

## Configuration

### Environment Variables

The following environment variables are required:

```bash
# Development (Sandbox)
SQUARE_SANDBOX_ACCESS_TOKEN=your_sandbox_token
SQUARE_SANDBOX_APPLICATION_ID=your_sandbox_app_id
SQUARE_SANDBOX_LOCATION_ID=your_location_id

# Production
SQUARE_PRODUCTION_ACCESS_TOKEN=your_production_token
SQUARE_PRODUCTION_APPLICATION_ID=your_production_app_id
SQUARE_PRODUCTION_LOCATION_ID=your_location_id

# Site URL for redirects
NEXT_PUBLIC_SITE_URL=http://localhost:7500
```

### Delivery Configuration

Edit `/lib/config/delivery.ts` to configure:

- Supported ZIP codes
- Delivery fees
- Business hours
- Minimum order amounts
- Estimated delivery times

## Testing

### 1. Add Products to Square

1. Log into your Square Dashboard
2. Navigate to Items > Library
3. Create test products with variations
4. Ensure products are available at your location
5. Add product images for better display

### 2. Test the Integration

1. Start the development server: `bun dev`
2. Navigate to http://localhost:7500/products
3. Add items to cart
4. Proceed to checkout
5. Fill in delivery information
6. Complete payment through Square

### 3. Square Sandbox Testing

Use Square's test card numbers for sandbox payments:

- Success: 4111 1111 1111 1111
- Decline: 4000 0000 0000 0002

## Troubleshooting

### No Products Showing

- Verify products are created in Square Dashboard
- Check products are available at the configured location
- Ensure products have at least one variation with pricing
- Check environment variables are correctly set

### Checkout Errors

- Verify delivery address is in a supported ZIP code
- Check minimum order amount is met ($25)
- Ensure checkout is during business hours
- Verify Square API credentials are valid

### Payment Link Issues

- Check NEXT_PUBLIC_SITE_URL is correctly set
- Verify Square location ID matches your account
- Ensure Square account has payments enabled

## Next Steps

### Potential Enhancements

1. **Inventory Management**: Real-time stock tracking
2. **Customer Accounts**: Save delivery addresses
3. **Order Tracking**: Display order status updates
4. **Delivery Scheduling**: Allow customers to schedule delivery times
5. **Dynamic Pricing**: Zone-based delivery fees
6. **Promotions**: Square discount codes and loyalty programs
7. **Analytics**: Track sales and popular products
8. **Notifications**: Email/SMS order confirmations

## Support

For Square API documentation, visit: https://developer.squareup.com/docs
