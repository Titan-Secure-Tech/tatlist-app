#!/usr/bin/env bun

/**
 * List All Square Import Products
 *
 * Get a complete list of products with brand "Square Import"
 * to understand what needs to be categorized
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
  console.log('📦 Listing all Square Import products...\n')

  const { data: products, error } = await supabase
    .from('products')
    .select('id, name, category, brand, collection_id, category_id')
    .eq('brand', 'Square Import')
    .order('name')

  if (error) {
    console.error('❌ Error fetching products:', error)
    process.exit(1)
  }

  console.log(`Found ${products?.length || 0} Square Import products\n`)

  // Group by what appears to be the actual category based on product name
  const categorized = new Map<
    string,
    Array<{
      id: string
      name: string
      category: string | null
      brand: string | null
      collection_id: string | null
      category_id: string | null
    }>
  >()

  products?.forEach(p => {
    // Try to infer category from product name
    let inferredCategory = 'Other'

    const nameLower = p.name.toLowerCase()

    if (nameLower.includes('glide') || nameLower.includes('lotion') || nameLower.includes('soap')) {
      inferredCategory = 'Tattoo Aftercare / Ointments'
    } else if (
      nameLower.includes('needle') ||
      nameLower.includes('cartridge') ||
      nameLower.includes('liner') ||
      nameLower.includes('shader') ||
      nameLower.includes('magnum') ||
      nameLower.includes('mag ')
    ) {
      inferredCategory = 'Tattoo Needles'
    } else if (nameLower.includes('ink')) {
      inferredCategory = 'Tattoo Ink'
    } else if (nameLower.includes('grip') || nameLower.includes('tube')) {
      inferredCategory = 'Grips & Tubes'
    } else if (nameLower.includes('machine')) {
      inferredCategory = 'Tattoo Machines'
    } else if (nameLower.includes('power supply')) {
      inferredCategory = 'Power Supplies'
    } else if (nameLower.includes('glove')) {
      inferredCategory = 'Safety & Hygiene'
    }

    if (!categorized.has(inferredCategory)) {
      categorized.set(inferredCategory, [])
    }
    categorized.get(inferredCategory)!.push(p)
  })

  // Display grouped results
  categorized.forEach((products, category) => {
    console.log(`\n📁 ${category} (${products.length} products)`)
    products.forEach(p => {
      console.log(`  - ${p.name}`)
    })
  })

  // Summary
  console.log('\n\n📊 Summary:')
  categorized.forEach((products, category) => {
    console.log(`  ${category}: ${products.length}`)
  })
}

main()
