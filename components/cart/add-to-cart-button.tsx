'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useCartStore, { CartItem } from '@/lib/store/cart'

interface AddToCartButtonProps {
  product: Omit<CartItem, 'quantity'>
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  showIcon?: boolean
}

export function AddToCartButton({ 
  product,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  showIcon = true
}: AddToCartButtonProps) {
  const { addItem, openCart } = useCartStore()
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    addItem(product)
    setIsAdded(true)
    
    // Show success state briefly, then open cart
    setTimeout(() => {
      setIsAdded(false)
      openCart()
    }, 800)
  }

  if (isAdded) {
    return (
      <Button 
        variant="secondary" 
        size={size}
        className={className}
        disabled
      >
        {showIcon && <Check className="mr-2 h-4 w-4" />}
        Added!
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={disabled}
    >
      {showIcon && <Plus className="mr-2 h-4 w-4" />}
      Add to Cart
    </Button>
  )
}