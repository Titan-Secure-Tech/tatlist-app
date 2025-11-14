#!/usr/bin/env bun

/**
 * Update Square Import Products with Proper Categories
 *
 * This script updates all "Square Import" branded products to have the same
 * collection/category structure as Lucky Supply products
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

interface CategoryMapping {
  collection_slug: string
  category_slug: string
  keywords: string[]
  notes: string
}

// Define mapping rules based on product name keywords
const CATEGORY_MAPPINGS: CategoryMapping[] = [
  // TATTOO SUPPLIES - Needles
  {
    collection_slug: 'tattoo-supplies',
    category_slug: 'tattoo-needles',
    keywords: [
      'needle',
      'cartridge',
      'liner',
      'shader',
      'magnum',
      'mag ',
      ' mag',
      'bugpin',
      'supertight',
      'super tight',
      'super-tight',
    ],
    notes: 'Tattoo needles and cartridges',
  },

  // TATTOO SUPPLIES - Aftercare
  {
    collection_slug: 'tattoo-supplies',
    category_slug: 'tattoo-aftercare',
    keywords: ['glide', 'soap', 'lotion', 'aftercare', 'ointment', 'balm'],
    notes: 'Aftercare products and ointments',
  },

  // TATTOO SUPPLIES - Ink
  {
    collection_slug: 'tattoo-supplies',
    category_slug: 'tattoo-ink',
    keywords: ['ink', 'ink cap', 'pigment'],
    notes: 'Tattoo ink and ink caps',
  },

  // TATTOO SUPPLIES - Grips & Tubes
  {
    collection_slug: 'tattoo-supplies',
    category_slug: 'grips-tubes',
    keywords: ['grip', 'tube', 'disposable tube'],
    notes: 'Grips and tubes',
  },

  // TATTOO SUPPLIES - Markers & Stencils
  {
    collection_slug: 'tattoo-supplies',
    category_slug: 'tattoo-markers',
    keywords: ['marker', 'stencil', 'transfer paper', 'thermal fax', 'transfer'],
    notes: 'Markers and stencil supplies',
  },

  // TATTOO SUPPLIES - Cables & Cords
  {
    collection_slug: 'tattoo-supplies',
    category_slug: 'cables-cords',
    keywords: ['clipcord', 'clip cord', 'rca', 'cable', 'cord'],
    notes: 'Cables and cords',
  },

  // SHOP SUPPLIES - Safety & Hygiene
  {
    collection_slug: 'shop-supplies',
    category_slug: 'safety-hygiene',
    keywords: [
      'glove',
      'nitrile',
      'latex',
      'sterilization',
      'disinfectant',
      'sanitizer',
      'bactine',
    ],
    notes: 'Safety and hygiene products',
  },

  // SHOP SUPPLIES - Paper Supplies
  {
    collection_slug: 'shop-supplies',
    category_slug: 'paper-supplies',
    keywords: ['paper towel', 'dental bib', 'lap cloth', 'tissue'],
    notes: 'Paper supplies',
  },

  // SHOP SUPPLIES - Cleaning Supplies
  {
    collection_slug: 'shop-supplies',
    category_slug: 'cleaning-supplies',
    keywords: ['liqud lock', 'waste', 'cleaner', 'co-flex'],
    notes: 'Cleaning supplies',
  },

  // SHOP SUPPLIES - Books & Education
  {
    collection_slug: 'shop-supplies',
    category_slug: 'books-education',
    keywords: [
      'book',
      'sketchbook',
      'flash',
      'collection',
      'tattoo design',
      'art book',
      'acetate',
      'outline collection',
    ],
    notes: 'Books and educational materials',
  },

  // SHOP SUPPLIES - Bags & Storage
  {
    collection_slug: 'shop-supplies',
    category_slug: 'bags-storage',
    keywords: ['display box', 'case'],
    notes: 'Storage and display',
  },

  // SHOP SUPPLIES - Apparel
  {
    collection_slug: 'shop-supplies',
    category_slug: 'apparel',
    keywords: ['shirt', 't-shirt', 'apparel'],
    notes: 'Apparel',
  },

  // SHOP SUPPLIES - First Aid
  {
    collection_slug: 'shop-supplies',
    category_slug: 'first-aid',
    keywords: ['chapstick', 'first aid', 'bandage'],
    notes: 'First aid supplies',
  },
]

function inferCategory(
  productName: string
): { collection_slug: string; category_slug: string } | null {
  const nameLower = productName.toLowerCase()

  // Find the first matching category
  for (const mapping of CATEGORY_MAPPINGS) {
    if (mapping.keywords.some(keyword => nameLower.includes(keyword.toLowerCase()))) {
      return {
        collection_slug: mapping.collection_slug,
        category_slug: mapping.category_slug,
      }
    }
  }

  // Default: unmatched products go to shop supplies > bags-storage (catch-all for misc items)
  return {
    collection_slug: 'shop-supplies',
    category_slug: 'bags-storage',
  }
}

async function getCollectionAndCategoryIds() {
  // Get all collections
  const { data: collections, error: collError } = await supabase
    .from('collections')
    .select('id, slug')

  if (collError) {
    console.error('❌ Error fetching collections:', collError)
    throw collError
  }

  // Get all categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug, collection_id')

  if (catError) {
    console.error('❌ Error fetching categories:', catError)
    throw catError
  }

  const collectionMap = new Map<string, string>()
  const categoryMap = new Map<string, { id: string; collection_id: string }>()

  collections?.forEach(c => {
    collectionMap.set(c.slug, c.id)
  })

  categories?.forEach(c => {
    categoryMap.set(c.slug, { id: c.id, collection_id: c.collection_id })
  })

  return { collectionMap, categoryMap }
}

async function updateProducts() {
  console.log('🔄 Updating Square Import products...\n')

  // Get collection and category IDs
  const { collectionMap, categoryMap } = await getCollectionAndCategoryIds()

  console.log(`Found ${collectionMap.size} collections and ${categoryMap.size} categories\n`)

  // Get all Square Import products
  const { data: products, error: prodError } = await supabase
    .from('products')
    .select('id, name, category, brand')
    .eq('brand', 'Square Import')

  if (prodError) {
    console.error('❌ Error fetching products:', prodError)
    throw prodError
  }

  console.log(`Found ${products?.length || 0} Square Import products to update\n`)

  let updated = 0
  let failed = 0
  let unmapped = 0

  const categoryBreakdown = new Map<string, number>()

  for (const product of products || []) {
    // Infer category from product name
    const inferred = inferCategory(product.name)

    if (!inferred) {
      unmapped++
      console.log(`⚠️  Could not map: ${product.name}`)
      continue
    }

    // Get IDs
    const category = categoryMap.get(inferred.category_slug)

    if (!category) {
      unmapped++
      console.log(`⚠️  Category not found for ${inferred.category_slug}: ${product.name}`)
      continue
    }

    // Track breakdown
    const key = `${inferred.collection_slug} > ${inferred.category_slug}`
    categoryBreakdown.set(key, (categoryBreakdown.get(key) || 0) + 1)

    // Update product
    const { error: updateError } = await supabase
      .from('products')
      .update({
        collection_id: category.collection_id,
        category_id: category.id,
        category: inferred.category_slug, // Update the text category field too
      })
      .eq('id', product.id)

    if (updateError) {
      failed++
      console.error(`❌ Error updating ${product.name}:`, updateError.message)
    } else {
      updated++
      if (updated % 10 === 0) {
        console.log(`  ✓ Updated ${updated} products...`)
      }
    }
  }

  console.log(`\n✅ Updated ${updated} products`)
  if (failed > 0) console.log(`❌ Failed to update ${failed} products`)
  if (unmapped > 0) console.log(`⚠️  Could not map ${unmapped} products`)

  console.log('\n📊 Category Breakdown:')
  categoryBreakdown.forEach((count, category) => {
    console.log(`  ${category}: ${count}`)
  })
}

async function verifyUpdates() {
  console.log('\n\n🔍 Verifying updates...\n')

  // Check for remaining unmapped Square Import products
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('brand', 'Square Import')
    .or('collection_id.is.null,category_id.is.null')

  console.log(`Products still unmapped: ${count || 0}`)

  // Get collection breakdown
  const { data: breakdown } = await supabase
    .from('products_with_relationships')
    .select('collection_name, category_name')
    .eq('brand', 'Square Import')

  if (breakdown) {
    const collectionCounts = new Map<string, Map<string, number>>()

    breakdown.forEach(p => {
      const collection = p.collection_name || 'Unmapped'
      const category = p.category_name || 'Unmapped'

      if (!collectionCounts.has(collection)) {
        collectionCounts.set(collection, new Map())
      }

      const categoryMap = collectionCounts.get(collection)!
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1)
    })

    console.log('\n📦 Products by Collection & Category:')
    collectionCounts.forEach((categories, collection) => {
      console.log(`\n  ${collection}:`)
      categories.forEach((count, category) => {
        console.log(`    • ${category}: ${count}`)
      })
    })
  }
}

async function main() {
  console.log('🚀 Starting Square Import product categorization...\n')

  try {
    await updateProducts()
    await verifyUpdates()

    console.log('\n✅ Categorization complete!')
    console.log('\nNext steps:')
    console.log('  1. Visit /shop to see products with proper categories')
    console.log('  2. Check that Square Import products are now grouped correctly')
  } catch (error) {
    console.error('\n❌ Update failed:', error)
    process.exit(1)
  }
}

main()
