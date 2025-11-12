import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('collection_id')
    const categoryId = searchParams.get('category_id')
    const subcategoryId = searchParams.get('subcategory_id')
    const vendorId = searchParams.get('vendor_id')
    const inStockOnly = searchParams.get('in_stock') === 'true'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createClient()
    let query = supabase
      .from('products_with_relationships')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (collectionId) {
      query = query.eq('collection_id', collectionId)
    }

    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    if (subcategoryId) {
      query = query.eq('subcategory_id', subcategoryId)
    }

    if (vendorId) {
      query = query.eq('vendor_id', vendorId)
    }

    if (inStockOnly) {
      query = query.eq('in_stock', true)
    }

    const { data: products, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      products,
      total: count,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}
