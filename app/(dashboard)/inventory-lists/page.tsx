import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import DeleteInventoryListButton from '@/components/inventory/DeleteInventoryListButton'
import QuickCheckoutButton from '@/components/inventory/QuickCheckoutButton'
import { InventoryItemQuantity } from '@/components/inventory/InventoryItemQuantity'
import Image from 'next/image'

type InventoryListItem = {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    sku: string
    price: number
    images?: string[]
    in_stock: boolean
  } | null
}

type InventoryList = {
  id: string
  name: string
  updated_at: string
  inventory_list_items: InventoryListItem[]
}

type GeneralInventoryProduct = {
  id: string
  name: string
  price: number
  images?: string[]
  in_stock: boolean
  sku: string
}

export default async function InventoryListsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch collections (inventory lists)
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
          price,
          images,
          in_stock
        )
      )
    `
    )
    .eq('user_id', user?.id)
    .order('updated_at', { ascending: false })

  // Fetch general inventory (items in favorites but not in any collection)
  const { data: favoriteProducts } = await supabase
    .from('favorites')
    .select(
      `
      product:products (
        id,
        name,
        price,
        images,
        in_stock,
        sku
      )
    `
    )
    .eq('user_id', user?.id)

  // Filter out products that are already in collections
  const productsInCollections = new Set(
    (inventoryLists || []).flatMap(list =>
      (list.inventory_list_items || [])
        .map(item => item.product?.id)
        .filter((id): id is string => id !== null && id !== undefined)
    )
  )

  const generalInventory = (favoriteProducts || [])
    .map(fav => fav.product)
    .filter(
      (product): product is GeneralInventoryProduct =>
        product !== null && !productsInCollections.has(product.id)
    )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-black">Inventory</h1>
        <Link
          href="/inventory-lists/new"
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Collection
        </Link>
      </div>

      {/* General Inventory Section */}
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">General Inventory</h2>
        {generalInventory.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-600 mb-2">No items in general inventory</p>
            <p className="text-sm text-gray-500">
              Add products using the + button on product cards
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {generalInventory.map(product => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="border border-gray-200 rounded-lg p-3 hover:shadow-lg transition-shadow"
              >
                <div className="relative w-full aspect-square mb-2 bg-gray-100 rounded overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg
                        className="w-12 h-12"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <h3 className="text-sm font-medium text-black line-clamp-2 mb-1">{product.name}</h3>
                <p className="text-sm font-bold text-black">${product.price}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Collections Section */}
      <div>
        <h2 className="text-lg font-semibold text-black mb-4">Collections</h2>
        {!inventoryLists || inventoryLists.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-600 mb-4">You haven&apos;t created any collections yet.</p>
            <Link
              href="/inventory-lists/new"
              className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
            >
              Create Your First Collection
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {inventoryLists.map((list: InventoryList) => (
              <div
                key={list.id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <Link href={`/inventory-lists/${list.id}`} className="flex-1">
                    <h3 className="text-xl font-semibold text-black hover:underline">
                      {list.name}
                    </h3>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-600">
                        🌐 {list.inventory_list_items?.length || 0} items
                      </span>
                      <span className="text-sm text-gray-500">
                        Updated {new Date(list.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-2">
                    <QuickCheckoutButton
                      collectionId={list.id}
                      collectionName={list.name}
                      items={list.inventory_list_items || []}
                    />
                    <DeleteInventoryListButton listId={list.id} listName={list.name} />
                  </div>
                </div>

                {list.inventory_list_items && list.inventory_list_items.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {list.inventory_list_items.slice(0, 5).map((item: InventoryListItem) => (
                      <div
                        key={item.id}
                        className="flex-shrink-0 w-24 border border-gray-200 rounded-lg p-2 hover:bg-gray-50 flex flex-col"
                      >
                        <Link href={`/products/${item.product?.id}`} className="flex-1">
                          <div className="relative w-full aspect-square mb-1 bg-gray-100 rounded overflow-hidden">
                            {item.product?.images && item.product.images.length > 0 ? (
                              <Image
                                src={item.product.images[0]}
                                alt={item.product.name}
                                fill
                                sizes="96px"
                                className="object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                📦
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                            {item.product?.name}
                          </p>
                        </Link>
                        <div className="w-full">
                          <InventoryItemQuantity
                            itemId={item.id}
                            initialQuantity={item.quantity}
                            productName={item.product?.name || 'Product'}
                          />
                        </div>
                      </div>
                    ))}
                    {list.inventory_list_items.length > 5 && (
                      <div className="flex-shrink-0 w-24 flex items-center justify-center border border-gray-200 rounded-lg text-gray-500 text-sm">
                        +{list.inventory_list_items.length - 5} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
