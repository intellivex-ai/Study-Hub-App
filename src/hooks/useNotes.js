// src/hooks/useNotes.js
// ─────────────────────────────────────────────────────────────────────────────
// Manages notes state with optimistic updates and Supabase realtime.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  togglePinNote,
  subscribeToNotes,
} from '../services/notesService'

/**
 * @param {{ subjectId?: string, search?: string }} opts
 *
 * @example
 *   const {
 *     notes, loading, error,
 *     create, update, remove, togglePin,
 *   } = useNotes({ subjectId: physics.id })
 */
export function useNotes({ subjectId, search } = {}) {
  const { user } = useAuth()
  const [notes,   setNotes]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  // Track the active note for the editor
  const [activeNoteId, setActiveNoteId] = useState(null)
  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null

  // Debounce timer ref for auto-save
  const saveTimer = useRef(null)

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getNotes({ userId: user.id, subjectId, search })
      setNotes(data)
      if (data.length && !activeNoteId) setActiveNoteId(data[0].id)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, subjectId, search, activeNoteId])

  useEffect(() => { load() }, [load])

  // ── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const channel = subscribeToNotes(user.id, (event, row) => {
      setNotes((prev) => {
        if (event === 'INSERT') return [row, ...prev]
        if (event === 'UPDATE') return prev.map((n) => (n.id === row.id ? { ...n, ...row } : n))
        if (event === 'DELETE') return prev.filter((n) => n.id !== row.id)
        return prev
      })
    })
    return () => channel.unsubscribe()
  }, [user])

  // ── Actions ─────────────────────────────────────────────────────────────────

  /** Create a blank note and immediately select it. */
  const create = useCallback(async (opts = {}) => {
    if (!user) return
    const note = await createNote({ userId: user.id, subjectId, ...opts })
    setNotes((prev) => [note, ...prev])
    setActiveNoteId(note.id)
    return note
  }, [user, subjectId])

  /**
   * Update a note.
   * If `debounced` is true (default for typing), changes are flushed after
   * 1 second of idle time (auto-save behaviour).
   */
  const update = useCallback(async (noteId, changes, { debounced = false } = {}) => {
    // Optimistic UI update
    setNotes((prev) => prev.map((n) => (n.id === noteId ? { ...n, ...changes } : n)))

    if (debounced) {
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        try { await updateNote(noteId, changes) } catch (err) { setError(err.message) }
      }, 1000)
    } else {
      try { await updateNote(noteId, changes) } catch (err) { setError(err.message) }
    }
  }, [])

  /** Delete a note with optimistic removal. */
  const remove = useCallback(async (noteId) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
    if (activeNoteId === noteId) setActiveNoteId(notes[1]?.id ?? null)
    try { await deleteNote(noteId) } catch (err) { setError(err.message); load() }
  }, [activeNoteId, notes, load])

  /** Toggle pinned state. */
  const togglePin = useCallback(async (noteId, currentlyPinned) => {
    await togglePinNote(noteId, currentlyPinned)
  }, [])

  return {
    notes,
    loading,
    error,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    create,
    update,
    remove,
    togglePin,
    reload: load,
  }
}
