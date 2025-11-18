'use client'

import { ShoppingCart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useShoppingCart } from '@/lib/store/cart-store'
import { toast } from 'sonner'

type CollectionItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    sku: string
    price: number
    images?: string[]
    in_stock: boolean
  } | null
}

interface QuickCheckoutButtonProps {
  collectionId: string
  collectionName: string
  items: CollectionItem[]
}

export default function QuickCheckoutButton({
  collectionId,
  collectionName,
  items,
}: QuickCheckoutButtonProps) {
  const router = useRouter()
  const { addItem } = useShoppingCart()

  const handleQuickCheckout = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!items || items.length === 0) {
      toast.error('This collection is empty')
      return
    }

    let addedCount = 0
    let skippedCount = 0

    // Add all in-stock items to cart
    items.forEach(item => {
      if (item.product && item.product.in_stock) {
        try {
          addItem({
            id: item.product.id,
            name: item.product.name,
            price: Math.round(item.product.price * 100), // price in cents
            quantity: item.quantity,
            currency: 'USD',
            image: item.product.images?.[0],
            description: item.product.name,
          })
          addedCount++
        } catch (error) {
          console.error(`Failed to add ${item.product.name} to cart:`, error)
        }
      } else if (item.product && !item.product.in_stock) {
        skippedCount++
      }
    })

    if (addedCount > 0) {
      if (skippedCount > 0) {
        toast.success(
          `Added ${addedCount} ${addedCount === 1 ? 'item' : 'items'} (${skippedCount} out of stock ${skippedCount === 1 ? 'item' : 'items'} skipped)`,
          {
            duration: 3000,
          }
        )
      } else {
        toast.success(
          `Express checkout: ${addedCount} ${addedCount === 1 ? 'item' : 'items'} ready!`,
          {
            duration: 3000,
          }
        )
      }
      // Navigate directly to checkout, bypassing the cart page
      router.push('/shop/checkout-v2')
    } else {
      toast.error('No items available to add to cart')
    }
  }

  return (
    <button
      onClick={handleQuickCheckout}
      className="flex items-center gap-2 px-3 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm"
      title="Add all items to cart"
    >
      <ShoppingCart className="h-4 w-4" />
      <span>Quick Checkout</span>
    </button>
  )
}
