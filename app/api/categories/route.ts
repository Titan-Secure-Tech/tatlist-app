import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const collectionId = searchParams.get('collection_id')

    const supabase = await createClient()
    let query = supabase
      .from('categories')
      .select('*, collection:collections(*)')
      .order('sort_order', { ascending: true })

    if (collectionId) {
      query = query.eq('collection_id', collectionId)
    }

    const { data: categories, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
