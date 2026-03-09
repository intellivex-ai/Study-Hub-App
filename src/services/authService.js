// src/services/authService.js
// ─────────────────────────────────────────────────────────────────────────────
// All authentication operations using Supabase Auth.
// After login/signup we also fire Firebase Analytics events and persist the
// FCM token so the server can send push notifications.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient'
import {
  logEvent,
  identifyUser,
  requestNotificationToken,
  AnalyticsEvents,
} from './firebase'

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normalise a Supabase error into a plain JS Error. */
const toError = (err) => (err instanceof Error ? err : new Error(err?.message ?? 'Unknown error'))

// ── Sign Up ───────────────────────────────────────────────────────────────────

/**
 * Create a new account and auto-confirm via email OTP (magic link / email conf).
 * The `handle_new_user` trigger in the DB creates the `public.users` row.
 *
 * @param {{ fullName: string, email: string, password: string }} params
 * @returns {{ user, session, error }}
 */
export const signUp = async ({ fullName, email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  })

  if (error) return { user: null, session: null, error: toError(error) }

  // Seed default subjects for the new user
  if (data.user) {
    await supabase.rpc('seed_default_subjects', { p_user_id: data.user.id })
    logEvent(AnalyticsEvents.SIGN_UP, { method: 'email' })
    identifyUser(data.user.id)
    await _saveFcmToken(data.user.id)
  }

  return { user: data.user, session: data.session, error: null }
}

// ── Login ─────────────────────────────────────────────────────────────────────

/**
 * Log in with email + password.
 * @returns {{ user, session, error }}
 */
export const login = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { user: null, session: null, error: toError(error) }

  logEvent(AnalyticsEvents.LOGIN, { method: 'email' })
  identifyUser(data.user.id)
  await _saveFcmToken(data.user.id)
  await _updateLastActive(data.user.id)

  return { user: data.user, session: data.session, error: null }
}

// ── OAuth (Google / Apple) ────────────────────────────────────────────────────

/**
 * Initiate OAuth sign-in. Redirects the browser to the provider.
 * @param {'google'|'apple'} provider
 */
export const loginWithOAuth = async (provider) => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })
  if (error) throw toError(error)
}

// ── Logout ────────────────────────────────────────────────────────────────────

/** Sign out the current user and clear the local session. */
export const logout = async () => {
  logEvent(AnalyticsEvents.LOGOUT)
  const { error } = await supabase.auth.signOut()
  if (error) throw toError(error)
}

// ── Password Reset ────────────────────────────────────────────────────────────

/** Send a password-reset email. */
export const resetPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw toError(error)
}

/** Update the password (call this on the /reset-password page). */
export const updatePassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw toError(error)
}

// ── Session ───────────────────────────────────────────────────────────────────

/** Get the current active session (null if not authenticated). */
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw toError(error)
  return data.session
}

/** Subscribe to auth state changes (login, logout, token refresh). */
export const onAuthStateChange = (callback) => {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session)
  })
  return data.subscription.unsubscribe
}

// ── Profile ───────────────────────────────────────────────────────────────────

/** Fetch the public.users profile for the given userId. */
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw toError(error)
  return data
}

/** Update editable profile fields. */
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw toError(error)
  return data
}

// ── Private Helpers ───────────────────────────────────────────────────────────

async function _saveFcmToken(userId) {
  const token = await requestNotificationToken()
  if (!token) return
  await supabase
    .from('users')
    .update({ fcm_token: token })
    .eq('id', userId)
}

async function _updateLastActive(userId) {
  await supabase
    .from('users')
    .update({ last_active: new Date().toISOString().split('T')[0] })
    .eq('id', userId)
}
