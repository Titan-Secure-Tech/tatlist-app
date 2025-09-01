import { NextResponse } from 'next/server'
import { squareClient, SQUARE_LOCATION_ID } from '@/lib/square/client'
import type {
  SquareCatalogResponse,
  SquareRetrieveCatalogObjectResponse,
  SquareCatalogItemVariation,
} from '@/lib/types/square'

export async function GET() {
  try {
    const catalogResult: SquareCatalogResponse = await squareClient.catalog.listCatalog({
      types: 'ITEM',
    })

    const items = catalogResult?.objects || []

    const itemsWithImages = await Promise.all(
      items.map(
        async (item: {
          id?: string
          itemData?: {
            name?: string
            description?: string
            imageIds?: string[]
            variations?: unknown[]
            categoryId?: string
          }
          isDeleted?: boolean
          presentAtLocationIds?: string[]
        }) => {
          let imageUrl = null

          if (item.itemData?.imageIds && item.itemData.imageIds.length > 0) {
            try {
              const imageResponse: SquareRetrieveCatalogObjectResponse =
                await squareClient.catalog.retrieveCatalogObject({
                  objectId: item.itemData.imageIds[0],
                })
              imageUrl = imageResponse?.object?.imageData?.url || null
            } catch (error) {
              console.error('Error fetching image:', error)
            }
          }

          const variations = item.itemData?.variations || []
          const activeVariations = (
            variations as { isDeleted?: boolean; presentAtLocationIds?: string[] }[]
          ).filter(
            (v: { isDeleted?: boolean; presentAtLocationIds?: string[] }) =>
              !v.isDeleted && v.presentAtLocationIds?.includes(SQUARE_LOCATION_ID)
          )

          return {
            id: item.id,
            name: item.itemData?.name || 'Unknown Product',
            description: item.itemData?.description || '',
            category: item.itemData?.categoryId || null,
            imageUrl,
            variations: activeVariations.map((variation: SquareCatalogItemVariation) => ({
              id: variation.id,
              name: variation.itemVariationData?.name || 'Default',
              sku: variation.itemVariationData?.sku || '',
              price: variation.itemVariationData?.priceMoney
                ? Number(variation.itemVariationData.priceMoney.amount) / 100
                : 0,
              currency: variation.itemVariationData?.priceMoney?.currency || 'USD',
              trackInventory: variation.itemVariationData?.trackInventory || false,
              availableForSale: variation.itemVariationData?.availableForSale !== false,
              stockStatus: variation.itemVariationData?.trackInventory ? 'tracked' : 'in_stock',
            })),
            isDeleted: item.isDeleted || false,
            presentAtLocation: item.presentAtLocationIds?.includes(SQUARE_LOCATION_ID) || false,
          }
        }
      )
    )

    const activeItems = itemsWithImages.filter(
      (item: { isDeleted?: boolean; presentAtLocation?: boolean; variations?: unknown[] }) =>
        !item.isDeleted && item.presentAtLocation && item.variations && item.variations.length > 0
    )

    return NextResponse.json({
      products: activeItems,
      total: activeItems.length,
    })
  } catch (error) {
    console.error('Error fetching Square products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
