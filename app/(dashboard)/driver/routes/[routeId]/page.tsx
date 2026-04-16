/**
 * Driver Route Detail Page
 *
 * Shows route map and stop list with navigation
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RouteMap } from '@/components/driver/RouteMap';
import { RouteStopsList } from '@/components/driver/RouteStopsList';
import { NavigationButtons } from '@/components/driver/NavigationButtons';

export default async function DriverRouteDetailPage({
  params,
}: {
  params: { routeId: string };
}) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch route details
  const { data: routeData } = await supabase
    .from('routes')
    .select(
      `
      *,
      driver:users!routes_driver_id_fkey (
        id,
        name
      ),
      route_stops (
        *,
        delivery:deliveries (
          id,
          order_id,
          order:orders (
            order_number,
            customer_email,
            user:users (
              name,
              phone_number
            )
          )
        )
      )
    `
    )
    .eq('id', params.routeId)
    .single();

  if (!routeData || routeData.driver_id !== user.id) {
    redirect('/driver/routes');
  }

  // Sort stops by stop_number
  const stops = (routeData.route_stops || []).sort(
    (a: any, b: any) => a.stop_number - b.stop_number
  );

  // Calculate stats
  const total_stops = stops.length;
  const completed_stops = stops.filter(
    (s: any) => s.status === 'completed'
  ).length;
  const completion_percentage =
    total_stops > 0 ? (completed_stops / total_stops) * 100 : 0;

  // Find current stop
  const current_stop =
    stops.find((s: any) => s.status === 'enroute') ||
    stops.find((s: any) => s.status === 'pending');

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{routeData.name}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {total_stops} stops • {routeData.total_distance_miles?.toFixed(1)}{' '}
                miles • {routeData.total_duration_minutes} min
              </p>
            </div>
            <span
              className={`px-4 py-2 text-sm font-medium rounded-full ${
                routeData.status === 'active'
                  ? 'bg-success/20 text-success'
                  : 'bg-secondary text-foreground'
              }`}
            >
              {routeData.status.charAt(0).toUpperCase() +
                routeData.status.slice(1)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">
                {completed_stops} / {total_stops} completed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-success h-3 rounded-full transition-all"
                style={{ width: `${completion_percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map View */}
          <div className="lg:sticky lg:top-6 h-fit">
            <RouteMap
              route={routeData}
              stops={stops}
              currentStop={current_stop}
            />

            {/* Navigation Buttons */}
            <NavigationButtons
              routeId={params.routeId}
              stops={stops}
              className="mt-4"
            />
          </div>

          {/* Stops List */}
          <div>
            <RouteStopsList
              routeId={params.routeId}
              stops={stops}
              currentStop={current_stop}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
