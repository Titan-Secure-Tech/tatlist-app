'use client'

import { useEffect, useState, useCallback } from 'react'

// Force dynamic rendering to avoid prerendering issues
export const dynamic = 'force-dynamic'
import { useShoppingCart } from '@/lib/store/cart-store'
import Link from 'next/link'
import {
  ArrowLeft,
  CreditCard,
  ShoppingCart,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useSandbox } from '@/lib/contexts/sandbox-context'
import { CartSuggestions } from '@/components/shop/cart-suggestions'
import AddressAutocomplete from '@/components/forms/AddressAutocomplete'

interface CustomerInfo {
  name: string
  email: string
  phone: string
}

interface DeliveryAddress {
  line1: string
  line2?: string
  city: string
  state: string
  postalCode: string
}

function CheckoutContent() {
  const { cartDetails, cartCount, totalPrice, clearCart } = useShoppingCart()
  const { isSandboxMode, setUserEmail } = useSandbox()
  const [mounted, setMounted] = useState(false)
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

  const [addressValidation, setAddressValidation] = useState<{
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

  useEffect(() => {
    setMounted(true)
  }, [])

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

    // Validate form
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast.error('Please fill in all customer information fields')
      return
    }

    if (
      !deliveryAddress.line1 ||
      !deliveryAddress.city ||
      !deliveryAddress.state ||
      !deliveryAddress.postalCode
    ) {
      toast.error('Please fill in all required address fields')
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

    setIsProcessing(true)

    try {
      const cartItems = cartDetails
        ? Object.values(cartDetails).map(item => ({
            id: item.id,
            name: item.name,
            price: item.price / 100, // Convert from cents to dollars
            quantity: item.quantity,
            variant: item.variant,
          }))
        : []

      const response = await fetch('/api/square/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems,
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
        const message = data.sandboxMode
          ? '🧪 Redirecting to Square Sandbox payment...'
          : 'Redirecting to payment...'
        toast.success(message)
        window.location.href = data.paymentLink
      } else {
        throw new Error('No payment link received')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error(error instanceof Error ? error.message : 'Checkout failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!cartCount || cartCount === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-16 pb-8">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Your Cart is Empty</h1>
            <p className="text-muted-foreground mb-8">Add items to your cart before checkout</p>
            <Button asChild size="lg">
              <Link href="/shop">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cartItems = cartDetails ? Object.values(cartDetails) : []
  const subtotal = (totalPrice ?? 0) / 100
  const deliveryFee = 5.0
  const tax = subtotal * 0.08 // 8% tax rate
  const total = subtotal + deliveryFee + tax

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/shop">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="text-sm text-muted-foreground">Complete your order</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Customer Information Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                Customer Information
                {isSandboxMode && (
                  <span className="ml-2 text-sm font-normal text-orange-600">
                    (🧪 Sandbox Mode Active)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={customerInfo.name}
                        onChange={e => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={customerInfo.email}
                        onChange={e => {
                          const newEmail = e.target.value
                          setCustomerInfo({ ...customerInfo, email: newEmail })
                          // Update sandbox context when email changes
                          if (newEmail) {
                            setUserEmail(newEmail)
                          }
                        }}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={customerInfo.phone}
                      onChange={e => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Delivery Address */}
                <div className="space-y-4">
                  <h3 className="font-semibold">Delivery Address</h3>
                  <p className="text-sm text-muted-foreground">
                    We deliver to the Tampa Bay area. Start typing your address for suggestions.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="line1">Street Address *</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="line2">Apartment, Suite, etc. (Optional)</Label>
                    <Input
                      id="line2"
                      type="text"
                      placeholder="Apt 4B"
                      value={deliveryAddress.line2}
                      onChange={e =>
                        setDeliveryAddress({ ...deliveryAddress, line2: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="Tampa"
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
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="FL"
                        maxLength={2}
                        value={deliveryAddress.state}
                        onChange={e => {
                          setDeliveryAddress({
                            ...deliveryAddress,
                            state: e.target.value.toUpperCase(),
                          })
                          setAddressValidation({
                            isValidating: false,
                            isValid: null,
                            error: null,
                            distance: null,
                          })
                        }}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">ZIP Code *</Label>
                      <Input
                        id="postalCode"
                        type="text"
                        placeholder="33601"
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
                        required
                      />
                    </div>
                  </div>

                  {/* Validate Address Button */}
                  {!addressValidation.isValid &&
                    deliveryAddress.line1 &&
                    deliveryAddress.city &&
                    deliveryAddress.postalCode && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => validateAddress()}
                        disabled={addressValidation.isValidating}
                        className="w-full"
                      >
                        {addressValidation.isValidating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          'Validate Delivery Address'
                        )}
                      </Button>
                    )}

                  {/* Validation Success */}
                  {addressValidation.isValid === true && (
                    <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/30 rounded-md">
                      <CheckCircle className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-success">
                        <p className="font-medium">Address validated</p>
                        {addressValidation.distance && addressValidation.distance > 0 ? (
                          <p className="text-success">
                            {addressValidation.distance.toFixed(1)} miles from our delivery center.
                            Delivery available!
                          </p>
                        ) : (
                          <p className="text-success">
                            Your address is in our Tampa Bay delivery area.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Validation Error */}
                  {addressValidation.isValid === false && (
                    <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-md">
                      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-destructive">
                        <p className="font-medium">Delivery not available</p>
                        <p className="text-destructive">{addressValidation.error}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isProcessing || addressValidation.isValid !== true}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : addressValidation.isValid !== true ? (
                    'Validate Address to Continue'
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay ${total.toFixed(2)} with Square
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cart Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <CheckoutContent />

        {/* Cart Suggestions */}
        <CartSuggestions />
      </div>
    </main>
  )
}
