import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ProductCard } from '@/components/product-card'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  // Get products from Lucky Supply database
  const { data: products = [] } = await supabase.from('products').select('*').limit(12)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black mb-4">Welcome to Tatlist</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your trusted partner for tattoo and body art supplies
          </p>
          <div className="flex gap-4 justify-center mb-8">
            <Link
              href="/register"
              className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 border border-black text-black rounded-md hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard
              key={product.id}
              product={{
                handle: product.sku,
                title: product.name,
                body: '',
                vendor: product.brand,
                type: product.category,
                tags: '',
                price: product.price.toString(),
                imageSrc: product.images?.[0] || '',
                imageAlt: product.name,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
