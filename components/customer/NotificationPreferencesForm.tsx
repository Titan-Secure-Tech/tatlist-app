/**
 * Notification Preferences Form Component
 *
 * Form for customers to manage their delivery alert preferences
 * Issue #55: Implement Geolocation Alerts
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type NotificationChannel = 'email' | 'sms' | 'both';

interface NotificationPreferences {
  id: string;
  user_id: string;
  preferred_channel: NotificationChannel;
  email_enabled: boolean;
  sms_enabled: boolean;
  phone_number: string | null;
  phone_verified: boolean;
  enable_eta_alerts: boolean;
  enable_distance_alerts: boolean;
  enable_arrival_alerts: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

interface NotificationPreferencesFormProps {
  preferences: NotificationPreferences;
}

export function NotificationPreferencesForm({
  preferences,
}: NotificationPreferencesFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState(preferences);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/customer/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }

      setMessage({
        type: 'success',
        text: 'Preferences updated successfully!',
      });

      router.refresh();
    } catch (error) {
      console.error('Error updating preferences:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update preferences. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneVerification = async () => {
    // TODO: Implement phone verification flow
    alert('Phone verification coming soon!');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Notification Channels */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Notification Channels</h2>

        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.email_enabled}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email_enabled: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">
                Email Notifications
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Receive delivery alerts via email
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.sms_enabled}
                onChange={(e) =>
                  setFormData({ ...formData, sms_enabled: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">
                SMS Notifications
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Receive delivery alerts via text message
            </p>

            {formData.sms_enabled && (
              <div className="mt-4 ml-7 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={formData.phone_number || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone_number: e.target.value,
                        })
                      }
                      placeholder="+1 (555) 123-4567"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {formData.phone_number && !formData.phone_verified && (
                      <button
                        type="button"
                        onClick={handlePhoneVerification}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                  {formData.phone_verified && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ Phone number verified
                    </p>
                  )}
                  {formData.phone_number && !formData.phone_verified && (
                    <p className="text-sm text-orange-600 mt-1">
                      ⚠ Phone number not verified. SMS alerts will not be sent.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alert Types */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Alert Types</h2>
        <p className="text-sm text-gray-600 mb-4">
          Choose which delivery alerts you want to receive
        </p>

        <div className="space-y-4">
          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.enable_eta_alerts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enable_eta_alerts: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">
                ⏱️ ETA Alerts
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Notify when driver is 10 minutes, 5 minutes away
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.enable_distance_alerts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enable_distance_alerts: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">
                🚗 Distance Alerts
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Notify when driver is 2 miles, 1 mile, 0.5 miles away
            </p>
          </div>

          <div>
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.enable_arrival_alerts}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    enable_arrival_alerts: e.target.checked,
                  })
                }
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-900">
                📍 Arrival Alert
              </span>
            </label>
            <p className="text-sm text-gray-500 mt-1 ml-7">
              Notify when driver is arriving now (urgent)
            </p>
          </div>
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Quiet Hours</h2>
        <p className="text-sm text-gray-600 mb-4">
          Set hours when you don&apos;t want to receive notifications
        </p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={formData.quiet_hours_start || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quiet_hours_start: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={formData.quiet_hours_end || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  quiet_hours_end: e.target.value || null,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {formData.quiet_hours_start && formData.quiet_hours_end && (
          <p className="text-sm text-gray-600 mt-2">
            No notifications between {formData.quiet_hours_start} and{' '}
            {formData.quiet_hours_end}
          </p>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
  );
}
