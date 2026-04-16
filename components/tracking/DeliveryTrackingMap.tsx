'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Truck, MapPin, Loader2, AlertCircle } from 'lucide-react'

interface DeliveryTrackingMapProps {
  orderId: string
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

interface TrackingData {
  trackable: boolean
  has_location?: boolean
  message?: string
  driver_location?: {
    latitude: number
    longitude: number
    updated_at: string
  }
  delivery_address?: {
    street?: string
    line1?: string
    city?: string
    state?: string
    postalCode?: string
    zipCode?: string
  }
  estimated_arrival?: string | null
  driver?: {
    name: string
    phone: string | null
  } | null
}

export function DeliveryTrackingMap({
  orderId,
  autoRefresh = true,
  refreshInterval = 10000, // 10 seconds default
}: DeliveryTrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const driverMarker = useRef<mapboxgl.Marker | null>(null)
  const destinationMarker = useRef<mapboxgl.Marker | null>(null)

  const [tracking, setTracking] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initialize Mapbox
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      setError('Mapbox access token not configured')
      setLoading(false)
      return
    }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

    // Fetch initial tracking data
    fetchTrackingData()

    // Set up auto-refresh
    let intervalId: NodeJS.Timeout | null = null
    if (autoRefresh) {
      intervalId = setInterval(fetchTrackingData, refreshInterval)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
      if (map.current) map.current.remove()
    }
  }, [orderId, autoRefresh, refreshInterval])

  const fetchTrackingData = async () => {
    try {
      const response = await fetch(`/api/customer/orders/${orderId}/tracking`)
      if (!response.ok) throw new Error('Failed to fetch tracking data')

      const data: TrackingData = await response.json()
      setTracking(data)

      if (data.trackable && data.has_location && data.driver_location) {
        initializeMap(data)
      }

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tracking')
    } finally {
      setLoading(false)
    }
  }

  const initializeMap = (data: TrackingData) => {
    if (!mapContainer.current || !data.driver_location) return

    const driverLat = data.driver_location.latitude
    const driverLng = data.driver_location.longitude

    // Initialize map if not already created
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [driverLng, driverLat],
        zoom: 13,
      })

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    }

    // Update or create driver marker
    if (driverMarker.current) {
      driverMarker.current.setLngLat([driverLng, driverLat])
    } else {
      // Create custom driver marker
      const el = document.createElement('div')
      el.className = 'driver-marker'
      el.innerHTML = `
        <div style="
          background-color: #000;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          border: 3px solid #fff;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2">
            <path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path>
            <circle cx="6.5" cy="16.5" r="2.5"></circle>
            <circle cx="16.5" cy="16.5" r="2.5"></circle>
          </svg>
        </div>
      `

      driverMarker.current = new mapboxgl.Marker({ element: el })
        .setLngLat([driverLng, driverLat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <strong>Driver Location</strong><br/>
              <small>Updated ${new Date(data.driver_location.updated_at).toLocaleTimeString()}</small>
            </div>`
          )
        )
        .addTo(map.current!)
    }

    // Add destination marker if address is available
    if (data.delivery_address && !destinationMarker.current) {
      // For now, we'll need to geocode the address or use coordinates from database
      // Placeholder: show a destination marker if we have coordinates
      // In production, you'd geocode the delivery address
    }

    // Fit map to show both driver and destination
    if (driverMarker.current) {
      map.current.flyTo({
        center: [driverLng, driverLat],
        zoom: 14,
        essential: true,
      })
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[400px] bg-secondary rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading tracking...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-[400px] bg-destructive/10 border border-destructive/20 rounded-xl flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  if (!tracking?.trackable) {
    return (
      <div className="w-full h-[400px] bg-muted border border-border rounded-xl flex items-center justify-center p-6">
        <div className="text-center">
          <MapPin className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{tracking?.message || 'Tracking not available'}</p>
        </div>
      </div>
    )
  }

  if (!tracking.has_location) {
    return (
      <div className="w-full h-[400px] bg-info/10 border border-info/20 rounded-xl flex items-center justify-center p-6">
        <div className="text-center">
          <Truck className="h-8 w-8 text-info mx-auto mb-2" />
          <p className="text-sm font-medium text-info mb-1">Driver Assigned</p>
          <p className="text-sm text-info/80">{tracking.message}</p>
          {tracking.driver && (
            <div className="mt-4 p-3 bg-background rounded-md">
              <p className="text-sm font-medium text-foreground">{tracking.driver.name}</p>
              {tracking.driver.phone && (
                <a
                  href={`tel:${tracking.driver.phone}`}
                  className="text-sm text-brand hover:text-brand/80"
                >
                  {tracking.driver.phone}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-[400px] rounded-xl border border-border" />

      {/* Tracking Info */}
      {tracking.driver_location && (
        <div className="bg-background border border-border rounded-xl p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-black rounded-lg">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-foreground">Your driver is on the way</p>
                <p className="text-sm text-muted-foreground">
                  Last updated {new Date(tracking.driver_location.updated_at).toLocaleTimeString()}
                </p>
                {tracking.driver && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-foreground">{tracking.driver.name}</p>
                    {tracking.driver.phone && (
                      <a
                        href={`tel:${tracking.driver.phone}`}
                        className="text-sm text-brand hover:text-brand/80"
                      >
                        {tracking.driver.phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
            {tracking.estimated_arrival && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">ETA</p>
                <p className="font-semibold text-foreground">
                  {new Date(tracking.estimated_arrival).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
