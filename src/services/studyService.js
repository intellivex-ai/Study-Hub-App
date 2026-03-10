// src/services/studyService.js
// ─────────────────────────────────────────────────────────────────────────────
// Study session management (Focus Timer) + streak calculations.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient'
import { logEvent, AnalyticsEvents } from './firebase'

const toError = (err) => (err instanceof Error ? err : new Error(err?.message ?? 'Unknown error'))

// ── Start Session ─────────────────────────────────────────────────────────────

/**
 * Insert a new study session row when the Pomodoro timer starts.
 * Returns the row ID so you can call endSession() later.
 *
 * @param {{ userId, subjectId?, sessionType?, durationMin }} params
 * @returns {Promise<string>} the new session ID
 *
 * @example
 *   const sessionId = await startSession({
 *     userId: user.id,
 *     subjectId: physicsId,
 *     sessionType: 'focus',
 *     durationMin: 25,
 *   })
 */
export const startSession = async ({ userId, subjectId, sessionType = 'focus', durationMin }) => {
  const { data, error } = await supabase
    .from('study_sessions')
    .insert({
      user_id: userId,
      subject_id: subjectId,
      session_type: sessionType,
      duration_min: durationMin,
      started_at: new Date().toISOString(),
    })
    .select('id')
    .maybeSingle()
  if (error) throw toError(error)
  logEvent(AnalyticsEvents.FOCUS_SESSION_START, { session_type: sessionType, duration_min: durationMin })
  return data.id
}

// ── End Session ───────────────────────────────────────────────────────────────

/**
 * Mark a session as ended. Also updates user's total_study_minutes and streak.
 *
 * @param {{ sessionId, userId, actualMin, completed?}} params
 */
export const endSession = async ({ sessionId, userId, actualMin, completed = true }) => {
  const now = new Date()

  const { error } = await supabase
    .from('study_sessions')
    .update({ actual_min: actualMin, completed, ended_at: now.toISOString() })
    .eq('id', sessionId)
  if (error) throw toError(error)

  // Update cumulative study minutes on the user profile
  await _incrementStudyMinutes(userId, actualMin)
  if (completed) await _updateStreak(userId, now)

  logEvent(AnalyticsEvents.FOCUS_SESSION_END, { actual_min: actualMin, completed })
}

// ── History ───────────────────────────────────────────────────────────────────

/**
 * Fetch paginated study session history for a user.
 *
 * @param {{ userId, limit?, offset?, subjectId? }} opts
 * @returns {Promise<Array>}
 */
export const getSessionHistory = async ({ userId, limit = 20, offset = 0, subjectId } = {}) => {
  let query = supabase
    .from('study_sessions')
    .select('*, subjects ( id, name, color_hex, icon )')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (subjectId) query = query.eq('subject_id', subjectId)

  const { data, error } = await query
  if (error) throw toError(error)
  return data
}

// ── Weekly Summary ────────────────────────────────────────────────────────────

/**
 * Return total study minutes per day for the last 7 days.
 * Shape: [{ day: 'Mon', minutes: 120 }, ...]
 *
 * @param {string} userId
 */
export const getWeeklySummary = async (userId) => {
  const since = new Date()
  since.setDate(since.getDate() - 6)
  since.setHours(0, 0, 0, 0)

  const { data, error } = await supabase
    .from('study_sessions')
    .select('started_at, actual_min')
    .eq('user_id', userId)
    .eq('session_type', 'focus')
    .eq('completed', true)
    .gte('started_at', since.toISOString())

  if (error) throw toError(error)

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const map = {}
  for (let i = 0; i < 7; i++) {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    map[d.toDateString()] = { day: days[d.getDay()], minutes: 0 }
  }

  data.forEach((s) => {
    const key = new Date(s.started_at).toDateString()
    if (map[key]) map[key].minutes += s.actual_min ?? 0
  })

  return Object.values(map)
}

/** Get total completed focus sessions for the current day. */
export const getTodayFocusCount = async (userId) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { count, error } = await supabase
    .from('study_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('session_type', 'focus')
    .eq('completed', true)
    .gte('started_at', today.toISOString())

  if (error) return 0
  return count ?? 0
}

// ── Private Helpers ───────────────────────────────────────────────────────────

async function _incrementStudyMinutes(userId, minutes) {
  // Use a raw SQL expression to avoid a read-modify-write race
  await supabase.rpc('increment_study_minutes', {
    p_user_id: userId,
    p_minutes: minutes,
  })
}

async function _updateStreak(userId, now = new Date()) {
  const today = now.toISOString().split('T')[0]
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const yest = yesterday.toISOString().split('T')[0]

  const { data: user } = await supabase
    .from('users')
    .select('streak, last_active')
    .eq('id', userId)
    .maybeSingle()

  if (!user) return

  let newStreak = user.streak ?? 0
  if (user.last_active === today) return                  // already counted today
  if (user.last_active === yest) newStreak += 1          // consecutive day
  else newStreak = 1           // streak broken

  await supabase
    .from('users')
    .update({ streak: newStreak, last_active: today })
    .eq('id', userId)
}
