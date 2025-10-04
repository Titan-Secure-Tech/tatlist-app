'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Heart,
  Plus,
  Check,
  X,
  Folder,
  FolderPlus,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useFavoritesStore, FavoritesList } from '@/lib/store/favorites-store'
import { createClient } from '@/lib/supabase/client'

interface FavoritesPopupProps {
  isOpen: boolean
  onClose: () => void
  productId: string
  productName: string
}

export default function FavoritesPopup({
  isOpen,
  onClose,
  productId,
  productName,
}: FavoritesPopupProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [productInLists, setProductInLists] = useState<Set<string>>(new Set())
  
  const {
    lists,
    isLoading,
    error,
    fetchLists,
    createList,
    addToList,
    removeFromList,
    clearError,
  } = useFavoritesStore()

  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchLists()
      checkProductInLists()
    }
  }, [isOpen, fetchLists])

  const checkProductInLists = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) return

      const { data: items } = await supabase
        .from('favorites_list_items')
        .select('favorites_list_id')
        .eq('product_id', productId)

      if (items) {
        setProductInLists(new Set(items.map(item => item.favorites_list_id)))
      }
    } catch (error) {
      console.error('Error checking product in lists:', error)
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) return

    setIsCreating(true)
    const newList = await createList(newListName.trim())
    
    if (newList) {
      setNewListName('')
      setShowCreateForm(false)
      // Auto-add to the new list
      handleToggleList(newList.id, false)
    }
    setIsCreating(false)
  }

  const handleToggleList = async (listId: string, isCurrentlyInList: boolean) => {
    if (isCurrentlyInList) {
      const success = await removeFromList(listId, productId)
      if (success) {
        setProductInLists(prev => {
          const newSet = new Set(prev)
          newSet.delete(listId)
          return newSet
        })
      }
    } else {
      const success = await addToList(listId, productId)
      if (success) {
        setProductInLists(prev => new Set([...prev, listId]))
      }
    }
  }

  const handleClose = () => {
    setShowCreateForm(false)
    setNewListName('')
    clearError()
    onClose()
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2 }
    },
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Add to Favorites
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose a favorites list for <span className="font-medium">{productName}</span>
          </p>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              {error}
            </div>
          )}

          {/* Existing Lists */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : lists.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Folder className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No favorites lists yet</p>
                <p className="text-xs text-gray-400">Create your first list below</p>
              </div>
            ) : (
              lists.map((list) => {
                const isInList = productInLists.has(list.id)
                return (
                  <motion.button
                    key={list.id}
                    onClick={() => handleToggleList(list.id, isInList)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isInList
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <Folder className={`w-4 h-4 ${isInList ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="font-medium">{list.name}</span>
                      <span className="text-xs text-gray-500">
                        ({list.favorites_list_items?.[0]?.count || 0} items)
                      </span>
                    </div>
                    {isInList && <Check className="w-4 h-4 text-green-600" />}
                  </motion.button>
                )
              })
            )}
          </div>

          <Separator />

          {/* Create New List */}
          <AnimatePresence>
            {showCreateForm ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <Label htmlFor="list-name">New List Name</Label>
                <div className="flex gap-2">
                  <Input
                    id="list-name"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list name..."
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                    autoFocus
                  />
                  <Button
                    onClick={handleCreateList}
                    disabled={!newListName.trim() || isCreating}
                    size="sm"
                  >
                    {isCreating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCreateForm(false)
                      setNewListName('')
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(true)}
                className="w-full"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Create New List
              </Button>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}