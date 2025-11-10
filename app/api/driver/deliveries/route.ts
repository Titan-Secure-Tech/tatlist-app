import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/driver/deliveries
 * Fetch active deliveries for the authenticated driver
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a driver
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

    if (!profile || profile.role !== 'driver') {
      return NextResponse.json({ error: 'Forbidden - Driver access required' }, { status: 403 })
    }

    // Use the database function to get active deliveries
    const { data: deliveries, error } = await supabase.rpc('get_driver_active_deliveries', {
      driver_user_id: user.id,
    })

    if (error) {
      console.error('Error fetching driver deliveries:', error)
      throw error
    }

    return NextResponse.json({ deliveries: deliveries || [] })
  } catch (error) {
    console.error('Error in driver deliveries endpoint:', error)
    return NextResponse.json({ error: 'Failed to fetch deliveries' }, { status: 500 })
  }
}
