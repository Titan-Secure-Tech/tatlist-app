# Phone Verification System

A complete phone verification system using Twilio SMS for verifying customer phone numbers before enabling SMS notifications.

## Features

- **SMS Verification Codes**: 6-digit codes sent via Twilio
- **Code Expiry**: Codes expire after 10 minutes
- **Rate Limiting**: Max 3 verification requests per minute per phone number
- **Attempt Limiting**: Max 3 verification attempts per code
- **Auto-Cleanup**: Expired codes and rate limits are automatically cleaned up
- **User-Friendly UI**: Countdown timer, resend functionality, and clear error messages

## Architecture

### Components

1. **PhoneVerificationService** (`lib/verification/phone-verification.ts`)
   - Generates and stores verification codes in-memory
   - Handles rate limiting and expiry
   - Validates phone numbers

2. **API Routes**
   - `POST /api/verification/send-code` - Sends verification code via SMS
   - `POST /api/verification/verify-code` - Verifies code and updates database

3. **UI Component** (`components/customer/NotificationPreferencesForm.tsx`)
   - Phone number input with validation
   - Verification code input with countdown timer
   - Success/error messaging
   - Resend functionality

### Flow

1. User enters phone number in notification preferences
2. User clicks "Send Code"
3. System sends 6-digit code via Twilio SMS
4. User enters code within 10 minutes
5. System verifies code and marks phone as verified in database
6. User can now receive SMS notifications

## Configuration

### Required Environment Variables

```bash
# Twilio Configuration (for SMS delivery)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number  # Format: +1XXXXXXXXXX
```

### Database Schema

The `customer_notification_preferences` table includes:

- `phone_number` (TEXT) - E.164 formatted phone number
- `phone_verified` (BOOLEAN) - Verification status

## Usage

### For Customers

1. Navigate to `/customer/settings/notifications`
2. Enable SMS notifications
3. Enter your phone number
4. Click "Send Code"
5. Check your SMS for the 6-digit code
6. Enter the code and click "Verify"
7. Your phone is now verified for SMS alerts!

### For Developers

#### Send Verification Code

```typescript
import { PhoneVerificationService } from '@/lib/verification/phone-verification'

const result = await PhoneVerificationService.sendVerificationCode('+15551234567', userId)

if (result.success) {
  console.log('Code sent! Expires at:', result.expiresAt)
} else {
  console.error('Error:', result.error)
}
```

#### Verify Code

```typescript
const result = await PhoneVerificationService.verifyCode('+15551234567', '123456')

if (result.success) {
  // Update database to mark phone as verified
} else {
  console.error('Error:', result.error)
}
```

## Security Features

### Rate Limiting

- Max 3 verification requests per minute per phone number
- Prevents SMS spam and abuse
- Automatic cleanup of expired rate limits

### Code Expiry

- Codes expire after 10 minutes
- Expired codes are automatically removed
- Users can request new codes after expiry

### Attempt Limiting

- Max 3 verification attempts per code
- Prevents brute force attacks
- Users must request new code after max attempts

### Phone Number Formatting

- Automatic E.164 formatting
- Validates phone number format
- Supports US numbers with or without country code

## Testing

### Development Testing

```bash
# Start development server
bun dev

# Navigate to notification preferences
open http://localhost:7500/customer/settings/notifications
```

### Manual Testing Checklist

- [ ] Enter phone number and click "Send Code"
- [ ] Verify SMS received with 6-digit code
- [ ] Enter correct code and verify success
- [ ] Test countdown timer (10 minutes)
- [ ] Test resend functionality
- [ ] Test invalid code (should show error)
- [ ] Test expired code (wait 10 minutes)
- [ ] Test rate limiting (send 4+ codes in 1 minute)
- [ ] Test max attempts (enter wrong code 3+ times)

## Production Considerations

### In-Memory Storage

The current implementation uses in-memory storage for verification codes. This works well for:

- Single-server deployments
- Low to moderate verification volume
- Serverless functions (each invocation is isolated)

For high-scale production or multi-server deployments, consider:

- **Redis**: Store codes in Redis for distributed systems
- **Database**: Store codes in a dedicated table with TTL
- **Managed Service**: Use Twilio Verify API for enterprise-grade verification

### Migration to Redis (Optional)

```typescript
// Example Redis implementation
import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})

// Store code with expiry
await redis.setex(
  `verification:${phoneNumber}`,
  600, // 10 minutes
  JSON.stringify({ code, attempts: 0 })
)

// Retrieve code
const data = await redis.get(`verification:${phoneNumber}`)
```

## Troubleshooting

### SMS Not Received

1. Check Twilio credentials are correct
2. Verify phone number is in E.164 format
3. Check Twilio account balance
4. Verify phone number can receive SMS
5. Check Twilio logs for delivery status

### Rate Limited

- Wait 1 minute before requesting another code
- Error message will indicate rate limiting

### Code Expired

- Request a new code using "Resend code" button
- Codes expire after 10 minutes

### Invalid Code

- Double-check the code from SMS
- Code is case-sensitive (numbers only)
- After 3 failed attempts, request new code

## Future Enhancements

- [ ] Support for international phone numbers
- [ ] Voice call verification as fallback
- [ ] Twilio Verify API integration
- [ ] SMS delivery status tracking
- [ ] Analytics and monitoring
- [ ] Redis storage for distributed systems
- [ ] Configurable code length and expiry
- [ ] Custom SMS templates per use case
