/**
 * Unified Notification Service
 *
 * Orchestrates sending delivery alerts via email and SMS
 * Issue #55: Implement Geolocation Alerts
 */

import { render } from '@react-email/components';
import { MailgunService } from '@/lib/email/mailgun';
import { TwilioService } from '@/lib/sms/twilio';
import { DeliveryAlert } from '@/lib/email/templates/DeliveryAlert';
import {
  AlertMonitoringService,
  AlertContext,
  NotificationChannel,
} from './monitoring-service';
import { createClient } from '@/lib/supabase/server';

export interface DeliveryData {
  order_id: string;
  customer_email: string;
  customer_name: string;
  customer_phone?: string | null;
  driver_name?: string;
  driver_phone?: string | null;
}

export interface NotificationResult {
  alert_id: string;
  email_sent: boolean;
  sms_sent: boolean;
  errors: string[];
}

/**
 * Unified Notification Service
 * Sends alerts via email and/or SMS based on customer preferences
 */
export class NotificationService {
  /**
   * Get delivery data for alert
   */
  private static async getDeliveryData(
    delivery_id: string
  ): Promise<DeliveryData | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        id,
        order:orders!inner (
          id,
          customer_email,
          user:users!inner (
            id,
            name,
            phone_number
          )
        ),
        driver:users!deliveries_driver_id_fkey (
          id,
          name,
          phone_number
        )
      `)
      .eq('id', delivery_id)
      .single();

    if (error || !data) {
      console.error('Error fetching delivery data:', error);
      return null;
    }

    const order = data.order as any;
    const driver = data.driver as any;

    return {
      order_id: order.id,
      customer_email: order.customer_email,
      customer_name: order.user.name,
      customer_phone: order.user.phone_number,
      driver_name: driver?.name,
      driver_phone: driver?.phone_number,
    };
  }

  /**
   * Generate tracking URL for customer
   */
  private static generateTrackingUrl(order_id: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:7500';
    return `${baseUrl}/customer/orders/${order_id}/tracking`;
  }

  /**
   * Send email notification
   */
  private static async sendEmailAlert(
    context: AlertContext,
    deliveryData: DeliveryData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const trackingUrl = this.generateTrackingUrl(context.order_id);

      // Render email template
      const emailHtml = await render(
        DeliveryAlert({
          orderId: context.order_id,
          customerName: deliveryData.customer_name,
          alertType: context.alert_type,
          distanceMiles: context.distance_miles,
          etaMinutes: context.eta_minutes || undefined,
          driverName: deliveryData.driver_name,
          driverPhone: deliveryData.driver_phone || undefined,
          trackingUrl,
        })
      );

      // Send via Mailgun
      await MailgunService.sendEmail({
        to: deliveryData.customer_email,
        subject: this.getEmailSubject(context.alert_type, context.order_id),
        html: emailHtml,
      });

      return { success: true };
    } catch (error) {
      console.error('Error sending email alert:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error',
      };
    }
  }

  /**
   * Send SMS notification
   */
  private static async sendSMSAlert(
    context: AlertContext,
    deliveryData: DeliveryData
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!deliveryData.customer_phone) {
        return {
          success: false,
          error: 'No phone number available for customer',
        };
      }

      const trackingUrl = this.generateTrackingUrl(context.order_id);

      const result = await TwilioService.sendDeliveryAlert({
        to: deliveryData.customer_phone,
        orderId: context.order_id,
        alertType: context.alert_type,
        distanceMiles: context.distance_miles,
        etaMinutes: context.eta_minutes || undefined,
        driverName: deliveryData.driver_name,
        trackingUrl,
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Error sending SMS alert:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown SMS error',
      };
    }
  }

  /**
   * Get email subject line based on alert type
   */
  private static getEmailSubject(
    alertType: string,
    orderId: string
  ): string {
    const orderNumber = orderId.slice(0, 8).toUpperCase();

    switch (alertType) {
      case 'arriving_now':
        return `🚚 Your order #${orderNumber} is arriving now!`;
      case 'eta_5_minutes':
        return `⏱️ Your order #${orderNumber} arrives in 5 minutes`;
      case 'eta_10_minutes':
        return `🚗 Your order #${orderNumber} arrives in 10 minutes`;
      case 'distance_half_mile':
        return `📍 Your driver is 0.5 miles away - Order #${orderNumber}`;
      case 'distance_1_mile':
        return `🚗 Your driver is 1 mile away - Order #${orderNumber}`;
      case 'distance_2_miles':
        return `🚗 Your driver is 2 miles away - Order #${orderNumber}`;
      default:
        return `Your order #${orderNumber} is on the way`;
    }
  }

  /**
   * Send delivery alert via appropriate channel(s)
   */
  static async sendDeliveryAlert(
    context: AlertContext,
    threshold_id: string
  ): Promise<NotificationResult | null> {
    const errors: string[] = [];
    let email_sent = false;
    let sms_sent = false;

    try {
      // Get delivery data
      const deliveryData = await this.getDeliveryData(context.delivery_id);

      if (!deliveryData) {
        errors.push('Could not fetch delivery data');
        return null;
      }

      // Get customer preferences
      const preferences = await AlertMonitoringService.getCustomerPreferences(
        context.customer_id
      );

      if (!preferences) {
        errors.push('Could not fetch customer preferences');
        return null;
      }

      // Log alert (pending state)
      const alert_id = await AlertMonitoringService.logAlert(
        context,
        threshold_id,
        'pending'
      );

      if (!alert_id) {
        errors.push('Could not log alert');
        return null;
      }

      // Determine which channels to use
      const send_email =
        preferences.email_enabled &&
        (preferences.preferred_channel === 'email' ||
          preferences.preferred_channel === 'both');

      const send_sms =
        preferences.sms_enabled &&
        (preferences.preferred_channel === 'sms' ||
          preferences.preferred_channel === 'both');

      // Send email if enabled
      if (send_email) {
        const emailResult = await this.sendEmailAlert(context, deliveryData);
        email_sent = emailResult.success;

        if (!emailResult.success && emailResult.error) {
          errors.push(`Email: ${emailResult.error}`);
        }
      }

      // Send SMS if enabled
      if (send_sms) {
        const smsResult = await this.sendSMSAlert(context, deliveryData);
        sms_sent = smsResult.success;

        if (!smsResult.success && smsResult.error) {
          errors.push(`SMS: ${smsResult.error}`);
        }
      }

      // Determine overall status
      const status =
        email_sent || sms_sent
          ? 'sent'
          : errors.length > 0
            ? 'failed'
            : 'skipped';

      // Determine channel used
      let channel: NotificationChannel | undefined;
      if (email_sent && sms_sent) {
        channel = 'both';
      } else if (email_sent) {
        channel = 'email';
      } else if (sms_sent) {
        channel = 'sms';
      }

      // Update alert status
      await AlertMonitoringService.updateAlertStatus(
        alert_id,
        status,
        channel,
        errors.length > 0 ? errors.join('; ') : undefined
      );

      return {
        alert_id,
        email_sent,
        sms_sent,
        errors,
      };
    } catch (error) {
      console.error('Error sending delivery alert:', error);
      errors.push(
        error instanceof Error ? error.message : 'Unknown error'
      );

      return null;
    }
  }

  /**
   * Process all pending alerts
   * Called by the monitoring cron job
   */
  static async processAlerts(): Promise<{
    processed: number;
    sent: number;
    failed: number;
    skipped: number;
  }> {
    const stats = {
      processed: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    try {
      // Run the monitoring service
      const monitoringStats = await AlertMonitoringService.monitorDeliveries();

      stats.processed = monitoringStats.checked;

      // Get all pending alerts
      const supabase = await createClient();

      const { data: pendingAlerts, error } = await supabase
        .from('geolocation_alerts')
        .select('*')
        .eq('status', 'pending')
        .order('triggered_at', { ascending: true })
        .limit(50); // Process in batches

      if (error || !pendingAlerts) {
        console.error('Error fetching pending alerts:', error);
        return stats;
      }

      // Process each pending alert
      for (const alert of pendingAlerts) {
        const context: AlertContext = {
          delivery_id: alert.delivery_id,
          order_id: alert.order_id,
          customer_id: alert.customer_id,
          alert_type: alert.alert_type,
          driver_latitude: alert.driver_latitude,
          driver_longitude: alert.driver_longitude,
          destination_latitude: alert.destination_latitude,
          destination_longitude: alert.destination_longitude,
          distance_miles: alert.distance_miles,
          eta_minutes: alert.eta_minutes,
        };

        const result = await this.sendDeliveryAlert(
          context,
          alert.threshold_id
        );

        if (result) {
          if (result.email_sent || result.sms_sent) {
            stats.sent++;
          } else if (result.errors.length > 0) {
            stats.failed++;
          } else {
            stats.skipped++;
          }
        } else {
          stats.failed++;
        }

        // Small delay between alerts
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      return stats;
    } catch (error) {
      console.error('Error processing alerts:', error);
      return stats;
    }
  }
}
