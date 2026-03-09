// src/hooks/useFlashcards.js
// ─────────────────────────────────────────────────────────────────────────────
// Manages flashcard state: loading deck, reviewing cards, tracking results.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  getFlashcards,
  getDeckNames,
  createFlashcard,
  createFlashcardsBulk,
  reviewFlashcard,
  updateFlashcard,
  deleteFlashcard,
  subscribeToFlashcards,
} from '../services/flashcardsService'
import { logEvent, AnalyticsEvents } from '../services/firebase'

/**
 * @param {{ subjectId?: string, deckName?: string, dueOnly?: boolean }} opts
 *
 * @example
 *   const {
 *     cards, currentCard, currentIndex,
 *     loading, deckNames,
 *     review, next, prev,
 *     create, remove,
 *     sessionStats,
 *   } = useFlashcards({ subjectId: physics.id })
 */
export function useFlashcards({ subjectId, deckName, dueOnly = false } = {}) {
  const { user } = useAuth()
  const [cards, setCards] = useState([])
  const [deckNames, setDeckNames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Session progress
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionResults, setSessionResults] = useState([]) // { cardId, difficulty }
  const [sessionDone, setSessionDone] = useState(false)

  const currentCard = cards[currentIndex] ?? null

  // ── Computed session stats ──────────────────────────────────────────────────
  const sessionStats = {
    total: cards.length,
    reviewed: sessionResults.length,
    easy: sessionResults.filter((r) => r.difficulty === 'easy').length,
    medium: sessionResults.filter((r) => r.difficulty === 'medium').length,
    hard: sessionResults.filter((r) => r.difficulty === 'hard').length,
  }

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const [fetchedCards, fetchedDecks] = await Promise.all([
        getFlashcards({ userId: user.id, subjectId, deckName, dueOnly }),
        getDeckNames(user.id),
      ])
      setCards(fetchedCards)
      setDeckNames(fetchedDecks)
      setCurrentIndex(0)
      setSessionResults([])
      setSessionDone(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user, subjectId, deckName, dueOnly])

  useEffect(() => { load() }, [load])

  // ── Realtime subscription ───────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const ch = subscribeToFlashcards(user.id, (event, row) => {
      setCards((prev) => {
        if (event === 'INSERT') return [...prev, row]
        if (event === 'UPDATE') return prev.map((c) => (c.id === row.id ? { ...c, ...row } : c))
        if (event === 'DELETE') return prev.filter((c) => c.id !== row.id)
        return prev
      })
    })
    return () => ch.unsubscribe()
  }, [user])

  // ── Review ──────────────────────────────────────────────────────────────────

  /**
   * Mark the current card as easy / medium / hard and advance.
   * @param {'easy'|'medium'|'hard'} difficulty
   */
  const review = useCallback(async (difficulty) => {
    if (!currentCard) return
    await reviewFlashcard(currentCard.id, difficulty)
    setSessionResults((prev) => [...prev, { cardId: currentCard.id, difficulty }])

    if (currentIndex + 1 >= cards.length) {
      setSessionDone(true)
      logEvent(AnalyticsEvents.DECK_COMPLETED, {
        total: cards.length,
        easy: sessionStats.easy + (difficulty === 'easy' ? 1 : 0),
      })
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentCard, currentIndex, cards.length, sessionStats.easy])

  const next = useCallback(() => setCurrentIndex((i) => Math.min(i + 1, cards.length - 1)), [cards.length])
  const prev = useCallback(() => setCurrentIndex((i) => Math.max(i - 1, 0)), [])

  const restart = useCallback(() => {
    setCurrentIndex(0)
    setSessionResults([])
    setSessionDone(false)
    // Shuffle the deck
    setCards((prev) => [...prev].sort(() => Math.random() - 0.5))
  }, [])

  // ── CRUD ────────────────────────────────────────────────────────────────────

  const create = useCallback(async (params) => {
    if (!user) return
    const card = await createFlashcard({ userId: user.id, ...params })
    setCards((prev) => [...prev, card])
    return card
  }, [user])

  const createBulk = useCallback(async (cardList) => {
    if (!user) return
    const created = await createFlashcardsBulk(user.id, cardList)
    setCards((prev) => [...prev, ...created])
    return created
  }, [user])

  const update = useCallback(async (cardId, changes) => {
    const updated = await updateFlashcard(cardId, changes)
    setCards((prev) => prev.map((c) => (c.id === cardId ? updated : c)))
    return updated
  }, [])

  const remove = useCallback(async (cardId) => {
    await deleteFlashcard(cardId)
    setCards((prev) => prev.filter((c) => c.id !== cardId))
  }, [])

  return {
    cards,
    deckNames,
    loading,
    error,
    currentCard,
    currentIndex,
    sessionDone,
    sessionStats,
    review,
    next,
    prev,
    restart,
    create,
    createBulk,
    update,
    remove,
    reload: load,
  }
}
