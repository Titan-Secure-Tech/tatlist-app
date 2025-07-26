'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { useShoppingCart } from 'use-shopping-cart'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const supabase = createClient()
  const { addItem } = useShoppingCart()

  useEffect(() => {
    // Check if product is favorited on mount
    const checkFavorite = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .match({ user_id: user.id, product_id: product.id })
        .single()

      if (data) setIsFavorited(true)
    }
    
    checkFavorite()
  }, [product.id, supabase])

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (isFavorited) {
      await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, product_id: product.id })
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: product.id })
    }
    
    setIsFavorited(!isFavorited)
  }

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price * 100, // use-shopping-cart expects price in cents
      currency: 'USD',
      image: product.images?.[0],
      description: product.description,
      price_data: {
        currency: 'USD',
        product_data: {
          name: product.name,
          description: product.description,
          images: product.images
        },
        unit_amount: product.price * 100
      }
    }, {
      count: quantity
    })
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-black line-clamp-2">{product.name}</h3>
        <button
          onClick={toggleFavorite}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Heart
            className={`h-5 w-5 ${isFavorited ? 'fill-black text-black' : 'text-gray-400'}`}
          />
        </button>
      </div>
      
      <p className="text-gray-600 text-sm mb-2">{product.brand}</p>
      <p className="text-xl font-bold text-black mb-4">${product.price}</p>
      
      <div className="flex items-center gap-2 mb-4">
        <label htmlFor={`qty-${product.id}`} className="text-sm text-gray-600">Qty:</label>
        <input
          id={`qty-${product.id}`}
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 px-2 py-1 border border-gray-300 rounded"
          min="1"
        />
      </div>
      
      <button
        onClick={handleAddToCart}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors"
        disabled={!product.inStock}
      >
        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  )
}