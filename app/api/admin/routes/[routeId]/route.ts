/**
 * Admin Single Route API
 *
 * Get, update, or cancel individual routes
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RouteOptimizationService } from '@/lib/routing/optimization-service';

/**
 * GET /api/admin/routes/[routeId]
 *
 * Get route details with stops
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

    // Check admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get route with stops
    const result = await RouteOptimizationService.getRouteWithStops(
      routeId
    );

    if (!result) {
      return NextResponse.json({ error: 'Route not found' }, { status: 404 });
    }

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Error in GET /api/admin/routes/[routeId]:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/routes/[routeId]
 *
 * Update route (status, waypoint order, etc.)
 */
export async function PATCH(
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

    // Check admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Parse request body
    const body = await request.json();
    const { status, waypoint_order } = body;

    // Handle status changes
    if (status === 'active') {
      await RouteOptimizationService.activateRoute(routeId);
      return NextResponse.json({
        success: true,
        message: 'Route activated',
      });
    }

    if (status === 'cancelled') {
      await RouteOptimizationService.cancelRoute(routeId);
      return NextResponse.json({
        success: true,
        message: 'Route cancelled',
      });
    }

    // Handle waypoint order update (manual reordering)
    if (waypoint_order && Array.isArray(waypoint_order)) {
      await RouteOptimizationService.updateRouteOrder(
        routeId,
        waypoint_order
      );
      return NextResponse.json({
        success: true,
        message: 'Route order updated',
      });
    }

    // Handle other updates
    const updates: any = {};
    if (body.name) updates.name = body.name;
    if (body.estimated_start_time)
      updates.estimated_start_time = body.estimated_start_time;
    if (body.estimated_end_time)
      updates.estimated_end_time = body.estimated_end_time;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('routes')
        .update(updates)
        .eq('id', routeId);

      if (error) {
        throw new Error('Failed to update route');
      }

      return NextResponse.json({
        success: true,
        message: 'Route updated',
      });
    }

    return NextResponse.json(
      { error: 'No valid updates provided' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/routes/[routeId]:', error);

    return NextResponse.json(
      {
        error: 'Failed to update route',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/routes/[routeId]
 *
 * Cancel and delete route
 */
export async function DELETE(
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

    // Check admin role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Cancel route (unassigns deliveries)
    await RouteOptimizationService.cancelRoute(routeId);

    // Delete route and stops (CASCADE will handle stops)
    const { error } = await supabase
      .from('routes')
      .delete()
      .eq('id', routeId);

    if (error) {
      throw new Error('Failed to delete route');
    }

    return NextResponse.json({
      success: true,
      message: 'Route deleted',
    });
  } catch (error) {
    console.error('Error in DELETE /api/admin/routes/[routeId]:', error);

    return NextResponse.json(
      {
        error: 'Failed to delete route',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
