/**
 * Verify Code API Route
 *
 * POST /api/verification/verify-code
 * Verifies the code and marks the phone number as verified in the database
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PhoneVerificationService } from '@/lib/verification/phone-verification'

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { phoneNumber, code } = body

    if (!phoneNumber || !code) {
      return NextResponse.json(
        { error: 'Phone number and verification code are required' },
        { status: 400 }
      )
    }

    // Verify code
    const result = await PhoneVerificationService.verifyCode(phoneNumber, code)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    // Format phone number to E.164 format for storage
    let formattedPhone = phoneNumber.replace(/\D/g, '')
    if (formattedPhone.length === 10) {
      formattedPhone = '1' + formattedPhone
    }
    formattedPhone = '+' + formattedPhone

    // Update database - mark phone as verified
    const { error: updateError } = await supabase
      .from('customer_notification_preferences')
      .update({
        phone_number: formattedPhone,
        phone_verified: true,
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating phone verification status:', updateError)

      // If no preferences exist, create them
      if (updateError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('customer_notification_preferences')
          .insert({
            user_id: user.id,
            phone_number: formattedPhone,
            phone_verified: true,
            email_enabled: true,
            sms_enabled: true,
          })

        if (insertError) {
          console.error('Error creating notification preferences:', insertError)
          return NextResponse.json({ error: 'Failed to save verification status' }, { status: 500 })
        }
      } else {
        return NextResponse.json({ error: 'Failed to save verification status' }, { status: 500 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Phone number verified successfully',
    })
  } catch (error) {
    console.error('Error in verify-code API:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to verify code',
      },
      { status: 500 }
    )
  }
}
