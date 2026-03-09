// src/hooks/useStudySession.js
// ─────────────────────────────────────────────────────────────────────────────
// Integrates the Pomodoro timer with the study_sessions backend.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'
import { startSession, endSession, getWeeklySummary } from '../services/studyService'

/**
 * @example
 *   const {
 *     timeLeft, running, mode, sessions,
 *     weeklySummary,
 *     start, pause, reset, switchMode,
 *   } = useStudySession({ subjectId: physics.id })
 */
export function useStudySession({ subjectId } = {}) {
  const { user } = useAuth()

  const MODES = {
    focus:       { label: 'Focus',       durationMin: 25 },
    short_break: { label: 'Short Break', durationMin: 5  },
    long_break:  { label: 'Long Break',  durationMin: 15 },
  }

  const [mode,     setMode]     = useState('focus')
  const [timeLeft, setTimeLeft] = useState(MODES.focus.durationMin * 60)
  const [running,  setRunning]  = useState(false)
  const [sessions, setSessions] = useState(0)        // completed focus sessions
  const [weeklySummary, setWeeklySummary] = useState([])

  const sessionIdRef  = useRef(null)  // current DB session row ID
  const startTimeRef  = useRef(null)  // when we started the current session
  const intervalRef   = useRef(null)

  // ── Load weekly summary on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    getWeeklySummary(user.id).then(setWeeklySummary).catch(console.error)
  }, [user])

  // ── Timer tick ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            _handleSessionComplete()
            return 0
          }
          return t - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  // ── Actions ─────────────────────────────────────────────────────────────────

  const start = useCallback(async () => {
    if (running) return
    setRunning(true)
    startTimeRef.current = Date.now()

    if (user && mode === 'focus') {
      try {
        sessionIdRef.current = await startSession({
          userId:      user.id,
          subjectId,
          sessionType: mode,
          durationMin: MODES[mode].durationMin,
        })
      } catch (err) {
        console.error('[StudySession] Failed to start session:', err)
      }
    }
  }, [running, user, mode, subjectId])

  const pause = useCallback(async () => {
    setRunning(false)
    if (sessionIdRef.current && user) {
      const elapsed = Math.round((Date.now() - (startTimeRef.current ?? Date.now())) / 60000)
      try {
        await endSession({
          sessionId: sessionIdRef.current,
          userId:    user.id,
          actualMin: elapsed,
          completed: false,
        })
      } catch (err) {
        console.error('[StudySession] Failed to save paused session:', err)
      }
      sessionIdRef.current = null
    }
  }, [user])

  const reset = useCallback(() => {
    setRunning(false)
    setTimeLeft(MODES[mode].durationMin * 60)
    sessionIdRef.current = null
  }, [mode])

  const switchMode = useCallback((newMode) => {
    setRunning(false)
    setMode(newMode)
    setTimeLeft(MODES[newMode].durationMin * 60)
    sessionIdRef.current = null
  }, [])

  // ── Internal: timer finished ─────────────────────────────────────────────────
  async function _handleSessionComplete() {
    setRunning(false)
    const durationMin = MODES[mode].durationMin

    if (mode === 'focus') {
      setSessions((s) => s + 1)
      if (sessionIdRef.current && user) {
        try {
          await endSession({
            sessionId: sessionIdRef.current,
            userId:    user.id,
            actualMin: durationMin,
            completed: true,
          })
          // Refresh weekly summary
          const summary = await getWeeklySummary(user.id)
          setWeeklySummary(summary)
        } catch (err) {
          console.error('[StudySession] Failed to end session:', err)
        }
        sessionIdRef.current = null
      }
    }

    // Auto-advance to break
    const nextMode = sessions > 0 && (sessions + 1) % 4 === 0 ? 'long_break' : 'short_break'
    if (mode === 'focus') switchMode(nextMode)
    else switchMode('focus')
  }

  // Formatted time string: "25:00"
  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}`

  const totalSeconds = MODES[mode].durationMin * 60
  const progressPct  = ((totalSeconds - timeLeft) / totalSeconds) * 100

  return {
    timeLeft,
    formattedTime,
    running,
    mode,
    sessions,
    progressPct,
    weeklySummary,
    modeLabel: MODES[mode].label,
    start,
    pause,
    reset,
    switchMode,
  }
}
