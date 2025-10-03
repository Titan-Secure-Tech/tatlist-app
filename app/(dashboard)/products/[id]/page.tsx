import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnimatedProductDetail from '@/components/products/AnimatedProductDetail'

// Enable PPR for product pages
export const experimental_ppr = true
// Revalidate every 30 minutes
export const revalidate = 1800

// Generate static params for top products
export async function generateStaticParams() {
  // Return empty array to generate pages on-demand
  // Products will be statically generated on first request with ISR
  return []
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error || !product) {
    notFound()
  }

  return <AnimatedProductDetail product={product} />
}
