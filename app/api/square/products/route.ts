import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Fetch products from Supabase database (synced from Square)
    const supabase = await createClient()
    
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }

    // Convert products to Square API format
    const formattedProducts = products.map(product => ({
      id: product.square_catalog_id || product.id,
      name: product.name,
      description: product.description || '',
      category: product.category,
      imageUrl: product.images && product.images.length > 0 ? product.images[0] : null,
      variations: product.variations && Array.isArray(product.variations) 
        ? product.variations.map((v: any) => ({
            id: v.id,
            name: v.name || 'Default',
            sku: v.sku || product.sku,
            price: v.price || product.price,
            currency: v.currency || 'USD',
            trackInventory: v.track_inventory || false,
            availableForSale: v.available_for_sale !== false,
            stockStatus: product.in_stock ? 'in_stock' : 'out_of_stock',
          }))
        : [{
            id: product.square_variation_id || `${product.id}-default`,
            name: 'Default',
            sku: product.sku,
            price: product.price,
            currency: 'USD',
            trackInventory: false,
            availableForSale: true,
            stockStatus: product.in_stock ? 'in_stock' : 'out_of_stock',
          }],
      isDeleted: false,
      presentAtLocation: true,
      sync_source: product.sync_source || 'database'
    }))

    return NextResponse.json({
      products: formattedProducts,
      total: formattedProducts.length,
      source: 'database'
    })
  } catch (error) {
    console.error('Error fetching Square products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
