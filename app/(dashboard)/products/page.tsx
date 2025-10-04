import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/products/ProductGrid'
import { ProductSearch } from '@/components/products/ProductSearch'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ProductsPageProps {
  searchParams: Promise<{ category?: string; search?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const categoryFilter = params?.category
  const searchQuery = params?.search

  // Fetch products, optionally filtered by category and search
  let query = supabase.from('products').select('*').order('name')

  if (categoryFilter) {
    query = query.ilike('category', categoryFilter)
  }

  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`
    )
  }

  const { data: products } = await query

  return (
    <div className="max-w-7xl mx-auto">
      {categoryFilter && (
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Products
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">
          {categoryFilter ? categoryFilter : 'All Products'}
        </h1>
        <p className="text-gray-500">
          {searchQuery
            ? `${products?.length || 0} results for "${searchQuery}"`
            : categoryFilter
              ? `${products?.length || 0} products in this category`
              : 'Discover our curated collection'}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <ProductSearch initialSearch={searchQuery} />
      </div>

      <ProductGrid products={products || []} showFilters={true} />
    </div>
  )
}
