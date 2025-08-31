'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useShoppingCart } from 'use-shopping-cart'
import { toast } from 'sonner'

interface SquareProduct {
  id: string
  name: string
  description: string
  imageUrl: string | null
  variations: Array<{
    id: string
    name: string
    sku: string
    price: number
    currency: string
    availableForSale: boolean
    stockStatus: string
  }>
}

interface SquareProductCardProps {
  product: SquareProduct
}

export default function SquareProductCard({ product }: SquareProductCardProps) {
  const [selectedVariation, setSelectedVariation] = useState(product.variations[0])
  const [quantity, setQuantity] = useState(1)
  const [imageError, setImageError] = useState(false)
  const { addItem } = useShoppingCart()

  const handleAddToCart = () => {
    if (!selectedVariation.availableForSale) {
      toast.error('This item is not available for sale')
      return
    }

    addItem(
      {
        id: selectedVariation.id,
        name: product.name,
        price: selectedVariation.price * 100, // use-shopping-cart expects price in cents
        currency: 'USD',
        image: product.imageUrl || undefined,
        description: product.description,
        price_data: {
          currency: 'USD',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: Math.round(selectedVariation.price * 100),
        },
      },
      { count: quantity }
    )

    toast.success(`Added ${quantity} ${product.name} to cart`)
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative w-full h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden group">
          {product.imageUrl && !imageError ? (
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain group-hover:scale-105 transition-transform duration-200"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </Link>

      <div className="mb-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-lg font-semibold text-black line-clamp-2 hover:underline">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
        )}
      </div>

      {product.variations.length > 1 && (
        <div className="mb-4">
          <label className="text-sm text-gray-600 block mb-1">Variant:</label>
          <select
            value={selectedVariation.id}
            onChange={e => {
              const variation = product.variations.find(v => v.id === e.target.value)
              if (variation) setSelectedVariation(variation)
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded"
          >
            {product.variations.map(variation => (
              <option key={variation.id} value={variation.id}>
                {variation.name} - ${variation.price.toFixed(2)}
              </option>
            ))}
          </select>
        </div>
      )}

      <p className="text-xl font-bold text-black mb-4">${selectedVariation.price.toFixed(2)}</p>

      <div className="flex items-center gap-2 mb-4">
        <label htmlFor={`qty-${product.id}`} className="text-sm text-gray-600">
          Qty:
        </label>
        <input
          id={`qty-${product.id}`}
          type="number"
          value={quantity}
          onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 px-2 py-1 border border-gray-300 rounded"
          min="1"
        />
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={!selectedVariation.availableForSale}
      >
        {selectedVariation.availableForSale ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  )
}
