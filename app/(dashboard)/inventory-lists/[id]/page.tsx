import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InventoryListDetail from '@/components/inventory/InventoryListDetail'
import { Product } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

async function InventoryListContent({ id }: { id: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: inventoryList } = await supabase
    .from('inventory_lists')
    .select(
      `
      *,
      inventory_list_items (
        id,
        quantity,
        product:products (*)
      )
    `
    )
    .eq('id', id)
    .eq('user_id', user?.id)
    .single()

  if (!inventoryList) {
    notFound()
  }

  // Get user's favorited products
  const { data: favorites } = await supabase
    .from('favorites')
    .select(
      `
      id,
      products(*)
    `
    )
    .eq('user_id', user?.id)

  type FavoriteWithProduct = {
    id: string
    products: Product | null
  }

  const favoriteProducts: Product[] =
    (favorites as FavoriteWithProduct[] | null)
      ?.map(f => f.products)
      .filter((p): p is Product => p !== null && p !== undefined) || []

  return <InventoryListDetail inventoryList={inventoryList} favoriteProducts={favoriteProducts} />
}

function InventoryListLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
        <p className="text-gray-600">Loading inventory list...</p>
      </div>
    </div>
  )
}

export default async function InventoryListDetailPage({ params }: Props) {
  const { id } = await params

  return (
    <Suspense fallback={<InventoryListLoading />}>
      <InventoryListContent id={id} />
    </Suspense>
  )
}
