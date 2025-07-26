import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/ProductCard'

export default async function ProductsPage() {
  const supabase = await createClient()
  
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('name')

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">Products</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products?.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}