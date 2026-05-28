'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle2, Circle } from 'lucide-react'
import { OrderStatusBadge } from './OrderStatusBadge'

type OrderStatusType =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

interface StatusHistoryItem {
  id: string
  from_status: string | null
  to_status: OrderStatusType
  changed_at: string
  notes: string | null
  changed_by_user?: {
    first_name: string
    last_name: string
    email: string
  }
}

interface OrderStatusTimelineProps {
  orderId: string
  currentStatus: OrderStatusType
}

export function OrderStatusTimeline({ orderId, currentStatus }: OrderStatusTimelineProps) {
  const [history, setHistory] = useState<StatusHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatusHistory = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`)
      if (!response.ok) throw new Error('Failed to fetch status history')

      const data = await response.json()
      setHistory(data.history || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load status history')
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchStatusHistory()
  }, [fetchStatusHistory])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-sm text-red-600">Failed to load order history. Please try again.</div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Order Status History</h3>
        <OrderStatusBadge status={currentStatus} />
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-gray-600">No status updates yet.</p>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>

          {/* Timeline items */}
          <div className="space-y-6">
            {history.map((item, index) => (
              <div key={item.id} className="relative flex items-start gap-4">
                {/* Timeline dot */}
                <div className="relative z-10 flex-shrink-0">
                  {index === history.length - 1 ? (
                    <div className="rounded-full bg-green-500 p-1.5">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="rounded-full bg-gray-300 p-1.5">
                      <Circle className="h-4 w-4 text-gray-600" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-0.5">
                  <div className="flex items-center gap-2 mb-1">
                    <OrderStatusBadge status={item.to_status} size="sm" />
                    <span className="text-sm text-gray-500">
                      {new Date(item.changed_at).toLocaleString()}
                    </span>
                  </div>

                  {item.from_status && (
                    <p className="text-sm text-gray-600 mb-1">
                      Changed from{' '}
                      <span className="font-medium">{item.from_status.replace(/_/g, ' ')}</span>
                    </p>
                  )}

                  {item.changed_by_user && (
                    <p className="text-xs text-gray-500">
                      By {item.changed_by_user.first_name} {item.changed_by_user.last_name}
                    </p>
                  )}

                  {item.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      {item.notes}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
