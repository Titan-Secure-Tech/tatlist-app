#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Use local Supabase instance
const supabase = createClient(
  'http://127.0.0.1:9521',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

// Category mapping based on product names/keywords
const categoryRules = [
  {
    category: 'Needle Cartridges',
    keywords: ['needle cartridge', 'cartridge', 'v2 needle cartridges'],
    priority: 1
  },
  {
    category: 'Traditional Needles', 
    keywords: ['needles by lucky supply', 'round liner needles', 'magnum needles', 'shader needles'],
    priority: 1
  },
  {
    category: 'Tattoo Glides & Soaps',
    keywords: ['tattoo glide', 'blackeye soap', 'soap', 'glide'],
    priority: 1
  },
  {
    category: 'Protective Gear',
    keywords: ['nitrile gloves', 'gloves', 'dental bibs', 'latex gloves'],
    priority: 1
  },
  {
    category: 'Books & References',
    keywords: ['book', 'sketchbook', 'collection', 'flash'],
    priority: 1
  },
  {
    category: 'Aftercare & Cleaning',
    keywords: ['aftercare', 'bactine', 'cleansing', 'display box'],
    priority: 1
  },
  {
    category: 'General Supplies',
    keywords: ['paper towel', 'razor', 'thermal fax', 'chapstick', 'co-flex'],
    priority: 0
  }
]

function categorizeProduct(name: string, description: string = ''): string {
  const searchText = `${name} ${description}`.toLowerCase()
  
  // Find matching category with highest priority
  let bestMatch = { category: 'Uncategorized', priority: -1 }
  
  for (const rule of categoryRules) {
    const hasMatch = rule.keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    )
    
    if (hasMatch && rule.priority > bestMatch.priority) {
      bestMatch = { category: rule.category, priority: rule.priority }
    }
  }
  
  return bestMatch.category
}

async function categorizeSquareProducts() {
  console.log('🏷️  Categorizing Square products based on names and descriptions...\n')
  
  try {
    // Get all Square products
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, description, category, sync_source')
      .eq('sync_source', 'square')
    
    if (error) throw error
    
    if (!products || products.length === 0) {
      console.log('No Square products found to categorize')
      return
    }
    
    console.log(`Found ${products.length} Square products to categorize\n`)
    
    const categoryStats: Record<string, number> = {}
    let updateCount = 0
    
    // Process each product
    for (const product of products) {
      const newCategory = categorizeProduct(product.name, product.description)
      
      if (newCategory !== product.category) {
        // Update the product category
        const { error: updateError } = await supabase
          .from('products')
          .update({ category: newCategory })
          .eq('id', product.id)
        
        if (updateError) {
          console.error(`❌ Failed to update ${product.name}:`, updateError)
        } else {
          console.log(`✅ ${product.name} → ${newCategory}`)
          updateCount++
        }
      }
      
      // Track category stats
      categoryStats[newCategory] = (categoryStats[newCategory] || 0) + 1
    }
    
    console.log('\n📊 Categorization Results:')
    console.log(`Updated ${updateCount} products\n`)
    
    console.log('Final Category Distribution:')
    Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, count]) => {
        console.log(`  ${category}: ${count} products`)
      })
    
  } catch (error) {
    console.error('❌ Error categorizing products:', error)
    process.exit(1)
  }
}

categorizeSquareProducts()
  .then(() => {
    console.log('\n✨ Product categorization completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Categorization failed:', error)
    process.exit(1)
  })