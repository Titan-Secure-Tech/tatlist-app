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
          <p className="text-muted-foreground">Create and manage delivery routes</p>
        </div>

        <Link
          href="/admin/routes/create"
          className="px-6 py-3 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground font-medium rounded-md transition-colors"
        >
          + Create Route
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-background border border-border rounded-xl p-6">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Total Routes
          </div>
          <div className="text-3xl font-bold text-foreground">
            {routes?.length || 0}
          </div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <div className="text-sm font-medium text-muted-foreground mb-2">Active</div>
          <div className="text-3xl font-bold text-success">
            {routes?.filter((r: any) => r.status === 'active').length || 0}
          </div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <div className="text-sm font-medium text-muted-foreground mb-2">Draft</div>
          <div className="text-3xl font-bold text-brand">
            {routes?.filter((r: any) => r.status === 'draft').length || 0}
          </div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <div className="text-sm font-medium text-muted-foreground mb-2">
            Completed
          </div>
          <div className="text-3xl font-bold text-muted-foreground">
            {routes?.filter((r: any) => r.status === 'completed').length || 0}
          </div>
        </div>
      </div>

      {/* Routes Table */}
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Driver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Stops
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-border">
              {routesWithStats.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-muted-foreground mb-2">
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
                    <p className="text-muted-foreground">
                      No routes yet. Create your first optimized route!
                    </p>
                  </td>
                </tr>
              ) : (
                routesWithStats.map((route: any) => (
                  <tr key={route.id} className="hover:bg-accent">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-foreground">
                          {route.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(route.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">
                        {route.driver?.name || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">
                        {route.total_stops}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground">
                        {route.total_distance_miles?.toFixed(1)} mi
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-muted rounded-full h-2 mr-3">
                          <div
                            className="bg-success h-2 rounded-full"
                            style={{
                              width: `${route.completion_percentage}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {route.completion_percentage}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          route.status === 'active'
                            ? 'bg-success/20 text-success'
                            : route.status === 'draft'
                              ? 'bg-info/20 text-info'
                              : route.status === 'completed'
                                ? 'bg-secondary text-foreground'
                                : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {route.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/routes/${route.id}`}
                        className="text-brand hover:text-brand text-sm font-medium"
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
