import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import { Client } from 'pg'
import dotenv from 'dotenv'

// Load production environment variables
dotenv.config({ path: '.env.production.local' })

// Use the direct postgres connection
const connectionString = process.env.POSTGRES_URL_NON_POOLING || 
  'postgres://postgres.yzpiadsnllrycdfxlneb:zgWeo6GGh8eqFUMh@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require'

async function importViaPostgres() {
  console.log('🚀 Direct PostgreSQL Import Tool')
  console.log('================================\n')
  
  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })

  try {
    console.log('Connecting to production database...')
    await client.connect()
    console.log('✅ Connected to production PostgreSQL')

    // Load products
    const dataPath = path.join(process.cwd(), 'data', 'lucky-products-supabase.json')
    const productsContent = await fs.readFile(dataPath, 'utf-8')
    const products = JSON.parse(productsContent)
    
    console.log(`\n📦 Found ${products.length} products to import`)

    // Check if products table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      );
    `)
    
    if (!tableCheck.rows[0].exists) {
      console.error('❌ Products table does not exist in production')
      return
    }

    // Import in batches
    const batchSize = 50
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(products.length / batchSize)
      
      console.log(`\n📤 Importing batch ${batchNumber}/${totalBatches} (${batch.length} products)`)

      try {
        // Build the insert query with ON CONFLICT
        const values = batch.map((p: any, idx: number) => {
          const offset = idx * 10
          return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10})`
        }).join(', ')

        const query = `
          INSERT INTO public.products (
            sku, name, description, price, images, 
            category, brand, in_stock, stock_quantity, tags
          ) VALUES ${values}
          ON CONFLICT (sku) DO UPDATE SET
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            price = EXCLUDED.price,
            images = EXCLUDED.images,
            category = EXCLUDED.category,
            brand = EXCLUDED.brand,
            in_stock = EXCLUDED.in_stock,
            stock_quantity = EXCLUDED.stock_quantity,
            tags = EXCLUDED.tags,
            updated_at = NOW()
          RETURNING id;
        `

        const params = batch.flatMap((p: any) => [
          p.sku,
          p.name,
          p.description,
          p.price,
          p.images,
          p.category,
          p.brand,
          p.in_stock,
          p.stock_quantity,
          p.tags
        ])

        const result = await client.query(query, params)
        successCount += result.rowCount || 0
        console.log(`✅ Batch ${batchNumber}: Imported ${result.rowCount} products`)
      } catch (err) {
        console.error(`❌ Batch ${batchNumber} failed:`, err)
        errorCount += batch.length
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(50))
    console.log('📊 PRODUCTION IMPORT SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Successfully imported: ${successCount} products`)
    console.log(`❌ Failed to import: ${errorCount} products`)
    
    // Verify
    const countResult = await client.query('SELECT COUNT(*) FROM public.products')
    console.log(`\n✅ Total products in production: ${countResult.rows[0].count}`)

  } catch (error) {
    console.error('❌ Import failed:', error)
  } finally {
    await client.end()
    console.log('\n✨ Import process completed!')
  }
}

// Check if pg is installed
import('pg').then(() => {
  importViaPostgres()
}).catch(() => {
  console.log('Installing pg package...')
  require('child_process').execSync('bun add pg', { stdio: 'inherit' })
  console.log('Please run the script again')
})