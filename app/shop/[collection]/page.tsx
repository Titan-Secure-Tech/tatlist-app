import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { QuickAddButton } from '@/components/shop/quick-add-button'
import type { Product } from '@/types'

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600

// Enable dynamic params for on-demand generation
export const dynamicParams = true

interface CollectionPageProps {
  params: Promise<{
    collection: string
  }>
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { collection: collectionSlug } = await params
  const supabase = await createClient()

  // Fetch collection
  const { data: collection, error: collectionError } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', collectionSlug)
    .single()

  if (collectionError || !collection) {
    notFound()
  }

  // Optimized: Fetch categories with aggregated product counts (fixes N+1 query problem)
  const { data: categories } = await supabase
    .from('categories')
    .select(
      `
      *,
      collection:collections(*),
      products(count)
    `
    )
    .eq('collection_id', collection.id)
    .order('sort_order', { ascending: true })

  // Extract counts from the aggregated response
  const categoryCounts = new Map<string, number>()
  if (categories) {
    categories.forEach(category => {
      categoryCounts.set(
        category.id,
        (category as { products?: Array<{ count: number }> }).products?.[0]?.count || 0
      )
    })
  }

  // If no categories exist, fetch products directly from this collection
  let products: Product[] = []
  if (!categories || categories.length === 0) {
    const { data: directProducts } = await supabase
      .from('products')
      .select('*')
      .eq('collection_id', collection.id)
      .order('name', { ascending: true })
    products = directProducts || []
  }

  return (
    <div className="min-h-screen bg-white">
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
                <BreadcrumbPage>{collection.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{collection.name}</h1>
          {collection.description && (
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {collection.description}
            </p>
          )}
        </div>

        {/* Categories Grid */}
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => {
              const productCount = categoryCounts.get(category.id) || 0

              return (
                <Link
                  key={category.id}
                  href={`/shop/${collectionSlug}/${category.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-lg">
                    {category.image_url && (
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <Image
                          src={category.image_url}
                          alt={category.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={index < 3}
                          loading={index < 3 ? undefined : 'lazy'}
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                          {category.name}
                        </h3>
                        <Badge variant="secondary">{productCount}</Badge>
                      </div>
                      {category.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : products.length > 0 ? (
          /* Products Grid - shown when no categories exist */
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground">{products.length} products</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <Card key={product.id} className="flex flex-col h-full group">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.images?.[0] || '/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      priority={index < 4}
                      loading={index < 4 ? undefined : 'lazy'}
                    />
                  </div>
                  <CardContent className="flex-1 p-4 flex flex-col">
                    <div className="mb-2 flex items-center gap-2">
                      {product.in_stock ? (
                        <Badge variant="default" className="text-xs bg-green-600">
                          In Stock
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Out of Stock
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                        {product.description}
                      </p>
                    )}
                    <div className="mt-auto space-y-3">
                      <p className="text-xl font-bold">${Number(product.price).toFixed(2)}</p>
                      <QuickAddButton product={product} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products available</p>
          </div>
        )}
      </div>
    </div>
  )
}
