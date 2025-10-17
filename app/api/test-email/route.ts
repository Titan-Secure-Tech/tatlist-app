import { NextRequest, NextResponse } from 'next/server'
import { mailgunService } from '@/lib/email/mailgun'

export async function GET(request: NextRequest) {
  try {
    // This is a test endpoint - in production, you'd want to secure this
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    const type = searchParams.get('type') || 'confirmation'

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 })
    }

    let success = false

    if (type === 'confirmation') {
      // Send test order confirmation email
      success = await mailgunService.sendOrderConfirmation(email, {
        orderId: 'TEST-ORDER-123',
        customerName: 'Test Customer',
        items: [
          { name: 'Test Product 1', quantity: 2, price: 29.99 },
          { name: 'Test Product 2', quantity: 1, price: 49.99 },
        ],
        subtotal: 109.97,
        deliveryFee: 5.0,
        tax: 9.2,
        total: 124.17,
        deliveryAddress: {
          line1: '123 Test Street',
          line2: 'Apt 4B',
          city: 'Tampa',
          state: 'FL',
          postalCode: '33601',
        },
      })
    } else if (type === 'status') {
      // Send test status update email
      const status = (searchParams.get('status') || 'preparing') as
        | 'preparing'
        | 'ready'
        | 'out_for_delivery'
        | 'delivered'
        | 'cancelled'
      success = await mailgunService.sendOrderStatusUpdate(email, {
        orderId: 'TEST-ORDER-123',
        customerName: 'Test Customer',
        status,
        message: 'This is a test status update message',
        estimatedTime: '30 minutes',
      })
    } else if (type === 'contact') {
      // Send test contact form email to support@tatlist.com
      success = await mailgunService.sendContactFormEmail({
        name: 'Test Customer',
        email: email,
        phone: '+1 (555) 123-4567',
        subject: 'Test Support Inquiry',
        message:
          'This is a test support inquiry message sent via the contact form API. Please respond within 24 hours.',
      })
    } else if (type === 'privacy') {
      // Send test privacy inquiry email to privacy@tatlist.com
      success = await mailgunService.sendPrivacyInquiry({
        name: 'Test Customer',
        email: email,
        subject: 'Test Privacy Request',
        message:
          'This is a test privacy inquiry regarding data access and GDPR compliance. Please provide information on how my personal data is being used.',
      })
    } else {
      return NextResponse.json(
        { error: 'Invalid email type. Use: confirmation, status, contact, or privacy' },
        { status: 400 }
      )
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test ${type} email sent to ${email}`,
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send email. Check Mailgun configuration.',
        },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Test email error:', error)
    return NextResponse.json(
      { error: errorMessage || 'Failed to send test email' },
      { status: 500 }
    )
  }
}
