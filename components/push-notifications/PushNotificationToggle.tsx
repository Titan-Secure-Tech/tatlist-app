'use client'

import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window) {
      setIsSupported(true)
      setPermission(Notification.permission)
      checkSubscription()
    } else {
      setIsLoading(false)
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking push subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribe = async () => {
    setIsLoading(true)
    try {
      // Request notification permission
      const permissionResult = await Notification.requestPermission()
      setPermission(permissionResult)

      if (permissionResult !== 'granted') {
        toast.error('Permission denied for notifications')
        setIsLoading(false)
        return
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready

      // Subscribe to push notifications
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidPublicKey) {
        throw new Error('VAPID public key not configured')
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON()),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription on server')
      }

      setIsSubscribed(true)
      toast.success('Push notifications enabled!')
    } catch (error) {
      console.error('Error subscribing to push notifications:', error)
      toast.error('Failed to enable push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribe = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Unsubscribe from push service
        await subscription.unsubscribe()

        // Remove subscription from server
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        setIsSubscribed(false)
        toast.success('Push notifications disabled')
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error)
      toast.error('Failed to disable push notifications')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <h3 className="text-sm font-medium">Push Notifications</h3>
        <p className="text-xs text-muted-foreground">
          Get updates about orders, promotions, and news
        </p>
      </div>
      <Button
        variant={isSubscribed ? 'outline' : 'default'}
        size="sm"
        onClick={isSubscribed ? unsubscribe : subscribe}
        disabled={isLoading || permission === 'denied'}
        className="gap-2"
      >
        {isSubscribed ? (
          <>
            <BellOff className="h-4 w-4" />
            Disable
          </>
        ) : (
          <>
            <Bell className="h-4 w-4" />
            Enable
          </>
        )}
      </Button>
    </div>
  )
}
