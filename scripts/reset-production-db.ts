#!/usr/bin/env bun

/**
 * Reset production database and populate with Lucky Supply data
 */

import { createClient } from '@supabase/supabase-js'

// Production configuration (hardcoded to ensure correct values)
const PRODUCTION_SUPABASE_URL = 'https://yzpiadsnllrycdfxlneb.supabase.co'
const PRODUCTION_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6cGlhZHNubGxyeWNkZnhsbmViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzQ2MTk3MywiZXhwIjoyMDY5MDM3OTczfQ.ACpxpS6U1_nIlxktAvGiUoUyozPRoPez-SXP1M9Zmb0'

// Local Supabase (from supabase start)
const localSupabase = createClient(
  'http://127.0.0.1:9521',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Production Supabase (using hardcoded production values)
const productionSupabase = createClient(PRODUCTION_SUPABASE_URL, PRODUCTION_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function resetProductionDatabase() {
  try {
    console.log('🔄 Resetting production database with Lucky Supply data...\n')

    console.log('🔍 Checking production database connection...')
    console.log(`  Production URL: ${PRODUCTION_SUPABASE_URL}`)
    console.log(`  Using service role: ${PRODUCTION_SERVICE_ROLE_KEY.slice(0, 20)}...`)

    // First, check current state of production
    const { data: currentProducts, error: checkError } = await productionSupabase
      .from('products')
      .select('*')
      .limit(3)

    if (checkError) {
      throw new Error(`Failed to connect to production: ${checkError.message}`)
    }

    console.log(`  Current products in production: ${currentProducts?.length || 0}`)

    // Check local database for Lucky Supply data
    console.log('\n📦 Checking local database for Lucky Supply data...')
    const { data: localProducts, error: localError } = await localSupabase
      .from('products')
      .select('*')
      .limit(3)

    if (localError) {
      console.error('❌ Error accessing local database:', localError)
      console.log('ℹ️ Make sure local Supabase is running with: bunx supabase start')
      return
    }

    console.log(`  Local products available: ${localProducts?.length || 0}`)

    if (!localProducts || localProducts.length === 0) {
      console.log('\n⚠️ No products found in local database!')
      console.log('We need to populate local database first with Lucky Supply data.')
      console.log('Run the scraping script first or import existing data.')
      return
    }

    // Sample check to see if we have Lucky Supply data
    const sample = localProducts[0]
    console.log('\n📊 Sample local product:')
    console.log(`  • Name: ${sample.name}`)
    console.log(`  • Brand: ${sample.brand}`)
    console.log(`  • SKU: ${sample.sku}`)

    const isLucky =
      sample.brand?.toLowerCase().includes('lucky') || sample.name?.toLowerCase().includes('lucky')

    if (!isLucky) {
      console.log('⚠️ Local data does not appear to be Lucky Supply data')
      console.log('Consider running the Lucky Supply import script first')
    }

    // Clear production database
    console.log('\n🗑️ Clearing production database...')
    const { error: deleteError } = await productionSupabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      throw new Error(`Failed to clear production: ${deleteError.message}`)
    }
    console.log('✅ Production database cleared')

    // Copy all data from local to production
    console.log('\n📤 Copying all products from local to production...')
    const { data: allLocalProducts, error: fetchAllError } = await localSupabase
      .from('products')
      .select('*')

    if (fetchAllError) {
      throw new Error(`Failed to fetch all local products: ${fetchAllError.message}`)
    }

    if (!allLocalProducts || allLocalProducts.length === 0) {
      throw new Error('No products to copy from local database')
    }

    // Prepare data for insertion
    const productsForInsert = allLocalProducts.map(product => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, ...productWithoutId } = product
      return {
        ...productWithoutId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    // Insert in batches
    const batchSize = 50
    let totalInserted = 0

    for (let i = 0; i < productsForInsert.length; i += batchSize) {
      const batch = productsForInsert.slice(i, i + batchSize)
      const batchNum = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(productsForInsert.length / batchSize)

      console.log(`📦 Inserting batch ${batchNum}/${totalBatches} (${batch.length} products)...`)

      const { error: insertError } = await productionSupabase.from('products').insert(batch)

      if (insertError) {
        console.error(`❌ Error inserting batch ${batchNum}:`, insertError.message)
      } else {
        totalInserted += batch.length
        console.log(`✅ Batch ${batchNum} inserted successfully`)
      }
    }

    console.log(`\n🎉 Production database reset complete!`)
    console.log(`📊 Summary:`)
    console.log(`  • Products copied: ${totalInserted}/${productsForInsert.length}`)
    console.log(`  • Source: Local Supabase`)
    console.log(`  • Destination: Production (${PRODUCTION_SUPABASE_URL})`)
  } catch (error) {
    console.error('❌ Reset failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

resetProductionDatabase()
