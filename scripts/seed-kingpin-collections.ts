#!/usr/bin/env bun

/**
 * Seed Kingpin-style Collections and Map Products
 *
 * This script:
 * 1. Creates the three main collections (Tattoo Supplies, Shop Supplies, Piercing & Jewelry)
 * 2. Creates categories under each collection
 * 3. Maps Lucky Supply product categories to the new structure
 * 4. Updates all products with correct collection_id and category_id
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.log('Required:')
  console.log('  - NEXT_PUBLIC_SUPABASE_URL')
  console.log('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Collection {
  id?: string
  slug: string
  name: string
  description: string
  sort_order: number
}

interface Category {
  id?: string
  slug: string
  name: string
  description: string
  collection_id?: string
  sort_order: number
}

interface CategoryMapping {
  lucky_category: string
  tatlist_collection_slug: string
  tatlist_category_slug: string
  notes: string
}

// ============================================================================
// SEED DATA
// ============================================================================

const COLLECTIONS: Collection[] = [
  {
    slug: 'tattoo-supplies',
    name: 'Tattoo Supplies',
    description: 'Professional tattoo equipment, machines, needles, ink, and consumables',
    sort_order: 1,
  },
  {
    slug: 'shop-supplies',
    name: 'Shop Supplies',
    description: 'General shop materials, safety equipment, and accessories',
    sort_order: 2,
  },
  {
    slug: 'piercing-jewelry',
    name: 'Piercing & Jewelry',
    description: 'Body jewelry, piercing equipment, and related accessories',
    sort_order: 3,
  },
]

const CATEGORIES: Omit<Category, 'collection_id'>[] = [
  // TATTOO SUPPLIES
  {
    slug: 'tattoo-machines',
    name: 'Tattoo Machines',
    description: 'Rotary and coil tattoo machines',
    sort_order: 1,
  },
  {
    slug: 'tattoo-needles',
    name: 'Tattoo Needles',
    description: 'Cartridge needles and traditional needles',
    sort_order: 2,
  },
  {
    slug: 'tattoo-ink',
    name: 'Tattoo Ink',
    description: 'Tattoo pigments and ink sets',
    sort_order: 3,
  },
  {
    slug: 'power-supplies',
    name: 'Power Supplies',
    description: 'Tattoo power supplies and adapters',
    sort_order: 4,
  },
  {
    slug: 'grips-tubes',
    name: 'Grips & Tubes',
    description: 'Grips, tubes, and related accessories',
    sort_order: 5,
  },
  {
    slug: 'machine-parts',
    name: 'Machine Parts',
    description: 'Coils, screws, binding posts, and other parts',
    sort_order: 6,
  },
  {
    slug: 'cables-cords',
    name: 'Cables & Cords',
    description: 'Clip cords, cables, and adapters',
    sort_order: 7,
  },
  {
    slug: 'foot-switches',
    name: 'Foot Switches',
    description: 'Foot pedals and switches',
    sort_order: 8,
  },
  {
    slug: 'tattoo-markers',
    name: 'Markers & Stencils',
    description: 'Tattoo markers and flash sheets',
    sort_order: 9,
  },
  {
    slug: 'tattoo-aftercare',
    name: 'Aftercare & Ointments',
    description: 'Tattoo aftercare products and ointments',
    sort_order: 10,
  },

  // SHOP SUPPLIES
  {
    slug: 'safety-hygiene',
    name: 'Safety & Hygiene',
    description: 'Gloves, sterilization, and safety equipment',
    sort_order: 1,
  },
  {
    slug: 'cleaning-supplies',
    name: 'Cleaning Supplies',
    description: 'Detergents, waste bags, and cleaning products',
    sort_order: 2,
  },
  {
    slug: 'first-aid',
    name: 'First Aid',
    description: 'First aid supplies and emergency equipment',
    sort_order: 3,
  },
  {
    slug: 'paper-supplies',
    name: 'Paper Supplies',
    description: 'Paper sheets, watercolor blocks, and stationery',
    sort_order: 4,
  },
  {
    slug: 'bags-storage',
    name: 'Bags & Storage',
    description: 'Bags, cases, and storage solutions',
    sort_order: 5,
  },
  { slug: 'apparel', name: 'Apparel', description: 'Shop clothing and uniforms', sort_order: 6 },
  {
    slug: 'books-education',
    name: 'Books & Education',
    description: 'Educational books and reference materials',
    sort_order: 7,
  },

  // PIERCING & JEWELRY
  {
    slug: 'body-jewelry',
    name: 'Body Jewelry',
    description: 'Professional body jewelry and piercings',
    sort_order: 1,
  },
  {
    slug: 'nose-jewelry',
    name: 'Nose Jewelry',
    description: 'Nose studs, rings, and related jewelry',
    sort_order: 2,
  },
  {
    slug: 'specialty-jewelry',
    name: 'Specialty Jewelry',
    description: 'Unique and specialty jewelry pieces',
    sort_order: 3,
  },
]

const CATEGORY_MAPPINGS: CategoryMapping[] = [
  // Tattoo Supplies
  {
    lucky_category: 'Cartridge Needles',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-needles',
    notes: 'Cartridge-style needles',
  },
  {
    lucky_category: 'Tattoo Needles',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-needles',
    notes: 'Traditional needles',
  },
  {
    lucky_category: 'Ink',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-ink',
    notes: 'Tattoo ink and pigments',
  },
  {
    lucky_category: 'Tattoo Pigments',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-ink',
    notes: 'Tattoo pigments',
  },
  {
    lucky_category: 'Tattoo Machines',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-machines',
    notes: 'Complete tattoo machines',
  },
  {
    lucky_category: 'Tattoo Machine',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-machines',
    notes: 'Single tattoo machine',
  },
  {
    lucky_category: 'Tattoo Machine Parts',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Machine parts and accessories',
  },
  {
    lucky_category: 'Tattoo Machine Coils',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Coils for machines',
  },
  {
    lucky_category: 'Tattoo Coils',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Machine coils',
  },
  {
    lucky_category: 'Coils',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Generic coils',
  },
  {
    lucky_category: 'Coil Sets',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Sets of coils',
  },
  {
    lucky_category: 'Coil Set',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Coil set',
  },
  {
    lucky_category: 'Coil Wrap',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Coil wrapping material',
  },
  {
    lucky_category: 'Power Supplies',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'power-supplies',
    notes: 'Tattoo power supplies',
  },
  {
    lucky_category: 'Grips',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'grips-tubes',
    notes: 'Grips for machines',
  },
  {
    lucky_category: 'Clip Cords',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'cables-cords',
    notes: 'Clip cords',
  },
  {
    lucky_category: 'Cables',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'cables-cords',
    notes: 'Cables and connectors',
  },
  {
    lucky_category: 'Cable Adapter',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'cables-cords',
    notes: 'Cable adapters',
  },
  {
    lucky_category: 'Foot Switches',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'foot-switches',
    notes: 'Foot switches',
  },
  {
    lucky_category: 'Foot Switch',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'foot-switches',
    notes: 'Foot switch',
  },
  {
    lucky_category: 'Tattoo Markers',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-markers',
    notes: 'Tattoo markers',
  },
  {
    lucky_category: 'Markers',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-markers',
    notes: 'Generic markers',
  },
  {
    lucky_category: 'Flash Sheets',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-markers',
    notes: 'Flash and stencils',
  },
  {
    lucky_category: 'Tattoo Ointments',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-aftercare',
    notes: 'Aftercare ointments',
  },
  {
    lucky_category: 'Tattoo Care',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'tattoo-aftercare',
    notes: 'General tattoo care',
  },
  {
    lucky_category: 'Binding Posts',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Binding posts',
  },
  {
    lucky_category: 'Screws',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Screws for machines',
  },
  {
    lucky_category: 'Tube Vice Screw',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Tube vice screws',
  },
  {
    lucky_category: 'Tattoo Supplies',
    tatlist_collection_slug: 'tattoo-supplies',
    tatlist_category_slug: 'machine-parts',
    notes: 'Generic tattoo supplies',
  },

  // Shop Supplies
  {
    lucky_category: 'Gloves',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'safety-hygiene',
    notes: 'Disposable gloves',
  },
  {
    lucky_category: 'Sterilization Pouches',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'safety-hygiene',
    notes: 'Sterilization bags',
  },
  {
    lucky_category: 'Waste Bags',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'cleaning-supplies',
    notes: 'Waste disposal bags',
  },
  {
    lucky_category: 'Detergent',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'cleaning-supplies',
    notes: 'Cleaning detergents',
  },
  {
    lucky_category: 'First Aid',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'first-aid',
    notes: 'First aid supplies',
  },
  {
    lucky_category: 'Paper Sheets',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'paper-supplies',
    notes: 'Paper and sheets',
  },
  {
    lucky_category: 'Watercolor Block',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'paper-supplies',
    notes: 'Watercolor blocks',
  },
  {
    lucky_category: 'Books',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'books-education',
    notes: 'Educational books',
  },
  {
    lucky_category: 'Book',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'books-education',
    notes: 'Single book',
  },
  {
    lucky_category: 'Bags',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'bags-storage',
    notes: 'Bags and cases',
  },
  {
    lucky_category: 'Apparel',
    tatlist_collection_slug: 'shop-supplies',
    tatlist_category_slug: 'apparel',
    notes: 'Shop apparel',
  },

  // Piercing & Jewelry
  {
    lucky_category: 'Body Jewelry',
    tatlist_collection_slug: 'piercing-jewelry',
    tatlist_category_slug: 'body-jewelry',
    notes: 'Body jewelry',
  },
  {
    lucky_category: 'Jewelry',
    tatlist_collection_slug: 'piercing-jewelry',
    tatlist_category_slug: 'specialty-jewelry',
    notes: 'Generic jewelry',
  },
  {
    lucky_category: 'Nose Studs',
    tatlist_collection_slug: 'piercing-jewelry',
    tatlist_category_slug: 'nose-jewelry',
    notes: 'Nose studs',
  },
]

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

async function seedCollections() {
  console.log('\n📦 Creating collections...')

  const collectionMap = new Map<string, string>()

  for (const collection of COLLECTIONS) {
    const { data, error } = await supabase
      .from('collections')
      .upsert(collection, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creating collection ${collection.name}:`, error)
      throw error
    }

    collectionMap.set(collection.slug, data.id)
    console.log(`  ✓ ${collection.name}`)
  }

  console.log(`✅ Created ${COLLECTIONS.length} collections`)
  return collectionMap
}

async function seedCategories(collectionMap: Map<string, string>) {
  console.log('\n📂 Creating categories...')

  // Map category to collection based on content
  const categoryToCollection: Record<string, string> = {
    'tattoo-machines': 'tattoo-supplies',
    'tattoo-needles': 'tattoo-supplies',
    'tattoo-ink': 'tattoo-supplies',
    'power-supplies': 'tattoo-supplies',
    'grips-tubes': 'tattoo-supplies',
    'machine-parts': 'tattoo-supplies',
    'cables-cords': 'tattoo-supplies',
    'foot-switches': 'tattoo-supplies',
    'tattoo-markers': 'tattoo-supplies',
    'tattoo-aftercare': 'tattoo-supplies',
    'safety-hygiene': 'shop-supplies',
    'cleaning-supplies': 'shop-supplies',
    'first-aid': 'shop-supplies',
    'paper-supplies': 'shop-supplies',
    'bags-storage': 'shop-supplies',
    apparel: 'shop-supplies',
    'books-education': 'shop-supplies',
    'body-jewelry': 'piercing-jewelry',
    'nose-jewelry': 'piercing-jewelry',
    'specialty-jewelry': 'piercing-jewelry',
  }

  const categoryMap = new Map<string, string>()

  for (const category of CATEGORIES) {
    const collectionSlug = categoryToCollection[category.slug]
    const collectionId = collectionMap.get(collectionSlug)

    if (!collectionId) {
      console.error(`❌ No collection found for category ${category.slug}`)
      continue
    }

    const { data, error } = await supabase
      .from('categories')
      .upsert({ ...category, collection_id: collectionId }, { onConflict: 'slug' })
      .select()
      .single()

    if (error) {
      console.error(`❌ Error creating category ${category.name}:`, error)
      throw error
    }

    categoryMap.set(category.slug, data.id)
    console.log(`  ✓ ${category.name}`)
  }

  console.log(`✅ Created ${CATEGORIES.length} categories`)
  return categoryMap
}

async function mapProducts(collectionMap: Map<string, string>, categoryMap: Map<string, string>) {
  console.log('\n🗺️  Mapping products to collections and categories...')

  // Get all products with categories
  const { data: products, error: fetchError } = await supabase
    .from('products')
    .select('id, category')
    .not('category', 'is', null)

  if (fetchError) {
    console.error('❌ Error fetching products:', fetchError)
    throw fetchError
  }

  console.log(`Found ${products?.length || 0} products with categories`)

  let updated = 0
  let notMapped = 0
  const unmappedCategories = new Set<string>()

  for (const product of products || []) {
    // Find mapping for this product's category
    const mapping = CATEGORY_MAPPINGS.find(m => m.lucky_category === product.category)

    if (mapping) {
      const collectionId = collectionMap.get(mapping.tatlist_collection_slug)
      const categoryId = categoryMap.get(mapping.tatlist_category_slug)

      if (collectionId && categoryId) {
        const { error: updateError } = await supabase
          .from('products')
          .update({
            collection_id: collectionId,
            category_id: categoryId,
          })
          .eq('id', product.id)

        if (updateError) {
          console.error(`❌ Error updating product ${product.id}:`, updateError)
        } else {
          updated++
          if (updated % 10 === 0) {
            console.log(`  ✓ Mapped ${updated} products...`)
          }
        }
      }
    } else {
      notMapped++
      unmappedCategories.add(product.category)
    }
  }

  console.log(`\n✅ Mapped ${updated} products`)

  if (notMapped > 0) {
    console.log(`⚠️  ${notMapped} products not mapped (unmapped categories):`)
    unmappedCategories.forEach(cat => console.log(`     - ${cat}`))
  }

  return { updated, notMapped }
}

async function showStatistics() {
  console.log('\n📊 Database Statistics:')

  // Count collections
  const { count: collectionCount } = await supabase
    .from('collections')
    .select('*', { count: 'exact', head: true })
  console.log(`  Collections: ${collectionCount}`)

  // Count categories
  const { count: categoryCount } = await supabase
    .from('categories')
    .select('*', { count: 'exact', head: true })
  console.log(`  Categories: ${categoryCount}`)

  // Count products with mappings
  const { count: mappedProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .not('collection_id', 'is', null)
    .not('category_id', 'is', null)
  console.log(`  Products mapped: ${mappedProducts}`)

  // Show breakdown by collection
  const { data: collectionBreakdown } = await supabase
    .from('products_with_relationships')
    .select('collection_name')

  if (collectionBreakdown) {
    const breakdown = new Map<string, number>()
    collectionBreakdown.forEach(p => {
      if (p.collection_name) {
        const count = breakdown.get(p.collection_name) || 0
        breakdown.set(p.collection_name, count + 1)
      }
    })

    console.log('\n  Products by Collection:')
    breakdown.forEach((count, name) => {
      console.log(`    • ${name}: ${count}`)
    })
  }
}

async function main() {
  console.log('🚀 Starting Kingpin-style collection seed...\n')
  console.log('This will create:')
  console.log('  • 3 Collections (Tattoo Supplies, Shop Supplies, Piercing & Jewelry)')
  console.log('  • 20 Categories')
  console.log('  • Map ~130+ products to the new structure\n')

  try {
    // Create collections
    const collectionMap = await seedCollections()

    // Create categories
    const categoryMap = await seedCategories(collectionMap)

    // Map products
    await mapProducts(collectionMap, categoryMap)

    // Show statistics
    await showStatistics()

    console.log('\n✅ Seed complete!')
    console.log('\nNext steps:')
    console.log('  1. Visit /categories to see the new structure')
    console.log('  2. Update UI components to use collections/categories')
    console.log('  3. Implement filtering by collection → category')
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  }
}

main()
