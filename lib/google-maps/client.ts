import { Loader } from '@googlemaps/js-api-loader'

// Tampa delivery center coordinates (downtown Tampa)
export const DELIVERY_CENTER = {
  lat: 27.9506,
  lng: -82.4572,
  address: 'Tampa, FL',
}

// Maximum delivery radius in miles
export const MAX_DELIVERY_RADIUS_MILES = 25

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

// Initialize Google Maps loader
let googleLoader: Loader | null = null
let googleMapsLoaded = false

/**
 * Get or create Google Maps loader instance
 */
function getLoader(): Loader {
  if (!googleLoader) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
    googleLoader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places', 'geocoding'],
    })
  }
  return googleLoader
}

/**
 * Load Google Maps API
 */
export async function loadGoogleMaps(): Promise<typeof google.maps | null> {
  try {
    if (googleMapsLoaded) {
      return window.google?.maps || null
    }

    const loader = getLoader()
    await loader.load()
    googleMapsLoaded = true
    return window.google?.maps || null
  } catch (error) {
    console.error('Error loading Google Maps:', error)
    return null
  }
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
 * Parse address components from Google Places result
 */
function parseAddressComponents(
  place: google.maps.places.PlaceResult
): ValidationResult['address'] | null {
  if (!place.geometry?.location) return null

  const components = place.address_components || []
  let street = ''
  let city = ''
  let state = ''
  let zipCode = ''

  // Extract address components
  components.forEach(component => {
    const types = component.types

    if (types.includes('street_number')) {
      street = component.long_name + ' '
    }
    if (types.includes('route')) {
      street += component.long_name
    }
    if (types.includes('locality')) {
      city = component.long_name
    }
    if (types.includes('administrative_area_level_1')) {
      state = component.short_name
    }
    if (types.includes('postal_code')) {
      zipCode = component.long_name
    }
  })

  const lat = place.geometry.location.lat()
  const lng = place.geometry.location.lng()

  return {
    formatted: place.formatted_address || '',
    street: street.trim(),
    city,
    state,
    zipCode,
    coordinates: { lat, lng },
  }
}

/**
 * Validate address using Google Maps Geocoding API
 */
export async function validateDeliveryAddress(address: string): Promise<ValidationResult> {
  try {
    const maps = await loadGoogleMaps()
    if (!maps) {
      return {
        isValid: false,
        error: 'Unable to load Google Maps. Please try again.',
      }
    }

    // Use Geocoding service for validation
    const geocoder = new maps.Geocoder()

    const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
      geocoder.geocode(
        {
          address,
          componentRestrictions: {
            country: 'US',
          },
        },
        (results, status) => {
          if (status === 'OK' && results) {
            resolve(results)
          } else {
            reject(new Error(`Geocoding failed: ${status}`))
          }
        }
      )
    })

    if (!result || result.length === 0) {
      return {
        isValid: false,
        error: 'Address not found. Please enter a valid business address.',
      }
    }

    const place = result[0]
    const addressData = parseAddressComponents(place)

    if (!addressData) {
      return {
        isValid: false,
        error: 'Unable to parse address. Please try again.',
      }
    }

    // Ensure address is in Florida
    if (addressData.state !== 'FL') {
      return {
        isValid: false,
        address: addressData,
        error: 'We currently only deliver to businesses in Florida.',
      }
    }

    // Calculate distance from delivery center
    const distance = calculateDistance(
      DELIVERY_CENTER.lat,
      DELIVERY_CENTER.lng,
      addressData.coordinates.lat,
      addressData.coordinates.lng
    )

    // Check if within delivery radius
    if (distance > MAX_DELIVERY_RADIUS_MILES) {
      return {
        isValid: false,
        address: addressData,
        distance,
        error: `Your location is ${distance.toFixed(1)} miles from our delivery center. We currently deliver within ${MAX_DELIVERY_RADIUS_MILES} miles of Tampa. Please contact us to request service in your area.`,
      }
    }

    return {
      isValid: true,
      address: addressData,
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
    const maps = await loadGoogleMaps()
    if (!maps) {
      return null
    }

    const directionsService = new maps.DirectionsService()

    const result = await new Promise<google.maps.DirectionsResult>((resolve, reject) => {
      directionsService.route(
        {
          origin: new maps.LatLng(DELIVERY_CENTER.lat, DELIVERY_CENTER.lng),
          destination: new maps.LatLng(destinationLat, destinationLng),
          travelMode: maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            resolve(result)
          } else {
            reject(new Error(`Directions request failed: ${status}`))
          }
        }
      )
    })

    const route = result.routes[0]
    if (!route || !route.legs[0]) return null

    const leg = route.legs[0]

    return {
      duration: Math.ceil((leg.duration?.value || 0) / 60), // Convert to minutes
      distance: (leg.distance?.value || 0) / 1609.34, // Convert to miles
    }
  } catch (error) {
    console.error('Error getting delivery estimate:', error)
    return null
  }
}
