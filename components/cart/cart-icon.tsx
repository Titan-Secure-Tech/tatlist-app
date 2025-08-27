'use client'

import { ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useShoppingCart } from 'use-shopping-cart'
import Link from 'next/link'

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
  const { cartCount } = useShoppingCart()

  return (
    <Button 
      variant={variant} 
      size={size}
      className={`relative ${className}`}
      asChild
    >
      <Link href="/cart">
        <ShoppingCart className="h-4 w-4" />
        {cartCount && cartCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
            data-testid="cart-badge"
          >
            {cartCount > 99 ? '99+' : cartCount}
          </Badge>
        )}
        <span className="sr-only">Open cart ({cartCount || 0} items)</span>
      </Link>
    </Button>
  )
}