'use client'

import { useState } from 'react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { ShoppingCart, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { useShoppingCart } from '@/lib/store/cart-store'
import type { ProductsWithRelationshipsView } from '@/src/db/schema'

interface AddToCartButtonProps extends Omit<ButtonProps, 'onClick'> {
  product: ProductsWithRelationshipsView
}

export function AddToCartButton({
  product,
  size = 'default',
  className,
  ...props
}: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const { addItem, cartDetails } = useShoppingCart()

  const isInCart = cartDetails && cartDetails[product.id]

  const handleAddToCart = () => {
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: Math.round(product.price * 100), // Convert to cents
        currency: 'USD',
        image: product.images[0] || '/placeholder-product.jpg',
        description: product.description || '',
        quantity: quantity,
      })

      toast.success(`Added ${quantity} ${product.name} to cart`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  return (
    <div className="space-y-3">
      {/* Quantity Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setQuantity(q => Math.max(1, q - 1))}
          disabled={quantity <= 1}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-medium">{quantity}</span>
        <Button variant="outline" size="icon" onClick={() => setQuantity(q => q + 1)}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add to Cart Button */}
      <Button
        onClick={handleAddToCart}
        disabled={!product.in_stock}
        size={size}
        className={className}
        {...props}
      >
        {isInCart ? (
          <>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Update Cart
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" />
            Add to Cart
          </>
        )}
      </Button>
    </div>
  )
}
