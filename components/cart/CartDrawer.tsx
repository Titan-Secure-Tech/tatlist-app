'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react'
import { useShoppingCart } from 'use-shopping-cart'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { useMediaQuery } from '@/hooks/use-media-query'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

function CartContent({ onClose }: { onClose: () => void }) {
  const {
    cartDetails,
    cartCount,
    totalPrice,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    formattedTotalPrice,
  } = useShoppingCart()

  const cartItems = cartDetails ? Object.values(cartDetails) : []

  // Debug logging
  console.log('CartDrawer - Cart items:', cartItems)
  console.log('CartDrawer - Cart count:', cartCount)
  console.log('CartDrawer - Total price:', totalPrice)

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center px-6">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <ShoppingCart className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
        <p className="text-muted-foreground mb-6">Add some products to get started</p>
        <Button asChild onClick={onClose}>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Cart Items */}
      <ScrollArea className="flex-1 px-6">
        <div className="py-4 space-y-4">
          {cartItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${(item.price / 100).toFixed(2)} each
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 -mr-2"
                        onClick={() => {
                          removeItem(item.id)
                          toast.success(`${item.name} removed from cart`)
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => decrementItem(item.id)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-12 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => incrementItem(item.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="font-semibold text-sm">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Clear Cart Button */}
          <div className="pt-4">
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => {
                clearCart()
                toast.success('Cart cleared')
              }}
            >
              Clear all items
            </Button>
          </div>
        </div>
      </ScrollArea>

      {/* Footer with Total and Checkout */}
      <div className="border-t px-6 py-4">
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-medium">Subtotal</span>
            <span className="text-xl font-semibold">
              {formattedTotalPrice || `$${(totalPrice / 100).toFixed(2)}`}
            </span>
          </div>

          <div className="grid gap-2">
            <Button asChild className="w-full" onClick={onClose}>
              <Link href="/cart">View Cart</Link>
            </Button>

            <Button variant="outline" asChild className="w-full" onClick={onClose}>
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const [mounted, setMounted] = useState(false)
  const { cartCount } = useShoppingCart()
  const isMobile = useMediaQuery('(max-width: 640px)')

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Mobile - Use Drawer
  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="max-h-[90vh] flex flex-col">
          <DrawerHeader className="border-b">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5" />
              <DrawerTitle>Shopping Cart</DrawerTitle>
              {cartCount && cartCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cartCount} items
                </Badge>
              )}
            </div>
            <DrawerDescription>Review your items before checkout</DrawerDescription>
          </DrawerHeader>

          <CartContent onClose={onClose} />
        </DrawerContent>
      </Drawer>
    )
  }

  // Desktop - Use Sheet
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5" />
              <SheetTitle>Shopping Cart</SheetTitle>
              {cartCount && cartCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {cartCount} items
                </Badge>
              )}
            </div>
          </div>
          <SheetDescription>Review your items before checkout</SheetDescription>
        </SheetHeader>

        <CartContent onClose={onClose} />
      </SheetContent>
    </Sheet>
  )
}
