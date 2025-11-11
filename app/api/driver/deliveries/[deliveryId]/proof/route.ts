import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/driver/deliveries/[deliveryId]/proof
 * Upload proof of delivery (photo and signature)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ deliveryId: string }> }
) {
  try {
    const { deliveryId } = await params
    const formData = await request.formData()

    const photo = formData.get('photo') as File | null
    const signatureData = formData.get('signatureData') as string | null
    const recipientName = formData.get('recipientName') as string | null
    const deliveryNotes = formData.get('deliveryNotes') as string | null

    const supabase = await createClient()

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a driver
    const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()

    if (!profile || profile.role !== 'driver') {
      return NextResponse.json({ error: 'Forbidden - Driver access required' }, { status: 403 })
    }

    // Verify delivery belongs to this driver
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .select('id, driver_id, order_id')
      .eq('id', deliveryId)
      .eq('driver_id', user.id)
      .single()

    if (deliveryError || !delivery) {
      return NextResponse.json({ error: 'Delivery not found or access denied' }, { status: 404 })
    }

    let photoUrl: string | null = null

    // Upload photo if provided
    if (photo) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${deliveryId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('delivery-proofs')
        .upload(filePath, photo, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        console.error('Error uploading photo:', uploadError)
        throw new Error('Failed to upload photo')
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('delivery-proofs').getPublicUrl(filePath)

      photoUrl = publicUrl
    }

    // Update delivery with proof of delivery
    const updateData: {
      proof_photo_url?: string
      proof_signature_data?: string
      recipient_name?: string
      delivery_notes?: string
      updated_at: string
    } = {
      updated_at: new Date().toISOString(),
    }

    if (photoUrl) updateData.proof_photo_url = photoUrl
    if (signatureData) updateData.proof_signature_data = signatureData
    if (recipientName) updateData.recipient_name = recipientName
    if (deliveryNotes) updateData.delivery_notes = deliveryNotes

    const { data: updatedDelivery, error: updateError } = await supabase
      .from('deliveries')
      .update(updateData)
      .eq('id', deliveryId)
      .eq('driver_id', user.id)
      .select()
      .single()

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({
      success: true,
      delivery: updatedDelivery,
      message: 'Proof of delivery uploaded successfully',
    })
  } catch (error) {
    console.error('Error uploading proof of delivery:', error)
    return NextResponse.json({ error: 'Failed to upload proof of delivery' }, { status: 500 })
  }
}
