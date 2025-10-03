import { NextRequest, NextResponse } from 'next/server'
import { mailgunService } from '@/lib/email/mailgun'

interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    const data: ContactFormData = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Send email to info@tatlist.com
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #000; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .contact-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            .field { margin: 10px 0; }
            .field-label { font-weight: bold; color: #555; }
            .field-value { margin-left: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Submission</h1>
            </div>
            <div class="content">
              <div class="contact-details">
                <h2>Contact Information</h2>
                <div class="field">
                  <span class="field-label">Name:</span>
                  <span class="field-value">${data.name}</span>
                </div>
                <div class="field">
                  <span class="field-label">Email:</span>
                  <span class="field-value">${data.email}</span>
                </div>
                <div class="field">
                  <span class="field-label">Subject:</span>
                  <span class="field-value">${data.subject}</span>
                </div>
                
                <h3>Message:</h3>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 10px;">
                  ${data.message.replace(/\n/g, '<br>')}
                </div>
              </div>
            </div>
            <div class="footer">
              <p>This message was sent from the Tatlist contact form</p>
              <p>&copy; 2024 Tatlist. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

    const success = await mailgunService.sendEmail({
      to: 'info@tatlist.com',
      subject: `Contact Form: ${data.subject}`,
      html: emailHtml,
      text: `
        New contact form submission from ${data.name} (${data.email})
        
        Subject: ${data.subject}
        
        Message:
        ${data.message}
      `,
    })

    if (success) {
      return NextResponse.json({ 
        success: true,
        message: 'Message sent successfully'
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to send message. Please try again later.' },
        { status: 500 }
      )
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    )
  }
}