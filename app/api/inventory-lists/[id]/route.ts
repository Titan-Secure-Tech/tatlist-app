import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listId = params.id

    // Verify the list belongs to the user before deleting
    const { data: existingList, error: fetchError } = await supabase
      .from('inventory_lists')
      .select('id, user_id')
      .eq('id', listId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingList) {
      return NextResponse.json(
        { error: 'Inventory list not found' },
        { status: 404 }
      )
    }

    // Delete the inventory list (CASCADE will handle list items)
    const { error: deleteError } = await supabase
      .from('inventory_lists')
      .delete()
      .eq('id', listId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Delete error:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete inventory list' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}