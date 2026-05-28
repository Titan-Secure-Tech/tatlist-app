'use client'

import { useState, useEffect } from 'react'
import { Truck, Loader2, CheckCircle2, AlertCircle, Calendar } from 'lucide-react'

interface Driver {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
}

interface DriverAssignmentProps {
  orderId: string
  currentDriverId?: string | null
  onAssignmentComplete?: () => void
}

export function DriverAssignment({
  orderId,
  currentDriverId,
  onAssignmentComplete,
}: DriverAssignmentProps) {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string>(currentDriverId || '')
  const [estimatedTime, setEstimatedTime] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDrivers()
  }, [])

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/admin/drivers')
      if (!response.ok) throw new Error('Failed to fetch drivers')

      const data = await response.json()
      setDrivers(data.drivers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drivers')
    } finally {
      setFetching(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedDriverId) {
      setError('Please select a driver')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/admin/deliveries/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          driverId: selectedDriverId,
          estimatedDeliveryTime: estimatedTime || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign driver')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      if (onAssignmentComplete) {
        onAssignmentComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign driver')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Loading drivers...</span>
        </div>
      </div>
    )
  }

  if (drivers.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">No drivers available. Please add drivers to the system.</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4" />
          Assign Driver
        </h3>
      </div>

      {/* Driver Selection */}
      <div>
        <label htmlFor="driver-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select Driver
        </label>
        <select
          id="driver-select"
          value={selectedDriverId}
          onChange={e => setSelectedDriverId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
        >
          <option value="">-- Select a driver --</option>
          {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.first_name} {driver.last_name} {driver.phone && `(${driver.phone})`}
            </option>
          ))}
        </select>
      </div>

      {/* Estimated Delivery Time */}
      <div>
        <label
          htmlFor="estimated-time"
          className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
        >
          <Calendar className="h-4 w-4" />
          Estimated Delivery Time (Optional)
        </label>
        <input
          id="estimated-time"
          type="datetime-local"
          value={estimatedTime}
          onChange={e => setEstimatedTime(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-black focus:border-black"
        />
      </div>

      {/* Assign Button */}
      <button
        onClick={handleAssign}
        disabled={loading || !selectedDriverId}
        className="w-full px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Assigning...
          </>
        ) : (
          <>
            <Truck className="h-4 w-4" />
            Assign Driver
          </>
        )}
      </button>

      {/* Success Message */}
      {success && (
        <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
          <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-800">Driver assigned successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}
