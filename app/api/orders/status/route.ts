import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { mailgunService } from '@/lib/email/mailgun'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check if user is authenticated and has admin privileges
    // For now, we'll just check if they're authenticated
    // In production, you'd want to check for admin role
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      orderId, 
      status, 
      message, 
      estimatedTime,
      sendEmail = true 
    } = body

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Order ID and status are required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update order status in database
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Order update error:', updateError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Send status update email if requested
    if (sendEmail && order.customer_email) {
      try {
        await mailgunService.sendOrderStatusUpdate(order.customer_email, {
          orderId: order.id,
          customerName: order.customer_name,
          status: status as 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled',
          message,
          estimatedTime
        })
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      order,
      emailSent: sendEmail
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Order status update error:', error)
    return NextResponse.json(
      { error: errorMessage || 'Failed to update order status' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve order status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single()

    if (error) {
      console.error('Order fetch error:', error)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ order })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Order fetch error:', error)
    return NextResponse.json(
      { error: errorMessage || 'Failed to fetch order' },
      { status: 500 }
    )
  }
}