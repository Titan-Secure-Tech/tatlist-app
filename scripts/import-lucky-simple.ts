#!/usr/bin/env bun

/**
 * Simple import of Lucky Supply products using service role key
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface FireCrawlProduct {
  sku: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  brand: string
  in_stock: boolean
  tags: string[]
}

async function importLuckyProducts() {
  try {
    console.log('🔄 Starting Lucky Supply product import...\n')

    // Load FireCrawl data
    const dataPath = path.join(process.cwd(), 'public', 'firecrawl-products-supabase-ready.json')
    const rawData = await fs.readFile(dataPath, 'utf-8')
    const products: FireCrawlProduct[] = JSON.parse(rawData)

    console.log(`📋 Loaded ${products.length} products from FireCrawl data`)

    // Sample product
    if (products.length > 0) {
      const sample = products[0]
      console.log(`📊 Sample product: ${sample.name} (${sample.sku}) - $${sample.price}`)
      console.log(`   Brand: ${sample.brand} | Category: ${sample.category}`)
      console.log(`   Images: ${sample.images.length}\n`)
    }

    // Clear existing products using service role
    console.log('🗑️ Clearing existing products...')
    const { error: deleteError } = await supabase.from('products').delete().gte('id', 0) // Delete all rows

    if (deleteError) {
      console.error('❌ Delete error:', deleteError)
    } else {
      console.log('✅ Existing products cleared')
    }

    // Transform and insert products in batches
    console.log(`🚀 Importing ${products.length} products...`)
    const batchSize = 50
    let imported = 0

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      const transformedBatch = batch.map(product => ({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        price: product.price,
        images: product.images,
        category: product.category,
        brand: product.brand,
        in_stock: product.in_stock,
        stock_quantity: product.in_stock ? 10 : 0, // Default stock
        tags: product.tags || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

      const { error: insertError } = await supabase.from('products').insert(transformedBatch)

      if (insertError) {
        console.error(`❌ Error importing batch ${i + 1}-${i + batch.length}:`, insertError)
      } else {
        imported += batch.length
        console.log(
          `✅ Imported batch ${i + 1}-${Math.min(i + batchSize, products.length)} (${imported}/${products.length})`
        )
      }
    }

    console.log(`\n🎉 Import complete! Successfully imported ${imported} products`)
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the import
importLuckyProducts()
