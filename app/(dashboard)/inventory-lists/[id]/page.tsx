import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InventoryListDetail from '@/components/inventory/InventoryListDetail'
import { Product } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InventoryListDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: inventoryList } = await supabase
    .from('inventory_lists')
    .select(`
      *,
      inventory_list_items (
        id,
        quantity,
        product:products (*)
      )
    `)
    .eq('id', id)
    .eq('user_id', user?.id)
    .single()

  if (!inventoryList) {
    notFound()
  }

  // Get user's favorited products
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      id,
      product:products(*)
    `)
    .eq('user_id', user?.id)

  const favoriteProducts = favorites?.map(f => f.product).filter(Boolean) || []

  return (
    <InventoryListDetail 
      inventoryList={inventoryList} 
      favoriteProducts={favoriteProducts as Product[]}
    />
  )
}