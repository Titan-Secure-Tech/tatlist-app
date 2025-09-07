'use client'

import { useState } from 'react'
import { Heart, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Product } from '@/types'
import { useShoppingCart } from '@/lib/store/cart-store'

interface ProductDetailProps {
  product: Product
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const router = useRouter()
  const { addItem } = useShoppingCart()

  const images = product.images || []
  const attachments = (product as Product & { attachments?: string[] }).attachments || []

  const handleAddToCart = () => {
    addItem(
      {
        id: product.id,
        name: product.name,
        price: product.price * 100,
        currency: 'USD',
        image: images[0],
        description: product.description,
        price_data: {
          currency: 'USD',
          product_data: {
            name: product.name,
            description: product.description,
            images: images,
          },
          unit_amount: product.price * 100,
        },
      },
      {
        count: quantity,
      }
    )
  }

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex(prev => (prev + 1) % images.length)
    }
  }

  const previousImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex(prev => (prev - 1 + images.length) % images.length)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 text-gray-600 hover:text-black flex items-center gap-2"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Products
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div className="space-y-4">
          <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-square">
            {images.length > 0 ? (
              <>
                <Image
                  src={images[currentImageIndex]}
                  alt={`${product.name} - Image ${currentImageIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 50vw"
                  className="object-contain"
                  priority
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={previousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md z-10"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    index === currentImageIndex ? 'border-black' : 'border-gray-200'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">{product.name}</h1>
            <p className="text-lg text-gray-600">{product.brand}</p>
            {product.category && (
              <p className="text-sm text-gray-500">Category: {product.category}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
          </div>

          <div className="text-3xl font-bold text-black">${product.price}</div>

          <div className="prose prose-sm max-w-none">
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${product.in_stock ? 'bg-green-500' : 'bg-red-500'}`}
            />
            <span className={product.in_stock ? 'text-green-700' : 'text-red-700'}>
              {product.in_stock
                ? `In Stock${product.stock_quantity ? ` (${product.stock_quantity} available)` : ''}`
                : 'Out of Stock'}
            </span>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Add to Cart */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-4">
              <label htmlFor="quantity" className="text-gray-700">
                Quantity:
              </label>
              <input
                id="quantity"
                type="number"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
                max={product.stock_quantity || 999}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
                disabled={!product.in_stock}
              >
                {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </button>

              <button className="p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Heart className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-3">Downloads</h3>
              <div className="space-y-2">
                {attachments.map((attachment: string, index: number) => {
                  const filename = attachment.split('/').pop() || 'document.pdf'
                  return (
                    <a
                      key={index}
                      href={attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <Download className="h-5 w-5 text-gray-500" />
                      <span className="text-gray-700">{filename}</span>
                    </a>
                  )
                })}
              </div>
            </div>
          )}

          {/* Source Link */}
          {(product as Product & { source_url?: string }).source_url && (
            <div className="border-t pt-6">
              <a
                href={(product as Product & { source_url?: string }).source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                View on Lucky Supply →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
