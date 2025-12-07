'use client'

import { useState, useTransition } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface InventoryItemQuantityProps {
  itemId: string
  initialQuantity: number
  productName: string
}

export function InventoryItemQuantity({
  itemId,
  initialQuantity,
  productName,
}: InventoryItemQuantityProps) {
  const [quantity, setQuantity] = useState(initialQuantity)
  const [isPending, startTransition] = useTransition()

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return

    const previousQuantity = quantity
    setQuantity(newQuantity)

    startTransition(async () => {
      try {
        const response = await fetch(`/api/inventory-list-items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity }),
        })

        if (!response.ok) {
          throw new Error('Failed to update quantity')
        }

        toast.success(`Updated ${productName} to ${newQuantity}`)
      } catch (error) {
        console.error('Error updating quantity:', error)
        setQuantity(previousQuantity)
        toast.error('Failed to update quantity')
      }
    })
  }

  return (
    <div className="flex items-center justify-between gap-0.5 mt-1 w-full">
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 hover:bg-black hover:text-white flex-shrink-0"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          updateQuantity(quantity - 1)
        }}
        disabled={quantity <= 1 || isPending}
      >
        <Minus className="h-2.5 w-2.5" />
      </Button>
      <span className="text-[10px] font-medium flex-1 text-center">×{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-4 w-4 p-0 hover:bg-black hover:text-white flex-shrink-0"
        onClick={e => {
          e.preventDefault()
          e.stopPropagation()
          updateQuantity(quantity + 1)
        }}
        disabled={isPending}
      >
        <Plus className="h-2.5 w-2.5" />
      </Button>
    </div>
  )
}
