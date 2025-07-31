#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkApiImages() {
  console.log('🔍 Checking for products with API images...\n')
  
  // Check products with images that look like Lucky Supply URLs
  const { data: productsWithImages } = await supabase
    .from('products')
    .select('name, sku, images, brand')
    .not('images', 'is', null)
    .neq('images', '{}')
  
  console.log(`Found ${productsWithImages?.length || 0} products with images\n`)
  
  // Check if any have Lucky Supply URLs
  const luckyImages = productsWithImages?.filter(p => 
    p.images?.some((img: string) => 
      img.includes('cdn.shopify.com') || 
      img.includes('lucky') ||
      !img.includes('supabase')
    )
  )
  
  if (luckyImages && luckyImages.length > 0) {
    console.log(`✅ Found ${luckyImages.length} products with Lucky Supply API images:\n`)
    luckyImages.slice(0, 5).forEach(p => {
      console.log(`- ${p.name} (${p.sku})`)
      console.log(`  Images: ${p.images?.length || 0}`)
      if (p.images?.[0]) {
        console.log(`  First image: ${p.images[0]}`)
      }
      console.log('')
    })
  } else {
    console.log('❌ No products found with Lucky Supply API images')
    console.log('   All images appear to be from Supabase storage\n')
  }
  
  // Check products without any images
  const { data: productsWithoutImages, count } = await supabase
    .from('products')
    .select('name, sku', { count: 'exact' })
    .or('images.is.null,images.eq.{}')
  
  console.log(`\n📊 Products without images: ${count}`)
  
  if (productsWithoutImages && productsWithoutImages.length > 0) {
    console.log('\nFirst 5 products without images:')
    productsWithoutImages.slice(0, 5).forEach(p => {
      console.log(`- ${p.name} (${p.sku})`)
    })
  }
}

checkApiImages()