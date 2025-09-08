'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { useShoppingCart } from '@/lib/store/cart-store'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const supabase = createClient()
  const { addItem } = useShoppingCart()

  useEffect(() => {
    // Check if product is favorited on mount
    const checkFavorite = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .match({ user_id: user.id, product_id: product.id })
        .maybeSingle()

      if (data) setIsFavorited(true)
    }

    checkFavorite()
  }, [product.id, supabase])

  const toggleFavorite = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please sign in to add favorites')
      return
    }

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .match({ user_id: user.id, product_id: product.id })

        if (error) throw error

        setIsFavorited(false)
        toast.success('Removed from favorites')
      } else {
        // Use upsert to handle potential duplicates
        const { error } = await supabase
          .from('favorites')
          .upsert(
            { user_id: user.id, product_id: product.id },
            { onConflict: 'user_id,product_id' }
          )

        if (error) {
          // If upsert fails, it might already exist, so just set as favorited
          if (error.code === '23505' || error.message?.includes('duplicate')) {
            setIsFavorited(true)
            toast.info('Already in favorites')
          } else {
            throw error
          }
        } else {
          setIsFavorited(true)
          toast.success('Added to favorites!')
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
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
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      {/* Product Images - Enhanced for FireCrawl data */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden group">
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
            <div className="w-full h-full flex items-center justify-center text-gray-400">
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
        <Link href={`/products/${product.id}`} className="flex-1">
          <h3 className="text-lg font-semibold text-black line-clamp-2 hover:underline">
            {product.name}
          </h3>
        </Link>
        <button
          onClick={e => {
            e.preventDefault()
            e.stopPropagation()
            toggleFavorite()
          }}
          className="p-2 hover:bg-gray-100 rounded-full ml-2 transition-all hover:scale-110 active:scale-95"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-500'}`}
          />
        </button>
      </div>

      <p className="text-gray-600 text-sm mb-1">{product.brand}</p>
      {product.category && <p className="text-gray-500 text-xs mb-2">{product.category}</p>}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xl font-bold text-black">${product.price}</p>
        {product.stock_quantity && (
          <p className="text-sm text-gray-600">In stock: {product.stock_quantity}</p>
        )}
      </div>

      <div className="flex items-center gap-2 mb-4">
        <label htmlFor={`qty-${product.id}`} className="text-sm text-gray-600">
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
          className="w-16 px-2 py-1 border border-gray-300 rounded"
          min="1"
          max={product.stock_quantity || 99}
        />
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors"
        disabled={!product.in_stock}
      >
        {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  )
}
