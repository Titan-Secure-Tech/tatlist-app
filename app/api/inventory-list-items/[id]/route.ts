import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { quantity } = body

    if (typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ error: 'Quantity must be a positive number' }, { status: 400 })
    }

    // Verify the item belongs to the user before updating
    const { data: item, error: fetchError } = await supabase
      .from('inventory_list_items')
      .select('inventory_list_id, inventory_lists!inner(user_id)')
      .eq('id', id)
      .single()

    if (fetchError || !item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    // Check ownership - TypeScript doesn't know the joined table structure
    type ItemWithList = typeof item & {
      inventory_lists: { user_id: string }
    }
    if ((item as ItemWithList).inventory_lists.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update quantity
    const { data, error: updateError } = await supabase
      .from('inventory_list_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating inventory item:', updateError)
      return NextResponse.json({ error: 'Failed to update quantity' }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in PATCH /api/inventory-list-items/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
