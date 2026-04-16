/**
 * Customer Notification Preferences Page
 *
 * Allows customers to manage their delivery alert preferences
 * Issue #55: Implement Geolocation Alerts
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NotificationPreferencesForm } from '@/components/customer/NotificationPreferencesForm';

export default async function NotificationPreferencesPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch current preferences (or create default)
  let { data: preferences } = await supabase
    .from('customer_notification_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // If no preferences exist, create default ones
  if (!preferences) {
    const { data: newPreferences } = await supabase
      .from('customer_notification_preferences')
      .insert({
        user_id: user.id,
        preferred_channel: 'both',
        email_enabled: true,
        sms_enabled: false,
        enable_eta_alerts: true,
        enable_distance_alerts: true,
        enable_arrival_alerts: true,
      })
      .select()
      .single();

    preferences = newPreferences;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notification Preferences</h1>
        <p className="text-muted-foreground">
          Manage how you receive delivery alerts and notifications
        </p>
      </div>

      {preferences && <NotificationPreferencesForm preferences={preferences} />}
    </div>
  );
}
