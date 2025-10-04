import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user owns this list
    const { data: list, error: listError } = await supabase
      .from('favorites_lists')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (listError || !list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    const { data: items, error } = await supabase
      .from('favorites_list_items')
      .select(`
        *,
        products(*)
      `)
      .eq('favorites_list_id', id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { product_id } = await request.json()

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Verify user owns this list
    const { data: list, error: listError } = await supabase
      .from('favorites_lists')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (listError || !list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    // Add product to list
    const { data: item, error } = await supabase
      .from('favorites_list_items')
      .insert({
        favorites_list_id: id,
        product_id: product_id,
      })
      .select(`
        *,
        products(*)
      `)
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'Product already in this list' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { product_id } = await request.json()

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 })
    }

    // Verify user owns this list
    const { data: list, error: listError } = await supabase
      .from('favorites_lists')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (listError || !list) {
      return NextResponse.json({ error: 'List not found' }, { status: 404 })
    }

    // Remove product from list
    const { error } = await supabase
      .from('favorites_list_items')
      .delete()
      .eq('favorites_list_id', id)
      .eq('product_id', product_id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}