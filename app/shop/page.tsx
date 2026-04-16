import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600

// Enable dynamic params for on-demand generation
export const dynamicParams = true

export default async function ShopPage() {
  const supabase = await createClient()

  // Optimized: Single query with aggregated product counts (fixes N+1 query problem)
  const { data: collections } = await supabase
    .from('collections')
    .select(
      `
      *,
      products(count)
    `
    )
    .order('sort_order', { ascending: true })

  // Extract counts from the aggregated response
  const collectionCounts = new Map<string, number>()
  if (collections) {
    collections.forEach(collection => {
      collectionCounts.set(
        collection.id,
        (collection as { products?: Array<{ count: number }> }).products?.[0]?.count || 0
      )
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Shop Tattoo Supplies</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Browse our extensive catalog of professional tattoo equipment and supplies from top
            brands
          </p>
        </div>

        {/* Collections Grid */}
        {collections && collections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, index) => {
              const productCount = collectionCounts.get(collection.id) || 0

              return (
                <Link key={collection.id} href={`/shop/${collection.slug}`} className="group">
                  <Card className="h-full transition-all hover:border-brand">
                    {collection.image_url && (
                      <div className="aspect-video relative overflow-hidden rounded-t-lg">
                        <Image
                          src={collection.image_url}
                          alt={collection.name}
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
                          {collection.name}
                        </h3>
                        <Badge variant="secondary">{productCount}</Badge>
                      </div>
                      {collection.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {collection.description}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No collections available</p>
            <p className="text-sm text-muted-foreground">
              Run the migration and import script to populate the catalog
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
