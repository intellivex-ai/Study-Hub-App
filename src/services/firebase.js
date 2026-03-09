// src/services/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// Firebase initialisation — Analytics, Cloud Messaging (push notifications),
// and Performance Monitoring.
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics, logEvent as fbLogEvent, setUserId } from 'firebase/analytics'
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported as messagingIsSupported,
} from 'firebase/messaging'
import { getPerformance } from 'firebase/performance'

// ── Config ────────────────────────────────────────────────────────────────────
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// Prevent duplicate initialisation during HMR in Vite
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analytics = getAnalytics(app)

/**
 * Log a custom Firebase Analytics event.
 * @param {string} eventName  - snake_case event name
 * @param {object} [params]   - optional key/value parameters
 *
 * @example
 *   logEvent('lesson_completed', { subject: 'Physics', lesson_id: '...' })
 */
export const logEvent = (eventName, params = {}) => {
  try {
    fbLogEvent(analytics, eventName, params)
  } catch (err) {
    console.warn('[Firebase] logEvent failed:', err)
  }
}

/**
 * Associate all future analytics events with a Supabase user ID.
 * Call this immediately after a successful login.
 */
export const identifyUser = (userId) => {
  try {
    setUserId(analytics, userId)
  } catch (err) {
    console.warn('[Firebase] setUserId failed:', err)
  }
}

// ── Performance Monitoring ────────────────────────────────────────────────────
export const perf = getPerformance(app)

// ── Cloud Messaging (Push Notifications) ─────────────────────────────────────
let messaging = null

/**
 * Lazily initialise Firebase Cloud Messaging.
 * Messaging is not available in all browsers (e.g. Safari < 16.4, Firefox).
 */
export const getMessagingInstance = async () => {
  if (messaging) return messaging
  const supported = await messagingIsSupported()
  if (!supported) {
    console.info('[Firebase] Push notifications not supported in this browser.')
    return null
  }
  messaging = getMessaging(app)
  return messaging
}

/**
 * Request permission and return the FCM registration token.
 * Store this token in the `users.fcm_token` column so the server can send
 * targeted notifications.
 *
 * @returns {Promise<string|null>}
 */
export const requestNotificationToken = async () => {
  try {
    const msg = await getMessagingInstance()
    if (!msg) return null

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.info('[Firebase] Notification permission denied.')
      return null
    }

    const token = await getToken(msg, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    })
    return token || null
  } catch (err) {
    console.error('[Firebase] Failed to get FCM token:', err)
    return null
  }
}

/**
 * Listen for foreground push messages (app is open).
 * Background messages are handled by public/firebase-messaging-sw.js.
 *
 * @param {(payload: object) => void} callback
 * @returns {() => void} unsubscribe function
 */
export const onForegroundMessage = async (callback) => {
  const msg = await getMessagingInstance()
  if (!msg) return () => {}
  return onMessage(msg, callback)
}

// ── Predefined Analytics Events ───────────────────────────────────────────────
export const AnalyticsEvents = {
  // Auth
  SIGN_UP:             'sign_up',
  LOGIN:               'login',
  LOGOUT:              'logout',

  // Learning
  LESSON_STARTED:      'lesson_started',
  LESSON_COMPLETED:    'lesson_completed',
  SUBJECT_VIEWED:      'subject_viewed',

  // Practice
  QUIZ_STARTED:        'quiz_started',
  QUIZ_COMPLETED:      'quiz_completed',

  // Flashcards
  FLASHCARD_REVIEWED:  'flashcard_reviewed',
  DECK_COMPLETED:      'deck_completed',

  // Focus Timer
  FOCUS_SESSION_START: 'focus_session_start',
  FOCUS_SESSION_END:   'focus_session_end',

  // Notes
  NOTE_CREATED:        'note_created',
  NOTE_UPDATED:        'note_updated',
  NOTE_DELETED:        'note_deleted',
}
