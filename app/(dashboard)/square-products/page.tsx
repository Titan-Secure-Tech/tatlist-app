'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, ShoppingCart, Plus, Minus } from 'lucide-react'
import { toast } from 'sonner'
import { useShoppingCart } from '@/lib/store/cart-store'
import Image from 'next/image'
import Link from 'next/link'

interface ProductVariation {
  id: string
  name: string
  sku: string
  price: number
  currency: string
  trackInventory: boolean
  availableForSale: boolean
  stockStatus: string
}

interface SquareProduct {
  id: string
  name: string
  description: string
  category: string
  imageUrl: string
  variations: ProductVariation[]
  isDeleted: boolean
  presentAtLocation: boolean
}

export default function SquareProductsPage() {
  const [products, setProducts] = useState<SquareProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const { addItem, cartCount, cartDetails } = useShoppingCart()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/square/products')
      const data = await response.json()

      if (data.products) {
        setProducts(data.products)
        // Initialize quantities
        const initialQuantities: Record<string, number> = {}
        data.products.forEach((product: SquareProduct) => {
          product.variations.forEach(variation => {
            initialQuantities[variation.id] = 1
          })
        })
        setQuantities(initialQuantities)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = (product: SquareProduct, variation: ProductVariation) => {
    const quantity = quantities[variation.id] || 1

    try {
      addItem({
        id: variation.id,
        name: `${product.name} - ${variation.name}`,
        price: Math.round(variation.price * 100), // Convert to cents for use-shopping-cart
        currency: variation.currency,
        image: product.imageUrl,
        description: product.description,
        variant: variation.name,
        quantity: quantity,
      })

      toast.success(`Added ${quantity} ${product.name} to cart`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add item to cart')
    }
  }

  const updateQuantity = (variationId: string, change: number) => {
    setQuantities(prev => ({
      ...prev,
      [variationId]: Math.max(1, (prev[variationId] || 1) + change),
    }))
  }

  const isInCart = (variationId: string) => {
    return cartDetails && cartDetails[variationId]
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tattoo Equipment</h1>
          <p className="text-muted-foreground">Professional tattoo supplies and equipment</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-sm">
            {products.length} Products Available
          </Badge>
          <Button asChild>
            <Link href="/cart">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart ({cartCount || 0})
            </Link>
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map(product => (
          <Card key={product.id} className="flex flex-col">
            <div className="aspect-square relative overflow-hidden rounded-t-lg">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>

            <CardContent className="flex-1 p-6">
              <div className="mb-2">
                <Badge variant="outline" className="text-xs">
                  {product.category}
                </Badge>
              </div>

              <h3 className="font-semibold mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {product.description}
              </p>

              {/* Variations */}
              <div className="space-y-3">
                {product.variations.map(variation => (
                  <div key={variation.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{variation.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {variation.sku}</p>
                      </div>
                      <p className="font-bold text-lg">${variation.price.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(variation.id, -1)}
                          disabled={quantities[variation.id] <= 1}
                          className="h-8 w-8"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">
                          {quantities[variation.id] || 1}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(variation.id, 1)}
                          className="h-8 w-8"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      {/* Add to Cart Button */}
                      <Button
                        onClick={() => handleAddToCart(product, variation)}
                        disabled={!variation.availableForSale}
                        size="sm"
                        className="ml-2"
                      >
                        {isInCart(variation.id) ? (
                          <>
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            Update Cart
                          </>
                        ) : (
                          <>
                            <Plus className="h-3 w-3 mr-1" />
                            Add to Cart
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No products available</p>
          <Button onClick={fetchProducts}>Refresh</Button>
        </div>
      )}
    </div>
  )
}
