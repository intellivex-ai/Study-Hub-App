// src/services/quizService.js
// ─────────────────────────────────────────────────────────────────────────────
// Save quiz results and fetch performance history.
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient'
import { logEvent, AnalyticsEvents } from './firebase'

const toError = (err) => (err instanceof Error ? err : new Error(err?.message ?? 'Unknown error'))

// ── Save Result ───────────────────────────────────────────────────────────────

/**
 * Persist a completed quiz attempt.
 *
 * @param {{
 *   userId: string,
 *   subjectId?: string,
 *   quizTitle?: string,
 *   totalQuestions: number,
 *   correctAnswers: number,
 *   timeTakenSec?: number,
 *   answers?: Array<{ question: string, chosen: number, correct: number }>
 * }} params
 * @returns {Promise<object>} the saved quiz_results row (includes score_pct)
 *
 * @example
 *   const result = await saveQuizResult({
 *     userId: user.id,
 *     subjectId: physicsId,
 *     quizTitle: 'Quantum Mechanics Quiz',
 *     totalQuestions: 5,
 *     correctAnswers: 4,
 *     timeTakenSec: 180,
 *     answers: [
 *       { question: 'What is wave-particle duality?', chosen: 1, correct: 1 },
 *       ...
 *     ],
 *   })
 */
export const saveQuizResult = async ({
  userId,
  subjectId,
  quizTitle,
  totalQuestions,
  correctAnswers,
  timeTakenSec,
  answers = [],
}) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .insert({
      user_id:         userId,
      subject_id:      subjectId,
      quiz_title:      quizTitle,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      time_taken_sec:  timeTakenSec,
      answers,
    })
    .select()
    .single()

  if (error) throw toError(error)

  const scorePct = Math.round((correctAnswers / totalQuestions) * 100)
  logEvent(AnalyticsEvents.QUIZ_COMPLETED, {
    quiz_title: quizTitle,
    score_pct:  scorePct,
    subject_id: subjectId,
  })

  return data
}

// ── History ───────────────────────────────────────────────────────────────────

/**
 * Get quiz history for a user, newest first.
 *
 * @param {{ userId, subjectId?, limit? }} opts
 * @returns {Promise<Array>}
 */
export const getQuizHistory = async ({ userId, subjectId, limit = 50 } = {}) => {
  let query = supabase
    .from('quiz_results')
    .select('*, subjects ( id, name, color_hex, icon )')
    .eq('user_id', userId)
    .order('taken_at', { ascending: false })
    .limit(limit)

  if (subjectId) query = query.eq('subject_id', subjectId)

  const { data, error } = await query
  if (error) throw toError(error)
  return data
}

// ── Aggregate Stats ───────────────────────────────────────────────────────────

/**
 * Compute average accuracy per subject for the user.
 * Returns [{ subjectId, subjectName, avgScore, totalAttempts }]
 *
 * @param {string} userId
 */
export const getAccuracyBySubject = async (userId) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('subject_id, score_pct, subjects ( name, color_hex, icon )')
    .eq('user_id', userId)
    .not('subject_id', 'is', null)

  if (error) throw toError(error)

  const grouped = {}
  data.forEach(({ subject_id, score_pct, subjects: sub }) => {
    if (!grouped[subject_id]) {
      grouped[subject_id] = { subjectId: subject_id, subjectName: sub?.name, ...sub, scores: [] }
    }
    grouped[subject_id].scores.push(Number(score_pct))
  })

  return Object.values(grouped).map((g) => ({
    subjectId:     g.subjectId,
    subjectName:   g.subjectName,
    colorHex:      g.color_hex,
    icon:          g.icon,
    avgScore:      Math.round(g.scores.reduce((a, b) => a + b, 0) / g.scores.length),
    totalAttempts: g.scores.length,
  }))
}

/**
 * Get the best score ever achieved for a specific quiz title.
 * @param {string} userId
 * @param {string} quizTitle
 * @returns {Promise<number|null>} best score percentage
 */
export const getBestScore = async (userId, quizTitle) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('score_pct')
    .eq('user_id', userId)
    .eq('quiz_title', quizTitle)
    .order('score_pct', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return data ? Math.round(Number(data.score_pct)) : null
}
