import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetail from '@/components/dashboard/ProductDetail'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  return []
}

async function ProductContent({ id }: { id: string }) {
  const supabase = await createClient()

  const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error || !product) {
    notFound()
  }

  // Fetch related products from the same category
  const { data: relatedProducts } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', product.id)
    .limit(6)

  return <ProductDetail product={product} relatedProducts={relatedProducts || []} />
}

function ProductLoading() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--tatlist-brand-400)] mx-auto mb-4"></div>
        <p className="text-[var(--tatlist-text-secondary)]">Loading product...</p>
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
