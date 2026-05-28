import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import ProductGrid from '@/components/products/ProductGrid'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

// Force dynamic rendering for Supabase data fetching
export const dynamic = 'force-dynamic'

// Generate static params on-demand
export async function generateStaticParams() {
  // Return empty array to generate pages on-demand with ISR
  return []
}

// Separate component for dynamic content
async function CategoryContent({ slug }: { slug: string }) {
  const supabase = await createClient()

  // First, fetch the category details by slug
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select(
      `
      id,
      slug,
      name,
      description,
      collection_id,
      collections (
        name
      )
    `
    )
    .eq('slug', slug)
    .single()

  if (categoryError || !category) {
    console.error('Error fetching category:', categoryError)
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-black mb-4">Category Not Found</h1>
        <p className="text-gray-600 mb-8">
          The category you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/categories"
          className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
        >
          Back to Categories
        </Link>
      </div>
    )
  }

  // Fetch products for this category
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', category.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-black mb-4">Error Loading Category</h1>
        <p className="text-gray-600">There was an error loading this category.</p>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="min-h-[calc(100vh-200px)]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/categories"
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
        </div>

        <div className="text-center py-16">
          <Package className="mx-auto h-16 w-16 text-gray-400 mb-6" />
          <h1 className="text-3xl font-bold text-black mb-4">{category.name}</h1>
          {category.description && <p className="text-gray-600 mb-4">{category.description}</p>}
          <p className="text-gray-600 mb-8">
            No products found in this category yet. Check back soon!
          </p>
          <Link
            href="/products"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/categories"
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Categories
          </Link>
        </div>
      </div>

      {/* Category Title */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black mb-4">{category.name}</h1>
        {category.description && (
          <p className="text-lg text-gray-600 mb-4">{category.description}</p>
        )}
        <p className="text-gray-600">
          {products.length} {products.length === 1 ? 'product' : 'products'} available
        </p>
      </div>

      {/* Products Grid */}
      <ProductGrid products={products} columns={4} />

      {/* Back to categories link */}
      <div className="mt-12 text-center">
        <Link href="/categories" className="inline-block text-black underline hover:no-underline">
          ← Browse other categories
        </Link>
      </div>
    </div>
  )
}

// Loading component
function CategoryLoading() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Loading category...</p>
      </div>
    </div>
  )
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  return (
    <Suspense fallback={<CategoryLoading />}>
      <CategoryContent slug={slug} />
    </Suspense>
  )
}
