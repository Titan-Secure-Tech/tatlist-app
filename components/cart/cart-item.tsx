'use client'

import Image from 'next/image'
import { Minus, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useCartStore, { CartItem } from '@/lib/store/cart'

interface CartItemProps {
  item: CartItem
}

export function CartItemComponent({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore()

  const handleQuantityChange = (newQuantity: number) => {
    updateQuantity(item.id, newQuantity, item.variant)
  }

  const handleRemove = () => {
    removeItem(item.id, item.variant)
  }

  return (
    <div className="flex items-center space-x-4 py-4">
      {item.image && (
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      )}
      
      <div className="flex-1 space-y-1">
        <h3 className="text-sm font-medium">{item.name}</h3>
        {item.variant && (
          <p className="text-sm text-muted-foreground">{item.variant}</p>
        )}
        <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <span className="w-8 text-center text-sm font-medium">
          {item.quantity}
        </span>
        
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => handleQuantityChange(item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleRemove}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}