'use client'

import { useState } from 'react'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

type OrderStatusType =
  | 'pending'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'completed'
  | 'cancelled'

interface OrderManagementProps {
  orderId: string
  currentStatus: OrderStatusType
  onStatusUpdate?: () => void
}

const STATUS_TRANSITIONS: Record<string, { value: string; label: string }[]> = {
  pending: [
    { value: 'processing', label: 'Mark as Processing' },
    { value: 'cancelled', label: 'Cancel Order' },
  ],
  processing: [
    { value: 'ready_for_pickup', label: 'Ready for Pickup' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'cancelled', label: 'Cancel Order' },
  ],
  ready_for_pickup: [
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Mark as Delivered' },
    { value: 'cancelled', label: 'Cancel Order' },
  ],
  out_for_delivery: [
    { value: 'delivered', label: 'Mark as Delivered' },
    { value: 'cancelled', label: 'Cancel Delivery' },
  ],
  delivered: [{ value: 'completed', label: 'Complete Order' }],
  completed: [],
  cancelled: [],
}

export function OrderManagement({ orderId, currentStatus, onStatusUpdate }: OrderManagementProps) {
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const availableTransitions = STATUS_TRANSITIONS[currentStatus] || []

  const handleStatusUpdate = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to update the order status to "${newStatus}"?`)) {
      return
    }

    setUpdating(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          notes: notes.trim() || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update order status')
      }

      setSuccess(true)
      setNotes('')
      setTimeout(() => setSuccess(false), 3000)

      if (onStatusUpdate) {
        onStatusUpdate()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return (
      <div className="p-4 bg-muted border border-border rounded-xl">
        <div className="flex items-center gap-2 text-muted-foreground">
          <OrderStatusBadge status={currentStatus} />
          <span className="text-sm">Order is {currentStatus}. No further actions available.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-2">Update Order Status</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Current status: <OrderStatusBadge status={currentStatus} size="sm" />
        </p>
      </div>

      {/* Notes Input */}
      <div>
        <label htmlFor="status-notes" className="block text-sm font-medium text-foreground mb-2">
          Notes (Optional)
        </label>
        <textarea
          id="status-notes"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-brand focus:border-brand"
          placeholder="Add notes about this status change..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {availableTransitions.map(transition => (
          <button
            key={transition.value}
            onClick={() => handleStatusUpdate(transition.value)}
            disabled={updating}
            className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              transition.value === 'cancelled'
                ? 'bg-destructive text-white hover:bg-destructive/90'
                : transition.value === 'delivered' || transition.value === 'completed'
                  ? 'bg-success text-white hover:bg-success/90'
                  : 'bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground hover:opacity-90'
            }`}
          >
            {updating ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Updating...
              </span>
            ) : (
              transition.label
            )}
          </button>
        ))}
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/20 rounded-md">
          <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
          <p className="text-sm text-success">Order status updated successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
    </div>
  )
}
