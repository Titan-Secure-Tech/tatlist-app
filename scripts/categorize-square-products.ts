#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Keyword mappings to collection slugs (order matters - more specific first)
const categoryMappings: { keywords: string[]; collectionSlug: string }[] = [
  // Needles & Cartridges
  {
    keywords: [
      'cartridge',
      'liner cartridge',
      'shader cartridge',
      'mag cartridge',
      'bugpin cartridge',
    ],
    collectionSlug: 'cartridge-needles',
  },
  {
    keywords: [
      'needle',
      'liner needle',
      'shader needle',
      'magnum needle',
      'round liner',
      'round shader',
    ],
    collectionSlug: 'tattoo-needles',
  },

  // Ink
  {
    keywords: [
      'solid ink',
      'ink 1oz',
      'ink 2oz',
      'ink 4oz',
      'tattoo ink',
      'black ink',
      'white ink',
      'color ink',
    ],
    collectionSlug: 'tattoo-ink',
  },

  // Equipment
  { keywords: ['tube', 'disposable tube', 'grip tube'], collectionSlug: 'tattoo-grips' },
  { keywords: ['power supply', 'power unit'], collectionSlug: 'power-supplies' },
  { keywords: ['clipcord', 'clip cord', 'clip-cord'], collectionSlug: 'clip-cords' },
  { keywords: ['rca', 'rca cord', 'rca cable'], collectionSlug: 'cables' },
  { keywords: ['foot switch', 'footswitch'], collectionSlug: 'foot-switches' },

  // Supplies
  { keywords: ['glove', 'nitrile', 'latex glove'], collectionSlug: 'gloves' },
  { keywords: ['ink cap', 'ink cups', 'hive cap', 'rinse cup'], collectionSlug: 'tattoo-supplies' },
  {
    keywords: ['barrier film', 'plastic wrap', 'machine bag', 'bottle bag', 'clip cord sleeve'],
    collectionSlug: 'bags',
  },
  {
    keywords: ['transfer paper', 'stencil', 'thermal fax', 'spirit'],
    collectionSlug: 'tattoo-supplies',
  },
  { keywords: ['razor', 'disposable razor'], collectionSlug: 'tattoo-supplies' },
  { keywords: ['rubber band'], collectionSlug: 'tattoo-supplies' },
  {
    keywords: ['gauze', 'bandage', 'drape sheet', 'pillow case', 'dental bib', 'lap cloth'],
    collectionSlug: 'tattoo-supplies',
  },
  { keywords: ['paper towel', 'wipe', 'caviwipe'], collectionSlug: 'shop-supplies' },

  // Aftercare & Cleaning
  {
    keywords: ['glide', 'tattoo glide', 'aftercare', 'healing', 'numb', 'bactine'],
    collectionSlug: 'aftercare',
  },
  { keywords: ['soap', 'green soap', 'cleansing'], collectionSlug: 'aftercare' },
  {
    keywords: ['disinfectant', 'cavicide', 'opti-cide', 'sanitizer'],
    collectionSlug: 'shop-supplies',
  },
  { keywords: ['witch hazel', 'rubbing alcohol'], collectionSlug: 'shop-supplies' },
  { keywords: ['autoclave', 'sterilization'], collectionSlug: 'sterilization-pouches' },

  // Books & Art
  {
    keywords: ['book', 'sketchbook', 'flash', 'collection', 'designs', 'art book'],
    collectionSlug: 'books',
  },

  // Apparel & Misc
  { keywords: ['shirt', 't-shirt', 'tshirt', 'apparel', 'bandana'], collectionSlug: 'apparel' },
  { keywords: ['marker', 'skin scribe'], collectionSlug: 'tattoo-markers' },
  { keywords: ['co-flex', 'coflex', 'tape'], collectionSlug: 'tattoo-supplies' },
  { keywords: ['arm rest', 'armrest'], collectionSlug: 'tattoo-supplies' },
  { keywords: ['department of health', 'sticker'], collectionSlug: 'shop-supplies' },

  // Catch-all for tattoo supplies
  { keywords: ['lucky supply', "lucky's", 'luckys'], collectionSlug: 'tattoo-supplies' },
]

async function categorizeProducts() {
  console.log('🏷️  Starting auto-categorization of Square products...\n')

  // Get all collections for ID lookup
  const { data: collections } = await supabase.from('collections').select('id, slug, name')

  if (!collections) {
    console.error('Failed to fetch collections')
    return
  }

  const collectionMap = new Map(collections.map(c => [c.slug, { id: c.id, name: c.name }]))

  // Get all uncategorized Square products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, category')
    .eq('sync_source', 'square')
    .is('collection_id', null)

  if (!products || products.length === 0) {
    console.log('✅ No uncategorized Square products found')
    return
  }

  console.log(`Found ${products.length} uncategorized Square products\n`)

  let categorized = 0
  let uncategorized = 0
  const updates: { id: string; collection_id: string; collectionName: string }[] = []
  const unmatched: string[] = []

  for (const product of products) {
    const nameLower = product.name.toLowerCase()
    let matched = false

    for (const mapping of categoryMappings) {
      if (mapping.keywords.some(kw => nameLower.includes(kw.toLowerCase()))) {
        const collection = collectionMap.get(mapping.collectionSlug)
        if (collection) {
          updates.push({
            id: product.id,
            collection_id: collection.id,
            collectionName: collection.name,
          })
          matched = true
          categorized++
          break
        }
      }
    }

    if (!matched) {
      unmatched.push(product.name)
      uncategorized++
    }
  }

  // Group updates by collection for logging
  const byCollection = new Map<string, string[]>()
  updates.forEach(u => {
    if (!byCollection.has(u.collectionName)) {
      byCollection.set(u.collectionName, [])
    }
    byCollection.get(u.collectionName)!.push(u.id)
  })

  console.log('📊 Categorization Summary:')
  byCollection.forEach((ids, name) => {
    console.log(`  - ${name}: ${ids.length} products`)
  })

  // Perform batch updates
  console.log('\n💾 Updating database...')

  for (const update of updates) {
    const { error } = await supabase
      .from('products')
      .update({ collection_id: update.collection_id })
      .eq('id', update.id)

    if (error) {
      console.error(`Failed to update ${update.id}:`, error.message)
    }
  }

  console.log(`\n✅ Categorized: ${categorized} products`)
  console.log(`⚠️  Uncategorized: ${uncategorized} products`)

  if (unmatched.length > 0 && unmatched.length <= 20) {
    console.log('\n📋 Unmatched products:')
    unmatched.forEach(name => console.log(`  - ${name}`))
  } else if (unmatched.length > 20) {
    console.log(`\n📋 First 20 unmatched products:`)
    unmatched.slice(0, 20).forEach(name => console.log(`  - ${name}`))
    console.log(`  ... and ${unmatched.length - 20} more`)
  }
}

categorizeProducts()
  .then(() => {
    console.log('\n✨ Categorization complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('Categorization failed:', err)
    process.exit(1)
  })
