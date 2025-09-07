import { NextRequest, NextResponse } from 'next/server'
import { SquareCustomerSyncService } from '@/lib/services/square-customer-sync'
import { createClient } from '@/lib/supabase/server'

// This endpoint will be called by Vercel Cron
export async function GET(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron (in production)
    const authHeader = request.headers.get('authorization')
    if (process.env.NODE_ENV === 'production') {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    console.log('[CRON] Starting scheduled customer sync...')

    // Initialize Supabase client
    const supabase = await createClient()

    // Initialize sync service
    const syncService = new SquareCustomerSyncService(supabase)

    // Perform scheduled sync
    const result = await syncService.syncCustomers('scheduled')

    console.log('[CRON] Customer sync completed:', {
      success: result.success,
      created: result.customersCreated,
      updated: result.customersUpdated,
      matched: result.customersMatched,
      failed: result.customersFailed,
      errors: result.errors.length,
    })

    // Log to monitoring service if configured
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'square-customer-sync',
          type: 'scheduled',
          timestamp: new Date().toISOString(),
          result: {
            success: result.success,
            customersCreated: result.customersCreated,
            customersUpdated: result.customersUpdated,
            customersMatched: result.customersMatched,
            customersFailed: result.customersFailed,
            errorCount: result.errors.length,
          },
        }),
      }).catch(err => console.error('[CRON] Failed to send monitoring webhook:', err))
    }

    return NextResponse.json({
      success: result.success,
      timestamp: new Date().toISOString(),
      summary: {
        customersCreated: result.customersCreated,
        customersUpdated: result.customersUpdated,
        customersMatched: result.customersMatched,
        customersFailed: result.customersFailed,
      },
      syncLogId: result.syncLogId,
      message: result.success
        ? `Scheduled sync completed successfully`
        : `Scheduled sync completed with ${result.customersFailed} failures`,
    })
  } catch (error) {
    console.error('[CRON] Customer sync failed:', error)

    // Log error to monitoring service if configured
    if (process.env.MONITORING_WEBHOOK_URL) {
      await fetch(process.env.MONITORING_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service: 'square-customer-sync',
          type: 'scheduled',
          timestamp: new Date().toISOString(),
          error: String(error),
          status: 'failed',
        }),
      }).catch(err => console.error('[CRON] Failed to send error webhook:', err))
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Scheduled sync failed',
        details: String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
