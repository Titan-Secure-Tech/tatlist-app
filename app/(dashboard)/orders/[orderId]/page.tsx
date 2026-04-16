import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline'
import { ProofOfDeliveryDisplay } from '@/components/orders/ProofOfDeliveryDisplay'
import { DeliveryTrackingMap } from '@/components/tracking/DeliveryTrackingMap'
import { Package, MapPin, Calendar, DollarSign } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface OrderItem {
  id: string
  quantity: number
  price_at_time: number
  product: {
    name: string
    sku: string
    images: string[]
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>
}) {
  const { orderId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch order details with items and delivery proof
  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (
        id,
        quantity,
        price_at_time,
        product:products (
          name,
          sku,
          images
        )
      ),
      delivery:deliveries (
        proof_photo_url,
        proof_signature_data,
        recipient_name,
        delivery_notes,
        actual_delivery_time
      )
    `
    )
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Order Not Found</h2>
          <p className="text-destructive/80 mb-4">
            The order you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to
            it.
          </p>
          <Link
            href="/orders"
            className="inline-block px-4 py-2 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-xl hover:opacity-90"
          >
            View All Orders
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order #{order.order_number}</h1>
          <p className="text-muted-foreground mt-1">
            Placed on {new Date(order.created_at).toLocaleDateString()}
          </p>
        </div>
        <OrderStatusBadge status={order.status} size="lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </h2>
            <div className="space-y-4">
              {order.order_items?.map((item: OrderItem) => (
                <div key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-0">
                  {item.product.images?.[0] && (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="h-16 w-16 rounded object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
                    <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-foreground">
                      ${(item.price_at_time * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">${item.price_at_time.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-Time Tracking */}
          {(order.status === 'out_for_delivery' || order.status === 'ready_for_pickup') && (
            <div className="bg-background border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Track Your Delivery</h2>
              <DeliveryTrackingMap orderId={orderId} />
            </div>
          )}

          {/* Status Timeline */}
          <div className="bg-background border border-border rounded-xl p-6">
            <OrderStatusTimeline orderId={orderId} currentStatus={order.status} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Order Summary
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium text-foreground">${order.tax.toFixed(2)}</span>
              </div>
              {order.delivery_fee && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium text-foreground">
                    ${order.delivery_fee.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-foreground">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          {order.delivery_address && (
            <div className="bg-background border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </h2>
              <address className="not-italic text-sm text-foreground space-y-1">
                <p>{order.delivery_address.street}</p>
                <p>
                  {order.delivery_address.city}, {order.delivery_address.state}{' '}
                  {order.delivery_address.zipCode}
                </p>
              </address>
            </div>
          )}

          {/* Delivery Date */}
          {order.delivery_date && (
            <div className="bg-background border border-border rounded-xl p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduled Delivery
              </h2>
              <p className="text-sm text-foreground">
                {new Date(order.delivery_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}

          {/* Proof of Delivery */}
          {order.delivery && order.delivery[0] && (
            <ProofOfDeliveryDisplay
              proof={{
                photo_url: order.delivery[0].proof_photo_url,
                signature_data: order.delivery[0].proof_signature_data,
                recipient_name: order.delivery[0].recipient_name,
                delivery_notes: order.delivery[0].delivery_notes,
                delivered_at: order.delivery[0].actual_delivery_time,
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
