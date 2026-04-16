'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Collection {
  id: string
  name: string
  item_count?: number
}

interface CollectionModalProps {
  productId: string
  productName: string
  isOpen: boolean
  onClose: () => void
}

export default function CollectionModal({
  productId,
  productName,
  isOpen,
  onClose,
}: CollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      loadCollections()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const loadCollections = async () => {
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
      setCollections(
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

  const addToCollection = async (collectionId: string) => {
    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to add to collection')
      setIsLoading(false)
      return
    }

    // Use upsert to handle both insert and update in one operation
    // This prevents 409 conflicts from the UNIQUE constraint
    const { data: existing } = await supabase
      .from('inventory_list_items')
      .select('id, quantity')
      .eq('inventory_list_id', collectionId)
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
        toast.error('Failed to update collection')
        setIsLoading(false)
      } else {
        toast.success('Added to collection!')
        router.refresh()
        setIsLoading(false)
        onClose()
      }
    } else {
      // If doesn't exist, create new entry with conflict handling
      const { error } = await supabase
        .from('inventory_list_items')
        .insert({
          inventory_list_id: collectionId,
          product_id: productId,
          quantity: 1,
        })
        .select()
        .single()

      // If we get a duplicate key error, fetch and update instead
      if (error?.code === '23505') {
        const { data: duplicateItem } = await supabase
          .from('inventory_list_items')
          .select('id, quantity')
          .eq('inventory_list_id', collectionId)
          .eq('product_id', productId)
          .single()

        if (duplicateItem) {
          const { error: updateError } = await supabase
            .from('inventory_list_items')
            .update({ quantity: duplicateItem.quantity + 1 })
            .eq('id', duplicateItem.id)

          if (updateError) {
            console.error('Error updating after conflict:', updateError)
            toast.error('Failed to add to collection')
            setIsLoading(false)
          } else {
            toast.success('Added to collection!')
            router.refresh()
            setIsLoading(false)
            onClose()
          }
        }
      } else if (error) {
        console.error('Error adding to collection:', error)
        toast.error('Failed to add to collection')
        setIsLoading(false)
      } else {
        toast.success('Added to collection!')
        router.refresh()
        setIsLoading(false)
        onClose()
      }
    }
  }

  const createNewCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name')
      return
    }

    setIsLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please sign in to create a collection')
      setIsLoading(false)
      return
    }

    // Create the collection
    const { data: newCollection, error: collectionError } = await supabase
      .from('inventory_lists')
      .insert({
        user_id: user.id,
        name: newCollectionName.trim(),
      })
      .select('id')
      .single()

    if (collectionError || !newCollection) {
      console.error('Error creating collection:', collectionError)
      toast.error('Failed to create collection')
      setIsLoading(false)
      return
    }

    // Add product to the new collection
    await addToCollection(newCollection.id)
    setNewCollectionName('')
    setIsCreatingNew(false)
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-xl max-w-md w-full p-6 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Add to collection</h2>
            {productName && <p className="text-sm text-muted-foreground mt-1">{productName}</p>}
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Create New Collection Button */}
        {!isCreatingNew ? (
          <button
            onClick={() => setIsCreatingNew(true)}
            className="w-full flex items-center gap-3 p-4 mb-4 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] rounded-xl hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-background rounded">
              <Plus className="h-6 w-6 text-foreground" />
            </div>
            <span className="text-primary-foreground font-medium">Create new collection</span>
          </button>
        ) : (
          <div className="space-y-3 mb-4 p-4 border border-border rounded-xl">
            <input
              type="text"
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:border-brand"
              onKeyDown={e => {
                if (e.key === 'Enter') createNewCollection()
                if (e.key === 'Escape') {
                  setIsCreatingNew(false)
                  setNewCollectionName('')
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={createNewCollection}
                disabled={isLoading || !newCollectionName.trim()}
                className="flex-1 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground py-2 rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
              >
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreatingNew(false)
                  setNewCollectionName('')
                }}
                disabled={isLoading}
                className="px-4 py-2 border border-border rounded-xl hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Existing Collections */}
        {collections.length > 0 ? (
          <div className="space-y-2">
            {collections.map(collection => (
              <button
                key={collection.id}
                onClick={() => addToCollection(collection.id)}
                disabled={isLoading}
                className="w-full flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-accent transition-colors disabled:opacity-50"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-secondary rounded">
                  <span className="text-xl">📦</span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-foreground">{collection.name}</p>
                  <p className="text-sm text-muted-foreground">🌐 {collection.item_count || 0} items</p>
                </div>
                <div className="w-6 h-6 border-2 border-border rounded" />
              </button>
            ))}
          </div>
        ) : (
          !isCreatingNew && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No collections yet</p>
              <p className="text-sm">Create your first collection to organize your inventory</p>
            </div>
          )
        )}

        <div className="mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground py-3 rounded-xl hover:bg-accent transition-colors font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
