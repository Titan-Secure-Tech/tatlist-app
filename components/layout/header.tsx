'use client'

import Link from 'next/link'
import { CartDrawer } from '@/components/cart/cart-drawer'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Tatlist</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/products" className="hover:text-foreground/80">
              Products
            </Link>
            <Link href="/categories" className="hover:text-foreground/80">
              Categories
            </Link>
            <Link href="/about" className="hover:text-foreground/80">
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <CartDrawer />
        </div>
      </div>
    </header>
  )
}