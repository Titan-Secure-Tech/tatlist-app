import { createClient } from '@supabase/supabase-js'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function importLuckyProducts() {
  try {
    // Load the Supabase-ready products
    const dataPath = path.join(process.cwd(), 'data', 'lucky-products-supabase.json')
    const productsContent = await fs.readFile(dataPath, 'utf-8')
    const products = JSON.parse(productsContent)
    
    console.log(`Found ${products.length} products to import`)
    
    // Import in batches
    const batchSize = 100
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      console.log(`\nImporting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(products.length / batchSize)}`)
      
      const { data, error } = await supabase
        .from('products')
        .upsert(batch, {
          onConflict: 'sku',
          ignoreDuplicates: false
        })
        .select()
      
      if (error) {
        console.error('Batch import error:', error)
        errorCount += batch.length
      } else {
        successCount += data?.length || 0
        console.log(`✓ Imported ${data?.length || 0} products`)
      }
    }
    
    console.log('\n=== Import Complete ===')
    console.log(`Successfully imported: ${successCount} products`)
    console.log(`Failed to import: ${errorCount} products`)
    
  } catch (error) {
    console.error('Import failed:', error)
  }
}

// Run the import
importLuckyProducts().catch(console.error)