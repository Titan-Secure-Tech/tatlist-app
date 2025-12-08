'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, MapPin, AlertCircle, CheckCircle, Trash2 } from 'lucide-react'
import AddressAutocomplete from '@/components/forms/AddressAutocomplete'
import { toast } from 'sonner'

export interface CustomerInformation {
  id?: string
  business_name: string
  license_number: string
  contact_name: string
  email: string
  phone: string
  phone_verified?: boolean
  street_address: string
  apartment_suite?: string
  city: string
  state: string
  zip_code: string
  delivery_instructions?: string
  latitude?: number
  longitude?: number
  is_in_delivery_zone?: boolean
  delivery_distance_miles?: number
  estimated_delivery_fee?: number
}

interface CustomerInformationFormProps {
  userId: string
  initialData?: CustomerInformation | null
}

export function CustomerInformationForm({ userId, initialData }: CustomerInformationFormProps) {
  const [formData, setFormData] = useState<Partial<CustomerInformation>>({
    business_name: initialData?.business_name || '',
    license_number: initialData?.license_number || '',
    contact_name: initialData?.contact_name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    street_address: initialData?.street_address || '',
    apartment_suite: initialData?.apartment_suite || '',
    city: initialData?.city || 'Tampa',
    state: initialData?.state || 'FL',
    zip_code: initialData?.zip_code || '',
    delivery_instructions: initialData?.delivery_instructions || '',
  })

  const [validationState, setValidationState] = useState<{
    isValidating: boolean
    isValid: boolean | null
    error: string | null
    distance: number | null
  }>({
    isValidating: false,
    isValid: initialData?.is_in_delivery_zone || null,
    error: null,
    distance: initialData?.delivery_distance_miles || null,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const validateAddress = useCallback(
    async (address?: {
      street_address: string
      apartment_suite?: string
      city: string
      state: string
      zip_code: string
    }) => {
      const addressToValidate = address || formData

      setValidationState({
        isValidating: true,
        isValid: null,
        error: null,
        distance: null,
      })

      const fullAddress = `${addressToValidate.street_address}${addressToValidate.apartment_suite ? ` ${addressToValidate.apartment_suite}` : ''}, ${addressToValidate.city}, ${addressToValidate.state} ${addressToValidate.zip_code}`

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
            street_address: result.address.street || prev.street_address,
            city: result.address.city || prev.city,
            state: result.address.state || prev.state,
            zip_code: result.address.zipCode || prev.zip_code,
          }))

          toast.success('Address validated successfully!')
        } else {
          setValidationState({
            isValidating: false,
            isValid: false,
            error: result.error,
            distance: result.distance,
          })
          toast.error(result.error || 'Invalid address')
        }
      } catch (error) {
        setValidationState({
          isValidating: false,
          isValid: false,
          error: 'Unable to validate address. Please try again.',
          distance: null,
        })
        toast.error('Unable to validate address. Please try again.')
      }
    },
    [formData]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Reset validation when address changes
    if (['street_address', 'apartment_suite', 'city', 'state', 'zip_code'].includes(name)) {
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

    // Validate required fields
    if (
      !formData.business_name ||
      !formData.license_number ||
      !formData.contact_name ||
      !formData.email ||
      !formData.street_address ||
      !formData.city ||
      !formData.state ||
      !formData.zip_code
    ) {
      toast.error('Please fill in all required fields')
      return
    }

    // Ensure address is validated before saving
    if (!validationState.isValid) {
      toast.info('Validating address...')
      await validateAddress()
      return
    }

    setIsSaving(true)

    try {
      const response = await fetch('/api/customer/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save customer information')
      }

      toast.success('Customer information saved successfully!')

      // Update validation state with saved data
      if (result.data) {
        setValidationState({
          isValidating: false,
          isValid: result.data.is_in_delivery_zone,
          error: null,
          distance: result.data.delivery_distance_miles,
        })
      }
    } catch (error) {
      console.error('Error saving customer information:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save customer information')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your saved customer information?')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch('/api/customer/profile', {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete customer information')
      }

      // Reset form
      setFormData({
        business_name: '',
        license_number: '',
        contact_name: '',
        email: '',
        phone: '',
        street_address: '',
        apartment_suite: '',
        city: 'Tampa',
        state: 'FL',
        zip_code: '',
        delivery_instructions: '',
      })

      setValidationState({
        isValidating: false,
        isValid: null,
        error: null,
        distance: null,
      })

      toast.success('Customer information deleted successfully')
    } catch (error) {
      console.error('Error deleting customer information:', error)
      toast.error('Failed to delete customer information')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Business Details Section */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Business Details</h3>

          <div>
            <Label htmlFor="business_name">
              Business Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="business_name"
              name="business_name"
              value={formData.business_name}
              onChange={handleInputChange}
              placeholder="Your Tattoo Shop Name"
              required
            />
          </div>

          <div>
            <Label htmlFor="license_number">
              Tattoo Shop License Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="license_number"
              name="license_number"
              value={formData.license_number}
              onChange={handleInputChange}
              placeholder="FL-XXXX-XXXX"
              required
            />
            <p className="text-sm text-muted-foreground mt-1">
              Required for verification as a licensed tattoo shop
            </p>
          </div>

          <div>
            <Label htmlFor="contact_name">
              Contact Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contact_name"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleInputChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 123-4567"
              />
              {formData.phone && initialData?.phone_verified && (
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Verified
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Shipping Address Section */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-lg">Shipping Address</h3>
          <p className="text-sm text-muted-foreground">
            Start typing your address and select from the suggestions
          </p>

          <div>
            <Label htmlFor="street_address">
              Street Address <span className="text-red-500">*</span>
            </Label>
            <AddressAutocomplete
              id="street_address"
              value={formData.street_address || ''}
              onChange={(value, components) => {
                if (components) {
                  // Address was selected from autocomplete
                  const newAddress = {
                    street_address: components.streetAddress,
                    city: components.city,
                    state: components.state,
                    zip_code: components.zipCode,
                  }
                  setFormData(prev => ({
                    ...prev,
                    ...newAddress,
                  }))
                  // Auto-validate the selected address
                  if (
                    newAddress.street_address &&
                    newAddress.city &&
                    newAddress.state &&
                    newAddress.zip_code
                  ) {
                    validateAddress(newAddress)
                  }
                } else {
                  // Manual input
                  setFormData(prev => ({
                    ...prev,
                    street_address: value,
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

          <div>
            <Label htmlFor="apartment_suite">Apartment/Suite (Optional)</Label>
            <Input
              id="apartment_suite"
              name="apartment_suite"
              value={formData.apartment_suite}
              onChange={handleInputChange}
              placeholder="Apt 123, Suite 456"
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
            <Label htmlFor="zip_code">
              ZIP Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="zip_code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleInputChange}
              placeholder="33601"
              maxLength={5}
              required
            />
          </div>

          <div>
            <Label htmlFor="delivery_instructions">Delivery Instructions (Optional)</Label>
            <textarea
              id="delivery_instructions"
              name="delivery_instructions"
              value={formData.delivery_instructions}
              onChange={handleInputChange}
              placeholder="Any special delivery instructions..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black min-h-[80px]"
            />
          </div>
        </div>

        {/* Validation Status */}
        {validationState.isValidating && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Validating Address</AlertTitle>
            <AlertDescription>Please wait while we validate your delivery address...</AlertDescription>
          </Alert>
        )}

        {validationState.isValid && validationState.distance !== null && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Address Validated</AlertTitle>
            <AlertDescription className="text-green-800">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>
                  {validationState.distance.toFixed(1)} miles from delivery center
                </span>
              </div>
              <p className="text-sm mt-1">
                Estimated delivery fee: $
                {(5.0 + validationState.distance * 0.5).toFixed(2)}
              </p>
            </AlertDescription>
          </Alert>
        )}

        {validationState.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Address Validation Failed</AlertTitle>
            <AlertDescription>{validationState.error}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {initialData && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDelete}
              disabled={isDeleting || isSaving}
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => validateAddress()}
            disabled={
              validationState.isValidating ||
              isSaving ||
              !formData.street_address ||
              !formData.city ||
              !formData.state ||
              !formData.zip_code
            }
          >
            {validationState.isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Validate Address
              </>
            )}
          </Button>

          <Button type="submit" disabled={isSaving || validationState.isValidating}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Information'
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
