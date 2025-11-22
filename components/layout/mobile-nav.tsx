'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ShoppingCart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/ui/logo'
import { cn } from '@/lib/utils'
import { useShoppingCart } from '@/lib/store/cart-store'
import { Badge } from '@/components/ui/badge'

interface NavItem {
  title: string
  href: string
  description?: string
  requiresAuth?: boolean
}

const navigationItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
    description: 'Go to homepage',
  },
  {
    title: 'Shop',
    href: '/shop',
    description: 'Browse products',
    requiresAuth: true,
  },
  {
    title: 'About',
    href: '/about',
    description: 'Learn more about us',
  },
  {
    title: 'Contact',
    href: '/contact',
    description: 'Get in touch',
  },
]

interface User {
  id: string
  email?: string
}

export function MobileNav({ user, loading }: { user: User | null; loading: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const { cartCount } = useShoppingCart()

  const visibleItems = loading
    ? navigationItems.filter(item => !item.requiresAuth)
    : navigationItems.filter(item => !item.requiresAuth || user)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pl-1 pr-0">
        <SheetHeader className="px-6">
          <SheetTitle>
            <Logo />
          </SheetTitle>
        </SheetHeader>
        <div className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="flex flex-col space-y-3">
            {/* Cart Link - Prominent at the top */}
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors w-[calc(100%-1.5rem)]',
                pathname === '/cart' && 'bg-primary/80'
              )}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Shopping Cart</span>
              {cartCount && cartCount > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {cartCount}
                </Badge>
              )}
            </Link>

            {/* Divider */}
            <div className="border-t my-2 mr-6" />

            {/* Regular Navigation Items */}
            {visibleItems.map(item => (
              <MobileLink
                key={item.href}
                href={item.href}
                onOpenChange={setOpen}
                className={cn('text-muted-foreground', pathname === item.href && 'text-foreground')}
              >
                {item.title}
              </MobileLink>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface MobileLinkProps {
  href: string
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}

function MobileLink({ href, onOpenChange, className, children, ...props }: MobileLinkProps) {
  return (
    <Link
      href={href}
      onClick={() => {
        onOpenChange?.(false)
      }}
      className={cn('text-base font-medium hover:text-foreground', className)}
      {...props}
    >
      {children}
    </Link>
  )
}
