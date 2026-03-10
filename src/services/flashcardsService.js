// src/services/flashcardsService.js
// ─────────────────────────────────────────────────────────────────────────────
// Flashcard CRUD + a basic spaced-repetition scheduler.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient'
import { logEvent, AnalyticsEvents } from './firebase'

const toError = (err) => (err instanceof Error ? err : new Error(err?.message ?? 'Unknown error'))

// ── Spaced Repetition ─────────────────────────────────────────────────────────
// SM-2-inspired tiered intervals: 1 day, 3 days, 7 days, 14 days, 30 days
const TIERS = [1, 3, 7, 14, 30]

const calculateNextReview = (timesReviewed = 0, difficulty = 'medium') => {
  let step = timesReviewed

  if (difficulty === 'hard') step = 0
  else if (difficulty === 'easy') step += 2
  else step += 1 // medium

  // Cap the step to our max tier
  step = Math.min(Math.max(step, 0), TIERS.length - 1)

  const days = TIERS[step]
  const d = new Date()
  d.setDate(d.getDate() + days)

  return { next_review_at: d.toISOString(), new_times_reviewed: step }
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
      next_review_at: calculateNextReview(0, difficulty).next_review_at,
      times_reviewed: calculateNextReview(0, difficulty).new_times_reviewed
    })
    .select()
    .maybeSingle()
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
  const rows = cards.map((c) => {
    const { next_review_at, new_times_reviewed } = calculateNextReview(0, c.difficulty ?? 'medium');
    return {
      user_id: userId,
      subject_id: c.subjectId ?? null,
      deck_name: c.deckName ?? 'My Deck',
      front: c.front,
      back: c.back,
      difficulty: c.difficulty ?? 'medium',
      next_review_at,
      times_reviewed: new_times_reviewed
    }
  })

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
export const reviewFlashcard = async (card, difficulty) => {
  const { next_review_at, new_times_reviewed } = calculateNextReview(card.times_reviewed, difficulty)

  const { data, error } = await supabase
    .from('flashcards')
    .update({
      difficulty,
      next_review_at,
      times_reviewed: new_times_reviewed,
    })
    .eq('id', card.id)
    .select()
    .maybeSingle()

  if (error) throw toError(error)

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
    .maybeSingle()
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

