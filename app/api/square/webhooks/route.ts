import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

// Square webhook event types we care about
const RELEVANT_EVENT_TYPES = [
  'payment.created',
  'payment.updated',
  'order.created',
  'order.updated',
  'order.fulfillment.updated',
  'refund.created',
  'refund.updated',
]

// Verify webhook signature from Square
function verifyWebhookSignature(
  body: string,
  signature: string | null,
  signingKey: string
): boolean {
  if (!signature) return false

  const hmac = crypto.createHmac('sha256', signingKey)
  hmac.update(body)
  const expectedSignature = hmac.digest('base64')

  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get raw body for signature verification
    const body = await request.text()

    // Get signature from headers
    const signature = request.headers.get('x-square-hmacsha256-signature')

    // Verify webhook signature (if in production)
    const signingKey = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY
    if (process.env.NODE_ENV === 'production' && signingKey) {
      const isValid = verifyWebhookSignature(body, signature, signingKey)
      if (!isValid) {
        console.error('Invalid webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Parse the webhook payload
    const event = JSON.parse(body)

    // Log webhook event to database
    const { data: webhookLog, error: logError } = await supabase
      .from('square_webhooks')
      .insert({
        event_id: event.event_id || crypto.randomUUID(),
        event_type: event.type,
        merchant_id: event.merchant_id,
        location_id: event.location_id,
        entity_id: event.data?.id || event.data?.object?.id,
        payload: event,
        processed: false,
      })
      .select()
      .single()

    if (logError) {
      console.error('Failed to log webhook:', logError)
      // Continue processing even if logging fails
    }

    // Process relevant events
    if (!RELEVANT_EVENT_TYPES.includes(event.type)) {
      // Mark as processed (ignored)
      if (webhookLog) {
        await supabase
          .from('square_webhooks')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
          })
          .eq('id', webhookLog.id)
      }

      return NextResponse.json({ received: true })
    }

    try {
      // Handle different event types
      switch (event.type) {
        case 'payment.created':
        case 'payment.updated':
          await handlePaymentEvent(supabase, event)
          break

        case 'order.created':
        case 'order.updated':
          await handleOrderEvent(supabase, event)
          break

        case 'order.fulfillment.updated':
          await handleFulfillmentEvent(supabase, event)
          break

        case 'refund.created':
        case 'refund.updated':
          await handleRefundEvent(supabase, event)
          break
      }

      // Mark webhook as processed
      if (webhookLog) {
        await supabase
          .from('square_webhooks')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
          })
          .eq('id', webhookLog.id)
      }

      return NextResponse.json({ received: true })
    } catch (processingError) {
      console.error('Error processing webhook:', processingError)

      // Update webhook with error
      if (webhookLog) {
        await supabase
          .from('square_webhooks')
          .update({
            error: String(processingError),
            processed: true,
            processed_at: new Date().toISOString(),
          })
          .eq('id', webhookLog.id)
      }

      // Return success to Square (to avoid retries for processing errors)
      return NextResponse.json({ received: true, error: 'Processing failed' })
    }
  } catch (error) {
    console.error('Webhook error:', error)
    // Return error to trigger Square retry
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentEvent(
  supabase: ReturnType<typeof createClient>,
  event: Record<string, unknown>
) {
  const payment = event.data.object.payment

  if (!payment) return

  // Find order by Square payment ID
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('square_payment_id', payment.id)
    .single()

  if (error || !order) {
    console.log(`No order found for payment ${payment.id}`)
    return
  }

  // Update order payment status
  const updates: Record<string, unknown> = {
    payment_status: mapSquarePaymentStatus(payment.status),
    updated_at: new Date().toISOString(),
  }

  // If payment is completed, update order status and paid_at
  if (payment.status === 'COMPLETED') {
    updates.status = 'paid'
    updates.paid_at = payment.updated_at || new Date().toISOString()

    if (payment.receipt_url) {
      updates.square_receipt_url = payment.receipt_url
    }
  } else if (payment.status === 'FAILED' || payment.status === 'CANCELED') {
    updates.status = 'cancelled'
    updates.cancelled_at = new Date().toISOString()
  }

  await supabase.from('orders').update(updates).eq('id', order.id)

  console.log(`Updated order ${order.order_number} with payment status: ${payment.status}`)
}

async function handleOrderEvent(
  supabase: ReturnType<typeof createClient>,
  event: Record<string, unknown>
) {
  const squareOrder = event.data.object.order

  if (!squareOrder) return

  // Find order by Square order ID
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('square_order_id', squareOrder.id)
    .single()

  if (error || !order) {
    console.log(`No order found for Square order ${squareOrder.id}`)
    return
  }

  // Update order with latest Square data
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  // Update order status based on Square order state
  if (squareOrder.state) {
    updates.status = mapSquareOrderState(squareOrder.state)
  }

  await supabase.from('orders').update(updates).eq('id', order.id)

  console.log(`Updated order ${order.order_number} from Square order event`)
}

async function handleFulfillmentEvent(
  supabase: ReturnType<typeof createClient>,
  event: Record<string, unknown>
) {
  const fulfillment = event.data.object.order_fulfillment
  const orderId = event.data.object.order_id

  if (!fulfillment || !orderId) return

  // Find order by Square order ID
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('square_order_id', orderId)
    .single()

  if (error || !order) {
    console.log(`No order found for Square order ${orderId}`)
    return
  }

  // Update order fulfillment status
  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (fulfillment.state === 'COMPLETED') {
    updates.status = 'delivered'
    updates.fulfilled_at = fulfillment.updated_at || new Date().toISOString()
  } else if (fulfillment.state === 'PREPARED') {
    updates.status = 'shipped'
  }

  await supabase.from('orders').update(updates).eq('id', order.id)

  console.log(`Updated order ${order.order_number} fulfillment status: ${fulfillment.state}`)
}

async function handleRefundEvent(
  supabase: ReturnType<typeof createClient>,
  event: Record<string, unknown>
) {
  const refund = event.data.object.refund || event.data.object.payment_refund

  if (!refund) return

  // Find order by payment ID
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('square_payment_id', refund.payment_id)
    .single()

  if (error || !order) {
    console.log(`No order found for payment ${refund.payment_id}`)
    return
  }

  // Update order as refunded
  await supabase
    .from('orders')
    .update({
      status: 'refunded',
      payment_status: 'refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  console.log(`Order ${order.order_number} marked as refunded`)
}

// Helper function to map Square payment status to our status
function mapSquarePaymentStatus(squareStatus: string): string {
  const statusMap: Record<string, string> = {
    APPROVED: 'processing',
    PENDING: 'pending',
    COMPLETED: 'completed',
    CANCELED: 'cancelled',
    FAILED: 'failed',
  }

  return statusMap[squareStatus] || 'pending'
}

// Helper function to map Square order state to our status
function mapSquareOrderState(squareState: string): string {
  const stateMap: Record<string, string> = {
    OPEN: 'processing',
    COMPLETED: 'delivered',
    CANCELED: 'cancelled',
    DRAFT: 'pending',
  }

  return stateMap[squareState] || 'processing'
}
