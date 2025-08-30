'use client'

import { useState } from 'react'
import { useShoppingCart } from 'use-shopping-cart'
import { toast } from 'sonner'
import {
  isZipCodeSupported,
  getDeliveryFee,
  getEstimatedDeliveryTime,
  isDeliveryAvailable,
  DELIVERY_CONFIG,
} from '@/lib/config/delivery'

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

  const subtotal = (totalPrice || 0) / 100 // use-shopping-cart uses cents
  const deliveryFee = getDeliveryFee(deliveryAddress.postalCode) || DELIVERY_CONFIG.flatFee
  const total = subtotal + deliveryFee
  const isValidZipCode =
    deliveryAddress.postalCode.length === 5 ? isZipCodeSupported(deliveryAddress.postalCode) : true

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

    if (!isZipCodeSupported(deliveryAddress.postalCode)) {
      toast.error("Sorry, we don't deliver to this ZIP code yet.")
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
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Customer Information</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              required
              value={customerInfo.name}
              onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              required
              value={customerInfo.email}
              onChange={e => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={customerInfo.phone}
              onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Delivery Address</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="line1" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              id="line1"
              required
              value={deliveryAddress.line1}
              onChange={e => setDeliveryAddress({ ...deliveryAddress, line1: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div>
            <label htmlFor="line2" className="block text-sm font-medium text-gray-700 mb-1">
              Apartment, suite, etc. (optional)
            </label>
            <input
              type="text"
              id="line2"
              value={deliveryAddress.line2}
              onChange={e => setDeliveryAddress({ ...deliveryAddress, line2: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="city"
                required
                value={deliveryAddress.city}
                onChange={e => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                id="state"
                required
                maxLength={2}
                placeholder="CA"
                value={deliveryAddress.state}
                onChange={e =>
                  setDeliveryAddress({ ...deliveryAddress, state: e.target.value.toUpperCase() })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          </div>

          <div>
            <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code
            </label>
            <input
              type="text"
              id="postalCode"
              required
              pattern="[0-9]{5}"
              maxLength={5}
              value={deliveryAddress.postalCode}
              onChange={e => setDeliveryAddress({ ...deliveryAddress, postalCode: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
            />
            {deliveryAddress.postalCode.length === 5 && !isValidZipCode && (
              <p className="text-red-500 text-sm mt-1">
                Sorry, we don&apos;t deliver to this ZIP code yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
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
                  ((item.price_data?.unit_amount || item.price || 0) / 100) *
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
            <div className="flex justify-between text-sm text-gray-600">
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
        disabled={isProcessing || items.length === 0}
        className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)} with Square`}
      </button>
    </form>
  )
}
