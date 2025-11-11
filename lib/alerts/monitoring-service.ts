/**
 * Geolocation Alert Monitoring Service
 *
 * Monitors active deliveries and triggers proximity alerts based on:
 * - Distance from driver to destination
 * - Estimated time of arrival (ETA)
 *
 * Issue #55: Implement Geolocation Alerts
 */

import { createClient } from '@/lib/supabase/server';
import { calculateDistance } from '@/lib/mapbox/client';

// Types matching database enums
export type AlertType =
  | 'eta_10_minutes'
  | 'eta_5_minutes'
  | 'arriving_now'
  | 'distance_2_miles'
  | 'distance_1_mile'
  | 'distance_half_mile';

export type NotificationChannel = 'email' | 'sms' | 'both';

export type AlertStatus = 'pending' | 'sent' | 'failed' | 'skipped';

export interface AlertThreshold {
  id: string;
  alert_type: AlertType;
  distance_miles: number | null;
  eta_minutes: number | null;
  is_enabled: boolean;
  priority: number;
  notification_channel: NotificationChannel;
}

export interface ActiveDelivery {
  id: string;
  order_id: string;
  driver_id: string;
  status: string;
  current_latitude: number | null;
  current_longitude: number | null;
  location_updated_at: string | null;
  estimated_arrival_time: string | null;
  order: {
    id: string;
    user_id: string;
    delivery_address: {
      latitude?: number;
      longitude?: number;
      formatted_address?: string;
    };
    customer_email: string | null;
  };
  driver: {
    id: string;
    name: string;
    phone_number: string | null;
  };
}

export interface AlertContext {
  delivery_id: string;
  order_id: string;
  customer_id: string;
  alert_type: AlertType;
  driver_latitude: number;
  driver_longitude: number;
  destination_latitude: number;
  destination_longitude: number;
  distance_miles: number;
  eta_minutes: number | null;
}

/**
 * Alert Monitoring Service
 * Main service for checking active deliveries and triggering alerts
 */
export class AlertMonitoringService {
  /**
   * Get all active deliveries that need monitoring
   */
  static async getActiveDeliveries(): Promise<ActiveDelivery[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('deliveries')
      .select(`
        id,
        order_id,
        driver_id,
        status,
        current_latitude,
        current_longitude,
        location_updated_at,
        estimated_arrival_time,
        order:orders!inner (
          id,
          user_id,
          delivery_address,
          customer_email
        ),
        driver:users!deliveries_driver_id_fkey (
          id,
          name,
          phone_number
        )
      `)
      .eq('status', 'in_progress')
      .not('current_latitude', 'is', null)
      .not('current_longitude', 'is', null);

    if (error) {
      console.error('Error fetching active deliveries:', error);
      return [];
    }

    return (data || []) as unknown as ActiveDelivery[];
  }

  /**
   * Get enabled alert thresholds
   */
  static async getEnabledThresholds(): Promise<AlertThreshold[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('alert_thresholds')
      .select('*')
      .eq('is_enabled', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching alert thresholds:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Check if alert was already sent (deduplication)
   */
  static async wasAlertSent(
    delivery_id: string,
    alert_type: AlertType,
    minutes_threshold: number = 5
  ): Promise<boolean> {
    const supabase = await createClient();

    const { data } = await supabase.rpc('check_alert_already_sent', {
      p_delivery_id: delivery_id,
      p_alert_type: alert_type,
      p_minutes_threshold: minutes_threshold,
    });

    return data === true;
  }

  /**
   * Calculate distance and ETA for a delivery
   */
  static calculateDeliveryMetrics(delivery: ActiveDelivery): {
    distance: number | null;
    eta_minutes: number | null;
    destination_lat: number | null;
    destination_lng: number | null;
  } {
    const driver_lat = delivery.current_latitude;
    const driver_lng = delivery.current_longitude;
    const dest_lat = delivery.order.delivery_address?.latitude;
    const dest_lng = delivery.order.delivery_address?.longitude;

    if (!driver_lat || !driver_lng || !dest_lat || !dest_lng) {
      return {
        distance: null,
        eta_minutes: null,
        destination_lat: null,
        destination_lng: null,
      };
    }

    // Calculate distance using Haversine formula
    const distance = calculateDistance(driver_lat, driver_lng, dest_lat, dest_lng);

    // Calculate ETA based on average speed (30 mph in city)
    // ETA = distance / speed * 60 (convert to minutes)
    const average_speed_mph = 30;
    const eta_minutes = Math.round((distance / average_speed_mph) * 60);

    return {
      distance,
      eta_minutes,
      destination_lat: dest_lat,
      destination_lng: dest_lng,
    };
  }

  /**
   * Determine which alerts should be triggered for a delivery
   */
  static determineAlertsToTrigger(
    delivery: ActiveDelivery,
    thresholds: AlertThreshold[]
  ): AlertContext[] {
    const metrics = this.calculateDeliveryMetrics(delivery);

    if (metrics.distance === null || metrics.destination_lat === null) {
      return [];
    }

    const alerts: AlertContext[] = [];

    for (const threshold of thresholds) {
      let shouldTrigger = false;

      // Distance-based alerts
      if (threshold.distance_miles && metrics.distance !== null) {
        shouldTrigger = metrics.distance <= threshold.distance_miles;
      }

      // ETA-based alerts
      if (threshold.eta_minutes && metrics.eta_minutes !== null) {
        shouldTrigger = metrics.eta_minutes <= threshold.eta_minutes;
      }

      if (shouldTrigger) {
        alerts.push({
          delivery_id: delivery.id,
          order_id: delivery.order_id,
          customer_id: delivery.order.user_id,
          alert_type: threshold.alert_type,
          driver_latitude: delivery.current_latitude!,
          driver_longitude: delivery.current_longitude!,
          destination_latitude: metrics.destination_lat,
          destination_longitude: metrics.destination_lng!,
          distance_miles: metrics.distance,
          eta_minutes: metrics.eta_minutes,
        });
      }
    }

    return alerts;
  }

  /**
   * Log alert to database
   */
  static async logAlert(
    context: AlertContext,
    threshold_id: string,
    status: AlertStatus = 'pending'
  ): Promise<string | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('geolocation_alerts')
      .insert({
        delivery_id: context.delivery_id,
        order_id: context.order_id,
        customer_id: context.customer_id,
        threshold_id,
        alert_type: context.alert_type,
        status,
        driver_latitude: context.driver_latitude,
        driver_longitude: context.driver_longitude,
        destination_latitude: context.destination_latitude,
        destination_longitude: context.destination_longitude,
        distance_miles: context.distance_miles,
        eta_minutes: context.eta_minutes,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error logging alert:', error);
      return null;
    }

    return data?.id || null;
  }

  /**
   * Update alert status
   */
  static async updateAlertStatus(
    alert_id: string,
    status: AlertStatus,
    channel?: NotificationChannel,
    error_message?: string
  ): Promise<void> {
    const supabase = await createClient();

    const updates: any = { status };

    if (error_message) {
      updates.error_message = error_message;
    }

    if (channel) {
      updates.sent_via = channel;

      if (channel === 'email' || channel === 'both') {
        updates.email_sent_at = new Date().toISOString();
      }

      if (channel === 'sms' || channel === 'both') {
        updates.sms_sent_at = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from('geolocation_alerts')
      .update(updates)
      .eq('id', alert_id);

    if (error) {
      console.error('Error updating alert status:', error);
    }
  }

  /**
   * Get customer notification preferences
   */
  static async getCustomerPreferences(user_id: string): Promise<{
    preferred_channel: NotificationChannel;
    email_enabled: boolean;
    sms_enabled: boolean;
    phone_number: string | null;
    enable_eta_alerts: boolean;
    enable_distance_alerts: boolean;
    enable_arrival_alerts: boolean;
  } | null> {
    const supabase = await createClient();

    const { data } = await supabase.rpc('get_customer_notification_preferences', {
      p_user_id: user_id,
    });

    return data;
  }

  /**
   * Check if customer is in quiet hours
   */
  static async isInQuietHours(user_id: string): Promise<boolean> {
    const supabase = await createClient();

    const { data } = await supabase.rpc('is_in_quiet_hours', {
      p_user_id: user_id,
    });

    return data === true;
  }

  /**
   * Main monitoring function - checks all active deliveries and triggers alerts
   */
  static async monitorDeliveries(): Promise<{
    checked: number;
    triggered: number;
    skipped: number;
    errors: number;
  }> {
    const stats = {
      checked: 0,
      triggered: 0,
      skipped: 0,
      errors: 0,
    };

    try {
      // Get active deliveries and thresholds
      const [deliveries, thresholds] = await Promise.all([
        this.getActiveDeliveries(),
        this.getEnabledThresholds(),
      ]);

      stats.checked = deliveries.length;

      if (deliveries.length === 0) {
        console.log('No active deliveries to monitor');
        return stats;
      }

      // Check each delivery
      for (const delivery of deliveries) {
        try {
          // Determine which alerts should trigger
          const alerts = this.determineAlertsToTrigger(delivery, thresholds);

          for (const alert of alerts) {
            // Check if alert was already sent
            const alreadySent = await this.wasAlertSent(
              alert.delivery_id,
              alert.alert_type
            );

            if (alreadySent) {
              stats.skipped++;
              continue;
            }

            // Check customer preferences and quiet hours
            const [preferences, inQuietHours] = await Promise.all([
              this.getCustomerPreferences(alert.customer_id),
              this.isInQuietHours(alert.customer_id),
            ]);

            if (inQuietHours) {
              console.log(`Skipping alert for customer ${alert.customer_id} - quiet hours`);
              stats.skipped++;
              continue;
            }

            // Find threshold configuration
            const threshold = thresholds.find(
              (t) => t.alert_type === alert.alert_type
            );

            if (!threshold) {
              stats.errors++;
              continue;
            }

            // Log alert
            const alert_id = await this.logAlert(alert, threshold.id, 'pending');

            if (!alert_id) {
              stats.errors++;
              continue;
            }

            stats.triggered++;

            console.log(`Triggered ${alert.alert_type} alert for delivery ${alert.delivery_id}`);
            console.log(`  Distance: ${alert.distance_miles?.toFixed(2)} miles`);
            console.log(`  ETA: ${alert.eta_minutes} minutes`);
          }
        } catch (error) {
          console.error(`Error processing delivery ${delivery.id}:`, error);
          stats.errors++;
        }
      }

      return stats;
    } catch (error) {
      console.error('Error monitoring deliveries:', error);
      stats.errors++;
      return stats;
    }
  }
}
