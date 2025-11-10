import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/admin/deliveries/assign
 * Assign a driver to an order (creates or updates delivery record)
 */
export async function POST(request: NextRequest) {
  try {
    const { orderId, driverId, estimatedDeliveryTime } = await request.json()

    if (!orderId || !driverId) {
      return NextResponse.json({ error: 'Order ID and Driver ID are required' }, { status: 400 })
    }

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

    // Verify the driver exists and has driver role
    const { data: driver, error: driverError } = await supabase
      .from('users')
      .select('id, role, first_name, last_name')
      .eq('id', driverId)
      .single()

    if (driverError || !driver || driver.role !== 'driver') {
      return NextResponse.json({ error: 'Invalid driver ID' }, { status: 400 })
    }

    // Verify the order exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if delivery record already exists for this order
    const { data: existingDelivery } = await supabase
      .from('deliveries')
      .select('id')
      .eq('order_id', orderId)
      .single()

    let delivery

    if (existingDelivery) {
      // Update existing delivery
      const { data, error } = await supabase
        .from('deliveries')
        .update({
          driver_id: driverId,
          status: 'assigned',
          estimated_delivery_time: estimatedDeliveryTime || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingDelivery.id)
        .select()
        .single()

      if (error) throw error
      delivery = data
    } else {
      // Create new delivery record
      const { data, error } = await supabase
        .from('deliveries')
        .insert({
          order_id: orderId,
          driver_id: driverId,
          status: 'assigned',
          estimated_delivery_time: estimatedDeliveryTime || null,
        })
        .select()
        .single()

      if (error) throw error
      delivery = data
    }

    // Update order status to ready_for_pickup if it's still in processing
    if (order.status === 'processing') {
      await supabase
        .from('orders')
        .update({
          status: 'ready_for_pickup',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
    }

    return NextResponse.json({
      success: true,
      delivery,
      message: `Order assigned to ${driver.first_name} ${driver.last_name}`,
    })
  } catch (error) {
    console.error('Error assigning driver:', error)
    return NextResponse.json({ error: 'Failed to assign driver' }, { status: 500 })
  }
}
