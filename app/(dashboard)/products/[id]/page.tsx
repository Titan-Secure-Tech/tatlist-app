import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductDetail from '@/components/products/ProductDetail'

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single()
  
  if (error || !product) {
    notFound()
  }
  
  return <ProductDetail product={product} />
}