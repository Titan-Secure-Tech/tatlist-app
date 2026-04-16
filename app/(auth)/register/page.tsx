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
    contactPreference: '' as 'sms' | 'email' | 'both' | '',
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
      // Uppercase state abbreviation
      const finalValue = name === 'state' ? value.toUpperCase() : value
      setFormData({ ...formData, [name]: finalValue })
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
            contact_preference: formData.contactPreference,
            street_address: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zipCode,
            user_type: formData.userType,
            shop_name: formData.userType === 'shop_owner' ? formData.shopName : null,
            tax_id:
              formData.userType === 'shop_owner' || formData.userType === 'tattoo_artist'
                ? formData.taxId
                : null,
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
        <h1 className="text-3xl font-bold text-foreground">Create your account</h1>
        <p className="mt-2 text-muted-foreground">Join Tatlist to start ordering supplies</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Personal Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-muted-foreground">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-muted-foreground">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-muted-foreground">
              Phone{' '}
              {(formData.contactPreference === 'sms' || formData.contactPreference === 'both') && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
              placeholder="(555) 123-4567"
              required={
                formData.contactPreference === 'sms' || formData.contactPreference === 'both'
              }
            />
          </div>

          <div>
            <label htmlFor="contactPreference" className="block text-sm font-medium text-muted-foreground">
              Preferred Contact Method <span className="text-red-500">*</span>
            </label>
            <select
              id="contactPreference"
              value={formData.contactPreference}
              onChange={e =>
                setFormData({
                  ...formData,
                  contactPreference: e.target.value as 'sms' | 'email' | 'both',
                })
              }
              className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
              required
            >
              <option value="">Select your preference...</option>
              <option value="email">Email only</option>
              <option value="sms">SMS/Text only</option>
              <option value="both">Both Email and SMS</option>
            </select>
            <p className="mt-1 text-xs text-muted-foreground">
              We&apos;ll use this to send you order updates and delivery notifications.
            </p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-semibold text-foreground">Business Address</h2>

          <div>
            <label htmlFor="streetAddress" className="block text-sm font-medium text-muted-foreground">
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
              className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div className="col-span-3">
              <label htmlFor="city" className="block text-sm font-medium text-muted-foreground">
                City <span className="text-red-500">*</span>
              </label>
              <input
                id="city"
                name="city"
                type="text"
                value={formData.city}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>

            <div className="col-span-1">
              <label htmlFor="state" className="block text-sm font-medium text-muted-foreground">
                State <span className="text-red-500">*</span>
              </label>
              <input
                id="state"
                name="state"
                type="text"
                value={formData.state}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
                placeholder="FL"
                maxLength={2}
                required
              />
            </div>

            <div className="col-span-2">
              <label htmlFor="zipCode" className="block text-sm font-medium text-muted-foreground">
                ZIP Code <span className="text-red-500">*</span>
              </label>
              <input
                id="zipCode"
                name="zipCode"
                type="text"
                value={formData.zipCode}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
                placeholder="12345"
                required
              />
            </div>
          </div>

          {/* Address Validation Button */}
          <div>
            <button
              type="button"
              onClick={validateAddress}
              disabled={
                addressValidation.isValidating ||
                !formData.streetAddress ||
                !formData.city ||
                !formData.state ||
                !formData.zipCode
              }
              className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-medium text-foreground bg-secondary hover:bg-accent focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addressValidation.isValidating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4" />
                  Validate Address
                </>
              )}
            </button>
          </div>

          {/* Validation Success Message */}
          {addressValidation.isValid && (
            <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/30 rounded-xl">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div className="text-sm text-success">
                <p className="font-medium">Address validated successfully</p>
                <p>This address is within our delivery area.</p>
              </div>
            </div>
          )}

          {/* Validation Error Message */}
          {addressValidation.isValid === false && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-xl">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">
                <p className="font-medium">Address validation failed</p>
                <p>{addressValidation.error}</p>
              </div>
            </div>
          )}
        </div>

        {/* Business Information */}
        <div className="space-y-4 pt-4 border-t border-border">
          <h2 className="text-lg font-semibold text-foreground">Business Information</h2>

          <div>
            <label htmlFor="userType" className="block text-sm font-medium text-muted-foreground">
              Are you a shop owner or tattoo artist? <span className="text-red-500">*</span>
            </label>
            <select
              id="userType"
              value={formData.userType}
              onChange={e =>
                setFormData({
                  ...formData,
                  userType: e.target.value as 'shop_owner' | 'tattoo_artist',
                })
              }
              className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
              required
            >
              <option value="">Select...</option>
              <option value="shop_owner">Shop Owner</option>
              <option value="tattoo_artist">Tattoo Artist</option>
            </select>
          </div>

          {formData.userType === 'shop_owner' && (
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-muted-foreground">
                Tattoo Shop Name <span className="text-red-500">*</span>
              </label>
              <input
                id="shopName"
                name="shopName"
                type="text"
                value={formData.shopName}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          )}

          {(formData.userType === 'shop_owner' || formData.userType === 'tattoo_artist') && (
            <div>
              <label htmlFor="taxId" className="block text-sm font-medium text-muted-foreground">
                Tax Identification Number
              </label>
              <input
                id="taxId"
                name="taxId"
                type="text"
                value={formData.taxId}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
                placeholder="XX-XXXXXXX"
              />
            </div>
          )}

          <div>
            <label htmlFor="businessName" className="block text-sm font-medium text-muted-foreground">
              Business Name (Optional)
            </label>
            <input
              id="businessName"
              name="businessName"
              type="text"
              value={formData.businessName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-input border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center">
            <input
              id="taxExempt"
              name="taxExempt"
              type="checkbox"
              checked={formData.taxExempt}
              onChange={handleInputChange}
              className="h-4 w-4 text-brand focus:ring-brand border-border rounded accent-brand"
            />
            <label htmlFor="taxExempt" className="ml-2 block text-sm text-muted-foreground">
              I have tax exempt status
            </label>
          </div>
        </div>

        {error && <div className="text-destructive text-sm bg-destructive/10 p-2 rounded-xl">{error}</div>}
        {success && <div className="text-success text-sm bg-success/10 p-2 rounded-xl">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-3 px-4 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-xl font-medium disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
