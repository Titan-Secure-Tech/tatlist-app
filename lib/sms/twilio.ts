/**
 * Twilio SMS Service
 *
 * Handles sending SMS notifications for delivery alerts
 * Issue #55: Implement Geolocation Alerts
 */

import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client (lazy initialization)
let twilioClient: Twilio | null = null;

function getTwilioClient(): Twilio {
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
  }

  if (!twilioClient) {
    twilioClient = new Twilio(accountSid, authToken);
  }

  return twilioClient;
}

export interface SMSDeliveryAlert {
  to: string;
  orderId: string;
  alertType:
    | 'eta_10_minutes'
    | 'eta_5_minutes'
    | 'arriving_now'
    | 'distance_2_miles'
    | 'distance_1_mile'
    | 'distance_half_mile';
  distanceMiles?: number;
  etaMinutes?: number;
  driverName?: string;
  trackingUrl?: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Twilio SMS Service
 */
export class TwilioService {
  /**
   * Format SMS message for delivery alert
   */
  private static formatAlertMessage(alert: SMSDeliveryAlert): string {
    const orderNumber = alert.orderId.slice(0, 8).toUpperCase();

    let message = '';

    switch (alert.alertType) {
      case 'arriving_now':
        message = `🚚 Your Tatlist order #${orderNumber} is arriving NOW! Please be ready to receive your delivery.`;
        break;

      case 'eta_5_minutes':
        message = `⏱️ Your driver will arrive in 5 minutes with order #${orderNumber}. Please ensure someone is available.`;
        break;

      case 'eta_10_minutes':
        message = `🚗 Your Tatlist order #${orderNumber} will arrive in about 10 minutes!`;
        break;

      case 'distance_half_mile':
        message = `📍 Your driver is 0.5 miles away with order #${orderNumber}. Almost there!`;
        break;

      case 'distance_1_mile':
        message = `🚗 Your driver is 1 mile away with order #${orderNumber}. Arriving soon!`;
        break;

      case 'distance_2_miles':
        message = `🚗 Your Tatlist order #${orderNumber} is on the way! Driver is 2 miles away.`;
        break;

      default:
        message = `Your Tatlist order #${orderNumber} is on the way!`;
    }

    // Add driver name if available
    if (alert.driverName) {
      message += ` Driver: ${alert.driverName}.`;
    }

    // Add tracking link if available
    if (alert.trackingUrl) {
      message += ` Track: ${alert.trackingUrl}`;
    }

    return message;
  }

  /**
   * Validate phone number format
   */
  private static validatePhoneNumber(phoneNumber: string): boolean {
    // Basic validation: should start with + and have 10-15 digits
    const phoneRegex = /^\+\d{10,15}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number to E.164 format (+1XXXXXXXXXX)
   */
  private static formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // If it's a US number without country code, add +1
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }

    // Add + prefix if not present
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Send delivery alert SMS
   */
  static async sendDeliveryAlert(alert: SMSDeliveryAlert): Promise<SMSResult> {
    try {
      if (!fromNumber) {
        throw new Error('TWILIO_PHONE_NUMBER environment variable not configured');
      }

      // Validate and format phone number
      const formattedPhone = this.formatPhoneNumber(alert.to);

      if (!this.validatePhoneNumber(formattedPhone)) {
        return {
          success: false,
          error: `Invalid phone number format: ${alert.to}`,
        };
      }

      // Get Twilio client
      const client = getTwilioClient();

      // Format message
      const body = this.formatAlertMessage(alert);

      // Send SMS
      const message = await client.messages.create({
        body,
        from: fromNumber,
        to: formattedPhone,
      });

      console.log(`SMS sent successfully: ${message.sid}`);

      return {
        success: true,
        messageId: message.sid,
      };
    } catch (error) {
      console.error('Error sending SMS:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending SMS',
      };
    }
  }

  /**
   * Send bulk delivery alerts (batch processing)
   */
  static async sendBulkDeliveryAlerts(
    alerts: SMSDeliveryAlert[]
  ): Promise<{
    sent: number;
    failed: number;
    results: SMSResult[];
  }> {
    let sent = 0;
    let failed = 0;
    const results: SMSResult[] = [];

    for (const alert of alerts) {
      const result = await this.sendDeliveryAlert(alert);
      results.push(result);

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Add small delay between messages to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    return { sent, failed, results };
  }

  /**
   * Verify phone number (check if it can receive SMS)
   */
  static async verifyPhoneNumber(phoneNumber: string): Promise<{
    valid: boolean;
    formatted?: string;
    error?: string;
  }> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      if (!this.validatePhoneNumber(formattedPhone)) {
        return {
          valid: false,
          error: 'Invalid phone number format',
        };
      }

      const client = getTwilioClient();

      // Use Twilio Lookup API to verify the number
      const lookup = await client.lookups.v2.phoneNumbers(formattedPhone).fetch();

      return {
        valid: lookup.valid || false,
        formatted: formattedPhone,
      };
    } catch (error) {
      console.error('Error verifying phone number:', error);

      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Error verifying phone number',
      };
    }
  }

  /**
   * Get SMS delivery status
   */
  static async getMessageStatus(messageId: string): Promise<{
    status: string;
    error?: string;
  }> {
    try {
      const client = getTwilioClient();
      const message = await client.messages(messageId).fetch();

      return {
        status: message.status,
      };
    } catch (error) {
      console.error('Error fetching message status:', error);

      return {
        status: 'unknown',
        error: error instanceof Error ? error.message : 'Error fetching status',
      };
    }
  }
}
