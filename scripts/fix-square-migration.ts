#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Use local Supabase instance
const supabase = createClient(
  'http://127.0.0.1:9521',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
)

async function fixSquareMigration() {
  console.log('🔧 Fixing Square integration columns...')
  
  try {
    // Add Square columns to products table
    console.log('Adding Square columns to products...')
    
    const productQueries = [
      `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS square_catalog_id TEXT;`,
      `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS square_variation_id TEXT;`,  
      `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS square_updated_at TIMESTAMPTZ;`,
      `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS variations JSONB DEFAULT '[]';`,
      `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sync_source TEXT DEFAULT 'manual';`
    ]
    
    for (const query of productQueries) {
      const { error } = await supabase.rpc('exec', { sql: query })
      if (error) console.error('Query error:', query, error)
    }
    
    // Add Square columns to orders table  
    console.log('Adding Square columns to orders...')
    
    const orderQueries = [
      `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS square_order_id TEXT;`,
      `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS square_payment_id TEXT;`,
      `ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS square_receipt_url TEXT;`
    ]
    
    for (const query of orderQueries) {
      const { error } = await supabase.rpc('exec', { sql: query })
      if (error) console.error('Query error:', query, error)  
    }
    
    // Create indexes
    console.log('Creating indexes...')
    
    const indexQueries = [
      `CREATE INDEX IF NOT EXISTS idx_products_square_catalog_id ON public.products(square_catalog_id);`,
      `CREATE INDEX IF NOT EXISTS idx_orders_square_order_id ON public.orders(square_order_id);`
    ]
    
    for (const query of indexQueries) {
      const { error } = await supabase.rpc('exec', { sql: query })
      if (error) console.error('Index error:', query, error)
    }
    
    // Test the columns
    console.log('Testing column access...')
    
    const { data, error } = await supabase
      .from('products')
      .select('square_catalog_id, variations, sync_source')
      .limit(1)
    
    if (error) {
      console.error('❌ Column test failed:', error)
    } else {
      console.log('✅ Square columns are working!')
    }
    
    console.log('✅ Square migration fixed successfully!')
    
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

fixSquareMigration()