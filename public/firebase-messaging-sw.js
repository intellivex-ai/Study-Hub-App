// public/firebase-messaging-sw.js
// ─────────────────────────────────────────────────────────────────────────────
// Service Worker for Firebase Cloud Messaging background notifications.
// This file MUST live at the root of your public/ folder so it is served
// from https://yourdomain.com/firebase-messaging-sw.js
// ─────────────────────────────────────────────────────────────────────────────
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js')

// These values must match your firebase.js config.
// IMPORTANT: Do NOT use import.meta.env here — service workers run outside Vite.
// Hardcode the non-secret values or inject them at build time.
firebase.initializeApp({
  apiKey:            self.FIREBASE_API_KEY            || 'REPLACE_ME',
  authDomain:        self.FIREBASE_AUTH_DOMAIN        || 'REPLACE_ME',
  projectId:         self.FIREBASE_PROJECT_ID         || 'REPLACE_ME',
  storageBucket:     self.FIREBASE_STORAGE_BUCKET     || 'REPLACE_ME',
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || 'REPLACE_ME',
  appId:             self.FIREBASE_APP_ID             || 'REPLACE_ME',
})

const messaging = firebase.messaging()

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message:', payload)

  const { title, body, icon } = payload.notification ?? {}

  self.registration.showNotification(title ?? 'StudyHub', {
    body:  body  ?? 'You have a new notification.',
    icon:  icon  ?? '/icon-192.png',
    badge: '/badge-72.png',
    data:  payload.data,
    actions: [
      { action: 'open', title: 'Open StudyHub' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  })
})

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const url = event.notification.data?.url ?? '/'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus()
          return
        }
      }
      clients.openWindow(url)
    })
  )
})
