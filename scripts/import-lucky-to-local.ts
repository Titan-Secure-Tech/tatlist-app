#!/usr/bin/env bun

/**
 * Import Lucky Supply data to local Supabase database
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'

// Local Supabase (from supabase start)
const localSupabase = createClient(
  'http://127.0.0.1:9521',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

interface LuckyProduct {
  name?: string
  sku?: string
  price?: number
  images?: string[]
  description?: string
  category?: string
  brand?: string
  in_stock?: boolean
  tags?: string[]
}

async function importLuckySupplyData() {
  try {
    console.log('🔄 Importing Lucky Supply data to local database...\n')

    // Try the most complete data file first
    const dataFiles = [
      'data/lucky-supply-reliable-complete.json',
      'data/lucky-supply-for-supabase.json',
      'data/lucky-supply-firecrawl-products.json',
    ]

    let rawData: string
    let dataFile: string

    for (const file of dataFiles) {
      try {
        rawData = await fs.readFile(path.join(process.cwd(), file), 'utf-8')
        dataFile = file
        console.log(`✅ Found data file: ${file}`)
        break
      } catch {
        console.log(`  ⚠️ Could not read ${file}`)
        continue
      }
    }

    if (!rawData! || !dataFile!) {
      throw new Error('No Lucky Supply data file found')
    }

     
    let data: unknown
    try {
      data = JSON.parse(rawData)
    } catch {
      throw new Error(`Failed to parse JSON from ${dataFile}`)
    }

    // Handle different data structures
    let products: LuckyProduct[]
    if (Array.isArray(data)) {
      products = data
    } else if (data.products && Array.isArray(data.products)) {
      products = data.products
    } else {
      throw new Error('Data file does not contain a products array')
    }

    console.log(`📊 Loaded ${products.length} products from ${dataFile}`)

    // Sample the data to understand its structure
    if (products.length > 0) {
      const sample = products[0]
      console.log('📋 Sample product structure:')
      console.log(`  • Name: ${sample.name || 'missing'}`)
      console.log(`  • SKU: ${sample.sku || 'missing'}`)
      console.log(`  • Price: ${sample.price || 'missing'}`)
      console.log(
        `  • Images: ${Array.isArray(sample.images) ? sample.images.length : 'missing/invalid'}`
      )
      console.log(`  • Brand: ${sample.brand || 'missing'}`)
    }

    // Clear existing local products
    console.log('\n🗑️ Clearing existing local products...')
    const { error: deleteError } = await localSupabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.warn('⚠️ Warning clearing local products:', deleteError.message)
    } else {
      console.log('✅ Local products cleared')
    }

    // Transform and insert products
    console.log(`\n📤 Transforming and inserting ${products.length} products...`)

    const transformedProducts = products
      .filter(product => product.name && product.name.trim()) // Filter out products without names
      .map((product, index) => ({
        sku: product.sku || `LUCKY-${index + 1}`,
        name: product.name!.trim(),
        description: product.description || '',
        price:
          typeof product.price === 'number'
            ? product.price
            : typeof product.price === 'string'
              ? parseFloat(product.price) || 0
              : 0,
        images: Array.isArray(product.images) ? product.images : [],
        category: product.category || 'Tattoo Supplies',
        brand: product.brand || 'Lucky Supply',
        in_stock: product.in_stock !== false, // Default to true unless explicitly false
        stock_quantity: product.in_stock !== false ? 10 : 0,
        tags: Array.isArray(product.tags) ? product.tags : [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))

    console.log(`📦 Transformed ${transformedProducts.length} valid products`)

    // Insert in batches
    const batchSize = 100
    let totalInserted = 0

    for (let i = 0; i < transformedProducts.length; i += batchSize) {
      const batch = transformedProducts.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(transformedProducts.length / batchSize)

      console.log(`  📦 Inserting batch ${batchNum}/${totalBatches} (${batch.length} products)...`)

      const { error: insertError } = await localSupabase.from('products').insert(batch)

      if (insertError) {
        console.error(`  ❌ Error inserting batch ${batchNum}:`, insertError.message)
        console.error('  Sample failing record:', JSON.stringify(batch[0], null, 2))
      } else {
        totalInserted += batch.length
        console.log(`  ✅ Batch ${batchNum} inserted successfully`)
      }
    }

    console.log(`\n🎉 Import complete!`)
    console.log(`📊 Summary:`)
    console.log(`  • Source file: ${dataFile}`)
    console.log(`  • Raw products: ${products.length}`)
    console.log(`  • Valid products: ${transformedProducts.length}`)
    console.log(`  • Successfully inserted: ${totalInserted}`)
    console.log(`  • Destination: Local Supabase`)

    if (totalInserted > 0) {
      console.log(`\n✨ Ready to sync to production with: bun run scripts/reset-production-db.ts`)
    }
  } catch (error) {
    console.error('❌ Import failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

importLuckySupplyData()
