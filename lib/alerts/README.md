# Geolocation Alerts System

Intelligent real-time delivery notification system that alerts customers when their driver is approaching.

**Issue**: [#55 - Implement Geolocation Alerts](https://github.com/jbwashington/tatlist-app/issues/55)

## Overview

The Geolocation Alerts system monitors active deliveries in real-time and sends proximity notifications to customers via email and/or SMS. Alerts are triggered based on configurable distance and ETA thresholds.

## Features

- ✅ **Real-Time Monitoring**: Tracks all active deliveries every minute
- ✅ **Distance-Based Alerts**: Notify at 2 miles, 1 mile, 0.5 miles
- ✅ **ETA-Based Alerts**: Notify at 10 minutes, 5 minutes, arriving now
- ✅ **Multi-Channel**: Email (Mailgun) + SMS (Twilio) support
- ✅ **Customer Preferences**: Configurable notification channels and quiet hours
- ✅ **Alert Deduplication**: Prevents spam with intelligent throttling
- ✅ **Admin Dashboard**: Configure thresholds and view statistics
- ✅ **Automated Monitoring**: Vercel cron job runs every minute

## Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Cron Job (Every Minute)                   │
│                  /api/alerts/monitor                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│            Alert Monitoring Service                          │
│      /lib/alerts/monitoring-service.ts                       │
│  • Get active deliveries (status: in_progress)               │
│  • Calculate distance & ETA                                  │
│  • Check alert thresholds                                    │
│  • Prevent duplicates                                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│           Notification Service                               │
│      /lib/alerts/notification-service.ts                     │
│  • Get customer preferences                                  │
│  • Check quiet hours                                         │
│  • Route to appropriate channel(s)                           │
└───────────┬───────────────────────────┬─────────────────────┘
            │                           │
            ▼                           ▼
    ┌───────────────┐         ┌────────────────┐
    │ Email Service │         │  SMS Service   │
    │   (Mailgun)   │         │   (Twilio)     │
    └───────────────┘         └────────────────┘
```

### Key Files

| File | Purpose |
|------|---------|
| `monitoring-service.ts` | Core logic for tracking deliveries and determining alert triggers |
| `notification-service.ts` | Orchestrates sending notifications via email/SMS |
| `../../email/mailgun.ts` | Email delivery via Mailgun |
| `../../sms/twilio.ts` | SMS delivery via Twilio |
| `../../email/templates/DeliveryAlert.tsx` | React Email template for delivery alerts |
| `/api/alerts/monitor/route.ts` | API endpoint called by cron job |
| `/api/admin/alerts/thresholds/route.ts` | Admin API for managing thresholds |
| `/api/customer/notification-preferences/route.ts` | Customer API for preferences |

## Database Schema

### `alert_thresholds`

Configurable rules for triggering alerts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `alert_type` | ENUM | Type of alert (eta_10_minutes, distance_2_miles, etc.) |
| `distance_miles` | DECIMAL | Distance threshold in miles (for distance-based alerts) |
| `eta_minutes` | INTEGER | ETA threshold in minutes (for time-based alerts) |
| `is_enabled` | BOOLEAN | Whether this alert type is active |
| `priority` | INTEGER | Alert priority (higher = more important) |
| `notification_channel` | ENUM | Channel to use (email, sms, both) |

**Default Thresholds:**

```sql
INSERT INTO alert_thresholds (alert_type, distance_miles, eta_minutes, is_enabled, priority) VALUES
  ('eta_10_minutes', NULL, 10, true, 3),
  ('eta_5_minutes', NULL, 5, true, 2),
  ('arriving_now', NULL, 2, true, 1),
  ('distance_2_miles', 2.0, NULL, true, 3),
  ('distance_1_mile', 1.0, NULL, true, 2),
  ('distance_half_mile', 0.5, NULL, true, 1);
```

### `geolocation_alerts`

Log of all alerts sent to customers.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `delivery_id` | UUID | Reference to delivery |
| `order_id` | UUID | Reference to order |
| `customer_id` | UUID | Reference to customer |
| `threshold_id` | UUID | Reference to threshold that triggered |
| `alert_type` | ENUM | Type of alert sent |
| `status` | ENUM | Status (pending, sent, failed, skipped) |
| `driver_latitude` | DECIMAL | Driver's location at trigger time |
| `driver_longitude` | DECIMAL | Driver's location at trigger time |
| `destination_latitude` | DECIMAL | Delivery destination |
| `destination_longitude` | DECIMAL | Delivery destination |
| `distance_miles` | DECIMAL | Calculated distance at trigger time |
| `eta_minutes` | INTEGER | Calculated ETA at trigger time |
| `sent_via` | ENUM | Channel used (email, sms, both) |
| `email_sent_at` | TIMESTAMPTZ | When email was sent |
| `sms_sent_at` | TIMESTAMPTZ | When SMS was sent |
| `error_message` | TEXT | Error details if failed |
| `triggered_at` | TIMESTAMPTZ | When alert was triggered |

### `customer_notification_preferences`

User preferences for delivery notifications.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Reference to user |
| `preferred_channel` | ENUM | Preferred channel (email, sms, both) |
| `email_enabled` | BOOLEAN | Enable email notifications |
| `sms_enabled` | BOOLEAN | Enable SMS notifications |
| `phone_number` | TEXT | Phone number for SMS |
| `phone_verified` | BOOLEAN | Whether phone is verified |
| `enable_eta_alerts` | BOOLEAN | Enable ETA-based alerts |
| `enable_distance_alerts` | BOOLEAN | Enable distance-based alerts |
| `enable_arrival_alerts` | BOOLEAN | Enable arrival alerts |
| `quiet_hours_start` | TIME | Start of quiet hours |
| `quiet_hours_end` | TIME | End of quiet hours |

## Alert Types

### ETA-Based Alerts

Triggered when the estimated time of arrival (ETA) reaches a threshold.

- **`eta_10_minutes`**: Driver will arrive in ~10 minutes
- **`eta_5_minutes`**: Driver will arrive in ~5 minutes
- **`arriving_now`**: Driver is arriving now (< 2 minutes)

**ETA Calculation:**
```typescript
// Average city driving speed: 30 mph
const eta_minutes = (distance_miles / 30) * 60;
```

### Distance-Based Alerts

Triggered when the straight-line distance from driver to destination reaches a threshold.

- **`distance_2_miles`**: Driver is 2 miles away
- **`distance_1_mile`**: Driver is 1 mile away
- **`distance_half_mile`**: Driver is 0.5 miles away

**Distance Calculation:**
```typescript
// Haversine formula for great-circle distance
const distance = calculateDistance(
  driver_lat, driver_lng,
  dest_lat, dest_lng
); // Returns miles
```

## Alert Flow

### 1. Driver Location Update

```typescript
// Driver app updates location via /api/driver/deliveries/[id]/location
POST /api/driver/deliveries/abc123/location
{
  latitude: 27.9506,
  longitude: -82.4572,
  accuracy: 10,
  speed: 30,
  heading: 180
}
```

### 2. Cron Job Monitoring

```typescript
// Runs every minute via Vercel cron
POST /api/alerts/monitor
Authorization: Bearer <CRON_SECRET>

// Response:
{
  success: true,
  stats: {
    processed: 5,    // Active deliveries checked
    sent: 3,         // Alerts sent
    failed: 0,       // Failed alerts
    skipped: 2       // Skipped (quiet hours, duplicates)
  }
}
```

### 3. Alert Determination

For each active delivery:

```typescript
// Get delivery with driver location
const delivery = await getActiveDelivery(delivery_id);

// Calculate metrics
const metrics = {
  distance: calculateDistance(driver_lat, driver_lng, dest_lat, dest_lng),
  eta_minutes: (distance / 30) * 60
};

// Check against thresholds
for (const threshold of thresholds) {
  if (threshold.distance_miles && metrics.distance <= threshold.distance_miles) {
    // Trigger distance alert
  }
  if (threshold.eta_minutes && metrics.eta_minutes <= threshold.eta_minutes) {
    // Trigger ETA alert
  }
}
```

### 4. Deduplication Check

```typescript
// Prevent duplicate alerts within 5 minutes
const alreadySent = await wasAlertSent(
  delivery_id,
  alert_type,
  minutes_threshold: 5
);

if (alreadySent) {
  return; // Skip this alert
}
```

### 5. Customer Preferences Check

```typescript
// Get customer preferences
const prefs = await getCustomerPreferences(customer_id);

// Check quiet hours
const inQuietHours = await isInQuietHours(customer_id);
if (inQuietHours) {
  return; // Skip alert during quiet hours
}

// Determine channel(s)
const send_email = prefs.email_enabled &&
  (prefs.preferred_channel === 'email' || prefs.preferred_channel === 'both');

const send_sms = prefs.sms_enabled &&
  (prefs.preferred_channel === 'sms' || prefs.preferred_channel === 'both');
```

### 6. Send Notifications

```typescript
// Send email
if (send_email) {
  await MailgunService.sendEmail({
    to: customer_email,
    subject: "Your driver is 10 minutes away!",
    html: renderDeliveryAlertTemplate(...)
  });
}

// Send SMS
if (send_sms) {
  await TwilioService.sendDeliveryAlert({
    to: customer_phone,
    orderId: order_id,
    alertType: 'eta_10_minutes',
    distanceMiles: 2.5,
    etaMinutes: 10,
    trackingUrl: `${baseUrl}/customer/orders/${order_id}/tracking`
  });
}
```

### 7. Log Alert

```typescript
await logAlert({
  delivery_id,
  order_id,
  customer_id,
  alert_type: 'eta_10_minutes',
  status: 'sent',
  sent_via: 'both',
  distance_miles: 2.5,
  eta_minutes: 10,
  ...
});
```

## Configuration

### Environment Variables

```bash
# Twilio (SMS Notifications)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+15551234567

# Mailgun (Email Notifications)
MAILGUN_BASE_URL=https://api.mailgun.net
MAILGUN_DOMAIN=mg.tatlist.com
MAILGUN_SENDING_KEY=key-xxxxxxxxxxxxxxxxxxxxxxxx

# Cron Job Security
CRON_SECRET=your_random_secret_key_here
```

### Vercel Cron Job

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/alerts/monitor",
      "schedule": "* * * * *"  // Every minute
    }
  ]
}
```

## Usage

### Admin: Configure Alert Thresholds

```typescript
// Visit /admin/alerts
// - View alert statistics (last 24 hours)
// - Enable/disable specific alert types
// - Change notification channels
// - See real-time delivery counts
```

### Customer: Manage Notification Preferences

```typescript
// Visit /customer/settings/notifications
// - Choose notification channel (email, SMS, both)
// - Enable/disable specific alert types
// - Set quiet hours
// - Add/verify phone number for SMS
```

### Developer: Test Alerts Locally

```bash
# 1. Start dev server
bun dev

# 2. Trigger monitoring manually (GET endpoint in dev mode)
curl http://localhost:7500/api/alerts/monitor

# 3. Check logs for alert activity
# Look for: "[Alert Monitor] Monitoring complete: { processed: X, sent: Y }"
```

### Developer: Test SMS Delivery

```typescript
// Test Twilio SMS service directly
import { TwilioService } from '@/lib/sms/twilio';

const result = await TwilioService.sendDeliveryAlert({
  to: '+15551234567',
  orderId: 'abc123',
  alertType: 'eta_10_minutes',
  distanceMiles: 2.5,
  etaMinutes: 10,
  driverName: 'John Doe',
  trackingUrl: 'https://tatlist.com/customer/orders/abc123/tracking'
});

console.log(result); // { success: true, messageId: 'SMxxxxxxxxx' }
```

## Troubleshooting

### Alerts Not Sending

1. **Check Cron Job**: Ensure Vercel cron is configured and running
   ```bash
   # Check Vercel logs
   vercel logs --follow
   ```

2. **Verify Environment Variables**: Ensure all required env vars are set
   ```bash
   # In Vercel Dashboard or CLI
   vercel env ls
   ```

3. **Check Database**: Verify alert thresholds are enabled
   ```sql
   SELECT * FROM alert_thresholds WHERE is_enabled = true;
   ```

4. **Review Logs**: Check API logs for errors
   ```bash
   # Local development
   grep "Alert Monitor" logs/*.log
   ```

### SMS Not Delivering

1. **Verify Twilio Credentials**: Check account SID and auth token
2. **Check Phone Number Format**: Must be E.164 format (+1XXXXXXXXXX)
3. **Verify Phone Number**: Use Twilio Lookup API
   ```typescript
   const result = await TwilioService.verifyPhoneNumber('+15551234567');
   console.log(result); // { valid: true, formatted: '+15551234567' }
   ```
4. **Check Customer Preferences**: Ensure SMS is enabled and phone verified

### Duplicate Alerts

- The system prevents duplicate alerts within 5 minutes by default
- Check `geolocation_alerts` table for recent alerts:
  ```sql
  SELECT * FROM geolocation_alerts
  WHERE delivery_id = 'xxx'
  AND alert_type = 'eta_10_minutes'
  AND triggered_at > now() - interval '5 minutes';
  ```

### Quiet Hours Not Working

- Verify customer has set quiet hours in preferences
- Check the `is_in_quiet_hours()` PostgreSQL function
- Test manually:
  ```sql
  SELECT is_in_quiet_hours('user_id_here');
  ```

## Performance Considerations

### Database Indexes

The migration includes optimized indexes for fast queries:

```sql
-- Fast lookup of alerts by delivery, customer, type
CREATE INDEX idx_geolocation_alerts_delivery ON geolocation_alerts(delivery_id);
CREATE INDEX idx_geolocation_alerts_customer ON geolocation_alerts(customer_id);
CREATE INDEX idx_geolocation_alerts_type ON geolocation_alerts(alert_type);

-- Deduplication query optimization
CREATE INDEX idx_geolocation_alerts_dedup ON geolocation_alerts(
  delivery_id, alert_type, triggered_at DESC
);
```

### Cron Job Execution

- Runs every minute (max 60 executions/hour)
- Max execution time: 60 seconds
- Processes up to 50 pending alerts per run
- Adds 200ms delay between notifications to avoid rate limits

### Rate Limiting

- **Mailgun**: 100 emails/hour (free tier)
- **Twilio**: Varies by account, typically 1 SMS/second
- System adds delays between bulk operations

## Future Enhancements

- [ ] Phone number verification via SMS OTP
- [ ] Support for WhatsApp notifications (Twilio)
- [ ] Push notifications for mobile app
- [ ] Traffic-aware ETA calculations (Google Maps Directions API)
- [ ] Machine learning for optimal alert timing
- [ ] A/B testing for alert messaging
- [ ] Analytics dashboard for alert effectiveness
- [ ] Customizable alert messages per customer

## Related Issues

- [#51 - Real-time Customer GPS Tracking](https://github.com/jbwashington/tatlist-app/issues/51)
- [#49 - Automated SMS/Email Notifications](https://github.com/jbwashington/tatlist-app/issues/49)
- [#50 - Driver Dashboard with Active Deliveries](https://github.com/jbwashington/tatlist-app/issues/50)

## Support

For questions or issues with the geolocation alerts system:

1. Check this README
2. Review the code documentation in service files
3. Check GitHub issue #55
4. Contact the development team

---

**Last Updated**: November 2025
**Status**: ✅ Production Ready
**Migration**: `supabase/migrations/20251110070000_add_geolocation_alerts.sql`
