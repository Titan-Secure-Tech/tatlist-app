#!/usr/bin/env bun

/**
 * Check Black Eye Natural Products
 *
 * This script queries the database to see the current structure
 * of Black Eye Natural products imported from Square
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
  console.log('🔍 Checking Black Eye Natural products...\n')

  // Query products with "Square Import" or Black Eye in the name
  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, category, collection_id, category_id')
    .or('name.ilike.%black eye%,category.ilike.%square%')
    .order('name')

  if (error) {
    console.error('❌ Error fetching products:', error)
    process.exit(1)
  }

  console.log(`Found ${products?.length || 0} products:\n`)

  products?.forEach(p => {
    console.log(`Product: ${p.name}`)
    console.log(`  Category: ${p.category || 'NULL'}`)
    console.log(`  Collection ID: ${p.collection_id || 'NULL'}`)
    console.log(`  Category ID: ${p.category_id || 'NULL'}`)
    console.log('')
  })

  // Also check for any products where category is "Square Import"
  const { data: squareProducts, error: sqError } = await supabase
    .from('products')
    .select('id, name, category, collection_id, category_id')
    .eq('category', 'Square Import')

  if (sqError) {
    console.error('❌ Error fetching Square products:', sqError)
    process.exit(1)
  }

  console.log(`\n📦 Products with "Square Import" category: ${squareProducts?.length || 0}\n`)

  squareProducts?.forEach(p => {
    console.log(`Product: ${p.name}`)
    console.log(`  Category: ${p.category}`)
    console.log('')
  })
}

main()
