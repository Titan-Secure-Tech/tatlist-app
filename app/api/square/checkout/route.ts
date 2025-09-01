import { NextRequest, NextResponse } from 'next/server'
import { squareClient, SQUARE_LOCATION_ID } from '@/lib/square/client'
import { randomUUID } from 'crypto'
import type {
  SquareCreateOrderRequest,
  SquarePaymentLinkRequest,
  SquareOrderResponse,
  SquarePaymentLinkResponse,
} from '@/lib/types/square'

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
    const body = await request.json()
    const {
      items,
      deliveryAddress,
      customerInfo,
    }: {
      items: CartItem[]
      deliveryAddress: DeliveryAddress
      customerInfo: CustomerInfo
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    if (!deliveryAddress) {
      return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 })
    }

    // Create line items for the order
    const lineItems = items.map((item: CartItem) => ({
      quantity: String(item.quantity),
      catalogObjectId: item.id,
      basePriceMoney: {
        amount: BigInt(Math.round(item.price * 100)),
        currency: 'USD',
      },
      name: item.name,
      variationName: item.variant,
    }))

    // Calculate total
    const subtotal = items.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    )

    // Add delivery fee
    const deliveryFee = 5.0 // $5 flat delivery fee
    const total = subtotal + deliveryFee

    // Create the order
    const orderRequest = {
      order: {
        locationId: SQUARE_LOCATION_ID,
        lineItems,
        fulfillments: [
          {
            type: 'DELIVERY',
            state: 'PROPOSED',
            deliveryDetails: {
              recipient: {
                displayName: customerInfo.name,
                phoneNumber: customerInfo.phone,
                email: customerInfo.email,
              },
              deliverAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
              scheduleType: 'ASAP',
              recipientAddress: {
                addressLine1: deliveryAddress.line1,
                addressLine2: deliveryAddress.line2,
                locality: deliveryAddress.city,
                administrativeDistrictLevel1: deliveryAddress.state,
                postalCode: deliveryAddress.postalCode,
                country: 'US',
              },
            },
          },
        ],
        serviceCharges: [
          {
            name: 'Delivery Fee',
            amountMoney: {
              amount: BigInt(Math.round(deliveryFee * 100)),
              currency: 'USD',
            },
            calculationPhase: 'SUBTOTAL_PHASE',
          },
        ],
      },
      idempotencyKey: randomUUID(),
    }

    const { result: orderResult, ...orderResponse }: SquareOrderResponse =
      await squareClient.orders.createOrder(orderRequest as SquareCreateOrderRequest)

    if (orderResponse.statusCode !== 200 || !orderResult?.order) {
      console.error('Order creation error:', orderResponse)
      throw new Error('Failed to create order')
    }

    // Create payment link for the order
    const paymentLinkRequest = {
      quickPay: {
        name: `Order ${orderResult.order.id?.slice(-6)}`,
        priceMoney: {
          amount: orderResult.order.totalMoney?.amount || BigInt(Math.round(total * 100)),
          currency: 'USD',
        },
        locationId: SQUARE_LOCATION_ID,
      },
      checkoutOptions: {
        allowTipping: true,
        redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/orders/success`,
        merchantSupportEmail: 'support@tatlist.com',
      },
      prePopulatedData: {
        buyerEmail: customerInfo.email,
        buyerPhoneNumber: customerInfo.phone,
        buyerAddress: {
          addressLine1: deliveryAddress.line1,
          addressLine2: deliveryAddress.line2,
          locality: deliveryAddress.city,
          administrativeDistrictLevel1: deliveryAddress.state,
          postalCode: deliveryAddress.postalCode,
          country: 'US',
        },
      },
    }

    const { result: paymentLinkResult, ...paymentResponse }: SquarePaymentLinkResponse =
      await squareClient.checkout.createPaymentLink(paymentLinkRequest as SquarePaymentLinkRequest)

    if (paymentResponse.statusCode !== 200 || !paymentLinkResult?.paymentLink) {
      console.error('Payment link error:', paymentResponse)
      throw new Error('Failed to create payment link')
    }

    return NextResponse.json({
      orderId: orderResult.order.id,
      paymentLink: paymentLinkResult.paymentLink.url,
      order: orderResult.order,
      total: total,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: errorMessage || 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
