'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, ShoppingBag, Package, List, User, Settings, LogOut } from 'lucide-react'
import { AnimatedCartIcon } from '@/components/cart/AnimatedCartIcon'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'

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
  const router = useRouter()
  const supabase = createClient()
  const [bannerHeight, setBannerHeight] = useState(0)

  useEffect(() => {
    // Check if banner is visible
    const checkBanner = () => {
      const bannerClosed = sessionStorage.getItem('announcementBannerClosed')
      if (bannerClosed !== 'true') {
        // Banner is visible, set height (approximate height of banner)
        setBannerHeight(60) // Adjust this value based on actual banner height
      } else {
        setBannerHeight(0)
      }
    }

    checkBanner()
    // Listen for storage changes
    window.addEventListener('storage', checkBanner)

    // Also check periodically in case sessionStorage changes
    const interval = setInterval(checkBanner, 100)

    return () => {
      window.removeEventListener('storage', checkBanner)
      clearInterval(interval)
    }
  }, [])

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear only auth-related storage, keep cart data
      // Remove Supabase auth tokens
      const keysToRemove = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.includes('supabase') || key.includes('auth'))) {
          keysToRemove.push(key)
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key))

      // Clear session storage (but not announcement banner preference)
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i)
        if (
          key &&
          !key.includes('announcementBannerClosed') &&
          (key.includes('supabase') || key.includes('auth'))
        ) {
          sessionStorage.removeItem(key)
        }
      }

      toast.success('Signed out successfully')
      window.location.href = 'https://tatlist.com'
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out. Please try again.')
      // Force redirect to main site even if signout fails
      window.location.href = 'https://tatlist.com'
    }
  }

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
    <header
      className="fixed left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300"
      style={{ top: `${bannerHeight}px` }}
    >
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

            {/* Sign Out Button - Enhanced touch target for mobile */}
            <motion.button
              onClick={handleSignOut}
              className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation - Improved visibility and touch targets */}
        <motion.div
          className="md:hidden flex items-center gap-2 pb-4 pt-2 overflow-x-auto scrollbar-hide -mx-4 px-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap text-sm font-medium ${
                    isActive ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-4 h-4" />
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
