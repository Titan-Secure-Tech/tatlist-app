/**
 * Admin Alert Configuration Page
 *
 * Manage geolocation alert thresholds and settings
 * Issue #55: Implement Geolocation Alerts
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AlertThresholdsTable } from '@/components/admin/AlertThresholdsTable';
import { AlertStats } from '@/components/admin/AlertStats';

export default async function AlertsPage() {
  const supabase = await createClient();

  // Check if user is authenticated and is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'admin') {
    redirect('/');
  }

  // Fetch alert thresholds
  const { data: thresholds } = await supabase
    .from('alert_thresholds')
    .select('*')
    .order('priority', { ascending: false });

  // Fetch alert statistics (last 24 hours)
  const twentyFourHoursAgo = new Date();
  twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

  const { data: alertStats } = await supabase
    .from('geolocation_alerts')
    .select('status, alert_type')
    .gte('triggered_at', twentyFourHoursAgo.toISOString());

  const stats = {
    total: alertStats?.length || 0,
    sent: alertStats?.filter((a) => a.status === 'sent').length || 0,
    failed: alertStats?.filter((a) => a.status === 'failed').length || 0,
    pending: alertStats?.filter((a) => a.status === 'pending').length || 0,
    skipped: alertStats?.filter((a) => a.status === 'skipped').length || 0,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Geolocation Alerts</h1>
        <p className="text-gray-600">
          Configure delivery proximity alerts and notification thresholds
        </p>
      </div>

      <AlertStats stats={stats} />

      <div className="mt-8">
        <AlertThresholdsTable thresholds={thresholds || []} />
      </div>
    </div>
  );
}
