#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js'

const LUCKY_SUPPLY_API_BASE = 'https://luckysupplyapps.com/product_api/getProduct.php'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
    console.log(`  🔄 Fetching from API: ${productId}`)
    const response = await fetch(`${LUCKY_SUPPLY_API_BASE}?product_id=${productId}`)
    
    if (!response.ok) {
      console.error(`  ❌ Failed: ${response.statusText}`)
      return null
    }
    
    const data = await response.json()
    console.log(`  ✅ Success: ${data.title}`)
    console.log(`  📸 Images: ${data.images?.nodes?.length || 0}`)
    
    return data
  } catch (error) {
    console.error(`  ❌ Error:`, error)
    return null
  }
}

async function syncLuckyApiImages() {
  console.log('🚀 Syncing images from Lucky Supply API...\n')
  
  try {
    // Get some products without images or with sample images
    const { data: products } = await supabase
      .from('products')
      .select('id, sku, name, images')
      .or('images.is.null,images.eq.{}')
      .limit(10)
    
    console.log(`📊 Found ${products?.length || 0} products to update\n`)
    
    let successCount = 0
    let imageCount = 0
    
    for (const product of products || []) {
      console.log(`\n🔍 Processing: ${product.name} (${product.sku})`)
      
      // Try the SKU as the product ID
      const luckyProduct = await fetchProductFromLuckySupply(product.sku)
      
      if (luckyProduct && luckyProduct.images?.nodes?.length > 0) {
        // Extract image URLs
        const imageUrls = luckyProduct.images.nodes.map(img => img.src)
        imageCount += imageUrls.length
        
        // Update product with API images
        const { error } = await supabase
          .from('products')
          .update({ 
            images: imageUrls,
            description: luckyProduct.description || product.description
          })
          .eq('id', product.id)
        
        if (!error) {
          successCount++
          console.log(`  ✅ Updated with ${imageUrls.length} images`)
          console.log(`  🖼️  First image: ${imageUrls[0]}`)
        } else {
          console.error(`  ❌ Update failed:`, error)
        }
      } else {
        console.log(`  ⚠️  No images found in API response`)
      }
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('\n' + '='.repeat(50))
    console.log(`✅ Sync complete!`)
    console.log(`📊 Updated: ${successCount} products`)
    console.log(`🖼️  Total images: ${imageCount}`)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
  }
}

// Run the sync
syncLuckyApiImages()