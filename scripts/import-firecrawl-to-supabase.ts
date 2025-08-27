#!/usr/bin/env bun

/**
 * Import FireCrawl scraped Lucky Supply products to Supabase
 * Replaces CSV data with comprehensive scraped product information
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

interface FireCrawlProduct {
  sku: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  brand: string;
  in_stock: boolean;
  stock_quantity?: number;
  tags: string[];
  attachments: Array<{
    type: string;
    name: string;
    url: string;
    description?: string;
  }>;
  source_url: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function importFireCrawlProducts() {
  console.log('🔄 Starting FireCrawl product import to Supabase...\n')
  
  try {
    // Check if we have the Supabase format file
    const supabasePath = path.join(process.cwd(), 'data', 'lucky-supply-for-supabase.json')
    let products: FireCrawlProduct[] = [];
    
    try {
      const supabaseContent = await fs.readFile(supabasePath, 'utf-8')
      products = JSON.parse(supabaseContent)
      console.log(`📋 Loaded ${products.length} products from Supabase-ready file`)
    } catch (error) {
      // Fallback to complete results file
      const completePath = path.join(process.cwd(), 'data', 'lucky-supply-complete.json')
      const completeContent = await fs.readFile(completePath, 'utf-8')
      const completeResults = JSON.parse(completeContent)
      
      products = completeResults.products.map((product: any) => ({
        sku: product.sku,
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        category: product.category,
        brand: product.brand,
        in_stock: product.in_stock,
        stock_quantity: product.stock_quantity,
        tags: product.tags,
        attachments: product.attachments,
        source_url: product.source_url
      }))
      
      console.log(`📋 Loaded ${products.length} products from complete results file`)
    }
    
    if (products.length === 0) {
      console.error('❌ No products found to import!')
      console.log('Make sure to run the scraper first: bun run scripts/scrape-lucky-supply-full.ts')
      process.exit(1)
    }
    
    console.log(`🎯 Preparing to import ${products.length} FireCrawl products...\n`)
    
    // Show sample product
    const sampleProduct = products[0]
    console.log('📊 Sample product data:')
    console.log(`  • Name: ${sampleProduct.name}`)
    console.log(`  • SKU: ${sampleProduct.sku}`)
    console.log(`  • Price: $${sampleProduct.price}`)
    console.log(`  • Images: ${sampleProduct.images.length}`)
    console.log(`  • Attachments: ${sampleProduct.attachments.length}`)
    console.log(`  • Category: ${sampleProduct.category}`)
    console.log()
    
    // Clear existing products
    console.log('🗑️ Clearing existing products from database...')
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      
    if (deleteError) {
      console.error('❌ Error clearing existing products:', deleteError)
      throw deleteError
    }
    console.log('✅ Existing products cleared\n')
    
    // Insert products in batches
    const batchSize = 50
    let totalInserted = 0
    let totalImages = 0
    let totalAttachments = 0
    
    console.log(`📦 Importing products in batches of ${batchSize}...\n`)
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(products.length / batchSize)
      
      console.log(`⏳ Processing batch ${batchNum}/${totalBatches} (${batch.length} products)`)
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select()
        
      if (error) {
        console.error(`❌ Error inserting batch ${batchNum}:`, error)
        console.error('Sample product from failed batch:', batch[0])
        continue
      }
      
      const batchImages = batch.reduce((sum, p) => sum + p.images.length, 0)
      const batchAttachments = batch.reduce((sum, p) => sum + p.attachments.length, 0)
      
      totalInserted += data.length
      totalImages += batchImages
      totalAttachments += batchAttachments
      
      console.log(`✅ Batch ${batchNum} complete: ${data.length} products inserted`)
      console.log(`   📊 Progress: ${totalInserted}/${products.length} products (${Math.round((totalInserted / products.length) * 100)}%)`)
    }
    
    console.log('\n🎉 Import completed successfully!')
    console.log(`✅ Products imported: ${totalInserted}/${products.length}`)
    console.log(`🖼️ Total images: ${totalImages}`)
    console.log(`📎 Total attachments: ${totalAttachments}`)
    
    // Show database statistics
    const { data: dbProducts, error: countError } = await supabase
      .from('products')
      .select('id, name, brand, category, images, attachments', { count: 'exact' })
      
    if (!countError && dbProducts) {
      console.log('\n📈 Database Statistics:')
      console.log(`• Total products in database: ${dbProducts.length}`)
      
      // Category breakdown
      const categories = new Map<string, number>()
      dbProducts.forEach(product => {
        const count = categories.get(product.category) || 0
        categories.set(product.category, count + 1)
      })
      
      console.log(`• Categories (${categories.size}):`)
      Array.from(categories.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([category, count]) => {
          console.log(`  - ${category}: ${count} products`)
        })
      
      // Count products with images
      const productsWithImages = dbProducts.filter(p => p.images && p.images.length > 0).length
      console.log(`• Products with images: ${productsWithImages} (${Math.round((productsWithImages / dbProducts.length) * 100)}%)`)
      
      // Count products with attachments
      const productsWithAttachments = dbProducts.filter(p => p.attachments && p.attachments.length > 0).length
      console.log(`• Products with attachments: ${productsWithAttachments} (${Math.round((productsWithAttachments / dbProducts.length) * 100)}%)`)
    }
    
    console.log('\n🚀 Ready to use! Your products page will now show complete FireCrawl data.')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    
    if (error.code === 'ENOENT') {
      console.log('\n📁 FireCrawl data files not found!')
      console.log('Run the scraper first: bun run scripts/scrape-lucky-supply-full.ts')
    } else if (error.message.includes('connect')) {
      console.log('\n🔌 Database connection failed!')
      console.log('Make sure Supabase is running: bunx supabase start')
    }
    
    process.exit(1)
  }
}

async function showImportPreview() {
  console.log('🔍 FireCrawl Product Import Preview\n')
  
  try {
    const dataPath = path.join(process.cwd(), 'data', 'lucky-supply-for-supabase.json')
    const content = await fs.readFile(dataPath, 'utf-8')
    const products = JSON.parse(content) as FireCrawlProduct[]
    
    console.log(`📊 Found ${products.length} products ready for import\n`)
    
    // Show statistics
    const totalImages = products.reduce((sum, p) => sum + p.images.length, 0)
    const totalAttachments = products.reduce((sum, p) => sum + p.attachments.length, 0)
    const avgPrice = products.reduce((sum, p) => sum + p.price, 0) / products.length
    
    console.log('📈 Data Summary:')
    console.log(`• Products: ${products.length}`)
    console.log(`• Total images: ${totalImages}`)
    console.log(`• Total attachments: ${totalAttachments}`)
    console.log(`• Average price: $${avgPrice.toFixed(2)}`)
    console.log(`• Avg images per product: ${(totalImages / products.length).toFixed(1)}`)
    
    // Category breakdown
    const categories = new Map<string, number>()
    products.forEach(product => {
      const count = categories.get(product.category) || 0
      categories.set(product.category, count + 1)
    })
    
    console.log(`\n🏷️ Categories (${categories.size}):`)
    Array.from(categories.entries())
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  • ${category}: ${count} products`)
      })
    
    // Show sample products
    console.log('\n📋 Sample Products:')
    products.slice(0, 5).forEach((product, i) => {
      console.log(`${i + 1}. ${product.name}`)
      console.log(`   SKU: ${product.sku} | Price: $${product.price} | Images: ${product.images.length} | Attachments: ${product.attachments.length}`)
    })
    
    console.log('\n✅ Ready to import! Run with --import flag to proceed.')
    
  } catch (error) {
    console.log('❌ No FireCrawl data found yet.')
    console.log('Run the scraper first: bun run scripts/scrape-lucky-supply-full.ts')
  }
}

// Main execution
const shouldImport = process.argv.includes('--import')
const showPreview = process.argv.includes('--preview') || !shouldImport

if (showPreview && !shouldImport) {
  showImportPreview()
} else if (shouldImport) {
  importFireCrawlProducts()
} else {
  console.log('Usage:')
  console.log('  bun run scripts/import-firecrawl-to-supabase.ts --preview   # Show data preview')
  console.log('  bun run scripts/import-firecrawl-to-supabase.ts --import    # Import to database')
}