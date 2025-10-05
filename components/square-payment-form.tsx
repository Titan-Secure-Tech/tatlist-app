'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Loader2, CreditCard as CreditCardIcon } from 'lucide-react'

interface SquarePaymentFormProps {
  amount: number
  onSuccess: (token: string, marketingOptIn: boolean) => void
  isProcessing: boolean
}

export function SquarePaymentForm({ amount, onSuccess, isProcessing }: SquarePaymentFormProps) {
  const [, setPayments] = useState<unknown>(null)
  const [card, setCard] = useState<unknown>(null)
  const [googlePay, setGooglePay] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [marketingOptIn, setMarketingOptIn] = useState(false)

  useEffect(() => {
    const initializeSquare = async () => {
      // Small delay to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100))

      if (!window.Square) {
        // Load Square Web SDK script - use production in production environment
        const isProduction = process.env.NODE_ENV === 'production'
        const scriptUrl = isProduction
          ? 'https://web.squarecdn.com/v1/square.js'
          : 'https://sandbox.web.squarecdn.com/v1/square.js'
        const script = document.createElement('script')
        script.src = scriptUrl
        script.async = true
        script.onload = () => initializePayments()
        script.onerror = () => {
          console.error('Failed to load Square Web SDK')
          setError(
            'Failed to load payment system. Please check your internet connection and refresh.'
          )
          setIsInitializing(false)
        }
        document.body.appendChild(script)
      } else {
        await initializePayments()
      }
    }

    const initializePayments = async () => {
      try {
        const isProduction = process.env.NODE_ENV === 'production'
        const applicationId = isProduction
          ? process.env.NEXT_PUBLIC_SQUARE_PRODUCTION_APPLICATION_ID
          : process.env.NEXT_PUBLIC_SQUARE_SANDBOX_APPLICATION_ID
        const locationId = isProduction
          ? process.env.NEXT_PUBLIC_SQUARE_PRODUCTION_LOCATION_ID
          : process.env.NEXT_PUBLIC_SQUARE_SANDBOX_LOCATION_ID

        if (!applicationId || !locationId) {
          console.error('Square credentials missing:', {
            applicationId: applicationId ? 'SET' : 'MISSING',
            locationId: locationId ? 'SET' : 'MISSING',
          })
          throw new Error(
            'Square payment credentials are not configured. Please check your environment variables.'
          )
        }

        if (!window.Square) {
          throw new Error('Square Web SDK failed to load. Please check your internet connection.')
        }

        const paymentsInstance = (
          window as unknown as { Square: { payments: (appId: string, locId: string) => unknown } }
        ).Square.payments(applicationId, locationId)
        setPayments(paymentsInstance)

        // Initialize Card payment method
        const cardInstance = await (
          paymentsInstance as {
            card: () => Promise<{ attach: (selector: string) => Promise<void> }>
          }
        ).card()

        // Wait for DOM element to be available
        const cardContainer = document.getElementById('card-container')
        if (!cardContainer) {
          throw new Error('Payment form container not found. Please refresh the page.')
        }

        await cardInstance.attach('#card-container')
        setCard(cardInstance)

        // Check if Google Pay is available
        try {
          const googlePayRequest = (
            paymentsInstance as { paymentRequest: (req: unknown) => unknown }
          ).paymentRequest({
            countryCode: 'US',
            currencyCode: 'USD',
            total: {
              amount: String(amount * 100), // Convert to cents
              label: 'Total',
            },
          })

          const googlePayInstance = await (
            paymentsInstance as {
              googlePay: (req: unknown) => Promise<{ attach: (selector: string) => Promise<void> }>
            }
          ).googlePay(googlePayRequest)
          await googlePayInstance.attach('#google-pay-button')
          setGooglePay(googlePayInstance)
        } catch (e) {
          console.log('Google Pay not available:', e)
        }

        setIsInitializing(false)
      } catch (error) {
        console.error('Error initializing Square payments:', error)
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to initialize payment form. Please refresh and try again.'
        setError(errorMessage)
        setIsInitializing(false)
      }
    }

    initializeSquare()

    return () => {
      // Cleanup
      if (card) {
        ;(card as { destroy: () => void }).destroy()
      }
      if (googlePay) {
        ;(googlePay as { destroy: () => void }).destroy()
      }
    }
  }, [amount, card, googlePay])

  const handleCardPayment = async () => {
    if (!card) return

    setError(null)

    try {
      const result = await (
        card as {
          tokenize: () => Promise<{
            status: string
            token?: string
            errors?: Array<{ message: string }>
          }>
        }
      ).tokenize()

      if (result.status === 'OK') {
        onSuccess(result.token, marketingOptIn)
      } else {
        let errorMessage = 'Payment failed'
        if (result.errors && result.errors.length > 0) {
          errorMessage = result.errors[0].message
        }
        setError(errorMessage)
      }
    } catch (error) {
      console.error('Card payment error:', error)
      setError('An error occurred processing your payment. Please try again.')
    }
  }

  // Google Pay handler - commented out for now as it's not being used
  // const handleGooglePay = async () => {
  //   if (!googlePay) return
  //   setError(null)
  //   try {
  //     const result = await (googlePay as { tokenize: () => Promise<{ status: string; token?: string }> }).tokenize()
  //     if (result.status === 'OK' && result.token) {
  //       onSuccess(result.token)
  //     } else {
  //       setError('Google Pay payment failed')
  //     }
  //   } catch (error) {
  //     console.error('Google Pay error:', error)
  //     setError('An error occurred with Google Pay. Please try again.')
  //   }
  // }

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Initializing payment form...</span>
      </div>
    )
  }

  if (error && !card) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center py-4">
          <Button onClick={() => window.location.reload()} variant="outline" className="w-full">
            Refresh Page and Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Card Payment Form */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Card Details</label>
          <div id="card-container" className="min-h-[90px] p-3 border rounded-md" />
        </div>

        {/* Payment Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleCardPayment}
            disabled={isProcessing || !card}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCardIcon className="mr-2 h-4 w-4" />
                Pay ${amount.toFixed(2)}
              </>
            )}
          </Button>

          {googlePay && <div id="google-pay-button" />}
        </div>

        {/* Stay in Touch Section */}
        <div className="border-t pt-6 mt-6">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Stay in touch</h3>

            <div className="flex items-start space-x-3">
              <Switch
                id="marketing-opt-in"
                checked={marketingOptIn}
                onCheckedChange={setMarketingOptIn}
                className="mt-1"
              />
              <label
                htmlFor="marketing-opt-in"
                className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                <span className="font-medium text-foreground">Sign up</span>
                <p className="mt-1">
                  By signing up, I agree to receive automated informational and marketing texts,
                  including Loyalty messages, coupons, and discounts. Joining this program is not a
                  condition of purchase. To unsubscribe at any time, reply &quot;END&quot;, std
                  rates apply. The card you use for this or future transactions will be
                  automatically linked with your account to surface offers or rewards.
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Test Card Info */}
        {process.env.NODE_ENV !== 'production' && (
          <div className="p-3 bg-muted rounded-lg text-xs text-muted-foreground">
            <p className="font-semibold mb-1">Test Card Numbers:</p>
            <p>Visa: 4111 1111 1111 1111</p>
            <p>Mastercard: 5105 1051 0510 5100</p>
            <p>Any CVV: 111, Any ZIP: 11111</p>
          </div>
        )}
      </div>
    </div>
  )
}
