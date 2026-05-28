'use client'

import { Navigation, AlertCircle, CheckCircle } from 'lucide-react'

interface LocationTrackingIndicatorProps {
  tracking: boolean
  lastUpdate: Date | null
  error: string | null
}

export function LocationTrackingIndicator({
  tracking,
  lastUpdate,
  error,
}: LocationTrackingIndicatorProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-900">Location Tracking Error</p>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tracking) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-gray-400" />
          <p className="text-sm text-gray-600">Location tracking inactive</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Navigation className="h-4 w-4 text-green-600" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-900">Location tracking active</p>
          {lastUpdate && (
            <p className="text-xs text-green-700 mt-0.5">
              Last updated {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
