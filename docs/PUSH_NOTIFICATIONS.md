# Push Notifications

This application supports browser-based push notifications for order status updates, promotions, and general updates from Tatlist.

## Features

- 📱 **Cross-Platform Support**: Works on iOS Safari, Android Chrome, and desktop browsers
- 🔔 **Three Notification Types**:
  - `order_status` - Order updates (shipped, delivered, etc.)
  - `promotion` - Special offers and deals
  - `update` - General updates from Tatlist
- 🔒 **Secure**: Uses VAPID keys for secure push delivery
- 📊 **Tracking**: Logs all notifications sent with success/failure status
- 🎯 **Targeted**: Send to specific users or broadcast to all subscribers

## Browser Compatibility

| Browser      | Platform            | Support         |
| ------------ | ------------------- | --------------- |
| Safari 16.4+ | iOS                 | ✅ Full Support |
| Safari 16+   | macOS               | ✅ Full Support |
| Chrome 42+   | Android             | ✅ Full Support |
| Chrome 42+   | Windows/macOS/Linux | ✅ Full Support |
| Firefox 44+  | All                 | ✅ Full Support |
| Edge 79+     | All                 | ✅ Full Support |

## Setup

### 1. Environment Variables

Add the following to your `.env.local`:

```bash
# Web Push VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:your-email@tatlist.com
```

To generate new VAPID keys:

```bash
bunx web-push generate-vapid-keys
```

### 2. Database Migration

Run the push notifications migration:

```bash
bunx supabase db push
```

This creates:

- `push_subscriptions` table - Stores user subscription data
- `push_notifications_log` table - Tracks all sent notifications
- RLS policies for user data access
- Indexes for performance

### 3. Service Worker

The service worker (`app/sw.ts`) handles:

- Push event listening
- Notification display
- Click handling with smart routing
- Offline support

## Usage

### User Subscription

Users can enable/disable notifications from their profile page:

1. Navigate to `/profile`
2. Toggle "Push Notifications" setting
3. Grant browser permission when prompted

The `PushNotificationToggle` component handles all subscription logic.

### Sending Notifications

#### From Server-Side Code

```typescript
import {
  sendOrderStatusNotification,
  sendPromotionNotification,
  sendUpdateNotification,
} from '@/lib/push-notifications'

// Order status update
await sendOrderStatusNotification(
  userId,
  orderId,
  'Shipped',
  'Your order has been shipped and is on the way!'
)

// Promotion
await sendPromotionNotification(
  undefined, // Send to all subscribed users
  '🎉 Flash Sale!',
  '50% off all tattoo inks this weekend only!'
)

// General update
await sendUpdateNotification(
  [userId1, userId2],
  'New Products',
  'Check out our new line of tattoo machines!'
)
```

#### Direct API Call

```typescript
const response = await fetch('/api/push/send', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userIds: ['user-id-1', 'user-id-2'], // Optional, omit for all users
    title: 'Notification Title',
    body: 'Notification message',
    type: 'order_status', // or 'promotion', 'update'
    url: '/orders/123', // Optional deep link
    data: {
      // Optional custom data
      orderId: '123',
      customField: 'value',
    },
  }),
})
```

## Notification Types

### Order Status (`order_status`)

- **When**: Order state changes (placed, processing, shipped, delivered)
- **Default URL**: `/orders/{orderId}`
- **Requires Interaction**: Yes (stays visible until user interacts)
- **Example**:
  ```json
  {
    "title": "Order Shipped",
    "body": "Your order #12345 has been shipped!",
    "type": "order_status",
    "url": "/orders/12345"
  }
  ```

### Promotion (`promotion`)

- **When**: Special offers, sales, discounts
- **Default URL**: `/promotions`
- **Requires Interaction**: No
- **Example**:
  ```json
  {
    "title": "🎁 Limited Time Offer",
    "body": "Get 30% off all supplies this week!",
    "type": "promotion",
    "url": "/promotions/summer-sale"
  }
  ```

### Update (`update`)

- **When**: General news, announcements, new features
- **Default URL**: `/`
- **Requires Interaction**: No
- **Example**:
  ```json
  {
    "title": "New Products Available",
    "body": "Check out our latest tattoo equipment!",
    "type": "update",
    "url": "/products"
  }
  ```

## Database Schema

### push_subscriptions

Stores user push subscription endpoints:

| Column     | Type      | Description           |
| ---------- | --------- | --------------------- |
| id         | UUID      | Primary key           |
| user_id    | UUID      | References auth.users |
| endpoint   | TEXT      | Push service endpoint |
| p256dh     | TEXT      | Encryption key        |
| auth       | TEXT      | Authentication secret |
| user_agent | TEXT      | Browser/device info   |
| created_at | TIMESTAMP | Subscription date     |
| updated_at | TIMESTAMP | Last update           |

### push_notifications_log

Tracks all notifications sent:

| Column            | Type      | Description             |
| ----------------- | --------- | ----------------------- |
| id                | UUID      | Primary key             |
| user_id           | UUID      | Recipient user          |
| subscription_id   | UUID      | Subscription used       |
| notification_type | TEXT      | Type of notification    |
| title             | TEXT      | Notification title      |
| body              | TEXT      | Notification message    |
| data              | JSONB     | Custom data             |
| sent_at           | TIMESTAMP | Send timestamp          |
| status            | TEXT      | sent/failed/delivered   |
| error_message     | TEXT      | Error details if failed |

## Testing

### Local Testing

1. Start the development server:

   ```bash
   bun dev
   ```

2. Open the app in a supported browser
3. Navigate to `/profile`
4. Enable push notifications
5. Test sending a notification:
   ```bash
   curl -X POST http://localhost:7500/api/push/send \
     -H "Content-Type: application/json" \
     -d '{
       "title": "Test Notification",
       "body": "Testing push notifications!",
       "type": "update"
     }'
   ```

### iOS Safari Testing

1. Add the PWA to home screen (required for push on iOS)
2. Grant notification permission
3. Send a test notification
4. Notification appears even when app is closed

### Android Chrome Testing

1. Open the app in Chrome
2. Grant notification permission
3. Send a test notification
4. Notification appears in system tray

## Troubleshooting

### Notifications Not Appearing

1. **Check browser support**: Use Chrome 42+, Safari 16.4+, or Firefox 44+
2. **Verify permission**: Ensure user granted notification permission
3. **Check VAPID keys**: Confirm environment variables are set correctly
4. **Service worker**: Verify service worker is registered and active
5. **iOS requirements**: Must be installed as PWA (Add to Home Screen)

### Subscription Failures

- **VAPID mismatch**: Public/private keys don't match
- **Browser permission denied**: User must grant permission
- **Network issues**: Check API route accessibility

### Database Issues

```bash
# Check if tables exist
bunx supabase db pull

# Reset and reapply migrations
bunx supabase db reset
```

## Best Practices

1. **Don't spam**: Limit notification frequency
2. **Relevant content**: Only send notifications users care about
3. **Clear actions**: Include actionable URLs
4. **Test thoroughly**: Test on all target platforms
5. **Handle failures**: Monitor notification logs for delivery issues
6. **Respect permissions**: Don't ask for permission on first load
7. **Provide value**: Notifications should benefit the user

## Security

- VAPID keys authenticate your application
- Private key must remain secret
- RLS policies prevent unauthorized access
- Subscription endpoints are unique per user/device
- Failed subscriptions are automatically removed

## Monitoring

Query notification logs:

```sql
-- Recent notifications
SELECT * FROM push_notifications_log
ORDER BY sent_at DESC
LIMIT 100;

-- Failed notifications
SELECT * FROM push_notifications_log
WHERE status = 'failed'
ORDER BY sent_at DESC;

-- Notification stats by type
SELECT
  notification_type,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as successful,
  SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed
FROM push_notifications_log
GROUP BY notification_type;
```

## Future Enhancements

- [ ] Notification scheduling
- [ ] User notification preferences (by type)
- [ ] Rich notifications with images
- [ ] Notification history in UI
- [ ] A/B testing for notification content
- [ ] Analytics and engagement tracking
