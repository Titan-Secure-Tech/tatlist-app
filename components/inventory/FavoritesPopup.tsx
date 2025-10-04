'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'

interface InventoryList {
  id: string
  name: string
  item_count?: number
}

interface FavoritesPopupProps {
  productId: string
  productName: string
  isOpen: boolean
  onClose: () => void
}

export default function FavoritesPopup({
  productId,
  productName,
  isOpen,
  onClose,
}: FavoritesPopupProps) {
  const [inventoryLists, setInventoryLists] = useState<InventoryList[]>([])
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      loadInventoryLists()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const loadInventoryLists = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('inventory_lists')
      .select(
        `
        id,
        name,
        inventory_list_items (count)
      `
      )
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (!error && data) {
      setInventoryLists(
        data.map(list => ({
          id: list.id,
          name: list.name,
          item_count: Array.isArray(list.inventory_list_items)
            ? list.inventory_list_items.length
            : 0,
        }))
      )
    }
  }

  const addToList = async (listId: string) => {
    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to add to favorites')
      setIsLoading(false)
      return
    }

    // Check if product already exists in this list
    const { data: existing } = await supabase
      .from('inventory_list_items')
      .select('id, quantity')
      .eq('inventory_list_id', listId)
      .eq('product_id', productId)
      .maybeSingle()

    if (existing) {
      // If exists, increment quantity
      const { error } = await supabase
        .from('inventory_list_items')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)

      if (error) {
        console.error('Error updating quantity:', error)
        toast.error('Failed to update list')
      } else {
        toast.success('Product quantity updated in list!')
      }
    } else {
      // If doesn't exist, create new entry
      const { error } = await supabase.from('inventory_list_items').insert({
        inventory_list_id: listId,
        product_id: productId,
        quantity: 1,
      })

      if (error) {
        console.error('Error adding to list:', error)
        toast.error('Failed to add to list')
      } else {
        // Also add to general favorites table for backwards compatibility
        await supabase
          .from('favorites')
          .upsert({ user_id: user.id, product_id: productId }, { onConflict: 'user_id,product_id' })

        toast.success('Added to favorites list!')
      }
    }

    setIsLoading(false)
    onClose()
  }

  const createNewList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name')
      return
    }

    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to create a list')
      setIsLoading(false)
      return
    }

    // Create the list
    const { data: newList, error: listError } = await supabase
      .from('inventory_lists')
      .insert({
        user_id: user.id,
        name: newListName.trim(),
      })
      .select('id')
      .single()

    if (listError || !newList) {
      console.error('Error creating list:', listError)
      toast.error('Failed to create list')
      setIsLoading(false)
      return
    }

    // Add product to the new list
    await addToList(newList.id)
    setNewListName('')
    setIsCreatingNew(false)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-black">Add to Favorites</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">Choose a list for &ldquo;{productName}&rdquo;</p>

        {/* Existing Lists */}
        {inventoryLists.length > 0 && (
          <div className="space-y-2 mb-4">
            {inventoryLists.map(list => (
              <button
                key={list.id}
                onClick={() => addToList(list.id)}
                disabled={isLoading}
                className="w-full flex justify-between items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="text-left">
                  <p className="font-medium text-black">{list.name}</p>
                  <p className="text-sm text-gray-500">{list.item_count || 0} items</p>
                </div>
                <span className="text-sm text-gray-400">Add →</span>
              </button>
            ))}
          </div>
        )}

        {/* Create New List */}
        {!isCreatingNew ? (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <Plus className="h-5 w-5 text-gray-600" />
            <span className="text-gray-600">Create New List</span>
          </button>
        ) : (
          <div className="space-y-3 border-t pt-4">
            <input
              type="text"
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="Enter list name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
              onKeyDown={e => {
                if (e.key === 'Enter') createNewList()
                if (e.key === 'Escape') {
                  setIsCreatingNew(false)
                  setNewListName('')
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createNewList}
                disabled={isLoading || !newListName.trim()}
                className="flex-1 bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Create & Add
              </button>
              <button
                onClick={() => {
                  setIsCreatingNew(false)
                  setNewListName('')
                }}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
