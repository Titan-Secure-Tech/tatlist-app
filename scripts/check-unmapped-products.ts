#!/usr/bin/env bun

/**
 * Check Unmapped Products
 *
 * This script finds products that don't have collection_id or category_id set
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function main() {
  console.log('🔍 Checking for unmapped products...\n')

  // Query products without collection_id or category_id
  const { data: unmapped, error } = await supabase
    .from('products')
    .select('id, name, category, collection_id, category_id, brand, vendor_id')
    .or('collection_id.is.null,category_id.is.null')
    .order('name')
    .limit(50)

  if (error) {
    console.error('❌ Error fetching products:', error)
    process.exit(1)
  }

  console.log(`Found ${unmapped?.length || 0} unmapped products:\n`)

  // Group by category
  const byCategory = new Map<
    string,
    Array<{
      id: string
      name: string
      category: string | null
      collection_id: string | null
      category_id: string | null
      brand: string | null
      vendor_id: string | null
    }>
  >()

  unmapped?.forEach(p => {
    const cat = p.category || 'NO CATEGORY'
    if (!byCategory.has(cat)) {
      byCategory.set(cat, [])
    }
    byCategory.get(cat)!.push(p)
  })

  // Show grouped results
  byCategory.forEach((products, category) => {
    console.log(`\n📁 Category: "${category}" (${products.length} products)`)
    products.slice(0, 5).forEach(p => {
      console.log(`  - ${p.name}`)
      if (p.brand) console.log(`    Brand: ${p.brand}`)
    })
    if (products.length > 5) {
      console.log(`  ... and ${products.length - 5} more`)
    }
  })

  // Get count by brand if available
  const { data: byBrand, error: brandError } = await supabase
    .from('products')
    .select('brand')
    .or('collection_id.is.null,category_id.is.null')

  if (!brandError && byBrand) {
    const brandCount = new Map<string, number>()
    byBrand.forEach(p => {
      const brand = p.brand || 'unknown'
      brandCount.set(brand, (brandCount.get(brand) || 0) + 1)
    })

    console.log('\n\n📊 Unmapped products by brand:')
    brandCount.forEach((count, brand) => {
      console.log(`  ${brand}: ${count}`)
    })
  }
}

main()
