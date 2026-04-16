import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/products/ProductGrid'
import { ProductSearch } from '@/components/products/ProductSearch'
import { HierarchicalFilter } from '@/components/products/HierarchicalFilter'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface ProductsPageProps {
  searchParams: Promise<{ collection?: string; category?: string; search?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const collectionFilter = params?.collection
  const categoryFilter = params?.category
  const searchQuery = params?.search

  // Fetch collections with categories and product counts for the filter
  const { data: collections } = await supabase
    .from('collections')
    .select(
      `
      id,
      slug,
      name,
      description,
      sort_order
    `
    )
    .order('sort_order')

  // Fetch categories for each collection with product counts
  const collectionsWithCategories = await Promise.all(
    (collections || []).map(async collection => {
      const { data: categories } = await supabase
        .from('categories')
        .select(
          `
          id,
          slug,
          name,
          description,
          sort_order
        `
        )
        .eq('collection_id', collection.id)
        .order('sort_order')

      // Get product count for each category
      const categoriesWithCounts = await Promise.all(
        (categories || []).map(async category => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)

          return {
            ...category,
            product_count: count || 0,
          }
        })
      )

      // Get total product count for collection
      const { count: collectionCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('collection_id', collection.id)

      return {
        ...collection,
        categories: categoriesWithCounts,
        product_count: collectionCount || 0,
      }
    })
  )

  // Fetch products with filters
  let query = supabase.from('products').select('*').order('name')

  if (categoryFilter) {
    query = query.eq('category_id', categoryFilter)
  } else if (collectionFilter) {
    query = query.eq('collection_id', collectionFilter)
  }

  if (searchQuery) {
    query = query.or(
      `name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%`
    )
  }

  const { data: products } = await query

  // Get selected collection and category names for display
  const selectedCollection = collectionsWithCategories.find(c => c.id === collectionFilter)
  const selectedCategory = selectedCollection?.categories.find(cat => cat.id === categoryFilter)

  const pageTitle = selectedCategory
    ? selectedCategory.name
    : selectedCollection
      ? selectedCollection.name
      : 'All Products'

  return (
    <div className="max-w-7xl mx-auto">
      {(collectionFilter || categoryFilter) && (
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            All Products
          </Link>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-light text-foreground mb-2">{pageTitle}</h1>
        <p className="text-muted-foreground">
          {searchQuery
            ? `${products?.length || 0} results for "${searchQuery}"`
            : `${products?.length || 0} products available`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <ProductSearch initialSearch={searchQuery} />
      </div>

      {/* Two Column Layout: Filter Sidebar + Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filter Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <HierarchicalFilter
              collections={collectionsWithCategories}
              selectedCollectionId={collectionFilter}
              selectedCategoryId={categoryFilter}
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3">
          <ProductGrid products={products || []} showFilters={false} />
        </div>
      </div>
    </div>
  )
}
