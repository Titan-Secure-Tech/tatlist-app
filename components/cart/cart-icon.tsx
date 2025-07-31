'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useCartStore from '@/lib/store/cart'

interface CartIconProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function CartIcon({ 
  className,
  variant = 'outline',
  size = 'icon'
}: CartIconProps) {
  const { openCart, getTotalItems } = useCartStore()
  const totalItems = getTotalItems()

  return (
    <Button 
      variant={variant} 
      size={size}
      className={`relative ${className}`}
      onClick={openCart}
    >
      <ShoppingCart className="h-4 w-4" />
      {totalItems > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
        >
          {totalItems > 99 ? '99+' : totalItems}
        </Badge>
      )}
      <span className="sr-only">Open cart ({totalItems} items)</span>
    </Button>
  )
}