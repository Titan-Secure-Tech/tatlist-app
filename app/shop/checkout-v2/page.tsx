'use client'

import { useEffect, useState } from 'react'
import { useShoppingCart } from '@/lib/store/cart-store'
import Link from 'next/link'
import { ArrowLeft, CreditCard, ShoppingCart, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { CartProvider } from '@/components/providers/CartProvider'
import { BusinessDetailsForm, BusinessDetails } from '@/components/checkout/business-details-form'
import { Alert, AlertDescription } from '@/components/ui/alert'

type CheckoutStep = 'business' | 'payment'

function CheckoutContent() {
  const { cartDetails, cartCount, totalPrice, clearCart } = useShoppingCart()
  const [mounted, setMounted] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('business')
  const [businessDetails, setBusinessDetails] = useState<BusinessDetails | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleBusinessDetailsSubmit = (details: BusinessDetails) => {
    setBusinessDetails(details)
    setCurrentStep('payment')
    toast.success('Business details validated successfully!')
  }

  const handleCheckout = async () => {
    if (!businessDetails) {
      toast.error('Please complete business details first')
      setCurrentStep('business')
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
          deliveryAddress: {
            line1: businessDetails.street,
            city: businessDetails.city,
            state: businessDetails.state,
            postalCode: businessDetails.zipCode,
          },
          customerInfo: {
            name: businessDetails.businessName,
            email: businessDetails.email,
            phone: businessDetails.phone,
          },
          businessInfo: {
            businessName: businessDetails.businessName,
            licenseNumber: businessDetails.licenseNumber,
            coordinates: businessDetails.coordinates,
            distance: businessDetails.distance,
          },
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
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
  const deliveryFee = businessDetails?.distance ? Math.max(5, businessDetails.distance * 0.5) : 5.0
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
          <h1 className="text-2xl font-bold">Secure Checkout</h1>
          <p className="text-sm text-muted-foreground">Licensed tattoo shops only</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold ${
                currentStep === 'business'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-green-500 text-white'
              }`}
            >
              {currentStep === 'payment' ? <CheckCircle className="h-5 w-5" /> : '1'}
            </div>
            <span className="ml-2 text-sm font-medium">Business Details</span>
          </div>
          <div className="w-16 h-0.5 bg-gray-300" />
          <div className="flex items-center">
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold ${
                currentStep === 'payment'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-600">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'business' ? (
            <Card>
              <CardHeader>
                <CardTitle>Business Information & Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertDescription>
                    We only deliver to licensed tattoo shops within a 25-mile radius of Tampa. Your
                    business address will be validated to ensure delivery availability.
                  </AlertDescription>
                </Alert>
                <BusinessDetailsForm
                  onSubmit={handleBusinessDetailsSubmit}
                  initialValues={businessDetails || undefined}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Order Confirmation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Delivery Details</h3>
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Business:</span>
                      <span className="text-sm font-medium">{businessDetails?.businessName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Address:</span>
                      <span className="text-sm font-medium">
                        {businessDetails?.street}, {businessDetails?.city}, {businessDetails?.state}{' '}
                        {businessDetails?.zipCode}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Distance:</span>
                      <span className="text-sm font-medium">
                        {businessDetails?.distance?.toFixed(1)} miles from delivery center
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Contact:</span>
                      <span className="text-sm font-medium">{businessDetails?.phone}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Payment Information</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You will be redirected to Square&apos;s secure payment page to complete your
                    purchase.
                  </p>
                  <Alert>
                    <AlertDescription>
                      Your payment information is processed securely by Square. We never store your
                      credit card details.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('business')}
                    disabled={isProcessing}
                  >
                    Edit Details
                  </Button>
                  <Button
                    onClick={handleCheckout}
                    size="lg"
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay ${total.toFixed(2)} with Square
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
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
                  <span className="text-muted-foreground">
                    Delivery Fee
                    {businessDetails?.distance && (
                      <span className="text-xs block">
                        ({businessDetails.distance.toFixed(1)} miles)
                      </span>
                    )}
                  </span>
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

              {businessDetails?.validated && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700 text-xs">
                    Delivery address validated
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <CartProvider>
      <main className="min-h-screen bg-white">
        <nav className="border-b bg-white/95 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="text-xl font-bold">
                Tatlist
              </Link>
              <div className="flex items-center space-x-4">
                <Link href="/shop" className="text-sm font-medium">
                  Shop
                </Link>
                <Link href="/shop/checkout" className="text-sm font-medium">
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <CheckoutContent />
        </div>
      </main>
    </CartProvider>
  )
}
