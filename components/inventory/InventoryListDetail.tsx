'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/types'
import { InventoryListWithItems, InventoryListItemWithProduct } from '@/types/inventory'
import { Trash2, Plus, ShoppingCart } from 'lucide-react'
import { useShoppingCart } from '@/lib/store/cart-store'

interface InventoryListDetailProps {
  inventoryList: InventoryListWithItems
  favoriteProducts: Product[]
}

export default function InventoryListDetail({
  inventoryList,
  favoriteProducts,
}: InventoryListDetailProps) {
  const [items, setItems] = useState<InventoryListItemWithProduct[]>(
    inventoryList.inventory_list_items || []
  )
  const [showAddProducts, setShowAddProducts] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const { addItem } = useShoppingCart()

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const { error } = await supabase
      .from('inventory_list_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId)

    if (!error) {
      setItems(items.map(item => (item.id === itemId ? { ...item, quantity: newQuantity } : item)))
    }
  }

  const removeItem = async (itemId: string) => {
    const { error } = await supabase.from('inventory_list_items').delete().eq('id', itemId)

    if (!error) {
      setItems(items.filter(item => item.id !== itemId))
    }
  }

  const addProductToList = async (product: Product) => {
    const existingItem = items.find(item => item.product.id === product.id)

    if (existingItem) {
      updateQuantity(existingItem.id, existingItem.quantity + 1)
      return
    }

    const { data, error } = await supabase
      .from('inventory_list_items')
      .insert({
        inventory_list_id: inventoryList.id,
        product_id: product.id,
        quantity: 1,
      })
      .select(
        `
        id,
        quantity,
        product:products (*)
      `
      )
      .single()

    if (!error && data && data.product) {
      const newItem: InventoryListItemWithProduct = {
        id: data.id,
        quantity: data.quantity,
        product: Array.isArray(data.product) ? data.product[0] : data.product,
      }
      setItems([...items, newItem])
    }
  }

  const addAllToCart = () => {
    items.forEach(item => {
      if (item.product.in_stock) {
        addItem(
          {
            id: item.product.id,
            name: item.product.name,
            price: item.product.price * 100,
            currency: 'USD',
            image: item.product.images?.[0],
            description: item.product.description,
            price_data: {
              currency: 'USD',
              product_data: {
                name: item.product.name,
                description: item.product.description,
                images: item.product.images,
              },
              unit_amount: item.product.price * 100,
            },
          },
          {
            count: item.quantity,
          }
        )
      }
    })
    router.push('/cart')
  }

  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-foreground">{inventoryList.name}</h1>
        <button
          onClick={() => setShowAddProducts(!showAddProducts)}
          className="flex items-center gap-2 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground px-4 py-2 rounded-xl hover:bg-accent transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Products
        </button>
      </div>

      {showAddProducts && (
        <div className="mb-6 p-4 border border-border rounded-xl">
          <h3 className="font-semibold mb-3">Add from Inventory</h3>
          {favoriteProducts.length === 0 ? (
            <p className="text-muted-foreground">
              No inventory products yet. Add products to your inventory to see them here.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {favoriteProducts.map(product => (
                <div
                  key={product.id}
                  className="flex justify-between items-center p-2 hover:bg-accent rounded"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">${product.price}</p>
                  </div>
                  <button
                    onClick={() => addProductToList(product)}
                    className="px-3 py-1 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground text-sm rounded-xl hover:bg-accent"
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-xl">
          <p className="text-muted-foreground mb-4">This list is empty.</p>
          <p className="text-sm text-muted-foreground">Add products from your inventory to get started.</p>
        </div>
      ) : (
        <>
          <div className="bg-background border border-border rounded-xl overflow-hidden mb-6">
            <div className="divide-y divide-border">
              {items.map(item => (
                <div key={item.id} className="p-4 flex items-center space-x-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.product.name}</h3>
                    <p className="text-muted-foreground">${item.product.price} each</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 border border-border rounded hover:bg-accent"
                    >
                      -
                    </button>
                    <span className="w-12 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 border border-border rounded hover:bg-accent"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold">
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-muted p-4 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-2xl font-bold text-foreground">${totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={addAllToCart}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground py-3 rounded-xl hover:bg-accent transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              Add All to Cart
            </button>
          </div>
        </>
      )}
    </div>
  )
}
