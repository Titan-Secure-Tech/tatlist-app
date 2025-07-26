import { createClient } from '@supabase/supabase-js'
import { loadProductsFromCSV } from '../lib/utils/csv-parser'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seedProducts() {
  console.log('Starting product seed...')
  
  try {
    // Load products from CSV
    const products = loadProductsFromCSV()
    console.log(`Loaded ${products.length} products from CSV`)
    
    // Clear existing products (optional - comment out if you want to append)
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all
      
    if (deleteError) {
      console.error('Error clearing products:', deleteError)
    }
    
    // Insert products in batches of 100
    const batchSize = 100
    for (let i = 0; i < products.length; i += batchSize) {
      const batch = products.slice(i, i + batchSize)
      
      const { data, error } = await supabase
        .from('products')
        .insert(batch)
        .select()
        
      if (error) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
      } else {
        console.log(`Inserted batch ${i / batchSize + 1} (${data?.length} products)`)
      }
    }
    
    console.log('Product seed completed!')
    
  } catch (error) {
    console.error('Seed failed:', error)
    process.exit(1)
  }
}

// Run the seed
seedProducts().then(() => {
  process.exit(0)
})