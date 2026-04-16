'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import AnimatedProductCard from './AnimatedProductCard'
import { Product } from '@/types'
import { Search, X } from 'lucide-react'

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
  const [searchQuery, setSearchQuery] = useState('')

  const gridColumns = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  }

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    // First filter
    let filtered = [...products]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(p => {
        // Search by name
        if (p.name?.toLowerCase().includes(query)) return true
        // Search by brand
        if (p.brand?.toLowerCase().includes(query)) return true
        // Search by category
        if (p.category?.toLowerCase().includes(query)) return true
        // Search by description
        if (p.description?.toLowerCase().includes(query)) return true
        // Search by tags
        if (p.tags?.some(tag => tag.toLowerCase().includes(query))) return true
        return false
      })
    }

    if (activeFilter === 'new') {
      // Filter by new arrivals (products with 'new' or 'latest' tags)
      filtered = filtered.filter(p =>
        p.tags?.some(tag => ['new', 'latest', 'new arrival'].includes(tag.toLowerCase()))
      )
    } else if (activeFilter === 'bestsellers') {
      // Filter by bestsellers (products with 'bestseller' or 'popular' tags)
      filtered = filtered.filter(p =>
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
  }, [products, activeFilter, sortBy, searchQuery])

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
          className="mb-8 space-y-4 relative z-10"
        >
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products by name, brand, category..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 text-sm font-medium border rounded-xl transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground border-transparent'
                    : 'text-foreground bg-background border-border hover:bg-accent'
                }`}
              >
                All Products
              </button>
              <button
                onClick={() => setActiveFilter('new')}
                className={`px-4 py-2 text-sm font-medium border rounded-xl transition-colors ${
                  activeFilter === 'new'
                    ? 'bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground border-transparent'
                    : 'text-foreground bg-background border-border hover:bg-accent'
                }`}
              >
                New Arrivals
              </button>
              <button
                onClick={() => setActiveFilter('bestsellers')}
                className={`px-4 py-2 text-sm font-medium border rounded-xl transition-colors ${
                  activeFilter === 'bestsellers'
                    ? 'bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground border-transparent'
                    : 'text-foreground bg-background border-border hover:bg-accent'
                }`}
              >
                Best Sellers
              </button>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortType)}
                className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-xl hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-brand cursor-pointer appearance-none pr-10"
                style={{ minWidth: '200px' }}
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-foreground">
                <svg
                  className="h-4 w-4 fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-full mb-4">
            <svg
              className="w-10 h-10 text-muted-foreground"
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
          <h3 className="text-lg font-medium text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery
              ? `No products match your search "${searchQuery}"`
              : activeFilter !== 'all'
                ? `No products match the "${activeFilter === 'new' ? 'New Arrivals' : 'Best Sellers'}" filter.`
                : 'No products available at this time.'}
          </p>
          {(searchQuery || activeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveFilter('all')
              }}
              className="px-4 py-2 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-xl hover:opacity-90 transition-opacity"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
