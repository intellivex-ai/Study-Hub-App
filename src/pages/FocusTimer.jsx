// src/pages/FocusTimer.jsx — Zen Mode with Premium Visuals
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import * as studyService from '../services/studyService'
import { useParams, Link } from 'react-router-dom'

const MODES = [
  { key: 'focus', label: 'Focus', duration: 25 * 60, color: 'text-primary', bg: 'bg-primary', icon: 'psychology' },
  { key: 'short', label: 'Short Break', duration: 5 * 60, color: 'text-emerald-500', bg: 'bg-emerald-500', icon: 'coffee' },
  { key: 'long', label: 'Long Break', duration: 15 * 60, color: 'text-purple-500', bg: 'bg-purple-500', icon: 'self_improvement' },
]

export default function FocusTimer() {
  const { user } = useAuth()
  const { subjectId } = useParams()
  const [modeIdx, setModeIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const [sessionId, setSessionId] = useState(null)

  const containerRef = useRef(null)
  const intervalRef = useRef(null)
  const ringRef = useRef(null)

  const mode = MODES[modeIdx]
  const total = mode.duration
  const progress = ((total - timeLeft) / total) * 100
  const circumference = 2 * Math.PI * 110

  // Animation on Mount
  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.8, ease: "power4.out" })
  }, [])

  // Floating animation for the ring when running
  useEffect(() => {
    if (running) {
      gsap.to(ringRef.current, { y: -10, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" })
    } else {
      gsap.to(ringRef.current, { y: 0, duration: 1, ease: "bounce.out" })
    }
  }, [running])

  // Load today's counts
  useEffect(() => {
    if (!user) return
    studyService.getTodayFocusCount(user.id).then(setSessions)
  }, [user])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            handleTimerComplete()
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

  // Session Tracking
  useEffect(() => {
    if (running && !sessionId && user && mode.key === 'focus') {
      studyService.startSession({
        userId: user.id,
        subjectId,
        sessionType: 'focus',
        durationMin: mode.duration / 60
      }).then(setSessionId)
    }
  }, [running, sessionId, user, mode.key, subjectId])

  const handleTimerComplete = async () => {
    setRunning(false)
    // Play completion sound effect could go here
    if (mode.key === 'focus') {
      setSessions(s => s + 1)
      if (sessionId && user) {
        try {
          await studyService.endSession({
            sessionId,
            userId: user.id,
            actualMin: mode.duration / 60,
            completed: true
          })
          setSessionId(null)
        } catch (err) { console.error('Failed to end session:', err) }
      }
    }
  }

  const changeMode = (idx) => {
    setModeIdx(idx)
    setTimeLeft(MODES[idx].duration)
    setRunning(false)
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      <PageHeader
        title="Zen Mode"
        actions={
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Focus Engine v2.0</span>
          </div>
        }
      />

      <div className="flex flex-col lg:flex-row gap-12 items-center justify-center pt-8">

        {/* ── Timer Section ── */}
        <div className="flex flex-col items-center gap-10">

          <div ref={ringRef} className="relative w-80 h-80 flex items-center justify-center">
            {/* Background Glow */}
            <div className={`absolute inset-10 rounded-full blur-[60px] opacity-20 transition-colors duration-1000 ${modeIdx === 0 ? 'bg-primary' : modeIdx === 1 ? 'bg-emerald-500' : 'bg-purple-500'}`} />

            <svg className="w-full h-full -rotate-90 drop-shadow-2xl" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="110" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 dark:text-slate-800" />
              <circle
                cx="120" cy="120" r="110"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}
                className={`transition-all duration-1000 ease-linear ${modeIdx === 0 ? 'text-primary' : modeIdx === 1 ? 'text-emerald-500' : 'text-purple-500'}`}
                style={{ filter: 'drop-shadow(0 0 8px currentColor)' }}
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`material-symbols-outlined text-3xl mb-1 ${mode.color} transition-colors duration-500`}>{mode.icon}</span>
              <span className="text-6xl font-black tabular-nums tracking-tighter text-slate-900 dark:text-slate-100 drop-shadow-sm">
                {mm}<span className="opacity-20 inline-block px-0.5">:</span>{ss}
              </span>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mt-2">{mode.label}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="glass-card p-4 rounded-full flex items-center gap-6 shadow-2xl">
            <button
              onClick={() => setTimeLeft(mode.duration)}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 transition-all text-slate-400 hover:text-primary active:scale-95"
            >
              <span className="material-symbols-outlined text-2xl">restart_alt</span>
            </button>
            <button
              onClick={() => setRunning(r => !r)}
              className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-90 ${running
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                : `${mode.bg} text-white shadow-primary/40`
                }`}
            >
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {running ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              onClick={() => changeMode((modeIdx + 1) % MODES.length)}
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 transition-all text-slate-400 hover:text-primary active:scale-95"
            >
              <span className="material-symbols-outlined text-2xl">skip_next</span>
            </button>
          </div>
        </div>

        {/* ── Info Column ── */}
        <div className="w-full max-w-sm space-y-6">

          {/* Mode Tabs */}
          <div className="glass-card p-1.5 rounded-2xl flex gap-1">
            {MODES.map((m, i) => (
              <button
                key={m.key}
                onClick={() => changeMode(i)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${modeIdx === i
                  ? `${m.bg} text-white shadow-lg`
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <span className="material-symbols-outlined text-sm">{m.icon}</span>
                <span className="hidden sm:inline">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Daily Goal / Sessions */}
          <div className="glass-card p-6 rounded-3xl space-y-6 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between relative z-10">
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100">Sessions Completed</h3>
                <p className="text-xs text-slate-500 font-medium">Daily target: 8 sessions (4h)</p>
              </div>
              <span className="text-3xl font-black text-primary">{sessions}</span>
            </div>

            <div className="flex gap-2 relative z-10">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-2 rounded-full transition-all duration-700 ${i < sessions ? 'bg-primary shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-slate-100 dark:bg-slate-800'}`}
                />
              ))}
            </div>

            <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-2xl border border-primary/10">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-sm">info</span>
                {sessions < 4
                  ? `${4 - sessions} sessions until a long break is recommended.`
                  : sessions < 8 ? "You're doing great! Keep the momentum." : "Daily goal achieved! Time to recharge."}
              </p>
            </div>
          </div>

          {/* Tips / Zen Thoughts */}
          <div className="p-6 text-center italic text-slate-400 text-sm font-medium">
            "The secret of getting ahead is getting started."
          </div>

          <Link to="/analytics" className="w-full glass-card p-4 rounded-2xl flex items-center justify-between group hover:border-primary/50 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-500">
                <span className="material-symbols-outlined">analytics</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Deep Analytics</p>
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Review your efficiency</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
          </Link>
        </div>

      </div>
    </div>
  )
}
