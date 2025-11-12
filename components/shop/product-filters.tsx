'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Filter, X } from 'lucide-react'

interface ProductFiltersProps {
  vendors?: Array<{ id: string; name: string; slug: string }>
  tags?: Array<{ id: string; name: string; slug: string }>
}

export function ProductFilters({ vendors, tags }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedVendors = searchParams.get('vendors')?.split(',').filter(Boolean) || []
  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || []
  const inStockOnly = searchParams.get('in_stock') === 'true'

  const updateFilters = (key: string, value: string | boolean | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === null || value === false || value === '') {
      params.delete(key)
    } else if (typeof value === 'boolean') {
      params.set(key, value.toString())
    } else {
      params.set(key, value)
    }

    router.push(`?${params.toString()}`)
  }

  const toggleVendor = (vendorSlug: string) => {
    const newVendors = selectedVendors.includes(vendorSlug)
      ? selectedVendors.filter(v => v !== vendorSlug)
      : [...selectedVendors, vendorSlug]

    updateFilters('vendors', newVendors.length > 0 ? newVendors.join(',') : null)
  }

  const toggleTag = (tagSlug: string) => {
    const newTags = selectedTags.includes(tagSlug)
      ? selectedTags.filter(t => t !== tagSlug)
      : [...selectedTags, tagSlug]

    updateFilters('tags', newTags.length > 0 ? newTags.join(',') : null)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('vendors')
    params.delete('tags')
    params.delete('in_stock')
    params.delete('min_price')
    params.delete('max_price')
    router.push(`?${params.toString()}`)
  }

  const hasActiveFilters = selectedVendors.length > 0 || selectedTags.length > 0 || inStockOnly

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Vendor Filter */}
      {vendors && vendors.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Vendor
              {selectedVendors.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedVendors.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by Vendor</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {vendors.map(vendor => (
              <DropdownMenuCheckboxItem
                key={vendor.id}
                checked={selectedVendors.includes(vendor.slug)}
                onCheckedChange={() => toggleVendor(vendor.slug)}
              >
                {vendor.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Tags Filter */}
      {tags && tags.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Tags
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedTags.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 max-h-96 overflow-y-auto">
            <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tags.map(tag => (
              <DropdownMenuCheckboxItem
                key={tag.id}
                checked={selectedTags.includes(tag.slug)}
                onCheckedChange={() => toggleTag(tag.slug)}
              >
                {tag.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* In Stock Filter */}
      <Button
        variant={inStockOnly ? 'default' : 'outline'}
        size="sm"
        onClick={() => updateFilters('in_stock', !inStockOnly || null)}
      >
        In Stock Only
      </Button>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters}>
          <X className="h-4 w-4 mr-2" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
