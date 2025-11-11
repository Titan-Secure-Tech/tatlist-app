/**
 * Admin Route Detail Page
 *
 * View and manage individual route
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { RouteMap } from '@/components/driver/RouteMap';
import { AdminRouteActions } from '@/components/admin/AdminRouteActions';
import Link from 'next/link';

export default async function AdminRouteDetailPage({
  params,
}: {
  params: Promise<{ routeId: string }>;
}) {
  const supabase = await createClient();
  const { routeId } = await params;

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check admin role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'admin') {
    redirect('/');
  }

  // Fetch route with stops
  const { data: routeData } = await supabase
    .from('routes')
    .select(
      `
      *,
      driver:users!routes_driver_id_fkey (
        id,
        name,
        email,
        phone_number
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
    .eq('id', routeId)
    .single();

  if (!routeData) {
    redirect('/admin/routes');
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/admin/routes"
            className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block"
          >
            ← Back to Routes
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{routeData.name}</h1>
              <p className="text-sm text-gray-600 mt-1">
                Driver: {routeData.driver?.name || 'Unassigned'} • {total_stops}{' '}
                stops • {routeData.total_distance_miles?.toFixed(1)} miles •{' '}
                {routeData.total_duration_minutes} min
              </p>
            </div>

            <AdminRouteActions route={routeData} />
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">
                {completed_stops} / {total_stops} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full transition-all"
                style={{ width: `${completion_percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Route Info Cards */}
          <div className="lg:col-span-3 grid md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Status
              </div>
              <div className="text-2xl font-bold">
                <span
                  className={`px-3 py-1 text-base font-medium rounded-full ${
                    routeData.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : routeData.status === 'draft'
                        ? 'bg-blue-100 text-blue-800'
                        : routeData.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                  }`}
                >
                  {routeData.status}
                </span>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Total Distance
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {routeData.total_distance_miles?.toFixed(1)} mi
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Est. Duration
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {routeData.total_duration_minutes} min
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm font-medium text-gray-600 mb-1">
                Completion
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {completion_percentage}%
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-2">
            <RouteMap route={routeData} stops={stops} />
          </div>

          {/* Stops List */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">Route Stops</h2>
              </div>

              <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                {stops.map((stop: any) => {
                  const order = stop.delivery?.order;
                  const customer = order?.user;

                  return (
                    <div key={stop.id} className="p-4">
                      <div className="flex items-start gap-3">
                        {/* Stop Number */}
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            stop.status === 'completed'
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {stop.stop_number}
                        </div>

                        {/* Stop Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 mb-1">
                            {(stop.address as any)?.formatted_address ||
                              'Address'}
                          </p>

                          {customer && (
                            <p className="text-xs text-gray-600 mb-1">
                              {customer.name}
                            </p>
                          )}

                          {order && (
                            <p className="text-xs text-gray-500">
                              Order #{order.order_number}
                            </p>
                          )}

                          <span
                            className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                              stop.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : stop.status === 'enroute'
                                  ? 'bg-orange-100 text-orange-800'
                                  : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {stop.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
