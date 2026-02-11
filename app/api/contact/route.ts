import { NextRequest, NextResponse } from 'next/server'
import { mailgunService } from '@/lib/email/mailgun'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields. Please fill out all required fields.' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const success = await mailgunService.sendContactFormEmail({
      name,
      email,
      phone,
      subject,
      message,
    })

    if (success) {
      return NextResponse.json({
        success: true,
        message: "Your message has been sent successfully. We'll get back to you soon!",
      })
    } else {
      return NextResponse.json(
        {
          error:
            'Failed to send message. Please try again or email us directly at support@tatlist.com',
        },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: errorMessage || 'Failed to process your request. Please try again.' },
      { status: 500 }
    )
  }
}
