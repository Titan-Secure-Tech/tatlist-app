import { createClient } from '@/lib/supabase/server'
import { CheckCircle, Package, ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import PaymentSuccessConfetti from './confetti-client'
import ClearCartClient from './clear-cart-client'
import { CartProvider } from '@/components/providers/CartProvider'
import type { Order } from '@/lib/types/orders'

interface PaymentSuccessPageProps {
  searchParams: {
    orderId?: string
    squareOrderId?: string
    orderNumber?: string
    total?: string
  }
}

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const { orderId, squareOrderId, orderNumber, total } = searchParams

  let order: Order | null = null
  let error: string | null = null

  // Try to fetch the order from database
  if (orderId || squareOrderId) {
    const supabase = await createClient()

    // Try by Supabase order ID first, then by Square order ID
    const query = orderId
      ? supabase.from('orders').select('*').eq('id', orderId).single()
      : supabase.from('orders').select('*').eq('square_order_id', squareOrderId).single()

    const { data, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching order:', fetchError)
      error = 'Unable to load order details'
    } else {
      order = data
    }
  }

  // Use order data if available, otherwise fall back to URL params
  const displayOrderNumber = order?.order_number || orderNumber
  const displayTotal = order?.total_amount || (total ? parseFloat(total) : null)
  const customerEmail = order?.customer_email

  return (
    <CartProvider>
      <ClearCartClient />
      <main className="min-h-screen bg-background">
        <PaymentSuccessConfetti />

        <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold">
                Tatlist
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/shop" className="text-sm font-medium">
                  Shop
                </Link>
                <Link href="/products" className="text-sm font-medium">
                  Products
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card className="text-center">
            <CardHeader className="pb-4">
              <div className="mx-auto w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <CardTitle className="text-2xl text-success">
                {order ? 'Order Confirmed!' : 'Payment Successful!'}
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                Thank you for your order.{' '}
                {order
                  ? 'Your order has been confirmed and will be processed shortly.'
                  : 'Your payment has been processed successfully.'}
              </p>

              {displayOrderNumber && (
                <div className="bg-secondary rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Order Number</div>
                  <div className="font-mono text-lg font-medium">{displayOrderNumber}</div>
                </div>
              )}

              {displayTotal && (
                <div className="bg-secondary rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Total Paid</div>
                  <div className="text-xl font-bold text-success">
                    ${typeof displayTotal === 'number' ? displayTotal.toFixed(2) : displayTotal}
                  </div>
                </div>
              )}

              {order && order.items && (
                <div className="bg-secondary rounded-xl p-4 text-left">
                  <div className="text-sm text-muted-foreground mb-3">Order Items</div>
                  <div className="space-y-2">
                    {(order.items as Array<Record<string, unknown>>).map(
                      (item: Record<string, unknown>, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <div>
                            <span className="font-medium">{item.product_name}</span>
                            {item.variant_name && (
                              <span className="text-muted-foreground"> - {item.variant_name}</span>
                            )}
                            <span className="text-muted-foreground"> x{item.quantity}</span>
                          </div>
                          <div className="font-medium">
                            ${(item.total_price || item.unit_price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      )
                    )}
                    {order.delivery_fee > 0 && (
                      <div className="flex justify-between text-sm pt-2 border-t">
                        <span>Delivery Fee</span>
                        <span className="font-medium">${order.delivery_fee.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {order?.delivery_address && (
                <div className="bg-secondary rounded-xl p-4 text-left">
                  <div className="text-sm text-muted-foreground mb-2">Delivery Address</div>
                  <div className="text-sm">
                    <div className="font-medium">{order.customer_name}</div>
                    <div>{(order.delivery_address as Record<string, unknown>).line1}</div>
                    {(order.delivery_address as Record<string, unknown>).line2 && (
                      <div>{(order.delivery_address as Record<string, unknown>).line2}</div>
                    )}
                    <div>
                      {(order.delivery_address as Record<string, unknown>).city},{' '}
                      {(order.delivery_address as Record<string, unknown>).state}{' '}
                      {(order.delivery_address as Record<string, unknown>).postalCode}
                    </div>
                  </div>
                </div>
              )}

              <div className="border border-border rounded-xl p-4 bg-info/10">
                <div className="flex items-center gap-3 mb-2">
                  <Package className="w-5 h-5 text-info" />
                  <div className="font-medium text-foreground">What happens next?</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <ul className="space-y-1 text-left">
                    <li>
                      • You&apos;ll receive an order confirmation email
                      {customerEmail ? ` at ${customerEmail}` : ' shortly'}
                    </li>
                    <li>• Your order will be processed within 24 hours</li>
                    <li>• Local delivery typically takes 1-3 hours</li>
                    <li>• You&apos;ll get email confirmation once order is delivered</li>
                  </ul>
                </div>
              </div>

              {error && (
                <div className="border border-border rounded-xl p-4 bg-warning/10">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-warning" />
                    <div className="text-sm text-muted-foreground">{error}</div>
                  </div>
                </div>
              )}

              <div className="pt-4 space-y-3">
                <Button asChild className="w-full">
                  <Link href="/shop">Continue Shopping</Link>
                </Button>

                <Button variant="outline" asChild className="w-full">
                  <Link href="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>

              <div className="text-xs text-muted-foreground pt-4">
                <p>
                  Need help? Contact us at{' '}
                  <a href="mailto:support@tatlist.com" className="text-brand hover:underline">
                    support@tatlist.com
                  </a>
                </p>
                {displayOrderNumber && (
                  <p className="mt-2">
                    Please reference order number <strong>{displayOrderNumber}</strong> in any
                    correspondence.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </CartProvider>
  )
}
