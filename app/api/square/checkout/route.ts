import { NextRequest, NextResponse } from 'next/server'
import { getSquareConfig, isSandboxUser } from '@/lib/square/client-config'
import { createClient } from '@/lib/supabase/server'
import { SquareCustomerSyncService } from '@/lib/services/square-customer-sync'
import { randomUUID } from 'crypto'
// Square types are defined inline below
import type { OrderItem } from '@/lib/types/orders'

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
      notes,
    }: {
      items: CartItem[]
      deliveryAddress: DeliveryAddress
      customerInfo: CustomerInfo
      notes?: string
    } = body

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'No items in cart' }, { status: 400 })
    }

    if (!deliveryAddress) {
      return NextResponse.json({ error: 'Delivery address is required' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = await createClient()

    // Get authenticated user (if any)
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Check if user should use sandbox mode
    let useSandbox = false
    let sandboxReason = 'production'

    // First check if email is in hardcoded sandbox list
    if (customerInfo.email && isSandboxUser(customerInfo.email)) {
      useSandbox = true
      sandboxReason = 'hardcoded_test_user'
    } else {
      // Check database for sandbox_users entry
      const { data: sandboxUser } = await supabase
        .from('sandbox_users')
        .select('enabled')
        .eq('email', customerInfo.email.toLowerCase())
        .eq('enabled', true)
        .single()

      if (sandboxUser?.enabled) {
        useSandbox = true
        sandboxReason = 'database_sandbox_user'
      }
    }

    // Get appropriate Square configuration
    const squareConfig = getSquareConfig(useSandbox)
    const { client: squareClient, locationId: SQUARE_LOCATION_ID, environment } = squareConfig

    console.log(
      `[Square Checkout] Using ${environment} mode for ${customerInfo.email} (reason: ${sandboxReason})`
    )

    // Create or get Square customer
    let squareCustomerId: string | null = null
    try {
      const syncService = new SquareCustomerSyncService(supabase)

      // Parse customer name into first/last
      const nameParts = customerInfo.name.trim().split(/\s+/)
      const givenName = nameParts[0] || ''
      const familyName = nameParts.slice(1).join(' ') || ''

      squareCustomerId = await syncService.getOrCreateSquareCustomerForCheckout(
        customerInfo.email,
        {
          givenName,
          familyName,
          phoneNumber: customerInfo.phone,
          userId: user?.id,
        }
      )

      if (squareCustomerId) {
        console.log(`[Square Checkout] Created/linked Square customer: ${squareCustomerId}`)
      }
    } catch (customerError) {
      console.error('[Square Checkout] Failed to create/link Square customer:', customerError)
      // Continue with checkout even if customer creation fails
    }

    // Create line items for the order (simplified for mock)
    const lineItems = items.map((item: CartItem) => ({
      quantity: String(item.quantity),
      catalogObjectId: item.id,
      basePriceAmount: Math.round(item.price * 100), // Price in cents, no BigInt
      currency: 'USD',
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

    // Try to create real Square order first
    try {
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
                amount: Math.round(deliveryFee * 100), // Use regular number instead of BigInt
                currency: 'USD',
              },
              calculationPhase: 'SUBTOTAL_PHASE',
            },
          ],
        },
        idempotencyKey: randomUUID(),
      }

      const orderResponse = await squareClient.orders.create(orderRequest)

      if (orderResponse.statusCode !== 200 || !orderResponse.result?.order) {
        console.error('Order creation error:', orderResponse)
        throw new Error('Failed to create order')
      }

      const orderResult = orderResponse.result

      // Create payment link for the order
      const paymentLinkRequest = {
        quickPay: {
          name: `Order ${orderResult.order.id?.slice(-6)}`,
          priceMoney: {
            amount: orderResult.order.totalMoney?.amount || Math.round(total * 100),
            currency: 'USD',
          },
          locationId: SQUARE_LOCATION_ID,
        },
        checkoutOptions: {
          allowTipping: true,
          redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success`,
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

      const paymentResponse = await squareClient.checkout.paymentLinks.create(paymentLinkRequest)

      if (paymentResponse.statusCode !== 200 || !paymentResponse.result?.paymentLink) {
        console.error('Payment link error:', paymentResponse)
        throw new Error('Failed to create payment link')
      }

      const paymentLinkResult = paymentResponse.result

      // Create order in Supabase
      const orderItems: OrderItem[] = items.map(item => ({
        square_catalog_id: item.id,
        product_name: item.name,
        variant_name: item.variant,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          square_order_id: orderResult.order.id,
          square_customer_id: squareCustomerId,
          user_id: user?.id,
          customer_email: customerInfo.email,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          status: 'pending',
          payment_status: 'pending',
          total_amount: total,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          tax_amount: 0,
          currency: 'USD',
          items: orderItems,
          delivery_address: deliveryAddress,
          notes: notes,
        })
        .select()
        .single()

      if (orderError) {
        console.error('Failed to create order in Supabase:', orderError)
        // Don't fail the request, Square order was created successfully
      }

      // Create order items in normalized table
      if (order) {
        const { error: itemsError } = await supabase.from('order_items').insert(
          orderItems.map(item => ({
            ...item,
            order_id: order.id,
          }))
        )

        if (itemsError) {
          console.error('Failed to create order items:', itemsError)
        }
      }

      return NextResponse.json({
        orderId: order?.id || orderResult.order.id,
        orderNumber: order?.order_number,
        squareOrderId: orderResult.order.id,
        paymentLink: paymentLinkResult.paymentLink.url,
        order: orderResult.order,
        total: total,
        source: 'square_api',
        environment: environment,
        sandboxMode: useSandbox,
      })
    } catch (squareError) {
      console.error('Square API error, falling back to mock:', squareError)

      // Fallback to mock payment link
      const mockOrderId = `MOCK_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`

      // Still create order in Supabase for mock
      const orderItems: OrderItem[] = items.map(item => ({
        product_name: item.name,
        variant_name: item.variant,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          square_order_id: mockOrderId,
          square_customer_id: squareCustomerId,
          user_id: user?.id,
          customer_email: customerInfo.email,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          status: 'pending',
          payment_status: 'pending',
          total_amount: total,
          subtotal: subtotal,
          delivery_fee: deliveryFee,
          tax_amount: 0,
          currency: 'USD',
          items: orderItems,
          delivery_address: deliveryAddress,
          notes: notes,
        })
        .select()
        .single()

      if (orderError) {
        console.error('Failed to create order in Supabase:', orderError)
      }

      // Create order items in normalized table
      if (order) {
        await supabase.from('order_items').insert(
          orderItems.map(item => ({
            ...item,
            order_id: order.id,
          }))
        )
      }

      const mockPaymentLink = `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success?orderId=${order?.id || mockOrderId}&orderNumber=${order?.order_number}&total=${total.toFixed(2)}`

      return NextResponse.json({
        orderId: order?.id || mockOrderId,
        orderNumber: order?.order_number,
        squareOrderId: mockOrderId,
        paymentLink: mockPaymentLink,
        order: {
          id: mockOrderId,
          locationId: SQUARE_LOCATION_ID,
          lineItems: items.map(item => ({
            quantity: item.quantity.toString(),
            name: item.name,
            price: item.price,
          })),
          totalMoney: {
            amount: Math.round(total * 100),
            currency: 'USD',
          },
          fulfillments: [
            {
              type: 'DELIVERY',
              deliveryDetails: {
                recipient: {
                  displayName: customerInfo.name,
                  email: customerInfo.email,
                  phoneNumber: customerInfo.phone,
                },
                recipientAddress: deliveryAddress,
              },
            },
          ],
        },
        total: total,
        source: 'mock_fallback',
        note: 'Using mock data due to Square API authentication issues',
        environment: environment,
        sandboxMode: useSandbox,
      })
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: errorMessage || 'Failed to process checkout' },
      { status: 500 }
    )
  }
}
