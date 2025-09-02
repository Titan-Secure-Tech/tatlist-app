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

async function testImportLuckyProducts() {
  try {
    // Load the Supabase-ready products
    const dataPath = path.join(process.cwd(), 'data', 'lucky-products-supabase.json')
    const productsContent = await fs.readFile(dataPath, 'utf-8')
    const allProducts = JSON.parse(productsContent)

    // Test with just the first 5 products
    const testProducts = allProducts.slice(0, 5)

    console.log(`Testing import with ${testProducts.length} products`)
    console.log('\nProducts to import:')
    testProducts.forEach((p: { name: string; sku: string; price: number }) => {
      console.log(`- ${p.name} (SKU: ${p.sku}, Price: $${p.price})`)
    })

    // Clear any existing test products first (optional)
    console.log('\nClearing existing test products...')
    const testSkus = testProducts.map((p: { sku: string }) => p.sku)
    const { error: deleteError } = await supabase.from('products').delete().in('sku', testSkus)

    if (deleteError) {
      console.warn('Could not clear existing products:', deleteError)
    }

    // Import test batch
    console.log('\nImporting test products...')
    const { data, error } = await supabase.from('products').insert(testProducts).select()

    if (error) {
      console.error('Import error:', error)
      return
    }

    console.log(`\n✅ Successfully imported ${data?.length || 0} products!`)

    // Verify the import
    console.log('\nVerifying import...')
    const { data: verifyData, error: verifyError } = await supabase
      .from('products')
      .select('*')
      .in('sku', testSkus)

    if (verifyError) {
      console.error('Verification error:', verifyError)
      return
    }

    console.log(`Found ${verifyData?.length || 0} products in database`)

    if (verifyData && verifyData.length > 0) {
      console.log('\nImported products:')
      verifyData.forEach(p => {
        console.log(`- ${p.name}`)
        console.log(`  SKU: ${p.sku}`)
        console.log(`  Price: $${p.price}`)
        console.log(`  Category: ${p.category}`)
        console.log(`  In Stock: ${p.in_stock}`)
      })
    }
  } catch (error) {
    console.error('Test import failed:', error)
  }
}

// Run the test import
testImportLuckyProducts().catch(console.error)
