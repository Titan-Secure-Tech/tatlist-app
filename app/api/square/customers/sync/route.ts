import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SquareCustomerSyncService } from '@/lib/services/square-customer-sync'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check if user is authenticated (optional - you might want to restrict this)
    // const {
    //   data: { user },
    // } = await supabase.auth.getUser()

    // Parse request body for sync options
    const body = await request.json().catch(() => ({}))
    const syncType = body.syncType || 'manual'

    // Initialize sync service
    const syncService = new SquareCustomerSyncService(supabase)

    // Perform sync
    console.log(`Starting ${syncType} customer sync...`)
    const result = await syncService.syncCustomers(syncType)

    console.log('Customer sync completed:', {
      created: result.customersCreated,
      updated: result.customersUpdated,
      matched: result.customersMatched,
      failed: result.customersFailed,
    })

    return NextResponse.json({
      success: result.success,
      summary: {
        customersCreated: result.customersCreated,
        customersUpdated: result.customersUpdated,
        customersMatched: result.customersMatched,
        customersFailed: result.customersFailed,
      },
      errors: result.errors.length > 0 ? result.errors : undefined,
      syncLogId: result.syncLogId,
      message: result.success
        ? `Successfully synced ${result.customersCreated + result.customersUpdated + result.customersMatched} customers`
        : `Sync completed with ${result.customersFailed} failures`,
    })
  } catch (error) {
    console.error('Customer sync failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Customer sync failed',
        details: String(error),
      },
      { status: 500 }
    )
  }
}

// GET endpoint to check sync status
export async function GET() {
  try {
    const supabase = await createClient()

    // Get recent sync logs
    const { data: logs, error } = await supabase
      .from('square_customer_sync_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(10)

    if (error) throw error

    // Get sync statistics
    const { data: stats } = await supabase
      .from('square_customers')
      .select('sync_status')
      .eq('sync_status', 'active')

    const { data: unlinkedCount } = await supabase
      .from('unlinked_supabase_users')
      .select('user_id', { count: 'exact', head: true })

    return NextResponse.json({
      success: true,
      stats: {
        linkedCustomers: stats?.length || 0,
        unlinkedUsers: unlinkedCount || 0,
        lastSync: logs?.[0]?.started_at || null,
        lastSyncStatus: logs?.[0]?.status || 'never',
      },
      recentSyncs: logs || [],
    })
  } catch (error) {
    console.error('Failed to get sync status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get sync status',
        details: String(error),
      },
      { status: 500 }
    )
  }
}
