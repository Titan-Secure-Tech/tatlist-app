'use client'

import { useEffect } from 'react'
import { useShoppingCart } from '@/lib/store/cart-store'

/**
 * Client component that clears the shopping cart after successful payment
 * This ensures the cart is only cleared after Square payment confirmation
 */
export default function ClearCartClient() {
  const { clearCart } = useShoppingCart()

  useEffect(() => {
    // Clear the cart when payment success page loads
    clearCart()
    console.log('Cart cleared after successful payment')
  }, [clearCart])

  return null // This component doesn't render anything visible
}
