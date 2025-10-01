'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import AnimatedProductCard from './AnimatedProductCard'
import { Product } from '@/types'

interface ProductGridProps {
  products: Product[]
  columns?: 2 | 3 | 4
  showFilters?: boolean
}

type FilterType = 'all' | 'new' | 'bestsellers'
type SortType = 'featured' | 'price-low' | 'price-high' | 'newest'

export default function ProductGrid({
  products,
  columns = 4,
  showFilters = false,
}: ProductGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('featured')

  const gridColumns = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    // First filter
    let filtered = [...products]

    if (activeFilter === 'new') {
      // Filter by new arrivals (products with 'new' or 'latest' tags)
      filtered = products.filter(p =>
        p.tags?.some(tag => ['new', 'latest', 'new arrival'].includes(tag.toLowerCase()))
      )
    } else if (activeFilter === 'bestsellers') {
      // Filter by bestsellers (products with 'bestseller' or 'popular' tags)
      filtered = products.filter(p =>
        p.tags?.some(tag =>
          ['bestseller', 'best seller', 'popular', 'best'].includes(tag.toLowerCase())
        )
      )
    }

    // Then sort
    const sorted = [...filtered]

    switch (sortBy) {
      case 'price-low':
        sorted.sort((a, b) => (a.price || 0) - (b.price || 0))
        break
      case 'price-high':
        sorted.sort((a, b) => (b.price || 0) - (a.price || 0))
        break
      case 'newest':
        // For now, sort by name as we don't have created_at field
        // In the future, add created_at to Product type
        sorted.reverse()
        break
      default:
        // 'featured' - keep original order
        break
    }

    return sorted
  }, [products, activeFilter, sortBy])

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
          className="mb-8 flex flex-wrap gap-4 items-center justify-between relative z-10"
        >
          <div className="flex gap-2">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
                activeFilter === 'all'
                  ? 'bg-black text-white border-black'
                  : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              All Products
            </button>
            <button
              onClick={() => setActiveFilter('new')}
              className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
                activeFilter === 'new'
                  ? 'bg-black text-white border-black'
                  : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              New Arrivals
            </button>
            <button
              onClick={() => setActiveFilter('bestsellers')}
              className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
                activeFilter === 'bestsellers'
                  ? 'bg-black text-white border-black'
                  : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
              }`}
            >
              Best Sellers
            </button>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortType)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-black cursor-pointer appearance-none pr-10"
              style={{ minWidth: '200px' }}
            >
              <option value="featured">Sort by: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
              <svg
                className="h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </motion.div>
      )}

      {/* Products Grid */}
      <motion.div
        className={`grid ${gridColumns[columns]} gap-6`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredAndSortedProducts.map((product, index) => (
          <AnimatedProductCard key={product.id} product={product} index={index} />
        ))}
      </motion.div>

      {/* Empty State */}
      {filteredAndSortedProducts.length === 0 && (
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
          <p className="text-gray-500 mb-4">
            {activeFilter !== 'all'
              ? `No products match the "${activeFilter === 'new' ? 'New Arrivals' : 'Best Sellers'}" filter.`
              : 'No products available at this time.'}
          </p>
          {activeFilter !== 'all' && (
            <button
              onClick={() => setActiveFilter('all')}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Show All Products
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
