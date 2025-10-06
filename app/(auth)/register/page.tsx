'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AddressAutocomplete from '@/components/forms/AddressAutocomplete'
import { MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    userType: '' as 'shop_owner' | 'tattoo_artist' | '',
    shopName: '',
    taxId: '',
    businessName: '',
    businessAddress: '',
    taxExempt: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [addressValidation, setAddressValidation] = useState<{
    isValidating: boolean
    isValid: boolean | null
    error: string | null
  }>({
    isValidating: false,
    isValid: null,
    error: null,
  })
  const router = useRouter()
  const supabase = createClient()

  const validateAddress = async () => {
    setAddressValidation({
      isValidating: true,
      isValid: null,
      error: null,
    })

    const fullAddress = `${formData.streetAddress}, ${formData.city}, ${formData.state} ${formData.zipCode}`

    try {
      const response = await fetch('/api/validate-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: fullAddress }),
      })

      const result = await response.json()

      if (result.isValid) {
        setAddressValidation({
          isValidating: false,
          isValid: true,
          error: null,
        })

        // Update form with validated address components if provided
        if (result.address) {
          setFormData(prev => ({
            ...prev,
            streetAddress: result.address.street || prev.streetAddress,
            city: result.address.city || prev.city,
            state: result.address.state || prev.state,
            zipCode: result.address.zipCode || prev.zipCode,
          }))
        }
      } else {
        setAddressValidation({
          isValidating: false,
          isValid: false,
          error: result.error || 'Address validation failed',
        })
      }
    } catch {
      setAddressValidation({
        isValidating: false,
        isValid: false,
        error: 'Unable to validate address. Please try again.',
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement
      setFormData({ ...formData, [name]: checked })
    } else {
      setFormData({ ...formData, [name]: value })
    }

    // Reset validation when address changes
    if (['streetAddress', 'city', 'state', 'zipCode'].includes(name)) {
      setAddressValidation({
        isValidating: false,
        isValid: null,
        error: null,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/api/auth/callback`,
        },
      })

      if (authError) throw authError

      // Check if we have a session (email confirmations disabled)
      if (authData.session) {
        // Create user profile
        if (authData.user) {
          const { error: profileError } = await supabase.from('users').insert({
            id: authData.user.id,
            email: formData.email,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            street_address: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            user_type: formData.userType,
            shop_name: formData.userType === 'shop_owner' ? formData.shopName : null,
            tax_id: formData.userType === 'shop_owner' ? formData.taxId : null,
            business_name: formData.businessName || null,
            business_address: formData.businessAddress || null,
            tax_exempt_status: formData.taxExempt,
          })

          if (profileError) throw profileError
        }

        // Successfully created account and profile
        setSuccess('Account created successfully! Redirecting to dashboard...')
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1500)
      } else {
        // Email confirmations are enabled, show success message
        setSuccess('Account created! Please check your email to confirm your account.')
        setLoading(false)
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-black">Create your account</h1>
        <p className="mt-2 text-gray-600">Join Tatlist to start ordering supplies</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              placeholder="(555) 123-4567"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Business Address</h2>

          <div>
            <label htmlFor="streetAddress" className="block text-sm font-medium text-gray-700">
              Street Address <span className="text-red-500">*</span>
            </label>
            <AddressAutocomplete
              id="streetAddress"
              value={formData.streetAddress}
              onChange={(value, components) => {
                if (components) {
                  setFormData({
                    ...formData,
                    streetAddress: components.streetAddress,
                    city: components.city,
                    state: components.state,
                    zipCode: components.zipCode,
                  })
                  // Reset validation when autocomplete populates address
                  setAddressValidation({
                    isValidating: false,
                    isValid: null,
                    error: null,
                  })
                } else {
                  setFormData({ ...formData, streetAddress: value })
                  // Reset validation when manual input changes
                  setAddressValidation({
                    isValidating: false,
                    isValid: null,
                    error: null,
                  })
                }
              }}
              placeholder="Start typing your address..."
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
            />
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State <span className="text-red-500">*</span>
              </label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={e => {
                  setFormData({ ...formData, state: e.target.value.toUpperCase() })
                  setAddressValidation({
                    isValidating: false,
                    isValid: null,
                    error: null,
                  })
                }}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                placeholder="FL"
                maxLength={2}
                required
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                placeholder="12345"
                required
              />
            </div>
          </div>

          {/* Address Validation Button */}
          <button
            type="button"
            onClick={validateAddress}
            disabled={
              !formData.streetAddress ||
              !formData.city ||
              !formData.zipCode ||
              addressValidation.isValidating
            }
            className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addressValidation.isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating Address...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Validate Address
              </>
            )}
          </button>

          {/* Address Validation Success */}
          {addressValidation.isValid === true && (
            <div className="flex items-start p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-green-800 text-sm">
                <div className="font-medium">Address Validated</div>
                <div className="text-green-700 text-xs mt-1">
                  Your address has been verified and is in our delivery area.
                </div>
              </div>
            </div>
          )}

          {/* Address Validation Error */}
          {addressValidation.isValid === false && (
            <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-red-800 text-sm">
                <div className="font-medium">Address Validation Failed</div>
                <div className="text-red-700 text-xs mt-1">
                  {addressValidation.error}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Business Information */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Business Information</h2>

          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-gray-700">
              Are you a shop owner or tattoo artist? <span className="text-red-500">*</span>
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              required
            >
              <option value="">Select...</option>
              <option value="shop_owner">Shop Owner</option>
              <option value="tattoo_artist">Tattoo Artist</option>
            </select>
          </div>

          {formData.userType === 'shop_owner' && (
            <>
              <div>
                <label htmlFor="shopName" className="block text-sm font-medium text-gray-700">
                  Tattoo Shop Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="shopName"
                  name="shopName"
                  type="text"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  required
                />
              </div>

              <div>
                <label htmlFor="taxId" className="block text-sm font-medium text-gray-700">
                  Tax Identification Number
                </label>
                <input
                  id="taxId"
                  name="taxId"
                  type="text"
                  value={formData.taxId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  placeholder="XX-XXXXXXX"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">
              Business Name (Optional)
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              value={formData.businessName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
            />
          </div>

          <div className="flex items-center">
            <input
              id="taxExempt"
              name="taxExempt"
              type="checkbox"
              checked={formData.taxExempt}
              onChange={handleInputChange}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="taxExempt" className="ml-2 block text-sm text-gray-700">
              I have tax exempt status
            </label>
          </div>
        </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-black hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
