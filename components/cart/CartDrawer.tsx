'use client'

import { Fragment } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react'
import { useShoppingCart } from 'use-shopping-cart'
import Image from 'next/image'
import Link from 'next/link'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cartDetails,
    cartCount,
    totalPrice,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
  } = useShoppingCart()

  const drawerVariants = {
    closed: {
      x: '100%',
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
    open: {
      x: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const backdropVariants = {
    closed: { opacity: 0 },
    open: { opacity: 1 },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  }

  const cartItems = cartDetails ? Object.values(cartDetails) : []

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50"
            variants={drawerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Shopping Cart</h2>
                  {cartCount && cartCount > 0 && (
                    <span className="text-sm text-gray-500">({cartCount} items)</span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto">
                {cartItems.length > 0 ? (
                  <div className="p-6 space-y-4">
                    {cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        custom={index}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={itemVariants}
                        className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="relative w-20 h-20 bg-white rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingBag className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 line-clamp-1">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            ${(item.price / 100).toFixed(2)} each
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => decrementItem(item.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 bg-white rounded text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => incrementItem(item.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Price and Remove */}
                        <div className="flex flex-col items-end justify-between">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-1 hover:bg-gray-200 rounded transition-colors text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <p className="font-semibold text-gray-900">
                            ${((item.price * item.quantity) / 100).toFixed(2)}
                          </p>
                        </div>
                      </motion.div>
                    ))}

                    {/* Clear Cart Button */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      onClick={clearCart}
                      className="w-full py-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
                    >
                      Clear all items
                    </motion.button>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center h-full p-6"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
                    <p className="text-gray-500 text-center mb-6">
                      Add some products to get started
                    </p>
                    <Link href="/products">
                      <motion.button
                        onClick={onClose}
                        className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Browse Products
                      </motion.button>
                    </Link>
                  </motion.div>
                )}
              </div>

              {/* Footer with Total and Checkout */}
              {cartItems.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-xl font-semibold text-gray-900">
                      ${(totalPrice / 100).toFixed(2)}
                    </span>
                  </div>

                  <Link href="/cart">
                    <motion.button
                      onClick={onClose}
                      className="w-full py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors mb-3"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      View Cart
                    </motion.button>
                  </Link>

                  <Link href="/checkout">
                    <motion.button
                      onClick={onClose}
                      className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue Shopping
                    </motion.button>
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
