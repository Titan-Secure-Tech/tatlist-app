import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Grid3x3, Package } from 'lucide-react'

export default async function CategoriesPage() {
  const supabase = await createClient()
  
  // Fetch unique categories from products
  const { data: categories, error } = await supabase
    .from('products')
    .select('category')
    .order('category')
  
  // Get unique categories and count
  const uniqueCategories = categories 
    ? Array.from(new Set(categories.map(item => item.category)))
    : []

  // Get count for each category
  const categoryData = await Promise.all(
    uniqueCategories.map(async (category) => {
      const { count } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', category)
      
      return { name: category, count: count || 0 }
    })
  )

  if (error || categoryData.length === 0) {
    return (
      <div className="text-center py-12">
        <Grid3x3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold text-black mb-4">No Categories Found</h1>
        <p className="text-gray-600 mb-8">Product categories will appear here once products are added</p>
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
      <h1 className="text-3xl font-bold text-black mb-8">Product Categories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categoryData.map((category) => (
          <Link
            key={category.name}
            href={`/products?category=${encodeURIComponent(category.name)}`}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:border-black transition-all hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-black mb-2">
                  {category.name}
                </h2>
                <p className="text-gray-600">
                  {category.count} {category.count === 1 ? 'product' : 'products'}
                </p>
              </div>
              <Package className="h-8 w-8 text-gray-400" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Link
          href="/products"
          className="inline-block text-black underline hover:no-underline"
        >
          View all products →
        </Link>
      </div>
    </div>
  )
}