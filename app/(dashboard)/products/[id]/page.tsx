import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnimatedProductDetail from '@/components/products/AnimatedProductDetail'

// Force dynamic rendering for Supabase data fetching
export const dynamic = 'force-dynamic'

// Generate static params for top products
export async function generateStaticParams() {
  // Return empty array to generate pages on-demand
  // Products will be statically generated on first request with ISR
  return []
}

// Separate component for dynamic content
async function ProductContent({ id }: { id: string }) {
  const supabase = await createClient()

  const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error || !product) {
    notFound()
  }

  return <AnimatedProductDetail product={product} />
}

// Loading component
function ProductLoading() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Loading product...</p>
      </div>
    </div>
  )
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  return (
    <Suspense fallback={<ProductLoading />}>
      <ProductContent id={id} />
    </Suspense>
  )
}
