/**
 * Driver Routes List Page
 *
 * Shows all assigned routes for the driver
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DriverRoutesPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch driver's routes
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/driver/routes?status=active`,
    {
      headers: {
        Cookie: `sb-access-token=${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
    }
  );

  const { data: routes } = await response.json();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Routes</h1>
        <p className="text-gray-600">View and manage your delivery routes</p>
      </div>

      {!routes || routes.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Active Routes
          </h3>
          <p className="text-gray-600 mb-4">
            You don&apos;t have any active routes assigned yet.
          </p>
          <Link
            href="/driver"
            className="inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
          >
            View Deliveries
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {routes.map((route: any) => (
            <Link
              key={route.id}
              href={`/driver/routes/${route.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{route.name}</h3>
                  <p className="text-sm text-gray-600">
                    {route.total_stops} stops •{' '}
                    {route.total_distance_miles?.toFixed(1)} miles •{' '}
                    {route.total_duration_minutes} min
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    route.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : route.status === 'draft'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {route.status.charAt(0).toUpperCase() + route.status.slice(1)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">
                    {route.completed_stops} / {route.total_stops} stops
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all"
                    style={{ width: `${route.completion_percentage}%` }}
                  />
                </div>
              </div>

              {/* Current Stop */}
              {route.current_stop_number && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <svg
                    className="w-5 h-5 mr-2 text-orange-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Current: Stop #{route.current_stop_number}
                </div>
              )}

              {/* View Route Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center text-blue-600 font-medium">
                  View Route Details
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
