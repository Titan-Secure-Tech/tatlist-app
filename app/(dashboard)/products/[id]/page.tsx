import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AnimatedProductDetail from '@/components/products/AnimatedProductDetail'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product, error } = await supabase.from('products').select('*').eq('id', id).single()

  if (error || !product) {
    notFound()
  }

  return <AnimatedProductDetail product={product} />
}
