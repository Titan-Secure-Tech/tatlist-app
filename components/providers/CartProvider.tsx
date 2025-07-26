'use client'

import { ReactNode } from 'react'
import { CartProvider as USCProvider } from 'use-shopping-cart'

interface CartProviderProps {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  return (
    <USCProvider
      mode="payment"
      cartMode="client-only"
      stripe={process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}
      successUrl="/orders/success"
      cancelUrl="/cart"
      currency="USD"
      allowedCountries={['US']}
      billingAddressCollection={true}
      shouldPersist={true}
    >
      {children}
    </USCProvider>
  )
}