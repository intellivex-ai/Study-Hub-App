import { useState, useEffect, useRef } from 'react'
import PageHeader from '../components/PageHeader'

const MODES = [
  { key: 'focus', label: 'Focus', duration: 25 * 60, color: 'text-primary', bg: 'bg-primary' },
  { key: 'short', label: 'Short Break', duration: 5 * 60, color: 'text-emerald-600', bg: 'bg-emerald-500' },
  { key: 'long', label: 'Long Break', duration: 15 * 60, color: 'text-purple-600', bg: 'bg-purple-500' },
]

export default function FocusTimer() {
  const [modeIdx, setModeIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(MODES[0].duration)
  const [running, setRunning] = useState(false)
  const [sessions, setSessions] = useState(0)
  const intervalRef = useRef(null)

  const mode = MODES[modeIdx]
  const total = mode.duration
  const progress = ((total - timeLeft) / total) * 100
  const circumference = 2 * Math.PI * 110

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (mode.key === 'focus') setSessions(s => s + 1)
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

  const changeMode = (idx) => {
    setModeIdx(idx)
    setTimeLeft(MODES[idx].duration)
    setRunning(false)
  }

  const reset = () => {
    setTimeLeft(mode.duration)
    setRunning(false)
  }

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
  const ss = String(timeLeft % 60).padStart(2, '0')

  return (
    <div>
      <PageHeader title="Focus Timer" />
      <div className="max-w-sm mx-auto p-4 space-y-8">
        {/* Mode Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 flex gap-1 border border-slate-200 dark:border-slate-800">
          {MODES.map((m, i) => (
            <button
              key={m.key}
              onClick={() => changeMode(i)}
              className={`flex-1 py-2 px-2 rounded-xl text-sm font-bold transition-all ${
                modeIdx === i
                  ? 'bg-primary text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Timer Ring */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-64 h-64">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="110" fill="none" stroke="#e2e8f0" strokeWidth="12" />
              <circle
                cx="120" cy="120" r="110"
                fill="none"
                stroke={modeIdx === 0 ? '#2563EB' : modeIdx === 1 ? '#10b981' : '#9333ea'}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - progress / 100)}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-bold tabular-nums ${mode.color}`}>{mm}:{ss}</span>
              <span className="text-slate-500 text-sm font-medium mt-1">{mode.label}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={reset}
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined">refresh</span>
            </button>
            <button
              onClick={() => setRunning(r => !r)}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-105 ${
                running
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  : `${mode.bg} text-white shadow-primary/30`
              }`}
            >
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {running ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button
              onClick={() => changeMode((modeIdx + 1) % MODES.length)}
              className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 transition-colors"
            >
              <span className="material-symbols-outlined">skip_next</span>
            </button>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Sessions Today</h3>
            <span className="text-2xl font-bold text-primary">{sessions}</span>
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-full ${i < sessions ? 'bg-primary' : 'bg-slate-100 dark:bg-slate-800'}`}
              />
            ))}
          </div>
          <p className="text-xs text-slate-500">
            {sessions < 4
              ? `${4 - sessions} more sessions until long break recommended`
              : 'Great work! Take a long break.'}
          </p>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Pomodoro Technique</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                25 min focused work → 5 min break. After 4 sessions, take a 15 min break.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
