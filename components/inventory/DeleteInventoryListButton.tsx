'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

interface DeleteInventoryListButtonProps {
  listId: string
  listName: string
}

export default function DeleteInventoryListButton({
  listId,
  listName,
}: DeleteInventoryListButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)

    const { error } = await supabase.from('inventory_lists').delete().eq('id', listId)

    if (error) {
      console.error('Error deleting inventory list:', error)
      setIsDeleting(false)
      return
    }

    router.refresh()
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2" onClick={e => e.preventDefault()}>
        <span className="text-sm text-gray-600">Delete &ldquo;{listName}&rdquo;?</span>
        <button
          onClick={e => {
            e.preventDefault()
            handleDelete()
          }}
          disabled={isDeleting}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isDeleting ? 'Deleting...' : 'Confirm'}
        </button>
        <button
          onClick={e => {
            e.preventDefault()
            setShowConfirm(false)
          }}
          disabled={isDeleting}
          className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={e => {
        e.preventDefault()
        setShowConfirm(true)
      }}
      className="text-red-600 hover:text-red-700 transition-colors"
      title="Delete list"
    >
      <Trash2 className="h-5 w-5" />
    </button>
  )
}
