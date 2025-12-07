import { NextRequest, NextResponse } from 'next/server'
import {
  validateDeliveryAddress as validateWithMapbox,
  getDeliveryEstimate as getEstimateWithMapbox,
} from '@/lib/mapbox/client'

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 })
    }

    // Use Mapbox for address validation (configured and working)
    const validationResult = await validateWithMapbox(address)

    // If valid, get delivery estimate
    if (validationResult.isValid && validationResult.address?.coordinates) {
      const estimate = await getEstimateWithMapbox(
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
