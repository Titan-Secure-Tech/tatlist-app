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

    // Prepare email HTML
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .message-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #000; }
            .field { margin-bottom: 15px; }
            .field-label { font-weight: bold; color: #666; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="message-box">
                <div class="field">
                  <div class="field-label">From:</div>
                  <div>${name}</div>
                </div>

                <div class="field">
                  <div class="field-label">Email:</div>
                  <div><a href="mailto:${email}">${email}</a></div>
                </div>

                ${
                  phone
                    ? `
                <div class="field">
                  <div class="field-label">Phone:</div>
                  <div>${phone}</div>
                </div>
                `
                    : ''
                }

                <div class="field">
                  <div class="field-label">Subject:</div>
                  <div>${subject}</div>
                </div>

                <div class="field">
                  <div class="field-label">Message:</div>
                  <div style="white-space: pre-wrap; margin-top: 10px; padding: 15px; background: #f5f5f5; border-radius: 5px;">${message}</div>
                </div>
              </div>

              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
                <p><strong>Action Required:</strong></p>
                <p>Please respond to this inquiry within 24 hours.</p>
                <p>Reply directly to: <a href="mailto:${email}">${email}</a></p>
              </div>
            </div>
            <div class="footer">
              <p>This message was sent via the Tatlist contact form</p>
              <p style="margin-top: 10px; font-size: 11px; color: #999;">&copy; 2025 Tatlist. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    // Send email to info@tatlist.com
    const success = await mailgunService.sendEmail({
      to: 'info@tatlist.com',
      subject: `Contact Form: ${subject}`,
      html,
      text: `New contact form submission from ${name} (${email})${phone ? ` - ${phone}` : ''}

Subject: ${subject}

Message:
${message}`,
      replyTo: email,
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
            'Failed to send message. Please try again or email us directly at info@tatlist.com',
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
