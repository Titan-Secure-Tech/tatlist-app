import Link from 'next/link'
import { Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import type { OrderStatus } from '@/lib/types/orders'

interface Order {
  id: string
  order_number: string
  status: OrderStatus
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

function getStatusColor(status: OrderStatus) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'processing':
    case 'paid':
      return 'bg-blue-100 text-blue-800'
    case 'shipped':
      return 'bg-purple-100 text-purple-800'
    case 'delivered':
      return 'bg-green-100 text-green-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    case 'refunded':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(status: OrderStatus) {
  const labels: Record<OrderStatus, string> = {
    pending: 'Pending',
    processing: 'Processing',
    paid: 'Paid',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
  }
  return labels[status] || status
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
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-black mb-4">Sign In Required</h1>
        <p className="text-gray-600 mb-8">Please sign in to view your orders</p>
        <Link
          href="/login"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
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
        <h1 className="text-2xl font-bold text-black mb-4">Error Loading Orders</h1>
        <p className="text-gray-600 mb-8">
          There was a problem loading your orders. Please try again later.
        </p>
      </div>
    )
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-black mb-4">No Orders Yet</h1>
        <p className="text-gray-600 mb-8">When you make your first purchase, it will appear here</p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">My Orders</h1>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200">
          {orders.map((order: Order) => {
            const itemCount = order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0
            const orderTotal = order.total || order.subtotal + order.delivery_fee + order.tax_amount

            return (
              <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-black mb-1">
                      Order #{order.order_number || order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}{' '}
                      • {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black mb-1">${orderTotal.toFixed(2)}</p>
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
