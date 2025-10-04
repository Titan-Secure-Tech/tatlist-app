'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteInventoryListDialogProps {
  listId: string
  listName: string
}

export function DeleteInventoryListDialog({ listId, listName }: DeleteInventoryListDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/inventory-lists/${listId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete list')
      }

      toast.success(`"${listName}" has been deleted`)
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete list. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={(e) => e.preventDefault()}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Inventory List</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete "{listName}"? This action cannot be undone.
            All items in this list will also be removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete List'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}