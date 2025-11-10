import { NextRequest, NextResponse } from 'next/server'
import {
  validateDeliveryAddress as validateWithGoogleMaps,
  getDeliveryEstimate as getEstimateWithGoogleMaps,
} from '@/lib/google-maps/client'
import {
  validateDeliveryAddress as validateWithMapbox,
  getDeliveryEstimate as getEstimateWithMapbox,
} from '@/lib/mapbox/client'

export async function POST(request: NextRequest) {
  try {
    const { address, provider } = await request.json()

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Use Google Maps as primary, Mapbox as fallback
    const useGoogleMaps = provider === 'google' || provider !== 'mapbox'

    let validationResult
    let getEstimate

    if (useGoogleMaps) {
      validationResult = await validateWithGoogleMaps(address)
      getEstimate = getEstimateWithGoogleMaps
    } else {
      validationResult = await validateWithMapbox(address)
      getEstimate = getEstimateWithMapbox
    }

    // If Google Maps fails, fallback to Mapbox
    if (!validationResult.isValid && useGoogleMaps && provider !== 'google') {
      console.log('Falling back to Mapbox for address validation')
      validationResult = await validateWithMapbox(address)
      getEstimate = getEstimateWithMapbox
    }

    // If valid, get delivery estimate
    if (validationResult.isValid && validationResult.address?.coordinates) {
      const estimate = await getEstimate(
        validationResult.address.coordinates.lat,
        validationResult.address.coordinates.lng
      )

      if (estimate) {
        return NextResponse.json({
          ...validationResult,
          deliveryEstimate: {
            duration: estimate.duration,
            distance: estimate.distance,
          },
        })
      }
    }

    return NextResponse.json(validationResult)
  } catch (error) {
    console.error('Error in address validation:', error)
    return NextResponse.json(
      {
        isValid: false,
        error: 'Failed to validate address. Please try again.',
      },
      { status: 500 }
    )
  }
}
