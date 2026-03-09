// src/pages/Analytics.jsx — real Supabase data via studyService + useSubjects + useAuth
import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import { useAuth } from '../hooks/useAuth'
import { useSubjects } from '../hooks/useSubjects'
import { getWeeklySummary } from '../services/studyService'

// Resolve a bar color from a hex
function barClass(hex = '#2563EB') {
  const m = {
    '#3b82f6': 'bg-blue-500', '#10b981': 'bg-emerald-500',
    '#f97316': 'bg-orange-500', '#ec4899': 'bg-pink-500',
    '#8b5cf6': 'bg-violet-500', '#06b6d4': 'bg-cyan-500',
  }
  return m[hex] ?? 'bg-indigo-500'
}

function iconBgClass(hex = '#2563EB') {
  const m = {
    '#3b82f6': 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    '#10b981': 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    '#f97316': 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    '#ec4899': 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
    '#8b5cf6': 'text-violet-500 bg-violet-50 dark:bg-violet-900/20',
    '#06b6d4': 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  }
  return m[hex] ?? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
}

// Calculate study habits from weekly data (morning/afternoon/evening buckets)
// Since study_sessions has started_at time, we can infer time-of-day distribution
// For now we compute from actual sessions via a separate lightweight query
function calcHabits(sessions) {
  const buckets = { morning: 0, afternoon: 0, evening: 0 }
  sessions.forEach(({ started_at, actual_min }) => {
    const h = new Date(started_at).getHours()
    const mins = actual_min ?? 0
    if (h >= 6 && h < 12) buckets.morning += mins
    if (h >= 12 && h < 18) buckets.afternoon += mins
    if (h >= 18 && h < 24) buckets.evening += mins
  })
  const total = buckets.morning + buckets.afternoon + buckets.evening || 1
  return [
    { label: 'Morning (6–12)', pct: Math.round(buckets.morning / total * 100), color: 'bg-amber-400' },
    { label: 'Afternoon (12–18)', pct: Math.round(buckets.afternoon / total * 100), color: 'bg-primary' },
    { label: 'Evening (18–24)', pct: Math.round(buckets.evening / total * 100), color: 'bg-purple-500' },
  ]
}

export default function Analytics() {
  const { user, profile } = useAuth()
  const { subjects, stats } = useSubjects()

  const [weeklyData, setWeeklyData] = useState([])
  const [rawSessions, setRawSessions] = useState([])
  const [loadingChart, setLoadingChart] = useState(true)

  useEffect(() => {
    if (!user) return
      ; (async () => {
        try {
          const data = await getWeeklySummary(user.id)
          setWeeklyData(data)
        } catch { /* no sessions yet */ } finally {
          setLoadingChart(false)
        }
      })()
  }, [user])

  // Fetch raw sessions for the study habits breakdown
  useEffect(() => {
    if (!user) return
      ; (async () => {
        const { supabase } = await import('../services/supabaseClient')
        const since = new Date()
        since.setDate(since.getDate() - 6)
        const { data } = await supabase
          .from('study_sessions')
          .select('started_at, actual_min')
          .eq('user_id', user.id)
          .eq('completed', true)
          .gte('started_at', since.toISOString())
        if (data) setRawSessions(data)
      })()
  }, [user])

  const streak = stats?.streak ?? profile?.streak ?? 0
  const totalMins = stats?.total_study_minutes ?? profile?.total_study_minutes ?? 0

  // Weekly study hours total
  const weekTotalMins = weeklyData.reduce((a, d) => a + d.minutes, 0)
  const weekH = Math.floor(weekTotalMins / 60)
  const weekM = weekTotalMins % 60

  const maxMins = Math.max(...weeklyData.map((d) => d.minutes), 1)
  const habits = calcHabits(rawSessions)

  return (
    <div>
      <PageHeader
        title="Analytics"
        actions={
          <button className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-sm">
            <span className="material-symbols-outlined text-primary text-base">calendar_month</span>
            This Week
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
        }
      />
      <div className="max-w-2xl mx-auto p-4 space-y-5">

        {/* Weekly Study Time Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-card border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Weekly Study Time</h2>
              {loadingChart
                ? <div className="h-9 w-32 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mt-1" />
                : (
                  <>
                    <p className="text-3xl font-bold mt-1">
                      {weekH}h {weekM}m
                    </p>
                    {weekTotalMins === 0 && (
                      <p className="text-sm text-slate-400 mt-1">No sessions recorded this week yet</p>
                    )}
                  </>
                )
              }
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              Live
            </span>
          </div>

          {/* Bar chart */}
          {loadingChart ? (
            <div className="flex items-end justify-between h-40 gap-2 px-1">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex-1 h-full flex flex-col justify-end">
                  <div className="w-full rounded-t-lg bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ height: `${30 + i * 10}%` }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-end justify-between h-40 gap-2 px-1">
              {weeklyData.map((d, i) => {
                const h = Math.floor(d.minutes / 60)
                const m = d.minutes % 60
                const label = d.minutes >= 60 ? `${h}h` : d.minutes > 0 ? `${m}m` : '0'
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1">
                    <span className="text-[10px] font-bold text-slate-400">{label}</span>
                    <div
                      className="w-full rounded-t-lg bg-primary/10 dark:bg-primary/5 relative overflow-hidden"
                      style={{ height: `${(d.minutes / maxMins) * 100}%`, minHeight: 8 }}
                    >
                      <div className="absolute bottom-0 w-full bg-primary rounded-t-lg" style={{ height: '100%' }} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{d.day}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'schedule', label: 'Study Hours', value: (totalMins / 60).toFixed(1) + 'h', color: 'text-primary bg-blue-50 dark:bg-blue-900/20' },
            { icon: 'category', label: 'Subjects', value: subjects.length, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
            { icon: 'local_fire_department', label: 'Day Streak', value: streak, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', fill: true },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-card border border-slate-100 dark:border-slate-800 text-center">
              <div className={`w-10 h-10 ${s.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <span className="material-symbols-outlined text-xl" style={s.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {s.icon}
                </span>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Performance by Subject */}
        <div>
          <h3 className="text-lg font-bold mb-3">Performance by Subject</h3>
          {subjects.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-100 dark:border-slate-800 shadow-card">
              <span className="material-symbols-outlined text-slate-300 text-5xl">school</span>
              <p className="text-sm text-slate-400 mt-2">No subjects yet. Add subjects to see performance.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((s) => (
                <div key={s.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-card border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgClass(s.color_hex)}`}>
                      <span className="material-symbols-outlined">{s.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{s.name}</h4>
                          <p className="text-xs text-slate-500">{s.chapters} chapters</p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-bold text-lg">{s.progress ?? 0}%</p>
                          <p className="text-xs text-slate-400 font-medium">progress</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <ProgressBar value={s.progress ?? 0} colorClass={barClass(s.color_hex)} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Study Habits */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 shadow-card border border-slate-100 dark:border-slate-800">
          <h3 className="font-bold mb-4">Study Habits</h3>
          {rawSessions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No completed sessions yet — start a Focus Timer session!</p>
          ) : (
            <div className="space-y-3">
              {habits.map((h) => (
                <div key={h.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">{h.label}</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{h.pct}%</span>
                  </div>
                  <ProgressBar value={h.pct} colorClass={h.color} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
