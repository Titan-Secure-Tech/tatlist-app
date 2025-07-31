'use client'

import Image from 'next/image'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/cart/add-to-cart-button'
import { CartItem } from '@/lib/store/cart'

interface Product extends Omit<CartItem, 'quantity'> {
  description?: string
  inStock?: boolean
  originalPrice?: number
}

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const isOnSale = product.originalPrice && product.originalPrice > product.price

  return (
    <Card className={`group overflow-hidden ${className}`}>
      <CardContent className="p-0">
        {product.image && (
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary">Out of Stock</Badge>
              </div>
            )}
            {isOnSale && (
              <Badge variant="destructive" className="absolute left-2 top-2">
                Sale
              </Badge>
            )}
          </div>
        )}
        
        <div className="p-4">
          <h3 className="font-semibold text-lg leading-tight mb-2">
            {product.name}
          </h3>
          
          {product.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold">
                ${product.price.toFixed(2)}
              </span>
              {isOnSale && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice?.toFixed(2)}
                </span>
              )}
            </div>
            
            {product.sku && (
              <Badge variant="outline" className="text-xs">
                {product.sku}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <AddToCartButton
          product={product}
          className="w-full"
          disabled={!product.inStock}
        />
      </CardFooter>
    </Card>
  )
}