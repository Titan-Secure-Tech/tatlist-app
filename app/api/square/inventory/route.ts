import { NextResponse } from 'next/server'
import { squareClient, SQUARE_LOCATION_ID } from '@/lib/square/client'

interface InventoryItem {
  quantity: number
  state: string
  locationId?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const catalogObjectIds = searchParams.get('ids')?.split(',') || []

  if (catalogObjectIds.length === 0) {
    return NextResponse.json({ counts: [] })
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { result } = await (squareClient.inventory as any).batchRetrieveInventoryCounts({
      catalogObjectIds,
      locationIds: [SQUARE_LOCATION_ID],
    })

    const counts = result.counts || []

    const inventoryMap = counts.reduce(
      (
        acc: Record<string, InventoryItem>,
        count: { catalogObjectId?: string; quantity?: string; state?: string; locationId?: string }
      ) => {
        if (count.catalogObjectId) {
          acc[count.catalogObjectId] = {
            quantity: Number(count.quantity || 0),
            state: count.state || 'NONE',
            locationId: count.locationId,
          }
        }
        return acc
      },
      {} as Record<string, InventoryItem>
    )

    return NextResponse.json({
      inventory: inventoryMap,
      counts: counts,
    })
  } catch (error) {
    console.error('Error fetching inventory:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory' }, { status: 500 })
  }
}
