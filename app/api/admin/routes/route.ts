/**
 * Admin Routes API
 *
 * List and manage delivery routes
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/admin/routes
 *
 * List all routes with optional filters
 * Query params: ?status=active&driver_id=xxx
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

    // Check admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const driver_id = searchParams.get('driver_id');

    // Build query
    let query = supabase
      .from('routes')
      .select(`
        *,
        driver:users!routes_driver_id_fkey (
          id,
          name,
          email,
          phone_number
        ),
        route_stops (
          id,
          stop_number,
          status,
          delivery_id
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }

    if (driver_id) {
      query = query.eq('driver_id', driver_id);
    }

    const { data: routes, error } = await query;

    if (error) {
      console.error('Error fetching routes:', error);
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

      return {
        ...route,
        total_stops,
        completed_stops,
        completion_percentage: Math.round(completion_percentage),
      };
    });

    return NextResponse.json({ data: routesWithStats });
  } catch (error) {
    console.error('Error in GET /api/admin/routes:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
