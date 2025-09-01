'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, ShoppingBag, Package, List, User, Settings, LogOut } from 'lucide-react'
import { AnimatedCartIcon } from '@/components/cart/AnimatedCartIcon'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

interface AnimatedNavigationProps {
  isAdmin?: boolean
}

export default function AnimatedNavigation({ isAdmin = false }: AnimatedNavigationProps) {
  const pathname = usePathname()

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/products', label: 'Products', icon: ShoppingBag },
    { href: '/inventory-lists', label: 'Lists', icon: List },
    { href: '/orders', label: 'Orders', icon: Package },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  if (isAdmin) {
    navItems.push({ href: '/admin', label: 'Admin', icon: Settings })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-light text-gray-900">Tatlist</span>
            </motion.div>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link key={item.href} href={item.href}>
                  <motion.div
                    className={`relative px-4 py-2 rounded-lg transition-colors ${
                      isActive ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>

                    {isActive && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
                        layoutId="navbar-indicator"
                        transition={{
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Cart Icon */}
            <AnimatedCartIcon />

            {/* Sign Out Button */}
            <form action="/api/auth/signout" method="post">
              <motion.button
                type="submit"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </form>
          </div>
        </div>

        {/* Mobile Navigation */}
        <motion.div
          className="md:hidden flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap text-sm ${
                    isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </motion.div>
              </Link>
            )
          })}
        </motion.div>
      </nav>
    </header>
  )
}
