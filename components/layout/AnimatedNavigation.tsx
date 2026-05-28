'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, ShoppingBag, Package, List, User, Settings, LogOut } from 'lucide-react'
import { AnimatedCartIcon } from '@/components/cart/AnimatedCartIcon'
import { Logo } from '@/components/ui/logo'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

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
      // Force redirect to home even if signout fails
      window.location.href = 'https://tatlist.com'
    }
  }

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/products', label: 'Products', icon: ShoppingBag },
    { href: '/inventory-lists', label: 'My Inventory', icon: List },
    { href: '/orders', label: 'Orders', icon: Package },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  if (isAdmin) {
    navItems.push({ href: '/admin', label: 'Admin', icon: Settings })
  }

  return (
    <header
      className="fixed left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300"
      style={{ top: `${bannerHeight}px` }}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Logo />
          </motion.div>

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

        {/* Mobile Navigation - shadcn v4 style */}
        <div className="md:hidden pb-4 pt-2">
          <MobileNavMenu navItems={navItems} pathname={pathname} />
        </div>
      </nav>
    </header>
  )
}

// Mobile Navigation Menu with shadcn v4 pattern
function MobileNavMenu({ navItems, pathname }: { navItems: NavItem[]; pathname: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'extend-touch-target h-8 touch-manipulation items-center justify-start gap-2.5 !p-0 hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 active:bg-transparent dark:hover:bg-transparent'
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
          <div className="flex flex-col gap-4">
            <div className="text-muted-foreground text-sm font-medium">Navigation</div>
            <div className="flex flex-col gap-3">
              {navItems.map((item, index) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={index}
                    href={item.href}
                    onClick={() => {
                      router.push(item.href)
                      setOpen(false)
                    }}
                    className={cn(
                      'text-2xl font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-3',
                      isActive && 'text-foreground'
                    )}
                  >
                    <Icon className="w-6 h-6" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
