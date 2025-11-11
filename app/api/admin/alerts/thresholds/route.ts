/**
 * Alert Thresholds API
 *
 * Admin API for managing geolocation alert thresholds
 * Issue #55: Implement Geolocation Alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/admin/alerts/thresholds
 *
 * Update an alert threshold
 */
export async function PATCH(request: NextRequest) {
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
    const body = await request.json();
    const { id, is_enabled, notification_channel, distance_miles, eta_minutes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Threshold ID is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};

    if (typeof is_enabled === 'boolean') {
      updates.is_enabled = is_enabled;
    }

    if (notification_channel) {
      updates.notification_channel = notification_channel;
    }

    if (distance_miles !== undefined) {
      updates.distance_miles = distance_miles;
    }

    if (eta_minutes !== undefined) {
      updates.eta_minutes = eta_minutes;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Update threshold
    const { data, error } = await supabase
      .from('alert_thresholds')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating threshold:', error);
      return NextResponse.json(
        { error: 'Failed to update threshold' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in PATCH /api/admin/alerts/thresholds:', error);
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
 * GET /api/admin/alerts/thresholds
 *
 * Get all alert thresholds
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

    // Fetch thresholds
    const { data, error } = await supabase
      .from('alert_thresholds')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching thresholds:', error);
      return NextResponse.json(
        { error: 'Failed to fetch thresholds' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/admin/alerts/thresholds:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
