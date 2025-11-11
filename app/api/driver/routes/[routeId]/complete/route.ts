/**
 * Driver Route Completion API
 *
 * Complete entire route
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/driver/routes/[routeId]/complete
 *
 * Mark route as completed and calculate performance metrics
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string }> }
) {
  try {
    const supabase = await createClient();
    const { routeId } = await params;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get route
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*, route_stops(*)')
      .eq('id', routeId)
      .single();

    if (routeError || !route) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // Verify driver owns this route
    if (route.driver_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Verify all stops are completed or skipped
    const stops = route.route_stops || [];
    const incomplete_stops = stops.filter(
      (s: any) => s.status !== 'completed' && s.status !== 'skipped'
    );

    if (incomplete_stops.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot complete route with pending stops',
          incomplete_stops: incomplete_stops.map((s: any) => ({
            stop_number: s.stop_number,
            status: s.status,
          })),
        },
        { status: 400 }
      );
    }

    // Calculate performance metrics
    const completed_stops = stops.filter((s: any) => s.status === 'completed');
    const total_time_spent = stops.reduce(
      (sum: number, s: any) => sum + (s.time_spent_minutes || 0),
      0
    );

    const actual_start_time = route.actual_start_time
      ? new Date(route.actual_start_time)
      : new Date();
    const actual_end_time = new Date();
    const total_route_duration = Math.round(
      (actual_end_time.getTime() - actual_start_time.getTime()) / 1000 / 60
    ); // minutes

    // Calculate actual total distance (would need to sum leg distances if tracked)
    const actual_distance = route.total_distance_miles; // Use estimated for now

    // Update route
    const { error: updateError } = await supabase
      .from('routes')
      .update({
        status: 'completed',
        actual_end_time: actual_end_time.toISOString(),
      })
      .eq('id', routeId);

    if (updateError) {
      throw new Error('Failed to complete route');
    }

    // Build performance metrics
    const performance_metrics = {
      stops_completed: completed_stops.length,
      stops_skipped: stops.length - completed_stops.length,
      total_stops: stops.length,
      completion_rate:
        (completed_stops.length / stops.length) * 100,

      // Time metrics
      estimated_duration_minutes: route.total_duration_minutes,
      actual_duration_minutes: total_route_duration,
      time_at_stops_minutes: total_time_spent,
      driving_time_minutes: total_route_duration - total_time_spent,

      // Distance metrics
      total_distance_miles: actual_distance,

      // Efficiency
      on_time: total_route_duration <= route.total_duration_minutes * 1.1, // Within 10%
      time_variance_percentage:
        ((total_route_duration - route.total_duration_minutes) /
          route.total_duration_minutes) *
        100,
    };

    return NextResponse.json({
      success: true,
      message: 'Route completed successfully',
      performance_metrics,
    });
  } catch (error) {
    console.error(
      'Error in POST /api/driver/routes/[routeId]/complete:',
      error
    );

    return NextResponse.json(
      {
        error: 'Failed to complete route',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
