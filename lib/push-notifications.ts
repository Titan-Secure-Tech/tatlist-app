import type { NotificationType } from '@/app/api/push/send/route'

export interface SendNotificationOptions {
  userIds?: string[]
  title: string
  body: string
  type: NotificationType
  url?: string
  data?: Record<string, unknown>
}

/**
 * Send a push notification to users
 * @param options Notification options
 * @returns Promise with send results
 */
export async function sendPushNotification(options: SendNotificationOptions) {
  try {
    const response = await fetch('/api/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to send notification')
    }

    return await response.json()
  } catch (error) {
    console.error('Error sending push notification:', error)
    throw error
  }
}

/**
 * Send an order status update notification
 */
export async function sendOrderStatusNotification(
  userId: string,
  orderId: string,
  status: string,
  message: string
) {
  return sendPushNotification({
    userIds: [userId],
    title: `Order ${status}`,
    body: message,
    type: 'order_status',
    url: `/orders/${orderId}`,
    data: {
      orderId,
      status,
    },
  })
}

/**
 * Send a promotion notification
 */
export async function sendPromotionNotification(
  userIds: string[] | undefined,
  title: string,
  description: string,
  promoUrl?: string
) {
  return sendPushNotification({
    userIds,
    title,
    body: description,
    type: 'promotion',
    url: promoUrl || '/promotions',
  })
}

/**
 * Send a general update notification
 */
export async function sendUpdateNotification(
  userIds: string[] | undefined,
  title: string,
  message: string,
  url?: string
) {
  return sendPushNotification({
    userIds,
    title,
    body: message,
    type: 'update',
    url: url || '/',
  })
}
