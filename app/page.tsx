import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HeroSection from '@/components/home/HeroSection'
import FeaturedSection from '@/components/home/FeaturedSection'
import ProductGrid from '@/components/products/ProductGrid'
import { OAuthHandler } from '@/components/OAuth-handler'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  // Fetch featured products for the home page
  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .limit(8)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-white">
      <OAuthHandler />

      {/* Hero Section */}
      <HeroSection />

      {/* Featured Categories */}
      <FeaturedSection />

      {/* Featured Products */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light text-gray-900 mb-4">New Arrivals</h2>
            <p className="text-lg text-gray-600">Latest additions to our collection</p>
          </div>

          <ProductGrid products={featuredProducts || []} columns={4} />
        </div>
      </section>
    </div>
  )
}
