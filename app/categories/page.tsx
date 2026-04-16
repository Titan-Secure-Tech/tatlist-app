import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Grid3x3, Package, Store, Sparkles, LucideIcon } from 'lucide-react'
import CategoryCard from '@/components/categories/CategoryCard'

// Icon mapping for collections
const collectionIcons: Record<string, LucideIcon> = {
  'tattoo-supplies': Package,
  'shop-supplies': Store,
  'piercing-jewelry': Sparkles,
}

// Fallback image if no product image is available
const FALLBACK_IMAGE = '/category-placeholder.svg'

// Exported for testing
export async function CategoriesContent() {
  const supabase = await createClient()

  // Fetch collections with their categories and product counts
  const { data: collections, error: collectionsError } = await supabase
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

  if (collectionsError) {
    console.error('Error fetching collections:', collectionsError)
    return (
      <div className="text-center py-12">
        <Grid3x3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Categories</h1>
        <p className="text-muted-foreground mb-8">Unable to load product categories</p>
        <Link
          href="/products"
          className="inline-block bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Browse All Products
        </Link>
      </div>
    )
  }

  // Fetch categories with product counts for each collection
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

      // Get product count and first product image for each category
      const categoriesWithCounts = await Promise.all(
        (categories || []).map(async category => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .not('category_id', 'is', null)

          // Get first product's image
          const { data: firstProduct } = await supabase
            .from('products')
            .select('image_url')
            .eq('category_id', category.id)
            .not('image_url', 'is', null)
            .limit(1)
            .single()

          return {
            ...category,
            count: count || 0,
            imageUrl: firstProduct?.image_url || FALLBACK_IMAGE,
          }
        })
      )

      // Filter out categories with no products
      const categoriesWithProducts = categoriesWithCounts.filter(cat => cat.count > 0)

      return {
        ...collection,
        categories: categoriesWithProducts,
      }
    })
  )

  // Filter out collections with no categories that have products
  const collectionsWithProducts = collectionsWithCategories.filter(col => col.categories.length > 0)

  if (collectionsWithProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid3x3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-4">No Categories Found</h1>
        <p className="text-muted-foreground mb-8">
          Product categories will appear here once products are added
        </p>
        <Link
          href="/products"
          className="inline-block bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Browse All Products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">Product Categories</h1>
        <p className="text-lg text-muted-foreground">
          Browse our comprehensive selection of professional tattoo and piercing supplies
        </p>
      </div>

      {/* Collections with Categories */}
      <div className="space-y-16">
        {collectionsWithProducts.map(collection => {
          const Icon = collectionIcons[collection.slug] || Package

          return (
            <div key={collection.id}>
              {/* Collection Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] rounded-xl">
                  <Icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{collection.name}</h2>
                  <p className="text-muted-foreground">{collection.description}</p>
                </div>
              </div>

              {/* Categories in this collection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collection.categories.map(category => (
                  <CategoryCard
                    key={category.id}
                    category={{ name: category.name, count: category.count }}
                    slug={category.slug}
                    imageUrl={category.imageUrl}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <Link href="/products" className="inline-block text-foreground underline hover:no-underline">
          View all products →
        </Link>
      </div>
    </div>
  )
}

function CategoriesLoading() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    </div>
  )
}

export default function CategoriesPage() {
  return (
    <Suspense fallback={<CategoriesLoading />}>
      <CategoriesContent />
    </Suspense>
  )
}
