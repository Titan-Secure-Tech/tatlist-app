const STATIC_CACHE_NAME = 'tatlist-static-v1'
const DYNAMIC_CACHE_NAME = 'tatlist-dynamic-v1'
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.webmanifest',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/logo.webp',
]
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then(cache => {
      console.log('[Service Worker] Caching static assets')
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
    })
  )
  self.skipWaiting()
})
self.addEventListener('activate', event => {
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
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  if (!url.protocol.startsWith('http')) {
    return
  }
  // Skip HEAD requests as they cannot be cached
  if (request.method === 'HEAD') {
    return
  }
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(response => {
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
  event.respondWith(
    fetch(request)
      .then(response => {
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
          return caches.match('/offline')
        })
      })
  )
})
self.addEventListener('push', event => {
  console.log('[Service Worker] Push received')
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
  }
  event.waitUntil(self.registration.showNotification('Tatlist', options))
})
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked')
  event.notification.close()
  event.waitUntil(self.clients.openWindow('/'))
})
