'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ProductSearchProps {
  initialSearch?: string
}

export function ProductSearch({ initialSearch = '' }: ProductSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams)

    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }

    router.push(`/products?${params.toString()}`)
  }

  const handleClear = () => {
    setSearch('')
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    router.push(`/products?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search products by name, description, or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <Button type="submit">Search</Button>
    </form>
  )
}
