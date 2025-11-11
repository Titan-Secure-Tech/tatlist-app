/**
 * Driver Route Stop API
 *
 * Update stop status during delivery
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/driver/routes/[routeId]/stops/[stopId]
 *
 * Update stop status (arrived, completed, skipped)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ routeId: string; stopId: string }> }
) {
  try {
    const supabase = await createClient();
    const { routeId, stopId } = await params;

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify route belongs to driver
    const { data: route } = await supabase
      .from('routes')
      .select('driver_id, status')
      .eq('id', routeId)
      .single();

    if (!route || route.driver_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { status, notes } = body;

    // Validate status
    const validStatuses = ['pending', 'enroute', 'arrived', 'completed', 'skipped'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Build updates
    const updates: any = {};
    const now = new Date().toISOString();

    if (status) {
      updates.status = status;

      // Set arrival_time when status changes to 'arrived'
      if (status === 'arrived') {
        updates.arrival_time = now;
      }

      // Set departure_time when status changes to 'completed' or 'skipped'
      if (status === 'completed' || status === 'skipped') {
        updates.departure_time = now;

        // Calculate time spent if arrival_time exists
        const { data: currentStop } = await supabase
          .from('route_stops')
          .select('arrival_time')
          .eq('id', stopId)
          .single();

        if (currentStop?.arrival_time) {
          const arrival = new Date(currentStop.arrival_time);
          const departure = new Date(now);
          const time_spent = Math.round(
            (departure.getTime() - arrival.getTime()) / 1000 / 60
          ); // minutes
          updates.time_spent_minutes = time_spent;
        }

        // Update corresponding delivery status
        const { data: stop } = await supabase
          .from('route_stops')
          .select('delivery_id')
          .eq('id', stopId)
          .single();

        if (stop) {
          await supabase
            .from('deliveries')
            .update({
              status: status === 'completed' ? 'completed' : 'failed',
              actual_delivery_time: now,
            })
            .eq('id', stop.delivery_id);
        }
      }
    }

    if (notes !== undefined) {
      updates.notes = notes;
    }

    // Update stop
    const { error } = await supabase
      .from('route_stops')
      .update(updates)
      .eq('id', stopId)
      .eq('route_id', routeId); // Double-check route ownership

    if (error) {
      console.error('Error updating route stop:', error);
      throw new Error('Failed to update stop');
    }

    return NextResponse.json({
      success: true,
      message: 'Stop updated successfully',
    });
  } catch (error) {
    console.error(
      'Error in PATCH /api/driver/routes/[routeId]/stops/[stopId]:',
      error
    );

    return NextResponse.json(
      {
        error: 'Failed to update stop',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
