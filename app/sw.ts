/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope

const STATIC_CACHE_NAME = 'tatlist-static-v1'
const DYNAMIC_CACHE_NAME = 'tatlist-dynamic-v1'

// Assets to cache on install
const STATIC_ASSETS: string[] = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/logo.webp',
]

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching static assets')
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activating...')
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => {
            return (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName.startsWith('tatlist-')
            )
          })
          .map(cacheName => {
            console.log('[Service Worker] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip chrome extensions and non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return
  }

  // Network-first for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Clone the response before caching
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          return caches.match(request)
        })
    )
    return
  }

  // Cache-first for static assets (images, fonts, etc.)
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script'
  ) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then(response => {
          // Clone the response before caching
          const responseClone = response.clone()
          caches.open(DYNAMIC_CACHE_NAME).then(cache => {
            cache.put(request, responseClone)
          })
          return response
        })
      })
    )
    return
  }

  // Network-first for HTML pages
  event.respondWith(
    fetch(request)
      .then(response => {
        // Clone the response before caching
        const responseClone = response.clone()
        caches.open(DYNAMIC_CACHE_NAME).then(cache => {
          cache.put(request, responseClone)
        })
        return response
      })
      .catch(() => {
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            return cachedResponse
          }
          // Return offline page if available
          return caches.match('/offline')
        })
      })
  )
})

// Handle push notifications with different types
self.addEventListener('push', (event: PushEvent) => {
  console.log('[Service Worker] Push notification received')

  if (!event.data) {
    console.log('[Service Worker] Push event has no data')
    return
  }

  let notificationData: {
    title: string
    body: string
    icon?: string
    badge?: string
    vibrate?: number[]
    data?: {
      type?: 'order_status' | 'promotion' | 'update'
      url?: string
      [key: string]: unknown
    }
    actions?: NotificationAction[]
  }

  try {
    notificationData = event.data.json()
  } catch {
    // Fallback for plain text notifications
    notificationData = {
      title: 'Tatlist',
      body: event.data.text(),
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: '/',
      },
    }
  }

  const options: NotificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon || '/icon-192x192.png',
    badge: notificationData.badge || '/icon-192x192.png',
    vibrate: notificationData.vibrate || [100, 50, 100],
    data: notificationData.data,
    actions: notificationData.actions || [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Close' },
    ],
    tag: notificationData.data?.type || 'general',
    requireInteraction: notificationData.data?.type === 'order_status',
  }

  event.waitUntil(self.registration.showNotification(notificationData.title, options))
})

// Handle notification clicks with routing based on type
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  console.log('[Service Worker] Notification clicked:', event.action)
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'
  const notificationType = event.notification.data?.type

  // Determine target URL based on notification type
  let targetUrl = urlToOpen
  if (notificationType === 'order_status' && urlToOpen === '/') {
    targetUrl = '/orders'
  } else if (notificationType === 'promotion' && urlToOpen === '/') {
    targetUrl = '/promotions'
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus()
        }
      }
      // Open new window if none found
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})
