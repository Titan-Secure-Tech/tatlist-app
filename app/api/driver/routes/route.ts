/**
 * Driver Routes API
 *
 * List driver's assigned routes
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/driver/routes
 *
 * Get driver's assigned routes
 * Query params: ?status=active
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('routes')
      .select(`
        *,
        route_stops (
          id,
          stop_number,
          status,
          address,
          delivery_id,
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
      `)
      .eq('driver_id', user.id)
      .order('created_at', { ascending: false });

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    } else {
      // Default: show active and draft routes only
      query = query.in('status', ['draft', 'active']);
    }

    const { data: routes, error } = await query;

    if (error) {
      console.error('Error fetching driver routes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch routes' },
        { status: 500 }
      );
    }

    // Calculate completion stats for each route
    const routesWithStats = routes.map((route: any) => {
      const stops = route.route_stops || [];
      const total_stops = stops.length;
      const completed_stops = stops.filter(
        (s: any) => s.status === 'completed'
      ).length;
      const completion_percentage =
        total_stops > 0 ? (completed_stops / total_stops) * 100 : 0;

      // Find current/next stop
      const current_stop =
        stops.find((s: any) => s.status === 'enroute') ||
        stops.find((s: any) => s.status === 'pending');

      return {
        ...route,
        total_stops,
        completed_stops,
        pending_stops: total_stops - completed_stops,
        completion_percentage: Math.round(completion_percentage),
        current_stop_number: current_stop?.stop_number || null,
      };
    });

    return NextResponse.json({ data: routesWithStats });
  } catch (error) {
    console.error('Error in GET /api/driver/routes:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
