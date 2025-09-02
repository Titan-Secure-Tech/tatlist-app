import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

// Load production environment variables
dotenv.config({ path: '.env.production.local' })

const PROD_SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const PROD_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!PROD_SUPABASE_URL || !PROD_SERVICE_KEY) {
  console.error('❌ Missing production Supabase configuration')
  console.error('Please ensure .env.production.local contains:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(PROD_SUPABASE_URL, PROD_SERVICE_KEY, {
  auth: {
    persistSession: false,
  },
})

async function confirmProduction() {
  console.log('\n⚠️  WARNING: This will import products to PRODUCTION database!')
  console.log(`🌐 Production URL: ${PROD_SUPABASE_URL}`)
  console.log('\nAre you sure you want to continue? (Type "yes" to confirm)')

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise(resolve => {
    readline.question('> ', (answer: string) => {
      readline.close()
      resolve(answer.toLowerCase() === 'yes')
    })
  })
}

async function importToProduction() {
  try {
    // Confirm production deployment
    const confirmed = await confirmProduction()
    if (!confirmed) {
      console.log('❌ Production import cancelled')
      return
    }

    console.log('\n🚀 Starting production import...')

    // Load the Supabase-ready products
    const dataPath = path.join(process.cwd(), 'data', 'lucky-products-supabase.json')
    const productsContent = await fs.readFile(dataPath, 'utf-8')
    const products = JSON.parse(productsContent)

    console.log(`📦 Found ${products.length} products to import`)

    // Check current products in production
    const { count: existingCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (existingCount && existingCount > 0) {
      console.log(`\n⚠️  Production database already has ${existingCount} products`)
      console.log('The import will use upsert to update existing products by SKU')
    }

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

      // Small delay between batches
      if (i + batchSize < products.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 PRODUCTION IMPORT SUMMARY')
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
      console.log('\n🔍 Verifying production import...')
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      if (!countError) {
        console.log(`✅ Total products in production database: ${count}`)
      }

      // Test a specific product
      const { data: testProduct } = await supabase
        .from('products')
        .select('name, sku, price')
        .eq('sku', 'KPAD092115')
        .single()

      if (testProduct) {
        console.log('\n✅ Sample product verification:')
        console.log(`  - Name: ${testProduct.name}`)
        console.log(`  - SKU: ${testProduct.sku}`)
        console.log(`  - Price: $${testProduct.price}`)
      }
    }
  } catch (error) {
    console.error('❌ Production import failed:', error)
    process.exit(1)
  }
}

// Run the production import
console.log('🏭 Lucky Supply to Supabase PRODUCTION Import Tool')
console.log('================================================\n')
importToProduction()
  .then(() => {
    console.log('\n✨ Production import process completed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
