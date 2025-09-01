import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import type { MailgunEvent, MailgunEmailEventRecord } from '@/lib/types/mailgun'

// Mailgun webhook event types we want to track
const TRACKED_EVENTS = [
  'delivered',
  'opened',
  'clicked',
  'unsubscribed',
  'complained',
  'failed',
  'bounced',
]

// Verify Mailgun webhook signature
function verifyWebhookSignature(
  timestamp: string,
  token: string,
  signature: string,
  signingKey: string
): boolean {
  const encodedToken = crypto
    .createHmac('sha256', signingKey)
    .update(timestamp.concat(token))
    .digest('hex')

  return encodedToken === signature
}

export async function POST(request: NextRequest) {
  try {
    // Parse the form data from Mailgun
    const formData = await request.formData()

    // Extract signature fields
    const timestamp = formData.get('timestamp') as string
    const token = formData.get('token') as string
    const signature = formData.get('signature') as string

    // Get the signing key from environment
    const signingKey = process.env.MAILGUN_WEBHOOK_SIGNING_KEY || process.env.MAILGUN_SENDING_KEY

    if (!signingKey) {
      console.error('Mailgun webhook signing key not configured')
      return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 })
    }

    // Verify the webhook signature
    if (!verifyWebhookSignature(timestamp, token, signature, signingKey)) {
      console.error('Invalid Mailgun webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // Extract event data
    const eventData = formData.get('event-data')
    let event: MailgunEvent = {}

    if (eventData) {
      // Newer Mailgun format sends event-data as JSON string
      event = JSON.parse(eventData as string)
    } else {
      // Legacy format sends fields directly
      event = {
        event: formData.get('event') as MailgunEvent['event'],
        recipient: formData.get('recipient') as string | undefined,
        domain: formData.get('domain') as string | undefined,
        'message-id': formData.get('Message-Id') as string | undefined,
        timestamp: formData.get('timestamp') as string | undefined,
        reason: formData.get('reason') as string | undefined,
        'delivery-status': {
          code: Number(formData.get('code')) || undefined,
          message: (formData.get('error') || formData.get('notification')) as string | undefined,
        },
      }
    }

    const eventType = event.event || event['event-type']

    // Only track specific events
    if (!eventType || !TRACKED_EVENTS.includes(eventType)) {
      return NextResponse.json({ received: true })
    }

    // Initialize Supabase client with service role
    const supabase = await createClient()

    // Prepare event record
    const eventRecord: MailgunEmailEventRecord = {
      event_type: eventType,
      recipient: event.recipient || event['recipient'] || null,
      message_id: event['message-id'] || event.message?.headers?.['message-id'] || null,
      domain: event.domain || event.sending?.domain || null,
      timestamp: event.timestamp
        ? new Date(Number(event.timestamp) * 1000).toISOString()
        : new Date().toISOString(),
      event_data: event,
      severity: event.severity || (eventType === 'failed' ? 'permanent' : null),
      reason: event.reason || event['delivery-status']?.description || null,
      delivery_status_code: event['delivery-status']?.code || event.code || null,
      delivery_status_message:
        event['delivery-status']?.message || event.error || event.notification || null,
    }

    // Store event in database
    const { error } = await supabase.from('email_events').insert(eventRecord)

    if (error) {
      console.error('Error storing email event:', error)
      // Still return 200 to Mailgun to prevent retries
      return NextResponse.json({ received: true, stored: false })
    }

    // Log important events
    if (['complained', 'failed', 'bounced'].includes(eventType)) {
      console.warn(`Email ${eventType} event:`, {
        recipient: eventRecord.recipient,
        reason: eventRecord.reason,
        severity: eventRecord.severity,
      })
    }

    return NextResponse.json({ received: true, stored: true })
  } catch (error) {
    console.error('Mailgun webhook error:', error)
    // Return 200 to prevent Mailgun from retrying
    return NextResponse.json({ received: true, error: 'Processing error' })
  }
}
