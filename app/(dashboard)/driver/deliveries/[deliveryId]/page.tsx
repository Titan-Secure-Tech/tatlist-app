'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  MapPin,
  Package,
  Clock,
  Phone,
  Mail,
  Navigation,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Loader2,
} from 'lucide-react'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { ProofOfDeliveryModal } from '@/components/driver/ProofOfDeliveryModal'
import { DeliveryLocationTracker } from '@/components/driver/DeliveryLocationTracker'

type DeliveryStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
type OrderStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

interface DeliveryDetails {
  id: string
  order_id: string
  driver_id: string
  estimated_delivery_time: string | null
  actual_delivery_time: string | null
  route: unknown
  status: DeliveryStatus
  created_at: string
  updated_at: string
  order: {
    id: string
    order_number: string
    subtotal: number
    tax: number
    delivery_fee: number
    total: number
    delivery_address: {
      line1?: string
      line2?: string
      city?: string
      state?: string
      postalCode?: string
      street?: string
      zipCode?: string
    }
    status: OrderStatus
    notes: string | null
    created_at: string
    customer: {
      id: string
      first_name: string
      last_name: string
      email: string
      phone: string | null
    }
    order_items: Array<{
      id: string
      quantity: number
      price_at_time: number
      product: {
        name: string
        sku: string
        images: string[]
      }
    }>
  }
}

const DELIVERY_STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: { label: 'Pending', color: 'text-foreground', bgColor: 'bg-secondary' },
  assigned: { label: 'Assigned', color: 'text-info', bgColor: 'bg-info/20' },
  in_progress: { label: 'In Progress', color: 'text-warning', bgColor: 'bg-warning/20' },
  completed: { label: 'Completed', color: 'text-success', bgColor: 'bg-success/20' },
  failed: { label: 'Failed', color: 'text-destructive', bgColor: 'bg-destructive/20' },
}

export default function DeliveryDetailPage({
  params,
}: {
  params: Promise<{ deliveryId: string }>
}) {
  const { deliveryId } = use(params)
  const router = useRouter()
  const [delivery, setDelivery] = useState<DeliveryDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPODModal, setShowPODModal] = useState(false)

  useEffect(() => {
    fetchDeliveryDetails()
  }, [deliveryId])

  const fetchDeliveryDetails = async () => {
    try {
      const response = await fetch(`/api/driver/deliveries/${deliveryId}`)
      if (!response.ok) throw new Error('Failed to fetch delivery details')

      const data = await response.json()
      setDelivery(data.delivery)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load delivery')
    } finally {
      setLoading(false)
    }
  }

  const updateDeliveryStatus = async (newStatus: DeliveryStatus) => {
    if (!delivery) return

    if (!confirm(`Are you sure you want to mark this delivery as "${newStatus}"?`)) {
      return
    }

    setUpdating(true)
    setError(null)

    try {
      const response = await fetch(`/api/driver/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          ...(newStatus === 'completed' && { actual_delivery_time: new Date().toISOString() }),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update delivery')
      }

      // Refresh delivery details
      await fetchDeliveryDetails()

      // If completed, redirect back to dashboard after a short delay
      if (newStatus === 'completed') {
        setTimeout(() => router.push('/driver'), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update delivery')
    } finally {
      setUpdating(false)
    }
  }

  const handlePODSuccess = async () => {
    setShowPODModal(false)

    // Update delivery status to completed
    await updateDeliveryStatus('completed')
  }

  const formatAddress = (address: DeliveryDetails['order']['delivery_address']) => {
    if (!address) return 'No address provided'

    const street = address.line1 || address.street || ''
    const line2 = address.line2 || ''
    const city = address.city || ''
    const state = address.state || ''
    const zip = address.postalCode || address.zipCode || ''

    return {
      street: `${street}${line2 ? ` ${line2}` : ''}`,
      cityState: `${city}, ${state} ${zip}`.replace(/,\s*,/g, ',').trim(),
    }
  }

  const openInMaps = () => {
    if (!delivery?.order.delivery_address) return

    const addr = delivery.order.delivery_address
    const addressString = `${addr.line1 || addr.street}, ${addr.city}, ${addr.state} ${addr.postalCode || addr.zipCode}`
    const encodedAddress = encodeURIComponent(addressString)

    // Try to use Apple Maps on iOS, Google Maps otherwise
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const mapsUrl = isIOS
      ? `maps://maps.apple.com/?q=${encodedAddress}`
      : `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`

    window.open(mapsUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !delivery) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
          <h2 className="text-lg font-semibold text-destructive mb-2">Error Loading Delivery</h2>
          <p className="text-destructive mb-4">{error || 'Delivery not found'}</p>
          <Link
            href="/driver"
            className="inline-block px-4 py-2 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-md"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const deliveryConfig = DELIVERY_STATUS_CONFIG[delivery.status]
  const { street, cityState } = formatAddress(delivery.order.delivery_address)
  const customer = delivery.order.customer
  const customerName = `${customer.first_name} ${customer.last_name}`.trim()

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/driver" className="p-2 hover:bg-accent rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">
            Order #{delivery.order.order_number || delivery.order_id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-muted-foreground mt-1">Delivery Details</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium px-3 py-1.5 text-base ${deliveryConfig.color} ${deliveryConfig.bgColor}`}
        >
          {deliveryConfig.label}
        </span>
      </div>

      {/* Location Tracking Indicator */}
      <DeliveryLocationTracker deliveryId={deliveryId} deliveryStatus={delivery.status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Delivery Info */}
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Information</h2>

            <div className="space-y-4">
              {/* Customer */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Customer</p>
                <p className="text-base font-semibold text-foreground">{customerName}</p>
              </div>

              {/* Address */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Delivery Address
                </p>
                <div className="text-base text-foreground">
                  <p>{street}</p>
                  <p>{cityState}</p>
                </div>
                <button
                  onClick={openInMaps}
                  className="mt-2 flex items-center gap-2 text-sm text-brand hover:text-brand"
                >
                  <Navigation className="h-4 w-4" />
                  Open in Maps
                </button>
              </div>

              {/* Contact */}
              <div className="flex flex-wrap gap-4">
                {customer.phone && (
                  <a
                    href={`tel:${customer.phone}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-foreground"
                  >
                    <Phone className="h-4 w-4" />
                    {customer.phone}
                  </a>
                )}
                {customer.email && (
                  <a
                    href={`mailto:${customer.email}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </a>
                )}
              </div>

              {/* Estimated Time */}
              {delivery.estimated_delivery_time && (
                <div>
                  <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Estimated Delivery
                  </p>
                  <p className="text-base text-foreground">
                    {new Date(delivery.estimated_delivery_time).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items ({delivery.order.order_items.length})
            </h2>
            <div className="space-y-4">
              {delivery.order.order_items.map(item => (
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>

            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-3">
              {delivery.status === 'assigned' && (
                <button
                  onClick={() => updateDeliveryStatus('in_progress')}
                  disabled={updating}
                  className="w-full px-4 py-3 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {updating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      Start Delivery
                    </>
                  )}
                </button>
              )}

              {delivery.status === 'in_progress' && (
                <>
                  <button
                    onClick={() => setShowPODModal(true)}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-success text-white rounded-md font-medium hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark as Delivered
                  </button>

                  <button
                    onClick={() => updateDeliveryStatus('failed')}
                    disabled={updating}
                    className="w-full px-4 py-3 bg-destructive text-white rounded-md font-medium hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4" />
                        Mark as Failed
                      </>
                    )}
                  </button>
                </>
              )}

              {(delivery.status === 'completed' || delivery.status === 'failed') && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Delivery is {delivery.status}. No actions available.
                </p>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">
                  ${delivery.order.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span className="font-medium text-foreground">${delivery.order.tax.toFixed(2)}</span>
              </div>
              {delivery.order.delivery_fee && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium text-foreground">
                    ${delivery.order.delivery_fee.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="pt-3 border-t border-border flex justify-between">
                <span className="font-semibold text-foreground">Total</span>
                <span className="font-bold text-foreground">${delivery.order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="bg-background border border-border rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Order Status</h2>
            <OrderStatusBadge status={delivery.order.status} />
          </div>
        </div>
      </div>

      {/* Proof of Delivery Modal */}
      <ProofOfDeliveryModal
        deliveryId={deliveryId}
        isOpen={showPODModal}
        onClose={() => setShowPODModal(false)}
        onSuccess={handlePODSuccess}
      />
    </div>
  )
}
