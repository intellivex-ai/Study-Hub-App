// src/services/flashcardsService.js
// ─────────────────────────────────────────────────────────────────────────────
// Flashcard CRUD + a basic spaced-repetition scheduler.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient'
import { logEvent, AnalyticsEvents } from './firebase'

const toError = (err) => (err instanceof Error ? err : new Error(err?.message ?? 'Unknown error'))

// ── Spaced Repetition ─────────────────────────────────────────────────────────
// Simple SM-2-inspired intervals (days until next review):
const INTERVALS = { easy: 7, medium: 3, hard: 1 }

const nextReviewDate = (difficulty) => {
  const days = INTERVALS[difficulty] ?? 3
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

// ── Fetch ─────────────────────────────────────────────────────────────────────

/**
 * Get all flashcards for the user, optionally filtered by subject / deck.
 *
 * @param {{ userId: string, subjectId?: string, deckName?: string, dueOnly?: boolean }} opts
 *   dueOnly — if true, return only cards where next_review_at <= now()
 */
export const getFlashcards = async ({ userId, subjectId, deckName, dueOnly = false }) => {
  let query = supabase
    .from('flashcards')
    .select('*, subjects ( id, name, color_hex, icon )')
    .eq('user_id', userId)
    .order('next_review_at', { ascending: true })

  if (subjectId) query = query.eq('subject_id', subjectId)
  if (deckName) query = query.eq('deck_name', deckName)
  if (dueOnly) query = query.lte('next_review_at', new Date().toISOString())

  const { data, error } = await query
  if (error) throw toError(error)
  return data
}

/**
 * List unique deck names belonging to the user.
 * @param {string} userId
 * @returns {Promise<string[]>}
 */
export const getDeckNames = async (userId) => {
  const { data, error } = await supabase
    .from('flashcards')
    .select('deck_name')
    .eq('user_id', userId)
  if (error) throw toError(error)
  return [...new Set(data.map((r) => r.deck_name))]
}

// ── Create ────────────────────────────────────────────────────────────────────

/**
 * Create a single flashcard.
 *
 * @param {{ userId, subjectId?, deckName?, front, back, difficulty? }} params
 * @returns {Promise<object>}
 *
 * @example
 *   const card = await createFlashcard({
 *     userId: user.id,
 *     subjectId: physicsId,
 *     deckName: 'Quantum Mechanics',
 *     front: 'What is Heisenberg\'s Uncertainty Principle?',
 *     back: 'Δx·Δp ≥ ℏ/2',
 *   })
 */
export const createFlashcard = async ({
  userId,
  subjectId,
  deckName = 'My Deck',
  front,
  back,
  difficulty = 'medium',
}) => {
  const { data, error } = await supabase
    .from('flashcards')
    .insert({
      user_id: userId,
      subject_id: subjectId,
      deck_name: deckName,
      front,
      back,
      difficulty,
      next_review_at: nextReviewDate(difficulty),
    })
    .select()
    .single()
  if (error) throw toError(error)
  return data
}

/**
 * Bulk-create multiple flashcards at once.
 *
 * @param {string} userId
 * @param {Array<{front, back, deckName?, subjectId?, difficulty?}>} cards
 */
export const createFlashcardsBulk = async (userId, cards) => {
  const rows = cards.map((c) => ({
    user_id: userId,
    subject_id: c.subjectId ?? null,
    deck_name: c.deckName ?? 'My Deck',
    front: c.front,
    back: c.back,
    difficulty: c.difficulty ?? 'medium',
    next_review_at: nextReviewDate(c.difficulty ?? 'medium'),
  }))

  const { data, error } = await supabase
    .from('flashcards')
    .insert(rows)
    .select()
  if (error) throw toError(error)
  return data
}

// ── Review (mark easy / medium / hard) ───────────────────────────────────────

/**
 * Record a review result. Updates difficulty, next_review_at, and times_reviewed.
 *
 * @param {string} cardId
 * @param {'easy'|'medium'|'hard'} difficulty
 * @returns {Promise<object>} updated card
 *
 * @example
 *   await reviewFlashcard(card.id, 'easy')   // good recall → push back 7 days
 *   await reviewFlashcard(card.id, 'hard')   // poor recall → review tomorrow
 */
export const reviewFlashcard = async (cardId, difficulty) => {
  // Increment times_reviewed via rpc to avoid a separate SELECT
  const { data, error } = await supabase
    .from('flashcards')
    .update({
      difficulty,
      next_review_at: nextReviewDate(difficulty),
      times_reviewed: supabase.rpc('increment', { row_id: cardId }), // see note below
    })
    .eq('id', cardId)
    .select()
    .single()

  // Fallback: manual increment if RPC not available
  if (error) {
    const { data: current } = await supabase
      .from('flashcards')
      .select('times_reviewed')
      .eq('id', cardId)
      .single()

    const { data: updated, error: e2 } = await supabase
      .from('flashcards')
      .update({
        difficulty,
        next_review_at: nextReviewDate(difficulty),
        times_reviewed: (current?.times_reviewed ?? 0) + 1,
      })
      .eq('id', cardId)
      .select()
      .single()
    if (e2) throw toError(e2)
    logEvent(AnalyticsEvents.FLASHCARD_REVIEWED, { difficulty })
    return updated
  }

  logEvent(AnalyticsEvents.FLASHCARD_REVIEWED, { difficulty })
  return data
}

// ── Update / Delete ───────────────────────────────────────────────────────────

/** Edit the front/back text or other fields of a flashcard. */
export const updateFlashcard = async (cardId, updates) => {
  const { data, error } = await supabase
    .from('flashcards')
    .update(updates)
    .eq('id', cardId)
    .select()
    .single()
  if (error) throw toError(error)
  return data
}

/** Delete a flashcard permanently. */
export const deleteFlashcard = async (cardId) => {
  const { error } = await supabase.from('flashcards').delete().eq('id', cardId)
  if (error) throw toError(error)
}

// ── Realtime subscription ─────────────────────────────────────────────────────

/**
 * Subscribe to realtime INSERT/UPDATE/DELETE on the user's flashcards.
 * Returns the channel; call channel.unsubscribe() to clean up.
 *
 * @param {string} userId
 * @param {(event: 'INSERT'|'UPDATE'|'DELETE', row: object) => void} callback
 */
export const subscribeToFlashcards = (userId, callback) =>
  supabase
    .channel(`flashcards:${userId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'flashcards', filter: `user_id=eq.${userId}` },
      (payload) => callback(payload.eventType, payload.new ?? payload.old)
    )
    .subscribe()

