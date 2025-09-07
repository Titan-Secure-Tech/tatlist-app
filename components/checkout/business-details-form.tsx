'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, MapPin, AlertCircle, CheckCircle } from 'lucide-react'

export interface BusinessDetails {
  businessName: string
  licenseNumber: string
  street: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  validated?: boolean
  coordinates?: {
    lat: number
    lng: number
  }
  distance?: number
}

interface BusinessDetailsFormProps {
  onSubmit: (details: BusinessDetails) => void
  initialValues?: Partial<BusinessDetails>
}

export function BusinessDetailsForm({ onSubmit, initialValues = {} }: BusinessDetailsFormProps) {
  const [formData, setFormData] = useState<BusinessDetails>({
    businessName: initialValues.businessName || '',
    licenseNumber: initialValues.licenseNumber || '',
    street: initialValues.street || '',
    city: initialValues.city || 'Tampa',
    state: initialValues.state || 'FL',
    zipCode: initialValues.zipCode || '',
    phone: initialValues.phone || '',
    email: initialValues.email || '',
  })

  const [validationState, setValidationState] = useState<{
    isValidating: boolean
    isValid: boolean | null
    error: string | null
    distance: number | null
  }>({
    isValidating: false,
    isValid: null,
    error: null,
    distance: null,
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Reset validation when address changes
    if (['street', 'city', 'state', 'zipCode'].includes(name)) {
      setValidationState({
        isValidating: false,
        isValid: null,
        error: null,
        distance: null,
      })
    }
  }

  const validateAddress = async () => {
    setValidationState({
      isValidating: true,
      isValid: null,
      error: null,
      distance: null,
    })

    const fullAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}`

    try {
      const response = await fetch('/api/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: fullAddress }),
      })

      const result = await response.json()

      if (result.isValid) {
        setValidationState({
          isValidating: false,
          isValid: true,
          error: null,
          distance: result.distance,
        })

        // Update form with validated address components
        setFormData(prev => ({
          ...prev,
          street: result.address.street || prev.street,
          city: result.address.city || prev.city,
          state: result.address.state || prev.state,
          zipCode: result.address.zipCode || prev.zipCode,
          validated: true,
          coordinates: result.address.coordinates,
          distance: result.distance,
        }))
      } else {
        setValidationState({
          isValidating: false,
          isValid: false,
          error: result.error,
          distance: result.distance,
        })
      }
    } catch {
      setValidationState({
        isValidating: false,
        isValid: false,
        error: 'Unable to validate address. Please try again.',
        distance: null,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Ensure address is validated before submission
    if (!validationState.isValid) {
      await validateAddress()
      return
    }

    if (validationState.isValid) {
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="businessName">
            Business Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="businessName"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            placeholder="Your Tattoo Shop Name"
            required
          />
        </div>

        <div>
          <Label htmlFor="licenseNumber">
            Tattoo Shop License Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            placeholder="FL-XXXX-XXXX"
            required
          />
          <p className="text-sm text-muted-foreground mt-1">
            Required for verification as a licensed tattoo shop
          </p>
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold">Delivery Address</h3>

          <div>
            <Label htmlFor="street">
              Street Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              name="street"
              value={formData.street}
              onChange={handleInputChange}
              placeholder="123 Main St"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Tampa"
                required
              />
            </div>

            <div>
              <Label htmlFor="state">
                State <span className="text-red-500">*</span>
              </Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="FL"
                maxLength={2}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="zipCode">
              ZIP Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
              placeholder="33601"
              maxLength={5}
              required
            />
          </div>

          <Button
            type="button"
            onClick={validateAddress}
            disabled={
              !formData.street ||
              !formData.city ||
              !formData.zipCode ||
              validationState.isValidating
            }
            variant="outline"
            className="w-full"
          >
            {validationState.isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating Address...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Validate Delivery Address
              </>
            )}
          </Button>

          {validationState.isValid === true && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Address Validated</AlertTitle>
              <AlertDescription className="text-green-700">
                Your business is {validationState.distance?.toFixed(1)} miles from our delivery
                center. Delivery available!
              </AlertDescription>
            </Alert>
          )}

          {validationState.isValid === false && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertTitle className="text-red-800">Delivery Not Available</AlertTitle>
              <AlertDescription className="text-red-700">{validationState.error}</AlertDescription>
            </Alert>
          )}
        </div>

        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold">Contact Information</h3>

          <div>
            <Label htmlFor="phone">
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(813) 555-0123"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="shop@example.com"
              required
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!validationState.isValid || validationState.isValidating}
        className="w-full"
      >
        Continue to Payment
      </Button>
    </form>
  )
}
