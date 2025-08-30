#!/usr/bin/env bun

/**
 * Verify production database has Lucky Supply products
 */

import { createClient } from '@supabase/supabase-js'

// Production Supabase (hardcoded to ensure correct connection)
const productionSupabase = createClient(
  'https://yzpiadsnllrycdfxlneb.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGlhZHNubGxyeWNkZnhsbmViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ2MTk3MywiZXhwIjoyMDY5MDM3OTczfQ.ACpxpS6U1_nIlxktAvGiUoUyozPRoPez-SXP1M9Zmb0',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function verifyProduction() {
  try {
    console.log('✅ Verifying production database after sync...\n')

    // Get total count
    const { count, error: countError } = await productionSupabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    console.log(`📊 Total products in production: ${count}`)

    // Get sample products
    const { data: products, error: productsError } = await productionSupabase
      .from('products')
      .select('*')
      .limit(5)

    if (productsError) {
      throw productsError
    }

    if (!products || products.length === 0) {
      console.log('⚠️ No products found in production database')
      return
    }

    console.log('\n📋 Sample products from production:')
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`)
      console.log(`   • SKU: ${product.sku}`)
      console.log(`   • Brand: ${product.brand}`)
      console.log(`   • Price: $${product.price}`)
      console.log(`   • Images: ${Array.isArray(product.images) ? product.images.length : 0}`)
      console.log(`   • Category: ${product.category}`)
      console.log('')
    })

    // Verify this is Lucky Supply data
    const luckySupplyCount = products.filter(
      p => p.brand?.toLowerCase().includes('lucky') || p.name?.toLowerCase().includes('lucky')
    ).length

    const hasLuckySupplyProducts = luckySupplyCount > 0
    console.log(`🔍 Data verification:`)
    console.log(`  • Lucky Supply branded products: ${luckySupplyCount}/${products.length}`)
    console.log(
      `  • Data source: ${hasLuckySupplyProducts ? '✅ LUCKY SUPPLY (correct)' : '❌ Not Lucky Supply'}`
    )

    if (count === 128 && hasLuckySupplyProducts) {
      console.log('\n🎉 SUCCESS: Production database correctly updated!')
      console.log('  • 128 Lucky Supply products synced')
      console.log('  • https://tatlist.vercel.app should now show Lucky Supply products')
    } else {
      console.log('\n⚠️ ISSUE: Production sync may be incomplete')
      console.log(`  • Expected: 128 Lucky Supply products`)
      console.log(`  • Found: ${count} products with Lucky Supply branding`)
    }
  } catch (error) {
    console.error('❌ Verification failed:', error instanceof Error ? error.message : error)
  }
}

verifyProduction()
