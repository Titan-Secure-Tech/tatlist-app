import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/customer/orders/[orderId]/tracking
 * Get real-time driver location for customer's order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify order belongs to this user and get delivery info
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(
        `
        id,
        status,
        delivery_address,
        delivery:deliveries (
          id,
          status,
          current_latitude,
          current_longitude,
          location_updated_at,
          estimated_arrival_time,
          driver:users!deliveries_driver_id_fkey (
            id,
            first_name,
            last_name,
            phone
          )
        )
      `
      )
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found or access denied' }, { status: 404 })
    }

    // Check if delivery exists and is trackable
    if (!order.delivery || order.delivery.length === 0) {
      return NextResponse.json({
        trackable: false,
        message: 'No delivery assigned yet',
      })
    }

    const delivery = order.delivery[0]

    // Only allow tracking for in-progress deliveries
    if (delivery.status !== 'in_progress') {
      return NextResponse.json({
        trackable: false,
        message: `Delivery is ${delivery.status}. Tracking only available during delivery.`,
        delivery_status: delivery.status,
      })
    }

    // Check if location data is available
    if (!delivery.current_latitude || !delivery.current_longitude) {
      return NextResponse.json({
        trackable: true,
        has_location: false,
        message: 'Driver location not yet available',
        driver: delivery.driver
          ? {
              name: `${delivery.driver.first_name} ${delivery.driver.last_name}`,
              phone: delivery.driver.phone,
            }
          : null,
      })
    }

    // Return tracking data
    return NextResponse.json({
      trackable: true,
      has_location: true,
      driver_location: {
        latitude: delivery.current_latitude,
        longitude: delivery.current_longitude,
        updated_at: delivery.location_updated_at,
      },
      delivery_address: order.delivery_address,
      estimated_arrival: delivery.estimated_arrival_time,
      driver: delivery.driver
        ? {
            name: `${delivery.driver.first_name} ${delivery.driver.last_name}`,
            phone: delivery.driver.phone,
          }
        : null,
    })
  } catch (error) {
    console.error('Error fetching tracking data:', error)
    return NextResponse.json({ error: 'Failed to fetch tracking data' }, { status: 500 })
  }
}
