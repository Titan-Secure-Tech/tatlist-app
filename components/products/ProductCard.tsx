'use client'

import { useState, useEffect } from 'react'
import { CirclePlus, CircleMinus } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { useShoppingCart } from '@/lib/store/cart-store'
import { toast } from 'sonner'
import CollectionModal from '@/components/inventory/CollectionModal'
import { useRouter } from 'next/navigation'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isInInventory, setIsInInventory] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const [showCollectionModal, setShowCollectionModal] = useState(false)
  const supabase = createClient()
  const { addItem } = useShoppingCart()
  const router = useRouter()

  useEffect(() => {
    // Check if product is in inventory on mount
    const checkInventory = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .match({ user_id: user.id, product_id: product.id })
        .maybeSingle()

      if (data) setIsInInventory(true)
    }

    checkInventory()
  }, [product.id, supabase])

  const toggleInventory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please sign in to add to inventory')
      return
    }

    if (isInInventory) {
      // Optimistic update - change to plus icon immediately
      setIsInInventory(false)

      // Remove from inventory in background
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, product_id: product.id })

      if (error) {
        // Rollback on error
        setIsInInventory(true)
        toast.error('Failed to remove from inventory')
        console.error('Error removing from inventory:', error)
      } else {
        toast.success('Removed from inventory')
        router.refresh() // Refresh server components
      }
    } else {
      // Optimistic update - change to minus icon immediately
      setIsInInventory(true)

      // Show toast with "Add to Collection" button immediately
      toast.success('Added to inventory', {
        action: {
          label: 'Add to Collection',
          onClick: () => setShowCollectionModal(true),
        },
        duration: 15000, // Persist for 15 seconds to give user time to add to collection
      })

      // Add to general inventory in background
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: product.id })

      if (error) {
        // Rollback on error
        setIsInInventory(false)
        toast.error('Failed to add to inventory')
        console.error('Error adding to inventory:', error)
      } else {
        router.refresh() // Refresh server components
      }
    }
  }

  const handleAddToCart = () => {
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: Math.round(product.price * 100), // use-shopping-cart expects price in cents
        currency: 'USD',
        image: product.images?.[0],
        description: product.description,
      }

      addItem(cartItem, { count: quantity })
      toast.success(`${product.name} added to cart`)
      console.log('Product added to cart:', { product: product.name, quantity })
    } catch (error) {
      console.error('Failed to add product to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  return (
    <div className="border border-border rounded-xl p-4 hover:shadow-lg transition-shadow">
      {/* Product Images - Enhanced for FireCrawl data */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative w-full h-48 mb-4 bg-secondary rounded-xl overflow-hidden group">
          {product.images && product.images.length > 0 && !imageError ? (
            <>
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-contain group-hover:scale-105 transition-transform duration-200"
                onError={() => setImageError(true)}
              />
              {product.images.length > 1 && (
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  +{product.images.length - 1} more
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </Link>

      <div className="flex justify-between items-start mb-4">
        <Link href={`/products/${product.id}`} className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground line-clamp-2 hover:underline">
            {product.name}
          </h3>
        </Link>
        <button
          onClick={toggleInventory}
          type="button"
          className="p-2 hover:bg-accent rounded-full ml-2 transition-all hover:scale-110 active:scale-95 flex-shrink-0 relative z-10 cursor-pointer"
          aria-label={isInInventory ? 'Remove from inventory' : 'Add to inventory'}
        >
          {isInInventory ? (
            <CircleMinus className="h-5 w-5 text-foreground transition-colors" />
          ) : (
            <CirclePlus className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
          )}
        </button>
      </div>

      <p className="text-muted-foreground text-sm mb-1">{product.brand}</p>
      {product.category && <p className="text-muted-foreground text-xs mb-2">{product.category}</p>}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xl font-bold text-foreground">${product.price}</p>
        {product.stock_quantity && (
          <p className="text-sm text-muted-foreground">In stock: {product.stock_quantity}</p>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <label htmlFor={`qty-${product.id}`} className="text-sm text-muted-foreground">
          Qty:
        </label>
        <input
          id={`qty-${product.id}`}
          type="number"
          value={quantity}
          onChange={e =>
            setQuantity(
              Math.max(1, Math.min(parseInt(e.target.value) || 1, product.stock_quantity || 99))
            )
          }
          className="w-16 px-2 py-1 border border-border rounded"
          min="1"
          max={product.stock_quantity || 99}
        />
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground py-2 rounded-xl hover:opacity-90 transition-opacity"
        disabled={!product.in_stock}
      >
        {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
      </button>

      <CollectionModal
        productId={product.id}
        productName={product.name}
        isOpen={showCollectionModal}
        onClose={() => setShowCollectionModal(false)}
      />
    </div>
  )
}
