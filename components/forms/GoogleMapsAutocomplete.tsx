'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { loadGoogleMaps } from '@/lib/google-maps/client'

interface AddressComponents {
  streetAddress: string
  city: string
  state: string
  zipCode: string
}

interface GoogleMapsAutocompleteProps {
  value: string
  onChange: (value: string, components?: AddressComponents) => void
  placeholder?: string
  required?: boolean
  className?: string
  id?: string
}

export default function GoogleMapsAutocomplete({
  value,
  onChange,
  placeholder = 'Start typing an address...',
  required = false,
  className = '',
  id = 'address',
}: GoogleMapsAutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    const initAutocomplete = async () => {
      setIsLoading(true)
      try {
        const maps = await loadGoogleMaps()
        if (!maps || !inputRef.current) {
          console.error('Google Maps failed to load')
          return
        }

        // Initialize autocomplete
        autocompleteRef.current = new maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'us' },
          fields: ['address_components', 'formatted_address', 'geometry'],
        })

        // Add place changed listener
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current?.getPlace()
          if (!place || !place.address_components) return

          const components = parseAddressComponents(place)
          onChange(place.formatted_address || '', components)
        })

        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing Google Maps Autocomplete:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAutocomplete()
  }, [])

  const parseAddressComponents = (
    place: google.maps.places.PlaceResult
  ): AddressComponents | undefined => {
    const components = place.address_components
    if (!components) return undefined

    let street = ''
    let city = ''
    let state = ''
    let zipCode = ''

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

    return {
      streetAddress: street.trim(),
      city,
      state,
      zipCode,
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          className={className}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
        {isInitialized && !isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
      {!isInitialized && !isLoading && (
        <p className="mt-1 text-xs text-amber-600">
          Google Maps is loading... If this persists, please check your internet connection.
        </p>
      )}
    </div>
  )
}
