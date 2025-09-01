'use client'

import { motion } from 'framer-motion'
import AnimatedProductCard from './AnimatedProductCard'
import { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
  showFilters?: boolean
}

export default function ProductGrid({
  products,
  columns = 4,
  showFilters = false,
}: ProductGridProps) {
  const gridColumns = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="relative">
      {/* Filters Section (if enabled) */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-wrap gap-4 items-center justify-between"
        >
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              All Products
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              New Arrivals
            </button>
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Best Sellers
            </button>
          </div>

          <select className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-black">
            <option>Sort by: Featured</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Newest First</option>
          </select>
        </motion.div>
      )}

      {/* Products Grid */}
      <motion.div
        className={`grid ${gridColumns[columns]} gap-6`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {products.map((product, index) => (
          <AnimatedProductCard key={product.id} product={product} index={index} />
        ))}
      </motion.div>

      {/* Empty State */}
      {products.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your filters or check back later.</p>
        </motion.div>
      )}
    </div>
  )
}
