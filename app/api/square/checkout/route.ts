import { NextRequest, NextResponse } from 'next/server'
import { getSquareAPIClient } from '@/lib/square/api-client'
import { isSandboxUser } from '@/lib/square/client-config'
import { createClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'
import type { OrderItem } from '@/lib/types/orders'
import { mailgunService } from '@/lib/email/mailgun'

/**
 * Format phone number to E.164 format for Square API
 * Assumes US phone numbers if no country code provided
 */
function formatPhoneE164(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')

  // If starts with 1 and has 11 digits, add +
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`
  }

  // If 10 digits, assume US and add +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`
  }

  // If already starts with + return as-is
  if (phone.startsWith('+')) {
    return phone
  }

  // Default: assume US and add +1
  return `+1${digitsOnly}`
}

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
      fulfillmentType = 'delivery',
    }: {
      items: CartItem[]
      deliveryAddress: DeliveryAddress
      customerInfo: CustomerInfo
      notes?: string
      fulfillmentType?: 'delivery' | 'pickup'
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

    // Get appropriate Square API client (direct HTTP, not SDK)
    const squareConfig = getSquareAPIClient(useSandbox)
    const { client: squareAPIClient, locationId: SQUARE_LOCATION_ID, environment } = squareConfig

    console.log(
      `[Square Checkout] Using ${environment} mode for ${customerInfo.email} (reason: ${sandboxReason})`
    )

    // Format phone number to E.164 format (do this outside try-catch so it's available throughout)
    const formattedPhone = formatPhoneE164(customerInfo.phone)

    // Create or get Square customer using direct API
    let squareCustomerId: string | null = null
    try {
      // Parse customer name into first/last
      const nameParts = customerInfo.name.trim().split(/\s+/)
      const givenName = nameParts[0] || ''
      const familyName = nameParts.slice(1).join(' ') || ''

      // Search for existing customer by email
      const searchResponse = await squareAPIClient.searchCustomers({
        query: {
          filter: {
            email_address: {
              exact: customerInfo.email.toLowerCase(),
            },
          },
        },
        limit: 1,
      })

      if (searchResponse.customers && searchResponse.customers.length > 0) {
        squareCustomerId = searchResponse.customers[0].id
        console.log(`[Square Checkout] Found existing Square customer: ${squareCustomerId}`)
      } else {
        // Create new customer
        const createResponse = await squareAPIClient.createCustomer({
          given_name: givenName,
          family_name: familyName,
          email_address: customerInfo.email.toLowerCase(),
          phone_number: formattedPhone,
          reference_id: user?.id,
        })

        squareCustomerId = createResponse.customer.id
        console.log(`[Square Checkout] Created new Square customer: ${squareCustomerId}`)
      }
    } catch (customerError) {
      console.error('[Square Checkout] Failed to create/link Square customer:', customerError)
      // Continue with checkout even if customer creation fails
    }

    // Create line items for the order
    const lineItems = items.map((item: CartItem) => ({
      quantity: String(item.quantity),
      base_price_money: {
        amount: Math.round(item.price * 100), // Price in cents
        currency: 'USD',
      },
      name: item.name,
      variation_name: item.variant,
    }))

    // Calculate total
    const subtotal = items.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    )

    // Add delivery fee
    const deliveryFee = 5.0 // $5 flat delivery fee
    const total = subtotal + deliveryFee

    // Try to create real Square order using direct API
    try {
      // Create the order with direct API call
      const orderRequest = {
        idempotency_key: randomUUID(),
        order: {
          location_id: SQUARE_LOCATION_ID,
          line_items: lineItems,
          fulfillments: [
            {
              type: 'DELIVERY',
              state: 'PROPOSED',
              delivery_details: {
                recipient: {
                  display_name: customerInfo.name,
                  phone_number: formattedPhone,
                  email_address: customerInfo.email,
                  address: {
                    address_line_1: deliveryAddress.line1,
                    address_line_2: deliveryAddress.line2,
                    locality: deliveryAddress.city,
                    administrative_district_level_1: deliveryAddress.state,
                    postal_code: deliveryAddress.postalCode,
                    country: 'US',
                  },
                },
                schedule_type: 'SCHEDULED',
                deliver_at: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
              },
            },
          ],
          service_charges: [
            {
              name: 'Delivery Fee',
              amount_money: {
                amount: Math.round(deliveryFee * 100),
                currency: 'USD',
              },
              calculation_phase: 'SUBTOTAL_PHASE',
            },
          ],
        },
      }

      const orderResponse = await squareAPIClient.createOrder(orderRequest)

      if (!orderResponse.order) {
        console.error('Order creation error:', orderResponse)
        throw new Error('Failed to create order')
      }

      // Create payment link for the order using direct API
      // Build redirect URL with Square order ID (Supabase order created later)
      const redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/payment-success?squareOrderId=${orderResponse.order.id}&total=${total}`

      const paymentLinkRequest = {
        quick_pay: {
          name: `Order ${orderResponse.order.id?.slice(-6)}`,
          price_money: {
            amount: orderResponse.order.total_money?.amount || Math.round(total * 100),
            currency: 'USD',
          },
          location_id: SQUARE_LOCATION_ID,
        },
        checkout_options: {
          allow_tipping: true,
          redirect_url: redirectUrl,
          merchant_support_email: 'support@tatlist.com',
        },
        pre_populated_data: {
          buyer_email: customerInfo.email,
          buyer_phone_number: formattedPhone,
          buyer_address: {
            address_line_1: deliveryAddress.line1,
            address_line_2: deliveryAddress.line2,
            locality: deliveryAddress.city,
            administrative_district_level_1: deliveryAddress.state,
            postal_code: deliveryAddress.postalCode,
            country: 'US',
          },
        },
      }

      const paymentResponse = await squareAPIClient.createPaymentLink(paymentLinkRequest)

      if (!paymentResponse.payment_link) {
        console.error('Payment link error:', paymentResponse)
        throw new Error('Failed to create payment link')
      }

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
          order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          square_order_id: orderResponse.order.id,
          square_customer_id: squareCustomerId,
          user_id: user?.id,
          customer_email: customerInfo.email,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          status: 'pending',
          payment_status: 'pending',
          total: total,
          subtotal: subtotal,
          delivery_fee: fulfillmentType === 'delivery' ? deliveryFee : 0,
          tax_amount: 0,
          currency: 'USD',
          fulfillment_type: fulfillmentType,
          delivery_address: fulfillmentType === 'delivery' ? deliveryAddress : null,
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

      // Send order confirmation email to customer
      try {
        await mailgunService.sendOrderConfirmation(customerInfo.email, {
          orderId: order?.id || orderResponse.order.id,
          customerName: customerInfo.name,
          items: items,
          subtotal: subtotal,
          deliveryFee: fulfillmentType === 'delivery' ? deliveryFee : 0,
          tax: 0,
          total: total,
          deliveryAddress: deliveryAddress,
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the request if email fails
      }

      // Send internal order notification to orders@tatlist.com
      try {
        await mailgunService.sendInternalOrderNotification({
          orderId: order?.id || orderResponse.order.id,
          orderNumber: order?.order_number,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email,
          customerPhone: customerInfo.phone,
          items: items,
          subtotal: subtotal,
          deliveryFee: fulfillmentType === 'delivery' ? deliveryFee : 0,
          tax: 0,
          total: total,
          deliveryAddress: deliveryAddress,
          paymentMethod: 'Square',
        })
      } catch (emailError) {
        console.error('Failed to send internal order notification:', emailError)
        // Don't fail the request if email fails
      }

      return NextResponse.json({
        orderId: order?.id || orderResponse.order.id,
        orderNumber: order?.order_number,
        squareOrderId: orderResponse.order.id,
        paymentLink: paymentResponse.payment_link.url,
        order: orderResponse.order,
        total: total,
        source: 'square_api',
        environment: environment,
        sandboxMode: useSandbox,
      })
    } catch (squareError) {
      // Log detailed error information for debugging
      console.error('Square API Error Details:', {
        error: squareError,
        environment,
        useSandbox,
        sandboxReason,
        email: customerInfo.email,
        errorMessage: squareError instanceof Error ? squareError.message : 'Unknown error',
        errorStack: squareError instanceof Error ? squareError.stack : undefined,
      })

      // In production, NEVER fall back to mock payment - always fail properly
      // This ensures we never skip payment collection
      const errorMessage =
        squareError instanceof Error
          ? squareError.message
          : 'Failed to create payment link with Square'

      return NextResponse.json(
        {
          error: 'Payment processing is currently unavailable. Please try again later.',
          details: errorMessage,
          environment,
          debugInfo: {
            hasAccessToken: !!squareConfig.client,
            hasLocationId: !!SQUARE_LOCATION_ID,
            environment,
            useSandbox,
          },
        },
        { status: 500 }
      )
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
