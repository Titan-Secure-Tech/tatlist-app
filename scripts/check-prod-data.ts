#!/usr/bin/env bun

/**
 * Check what data is currently in production database
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Production Supabase (hardcoded URL to ensure we're hitting production)
const productionSupabase = createClient(
  'https://yzpiadsnllrycdfxlneb.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

async function checkProductionData() {
  try {
    console.log('🔍 Checking production database contents...\n')

    // Get products from production
    const { data: products, error: productsError } = await productionSupabase
      .from('products')
      .select('*')
      .limit(10) // Get more samples to verify

    if (productsError) {
      console.error('❌ Error fetching products:', productsError)
      return
    }

    console.log(`📦 Products in production: ${products?.length || 0}`)

    if (products && products.length > 0) {
      const sample = products[0]
      console.log('📊 Sample product:')
      console.log(`  • Name: ${sample.name || 'N/A'}`)
      console.log(`  • SKU: ${sample.sku || 'N/A'}`)
      console.log(`  • Brand: ${sample.brand || 'N/A'}`)
      console.log(`  • Price: $${sample.price || 'N/A'}`)
      console.log(`  • Images: ${Array.isArray(sample.images) ? sample.images.length : 'N/A'}`)

      // Check if this looks like Kingpin or Lucky Supply data
      const isKingpin =
        sample.brand?.toLowerCase().includes('kingpin') ||
        sample.name?.toLowerCase().includes('kingpin')
      const isLucky =
        sample.brand?.toLowerCase().includes('lucky') ||
        sample.name?.toLowerCase().includes('lucky')

      if (isKingpin) {
        console.log('  🔍 Data source: Appears to be KINGPIN SUPPLY (old data)')
      } else if (isLucky) {
        console.log('  🔍 Data source: Appears to be LUCKY SUPPLY (correct data)')
      } else {
        console.log('  🔍 Data source: Unknown/Mixed')
      }
    }

    console.log('\n📋 Production database status:')
    console.log(`  • Total products: ${products?.length || 0}`)
    console.log(`  • Database URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    console.log(`  • Using service role: ${!!process.env.SUPABASE_SERVICE_ROLE_KEY}`)
  } catch (error) {
    console.error('❌ Check failed:', error instanceof Error ? error.message : error)
  }
}

checkProductionData()
