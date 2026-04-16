'use client'

import { useState, useEffect } from 'react'
import { CirclePlus, CircleMinus, ShoppingBag, Eye } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { useShoppingCart } from '@/lib/store/cart-store'
import { toast } from 'sonner'

interface AnimatedProductCardProps {
  product: Product
  index?: number
}

export default function AnimatedProductCard({ product, index = 0 }: AnimatedProductCardProps) {
  const [isInInventory, setIsInInventory] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)
  const [showQuickView, setShowQuickView] = useState(false)
  const supabase = createClient()
  const { addItem } = useShoppingCart()

  useEffect(() => {
    const checkInventory = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .match({ user_id: user.id, product_id: product.id })
        .maybeSingle()

      if (data) setIsInInventory(true)
    }

    checkInventory()
  }, [product.id, supabase])

  useEffect(() => {
    if (isHovered && product.images && product.images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % product.images.length)
      }, 1500)
      return () => clearInterval(interval)
    }
  }, [isHovered, product.images])

  const toggleInventory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('Please sign in to add to inventory')
      return
    }

    if (isInInventory) {
      // Optimistic update - change to plus icon immediately
      setIsInInventory(false)

      // Remove from inventory in background
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, product_id: product.id })

      if (error) {
        // Rollback on error
        setIsInInventory(true)
        toast.error('Failed to remove from inventory')
        console.error('Error removing from inventory:', error)
      } else {
        toast.success('Removed from inventory')
      }
    } else {
      // Optimistic update - change to minus icon immediately
      setIsInInventory(true)
      toast.success('Added to inventory')

      // Add to inventory in background
      const { error } = await supabase
        .from('favorites')
        .insert({ user_id: user.id, product_id: product.id })

      if (error) {
        // Rollback on error
        setIsInInventory(false)
        toast.error('Failed to add to inventory')
        console.error('Error adding to inventory:', error)
      }
    }
  }

  const handleAddToCart = () => {
    try {
      const cartItem = {
        id: product.id,
        name: product.name,
        price: Math.round(product.price * 100),
        currency: 'USD',
        image: product.images?.[0],
        description: product.description,
      }

      addItem(cartItem)
      toast.success(`${product.name} added to cart`)
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error('Failed to add to cart')
    }
  }

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      },
    },
    hover: {
      y: -8,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  }

  const imageVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05 },
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
  }

  return (
    <>
      <motion.div
        className="group relative bg-background rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false)
          setCurrentImageIndex(0)
        }}
      >
        {/* Image Container */}
        <Link href={`/products/${product.id}`} className="block">
          <div className="relative aspect-square bg-gradient-to-br from-muted to-secondary overflow-hidden">
            <AnimatePresence mode="wait">
              {product.images && product.images.length > 0 && !imageError ? (
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <motion.div
                    variants={imageVariants}
                    initial="initial"
                    whileHover="hover"
                    className="relative w-full h-full"
                  >
                    <Image
                      src={product.images[currentImageIndex]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                      onError={() => setImageError(true)}
                    />
                  </motion.div>
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-muted-foreground"
                  >
                    <ShoppingBag className="w-20 h-20" />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Image counter dots */}
            {product.images && product.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                {product.images.map((_, idx) => (
                  <motion.div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentImageIndex ? 'bg-foreground w-4' : 'bg-muted-foreground'
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  />
                ))}
              </div>
            )}

            {/* Quick action buttons - Always visible for inventory, hover for quick view */}
            <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  toggleInventory()
                }}
                type="button"
                className="p-2 bg-background rounded-full shadow-md hover:shadow-lg transition-shadow relative z-10 cursor-pointer flex items-center justify-center"
                whileTap={{ scale: 0.95 }}
                aria-label={isInInventory ? 'Remove from inventory' : 'Add to inventory'}
              >
                {isInInventory ? (
                  <CircleMinus className="h-4 w-4 text-foreground transition-colors" />
                ) : (
                  <CirclePlus className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                )}
              </motion.button>
              <AnimatePresence>
                {isHovered && (
                  <motion.button
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      setShowQuickView(true)
                    }}
                    className="p-2 bg-background rounded-full shadow-md hover:shadow-lg transition-shadow z-10 flex items-center justify-center"
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-4">
          <Link href={`/products/${product.id}`}>
            <motion.h3
              className="font-medium text-foreground line-clamp-2 mb-1 hover:underline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {product.name}
            </motion.h3>
          </Link>

          <motion.p
            className="text-sm text-muted-foreground mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {product.brand}
          </motion.p>

          <motion.div
            className="flex items-center justify-between mb-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <span className="text-lg font-semibold text-foreground">${product.price}</span>
            {product.stock_quantity && (
              <span className="text-xs text-muted-foreground">{product.stock_quantity} in stock</span>
            )}
          </motion.div>

          {/* Add to Cart Button */}
          <AnimatePresence>
            {isHovered && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className={`w-full py-2 px-4 rounded-xl font-medium transition-colors ${
                  product.in_stock
                    ? 'bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground hover:opacity-90'
                    : 'bg-secondary text-muted-foreground cursor-not-allowed'
                }`}
                whileTap={product.in_stock ? { scale: 0.98 } : {}}
              >
                {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick View Modal */}
      <AnimatePresence>
        {showQuickView && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQuickView(false)}
          >
            <motion.div
              className="bg-background rounded-2xl max-w-2xl w-full mx-4 p-6 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowQuickView(false)}
                className="absolute top-4 right-4 p-2 hover:bg-accent rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-square bg-secondary rounded-xl overflow-hidden">
                  {product.images && product.images.length > 0 && !imageError && (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>

                <div>
                  <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
                  <p className="text-muted-foreground mb-4">{product.brand}</p>
                  <p className="text-3xl font-bold mb-4">${product.price}</p>
                  <p className="text-muted-foreground mb-6">{product.description}</p>

                  <div className="flex gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={!product.in_stock}
                      className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors ${
                        product.in_stock
                          ? 'bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground hover:opacity-90'
                          : 'bg-secondary text-muted-foreground cursor-not-allowed'
                      }`}
                    >
                      {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <Link
                      href={`/products/${product.id}`}
                      className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-accent transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
