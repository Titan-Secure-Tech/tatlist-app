#!/usr/bin/env bun

/**
 * Import Products with Relational Schema
 *
 * This script imports Lucky Supply and Kingpin products into the new relational schema.
 * It automatically creates/links vendors, collections, categories, subcategories, and tags.
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import {
  slugify,
  type Vendor,
  type Collection,
  type Category,
  type Subcategory,
  type Tag,
  type ProductInsert,
  type LuckySupplyProduct,
  type KingpinProduct,
  kingpinToProduct,
} from '../src/db/schema'

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// ============================================================================
// CACHE FOR LOOKUPS
// ============================================================================

const vendorCache = new Map<string, Vendor>()
const collectionCache = new Map<string, Collection>()
const categoryCache = new Map<string, Category>()
const tagCache = new Map<string, Tag>()

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get or create a vendor
 */
async function getOrCreateVendor(name: string): Promise<Vendor> {
  const slug = slugify(name)

  // Check cache
  if (vendorCache.has(slug)) {
    return vendorCache.get(slug)!
  }

  // Check database
  const { data: existing } = await supabase.from('vendors').select('*').eq('slug', slug).single()

  if (existing) {
    vendorCache.set(slug, existing)
    return existing
  }

  // Create new vendor
  const { data: newVendor, error } = await supabase
    .from('vendors')
    .insert({ slug, name })
    .select()
    .single()

  if (error) {
    console.error(`Error creating vendor ${name}:`, error)
    throw error
  }

  vendorCache.set(slug, newVendor)
  return newVendor
}

/**
 * Get or create a collection (top-level category)
 */
async function getOrCreateCollection(name: string): Promise<Collection> {
  const slug = slugify(name)

  if (collectionCache.has(slug)) {
    return collectionCache.get(slug)!
  }

  const { data: existing } = await supabase
    .from('collections')
    .select('*')
    .eq('slug', slug)
    .single()

  if (existing) {
    collectionCache.set(slug, existing)
    return existing
  }

  const { data: newCollection, error } = await supabase
    .from('collections')
    .insert({ slug, name })
    .select()
    .single()

  if (error) {
    console.error(`Error creating collection ${name}:`, error)
    throw error
  }

  collectionCache.set(slug, newCollection)
  return newCollection
}

/**
 * Get or create a category
 */
async function getOrCreateCategory(name: string, collectionId?: string): Promise<Category> {
  const slug = slugify(name)

  if (categoryCache.has(slug)) {
    return categoryCache.get(slug)!
  }

  const { data: existing } = await supabase.from('categories').select('*').eq('slug', slug).single()

  if (existing) {
    categoryCache.set(slug, existing)
    return existing
  }

  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({ slug, name, collection_id: collectionId })
    .select()
    .single()

  if (error) {
    console.error(`Error creating category ${name}:`, error)
    throw error
  }

  categoryCache.set(slug, newCategory)
  return newCategory
}

/**
 * Get or create a tag
 */
async function getOrCreateTag(name: string): Promise<Tag> {
  const slug = slugify(name)

  if (tagCache.has(slug)) {
    return tagCache.get(slug)!
  }

  const { data: existing } = await supabase.from('tags').select('*').eq('slug', slug).single()

  if (existing) {
    tagCache.set(slug, existing)
    return existing
  }

  const { data: newTag, error } = await supabase
    .from('tags')
    .insert({ slug, name })
    .select()
    .single()

  if (error) {
    console.error(`Error creating tag ${name}:`, error)
    throw error
  }

  tagCache.set(slug, newTag)
  return newTag
}

/**
 * Link product to tags
 */
async function linkProductTags(productId: string, tags: string[]) {
  const tagIds: string[] = []

  for (const tagName of tags) {
    const tag = await getOrCreateTag(tagName)
    tagIds.push(tag.id)
  }

  // Create product-tag links
  const productTags = tagIds.map(tagId => ({
    product_id: productId,
    tag_id: tagId,
  }))

  const { error } = await supabase
    .from('product_tags')
    .upsert(productTags, { onConflict: 'product_id,tag_id' })

  if (error) {
    console.error(`Error linking tags to product ${productId}:`, error)
  }
}

// ============================================================================
// IMPORT LUCKY SUPPLY PRODUCTS
// ============================================================================

async function importLuckySupplyProducts() {
  console.log('\n📦 Importing Lucky Supply products...')

  const jsonPath = path.join(process.cwd(), 'data', 'lucky-supply-reliable-complete.json')

  if (!fs.existsSync(jsonPath)) {
    console.log('⚠️  No Lucky Supply data found, skipping...')
    return
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  const products: LuckySupplyProduct[] = data.products || data
  console.log(`Found ${products.length} Lucky Supply products`)

  let imported = 0
  let failed = 0

  for (const luckyProduct of products) {
    try {
      // Get/create vendor
      const vendor = await getOrCreateVendor(luckyProduct.brand || 'Lucky Supply')

      // Get/create collection from "category" field (FireCrawl uses category, not type)
      let collection: Collection | undefined
      let category: Category | undefined

      if (luckyProduct.category) {
        collection = await getOrCreateCollection(luckyProduct.category)
        category = await getOrCreateCategory(luckyProduct.category, collection.id)
      }

      // Convert to internal format - FireCrawl products don't have Shopify IDs
      const productData: ProductInsert = {
        sku: luckyProduct.sku,
        name: luckyProduct.name,
        description: luckyProduct.description,
        price: luckyProduct.price,
        compare_at_price: luckyProduct.compare_at_price,
        images: luckyProduct.images || [],
        vendor_id: vendor.id,
        collection_id: collection?.id,
        category_id: category?.id,
        brand: luckyProduct.brand,
        category: luckyProduct.category,
        tags: luckyProduct.tags,
        in_stock: luckyProduct.in_stock,
        stock_quantity: luckyProduct.stock_quantity,
        sync_source: 'firecrawl',
        shopify_handle: luckyProduct.handle,
        variations: luckyProduct.variants?.map(
          (v: {
            id?: number | string
            title?: string
            sku?: string
            price: number
            available: boolean
            option1?: string
            option2?: string
            option3?: string
          }) => ({
            id: v.id?.toString() || '',
            name: v.option1 || v.title || 'Default',
            sku: v.sku,
            price: v.price,
            available: v.available,
            option1: v.option1,
            option2: v.option2,
            option3: v.option3,
          })
        ),
      }

      // Check if product already exists (by SKU)
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('sku', luckyProduct.sku)
        .single()

      if (existing) {
        // Update existing product
        const { error } = await supabase.from('products').update(productData).eq('id', existing.id)

        if (error) {
          console.error(`Error updating product ${luckyProduct.name}:`, error)
          failed++
          continue
        }

        // Link tags
        if (luckyProduct.tags && luckyProduct.tags.length > 0) {
          await linkProductTags(existing.id, luckyProduct.tags)
        }
      } else {
        // Insert new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single()

        if (error) {
          console.error(`Error inserting product ${luckyProduct.name}:`, error)
          failed++
          continue
        }

        // Link tags
        if (luckyProduct.tags && luckyProduct.tags.length > 0) {
          await linkProductTags(newProduct.id, luckyProduct.tags)
        }
      }

      imported++

      if (imported % 10 === 0) {
        console.log(`  ✓ Imported ${imported}/${products.length} products...`)
      }
    } catch (error) {
      console.error(`Failed to import ${luckyProduct.name}:`, error)
      failed++
    }
  }

  console.log(`\n✅ Lucky Supply import complete: ${imported} imported, ${failed} failed`)
}

// ============================================================================
// IMPORT KINGPIN PRODUCTS (if available)
// ============================================================================

async function importKingpinProducts() {
  console.log('\n📦 Importing Kingpin products...')

  const jsonPath = path.join(process.cwd(), 'data', 'kingpin-products.json')

  if (!fs.existsSync(jsonPath)) {
    console.log('⚠️  No Kingpin data found, skipping...')
    return
  }

  const products: KingpinProduct[] = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  console.log(`Found ${products.length} Kingpin products`)

  let imported = 0
  let failed = 0

  for (const kingpinProduct of products) {
    try {
      // Get/create vendor
      const vendor = await getOrCreateVendor(kingpinProduct.vendor)

      // Kingpin doesn't have a "type" field, so we'll use tags to determine category
      let category: Category | undefined
      if (kingpinProduct.tags && kingpinProduct.tags.length > 0) {
        // Use the first tag as category
        category = await getOrCreateCategory(kingpinProduct.tags[0])
      }

      // Convert to internal format
      const productData = kingpinToProduct(kingpinProduct, vendor.id, undefined, category?.id)

      // Check if product already exists (by shopify_product_id)
      const { data: existing } = await supabase
        .from('products')
        .select('id')
        .eq('shopify_product_id', kingpinProduct.id)
        .single()

      if (existing) {
        // Update existing product
        const { error } = await supabase.from('products').update(productData).eq('id', existing.id)

        if (error) {
          console.error(`Error updating product ${kingpinProduct.title}:`, error)
          failed++
          continue
        }

        // Link tags
        if (kingpinProduct.tags && kingpinProduct.tags.length > 0) {
          await linkProductTags(existing.id, kingpinProduct.tags)
        }
      } else {
        // Insert new product
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert(productData)
          .select('id')
          .single()

        if (error) {
          console.error(`Error inserting product ${kingpinProduct.title}:`, error)
          failed++
          continue
        }

        // Link tags
        if (kingpinProduct.tags && kingpinProduct.tags.length > 0) {
          await linkProductTags(newProduct.id, kingpinProduct.tags)
        }
      }

      imported++

      if (imported % 10 === 0) {
        console.log(`  ✓ Imported ${imported}/${products.length} products...`)
      }
    } catch (error) {
      console.error(`Failed to import ${kingpinProduct.title}:`, error)
      failed++
    }
  }

  console.log(`\n✅ Kingpin import complete: ${imported} imported, ${failed} failed`)
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  console.log('🚀 Starting relational product import...\n')

  try {
    await importLuckySupplyProducts()
    await importKingpinProducts()

    console.log('\n✅ All imports complete!')
    console.log('\nSummary:')
    console.log(`  Vendors: ${vendorCache.size}`)
    console.log(`  Collections: ${collectionCache.size}`)
    console.log(`  Categories: ${categoryCache.size}`)
    console.log(`  Tags: ${tagCache.size}`)
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

main()
