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
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-destructive">Location Tracking Error</p>
            <p className="text-xs text-destructive/80 mt-0.5">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tracking) {
    return (
      <div className="bg-muted border border-border rounded-xl p-3">
        <div className="flex items-center gap-2">
          <Navigation className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Location tracking inactive</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-success/10 border border-success/20 rounded-xl p-3">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Navigation className="h-4 w-4 text-success" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-success rounded-full animate-pulse" />
        </div>
        <div>
          <p className="text-sm font-medium text-success">Location tracking active</p>
          {lastUpdate && (
            <p className="text-xs text-success/80 mt-0.5">
              Last updated {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
