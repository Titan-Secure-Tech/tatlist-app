#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const testProducts = [
  {
    square_catalog_id: 'test-prod-1',
    sku: 'INK-BLK-1OZ',
    name: 'Classic Black Ink',
    description: 'Professional-grade black tattoo ink. Smooth consistency, deep black color.',
    price: 15.00,
    images: ['https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop'],
    category: 'Inks',
    brand: 'Tatlist Pro',
    in_stock: true,
    stock_quantity: 50,
    variations: [
      { id: 'var-1', name: '1oz Bottle', sku: 'INK-BLK-1OZ', price: 15.00, currency: 'USD' },
      { id: 'var-2', name: '2oz Bottle', sku: 'INK-BLK-2OZ', price: 25.00, currency: 'USD' },
      { id: 'var-3', name: '4oz Bottle', sku: 'INK-BLK-4OZ', price: 45.00, currency: 'USD' }
    ],
    sync_source: 'test',
    tags: ['ink', 'black', 'professional']
  },
  {
    square_catalog_id: 'test-prod-2',
    sku: 'MCH-ROT-BLK',
    name: 'Rotary Tattoo Machine',
    description: 'Professional rotary tattoo pen machine. Lightweight and versatile.',
    price: 350.00,
    images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=400&fit=crop'],
    category: 'Machines',
    brand: 'Tatlist Pro',
    in_stock: true,
    stock_quantity: 10,
    variations: [
      { id: 'var-4', name: 'Black', sku: 'MCH-ROT-BLK', price: 350.00, currency: 'USD' },
      { id: 'var-5', name: 'Silver', sku: 'MCH-ROT-SLV', price: 350.00, currency: 'USD' }
    ],
    sync_source: 'test',
    tags: ['machine', 'rotary', 'professional']
  },
  {
    square_catalog_id: 'test-prod-3',
    sku: 'NDL-5RL-50',
    name: 'Round Liner Needles',
    description: 'Premium stainless steel round liner needles. Sterile and individually packaged.',
    price: 35.00,
    images: ['https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=400&h=400&fit=crop'],
    category: 'Needles',
    brand: 'Tatlist Pro',
    in_stock: true,
    stock_quantity: 100,
    variations: [
      { id: 'var-6', name: '3RL (Box of 50)', sku: 'NDL-3RL-50', price: 35.00, currency: 'USD' },
      { id: 'var-7', name: '5RL (Box of 50)', sku: 'NDL-5RL-50', price: 35.00, currency: 'USD' },
      { id: 'var-8', name: '7RL (Box of 50)', sku: 'NDL-7RL-50', price: 35.00, currency: 'USD' }
    ],
    sync_source: 'test',
    tags: ['needles', 'liner', 'sterile']
  },
  {
    square_catalog_id: 'test-prod-4',
    sku: 'CARE-2OZ',
    name: 'Tattoo Aftercare Cream',
    description: 'Premium tattoo aftercare cream. Promotes healing and color retention.',
    price: 15.00,
    images: ['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop'],
    category: 'Aftercare',
    brand: 'Tatlist Pro',
    in_stock: true,
    stock_quantity: 75,
    variations: [
      { id: 'var-9', name: '2oz Jar', sku: 'CARE-2OZ', price: 15.00, currency: 'USD' },
      { id: 'var-10', name: '4oz Jar', sku: 'CARE-4OZ', price: 25.00, currency: 'USD' }
    ],
    sync_source: 'test',
    tags: ['aftercare', 'healing', 'cream']
  }
]

async function createTestProducts() {
  console.log('🧪 Creating test products for Square integration demo...\n')
  
  try {
    const { data, error } = await supabase
      .from('products')
      .upsert(testProducts, {
        onConflict: 'square_catalog_id'
      })
      .select()
    
    if (error) {
      throw error
    }
    
    console.log(`✅ Successfully created ${data?.length || 0} test products`)
    
    data?.forEach(product => {
      console.log(`  📦 ${product.name} - $${product.price}`)
    })
    
    console.log('\n🎉 Test products created successfully!')
    console.log('Visit http://localhost:7500/shop to see your products')
    
  } catch (error) {
    console.error('❌ Error creating test products:', error)
    process.exit(1)
  }
}

createTestProducts()