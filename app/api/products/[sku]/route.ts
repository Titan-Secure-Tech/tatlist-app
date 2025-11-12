import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ sku: string }> }) {
  try {
    const { sku } = await params
    const supabase = await createClient()

    const { data: product, error } = await supabase
      .from('products_with_relationships')
      .select('*')
      .eq('sku', sku)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
