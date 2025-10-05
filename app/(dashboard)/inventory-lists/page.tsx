import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import DeleteInventoryListButton from '@/components/inventory/DeleteInventoryListButton'

type InventoryListItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    sku: string
    price: number
  } | null
}

export default async function InventoryListsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: inventoryLists } = await supabase
    .from('inventory_lists')
    .select(
      `
      *,
      inventory_list_items (
        id,
        quantity,
        product:products (
          id,
          name,
          sku,
          price
        )
      )
    `
    )
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Favorites</h1>
        <Link
          href="/inventory-lists/new"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Favorites List
        </Link>
      </div>

      {inventoryLists?.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 mb-4">You haven&apos;t created any inventory lists yet.</p>
          <Link
            href="/inventory-lists/new"
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Create Your First List
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {inventoryLists?.map(list => (
            <Link
              key={list.id}
              href={`/inventory-lists/${list.id}`}
              className="block border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-black">{list.name}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {list.inventory_list_items?.length || 0} items
                  </span>
                  <DeleteInventoryListButton listId={list.id} listName={list.name} />
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Updated {new Date(list.updated_at).toLocaleDateString()}
              </p>

              {list.inventory_list_items && list.inventory_list_items.length > 0 && (
                <div className="mt-4 space-y-1">
                  {list.inventory_list_items.slice(0, 3).map((item: InventoryListItem) => (
                    <div key={item.id} className="text-sm text-gray-600">
                      {item.product?.name} (x{item.quantity})
                    </div>
                  ))}
                  {list.inventory_list_items.length > 3 && (
                    <div className="text-sm text-gray-400">
                      +{list.inventory_list_items.length - 3} more items
                    </div>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
