import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/driver/deliveries/[deliveryId]/location
 * Update driver's current location for active delivery
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const { deliveryId } = await params
    const { latitude, longitude, accuracy, speed, heading } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json({ error: 'Latitude and longitude are required' }, { status: 400 })
    }

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

    // Verify delivery belongs to this driver and is in progress
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select('id, driver_id, status')
      .eq('id', deliveryId)
      .eq('driver_id', user.id)
      .single()

    if (deliveryError || !delivery) {
      return NextResponse.json({ error: 'Delivery not found or access denied' }, { status: 404 })
    }

    if (delivery.status !== 'in_progress') {
      return NextResponse.json(
        { error: 'Can only update location for in-progress deliveries' },
        { status: 400 }
      )
    }

    const now = new Date().toISOString()

    // Update current location in deliveries table
    const { error: updateError } = await supabase
      .from('deliveries')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
        location_updated_at: now,
        updated_at: now,
      })
      .eq('id', deliveryId)
      .eq('driver_id', user.id)

    if (updateError) {
      throw updateError
    }

    // Insert into location history
    const { error: historyError } = await supabase.from('driver_location_history').insert({
      delivery_id: deliveryId,
      driver_id: user.id,
      latitude,
      longitude,
      accuracy: accuracy || null,
      speed: speed || null,
      heading: heading || null,
      recorded_at: now,
    })

    if (historyError) {
      console.error('Failed to insert location history:', historyError)
      // Don't fail the request if history insert fails
    }

    return NextResponse.json({
      success: true,
      message: 'Location updated successfully',
      location: { latitude, longitude, updated_at: now },
    })
  } catch (error) {
    console.error('Error updating driver location:', error)
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
  }
}
