'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Heart, Share2, ShoppingBag, Minus, Plus } from 'lucide-react'
import { Product } from '@/types'
import { useShoppingCart } from '@/lib/store/cart-store'
import { toast } from 'sonner'
import { ProductSection } from './ProductSection'

interface ProductDetailProps {
  product: Product
  relatedProducts?: Product[]
}

export default function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)

  const { addItem } = useShoppingCart()
  const router = useRouter()

  const images = product.images?.length ? product.images : []

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: Math.round(product.price * 100),
      currency: 'USD',
      image: images[0],
      description: product.description,
    }

    addItem(cartItem, { count: quantity })
    toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`, {
      action: {
        label: 'View Cart',
        onClick: () => router.push('/cart'),
      },
    })
  }

  const relatedForSection = relatedProducts.map(p => ({
    id: p.id,
    name: p.name,
    price: `$${p.price}`,
    image: p.images?.[0] || '/assets/images/tatlist-ink-supplies.jpeg',
    href: `/products/${p.id}`,
  }))

  return (
    <div className="flex flex-col w-full max-w-[500px] mx-auto lg:max-w-full pb-28 md:pb-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={() => router.back()}
          className="size-10 flex items-center justify-center"
          aria-label="Go back"
        >
          <ArrowLeft className="size-6 text-[var(--tatlist-text-primary)]" />
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsFavorite(!isFavorite)} aria-label="Add to favorites">
            <Heart
              className={`size-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-[var(--tatlist-text-primary)]'}`}
            />
          </button>
          <button aria-label="Share product">
            <Share2 className="size-6 text-[var(--tatlist-text-primary)]" />
          </button>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:px-4">
        {/* Image Section */}
        <div className="px-4 lg:px-0">
          {/* Main Image */}
          <div className="relative aspect-square bg-[var(--tatlist-bg-card)] rounded-2xl overflow-hidden mb-3">
            {images.length > 0 ? (
              <Image
                src={images[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-contain p-6"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="size-24 text-[var(--tatlist-text-secondary)]" />
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div
              className="flex gap-2 overflow-x-auto scrollbar-none mb-4"
              style={{ scrollbarWidth: 'none' }}
            >
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`shrink-0 size-16 rounded-xl overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === i
                      ? 'border-[var(--tatlist-brand-400)]'
                      : 'border-transparent'
                  }`}
                >
                  <div className="relative size-full bg-[var(--tatlist-bg-card)]">
                    <Image
                      src={img}
                      alt={`${product.name} ${i + 1}`}
                      fill
                      className="object-contain p-1"
                      sizes="64px"
                    />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 lg:px-0 flex flex-col gap-6">
          {/* Name & Price */}
          <div>
            <h1 className="text-[var(--tatlist-text-primary)] text-base leading-6 tracking-tight mb-1">
              {product.name}
            </h1>
            <div className="flex items-baseline gap-2">
              <span className="text-[var(--tatlist-text-primary)] text-xl font-medium leading-7 tracking-tight">
                ${product.price}
              </span>
              {product.brand && (
                <span className="text-[var(--tatlist-text-secondary)] text-sm">
                  {product.brand}
                </span>
              )}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <span className="text-[var(--tatlist-text-secondary)] text-sm">Quantity</span>
            <div className="flex items-center gap-0 bg-[var(--tatlist-bg-tertiary)] rounded-xl">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="size-10 flex items-center justify-center text-[var(--tatlist-text-primary)]"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-10 text-center text-[var(--tatlist-text-primary)] font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                className="size-10 flex items-center justify-center text-[var(--tatlist-text-primary)]"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h2 className="font-[family-name:var(--font-heading)] text-xl leading-7 text-[var(--tatlist-text-primary)] mb-2">
                Description
              </h2>
              <p className="text-[var(--tatlist-text-secondary)] text-sm leading-5 tracking-tight">
                {product.description}
              </p>
            </div>
          )}

          {/* Specs */}
          <div className="flex flex-col gap-2">
            {product.brand && (
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[var(--tatlist-text-secondary)] text-sm">Brand</span>
                <span className="text-[var(--tatlist-text-primary)] text-sm font-medium">
                  {product.brand}
                </span>
              </div>
            )}
            {product.category && (
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[var(--tatlist-text-secondary)] text-sm">Category</span>
                <span className="text-[var(--tatlist-text-primary)] text-sm font-medium">
                  {product.category}
                </span>
              </div>
            )}
            {product.sku && (
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[var(--tatlist-text-secondary)] text-sm">SKU</span>
                <span className="text-[var(--tatlist-text-primary)] text-sm font-medium">
                  {product.sku}
                </span>
              </div>
            )}
            {product.in_stock !== undefined && (
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-[var(--tatlist-text-secondary)] text-sm">Availability</span>
                <span
                  className={`text-sm font-medium ${product.in_stock ? 'text-green-400' : 'text-red-400'}`}
                >
                  {product.in_stock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* You Might Also Like */}
      {relatedForSection.length > 0 && (
        <div className="px-4 mt-8">
          <ProductSection
            title="You Might Also Like"
            href="/products"
            products={relatedForSection}
          />
        </div>
      )}

      {/* Fixed Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-[var(--tatlist-bg-primary)] via-[var(--tatlist-bg-primary)] to-transparent pt-8 md:relative md:mt-8 md:bg-none md:from-transparent md:px-4">
        <div className="max-w-[500px] mx-auto lg:max-w-full">
          <button
            onClick={handleAddToCart}
            disabled={!product.in_stock}
            className={`w-full py-4 rounded-2xl font-medium text-base flex items-center justify-center gap-2 transition-all ${
              product.in_stock
                ? 'bg-gradient-to-b from-[var(--tatlist-brand-400)] to-[var(--tatlist-brand-600)] text-white active:scale-[0.98]'
                : 'bg-[var(--tatlist-bg-tertiary)] text-[var(--tatlist-text-secondary)] cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="size-5" />
            {product.in_stock
              ? `Add to Cart - $${(product.price * quantity).toFixed(2)}`
              : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  )
}
