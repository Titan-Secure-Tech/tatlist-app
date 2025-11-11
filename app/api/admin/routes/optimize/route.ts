/**
 * Admin Route Optimization API
 *
 * Creates optimized multi-stop delivery routes
 * Issue #53: Integrate Route Optimization for Deliveries
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  RouteOptimizationService,
  OptimizeRouteRequest,
} from '@/lib/routing/optimization-service';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * POST /api/admin/routes/optimize
 *
 * Create optimized route from deliveries
 */
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body: OptimizeRouteRequest = await request.json();

    // Validate required fields
    if (!body.driver_id || !body.delivery_ids || body.delivery_ids.length === 0) {
      return NextResponse.json(
        { error: 'driver_id and delivery_ids are required' },
        { status: 400 }
      );
    }

    // Create optimized route
    const result = await RouteOptimizationService.createOptimizedRoute(body);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/routes/optimize:', error);

    return NextResponse.json(
      {
        error: 'Failed to create optimized route',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
