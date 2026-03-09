// src/services/notesService.js
// ─────────────────────────────────────────────────────────────────────────────
// CRUD operations for the `notes` table.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient'
import { logEvent, AnalyticsEvents } from './firebase'

const toError = (err) => (err instanceof Error ? err : new Error(err?.message ?? 'Unknown error'))

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Get all notes for the current user, newest first.
 * Optionally filter by subjectId or full-text search.
 *
 * @param {{ userId: string, subjectId?: string, search?: string }} opts
 * @returns {Promise<Array>}
 */
export const getNotes = async ({ userId, subjectId, search } = {}) => {
  let query = supabase
    .from('notes')
    .select('id, title, content, tags, is_pinned, subject_id, created_at, updated_at')
    .eq('user_id', userId)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (subjectId) query = query.eq('subject_id', subjectId)

  if (search) {
    query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
  }

  const { data, error } = await query
  if (error) throw toError(error)
  return data
}


/**
 * Get a single note by ID.
 * @returns {Promise<object>}
 */
export const getNoteById = async (noteId) => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single()
  if (error) throw toError(error)
  return data
}


// ── Create ────────────────────────────────────────────────────────────────────

/**
 * Create a new note.
 *
 * @param {{ userId: string, subjectId?: string, title?: string, content?: string, tags?: string[] }} params
 * @returns {Promise<object>} the new note row
 *
 * @example
 *   const note = await createNote({
 *     userId: user.id,
 *     subjectId: '...',
 *     title: 'Quantum Mechanics',
 *     content: '# Wave-Particle Duality\n...',
 *     tags: ['physics', 'quantum'],
 *   })
 */
export const createNote = async ({ userId, subjectId, title = 'Untitled Note', content = '', tags = [] }) => {
  const { data, error } = await supabase
    .from('notes')
    .insert({ user_id: userId, subject_id: subjectId, title, content, tags })
    .select()
    .single()
  if (error) throw toError(error)
  logEvent(AnalyticsEvents.NOTE_CREATED, { subject_id: subjectId })
  return data
}

// ── Update ────────────────────────────────────────────────────────────────────

/**
 * Update an existing note (partial update — only pass what changed).
 *
 * @param {string} noteId
 * @param {{ title?: string, content?: string, tags?: string[], is_pinned?: boolean, subject_id?: string }} updates
 * @returns {Promise<object>} the updated row
 */
export const updateNote = async (noteId, updates) => {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single()
  if (error) throw toError(error)
  logEvent(AnalyticsEvents.NOTE_UPDATED)
  return data
}

// ── Delete ────────────────────────────────────────────────────────────────────

/**
 * Permanently delete a note.
 * @param {string} noteId
 */
export const deleteNote = async (noteId) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
  if (error) throw toError(error)
  logEvent(AnalyticsEvents.NOTE_DELETED)
}

// ── Pin / Unpin ───────────────────────────────────────────────────────────────

/** Toggle the pinned state of a note. */
export const togglePinNote = async (noteId, currentlyPinned) => {
  return updateNote(noteId, { is_pinned: !currentlyPinned })
}

// ── Realtime subscription ─────────────────────────────────────────────────────

/**
 * Subscribe to realtime INSERT/UPDATE/DELETE events on the user's notes.
 * Returns the channel object; call channel.unsubscribe() to clean up.
 *
 * @param {string} userId
 * @param {(event: 'INSERT'|'UPDATE'|'DELETE', row: object) => void} callback
 *
 * @example
 *   const channel = subscribeToNotes(user.id, (event, row) => {
 *     if (event === 'INSERT') setNotes(prev => [row, ...prev])
 *     if (event === 'UPDATE') setNotes(prev => prev.map(n => n.id === row.id ? row : n))
 *     if (event === 'DELETE') setNotes(prev => prev.filter(n => n.id !== row.id))
 *   })
 *   return () => channel.unsubscribe()
 */
export const subscribeToNotes = (userId, callback) => {
  return supabase
    .channel(`notes:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.eventType, payload.new ?? payload.old)
    )
    .subscribe()
}
