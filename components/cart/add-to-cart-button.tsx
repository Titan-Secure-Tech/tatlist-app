'use client'

import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useShoppingCart } from 'use-shopping-cart'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  price: number
  image?: string
  sku?: string
  description?: string
}

interface AddToCartButtonProps {
  product: Product
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  disabled?: boolean
  showIcon?: boolean
  quantity?: number
}

export function AddToCartButton({
  product,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  showIcon = true,
  quantity = 1,
}: AddToCartButtonProps) {
  const { addItem } = useShoppingCart()
  const [isAdded, setIsAdded] = useState(false)

  const handleAddToCart = () => {
    try {
      addItem(
        {
          id: product.id,
          name: product.name,
          price: Math.round(product.price * 100), // use-shopping-cart expects price in cents, rounded to avoid precision issues
          currency: 'USD',
          image: product.image,
          description: product.description,
          price_data: {
            currency: 'USD',
            product_data: {
              name: product.name,
              description: product.description,
              images: product.image ? [product.image] : [],
            },
            unit_amount: Math.round(product.price * 100),
          },
        },
        { count: quantity }
      )

      setIsAdded(true)

      // Show toast notification
      toast.success(`${product.name} added to cart!`, {
        description: 'Continue shopping or view your cart',
        action: {
          label: 'View Cart',
          onClick: () => (window.location.href = '/cart'),
        },
      })

      // Show success state briefly
      setTimeout(() => {
        setIsAdded(false)
      }, 800)
    } catch (error) {
      // Handle add to cart errors
      console.error('Failed to add item to cart:', error)
      toast.error('Failed to add item to cart. Please try again.')
    }
  }

  if (isAdded) {
    return (
      <Button variant="secondary" size={size} className={className} disabled>
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
