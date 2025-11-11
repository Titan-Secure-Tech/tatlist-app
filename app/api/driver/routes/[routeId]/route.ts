/**
 * Driver Single Route API
 *
 * Get route details with navigation
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RouteOptimizationService } from '@/lib/routing/optimization-service';

/**
 * Generate navigation URL for Google Maps / Apple Maps / Waze
 */
function generateNavigationUrl(
  stops: any[],
  app: 'google' | 'apple' | 'waze' = 'google'
): string {
  if (stops.length === 0) return '';

  // Order stops by stop_number
  const orderedStops = [...stops].sort((a, b) => a.stop_number - b.stop_number);

  if (app === 'google') {
    // Google Maps URL with waypoints
    const origin = orderedStops[0];
    const destination = orderedStops[orderedStops.length - 1];
    const waypoints = orderedStops
      .slice(1, -1)
      .map((stop) => `${stop.latitude},${stop.longitude}`)
      .join('|');

    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`;

    if (waypoints) {
      url += `&waypoints=${waypoints}`;
    }

    url += '&travelmode=driving';
    return url;
  }

  if (app === 'apple') {
    // Apple Maps URL (only supports single destination)
    const firstStop = orderedStops[0];
    return `http://maps.apple.com/?daddr=${firstStop.latitude},${firstStop.longitude}&dirflg=d`;
  }

  if (app === 'waze') {
    // Waze URL (only supports single destination)
    const firstStop = orderedStops[0];
    return `https://waze.com/ul?ll=${firstStop.latitude},${firstStop.longitude}&navigate=yes`;
  }

  return '';
}

/**
 * GET /api/driver/routes/[routeId]
 *
 * Get route details with stops and navigation
 */
export async function GET(
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

    // Get route with stops
    const result = await RouteOptimizationService.getRouteWithStops(
      routeId
    );

    if (!result) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    // Verify driver owns this route
    if (result.route.driver_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate stats
    const stops = result.stops || [];
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

    // Find next stop
    const next_stop = stops.find(
      (s: any) => s.status === 'pending' && s.id !== current_stop?.id
    );

    // Generate navigation URLs
    const pending_stops = stops.filter(
      (s: any) => s.status === 'pending' || s.status === 'enroute'
    );

    const navigation_urls = {
      google_maps: generateNavigationUrl(pending_stops, 'google'),
      apple_maps: generateNavigationUrl(pending_stops, 'apple'),
      waze: generateNavigationUrl(pending_stops, 'waze'),
    };

    return NextResponse.json({
      data: {
        ...result,
        stats: {
          total_stops,
          completed_stops,
          pending_stops: total_stops - completed_stops,
          completion_percentage: Math.round(completion_percentage),
        },
        current_stop,
        next_stop,
        navigation_urls,
      },
    });
  } catch (error) {
    console.error('Error in GET /api/driver/routes/[routeId]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
