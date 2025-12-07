import mapboxSdk from '@mapbox/mapbox-sdk'
import mapboxGeocoding from '@mapbox/mapbox-sdk/services/geocoding'
import mapboxDirections from '@mapbox/mapbox-sdk/services/directions'
import mapboxOptimization from '@mapbox/mapbox-sdk/services/optimization'

// Initialize Mapbox client with conditional check
const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.trim()

// Only initialize if we have a token
const baseClient = accessToken ? mapboxSdk({ accessToken }) : null

export const geocodingClient = baseClient ? mapboxGeocoding(baseClient) : null
export const directionsClient = baseClient ? mapboxDirections(baseClient) : null
export const optimizationClient = baseClient ? mapboxOptimization(baseClient) : null

// Tampa delivery center coordinates (downtown Tampa)
export const DELIVERY_CENTER = {
  lat: 27.9506,
  lng: -82.4572,
  address: 'Tampa, FL',
}

// Maximum delivery radius in miles
export const MAX_DELIVERY_RADIUS_MILES = 25

// Convert miles to meters for Mapbox calculations
export const MILES_TO_METERS = 1609.34

export interface ValidationResult {
  isValid: boolean
  address?: {
    formatted: string
    street: string
    city: string
    state: string
    zipCode: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  distance?: number // in miles
  error?: string
}

/**
 * Calculate distance between two points using Haversine formula
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Radius of Earth in miles
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(value: number): number {
  return (value * Math.PI) / 180
}

/**
 * Validate address and check if it's within delivery zone
 */
export async function validateDeliveryAddress(address: string): Promise<ValidationResult> {
  try {
    // Check if Mapbox client is available
    if (!geocodingClient) {
      // Fallback validation for common Tampa area ZIP codes when Mapbox is unavailable
      const tampaAreaZipCodes = [
        '33602',
        '33603',
        '33604',
        '33605',
        '33606',
        '33607',
        '33608',
        '33609',
        '33610',
        '33611',
        '33612',
        '33613',
        '33614',
        '33615',
        '33616',
        '33617',
        '33618',
        '33619',
        '33620',
        '33621',
        '33624',
        '33625',
        '33626',
        '33629',
        '33634',
        '33635',
        '33637',
        '33647', // Tampa
        '33701',
        '33702',
        '33703',
        '33704',
        '33705',
        '33706',
        '33707',
        '33708',
        '33709',
        '33710',
        '33711',
        '33712',
        '33713',
        '33714',
        '33715',
        '33716', // St. Petersburg
        '33755',
        '33756',
        '33759',
        '33760',
        '33761',
        '33762',
        '33763',
        '33764', // Clearwater
        '33772',
        '33773',
        '33774',
        '33776',
        '33777',
        '33778', // Seminole/Largo
      ]

      // Try to extract ZIP code from address
      const zipMatch = address.match(/\b(\d{5})\b/)
      const zipCode = zipMatch ? zipMatch[1] : ''

      if (zipCode && tampaAreaZipCodes.includes(zipCode)) {
        console.warn('Mapbox unavailable - using ZIP code fallback validation')
        return {
          isValid: true,
          address: {
            formatted: address,
            street: '',
            city: 'Tampa Bay Area',
            state: 'FL',
            zipCode: zipCode,
            coordinates: DELIVERY_CENTER, // Use delivery center as fallback
          },
          distance: 0, // Unknown distance
          error:
            'Note: Address validation is limited. Delivery availability will be confirmed after order placement.',
        }
      }

      return {
        isValid: false,
        error:
          'Please enter a valid Tampa Bay area address with ZIP code. Address validation is temporarily limited.',
      }
    }

    // Geocode the address
    const response = await geocodingClient
      .forwardGeocode({
        query: address,
        countries: ['us'],
        types: ['address'],
        limit: 1,
        bbox: [-82.8, 27.5, -82.1, 28.2], // Tampa Bay area bounding box
      })
      .send()

    const features = response.body.features

    if (!features || features.length === 0) {
      return {
        isValid: false,
        error: 'Address not found. Please enter a valid business address.',
      }
    }

    const feature = features[0]
    const [lng, lat] = feature.center

    // Parse address components from Mapbox response
    const context = feature.context || []
    const addressComponents = {
      formatted: feature.place_name || address,
      street: feature.text || '',
      city: context.find(c => (c as { id: string; text: string }).id.includes('place'))?.text || '',
      state:
        context.find(c => (c as { id: string; text: string }).id.includes('region'))?.text || 'FL',
      zipCode:
        context.find(c => (c as { id: string; text: string }).id.includes('postcode'))?.text || '',
      coordinates: { lat, lng },
    }

    // Ensure address is in Florida
    if (addressComponents.state !== 'FL' && addressComponents.state !== 'Florida') {
      return {
        isValid: false,
        address: addressComponents,
        error: 'We currently only deliver to businesses in Florida.',
      }
    }

    // Calculate distance from delivery center
    const distance = calculateDistance(DELIVERY_CENTER.lat, DELIVERY_CENTER.lng, lat, lng)

    // Check if within delivery radius
    if (distance > MAX_DELIVERY_RADIUS_MILES) {
      return {
        isValid: false,
        address: addressComponents,
        distance,
        error: `Your location is ${distance.toFixed(1)} miles from our delivery center. We currently deliver within ${MAX_DELIVERY_RADIUS_MILES} miles of Tampa. Please contact us to request service in your area.`,
      }
    }

    return {
      isValid: true,
      address: addressComponents,
      distance,
    }
  } catch (error) {
    console.error('Error validating address:', error)
    return {
      isValid: false,
      error: 'Unable to validate address. Please try again or contact support.',
    }
  }
}

/**
 * Get driving directions and estimated delivery time
 */
export async function getDeliveryEstimate(
  destinationLat: number,
  destinationLng: number
): Promise<{ duration: number; distance: number } | null> {
  try {
    // Check if Mapbox client is available
    if (!directionsClient) {
      return null
    }

    const response = await directionsClient
      .getDirections({
        profile: 'driving-traffic',
        waypoints: [
          { coordinates: [DELIVERY_CENTER.lng, DELIVERY_CENTER.lat] },
          { coordinates: [destinationLng, destinationLat] },
        ],
      })
      .send()

    const route = response.body.routes[0]
    if (!route) return null

    return {
      duration: Math.ceil(route.duration / 60), // Convert to minutes
      distance: route.distance / MILES_TO_METERS, // Convert to miles
    }
  } catch (error) {
    console.error('Error getting delivery estimate:', error)
    return null
  }
}

/**
 * Optimize route for multiple delivery stops
 * Uses Mapbox Optimization API to find the best order to visit waypoints
 */
export interface RouteWaypoint {
  latitude: number
  longitude: number
  address?: string
  delivery_id?: string
}

// GeoJSON types for Mapbox responses
interface GeoJSONGeometry {
  type: string
  coordinates: number[] | number[][] | number[][][]
}

interface MapboxLegStep {
  distance: number
  duration: number
  geometry: GeoJSONGeometry
  name: string
  mode: string
  maneuver: {
    instruction: string
    type: string
    modifier?: string
    location: [number, number]
  }
}

interface MapboxLeg {
  distance: number
  duration: number
  steps?: MapboxLegStep[]
}

export interface OptimizedRoute {
  waypoint_order: number[] // Optimized indices [2, 0, 3, 1]
  total_distance_miles: number
  total_duration_minutes: number
  route_geometry: GeoJSONGeometry // GeoJSON polyline
  turn_by_turn_directions: MapboxLegStep[] // Navigation steps
  legs: Array<{
    distance_miles: number
    duration_minutes: number
    from_waypoint: number
    to_waypoint: number
  }>
}

export async function optimizeDeliveryRoute(
  waypoints: RouteWaypoint[],
  options?: {
    startLocation?: { latitude: number; longitude: number } // Optional start (defaults to delivery center)
    endLocation?: { latitude: number; longitude: number } // Optional end (return to start)
    roundTrip?: boolean // True = return to start location
  }
): Promise<OptimizedRoute | null> {
  try {
    // Check if Mapbox client is available
    if (!optimizationClient) {
      console.error('Mapbox optimization client not initialized')
      return null
    }

    // Validate waypoints count (Mapbox limit: 12 waypoints)
    if (waypoints.length === 0) {
      throw new Error('At least one waypoint is required')
    }

    if (waypoints.length > 12) {
      throw new Error('Mapbox Optimization API supports maximum 12 waypoints')
    }

    // Prepare coordinates array
    const start = options?.startLocation || DELIVERY_CENTER
    const coordinates: Array<[number, number]> = []

    // Add start location
    coordinates.push([start.longitude, start.latitude])

    // Add all delivery waypoints
    waypoints.forEach(wp => {
      coordinates.push([wp.longitude, wp.latitude])
    })

    // Add end location if specified, otherwise Mapbox will optimize as open route
    if (options?.roundTrip) {
      coordinates.push([start.longitude, start.latitude])
    } else if (options?.endLocation) {
      coordinates.push([options.endLocation.longitude, options.endLocation.latitude])
    }

    // Call Mapbox Optimization API
    const response = await optimizationClient
      .getOptimization({
        profile: 'driving-traffic', // Use real-time traffic data
        waypoints: coordinates.map((coord, index) => ({
          coordinates: coord,
          // First and last waypoints are fixed (start/end)
          ...(index === 0 || (options?.roundTrip && index === coordinates.length - 1) ? {} : {}),
        })),
        source: 'first', // Start from first waypoint
        destination: options?.roundTrip ? 'last' : 'any', // End at last or optimize end
        roundtrip: options?.roundTrip || false,
        overview: 'full', // Get full route geometry
        steps: true, // Get turn-by-turn directions
        geometries: 'geojson', // Return GeoJSON format
      })
      .send()

    const trip = response.body.trips[0]
    if (!trip) {
      throw new Error('No optimized route returned from Mapbox')
    }

    // Parse optimized waypoint order
    // Mapbox returns waypoint indices in optimized order
    const optimized_order = response.body.waypoints
      .slice(1, options?.roundTrip ? -1 : undefined) // Exclude start/end waypoints
      .map(wp => wp.waypoint_index - 1) // Adjust index (subtract start waypoint)

    // Extract route legs (segments between waypoints)
    const legs = trip.legs.map((leg: MapboxLeg, index: number) => ({
      distance_miles: leg.distance / MILES_TO_METERS,
      duration_minutes: Math.ceil(leg.duration / 60),
      from_waypoint: index,
      to_waypoint: index + 1,
    }))

    // Build turn-by-turn directions from all legs
    const directions = trip.legs.flatMap((leg: MapboxLeg) => leg.steps || [])

    return {
      waypoint_order: optimized_order,
      total_distance_miles: trip.distance / MILES_TO_METERS,
      total_duration_minutes: Math.ceil(trip.duration / 60),
      route_geometry: trip.geometry, // GeoJSON polyline
      turn_by_turn_directions: directions,
      legs,
    }
  } catch (error) {
    console.error('Error optimizing delivery route:', error)
    return null
  }
}
