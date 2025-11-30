'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { MobileNav } from './mobile-nav'
import { CartIcon } from '@/components/cart/cart-icon'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  title: string
  href: string
  disabled?: boolean
  requiresAuth?: boolean
}

const navigationItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Shop',
    href: '/shop',
    requiresAuth: true,
  },
  {
    title: 'About',
    href: '/about',
  },
  {
    title: 'Contact',
    href: '/contact',
  },
]

interface User {
  id: string
  email?: string
}

export function SiteHeader() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Don't render on dashboard pages - they have their own navigation
  const isDashboardRoute =
    pathname?.startsWith('/dashboard') ||
    pathname?.startsWith('/products') ||
    pathname?.startsWith('/inventory-lists') ||
    pathname?.startsWith('/orders') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/admin')

  if (isDashboardRoute) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4 sm:px-6 lg:px-8">
        <MainNav user={user} loading={loading} />
        <MobileHeader user={user} loading={loading} />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search can be added here later */}
          </div>
          <nav className="flex items-center gap-2">
            {/* Cart Icon - Always visible */}
            <CartIcon variant="ghost" size="icon" />

            {!loading &&
              (user ? (
                <Button asChild size="sm">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="ml-2">
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              ))}
          </nav>
        </div>
      </div>
    </header>
  )
}

function MainNav({ user, loading }: { user: User | null; loading: boolean }) {
  const pathname = usePathname()

  const visibleItems = loading
    ? navigationItems.filter(item => !item.requiresAuth)
    : navigationItems.filter(item => !item.requiresAuth || user)

  return (
    <div className="mr-4 hidden md:flex">
      <Logo className="mr-6" />
      <nav className="flex items-center gap-6 text-sm">
        {visibleItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'transition-colors hover:text-foreground/80',
              pathname === item.href ? 'text-foreground' : 'text-foreground/60'
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    </div>
  )
}

export function MobileHeader({ user, loading }: { user: User | null; loading: boolean }) {
  return (
    <div className="flex md:hidden">
      <MobileNav user={user} loading={loading} />
      <Logo />
    </div>
  )
}
