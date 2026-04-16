/**
 * Alert Thresholds Table Component
 *
 * Displays and allows editing of geolocation alert thresholds
 * Issue #55: Implement Geolocation Alerts
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type AlertType =
  | 'eta_10_minutes'
  | 'eta_5_minutes'
  | 'arriving_now'
  | 'distance_2_miles'
  | 'distance_1_mile'
  | 'distance_half_mile';

type NotificationChannel = 'email' | 'sms' | 'both';

interface AlertThreshold {
  id: string;
  alert_type: AlertType;
  distance_miles: number | null;
  eta_minutes: number | null;
  is_enabled: boolean;
  priority: number;
  notification_channel: NotificationChannel;
}

interface AlertThresholdsTableProps {
  thresholds: AlertThreshold[];
}

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  arriving_now: 'Driver Arriving Now',
  eta_5_minutes: '5 Minutes Away',
  eta_10_minutes: '10 Minutes Away',
  distance_half_mile: '0.5 Miles Away',
  distance_1_mile: '1 Mile Away',
  distance_2_miles: '2 Miles Away',
};

const ALERT_TYPE_DESCRIPTIONS: Record<AlertType, string> = {
  arriving_now: 'Alert when driver is arriving (< 2 minutes)',
  eta_5_minutes: 'Alert when ETA is 5 minutes or less',
  eta_10_minutes: 'Alert when ETA is 10 minutes or less',
  distance_half_mile: 'Alert when driver is within 0.5 miles',
  distance_1_mile: 'Alert when driver is within 1 mile',
  distance_2_miles: 'Alert when driver is within 2 miles',
};

export function AlertThresholdsTable({
  thresholds,
}: AlertThresholdsTableProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggleEnabled = async (
    thresholdId: string,
    currentValue: boolean
  ) => {
    setUpdating(thresholdId);

    try {
      const response = await fetch('/api/admin/alerts/thresholds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: thresholdId,
          is_enabled: !currentValue,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update threshold');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating threshold:', error);
      alert('Failed to update threshold');
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateChannel = async (
    thresholdId: string,
    channel: NotificationChannel
  ) => {
    setUpdating(thresholdId);

    try {
      const response = await fetch('/api/admin/alerts/thresholds', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: thresholdId,
          notification_channel: channel,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update channel');
      }

      router.refresh();
    } catch (error) {
      console.error('Error updating channel:', error);
      alert('Failed to update notification channel');
    } finally {
      setUpdating(null);
    }
  };

  const getAlertTypeIcon = (alertType: AlertType): string => {
    if (alertType === 'arriving_now') return '📍';
    if (alertType.startsWith('eta_')) return '⏱️';
    return '🚗';
  };

  const getAlertTypeColor = (alertType: AlertType): string => {
    if (alertType === 'arriving_now' || alertType === 'distance_half_mile')
      return 'text-success';
    if (alertType === 'eta_5_minutes' || alertType === 'distance_1_mile')
      return 'text-warning';
    return 'text-info';
  };

  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-xl font-semibold">Alert Thresholds</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configure when customers receive proximity alerts
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Alert Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Threshold
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Priority
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Channel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {thresholds.map((threshold) => (
              <tr key={threshold.id} className="hover:bg-accent">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {getAlertTypeIcon(threshold.alert_type)}
                    </span>
                    <div>
                      <div
                        className={`font-medium ${getAlertTypeColor(threshold.alert_type)}`}
                      >
                        {ALERT_TYPE_LABELS[threshold.alert_type]}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {ALERT_TYPE_DESCRIPTIONS[threshold.alert_type]}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {threshold.distance_miles && (
                    <span className="text-sm font-medium">
                      {threshold.distance_miles} miles
                    </span>
                  )}
                  {threshold.eta_minutes && (
                    <span className="text-sm font-medium">
                      {threshold.eta_minutes} minutes
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-foreground">
                    {threshold.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={threshold.notification_channel}
                    onChange={(e) =>
                      handleUpdateChannel(
                        threshold.id,
                        e.target.value as NotificationChannel
                      )
                    }
                    disabled={updating === threshold.id}
                    className="text-sm border border-border rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand"
                  >
                    <option value="email">Email Only</option>
                    <option value="sms">SMS Only</option>
                    <option value="both">Email + SMS</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() =>
                      handleToggleEnabled(threshold.id, threshold.is_enabled)
                    }
                    disabled={updating === threshold.id}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      threshold.is_enabled
                        ? 'bg-success/10 text-success hover:bg-success/20'
                        : 'bg-secondary text-foreground hover:bg-muted'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {updating === threshold.id
                      ? 'Updating...'
                      : threshold.is_enabled
                        ? 'Enabled'
                        : 'Disabled'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 bg-muted border-t border-border">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> Alerts are checked every minute via cron job.
          Customers will receive alerts based on their notification preferences
          and quiet hours settings.
        </p>
      </div>
    </div>
  );
}
