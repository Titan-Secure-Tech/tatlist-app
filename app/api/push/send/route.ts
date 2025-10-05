import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import webpush from 'web-push'

export type NotificationType = 'order_status' | 'promotion' | 'update'

// Lazy initialization of VAPID details to avoid build-time errors
let vapidConfigured = false
function ensureVapidConfigured() {
  if (!vapidConfigured) {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY
    const subject = process.env.VAPID_SUBJECT || 'mailto:support@tatlist.com'

    if (publicKey && privateKey) {
      webpush.setVapidDetails(subject, publicKey, privateKey)
      vapidConfigured = true
    }
  }
}

export interface PushNotificationPayload {
  title: string
  body: string
  type: NotificationType
  data?: Record<string, unknown>
  url?: string
}

export async function POST(request: NextRequest) {
  try {
    // Ensure VAPID is configured before processing
    ensureVapidConfigured()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      userIds,
      title,
      body,
      type,
      data,
      url,
    }: {
      userIds?: string[]
      title: string
      body: string
      type: NotificationType
      data?: Record<string, unknown>
      url?: string
    } = await request.json()

    if (!title || !body || !type) {
      return NextResponse.json({ error: 'Title, body, and type are required' }, { status: 400 })
    }

    // Get subscriptions for target users
    let query = supabase.from('push_subscriptions').select('*')

    if (userIds && userIds.length > 0) {
      query = query.in('user_id', userIds)
    } else {
      // Send to current user only if no userIds specified
      query = query.eq('user_id', user.id)
    }

    const { data: subscriptions, error: fetchError } = await query

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions found' }, { status: 200 })
    }

    // Prepare notification payload
    const notificationPayload = {
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        type,
        url: url || '/',
        ...data,
        dateOfArrival: Date.now(),
      },
      actions: [
        { action: 'open', title: 'View' },
        { action: 'close', title: 'Close' },
      ],
    }

    // Send notifications to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async subscription => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          }

          await webpush.sendNotification(pushSubscription, JSON.stringify(notificationPayload))

          // Log successful notification
          await supabase.from('push_notifications_log').insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            notification_type: type,
            title,
            body,
            data,
            status: 'sent',
          })

          return { success: true, subscriptionId: subscription.id }
        } catch (error: unknown) {
          console.error('Error sending push notification:', error)

          // Log failed notification
          await supabase.from('push_notifications_log').insert({
            user_id: subscription.user_id,
            subscription_id: subscription.id,
            notification_type: type,
            title,
            body,
            data,
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
          })

          // If subscription is expired or invalid, delete it
          if (
            error instanceof Error &&
            (error.message.includes('410') || error.message.includes('404'))
          ) {
            await supabase.from('push_subscriptions').delete().eq('id', subscription.id)
          }

          return { success: false, subscriptionId: subscription.id, error }
        }
      })
    )

    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    return NextResponse.json({
      success: true,
      sent: successful,
      failed,
      total: results.length,
    })
  } catch (error) {
    console.error('Error in push send route:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
