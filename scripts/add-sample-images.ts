#!/usr/bin/env bun

import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample placeholder images for different product categories
const categoryImages: Record<string, string> = {
  'transfer': 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=400&fit=crop', // tattoo supplies
  'cups': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=400&fit=crop', // cups
  'masks': 'https://images.unsplash.com/photo-1584634428004-1ae3aac77614?w=400&h=400&fit=crop', // face masks
  'bags': 'https://images.unsplash.com/photo-1581701391032-33cb5e7b44fe?w=400&h=400&fit=crop', // bags
  'film': 'https://images.unsplash.com/photo-1598387846419-a2c870ad3ecd?w=400&h=400&fit=crop', // protective film
  'cleaning': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&h=400&fit=crop', // cleaning supplies
  'alcohol': 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop', // medical supplies
  'ink': 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&h=400&fit=crop', // tattoo ink
  'cream': 'https://images.unsplash.com/photo-1611080541599-8c6dbde6ed28?w=400&h=400&fit=crop', // tattoo cream
  'default': 'https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=400&h=400&fit=crop' // default tattoo supplies
}

// Function to determine category from product name
function getProductCategory(name: string): string {
  const lowerName = name.toLowerCase()
  
  if (lowerName.includes('spirit') || lowerName.includes('transfer') || lowerName.includes('thermal')) {
    return 'transfer'
  } else if (lowerName.includes('cup')) {
    return 'cups'
  } else if (lowerName.includes('mask')) {
    return 'masks'
  } else if (lowerName.includes('bag')) {
    return 'bags'
  } else if (lowerName.includes('barrier') || lowerName.includes('film')) {
    return 'film'
  } else if (lowerName.includes('clean') || lowerName.includes('cide')) {
    return 'cleaning'
  } else if (lowerName.includes('alcohol')) {
    return 'alcohol'
  } else if (lowerName.includes('ink') || lowerName.includes('cap')) {
    return 'ink'
  } else if (lowerName.includes('cream') || lowerName.includes('stuff')) {
    return 'cream'
  }
  
  return 'default'
}

// Function to download and upload image to Supabase
async function uploadImageToSupabase(imageUrl: string, sku: string): Promise<string | null> {
  try {
    console.log(`  📥 Downloading image...`)
    const response = await fetch(imageUrl)
    if (!response.ok) return null
    
    const buffer = await response.arrayBuffer()
    const filename = `${sku}_sample.jpg`
    
    console.log(`  📤 Uploading to Supabase...`)
    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      })
    
    if (error) {
      console.error(`  ❌ Upload error:`, error.message)
      return null
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filename)
    
    return publicUrl
  } catch (error) {
    console.error(`  ❌ Error:`, error)
    return null
  }
}

// Main function
async function addSampleImages() {
  console.log('🎨 Adding sample images to products...\n')
  
  try {
    // Get products without images
    const { data: products, error } = await supabase
      .from('products')
      .select('id, sku, name, images')
      .or('images.is.null,images.eq.{}')
      .limit(20) // Add images to first 20 products
    
    if (error) {
      console.error('Failed to fetch products:', error)
      return
    }
    
    console.log(`📊 Found ${products.length} products without images\n`)
    
    let successCount = 0
    
    for (const product of products) {
      console.log(`🔄 Processing: ${product.name}`)
      
      // Get appropriate image based on category
      const category = getProductCategory(product.name)
      const imageUrl = categoryImages[category]
      console.log(`  📂 Category: ${category}`)
      
      // Upload to Supabase
      const uploadedUrl = await uploadImageToSupabase(imageUrl, product.sku)
      
      if (uploadedUrl) {
        // Update product
        const { error: updateError } = await supabase
          .from('products')
          .update({ 
            images: [uploadedUrl]
          })
          .eq('id', product.id)
        
        if (!updateError) {
          successCount++
          console.log(`  ✅ Image added successfully\n`)
        } else {
          console.error(`  ❌ Failed to update product:`, updateError.message)
        }
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    
    console.log('='.repeat(50))
    console.log(`✅ Complete!`)
    console.log(`📊 Successfully updated: ${successCount}/${products.length} products`)
    console.log('='.repeat(50))
    
  } catch (error) {
    console.error('❌ Fatal error:', error)
  }
}

// Run the script
addSampleImages()