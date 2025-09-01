import { createClient } from '@/lib/supabase/server'
import ProductGrid from '@/components/products/ProductGrid'

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase.from('products').select('*').order('name')

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-500">Discover our curated collection</p>
      </div>

      <ProductGrid products={products || []} showFilters={true} />
    </div>
  )
}
