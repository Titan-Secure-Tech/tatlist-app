import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_DELIVERY_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: [],
  assigned: ['in_progress'],
  in_progress: ['completed', 'failed'],
  completed: [],
  failed: [],
}

/**
 * GET /api/driver/deliveries/[deliveryId]
 * Fetch delivery details with full order information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const { deliveryId } = await params
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

    // Fetch delivery with full order details
    const { data: delivery, error } = await supabase
      .from('deliveries')
      .select(
        `
        *,
        order:orders (
          *,
          customer:users (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          order_items (
            *,
            product:products (
              name,
              sku,
              images
            )
          )
        )
      `
      )
      .eq('id', deliveryId)
      .eq('driver_id', user.id)
      .single()

    if (error || !delivery) {
      return NextResponse.json({ error: 'Delivery not found or access denied' }, { status: 404 })
    }

    return NextResponse.json({ delivery })
  } catch (error) {
    console.error('Error fetching delivery details:', error)
    return NextResponse.json({ error: 'Failed to fetch delivery details' }, { status: 500 })
  }
}

/**
 * PATCH /api/driver/deliveries/[deliveryId]
 * Update delivery status and details
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const { deliveryId } = await params
    const body = await request.json()
    const { status, actual_delivery_time, route, notes } = body

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

    // Get current delivery status
    const { data: currentDelivery, error: fetchError } = await supabase
      .from('deliveries')
      .select('status, order_id')
      .eq('id', deliveryId)
      .eq('driver_id', user.id)
      .single()

    if (fetchError || !currentDelivery) {
      return NextResponse.json({ error: 'Delivery not found or access denied' }, { status: 404 })
    }

    // Validate status transition if status is being updated
    if (status) {
      const currentStatus = currentDelivery.status
      const allowedTransitions = VALID_DELIVERY_STATUS_TRANSITIONS[currentStatus] || []

      if (!allowedTransitions.includes(status)) {
        return NextResponse.json(
          {
            error: `Invalid status transition from ${currentStatus} to ${status}`,
            allowedTransitions,
          },
          { status: 400 }
        )
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (status) {
      updateData.status = status

      // Automatically update order status based on delivery status
      if (status === 'in_progress') {
        // Update order to out_for_delivery
        await supabase
          .from('orders')
          .update({ status: 'out_for_delivery', updated_at: new Date().toISOString() })
          .eq('id', currentDelivery.order_id)
      } else if (status === 'completed') {
        // Update order to delivered
        updateData.actual_delivery_time = actual_delivery_time || new Date().toISOString()
        await supabase
          .from('orders')
          .update({ status: 'delivered', updated_at: new Date().toISOString() })
          .eq('id', currentDelivery.order_id)
      }
    }

    if (actual_delivery_time) updateData.actual_delivery_time = actual_delivery_time
    if (route) updateData.route = route

    // Update delivery
    const { data: updatedDelivery, error: updateError } = await supabase
      .from('deliveries')
      .update(updateData)
      .eq('id', deliveryId)
      .eq('driver_id', user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      delivery: updatedDelivery,
      message: `Delivery updated successfully`,
    })
  } catch (error) {
    console.error('Error updating delivery:', error)
    return NextResponse.json({ error: 'Failed to update delivery' }, { status: 500 })
  }
}
