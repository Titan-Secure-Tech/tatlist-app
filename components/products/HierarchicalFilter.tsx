'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  slug: string
  name: string
  description: string
  sort_order: number
  product_count: number
}

interface Collection {
  id: string
  slug: string
  name: string
  description: string
  sort_order: number
  categories: Category[]
  product_count: number
}

interface HierarchicalFilterProps {
  collections: Collection[]
  selectedCollectionId?: string
  selectedCategoryId?: string
}

export function HierarchicalFilter({
  collections,
  selectedCollectionId,
  selectedCategoryId,
}: HierarchicalFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // State for collapsing the entire filter section
  const [isFilterOpen, setIsFilterOpen] = useState(true)

  // Auto-expand the selected collection by initializing with it
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(() => {
    const initial = new Set<string>()
    if (selectedCollectionId) {
      initial.add(selectedCollectionId)
    }
    return initial
  })

  const toggleCollection = (collectionId: string) => {
    setExpandedCollections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId)
      } else {
        newSet.add(collectionId)
      }
      return newSet
    })
  }

  const handleCollectionClick = (collectionId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('collection', collectionId)
    params.delete('category') // Reset category when changing collection
    router.push(`/products?${params.toString()}`)
  }

  const handleCategoryClick = (collectionId: string, categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('collection', collectionId)
    params.set('category', categoryId)
    router.push(`/products?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('collection')
    params.delete('category')
    router.push(`/products?${params.toString()}`)
  }

  const hasActiveFilters = selectedCollectionId || selectedCategoryId

  return (
    <Card className="p-4">
      {/* Header with Collapse Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center gap-2 font-semibold text-lg hover:text-primary transition-colors"
        >
          {isFilterOpen ? (
            <ChevronDown className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
          Filter by Category
        </button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Collections List - Only show when expanded */}
      {isFilterOpen && (
        <div className="space-y-2">
        {collections.map(collection => {
          const isExpanded = expandedCollections.has(collection.id)
          const isSelected = selectedCollectionId === collection.id

          return (
            <div key={collection.id} className="space-y-1">
              {/* Collection Header */}
              <div
                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'hover:bg-accent text-foreground'
                }`}
              >
                <div
                  className="flex items-center gap-2 flex-1"
                  onClick={() => handleCollectionClick(collection.id)}
                >
                  <span className="font-medium">{collection.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {collection.product_count}
                  </Badge>
                </div>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    toggleCollection(collection.id)
                  }}
                  className="p-1 hover:bg-accent/50 rounded"
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Categories (shown when expanded) */}
              {isExpanded && collection.categories.length > 0 && (
                <div className="ml-6 space-y-1">
                  {collection.categories.map(category => {
                    const isCategorySelected = selectedCategoryId === category.id

                    return (
                      <div
                        key={category.id}
                        onClick={() => handleCategoryClick(collection.id, category.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isCategorySelected
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span className="text-sm">{category.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {category.product_count}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
        </div>
      )}

      {/* Active Filter Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="text-sm text-muted-foreground mb-2">Active Filters:</div>
          <div className="flex flex-wrap gap-2">
            {selectedCollectionId && (
              <Badge variant="default" className="gap-1">
                {collections.find(c => c.id === selectedCollectionId)?.name}
                {!selectedCategoryId && (
                  <button onClick={clearFilters} className="ml-1 hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            )}
            {selectedCategoryId && (
              <Badge variant="default" className="gap-1">
                {
                  collections
                    .find(c => c.id === selectedCollectionId)
                    ?.categories.find(cat => cat.id === selectedCategoryId)?.name
                }
                <button onClick={clearFilters} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}
