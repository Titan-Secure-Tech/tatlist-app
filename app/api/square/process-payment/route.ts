import { NextRequest, NextResponse } from 'next/server'
import { squareClient, SQUARE_LOCATION_ID } from '@/lib/square/client'
import { randomUUID } from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { mailgunService } from '@/lib/email/mailgun'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  variant?: string
}

interface DeliveryAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
}

interface CustomerInfo {
  name: string
  phone: string
  email: string
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const body = await request.json()
    const {
      sourceId,
      items,
      deliveryAddress,
      customerInfo,
      amount,
    }: {
      sourceId: string
      items: CartItem[]
      deliveryAddress: DeliveryAddress
      customerInfo: CustomerInfo
      amount: number
    } = body

    if (!sourceId) {
      return NextResponse.json({ error: 'Payment source is required' }, { status: 400 })
    }

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    // Create payment with Square
    const paymentRequest = {
      sourceId,
      idempotencyKey: randomUUID(),
      amountMoney: {
        amount: BigInt(Math.round(amount * 100)), // Convert to cents
        currency: 'USD',
      },
      locationId: SQUARE_LOCATION_ID,
      buyerEmailAddress: customerInfo.email,
      billingAddress: {
        addressLine1: deliveryAddress.line1,
        addressLine2: deliveryAddress.line2,
        locality: deliveryAddress.city,
        administrativeDistrictLevel1: deliveryAddress.state,
        postalCode: deliveryAddress.postalCode,
        country: 'US',
      },
      note: `Order for ${customerInfo.name}`,
    }

    const { result: paymentResult, ...paymentResponse } =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (squareClient.payments as any).createPayment(paymentRequest)

    if (paymentResponse.statusCode !== 200 || !paymentResult?.payment) {
      console.error('Payment error:', paymentResponse)
      throw new Error('Payment failed')
    }

    // Create order in database
    const orderData = {
      user_id: user?.id || null,
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      delivery_address: deliveryAddress,
      items: items,
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      delivery_fee: 5.0,
      tax: amount - items.reduce((sum, item) => sum + item.price * item.quantity, 0) - 5.0,
      total: amount,
      payment_id: paymentResult.payment.id,
      payment_status: paymentResult.payment.status,
      status: 'pending',
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      // Payment was successful but order creation failed
      // In production, you'd want to handle this more gracefully
      return NextResponse.json({
        orderId: paymentResult.payment.id,
        payment: paymentResult.payment,
        warning: 'Payment successful but order tracking failed',
      })
    }

    // Send order confirmation email
    try {
      await mailgunService.sendOrderConfirmation(customerInfo.email, {
        orderId: order.id || paymentResult.payment.id,
        customerName: customerInfo.name,
        items: items,
        subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        deliveryFee: 5.0,
        tax: amount - items.reduce((sum, item) => sum + item.price * item.quantity, 0) - 5.0,
        total: amount,
        deliveryAddress: deliveryAddress,
      })
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError)
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      orderId: order.id,
      payment: paymentResult.payment,
      order,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { error: errorMessage || 'Failed to process payment' },
      { status: 500 }
    )
  }
}
