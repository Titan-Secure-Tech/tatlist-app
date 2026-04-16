import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Image from 'next/image'
import { Home } from 'lucide-react'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { ProductSearch } from '@/components/shop/product-search'
import { ProductFilters } from '@/components/shop/product-filters'

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600

// Enable dynamic params for on-demand generation
export const dynamicParams = true

interface CategoryPageProps {
  params: Promise<{
    collection: string
    category: string
  }>
  searchParams: Promise<{
    view?: 'grid' | 'list'
  }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { collection: collectionSlug, category: categorySlug } = await params
  const resolvedSearchParams = await searchParams
  const { q, vendors, tags, in_stock } = resolvedSearchParams
  const supabase = await createClient()

  // Fetch category first to get ID (needed for dependent queries)
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('*, collection:collections(*)')
    .eq('slug', categorySlug)
    .single()

  if (categoryError || !category) {
    notFound()
  }

  // Build products query
  let productsQuery = supabase
    .from('products_with_relationships')
    .select('*')
    .eq('category_id', category.id)

  // Apply search
  if (q) {
    productsQuery = productsQuery.textSearch('search_vector', q)
  }

  // Apply vendor filter
  if (vendors) {
    const vendorSlugs = vendors.split(',')
    productsQuery = productsQuery.in('vendor_slug', vendorSlugs)
  }

  // Apply tags filter
  if (tags) {
    const tagSlugs = tags.split(',')
    productsQuery = productsQuery.overlaps('tag_slugs', tagSlugs)
  }

  // Apply in stock filter
  if (in_stock === 'true') {
    productsQuery = productsQuery.eq('in_stock', true)
  }

  productsQuery = productsQuery.order('name', { ascending: true })

  // Optimized: Fetch all independent queries in parallel
  const [
    { data: collection },
    { data: products },
    { data: subcategories },
    { data: vendorsList },
    { data: tagsList },
  ] = await Promise.all([
    supabase.from('collections').select('*').eq('slug', collectionSlug).single(),
    productsQuery,
    supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', category.id)
      .order('sort_order', { ascending: true }),
    supabase.from('vendors').select('*').order('name', { ascending: true }),
    supabase.from('tags').select('*').order('name', { ascending: true }).limit(50),
  ])

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <Home className="h-4 w-4" />
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/shop">Shop</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/shop/${collectionSlug}`}>
                  {collection?.name || collectionSlug}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{category.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground">{category.description}</p>
              )}
            </div>
            <Badge variant="secondary">{products?.length || 0} Products</Badge>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <ProductSearch />
            <ProductFilters vendors={vendorsList || []} tags={tagsList || []} />
          </div>
        </div>

        {/* Subcategories */}
        {subcategories && subcategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Browse by Subcategory</h2>
            <div className="flex flex-wrap gap-2">
              {subcategories.map(subcategory => (
                <Link
                  key={subcategory.id}
                  href={`/shop/${collectionSlug}/${categorySlug}/${subcategory.slug}`}
                >
                  <Badge variant="outline" className="text-sm hover:bg-accent cursor-pointer">
                    {subcategory.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Products Grid */}
        {products && products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <Card key={product.id} className="flex flex-col h-full">
                <Link href={`/shop/${collectionSlug}/${categorySlug}/${product.sku}`}>
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.images[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={index < 4}
                      loading={index < 4 ? undefined : 'lazy'}
                    />
                  </div>
                </Link>

                <CardContent className="flex-1 p-6 flex flex-col">
                  <div className="mb-2 flex items-center gap-2 flex-wrap">
                    {product.vendor_name && (
                      <Badge variant="outline" className="text-xs">
                        {product.vendor_name}
                      </Badge>
                    )}
                    {product.subcategory_name && (
                      <Badge variant="secondary" className="text-xs">
                        {product.subcategory_name}
                      </Badge>
                    )}
                    {product.in_stock ? (
                      <Badge variant="default" className="text-xs bg-success">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  <Link href={`/shop/${collectionSlug}/${categorySlug}/${product.sku}`}>
                    <h3 className="font-semibold mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                      {product.description}
                    </p>
                  )}

                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <p className="text-sm text-muted-foreground line-through">
                            ${product.compare_at_price.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>

                    <AddToCartButton product={product} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No products available in this category</p>
            <Button asChild variant="outline">
              <Link href={`/shop/${collectionSlug}`}>Back to {collection?.name}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
