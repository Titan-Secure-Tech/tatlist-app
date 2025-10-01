'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/ui/logo'
import { MobileNav } from './mobile-nav'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  disabled?: boolean
}

const navigationItems: NavItem[] = [
  {
    title: 'Home',
    href: '/',
  },
  {
    title: 'Shop',
    href: '/shop',
  },
  {
    title: 'Favorites',
    href: '/favorites',
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

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <MainNav />
        <MobileHeader />
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search can be added here later */}
          </div>
          <nav className="flex items-center">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="ml-2">
              <Link href="/register">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}

function MainNav() {
  const pathname = usePathname()

  return (
    <div className="mr-4 hidden md:flex">
      <Logo className="mr-6" />
      <nav className="flex items-center gap-6 text-sm">
        {navigationItems.map(item => (
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

export function MobileHeader() {
  return (
    <div className="flex md:hidden">
      <MobileNav />
      <Logo />
    </div>
  )
}
