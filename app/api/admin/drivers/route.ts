import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/admin/drivers
 * Fetch all users with driver role
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

    // Verify user is admin
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Fetch all drivers
    const { data: drivers, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, phone')
      .eq('role', 'driver')
      .order('first_name', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ drivers: drivers || [] })
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 })
  }
}
