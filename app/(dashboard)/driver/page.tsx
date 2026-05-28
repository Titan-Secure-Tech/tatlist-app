import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Truck, Package, AlertCircle } from 'lucide-react'
import { DeliveryCard } from '@/components/driver/DeliveryCard'
import Link from 'next/link'

type DeliveryStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
type OrderStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

interface Delivery {
  delivery_id: string
  order_id: string
  order_number: string
  customer_name: string
  delivery_address: {
    line1?: string
    line2?: string
    city?: string
    state?: string
    postalCode?: string
    street?: string
    zipCode?: string
  }
  delivery_status: DeliveryStatus
  order_status: OrderStatus
  estimated_delivery_time: string | null
  total: number
  item_count: number
}

export default async function DriverDashboardPage() {
  const supabase = await createClient()

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verify user is a driver
  const { data: profile } = await supabase
    .from('users')
    .select('role, first_name')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'driver') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-lg font-semibold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700 mb-4">
            This page is only accessible to drivers. Please contact an administrator if you need
            driver access.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Go to Home
          </Link>
        </div>
      </div>
    )
  }

  // Fetch driver's active deliveries
  const { data: deliveries, error } = await supabase.rpc('get_driver_active_deliveries', {
    driver_user_id: user.id,
  })

  if (error) {
    console.error('Error fetching driver deliveries:', error)
  }

  const activeDeliveries = (deliveries || []) as Delivery[]

  // Separate deliveries by status
  const inProgressDeliveries = activeDeliveries.filter(d => d.delivery_status === 'in_progress')
  const assignedDeliveries = activeDeliveries.filter(d => d.delivery_status === 'assigned')

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">Driver Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {profile.first_name || 'Driver'}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
          <Truck className="h-5 w-5 text-gray-700" />
          <span className="font-semibold text-gray-900">{activeDeliveries.length}</span>
          <span className="text-sm text-gray-600">
            Active {activeDeliveries.length === 1 ? 'Delivery' : 'Deliveries'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-black">{inProgressDeliveries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Assigned</p>
              <p className="text-2xl font-bold text-black">{assignedDeliveries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Active</p>
              <p className="text-2xl font-bold text-black">{activeDeliveries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* In Progress Deliveries */}
      {inProgressDeliveries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
            <Truck className="h-5 w-5" />
            In Progress ({inProgressDeliveries.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressDeliveries.map(delivery => (
              <DeliveryCard key={delivery.delivery_id} delivery={delivery} />
            ))}
          </div>
        </div>
      )}

      {/* Assigned Deliveries */}
      {assignedDeliveries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-black mb-4 flex items-center gap-2">
            <Package className="h-5 w-5" />
            Assigned ({assignedDeliveries.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedDeliveries.map(delivery => (
              <DeliveryCard key={delivery.delivery_id} delivery={delivery} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeDeliveries.length === 0 && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-black mb-2">No Active Deliveries</h2>
          <p className="text-gray-600">
            You don&apos;t have any active deliveries at the moment. Check back later or contact
            dispatch.
          </p>
        </div>
      )}
    </div>
  )
}
