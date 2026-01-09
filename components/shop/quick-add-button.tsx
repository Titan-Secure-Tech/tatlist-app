'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { toast } from 'sonner'
import { useShoppingCart } from '@/lib/store/cart-store'

interface QuickAddButtonProps {
  product: {
    id: string
    name: string
    price: number
    images?: string[]
    description?: string
    in_stock?: boolean
  }
}

export function QuickAddButton({ product }: QuickAddButtonProps) {
  const { addItem } = useShoppingCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      addItem({
        id: product.id,
        name: product.name,
        price: Math.round(product.price * 100), // Convert to cents
        currency: 'USD',
        image: product.images?.[0] || '/placeholder-product.jpg',
        description: product.description || '',
        quantity: 1,
      })

      toast.success(`Added ${product.name} to cart`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  return (
    <Button
      onClick={handleAddToCart}
      disabled={product.in_stock === false}
      size="sm"
      className="w-full"
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      Add to Cart
    </Button>
  )
}
