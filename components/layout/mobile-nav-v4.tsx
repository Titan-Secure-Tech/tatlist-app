'use client'

import * as React from 'react'
import Link, { LinkProps } from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useShoppingCart } from '@/lib/store/cart-store'

interface NavItem {
  href: string
  label: string
  requiresAuth?: boolean
}

interface User {
  id: string
  email?: string
}

interface MobileNavV4Props {
  user: User | null
  loading?: boolean
  className?: string
}

const navigationItems: NavItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Shop',
    href: '/shop',
    requiresAuth: true,
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
]

export function MobileNavV4({ user, loading = false, className }: MobileNavV4Props) {
  const [open, setOpen] = React.useState(false)
  const pathname = usePathname()
  const { cartCount } = useShoppingCart()

  const visibleItems = loading
    ? navigationItems.filter(item => !item.requiresAuth)
    : navigationItems.filter(item => !item.requiresAuth || user)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'extend-touch-target h-8 touch-manipulation items-center justify-start gap-2.5 !p-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent',
            className
          )}
        >
          <div className="relative flex h-8 w-4 items-center justify-center">
            <div className="relative size-4">
              <span
                className={cn(
                  'bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100',
                  open ? 'top-[0.4rem] -rotate-45' : 'top-1'
                )}
              />
              <span
                className={cn(
                  'bg-foreground absolute left-0 block h-0.5 w-4 transition-all duration-100',
                  open ? 'top-[0.4rem] rotate-45' : 'top-2.5'
                )}
              />
            </div>
            <span className="sr-only">Toggle Menu</span>
          </div>
          <span className="flex h-8 items-center text-lg leading-none font-medium">Menu</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="bg-background/90 no-scrollbar h-(--radix-popper-available-height) w-(--radix-popper-available-width) overflow-y-auto rounded-none border-none p-0 shadow-none backdrop-blur duration-100"
        align="start"
        side="bottom"
        alignOffset={-16}
        sideOffset={14}
      >
        <div className="flex flex-col gap-12 overflow-auto px-6 py-6">
          {/* Cart Section */}
          <div className="flex flex-col gap-4">
            <div className="text-muted-foreground text-sm font-medium">Shopping</div>
            <div className="flex flex-col gap-3">
              <MobileLink
                href="/cart"
                onOpenChange={setOpen}
                className={cn('flex items-center gap-3', pathname === '/cart' && 'text-foreground')}
              >
                <ShoppingCart className="h-6 w-6" />
                <span>Cart</span>
                {cartCount && cartCount > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {cartCount}
                  </Badge>
                )}
              </MobileLink>
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex flex-col gap-4">
            <div className="text-muted-foreground text-sm font-medium">Navigation</div>
            <div className="flex flex-col gap-3">
              {visibleItems.map((item, index) => (
                <MobileLink
                  key={index}
                  href={item.href}
                  onOpenChange={setOpen}
                  className={cn(pathname === item.href && 'text-foreground')}
                >
                  {item.label}
                </MobileLink>
              ))}
            </div>
          </div>

          {/* Account Section */}
          {user && (
            <div className="flex flex-col gap-4">
              <div className="text-muted-foreground text-sm font-medium">Account</div>
              <div className="flex flex-col gap-3">
                <MobileLink
                  href="/dashboard"
                  onOpenChange={setOpen}
                  className={cn(pathname === '/dashboard' && 'text-foreground')}
                >
                  Dashboard
                </MobileLink>
                <MobileLink
                  href="/profile"
                  onOpenChange={setOpen}
                  className={cn(pathname === '/profile' && 'text-foreground')}
                >
                  Profile
                </MobileLink>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: LinkProps & {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}) {
  const router = useRouter()
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString())
        onOpenChange?.(false)
      }}
      className={cn(
        'text-2xl font-medium text-muted-foreground hover:text-foreground transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
}
