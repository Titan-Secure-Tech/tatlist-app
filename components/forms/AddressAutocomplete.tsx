'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin } from 'lucide-react'

// US State name to abbreviation mapping
const STATE_ABBREVIATIONS: Record<string, string> = {
  Alabama: 'AL',
  Alaska: 'AK',
  Arizona: 'AZ',
  Arkansas: 'AR',
  California: 'CA',
  Colorado: 'CO',
  Connecticut: 'CT',
  Delaware: 'DE',
  Florida: 'FL',
  Georgia: 'GA',
  Hawaii: 'HI',
  Idaho: 'ID',
  Illinois: 'IL',
  Indiana: 'IN',
  Iowa: 'IA',
  Kansas: 'KS',
  Kentucky: 'KY',
  Louisiana: 'LA',
  Maine: 'ME',
  Maryland: 'MD',
  Massachusetts: 'MA',
  Michigan: 'MI',
  Minnesota: 'MN',
  Mississippi: 'MS',
  Missouri: 'MO',
  Montana: 'MT',
  Nebraska: 'NE',
  Nevada: 'NV',
  'New Hampshire': 'NH',
  'New Jersey': 'NJ',
  'New Mexico': 'NM',
  'New York': 'NY',
  'North Carolina': 'NC',
  'North Dakota': 'ND',
  Ohio: 'OH',
  Oklahoma: 'OK',
  Oregon: 'OR',
  Pennsylvania: 'PA',
  'Rhode Island': 'RI',
  'South Carolina': 'SC',
  'South Dakota': 'SD',
  Tennessee: 'TN',
  Texas: 'TX',
  Utah: 'UT',
  Vermont: 'VT',
  Virginia: 'VA',
  Washington: 'WA',
  'West Virginia': 'WV',
  Wisconsin: 'WI',
  Wyoming: 'WY',
  'District of Columbia': 'DC',
}

interface AddressSuggestion {
  place_name: string
  text: string
  context?: Array<{ id: string; text: string; short_code?: string }>
  center: [number, number]
}

interface AddressComponents {
  streetAddress: string
  city: string
  state: string
  zipCode: string
}

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, components?: AddressComponents) => void
  placeholder?: string
  required?: boolean
  className?: string
  id?: string
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = 'Start typing an address...',
  required = false,
  className = '',
  id = 'address',
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = async (query: string) => {
    if (!query || query.length < 3) {
      setSuggestions([])
      return
    }

    setIsLoading(true)
    try {
      // Tampa Bay area bounding box: Southwest to Northeast
      // Covers Tampa, St. Petersburg, Clearwater, and surrounding areas
      const tampaBayBbox = '-82.8,27.5,-82.1,28.2'

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
          new URLSearchParams({
            access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
            country: 'US',
            types: 'address',
            limit: '5',
            bbox: tampaBayBbox, // Bias results to Tampa Bay area
            proximity: '-82.4572,27.9506', // Tampa downtown coordinates
          })
      )

      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.features || [])
        setShowSuggestions(true)
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  const parseAddressComponents = (suggestion: AddressSuggestion): AddressComponents => {
    const components: AddressComponents = {
      streetAddress: '',
      city: '',
      state: '',
      zipCode: '',
    }

    // Get street address (the main text)
    components.streetAddress = suggestion.text

    // Parse context for city, state, and zip
    suggestion.context?.forEach(ctx => {
      if (ctx.id.startsWith('postcode')) {
        components.zipCode = ctx.text
      } else if (ctx.id.startsWith('place')) {
        components.city = ctx.text
      } else if (ctx.id.startsWith('region')) {
        // First check for short_code (e.g., "US-FL")
        if (ctx.short_code) {
          const shortCode = ctx.short_code.replace('US-', '')
          if (shortCode.length === 2) {
            components.state = shortCode.toUpperCase()
            return
          }
        }
        // Check if it's already a 2-letter abbreviation
        const stateMatch = ctx.text.match(/^([A-Z]{2})$/)
        if (stateMatch) {
          components.state = stateMatch[1]
        } else {
          // Look up the state abbreviation from full name
          components.state = STATE_ABBREVIATIONS[ctx.text] || ctx.text.substring(0, 2).toUpperCase()
        }
      }
    })

    return components
  }

  const handleSelectSuggestion = (suggestion: AddressSuggestion) => {
    const components = parseAddressComponents(suggestion)
    onChange(suggestion.place_name, components)
    setShowSuggestions(false)
    setSuggestions([])
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          className={className}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-black rounded-full" />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-start gap-3"
            >
              <MapPin className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900">{suggestion.text}</div>
                <div className="text-sm text-gray-600">{suggestion.place_name}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showSuggestions && !isLoading && suggestions.length === 0 && value.length >= 3 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-600 text-sm">
          No addresses found. Please check your input.
        </div>
      )}
    </div>
  )
}
