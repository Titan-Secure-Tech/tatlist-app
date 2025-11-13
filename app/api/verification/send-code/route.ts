/**
 * Send Verification Code API Route
 *
 * POST /api/verification/send-code
 * Sends a verification code to the provided phone number
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
    const { phoneNumber } = body

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Validate phone number format (basic check)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    // Send verification code
    const result = await PhoneVerificationService.sendVerificationCode(phoneNumber, user.id)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      expiresAt: result.expiresAt,
    })
  } catch (error) {
    console.error('Error in send-code API:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to send verification code',
      },
      { status: 500 }
    )
  }
}
