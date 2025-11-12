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

// Map categories to Unsplash images with tattoo shop themes
function getCategoryImage(categorySlug: string): string {
  const imageMap: Record<string, string> = {
    'tattoo-needles':
      'https://images.unsplash.com/photo-1590246814883-57c511e2aa90?w=800&h=800&fit=crop',
    'tattoo-ink':
      'https://images.unsplash.com/photo-1611587785105-ad37535b6989?w=800&h=800&fit=crop',
    'tattoo-machines':
      'https://images.unsplash.com/photo-1611003228941-98852ba62227?w=800&h=800&fit=crop',
    'machine-parts':
      'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?w=800&h=800&fit=crop',
    'tattoo-aftercare':
      'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&h=800&fit=crop',
    'safety-hygiene':
      'https://images.unsplash.com/photo-1584515933487-779824d29309?w=800&h=800&fit=crop',
    'tattoo-markers':
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=800&fit=crop',
    'power-supplies':
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',
    'grips-tubes':
      'https://images.unsplash.com/photo-1565688534245-05d6b5be184a?w=800&h=800&fit=crop',
    'body-jewelry':
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop',
    'nose-jewelry':
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&h=800&fit=crop',
    'cleaning-supplies':
      'https://images.unsplash.com/photo-1554224311-beee910c1967?w=800&h=800&fit=crop',
    'cables-cords':
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',
    'foot-switches':
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=800&fit=crop',
    apparel: 'https://images.unsplash.com/photo-1556306535-38febf6782e7?w=800&h=800&fit=crop',
    'bags-storage':
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=800&fit=crop',
    'books-education':
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=800&fit=crop',
    'first-aid':
      'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=800&h=800&fit=crop',
    'paper-supplies':
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=800&fit=crop',
    'specialty-jewelry':
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop',
  }

  return (
    imageMap[categorySlug] ||
    'https://images.unsplash.com/photo-1568515387631-c9a793f5b86f?w=800&h=800&fit=crop'
  )
}

// Get Unsplash attribution for category images (simplified)
function getCategoryImageCredit(): { photographer: string; url: string } {
  return { photographer: 'Unsplash', url: 'https://unsplash.com' }
}

async function CategoriesContent() {
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
        <Grid3x3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-black mb-4">Error Loading Categories</h1>
        <p className="text-gray-600 mb-8">Unable to load product categories</p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
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

      // Get product count for each category
      const categoriesWithCounts = await Promise.all(
        (categories || []).map(async category => {
          const { count } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category_id', category.id)
            .not('category_id', 'is', null)

          return {
            ...category,
            count: count || 0,
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
        <Grid3x3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-black mb-4">No Categories Found</h1>
        <p className="text-gray-600 mb-8">
          Product categories will appear here once products are added
        </p>
        <Link
          href="/products"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Browse All Products
        </Link>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-black mb-4">Product Categories</h1>
        <p className="text-lg text-gray-600">
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
                <div className="p-3 bg-black rounded-lg">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black">{collection.name}</h2>
                  <p className="text-gray-600">{collection.description}</p>
                </div>
              </div>

              {/* Categories in this collection */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {collection.categories.map(category => (
                  <CategoryCard
                    key={category.id}
                    category={{ name: category.name, count: category.count }}
                    slug={category.slug}
                    imageUrl={getCategoryImage(category.slug)}
                    credit={getCategoryImageCredit()}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-12 text-center">
        <Link href="/products" className="inline-block text-black underline hover:no-underline">
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Loading categories...</p>
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
