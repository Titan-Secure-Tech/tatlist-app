# Google Maps Integration

This directory contains the Google Maps Platform integration for address validation, autocomplete, and geocoding services.

## Setup

### 1. Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API**
   - **Directions API** (optional, for delivery estimates)
4. Create an API key with appropriate restrictions:
   - **Application restrictions**: HTTP referrers (websites)
   - **Website restrictions**: Add your domains (e.g., `tatlist.com/*`, `*.vercel.app/*`)
   - **API restrictions**: Restrict to the APIs listed above

### 2. Configure Environment Variable

Add your API key to `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important**: The `NEXT_PUBLIC_` prefix is required for client-side access.

## Features

### Address Autocomplete

The `GoogleMapsAutocomplete` component provides real-time address suggestions as users type:

```tsx
import GoogleMapsAutocomplete from '@/components/forms/GoogleMapsAutocomplete'

function MyForm() {
  const [address, setAddress] = useState('')

  return (
    <GoogleMapsAutocomplete
      value={address}
      onChange={(value, components) => {
        setAddress(value)
        if (components) {
          console.log('Street:', components.streetAddress)
          console.log('City:', components.city)
          console.log('State:', components.state)
          console.log('ZIP:', components.zipCode)
        }
      }}
      placeholder="Enter your address"
      required
    />
  )
}
```

### Address Validation

Validate addresses and check delivery zone eligibility:

```ts
import { validateDeliveryAddress } from '@/lib/google-maps/client'

const result = await validateDeliveryAddress('123 Main St, Tampa, FL 33602')

if (result.isValid) {
  console.log('Valid address:', result.address)
  console.log('Distance from delivery center:', result.distance, 'miles')
} else {
  console.error('Invalid address:', result.error)
}
```

### Delivery Estimates

Get driving directions and estimated delivery time:

```ts
import { getDeliveryEstimate } from '@/lib/google-maps/client'

const estimate = await getDeliveryEstimate(27.9506, -82.4572)

if (estimate) {
  console.log('Estimated time:', estimate.duration, 'minutes')
  console.log('Estimated distance:', estimate.distance, 'miles')
}
```

## API Route Integration

The `/api/validate-address` route supports both Google Maps and Mapbox providers:

```ts
// Use Google Maps (default)
const response = await fetch('/api/validate-address', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ address: '123 Main St, Tampa, FL' }),
})

// Use Mapbox explicitly
const response = await fetch('/api/validate-address', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    address: '123 Main St, Tampa, FL',
    provider: 'mapbox',
  }),
})
```

Google Maps is used as the primary provider with automatic fallback to Mapbox if Google Maps fails.

## Configuration

### Delivery Center

The delivery center is configured in `lib/google-maps/client.ts`:

```ts
export const DELIVERY_CENTER = {
  lat: 27.9506, // Downtown Tampa
  lng: -82.4572,
  address: 'Tampa, FL',
}
```

### Delivery Radius

Maximum delivery distance from the center:

```ts
export const MAX_DELIVERY_RADIUS_MILES = 25
```

## Troubleshooting

### API Key Issues

- Ensure the API key has all required APIs enabled
- Check that domain restrictions match your deployment URLs
- Verify the key has `NEXT_PUBLIC_` prefix in environment variables

### Autocomplete Not Working

- Check browser console for JavaScript errors
- Verify Google Maps script is loading (check Network tab)
- Ensure input field has `autoComplete="off"` to prevent browser autocomplete conflict

### Rate Limiting

Google Maps has usage quotas. For production:

- Monitor usage in Google Cloud Console
- Set up billing alerts
- Consider implementing caching for frequently validated addresses

## Cost Optimization

- **Autocomplete**: ~$2.83 per 1,000 requests
- **Geocoding**: ~$5 per 1,000 requests
- **Directions**: ~$5 per 1,000 requests

Tips to reduce costs:

1. Cache validated addresses in database
2. Use session tokens for autocomplete
3. Implement request debouncing (already implemented)
4. Set daily quotas in Google Cloud Console

## Migration from Mapbox

Both providers are supported simultaneously. To prefer Mapbox:

1. Keep using `AddressAutocomplete` component (Mapbox)
2. Explicitly set `provider: 'mapbox'` in API requests

To use Google Maps everywhere:

1. Replace `AddressAutocomplete` with `GoogleMapsAutocomplete`
2. Remove or omit `provider` parameter in API requests (defaults to Google Maps)
