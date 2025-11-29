// Service Worker für Push Notifications
console.log('Service Worker geladen:', self.registration?.scope || 'unbekannt')

// Install Event
self.addEventListener('install', function(event) {
  console.log('Service Worker installiert')
  // Sofort aktivieren
  self.skipWaiting()
})

// Activate Event
self.addEventListener('activate', function(event) {
  console.log('Service Worker aktiviert')
  // Übernehme sofort die Kontrolle
  event.waitUntil(self.clients.claim())
})

// Push Event
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'Schichtplan Update'
  const body = data.body || 'Der Schichtplan wurde aktualisiert'
  const icon = data.icon || '/favicon-96x96.png'
  const badge = data.badge || '/favicon-32x32.png'
  const url = data.url || '/schichtplan'

  const options = {
    body: body,
    icon: icon,
    badge: badge,
    vibrate: [200, 100, 200],
    tag: 'schichtplan-update',
    requireInteraction: false,
    data: {
      url: url
    },
    actions: [
      {
        action: 'open',
        title: 'Öffnen'
      },
      {
        action: 'close',
        title: 'Schließen'
      }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification Click Handler
self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/schichtplan')
    )
  }
})

// Background Sync für Offline-Funktionalität
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Hier können Offline-Aktionen ausgeführt werden
      Promise.resolve()
    )
  }
})

