# Notification Service

Unified notification system for sending automated SMS and Email notifications to customers.

## Overview

The notification service automatically sends updates to customers based on their contact preferences (SMS, Email, or both) set in their user profile.

## Features

- **Multi-channel notifications**: SMS via Twilio and Email via Mailgun
- **Respects user preferences**: Honors contact_preference field from users table
- **Automatic triggering**: Order status changes automatically trigger notifications
- **Type-safe**: Full TypeScript support with proper status enum types
- **Error handling**: Graceful degradation if services are unavailable

## Usage

### Automatic Order Status Notifications

Order status notifications are automatically sent when an order status is updated via the API:

```typescript
// POST /api/orders/[orderId]/status
// The API route automatically sends notifications in the background
```

### Manual Notifications

You can also manually send notifications:

```typescript
import { notificationService } from '@/lib/notifications/service'

// Send order status update
await notificationService.sendOrderStatusNotification({
  orderId: 'order-uuid',
  userId: 'user-uuid',
  status: 'out_for_delivery',
  message: 'Your driver is 5 minutes away',
  estimatedTime: '5 minutes'
})

// Send order confirmation
await notificationService.sendOrderConfirmation({
  orderId: 'order-uuid',
  userId: 'user-uuid',
  items: [...],
  subtotal: 100,
  deliveryFee: 5,
  tax: 8.5,
  total: 113.5,
  deliveryAddress: {...}
})
```

## Configuration

### Environment Variables

**Twilio (SMS):**

```bash
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

**Mailgun (Email):**

```bash
MAILGUN_BASE_URL=https://api.mailgun.net
MAILGUN_DOMAIN=your-domain.com
MAILGUN_SENDING_KEY=your-private-api-key
```

### User Contact Preferences

Users can set their contact preference in their profile:

- `sms`: Receive SMS notifications only (requires phone number)
- `email`: Receive email notifications only (default)
- `both`: Receive both SMS and email notifications

## Order Status Notifications

The system sends notifications for all order status changes:

| Status             | Email | SMS | Description            |
| ------------------ | ----- | --- | ---------------------- |
| `pending`          | ✓     | ✓   | Order received         |
| `processing`       | ✓     | ✓   | Order being prepared   |
| `ready_for_pickup` | ✓     | ✓   | Order ready            |
| `out_for_delivery` | ✓     | ✓   | Driver en route        |
| `delivered`        | ✓     | ✓   | Successfully delivered |
| `completed`        | ✓     | ✓   | Order complete         |
| `cancelled`        | ✓     | ✓   | Order cancelled        |

## SMS Message Format

SMS messages are concise and include:

- Customer name
- Order number (first 8 characters)
- Status update
- Optional custom message
- Brand signature

Example:

```
Hi John, Order #A1B2C3D4: Your order is out for delivery! - Tatlist
```

## Email Templates

Email notifications use React Email templates with:

- Full order details
- Color-coded status badges
- Status-specific information boxes
- Consistent branding (black/white design)
- Mobile-responsive layout

## Error Handling

The service handles errors gracefully:

- **Missing credentials**: Logs warning but doesn't throw error
- **SMS without phone**: Logs warning and skips SMS
- **API failures**: Logs error but returns false (doesn't crash)
- **Background execution**: Notifications run async and don't block API responses

## Testing

### Test Notifications Locally

```bash
# Start development server
bun dev

# Update order status (triggers automatic notification)
curl -X PATCH http://localhost:7500/api/orders/[orderId]/status \
  -H "Content-Type: application/json" \
  -d '{"status": "out_for_delivery", "notes": "Driver is on the way"}'
```

### Test Email Templates

```bash
# Preview email template
open http://localhost:7500/api/email/preview?template=order-status&status=delivered
```

## Integration Points

1. **Order Status API** (`app/api/orders/[orderId]/status/route.ts`)
   - Automatically triggers notifications on PATCH requests
   - Runs notification sending in background
   - Logs success/failure

2. **Email Service** (`lib/email/mailgun.ts`)
   - Handles email rendering and delivery
   - Uses React Email templates
   - Provides specialized methods for different email types

3. **User Profile** (`database: users table`)
   - Stores contact_preference
   - Stores phone number for SMS
   - Stores email for email notifications

## Future Enhancements

- Push notifications for mobile app
- WhatsApp integration
- Notification history/logs
- Delivery time predictions
- Real-time driver location links in SMS
- Scheduled notifications
- Notification preferences per notification type
