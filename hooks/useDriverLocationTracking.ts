'use client'

import { useEffect, useRef, useState } from 'react'

interface LocationTrackingOptions {
  deliveryId: string
  enabled: boolean
  updateInterval?: number // milliseconds, default 10 seconds
}

interface LocationState {
  tracking: boolean
  lastUpdate: Date | null
  error: string | null
}

export function useDriverLocationTracking({
  deliveryId,
  enabled,
  updateInterval = 10000,
}: LocationTrackingOptions) {
  const [state, setState] = useState<LocationState>({
    tracking: false,
    lastUpdate: null,
    error: null,
  })

  const watchIdRef = useRef<number | null>(null)
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null)
  const lastPositionRef = useRef<GeolocationPosition | null>(null)

  useEffect(() => {
    if (!enabled || !deliveryId) {
      stopTracking()
      return
    }

    startTracking()

    return () => {
      stopTracking()
    }
  }, [enabled, deliveryId])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }))
      return
    }

    // Request permission and start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      position => {
        lastPositionRef.current = position
        setState(prev => ({ ...prev, tracking: true, error: null }))
      },
      error => {
        let errorMessage = 'Failed to get location'
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
        }
        setState(prev => ({ ...prev, error: errorMessage, tracking: false }))
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    )

    // Set up periodic updates to server
    updateTimerRef.current = setInterval(() => {
      if (lastPositionRef.current) {
        sendLocationUpdate(lastPositionRef.current)
      }
    }, updateInterval)
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (updateTimerRef.current) {
      clearInterval(updateTimerRef.current)
      updateTimerRef.current = null
    }

    setState(prev => ({ ...prev, tracking: false }))
  }

  const sendLocationUpdate = async (position: GeolocationPosition) => {
    try {
      const response = await fetch(`/api/driver/deliveries/${deliveryId}/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed,
          heading: position.coords.heading,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update location')
      }

      setState(prev => ({ ...prev, lastUpdate: new Date(), error: null }))
    } catch (error) {
      console.error('Error updating location:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to update location',
      }))
    }
  }

  return state
}
