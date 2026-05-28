'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Package, Clock, Phone, Mail, ChevronRight } from 'lucide-react'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'

type DeliveryStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'
type OrderStatus =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

interface DeliveryCardProps {
  delivery: {
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
}

const DELIVERY_STATUS_CONFIG: Record<
  DeliveryStatus,
  { label: string; color: string; bgColor: string }
> = {
  pending: {
    label: 'Pending',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
  },
  assigned: {
    label: 'Assigned',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
  },
  failed: {
    label: 'Failed',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
  },
}

export function DeliveryCard({ delivery }: DeliveryCardProps) {
  const deliveryConfig = DELIVERY_STATUS_CONFIG[delivery.delivery_status]

  // Format address
  const formatAddress = () => {
    const addr = delivery.delivery_address
    if (!addr) return 'No address provided'

    const street = addr.line1 || addr.street || ''
    const city = addr.city || ''
    const state = addr.state || ''
    const zip = addr.postalCode || addr.zipCode || ''

    return `${street}, ${city}, ${state} ${zip}`.replace(/,\s*,/g, ',').trim()
  }

  // Format estimated delivery time
  const formatEstimatedTime = () => {
    if (!delivery.estimated_delivery_time) return null

    const date = new Date(delivery.estimated_delivery_time)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()

    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <Link
      href={`/driver/deliveries/${delivery.delivery_id}`}
      className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-black mb-1">
            Order #{delivery.order_number || delivery.order_id.slice(0, 8).toUpperCase()}
          </h3>
          <p className="text-sm text-gray-600">{delivery.customer_name}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-3">
        <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-gray-700 flex-1">{formatAddress()}</p>
      </div>

      {/* Items and Total */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Package className="h-4 w-4" />
          <span>
            {delivery.item_count} {delivery.item_count === 1 ? 'item' : 'items'}
          </span>
        </div>
        <span className="text-sm font-semibold text-black">${delivery.total.toFixed(2)}</span>
      </div>

      {/* Estimated Time */}
      {delivery.estimated_delivery_time && (
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>{formatEstimatedTime()}</span>
        </div>
      )}

      {/* Status Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full font-medium px-2.5 py-1 text-sm ${deliveryConfig.color} ${deliveryConfig.bgColor}`}
        >
          {deliveryConfig.label}
        </span>
        <OrderStatusBadge status={delivery.order_status} size="sm" />
      </div>
    </Link>
  )
}
