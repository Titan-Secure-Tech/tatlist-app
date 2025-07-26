import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const LUCKY_SUPPLY_API_BASE = 'https://luckysupplyapps.com/product_api/getProduct.php'

interface LuckySupplyProduct {
  title: string
  description: string
  images: {
    nodes: Array<{
      altText: string
      src: string
    }>
  }
  variants: Array<{
    title: string
    availableForSale: boolean
    barcode: string
    price: string
  }>
}

async function fetchProductFromLuckySupply(productId: string): Promise<LuckySupplyProduct | null> {
  try {
    const response = await fetch(`${LUCKY_SUPPLY_API_BASE}?product_id=${productId}`)
    
    if (!response.ok) {
      console.error(`Failed to fetch product ${productId}: ${response.statusText}`)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error(`Error fetching product ${productId}:`, error)
    return null
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    // Get request body for specific product IDs or use defaults
    const body = await request.json().catch(() => ({}))
    const productIds = body.productIds || []
    
    if (productIds.length === 0) {
      // If no specific products requested, get existing SKUs from database
      const { data: existingProducts } = await supabase
        .from('products')
        .select('sku')
        .not('sku', 'is', null)
      
      if (existingProducts && existingProducts.length > 0) {
        productIds.push(...existingProducts.map(p => p.sku))
      }
    }
    
    const transformedProducts = []
    const errors = []
    
    // Fetch each product from Lucky Supply API
    for (const productId of productIds) {
      const luckyProduct = await fetchProductFromLuckySupply(productId)
      
      if (!luckyProduct) {
        errors.push(`Failed to fetch product ${productId}`)
        continue
      }
      
      // Transform each variant as a separate product
      for (const variant of luckyProduct.variants) {
        const product = {
          sku: variant.barcode || productId,
          name: variant.title !== 'Default Title' 
            ? `${luckyProduct.title} - ${variant.title}`
            : luckyProduct.title,
          description: luckyProduct.description || '',
          price: parseFloat(variant.price) || 0,
          images: luckyProduct.images.nodes.map(img => img.src),
          category: 'Tattoo Supplies', // Default category
          brand: 'Lucky Supply',
          in_stock: variant.availableForSale,
          stock_quantity: variant.availableForSale ? 100 : 0, // Default quantity
          tags: []
        }
        
        transformedProducts.push(product)
      }
    }
    
    // Upsert products into database if we have any
    if (transformedProducts.length > 0) {
      const { data, error } = await supabase
        .from('products')
        .upsert(transformedProducts, {
          onConflict: 'sku',
          ignoreDuplicates: false
        })
        .select()
        
      if (error) {
        throw error
      }
      
      return NextResponse.json({ 
        success: true, 
        message: `Synced ${data?.length || 0} products`,
        products: data?.length || 0,
        errors: errors.length > 0 ? errors : undefined
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'No products to sync',
        errors: errors
      })
    }
    
  } catch (error: any) {
    console.error('Product sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync products' }, 
      { status: 500 }
    )
  }
}