# Email Templates

This directory contains transactional email templates built with [React Email](https://react.email).

## Overview

All email templates are built using React Email components and follow the platform's black and white aesthetic with consistent styling.

### Templates

1. **Order Confirmation** (`templates/OrderConfirmation.tsx`)
   - Sent when an order is successfully placed
   - Displays order items, totals, delivery address
   - Includes estimated delivery time

2. **Order Status Update** (`templates/OrderStatusUpdate.tsx`)
   - Sent when order status changes
   - Supports: preparing, ready, out_for_delivery, delivered, cancelled
   - Dynamic status badges with color coding

3. **Contact Form** (`templates/ContactForm.tsx`)
   - Sent when someone submits the contact form
   - Delivered to info@tatlist.com
   - Includes action reminder for 24-hour response

### Base Layout

All templates extend `BaseLayout.tsx` which provides:

- Consistent header with TATLIST branding
- Professional footer with contact information
- Responsive design optimized for email clients
- Black and white color scheme matching the platform

## Development

### Preview Templates

You can preview any email template by visiting:

```
http://localhost:7500/api/email/preview?template={template-name}
```

Available templates:

- `order-confirmation` - Order confirmation email
- `order-status` - Order status update (add `&status=delivered` to test different statuses)
- `contact-form` - Contact form submission

Example:

```
http://localhost:7500/api/email/preview?template=order-status&status=delivered
```

### Test Email Sending

Test actual email delivery using the existing test endpoint:

```bash
# Test order confirmation
curl "http://localhost:7500/api/test-email?email=your@email.com&type=confirmation"

# Test status update
curl "http://localhost:7500/api/test-email?email=your@email.com&type=status&status=delivered"
```

### Using the Mailgun Service

The `MailgunService` class provides methods for sending emails:

```typescript
import { mailgunService } from '@/lib/email/mailgun'

// Send order confirmation
await mailgunService.sendOrderConfirmation('customer@email.com', {
  orderId: 'order-123',
  customerName: 'John Doe',
  items: [...],
  subtotal: 100,
  deliveryFee: 5,
  tax: 8.5,
  total: 113.5,
  deliveryAddress: {...}
})

// Send status update
await mailgunService.sendOrderStatusUpdate('customer@email.com', {
  orderId: 'order-123',
  customerName: 'John Doe',
  status: 'delivered',
  message: 'Optional message',
  estimatedTime: '30 minutes'
})
```

## Styling Guidelines

- **Colors**: Black (#000000), White (#ffffff), and grays
- **Typography**: System font stack for maximum compatibility
- **Spacing**: Consistent padding and margins
- **Borders**: Subtle borders using #e5e5e5
- **Highlights**: Color-coded status badges and info boxes

## Email Client Compatibility

Templates are tested and optimized for:

- Gmail
- Apple Mail
- Outlook
- Yahoo Mail
- Mobile email clients

## Adding New Templates

1. Create a new component in `templates/`
2. Extend `BaseLayout` for consistency
3. Import and use in `mailgun.ts`
4. Add preview route in `/api/email/preview`
5. Update this README

## Environment Variables

Required for email sending:

```bash
MAILGUN_BASE_URL=https://api.mailgun.net
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SENDING_KEY=your-private-api-key
```
