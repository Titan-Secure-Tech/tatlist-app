#!/usr/bin/env bun
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Initialize Square client
const isProduction = process.env.NODE_ENV === 'production'

const accessToken = isProduction
  ? process.env.SQUARE_PRODUCTION_ACCESS_TOKEN!
  : process.env.SQUARE_SANDBOX_ACCESS_TOKEN!

const SQUARE_LOCATION_ID = isProduction
  ? process.env.SQUARE_PRODUCTION_LOCATION_ID!
  : process.env.SQUARE_SANDBOX_LOCATION_ID!

console.log('🔄 Initializing Square API')
console.log('- Environment:', isProduction ? 'Production' : 'Sandbox')
console.log('- Token length:', accessToken?.length)
console.log('- Token ends with:', accessToken?.substring(accessToken.length - 5))
console.log('- Location ID:', SQUARE_LOCATION_ID)

// Type definitions for Square API responses (supporting both camelCase and snake_case)
interface SquareItemData {
  name?: string
  description?: string
  categoryId?: string
  category_id?: string
  imageIds?: string[]
  image_ids?: string[]
  variations?: SquareVariation[]
}

interface SquareVariation {
  id?: string
  itemVariationData?: SquareItemVariationData
  item_variation_data?: SquareItemVariationData
  isDeleted?: boolean
  is_deleted?: boolean
  presentAtLocationIds?: string[]
  present_at_location_ids?: string[]
}

interface SquareItemVariationData {
  name?: string
  sku?: string
  priceMoney?: SquareMoney
  price_money?: SquareMoney
  trackInventory?: boolean
  track_inventory?: boolean
  availableForSale?: boolean
  available_for_sale?: boolean
}

interface SquareMoney {
  amount?: bigint
  currency?: string
}

interface SquareProduct {
  id: string
  itemData?: SquareItemData
  item_data?: SquareItemData
  isDeleted?: boolean
  is_deleted?: boolean
  presentAtLocationIds?: string[]
  present_at_location_ids?: string[]
  presentAtAllLocations?: boolean
  present_at_all_locations?: boolean
  updatedAt?: string
  updated_at?: string
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
    // Fetch all products from Square using fetch API with pagination (SDK has auth issues with Bun)
    console.log('📦 Fetching products from Square...')
    console.log(
      'Using direct API call with token ending:',
      accessToken?.substring(accessToken.length - 5)
    )

    // Paginate through all catalog items
    let allSquareProducts: SquareProduct[] = []
    let cursor: string | undefined = undefined
    let pageCount = 0

    do {
      const apiUrl = cursor
        ? `https://connect.squareup.com/v2/catalog/list?types=ITEM&cursor=${cursor}`
        : 'https://connect.squareup.com/v2/catalog/list?types=ITEM'

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Square-Version': '2025-01-23',
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Square API error: ${JSON.stringify(errorData)}`)
      }

      const catalogResponse = await response.json()
      pageCount++

      if (catalogResponse.objects && catalogResponse.objects.length > 0) {
        allSquareProducts = allSquareProducts.concat(catalogResponse.objects as SquareProduct[])
        console.log(
          `  Page ${pageCount}: Fetched ${catalogResponse.objects.length} items (total: ${allSquareProducts.length})`
        )
      }

      cursor = catalogResponse.cursor
    } while (cursor)

    if (allSquareProducts.length === 0) {
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

    const squareProducts = allSquareProducts
    console.log(`\nFound ${squareProducts.length} total products in Square\n`)

    let syncedCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Process each product
    for (const product of squareProducts) {
      try {
        // Skip deleted products or products not at this location
        if (product.isDeleted) {
          console.log(`Skipping ${product.id} - deleted`)
          continue
        }

        // Check location availability - accept all products for now
        // TODO: Filter by location once we confirm correct location ID
        const atAllLocations = product.presentAtAllLocations || product.present_at_all_locations
        const locationIds = product.presentAtLocationIds || product.present_at_location_ids
        console.log(
          `${product.id} location - atAll: ${atAllLocations}, ids: ${JSON.stringify(locationIds)}`
        )

        // Support both camelCase and snake_case from API
        const itemData = product.itemData || product.item_data
        if (!itemData) {
          console.log(`Skipping ${product.id} - no item data`)
          continue
        }

        console.log(`Processing: ${itemData.name}`)

        // Get product images if available
        const imageUrls: string[] = []
        const imageIds = itemData.imageIds || itemData.image_ids || []
        if (imageIds.length > 0) {
          for (const imageId of imageIds) {
            try {
              const imageResponse = await fetch(
                `https://connect.squareup.com/v2/catalog/object/${imageId}`,
                {
                  method: 'GET',
                  headers: {
                    'Square-Version': '2025-01-23',
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                  },
                }
              )
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
        const allVariations = itemData.variations || []
        // Accept all non-deleted variations (location filtering happens at product level)
        const activeVariations = allVariations.filter(v => {
          const isDeleted = v.isDeleted || v.is_deleted
          return !isDeleted
        })

        // Get the first variation for primary product data
        const primaryVariation = activeVariations[0]
        const primaryVarData =
          primaryVariation?.itemVariationData || primaryVariation?.item_variation_data
        if (!primaryVarData) {
          console.log(`Skipping ${itemData.name} - no active variations`)
          continue
        }

        // Build variations array for JSONB field
        for (const variation of activeVariations) {
          const varData = variation.itemVariationData || variation.item_variation_data
          if (varData) {
            const varPriceMoney = varData.priceMoney || varData.price_money
            variations.push({
              id: variation.id,
              name: varData.name || 'Default',
              sku: varData.sku || '',
              price: varPriceMoney ? Number(varPriceMoney.amount) / 100 : 0,
              currency: varPriceMoney?.currency || 'USD',
              trackInventory: varData.trackInventory ?? varData.track_inventory ?? false,
              availableForSale: varData.availableForSale ?? varData.available_for_sale ?? true,
            })
          }
        }

        // Get category name if available
        let category = 'Uncategorized'
        const categoryId = itemData.categoryId || itemData.category_id
        if (categoryId) {
          try {
            const categoryResponse = await fetch(
              `https://connect.squareup.com/v2/catalog/object/${categoryId}`,
              {
                method: 'GET',
                headers: {
                  'Square-Version': '2025-01-23',
                  Authorization: `Bearer ${accessToken}`,
                  'Content-Type': 'application/json',
                },
              }
            )
            if (categoryResponse.ok) {
              const categoryData = await categoryResponse.json()
              category = categoryData.object?.category_data?.name || 'Uncategorized'
            }
          } catch (err) {
            console.error(`Failed to fetch category ${categoryId}:`, err)
          }
        }

        // Prepare product data for Supabase
        const priceMoney = primaryVarData.priceMoney || primaryVarData.price_money
        const trackInventory =
          primaryVarData.trackInventory ?? primaryVarData.track_inventory ?? false
        const availableForSale =
          primaryVarData.availableForSale ?? primaryVarData.available_for_sale ?? true
        const updatedAt = product.updatedAt || product.updated_at

        const productData = {
          square_catalog_id: product.id,
          square_variation_id: primaryVariation.id,
          sku: primaryVarData.sku ? `${primaryVarData.sku}-${product.id.slice(-8)}` : product.id,
          name: itemData.name || 'Unknown Product',
          description: itemData.description || '',
          price: priceMoney ? Number(priceMoney.amount) / 100 : 0,
          images: imageUrls,
          category: category,
          brand: 'Square Import', // Default brand for Square imports
          in_stock: availableForSale !== false,
          stock_quantity: trackInventory ? null : 999, // null if tracking, high number if not
          variations: variations,
          sync_source: 'square',
          square_updated_at: updatedAt,
          tags: [],
        }

        // Upsert product to Supabase
        const { error } = await supabase.from('products').upsert(productData, {
          onConflict: 'square_catalog_id',
        })

        if (error) {
          throw error
        }

        console.log(`✅ Synced: ${itemData.name}`)
        syncedCount++
      } catch (error) {
        console.error(`❌ Failed to sync product ${product.id}:`, error)
        const productName = (product.itemData || product.item_data)?.name || product.id
        errors.push(`${productName}: ${error}`)
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
