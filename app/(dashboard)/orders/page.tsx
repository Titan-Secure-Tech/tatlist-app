import Link from 'next/link'
import { Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'

type OrderStatusType =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

interface Order {
  id: string
  order_number: string
  status: OrderStatusType
  total: number
  subtotal: number
  delivery_fee: number
  tax_amount: number
  created_at: string
  order_items: {
    id: string
    product_name: string
    quantity: number
    unit_price: number
  }[]
}

export default async function OrdersPage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-4">Sign In Required</h1>
        <p className="text-muted-foreground mb-8">Please sign in to view your orders</p>
        <Link
          href="/login"
          className="inline-block bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground px-6 py-3 rounded-xl hover:opacity-90 transition-colors"
        >
          Sign In
        </Link>
      </div>
    )
  }

  // Fetch orders with order items
  const { data: orders, error } = await supabase
    .from('orders')
    .select(
      `
      id,
      order_number,
      status,
      total,
      subtotal,
      delivery_fee,
      tax_amount,
      created_at,
      order_items (
        id,
        product_name,
        quantity,
        unit_price
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching orders:', error)
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Orders</h1>
        <p className="text-muted-foreground mb-8">
          There was a problem loading your orders. Please try again later.
        </p>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-4">No Orders Yet</h1>
        <p className="text-muted-foreground mb-8">When you make your first purchase, it will appear here</p>
        <Link
          href="/products"
          className="inline-block bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground px-6 py-3 rounded-xl hover:opacity-90 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">My Orders</h1>

      <div className="bg-background border border-border rounded-xl overflow-hidden">
        <div className="divide-y divide-border">
          {orders.map((order: Order) => {
            const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
            const orderTotal = order.total || order.subtotal + order.delivery_fee + order.tax_amount

            return (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block p-6 hover:bg-accent transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">
                      Order #{order.order_number || order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      • {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground mb-1">${orderTotal.toFixed(2)}</p>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
