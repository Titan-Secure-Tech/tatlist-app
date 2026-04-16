'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  CirclePlus,
  CircleMinus,
  ShoppingBag,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
  Plus,
  Minus,
} from 'lucide-react'
import { Product } from '@/types'
import { useShoppingCart } from '@/lib/store/cart-store'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import CollectionModal from '@/components/inventory/CollectionModal'
import { useRouter } from 'next/navigation'

interface AnimatedProductDetailProps {
  product: Product
}

export default function AnimatedProductDetail({ product }: AnimatedProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isInInventory, setIsInInventory] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [showCollectionModal, setShowCollectionModal] = useState(false)

  const { addItem } = useShoppingCart()
  const supabase = createClient()
  const router = useRouter()

  // Check if product is in any collection or favorites
  useEffect(() => {
    const checkInventory = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      // Check if in any of user's collections
      const { data: userCollections } = await supabase
        .from('inventory_lists')
        .select('id')
        .eq('user_id', user.id)

      if (userCollections && userCollections.length > 0) {
        const collectionIds = userCollections.map(c => c.id)
        const { data: inCollection } = await supabase
          .from('inventory_list_items')
          .select('id')
          .eq('product_id', product.id)
          .in('inventory_list_id', collectionIds)
          .limit(1)
          .maybeSingle()

        if (inCollection) {
          setIsInInventory(true)
          return
        }
      }

      // Check if in favorites
      const { data: inFavorites } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', product.id)
        .maybeSingle()

      if (inFavorites) {
        setIsInInventory(true)
      }
    }

    checkInventory()
  }, [product.id, supabase])

  const handleAddToCart = () => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: Math.round(product.price * 100),
      currency: 'USD',
      image: product.images?.[0],
      description: product.description,
    }

    addItem(cartItem, { count: quantity })
    toast.success(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`, {
      action: {
        label: 'View Cart',
        onClick: () => router.push('/cart'),
      },
    })
  }

  const toggleInventory = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to add to inventory')
      return
    }

    if (isInInventory) {
      // Remove from all collections and favorites
      setIsInInventory(false)

      // Remove from collections
      const { error: collectionError } = await supabase
        .from('inventory_list_items')
        .delete()
        .eq('product_id', product.id)

      // Remove from favorites
      const { error: favError } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: user.id, product_id: product.id })

      if (collectionError && favError) {
        setIsInInventory(true)
        toast.error('Failed to remove from inventory')
        console.error('Error removing from inventory:', { collectionError, favError })
      } else {
        toast.success('Removed from inventory')
        router.refresh()
      }
    } else {
      // Get most recent collection
      const { data: collections } = await supabase
        .from('inventory_lists')
        .select('id, name')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(1)

      if (collections && collections.length > 0) {
        // Add to most recent collection
        const mostRecentCollection = collections[0]

        // Check if already in this collection
        const { data: existing } = await supabase
          .from('inventory_list_items')
          .select('id, quantity')
          .eq('inventory_list_id', mostRecentCollection.id)
          .eq('product_id', product.id)
          .maybeSingle()

        if (existing) {
          // Increment quantity
          const { error } = await supabase
            .from('inventory_list_items')
            .update({ quantity: existing.quantity + 1 })
            .eq('id', existing.id)

          if (error) {
            toast.error('Failed to add to collection')
            console.error('Error updating quantity:', error)
          } else {
            setIsInInventory(true)
            toast.success(`Added to "${mostRecentCollection.name}"`, {
              action: {
                label: 'View Collection',
                onClick: () => router.push('/inventory-lists'),
              },
            })
            router.refresh()
          }
        } else {
          // Add new item to collection
          const { error } = await supabase.from('inventory_list_items').insert({
            inventory_list_id: mostRecentCollection.id,
            product_id: product.id,
            quantity: 1,
          })

          if (error) {
            toast.error('Failed to add to collection')
            console.error('Error adding to collection:', error)
          } else {
            setIsInInventory(true)
            toast.success(`Added to "${mostRecentCollection.name}"`, {
              action: {
                label: 'View Collection',
                onClick: () => router.push('/inventory-lists'),
              },
            })
            router.refresh()
          }
        }
      } else {
        // No collections exist - show modal to create one
        setShowCollectionModal(true)
      }
    }
  }

  const features = [
    { icon: Truck, label: 'Free shipping on orders over $100' },
    { icon: Shield, label: '2-year warranty included' },
    { icon: RefreshCw, label: '30-day return policy' },
  ]

  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specifications', label: 'Specifications' },
    { id: 'reviews', label: 'Reviews' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto"
    >
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
      >
        <Link href="/products" className="hover:text-foreground transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </motion.nav>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Main Image */}
          <div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden mb-4">
            <AnimatePresence mode="wait">
              {product.images && product.images.length > 0 ? (
                <motion.div
                  key={selectedImageIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={product.images[selectedImageIndex]}
                    alt={product.name}
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-24 h-24 text-muted-foreground" />
                </div>
              )}
            </AnimatePresence>

            {/* Image Navigation */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImageIndex(prev =>
                      prev === 0 ? product.images.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-secondary/80 backdrop-blur-sm rounded-full hover:bg-secondary transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex(prev => (prev + 1) % product.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-secondary/80 backdrop-blur-sm rounded-full hover:bg-secondary transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <motion.button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-square bg-secondary rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-brand'
                      : 'border-transparent hover:border-border'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl lg:text-4xl font-light text-foreground mb-2">{product.name}</h1>
            <p className="text-lg text-muted-foreground">{product.brand}</p>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.5 out of 5)</span>
            </div>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-semibold text-foreground">${product.price}</span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.original_price}
                  </span>
                  <span className="px-2 py-1 bg-destructive/10 text-destructive text-sm rounded-full">
                    Save {Math.round((1 - product.price / product.original_price) * 100)}%
                  </span>
                </>
              )}
            </div>
            {product.stock_quantity && (
              <p className="text-sm text-muted-foreground mt-2">{product.stock_quantity} items in stock</p>
            )}
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-muted-foreground">Quantity:</label>
              <div className="flex items-center border border-border rounded-xl">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-accent transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock_quantity || 99, quantity + 1))}
                  className="p-2 hover:bg-accent transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <motion.button
                onClick={handleAddToCart}
                disabled={!product.in_stock}
                className={`flex-1 py-3 px-6 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                  product.in_stock
                    ? 'bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                }`}
                whileHover={product.in_stock ? { scale: 1.02 } : {}}
                whileTap={product.in_stock ? { scale: 0.98 } : {}}
              >
                <ShoppingBag className="w-5 h-5" />
                {product.in_stock ? 'Add to Cart' : 'Out of Stock'}
              </motion.button>

              <motion.button
                onClick={toggleInventory}
                className="p-3 border border-border rounded-xl hover:bg-accent transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label={isInInventory ? 'Remove from inventory' : 'Add to inventory'}
              >
                {isInInventory ? (
                  <CircleMinus className="h-5 w-5 text-black transition-colors" />
                ) : (
                  <CirclePlus className="h-5 w-5 text-muted-foreground hover:text-black transition-colors" />
                )}
              </motion.button>
            </div>

            <Link href="/products">
              <motion.button
                className="w-full py-3 px-6 rounded-xl font-medium border border-border hover:bg-accent transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Continue Shopping
              </motion.button>
            </Link>
          </div>

          {/* Features */}
          <div className="border-t border-border pt-6 mb-8">
            <div className="space-y-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <Icon className="w-5 h-5" />
                    <span>{feature.label}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-border pt-6">
            <div className="flex gap-6 mb-6">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-brand text-foreground font-medium'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'description' && (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-gray-600">
                      {product.description ||
                        'Professional-grade tattoo supply from Lucky Supply Co.'}
                    </p>
                  </div>
                )}

                {activeTab === 'specifications' && (
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-gray-600">Brand</span>
                      <span className="font-medium">{product.brand}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-gray-600">Category</span>
                      <span className="font-medium">{product.category || 'Tattoo Supplies'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-gray-600">SKU</span>
                      <span className="font-medium">{product.sku || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="text-center py-8 text-muted-foreground">
                    No reviews yet. Be the first to review this product!
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Collection Modal */}
      <CollectionModal
        productId={product.id}
        productName={product.name}
        isOpen={showCollectionModal}
        onClose={() => {
          setShowCollectionModal(false)
          // Update inventory status
          setIsInInventory(true)
          router.refresh()
        }}
      />
    </motion.div>
  )
}
