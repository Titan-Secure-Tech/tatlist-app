'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, TrendingUp } from 'lucide-react'
import { useShoppingCart } from '@/lib/store/cart-store'
import { toast } from 'sonner'

interface SuggestedProduct {
  id: string
  sku: string
  name: string
  price: number
  compare_at_price: number | null
  images: string[]
  vendor_name: string
  category_name: string
  category_slug: string
  collection_slug: string
  in_stock: boolean
  tag_names: string[]
  category_id?: string
  tag_slugs?: string[]
}

interface ScoredProduct extends SuggestedProduct {
  score: number
}

export function CartSuggestions() {
  const { cartDetails, addItem } = useShoppingCart()
  const [suggestions, setSuggestions] = useState<SuggestedProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!cartDetails || Object.keys(cartDetails).length === 0) {
        setLoading(false)
        return
      }

      try {
        // Get product IDs from cart
        const cartItemIds = Object.keys(cartDetails)

        // Fetch cart items to get their categories/tags
        const response = await fetch('/api/products?limit=100')
        const data = await response.json()

        const cartProducts = (data.products as SuggestedProduct[]).filter(p =>
          cartItemIds.includes(p.id)
        )

        if (cartProducts.length === 0) {
          setLoading(false)
          return
        }

        // Get unique categories and tags from cart
        const cartCategories = new Set(cartProducts.map(p => p.category_id).filter(Boolean))
        const cartTags = new Set(cartProducts.flatMap(p => p.tag_slugs || []))

        // Build query for suggestions
        const params = new URLSearchParams()
        params.set('limit', '12')
        params.set('in_stock', 'true')

        // Get products from same categories
        const suggestionsResponse = await fetch(`/api/products?${params}`)
        const suggestionsData = await suggestionsResponse.json()

        // Filter and score suggestions
        const scoredSuggestions = (suggestionsData.products as SuggestedProduct[])
          .filter(p => !cartItemIds.includes(p.id)) // Not in cart
          .map((p): ScoredProduct => {
            let score = 0

            // Same category = +3 points
            if (p.category_id && cartCategories.has(p.category_id)) {
              score += 3
            }

            // Shared tags = +1 point per tag
            if (p.tag_slugs) {
              const sharedTags = p.tag_slugs.filter((tag: string) => cartTags.has(tag))
              score += sharedTags.length
            }

            // Has discount = +1 point
            if (p.compare_at_price && p.compare_at_price > p.price) {
              score += 1
            }

            return { ...p, score }
          })
          .filter(p => p.score > 0) // Only show products with some relevance
          .sort((a, b) => b.score - a.score) // Sort by score
          .slice(0, 6) // Take top 6

        setSuggestions(scoredSuggestions)
      } catch (error) {
        console.error('Error fetching suggestions:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [cartDetails])

  const handleAddToCart = (product: SuggestedProduct) => {
    try {
      addItem({
        id: product.id,
        name: product.name,
        price: Math.round(product.price * 100),
        currency: 'USD',
        image: product.images[0] || '/placeholder-product.jpg',
        description: '',
        quantity: 1,
      })

      toast.success(`Added ${product.name} to cart`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Customers Also Bought
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading suggestions...</div>
        </CardContent>
      </Card>
    )
  }

  if (suggestions.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          You May Also Need
        </CardTitle>
        <p className="text-sm text-muted-foreground">Based on items in your cart</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map(product => (
            <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <Link
                href={`/shop/${product.collection_slug}/${product.category_slug}/${product.sku}`}
              >
                <div className="aspect-video relative bg-muted">
                  <Image
                    src={product.images[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {product.compare_at_price && product.compare_at_price > product.price && (
                    <Badge className="absolute top-2 right-2 bg-red-600">
                      Save{' '}
                      {Math.round(
                        ((product.compare_at_price - product.price) / product.compare_at_price) *
                          100
                      )}
                      %
                    </Badge>
                  )}
                </div>
              </Link>
              <div className="p-4">
                <div className="mb-2">
                  {product.vendor_name && (
                    <Badge variant="outline" className="text-xs">
                      {product.vendor_name}
                    </Badge>
                  )}
                </div>
                <Link
                  href={`/shop/${product.collection_slug}/${product.category_slug}/${product.sku}`}
                >
                  <h4 className="font-medium text-sm line-clamp-2 mb-2 hover:text-primary transition-colors">
                    {product.name}
                  </h4>
                </Link>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <p className="font-bold">${product.price.toFixed(2)}</p>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <p className="text-xs text-muted-foreground line-through">
                        ${product.compare_at_price.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAddToCart(product)}
                    disabled={!product.in_stock}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
