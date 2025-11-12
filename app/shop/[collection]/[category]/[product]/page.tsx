import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import Image from 'next/image'
import { Package, Truck, Shield, Home } from 'lucide-react'
import { ProductImageGallery } from '@/components/shop/product-image-gallery'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'

// Force dynamic rendering for Supabase data fetching
export const dynamic = 'force-dynamic'

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600

// Enable dynamic params for on-demand generation
export const dynamicParams = true

// Generate static params on-demand
export async function generateStaticParams() {
  // Return empty array to generate pages on-demand with ISR
  return []
}

async function _generateStaticParamsUnused() {
  // Kept for reference - original implementation
  const supabase = await createClient()

  // Pre-render top 100 most recently created products
  const { data: products } = await supabase
    .from('products_with_relationships')
    .select('sku, category_slug, collection_slug')
    .order('created_at', { ascending: false })
    .limit(100)

  if (!products) return []

  return products.map(product => ({
    collection: product.collection_slug,
    category: product.category_slug,
    product: product.sku,
  }))
}

interface ProductPageProps {
  params: Promise<{
    collection: string
    category: string
    product: string
  }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { collection: collectionSlug, category: categorySlug, product: productSku } = await params
  const supabase = await createClient()

  // Optimized: Fetch product, collection, and category in parallel
  const [{ data: product, error: productError }, { data: collection }, { data: category }] =
    await Promise.all([
      supabase.from('products_with_relationships').select('*').eq('sku', productSku).single(),
      supabase.from('collections').select('*').eq('slug', collectionSlug).single(),
      supabase.from('categories').select('*').eq('slug', categorySlug).single(),
    ])

  if (productError || !product) {
    notFound()
  }

  // Fetch related products with smart logic:
  // 1. Same subcategory (if exists)
  // 2. Same category but different subcategory
  // 3. Same vendor + same collection
  type ProductType = typeof product
  let relatedProducts: ProductType[] = []

  if (product.subcategory_id) {
    // Try same subcategory first
    const { data: subcategoryProducts } = await supabase
      .from('products_with_relationships')
      .select('*')
      .eq('subcategory_id', product.subcategory_id)
      .neq('id', product.id)
      .eq('in_stock', true)
      .limit(8)

    if (subcategoryProducts) {
      relatedProducts = subcategoryProducts as ProductType[]
    }
  }

  // If we need more products, add from same category
  if (relatedProducts.length < 8 && product.category_id) {
    const { data: categoryProducts } = await supabase
      .from('products_with_relationships')
      .select('*')
      .eq('category_id', product.category_id)
      .neq('id', product.id)
      .eq('in_stock', true)
      .limit(8 - relatedProducts.length)

    if (categoryProducts) {
      relatedProducts = [...relatedProducts, ...(categoryProducts as ProductType[])]
    }
  }

  // If still need more, add from same vendor in collection
  if (relatedProducts.length < 8 && product.vendor_id && product.collection_id) {
    const existingIds = relatedProducts.map(p => p.id)
    const { data: vendorProducts } = await supabase
      .from('products_with_relationships')
      .select('*')
      .eq('vendor_id', product.vendor_id)
      .eq('collection_id', product.collection_id)
      .neq('id', product.id)
      .not('id', 'in', `(${existingIds.join(',')})`)
      .eq('in_stock', true)
      .limit(8 - relatedProducts.length)

    if (vendorProducts) {
      relatedProducts = [...relatedProducts, ...(vendorProducts as ProductType[])]
    }
  }

  // Take first 8 related products (already filtered and limited by queries)
  const shuffledRelated = relatedProducts.slice(0, 8)

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
                <BreadcrumbLink href={`/shop/${collectionSlug}`}>
                  {collection?.name || collectionSlug}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/shop/${collectionSlug}/${categorySlug}`}>
                  {category?.name || categorySlug}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="max-w-[200px] truncate">{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div>
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>

          {/* Product Info */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              {product.vendor_name && (
                <Badge variant="outline" className="text-sm">
                  {product.vendor_name}
                </Badge>
              )}
              {product.in_stock ? (
                <Badge variant="secondary" className="text-sm">
                  In Stock
                </Badge>
              ) : (
                <Badge variant="destructive" className="text-sm">
                  Out of Stock
                </Badge>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <p className="text-4xl font-bold">${product.price.toFixed(2)}</p>
                {product.compare_at_price && product.compare_at_price > product.price && (
                  <>
                    <p className="text-xl text-muted-foreground line-through">
                      ${product.compare_at_price.toFixed(2)}
                    </p>
                    <Badge variant="destructive">
                      Save{' '}
                      {Math.round(
                        ((product.compare_at_price - product.price) / product.compare_at_price) *
                          100
                      )}
                      %
                    </Badge>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-6 prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: product.description }} />
              </div>
            )}

            {/* SKU */}
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            </div>

            {/* Add to Cart */}
            <div className="mb-8">
              <AddToCartButton product={product} size="lg" className="w-full" />
            </div>

            {/* Features */}
            <Card className="p-6 mb-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">Authentic Products</p>
                    <p className="text-sm text-muted-foreground">
                      Guaranteed authentic from verified suppliers
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">Fast Delivery</p>
                    <p className="text-sm text-muted-foreground">
                      Same-day delivery available in Tampa Bay
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">Secure Checkout</p>
                    <p className="text-sm text-muted-foreground">
                      Safe and secure payment processing
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tags */}
            {product.tag_names && product.tag_names.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Tags:</p>
                <div className="flex flex-wrap gap-2">
                  {product.tag_names.map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {shuffledRelated && shuffledRelated.length > 0 && (
          <div className="mt-16 border-t pt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">You May Also Like</h2>
                <p className="text-muted-foreground">
                  Similar products from {product.category_name || 'this category'}
                </p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/shop/${collectionSlug}/${categorySlug}`}>
                  View All in {category?.name}
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {shuffledRelated.map(relatedProduct => (
                <Card
                  key={relatedProduct.id}
                  className="group overflow-hidden hover:shadow-lg transition-all"
                >
                  <Link href={`/shop/${collectionSlug}/${categorySlug}/${relatedProduct.sku}`}>
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <Image
                        src={relatedProduct.images[0] || '/placeholder-product.jpg'}
                        alt={relatedProduct.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      />
                      {relatedProduct.compare_at_price &&
                        relatedProduct.compare_at_price > relatedProduct.price && (
                          <Badge className="absolute top-2 right-2 bg-red-600">
                            Save{' '}
                            {Math.round(
                              ((relatedProduct.compare_at_price - relatedProduct.price) /
                                relatedProduct.compare_at_price) *
                                100
                            )}
                            %
                          </Badge>
                        )}
                    </div>
                    <div className="p-4">
                      <div className="mb-2 flex items-center gap-1 flex-wrap">
                        {relatedProduct.vendor_name && (
                          <Badge variant="outline" className="text-xs">
                            {relatedProduct.vendor_name}
                          </Badge>
                        )}
                        {!relatedProduct.in_stock && (
                          <Badge variant="destructive" className="text-xs">
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold line-clamp-2 mb-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        <p className="text-lg font-bold">${relatedProduct.price.toFixed(2)}</p>
                        {relatedProduct.compare_at_price &&
                          relatedProduct.compare_at_price > relatedProduct.price && (
                            <p className="text-sm text-muted-foreground line-through">
                              ${relatedProduct.compare_at_price.toFixed(2)}
                            </p>
                          )}
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
