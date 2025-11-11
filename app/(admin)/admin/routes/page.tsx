/**
 * Admin Routes Management Page
 *
 * View and manage all delivery routes
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminRoutesPage() {
  const supabase = await createClient();

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

  // Fetch all routes
  const { data: routes } = await supabase
    .from('routes')
    .select(
      `
      *,
      driver:users!routes_driver_id_fkey (
        id,
        name,
        email
      ),
      route_stops (
        id,
        stop_number,
        status
      )
    `
    )
    .order('created_at', { ascending: false });

  // Calculate stats
  const routesWithStats = (routes || []).map((route: any) => {
    const stops = route.route_stops || [];
    const total_stops = stops.length;
    const completed_stops = stops.filter(
      (s: any) => s.status === 'completed'
    ).length;
    const completion_percentage =
      total_stops > 0 ? (completed_stops / total_stops) * 100 : 0;

    return {
      ...route,
      total_stops,
      completed_stops,
      completion_percentage: Math.round(completion_percentage),
    };
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Route Management</h1>
          <p className="text-gray-600">Create and manage delivery routes</p>
        </div>

        <Link
          href="/admin/routes/create"
          className="px-6 py-3 bg-black text-white font-medium rounded-md hover:bg-gray-800 transition-colors"
        >
          + Create Route
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Total Routes
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {routes?.length || 0}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Active</div>
          <div className="text-3xl font-bold text-green-600">
            {routes?.filter((r: any) => r.status === 'active').length || 0}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">Draft</div>
          <div className="text-3xl font-bold text-blue-600">
            {routes?.filter((r: any) => r.status === 'draft').length || 0}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-sm font-medium text-gray-600 mb-2">
            Completed
          </div>
          <div className="text-3xl font-bold text-gray-600">
            {routes?.filter((r: any) => r.status === 'completed').length || 0}
          </div>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stops
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routesWithStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-2">
                      <svg
                        className="w-12 h-12 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600">
                      No routes yet. Create your first optimized route!
                    </p>
                  </td>
                </tr>
              ) : (
                routesWithStats.map((route: any) => (
                  <tr key={route.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {route.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(route.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {route.driver?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {route.total_stops}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {route.total_distance_miles?.toFixed(1)} mi
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${route.completion_percentage}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {route.completion_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          route.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : route.status === 'draft'
                              ? 'bg-blue-100 text-blue-800'
                              : route.status === 'completed'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {route.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/routes/${route.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
