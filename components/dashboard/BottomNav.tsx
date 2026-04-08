'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, Heart, User, Search } from 'lucide-react'

const tabs = [
  { name: 'Home', href: '/dashboard', icon: Home },
  { name: 'Orders', href: '/orders', icon: ShoppingBag },
  { name: 'Favorites', href: '/products', icon: Heart },
  { name: 'Profile', href: '/profile', icon: User },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[var(--tatlist-bg-secondary)] to-transparent pt-6 pb-safe md:hidden">
      <div className="mx-auto flex items-end gap-4 px-6 pb-3">
        <div className="flex-1 flex items-center backdrop-blur-[7.5px] bg-[var(--tatlist-alpha-light-300)] border border-white/10 rounded-full p-1">
          <div className="flex items-center w-full relative">
            {tabs.map(tab => {
              const isActive =
                pathname === tab.href || (tab.href === '/dashboard' && pathname === '/dashboard')
              return (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={`flex-1 flex flex-col items-center gap-1 px-2 py-1.5 rounded-full transition-colors ${
                    isActive ? 'relative' : ''
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-b from-neutral-800 to-neutral-900 shadow-[2px_2px_3.5px_rgba(0,0,0,0.4),0_0_0_0.5px_black]" />
                  )}
                  <tab.icon
                    className={`relative z-10 size-5 ${
                      isActive
                        ? 'text-[var(--tatlist-brand-500)]'
                        : 'text-[var(--tatlist-text-primary)]'
                    }`}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                  <span
                    className={`relative z-10 text-xs leading-4 tracking-tight font-medium ${
                      isActive
                        ? 'text-[var(--tatlist-brand-500)]'
                        : 'text-[var(--tatlist-text-primary)]'
                    }`}
                  >
                    {tab.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
        <Link
          href="/products"
          className="shrink-0 size-[60px] flex items-center justify-center backdrop-blur-[7.5px] bg-[var(--tatlist-alpha-light-300)] border border-white/10 rounded-full"
        >
          <Search className="size-5 text-[var(--tatlist-text-primary)]" />
        </Link>
      </div>
    </nav>
  )
}
