import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import ProductGrid from '@/components/products/ProductGrid'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

// Map URL slugs to category names
const categoryMap: Record<string, string> = {
  machines: 'Tattoo Machines',
  needles: 'Needles & Cartridges',
  inks: 'Inks & Colors',
  aftercare: 'Aftercare',
  'tattoo-machines': 'Tattoo Machines',
  'needles-cartridges': 'Needles & Cartridges',
  'inks-colors': 'Inks & Colors',
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params
  const categoryName = categoryMap[slug] || decodeURIComponent(slug)

  const supabase = await createClient()

  // Fetch products for this category
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .ilike('category', categoryName)
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
          <h1 className="text-3xl font-bold text-black mb-4">{categoryName}</h1>
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
        <h1 className="text-4xl font-bold text-black mb-4">{categoryName}</h1>
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
