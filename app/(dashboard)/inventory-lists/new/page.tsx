'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function NewInventoryListPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('inventory_lists')
        .insert({
          user_id: user.id,
          name: name.trim()
        })
        .select()
        .single()

      if (error) throw error

      router.push(`/inventory-lists/${data.id}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-foreground mb-6">Create New Inventory List</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
            List Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-xl focus:outline-none focus:ring-brand focus:border-brand"
            placeholder="e.g., Weekly Supplies, Station 1 Inventory"
            required
          />
        </div>

        {error && (
          <div className="text-destructive text-sm">{error}</div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-4 py-2 border border-border text-foreground rounded-xl hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="flex-1 px-4 py-2 bg-gradient-to-b from-[var(--brand-gradient-from)] to-[var(--brand-gradient-to)] text-primary-foreground rounded-xl hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create List'}
          </button>
        </div>
      </form>
    </div>
  )
}