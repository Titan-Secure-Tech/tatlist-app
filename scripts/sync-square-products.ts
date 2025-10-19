#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js'
import { SquareClient, SquareEnvironment } from 'square'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Debug environment loading
console.log('Environment check:')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('Has SQUARE_SANDBOX_ACCESS_TOKEN:', !!process.env.SQUARE_SANDBOX_ACCESS_TOKEN)
console.log('Token starts with:', process.env.SQUARE_SANDBOX_ACCESS_TOKEN?.substring(0, 10))

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Square client
const isProduction = process.env.NODE_ENV === 'production'

// Use environment variables for both production and sandbox
const accessToken = isProduction
  ? process.env.SQUARE_PRODUCTION_ACCESS_TOKEN!
  : process.env.SQUARE_SANDBOX_ACCESS_TOKEN!

const locationId = isProduction
  ? process.env.SQUARE_PRODUCTION_LOCATION_ID!
  : process.env.SQUARE_SANDBOX_LOCATION_ID!

console.log('Creating Square client with:')
console.log('- accessToken:', accessToken?.substring(0, 10) + '...')
console.log('- environment:', isProduction ? 'Production' : 'Sandbox')
console.log('- locationId:', locationId)

const squareClient = new SquareClient({
  accessToken,
  environment: isProduction ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
})

const SQUARE_LOCATION_ID = locationId

interface SquareProduct {
  id: string
  itemData?: {
    name?: string
    description?: string
    categoryId?: string
    imageIds?: string[]
    variations?: Array<{
      id?: string
      itemVariationData?: {
        name?: string
        sku?: string
        priceMoney?: {
          amount?: bigint
          currency?: string
        }
        trackInventory?: boolean
        availableForSale?: boolean
      }
      isDeleted?: boolean
      presentAtLocationIds?: string[]
    }>
  }
  isDeleted?: boolean
  presentAtLocationIds?: string[]
  updatedAt?: string
}

async function syncSquareProducts() {
  console.log('🔄 Starting Square to Supabase product sync...\n')

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
    // Fetch all products from Square
    console.log('📦 Fetching products from Square...')
    console.log('Using Square client with environment:', isProduction ? 'Production' : 'Sandbox')
    console.log('Square client config:', {
      environment: squareClient.environment,
      hasAccessToken: !!squareClient.accessToken,
    })

    const catalogResponse = await squareClient.catalog.list({
      types: 'ITEM',
    })

    if (!catalogResponse.result.objects || catalogResponse.result.objects.length === 0) {
      console.log('✅ No products found in Square catalog')
      console.log(
        '💡 Tip: First seed some products using: bun run scripts/seed-square-products.mjs'
      )

      // Update sync log as completed (no items to sync)
      await supabase
        .from('square_sync_logs')
        .update({
          status: 'completed',
          items_synced: 0,
          items_failed: 0,
          completed_at: new Date().toISOString(),
          metadata: {
            location_id: SQUARE_LOCATION_ID,
            environment: isProduction ? 'production' : 'sandbox',
            note: 'No products in catalog',
          },
        })
        .eq('id', syncLog?.id)

      return
    }

    const squareProducts = catalogResponse.result.objects as SquareProduct[]
    console.log(`Found ${squareProducts.length} products in Square\n`)

    let syncedCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Process each product
    for (const product of squareProducts) {
      try {
        // Skip deleted products or products not at this location
        if (product.isDeleted || !product.presentAtLocationIds?.includes(SQUARE_LOCATION_ID)) {
          continue
        }

        if (!product.itemData) {
          continue
        }

        // Get product images if available
        const imageUrls: string[] = []
        if (product.itemData.imageIds && product.itemData.imageIds.length > 0) {
          for (const imageId of product.itemData.imageIds) {
            try {
              const imageResponse = await squareClient.catalog.object.get(imageId)
              const imageUrl = imageResponse.result.object?.imageData?.url
              if (imageUrl) {
                imageUrls.push(imageUrl)
              }
            } catch (err) {
              console.error(`Failed to fetch image ${imageId}:`, err)
            }
          }
        }

        // Process variations
        const variations = []
        const activeVariations =
          product.itemData.variations?.filter(
            v => !v.isDeleted && v.presentAtLocationIds?.includes(SQUARE_LOCATION_ID)
          ) || []

        // Get the first variation for primary product data
        const primaryVariation = activeVariations[0]
        if (!primaryVariation?.itemVariationData) {
          console.log(`Skipping ${product.itemData.name} - no active variations`)
          continue
        }

        // Build variations array for JSONB field
        for (const variation of activeVariations) {
          if (variation.itemVariationData) {
            variations.push({
              id: variation.id,
              name: variation.itemVariationData.name || 'Default',
              sku: variation.itemVariationData.sku || '',
              price: variation.itemVariationData.priceMoney
                ? Number(variation.itemVariationData.priceMoney.amount) / 100
                : 0,
              currency: variation.itemVariationData.priceMoney?.currency || 'USD',
              trackInventory: variation.itemVariationData.trackInventory || false,
              availableForSale: variation.itemVariationData.availableForSale !== false,
            })
          }
        }

        // Get category name if available
        let category = 'Uncategorized'
        if (product.itemData.categoryId) {
          try {
            const categoryResponse = await squareClient.catalog.object.get(
              product.itemData.categoryId
            )
            category = categoryResponse.result.object?.categoryData?.name || 'Uncategorized'
          } catch (err) {
            console.error(`Failed to fetch category ${product.itemData.categoryId}:`, err)
          }
        }

        // Prepare product data for Supabase
        const productData = {
          square_catalog_id: product.id,
          square_variation_id: primaryVariation.id,
          sku: primaryVariation.itemVariationData.sku || product.id,
          name: product.itemData.name || 'Unknown Product',
          description: product.itemData.description || '',
          price: primaryVariation.itemVariationData.priceMoney
            ? Number(primaryVariation.itemVariationData.priceMoney.amount) / 100
            : 0,
          images: imageUrls,
          category: category,
          brand: 'Square Import', // Default brand for Square imports
          in_stock: primaryVariation.itemVariationData.availableForSale !== false,
          stock_quantity: primaryVariation.itemVariationData.trackInventory ? null : 999, // null if tracking, high number if not
          variations: variations,
          sync_source: 'square',
          square_updated_at: product.updatedAt,
          tags: [],
        }

        // Upsert product to Supabase
        const { error } = await supabase.from('products').upsert(productData, {
          onConflict: 'square_catalog_id',
        })

        if (error) {
          throw error
        }

        console.log(`✅ Synced: ${product.itemData.name}`)
        syncedCount++
      } catch (error) {
        console.error(`❌ Failed to sync product ${product.id}:`, error)
        errors.push(`${product.itemData?.name || product.id}: ${error}`)
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
          environment: isProduction ? 'production' : 'sandbox',
        },
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
syncSquareProducts()
  .then(() => {
    console.log('\n✨ Square product sync completed!')
    process.exit(0)
  })
  .catch(error => {
    console.error('Sync failed:', error)
    process.exit(1)
  })
