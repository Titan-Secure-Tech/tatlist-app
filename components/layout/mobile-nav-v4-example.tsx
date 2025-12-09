/**
 * Example usage of the shadcn/ui v4 mobile navigation component
 *
 * This file demonstrates how to integrate MobileNavV4 into your layout.
 * You can copy this pattern into your actual layout file.
 */

'use client'

import Link from 'next/link'
import { MobileNavV4 } from './mobile-nav-v4'
import { Logo } from '@/components/ui/logo'

interface User {
  id: string
  email?: string
}

interface ExampleLayoutProps {
  user: User | null
  loading?: boolean
}

export function ExampleLayoutWithMobileNavV4({ user, loading = false }: ExampleLayoutProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Mobile Navigation - Shows on small screens */}
        <div className="md:hidden mr-4">
          <MobileNavV4 user={user} loading={loading} />
        </div>

        {/* Logo */}
        <div className="flex items-center">
          <Logo />
        </div>

        {/* Desktop Navigation - Shows on medium+ screens */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-center md:gap-6">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-foreground/80">
            Home
          </Link>
          <Link
            href="/shop"
            className="text-sm font-medium transition-colors hover:text-foreground/80"
          >
            Shop
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium transition-colors hover:text-foreground/80"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium transition-colors hover:text-foreground/80"
          >
            Contact
          </Link>
        </nav>

        {/* Right side actions (cart, user menu, etc) */}
        <div className="ml-auto flex items-center gap-2">{/* Add cart icon, user menu, etc */}</div>
      </div>
    </header>
  )
}
