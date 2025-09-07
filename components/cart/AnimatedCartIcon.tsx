'use client'

import { useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useShoppingCart } from '@/lib/store/cart-store'
import CartDrawer from './CartDrawer'

interface AnimatedCartIconProps {
  className?: string
}

export function AnimatedCartIcon({ className }: AnimatedCartIconProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const { cartCount } = useShoppingCart()

  return (
    <>
      <motion.button
        onClick={() => setIsDrawerOpen(true)}
        className={`relative p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <ShoppingBag className="h-5 w-5" />

        <AnimatePresence>
          {cartCount && cartCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -right-1 -top-1 h-5 w-5 bg-black text-white rounded-full text-xs flex items-center justify-center font-medium"
            >
              <motion.span
                key={cartCount}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 10, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.span>
            </motion.span>
          )}
        </AnimatePresence>

        <span className="sr-only">Open cart ({cartCount || 0} items)</span>
      </motion.button>

      <CartDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  )
}
