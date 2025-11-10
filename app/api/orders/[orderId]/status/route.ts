import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['ready_for_pickup', 'out_for_delivery', 'cancelled'],
  ready_for_pickup: ['out_for_delivery', 'delivered', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const { status, notes } = await request.json()

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin or driver
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

    if (!profile || (profile.role !== 'admin' && profile.role !== 'driver')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get current order status
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Validate status transition
    const currentStatus = order.status
    const allowedTransitions = VALID_STATUS_TRANSITIONS[currentStatus] || []

    if (!allowedTransitions.includes(status)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} to ${status}`,
          allowedTransitions,
        },
        { status: 400 }
      )
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({
        status,
        status_notes: notes || null,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`,
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params
    const supabase = await createClient()

    // Get order status history
    const { data: history, error } = await supabase
      .from('order_status_history')
      .select(
        `
        *,
        changed_by_user:users!order_status_history_changed_by_fkey(first_name, last_name, email)
      `
      )
      .eq('order_id', orderId)
      .order('changed_at', { ascending: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ history })
  } catch (error) {
    console.error('Error fetching order status history:', error)
    return NextResponse.json({ error: 'Failed to fetch status history' }, { status: 500 })
  }
}
