#!/usr/bin/env bun

/**
 * Copy products from local Supabase to production
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Local Supabase (from supabase start)
const localSupabase = createClient(
  'http://127.0.0.1:9521',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

// Production Supabase
const productionSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function copyProducts() {
  try {
    console.log('🔄 Copying products from local to production...\n')

    // Get products from local database
    console.log('📥 Fetching products from local database...')
    const { data: localProducts, error: fetchError } = await localSupabase
      .from('products')
      .select('*')

    if (fetchError) {
      throw new Error(`Failed to fetch local products: ${fetchError.message}`)
    }

    if (!localProducts || localProducts.length === 0) {
      throw new Error('No products found in local database')
    }

    console.log(`✅ Found ${localProducts.length} products in local database`)

    // Sample product info
    const sample = localProducts[0]
    console.log(`📊 Sample product: ${sample.name} (${sample.sku || sample.id})`)
    console.log(`   Brand: ${sample.brand || 'N/A'} | Price: $${sample.price || 'N/A'}`)
    console.log(`   Images: ${Array.isArray(sample.images) ? sample.images.length : 'N/A'}\n`)

    // Clear production database
    console.log('🗑️ Clearing production database...')
    const { error: deleteError } = await productionSupabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all by using impossible UUID

    if (deleteError) {
      console.warn('⚠️ Delete warning:', deleteError.message)
    } else {
      console.log('✅ Production database cleared')
    }

    // Prepare products for insertion and deduplicate by SKU
    const skuMap = new Map()
    localProducts.forEach(product => {
      if (product.sku && !skuMap.has(product.sku)) {
        skuMap.set(product.sku, product)
      } else if (!product.sku) {
        // For products without SKU, use a unique identifier
        const uniqueKey = `${product.name}-${product.price}`
        if (!skuMap.has(uniqueKey)) {
          skuMap.set(uniqueKey, { ...product, sku: uniqueKey })
        }
      }
    })

    const uniqueProducts = Array.from(skuMap.values())
    console.log(
      `📦 Deduplicated: ${localProducts.length} → ${uniqueProducts.length} unique products`
    )

    const productsForInsert = uniqueProducts.map(product => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...productWithoutId } = product
      return {
        ...productWithoutId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    // Insert products in batches
    console.log(`🚀 Inserting ${productsForInsert.length} products to production...`)
    const batchSize = 50
    let totalInserted = 0

    for (let i = 0; i < productsForInsert.length; i += batchSize) {
      const batch = productsForInsert.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(productsForInsert.length / batchSize)

      console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} products)...`)

      const { error: insertError } = await productionSupabase.from('products').insert(batch)

      if (insertError) {
        console.error(`❌ Error inserting batch ${batchNum}:`, insertError.message)
      } else {
        totalInserted += batch.length
        console.log(`✅ Batch ${batchNum} inserted successfully`)
      }
    }

    console.log(`\n🎉 Copy complete! Successfully copied ${totalInserted} products to production`)
    console.log(`📊 Local products: ${localProducts.length}`)
    console.log(`📊 Production products: ${totalInserted}`)
  } catch (error) {
    console.error('❌ Copy failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

copyProducts()
