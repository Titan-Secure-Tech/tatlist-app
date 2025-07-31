'use client'

import { ShoppingCart } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import useCartStore from '@/lib/store/cart'
import { CartItemComponent } from './cart-item'
import { toast } from 'sonner'

export function CartDrawer() {
  const { 
    items, 
    isOpen, 
    toggleCart, 
    getTotalItems, 
    getTotalPrice,
    clearCart 
  } = useCartStore()

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  const handleCheckout = () => {
    toast.info('Checkout Coming Soon!', {
      description: 'We\'re working hard to bring you secure checkout functionality. Stay tuned!',
      duration: 4000
    })
  }

  const handleClearCart = () => {
    clearCart()
    toast.success('Cart cleared', {
      description: 'All items have been removed from your cart'
    })
  }

  return (
    <Sheet open={isOpen} onOpenChange={toggleCart}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-1">
          <SheetTitle>Shopping Cart ({totalItems})</SheetTitle>
        </SheetHeader>
        
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center space-y-1">
            <ShoppingCart className="h-12 w-12 text-muted-foreground" />
            <div className="text-xl font-medium text-muted-foreground">
              Your cart is empty
            </div>
            <div className="text-sm text-muted-foreground">
              Add some items to get started
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-auto px-1">
              {items.map((item) => (
                <div key={`${item.id}-${item.variant || 'default'}`}>
                  <CartItemComponent item={item} />
                  <Separator />
                </div>
              ))}
            </div>
            
            <div className="space-y-4 px-1 py-4">
              <Separator />
              
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Checkout
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={handleClearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}