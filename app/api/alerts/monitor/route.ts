/**
 * Alert Monitoring API Endpoint
 *
 * Triggered by cron job to monitor active deliveries and send proximity alerts
 * Issue #55: Implement Geolocation Alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/alerts/notification-service';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds max execution time

/**
 * POST /api/alerts/monitor
 *
 * Monitors active deliveries and triggers geolocation alerts
 * Should be called by a cron job every 1-2 minutes
 *
 * Authentication: Requires CRON_SECRET header
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Alert Monitor] Starting alert monitoring...');

    // Process all alerts
    const stats = await NotificationService.processAlerts();

    console.log('[Alert Monitor] Monitoring complete:', stats);

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Alert Monitor] Error:', error);

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
 * GET /api/alerts/monitor
 *
 * Manual trigger for testing (development only)
 */
export async function GET(request: NextRequest) {
  // Only allow in development or with admin authentication
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Use POST method for production monitoring' },
      { status: 405 }
    );
  }

  try {
    console.log('[Alert Monitor] Manual trigger (dev mode)');

    const stats = await NotificationService.processAlerts();

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
      mode: 'development',
    });
  } catch (error) {
    console.error('[Alert Monitor] Error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
