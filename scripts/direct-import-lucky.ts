import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

// Use the production Supabase instance if local is having issues
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:9521'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
  },
})

async function checkDatabaseConnection() {
  console.log('Checking database connection...')
  try {
    const { error } = await supabase.from('products').select('count').limit(1)

    if (error) {
      console.log('Products table does not exist, will create it')
      return false
    }

    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('Database connection failed:', error)
    return false
  }
}

async function importLuckyProducts() {
  try {
    // First check if we can connect
    await checkDatabaseConnection()

    // Load the Supabase-ready products
    const dataPath = path.join(process.cwd(), 'data', 'lucky-products-supabase.json')
    const productsContent = await fs.readFile(dataPath, 'utf-8')
    const products = JSON.parse(productsContent)

    console.log(`\n📦 Found ${products.length} products to import`)

    // Import in batches
    const batchSize = 50
    let successCount = 0
    let errorCount = 0
    const errors: Error[] = []

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(products.length / batchSize)

      console.log(`\n📤 Importing batch ${batchNumber}/${totalBatches} (${batch.length} products)`)

      try {
        const { data, error } = await supabase
          .from('products')
          .upsert(batch, {
            onConflict: 'sku',
            ignoreDuplicates: false,
          })
          .select()

        if (error) {
          console.error(`❌ Batch ${batchNumber} error:`, error.message)
          errorCount += batch.length
          errors.push({ batch: batchNumber, error: error.message })
        } else {
          const imported = data?.length || 0
          successCount += imported
          console.log(`✅ Batch ${batchNumber}: Imported ${imported} products`)
        }
      } catch (err) {
        console.error(`❌ Batch ${batchNumber} failed:`, err)
        errorCount += batch.length
        errors.push({ batch: batchNumber, error: String(err) })
      }

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 IMPORT SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Successfully imported: ${successCount} products`)
    console.log(`❌ Failed to import: ${errorCount} products`)
    console.log(`📦 Total products: ${products.length}`)

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:')
      errors.forEach(({ batch, error }) => {
        console.log(`  - Batch ${batch}: ${error}`)
      })
    }

    // Verify the import
    if (successCount > 0) {
      console.log('\n🔍 Verifying import...')
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      if (!countError) {
        console.log(`✅ Total products in database: ${count}`)
      }
    }
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Run the import
console.log('🚀 Lucky Supply to Supabase Import Tool')
console.log('=====================================\n')
importLuckyProducts()
  .then(() => {
    console.log('\n✨ Import process completed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
