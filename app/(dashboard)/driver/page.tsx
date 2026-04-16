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
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h2 className="text-lg font-semibold text-destructive mb-2">Access Denied</h2>
          <p className="text-destructive mb-4">
            This page is only accessible to drivers. Please contact an administrator if you need
            driver access.
          </p>
          <Link
            href="/"
            className="inline-block px-4 py-2 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-md"
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
          <h1 className="text-3xl font-bold text-foreground">Driver Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back, {profile.first_name || 'Driver'}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl">
          <Truck className="h-5 w-5 text-foreground" />
          <span className="font-semibold text-foreground">{activeDeliveries.length}</span>
          <span className="text-sm text-muted-foreground">
            Active {activeDeliveries.length === 1 ? 'Delivery' : 'Deliveries'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-warning/20 rounded-lg">
              <Truck className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-foreground">{inProgressDeliveries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-info/20 rounded-lg">
              <Package className="h-6 w-6 text-info" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned</p>
              <p className="text-2xl font-bold text-foreground">{assignedDeliveries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-background border border-border rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-success/20 rounded-lg">
              <Package className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Active</p>
              <p className="text-2xl font-bold text-foreground">{activeDeliveries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* In Progress Deliveries */}
      {inProgressDeliveries.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
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
          <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
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
        <div className="text-center py-12 bg-background border border-border rounded-xl">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Active Deliveries</h2>
          <p className="text-muted-foreground">
            You don&apos;t have any active deliveries at the moment. Check back later or contact
            dispatch.
          </p>
        </div>
      )}
    </div>
  )
}
