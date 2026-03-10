// src/services/subjectsService.js
// ─────────────────────────────────────────────────────────────────────────────
// CRUD + realtime subscription for the `subjects` table.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient'

const toError = (e) => (e instanceof Error ? e : new Error(e?.message ?? 'Unknown error'))

// ── Fetch ─────────────────────────────────────────────────────────────────────

/** Get all subjects for a user, ordered by name. */
export const getSubjects = async (userId) => {
    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId)
        .order('name', { ascending: true })
    if (error) throw toError(error)
    return data ?? []
}

// ── Create ────────────────────────────────────────────────────────────────────

export const createSubject = async ({ userId, name, icon = 'book', colorHex = '#2563EB', chapters = 0 }) => {
    const { data, error } = await supabase
        .from('subjects')
        .insert({ user_id: userId, name, icon, color_hex: colorHex, chapters })
        .select()
        .maybeSingle()
    if (error) throw toError(error)
    return data
}

// ── Update ────────────────────────────────────────────────────────────────────

export const updateSubject = async (subjectId, updates) => {
    const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', subjectId)
        .select()
        .maybeSingle()
    if (error) throw toError(error)
    return data
}

/** Update the progress percentage for a subject (0–100). */
export const updateSubjectProgress = async (subjectId, progress) =>
    updateSubject(subjectId, { progress: Math.min(100, Math.max(0, progress)) })

// ── Delete ────────────────────────────────────────────────────────────────────

export const deleteSubject = async (subjectId) => {
    const { error } = await supabase.from('subjects').delete().eq('id', subjectId)
    if (error) throw toError(error)
}

// ── Realtime ──────────────────────────────────────────────────────────────────

/**
 * Subscribe to INSERT/UPDATE/DELETE changes on this user's subjects.
 * Returns the channel — call channel.unsubscribe() to clean up.
 */
export const subscribeToSubjects = (userId, callback) =>
    supabase
        .channel(`subjects:${userId}`)
        .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'subjects', filter: `user_id=eq.${userId}` },
            (payload) => callback(payload.eventType, payload.new ?? payload.old)
        )
        .subscribe()

// ── User profile stats ────────────────────────────────────────────────────────

/** Fetch streak, total_study_minutes, etc. from public.users. */
export const getUserStats = async (userId) => {
    const { data, error } = await supabase
        .from('users')
        .select('full_name, avatar_url, grade, streak, total_study_minutes, last_active')
        .eq('id', userId)
        .maybeSingle()
    if (error) throw toError(error)
    return data
}

/** Subscribe to realtime profile updates (streak, study minutes). */
export const subscribeToUserStats = (userId, callback) =>
    supabase
        .channel(`user_stats:${userId}`)
        .on(
            'postgres_changes',
            { event: 'UPDATE', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
            (payload) => callback(payload.new)
        )
        .subscribe()
