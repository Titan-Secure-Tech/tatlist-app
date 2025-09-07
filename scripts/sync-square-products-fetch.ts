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

// Use production credentials directly
const SQUARE_ACCESS_TOKEN = 'EAAAly7UztVyCCTgkb4K75u3-nqu0FBkS-gPiQQfOeJSgCSKTwgtu05L9_lvF921'
const SQUARE_LOCATION_ID = 'LQMAS99P4BA7N'
const SQUARE_BASE_URL = 'https://connect.squareup.com/v2'

interface SquareProduct {
  id: string
  type: string
  updated_at: string
  created_at: string
  version: number
  is_deleted: boolean
  present_at_all_locations?: boolean
  present_at_location_ids?: string[]
  item_data?: {
    name?: string
    description?: string
    category_id?: string
    image_ids?: string[]
    variations?: Array<{
      id?: string
      type?: string
      updated_at?: string
      created_at?: string
      version?: number
      is_deleted?: boolean
      present_at_location_ids?: string[]
      item_variation_data?: {
        name?: string
        sku?: string
        price_money?: {
          amount?: number
          currency?: string
        }
        track_inventory?: boolean
        available_for_sale?: boolean
      }
    }>
  }
}

async function fetchSquareProducts() {
  console.log('🔄 Fetching Square products using direct API calls...\n')

  // Create sync log
  const { data: syncLog } = await supabase
    .from('square_sync_logs')
    .insert({
      sync_type: 'products',
      status: 'started',
    })
    .select()
    .single()

  try {
    console.log('📦 Fetching catalog from Square API...')
    
    const response = await fetch(`${SQUARE_BASE_URL}/catalog/list?types=ITEM`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Square API error: ${response.status} - ${errorText}`)
    }

    const catalogData = await response.json()
    
    if (!catalogData.objects || catalogData.objects.length === 0) {
      console.log('✅ No products found in Square catalog')
      return
    }

    const squareProducts = catalogData.objects as SquareProduct[]
    console.log(`Found ${squareProducts.length} products in Square catalog\n`)

    let syncedCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Process each product
    for (const product of squareProducts) {
      try {
        // Skip deleted products or products not at this location
        if (product.is_deleted) {
          continue
        }

        // Check location presence
        const isAtLocation = product.present_at_all_locations || 
                           product.present_at_location_ids?.includes(SQUARE_LOCATION_ID)
        
        if (!isAtLocation) {
          continue
        }

        if (!product.item_data) {
          continue
        }

        // Get product images if available
        let imageUrls: string[] = []
        if (product.item_data.image_ids && product.item_data.image_ids.length > 0) {
          for (const imageId of product.item_data.image_ids) {
            try {
              const imageResponse = await fetch(`${SQUARE_BASE_URL}/catalog/object/${imageId}`, {
                headers: {
                  'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
                  'Content-Type': 'application/json',
                }
              })
              
              if (imageResponse.ok) {
                const imageData = await imageResponse.json()
                const imageUrl = imageData.object?.image_data?.url
                if (imageUrl) {
                  imageUrls.push(imageUrl)
                }
              }
            } catch (err) {
              console.error(`Failed to fetch image ${imageId}:`, err)
            }
          }
        }

        // Process variations
        const variations = []
        const activeVariations = product.item_data.variations?.filter(
          v => !v.is_deleted && (v.present_at_location_ids?.includes(SQUARE_LOCATION_ID) || product.present_at_all_locations)
        ) || []

        // Get the first variation for primary product data
        const primaryVariation = activeVariations[0]
        if (!primaryVariation?.item_variation_data) {
          console.log(`Skipping ${product.item_data.name} - no active variations`)
          continue
        }

        // Build variations array for JSONB field
        for (const variation of activeVariations) {
          if (variation.item_variation_data) {
            variations.push({
              id: variation.id,
              name: variation.item_variation_data.name || 'Default',
              sku: variation.item_variation_data.sku || '',
              price: variation.item_variation_data.price_money
                ? Number(variation.item_variation_data.price_money.amount) / 100
                : 0,
              currency: variation.item_variation_data.price_money?.currency || 'USD',
              track_inventory: variation.item_variation_data.track_inventory || false,
              available_for_sale: variation.item_variation_data.available_for_sale !== false,
            })
          }
        }

        // Get category name if available
        let category = 'Uncategorized'
        if (product.item_data.category_id) {
          try {
            const categoryResponse = await fetch(`${SQUARE_BASE_URL}/catalog/object/${product.item_data.category_id}`, {
              headers: {
                'Authorization': `Bearer ${SQUARE_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
              }
            })
            
            if (categoryResponse.ok) {
              const categoryData = await categoryResponse.json()
              category = categoryData.object?.category_data?.name || 'Uncategorized'
            }
          } catch (err) {
            console.error(`Failed to fetch category ${product.item_data.category_id}:`, err)
          }
        }

        // Prepare product data for Supabase
        const productData = {
          square_catalog_id: product.id,
          square_variation_id: primaryVariation.id,
          sku: primaryVariation.item_variation_data.sku || product.id,
          name: product.item_data.name || 'Unknown Product',
          description: product.item_data.description || '',
          price: primaryVariation.item_variation_data.price_money
            ? Number(primaryVariation.item_variation_data.price_money.amount) / 100
            : 0,
          images: imageUrls,
          category: category,
          brand: 'Square Import',
          in_stock: primaryVariation.item_variation_data.available_for_sale !== false,
          stock_quantity: primaryVariation.item_variation_data.track_inventory ? null : 999,
          variations: variations,
          sync_source: 'square',
          square_updated_at: product.updated_at,
          tags: [],
        }

        // Upsert product to Supabase
        const { error } = await supabase
          .from('products')
          .upsert(productData, {
            onConflict: 'square_catalog_id',
          })

        if (error) {
          throw error
        }

        console.log(`✅ Synced: ${product.item_data.name}`)
        syncedCount++
        
      } catch (error) {
        console.error(`❌ Failed to sync product ${product.id}:`, error)
        errors.push(`${product.item_data?.name || product.id}: ${error}`)
        failedCount++
      }
    }

    // Update sync log
    await supabase
      .from('square_sync_logs')
      .update({
        status: 'completed',
        items_synced: syncedCount,
        items_failed: failedCount,
        completed_at: new Date().toISOString(),
        error_details: errors.length > 0 ? errors.join('\n') : null,
        metadata: {
          location_id: SQUARE_LOCATION_ID,
          environment: 'production',
          total_found: squareProducts.length
        }
      })
      .eq('id', syncLog?.id)

    console.log('\n📊 Sync Summary:')
    console.log(`✅ Successfully synced: ${syncedCount} products`)
    console.log(`❌ Failed: ${failedCount} products`)
    
    if (errors.length > 0) {
      console.log('\n❌ Errors:')
      errors.forEach(err => console.log(`  - ${err}`))
    }

  } catch (error) {
    console.error('Fatal error during sync:', error)
    
    // Update sync log with failure
    if (syncLog) {
      await supabase
        .from('square_sync_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_details: String(error),
        })
        .eq('id', syncLog.id)
    }
    
    process.exit(1)
  }
}

// Run the sync
fetchSquareProducts()
  .then(() => {
    console.log('\n✨ Square product sync completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Sync failed:', error)
    process.exit(1)
  })