'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, MapPin, AlertCircle, CheckCircle, Package, Truck } from 'lucide-react'
import AddressAutocomplete from '@/components/forms/AddressAutocomplete'

export interface BusinessDetails {
  businessName: string
  licenseNumber?: string // Made optional - not all customers are licensed tattoo shops
  street: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  fulfillmentType: 'delivery' | 'pickup'
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
    fulfillmentType: initialValues.fulfillmentType || 'delivery',
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

  const validateAddress = useCallback(
    async (address?: { street: string; city: string; state: string; zipCode: string }) => {
      const addressToValidate = address || formData

      setValidationState({
        isValidating: true,
        isValid: null,
        error: null,
        distance: null,
      })

      const fullAddress = `${addressToValidate.street}, ${addressToValidate.city}, ${addressToValidate.state} ${addressToValidate.zipCode}`

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
    },
    [formData]
  )

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Skip validation for pickup orders
    if (formData.fulfillmentType === 'pickup') {
      onSubmit(formData)
      return
    }

    // Ensure address is validated before submission for delivery
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
        {/* Fulfillment Type Toggle */}
        <div>
          <Label className="mb-3 block">
            Fulfillment Method <span className="text-red-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, fulfillmentType: 'delivery' })}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                formData.fulfillmentType === 'delivery'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Truck className="w-5 h-5" />
              <span className="font-medium">Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, fulfillmentType: 'pickup' })}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                formData.fulfillmentType === 'pickup'
                  ? 'border-black bg-black text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Pickup</span>
            </button>
          </div>
        </div>

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
            Tattoo Shop License Number <span className="text-muted-foreground">(Optional)</span>
          </Label>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            placeholder="FL-XXXX-XXXX"
          />
          <p className="text-sm text-muted-foreground mt-1">
            If you&apos;re a licensed tattoo shop, enter your license number for priority processing
          </p>
        </div>

        {formData.fulfillmentType === 'delivery' && (
          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Delivery Address</h3>
            <p className="text-sm text-muted-foreground">
              Start typing your address and select from the suggestions
            </p>

            <div>
              <Label htmlFor="street">
                Street Address <span className="text-red-500">*</span>
              </Label>
              <AddressAutocomplete
                id="street"
                value={formData.street}
                onChange={(value, components) => {
                  if (components) {
                    // Address was selected from autocomplete
                    const newAddress = {
                      street: components.streetAddress,
                      city: components.city,
                      state: components.state,
                      zipCode: components.zipCode,
                    }
                    setFormData(prev => ({
                      ...prev,
                      ...newAddress,
                    }))
                    // Auto-validate the selected address
                    if (
                      newAddress.street &&
                      newAddress.city &&
                      newAddress.state &&
                      newAddress.zipCode
                    ) {
                      validateAddress(newAddress)
                    }
                  } else {
                    // Manual input
                    setFormData(prev => ({
                      ...prev,
                      street: value,
                    }))
                    // Reset validation on manual changes
                    setValidationState({
                      isValidating: false,
                      isValid: null,
                      error: null,
                      distance: null,
                    })
                  }
                }}
                placeholder="Start typing your address..."
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
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
                  {validationState.distance && validationState.distance > 0 ? (
                    <>
                      Your business is {validationState.distance.toFixed(1)} miles from our delivery
                      center. Delivery available!
                    </>
                  ) : (
                    <>
                      Your address is in our Tampa Bay delivery area. Delivery details will be
                      confirmed after order placement.
                    </>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {validationState.isValid === false && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">Delivery Not Available</AlertTitle>
                <AlertDescription className="text-red-700">
                  {validationState.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {formData.fulfillmentType === 'pickup' && (
          <Alert className="border-blue-200 bg-blue-50">
            <Package className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-800">Pickup Location</AlertTitle>
            <AlertDescription className="text-blue-700">
              <p className="font-semibold mb-2">Black Eye Tattoo</p>
              <p>1234 Main Street</p>
              <p>Tampa, FL 33601</p>
              <p className="mt-2 text-sm">
                Orders are typically ready for pickup within 2-4 hours. We&apos;ll send you an email
                and SMS when your order is ready.
              </p>
            </AlertDescription>
          </Alert>
        )}

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
        disabled={
          formData.fulfillmentType === 'delivery'
            ? !validationState.isValid || validationState.isValidating
            : false
        }
        className="w-full"
      >
        Continue to Payment
      </Button>
    </form>
  )
}
