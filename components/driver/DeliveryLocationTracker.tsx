'use client'

import { useDriverLocationTracking } from '@/hooks/useDriverLocationTracking'
import { LocationTrackingIndicator } from './LocationTrackingIndicator'

interface DeliveryLocationTrackerProps {
  deliveryId: string
  deliveryStatus: string
}

export function DeliveryLocationTracker({
  deliveryId,
  deliveryStatus,
}: DeliveryLocationTrackerProps) {
  const { tracking, lastUpdate, error } = useDriverLocationTracking({
    deliveryId,
    enabled: deliveryStatus === 'in_progress',
    updateInterval: 10000, // Update every 10 seconds
  })

  // Only show indicator when delivery is in progress
  if (deliveryStatus !== 'in_progress') {
    return null
  }

  return (
    <div className="mb-4">
      <LocationTrackingIndicator tracking={tracking} lastUpdate={lastUpdate} error={error} />
    </div>
  )
}
