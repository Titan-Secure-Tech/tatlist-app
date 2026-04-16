'use client'

import { useState, useCallback } from 'react'
import { useShoppingCart } from '@/lib/store/cart-store'
import { toast } from 'sonner'
import {
  getDeliveryFee,
  getEstimatedDeliveryTime,
  isDeliveryAvailable,
  DELIVERY_CONFIG,
} from '@/lib/config/delivery'
import AddressAutocomplete from '@/components/forms/AddressAutocomplete'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface DeliveryAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
}

interface CustomerInfo {
  name: string
  email: string
  phone: string
}

interface AddressValidation {
  isValidating: boolean
  isValid: boolean | null
  error: string | null
  distance: number | null
}

export default function CheckoutForm() {
  const { cartDetails, clearCart, totalPrice } = useShoppingCart()
  const items = Object.values(cartDetails || {})
  const [isProcessing, setIsProcessing] = useState(false)

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
  })

  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress>({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
  })

  const [addressValidation, setAddressValidation] = useState<AddressValidation>({
    isValidating: false,
    isValid: null,
    error: null,
    distance: null,
  })

  const subtotal = (totalPrice || 0) / 100 // use-shopping-cart uses cents
  const deliveryFee = getDeliveryFee(deliveryAddress.postalCode) || DELIVERY_CONFIG.flatFee
  const total = subtotal + deliveryFee

  // Validate address with Tampa Bay area check
  const validateAddress = useCallback(
    async (address?: { line1: string; city: string; state: string; postalCode: string }) => {
      const addressToValidate = address || deliveryAddress

      setAddressValidation({
        isValidating: true,
        isValid: null,
        error: null,
        distance: null,
      })

      const fullAddress = `${addressToValidate.line1}, ${addressToValidate.city}, ${addressToValidate.state} ${addressToValidate.postalCode}`

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
            distance: result.distance,
          })
        } else {
          setAddressValidation({
            isValidating: false,
            isValid: false,
            error: result.error,
            distance: result.distance,
          })
        }
      } catch {
        setAddressValidation({
          isValidating: false,
          isValid: false,
          error: 'Unable to validate address. Please try again.',
          distance: null,
        })
      }
    },
    [deliveryAddress]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (items.length === 0) {
      toast.error('Your cart is empty')
      return
    }

    if (!isDeliveryAvailable()) {
      toast.error('Delivery is not available at this time. Please check our business hours.')
      return
    }

    // Check if address has been validated and is within Tampa Bay area
    if (addressValidation.isValid !== true) {
      toast.error('Please enter a valid address within our Tampa Bay delivery area.')
      // Trigger validation if not already done
      if (addressValidation.isValid === null && deliveryAddress.line1) {
        validateAddress()
      }
      return
    }

    if (subtotal < DELIVERY_CONFIG.minimumOrderAmount) {
      toast.error(
        `Minimum order amount for delivery is $${DELIVERY_CONFIG.minimumOrderAmount.toFixed(2)}`
      )
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items,
          deliveryAddress,
          customerInfo,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Checkout failed')
      }

      if (data.paymentLink) {
        clearCart()
        toast.success('Redirecting to payment...')
        window.location.href = data.paymentLink
      } else {
        throw new Error('No payment link received')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      console.error('Checkout error:', error)
      toast.error(errorMessage || 'Failed to process checkout')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="bg-background p-6 rounded-xl border border-border">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={customerInfo.name}
              onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={customerInfo.email}
              onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={customerInfo.phone}
              onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-background p-6 rounded-xl border border-border">
        <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>
        <p className="text-sm text-muted-foreground mb-4">
          We deliver to the Tampa Bay area. Start typing your address for suggestions.
        </p>

        <div className="space-y-4">
          <div>
            <label htmlFor="line1" className="block text-sm font-medium text-foreground mb-1">
              Street Address
            </label>
            <AddressAutocomplete
              id="line1"
              value={deliveryAddress.line1}
              onChange={(value, components) => {
                if (components) {
                  // Address was selected from autocomplete
                  const newAddress = {
                    line1: components.streetAddress,
                    city: components.city,
                    state: components.state,
                    postalCode: components.zipCode,
                  }
                  setDeliveryAddress({
                    ...deliveryAddress,
                    ...newAddress,
                  })
                  // Auto-validate the selected address
                  if (
                    newAddress.line1 &&
                    newAddress.city &&
                    newAddress.state &&
                    newAddress.postalCode
                  ) {
                    validateAddress(newAddress)
                  }
                } else {
                  // Manual input
                  setDeliveryAddress({ ...deliveryAddress, line1: value })
                  // Reset validation on manual changes
                  setAddressValidation({
                    isValidating: false,
                    isValid: null,
                    error: null,
                    distance: null,
                  })
                }
              }}
              placeholder="Start typing your address..."
              required
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label htmlFor="line2" className="block text-sm font-medium text-foreground mb-1">
              Apartment, suite, etc. (optional)
            </label>
            <input
              type="text"
              id="line2"
              value={deliveryAddress.line2}
              onChange={e => setDeliveryAddress({ ...deliveryAddress, line2: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-foreground mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                required
                value={deliveryAddress.city}
                onChange={e => {
                  setDeliveryAddress({ ...deliveryAddress, city: e.target.value })
                  setAddressValidation({
                    isValidating: false,
                    isValid: null,
                    error: null,
                    distance: null,
                  })
                }}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-foreground mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                required
                maxLength={2}
                placeholder="FL"
                value={deliveryAddress.state}
                onChange={e => {
                  setDeliveryAddress({ ...deliveryAddress, state: e.target.value.toUpperCase() })
                  setAddressValidation({
                    isValidating: false,
                    isValid: null,
                    error: null,
                    distance: null,
                  })
                }}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-foreground mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="postalCode"
              required
              pattern="[0-9]{5}"
              maxLength={5}
              value={deliveryAddress.postalCode}
              onChange={e => {
                setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })
                setAddressValidation({
                  isValidating: false,
                  isValid: null,
                  error: null,
                  distance: null,
                })
              }}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          {/* Validate Address Button */}
          {!addressValidation.isValid &&
            deliveryAddress.line1 &&
            deliveryAddress.city &&
            deliveryAddress.postalCode && (
              <button
                type="button"
                onClick={validateAddress}
                disabled={addressValidation.isValidating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md text-sm font-medium text-foreground bg-background hover:bg-accent disabled:opacity-50"
              >
                {addressValidation.isValidating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  'Validate Delivery Address'
                )}
              </button>
            )}

          {/* Validation Success */}
          {addressValidation.isValid === true && (
            <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/20 rounded-md">
              <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div className="text-sm text-success">
                <p className="font-medium">Address validated</p>
                {addressValidation.distance && addressValidation.distance > 0 ? (
                  <p className="text-success">
                    {addressValidation.distance.toFixed(1)} miles from our delivery center. Delivery
                    available!
                  </p>
                ) : (
                  <p className="text-success">Your address is in our Tampa Bay delivery area.</p>
                )}
              </div>
            </div>
          )}

          {/* Validation Error */}
          {addressValidation.isValid === false && (
            <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="text-sm text-destructive">
                <p className="font-medium">Delivery not available</p>
                <p className="text-destructive">{addressValidation.error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-background p-6 rounded-xl border border-border">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>
                $
                {(
                  (((item as { price_data?: { unit_amount?: number } }).price_data?.unit_amount ||
                    item.price ||
                    0) /
                    100) *
                  item.quantity
                ).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Estimated Delivery</span>
              <span>{getEstimatedDeliveryTime()}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg mt-2 pt-2 border-t">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isProcessing || items.length === 0 || addressValidation.isValid !== true}
        className="w-full bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isProcessing
          ? 'Processing...'
          : addressValidation.isValid !== true
            ? 'Validate Address to Continue'
            : `Pay $${total.toFixed(2)} with Square`}
      </button>
    </form>
  )
}
