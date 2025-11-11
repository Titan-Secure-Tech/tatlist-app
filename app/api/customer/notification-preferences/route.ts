/**
 * Customer Notification Preferences API
 *
 * Allows customers to manage their delivery alert preferences
 * Issue #55: Implement Geolocation Alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * PATCH /api/customer/notification-preferences
 *
 * Update customer notification preferences
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

    // Parse request body
    const body = await request.json();
    const {
      preferred_channel,
      email_enabled,
      sms_enabled,
      phone_number,
      enable_eta_alerts,
      enable_distance_alerts,
      enable_arrival_alerts,
      quiet_hours_start,
      quiet_hours_end,
    } = body;

    // Build update object
    const updates: any = {};

    if (preferred_channel) {
      updates.preferred_channel = preferred_channel;
    }

    if (typeof email_enabled === 'boolean') {
      updates.email_enabled = email_enabled;
    }

    if (typeof sms_enabled === 'boolean') {
      updates.sms_enabled = sms_enabled;
    }

    if (phone_number !== undefined) {
      updates.phone_number = phone_number;
    }

    if (typeof enable_eta_alerts === 'boolean') {
      updates.enable_eta_alerts = enable_eta_alerts;
    }

    if (typeof enable_distance_alerts === 'boolean') {
      updates.enable_distance_alerts = enable_distance_alerts;
    }

    if (typeof enable_arrival_alerts === 'boolean') {
      updates.enable_arrival_alerts = enable_arrival_alerts;
    }

    if (quiet_hours_start !== undefined) {
      updates.quiet_hours_start = quiet_hours_start;
    }

    if (quiet_hours_end !== undefined) {
      updates.quiet_hours_end = quiet_hours_end;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      );
    }

    // Update or insert preferences
    const { data: existing } = await supabase
      .from('customer_notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let data, error;

    if (existing) {
      // Update existing
      ({ data, error } = await supabase
        .from('customer_notification_preferences')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single());
    } else {
      // Insert new
      ({ data, error } = await supabase
        .from('customer_notification_preferences')
        .insert({
          user_id: user.id,
          ...updates,
        })
        .select()
        .single());
    }

    if (error) {
      console.error('Error updating preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in PATCH /api/customer/notification-preferences:', error);
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
 * GET /api/customer/notification-preferences
 *
 * Get customer notification preferences
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

    // Fetch preferences
    const { data, error } = await supabase
      .from('customer_notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" - that's okay
      console.error('Error fetching preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
        { status: 500 }
      );
    }

    // Return default preferences if none exist
    if (!data) {
      const defaultPreferences = {
        user_id: user.id,
        preferred_channel: 'both',
        email_enabled: true,
        sms_enabled: false,
        phone_number: null,
        phone_verified: false,
        enable_eta_alerts: true,
        enable_distance_alerts: true,
        enable_arrival_alerts: true,
        quiet_hours_start: null,
        quiet_hours_end: null,
      };

      return NextResponse.json({ data: defaultPreferences });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in GET /api/customer/notification-preferences:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
