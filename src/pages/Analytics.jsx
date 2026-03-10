// src/pages/Analytics.jsx — real Supabase data via studyService + useSubjects + useAuth
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import { useAuth } from '../hooks/useAuth'
import { useSubjects } from '../hooks/useSubjects'
import { getWeeklySummary } from '../services/studyService'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

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

// Calculate study habits from weekly data
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

  const containerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    )
  }, [])

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

  const weekTotalMins = weeklyData.reduce((a, d) => a + d.minutes, 0)
  const weekH = Math.floor(weekTotalMins / 60)
  const weekM = weekTotalMins % 60

  const maxMins = Math.max(...weeklyData.map((d) => d.minutes), 1)
  const habits = calcHabits(rawSessions)

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto p-4 space-y-8 pb-20">
      <PageHeader
        title="Visual Mastery"
        actions={
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tracking Live</span>
            <button className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined text-primary text-base">calendar_month</span>
              This Week
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-8">
          {/* Weekly Study Time Chart */}
          <section className="glass-card p-8 rounded-3xl">
            <div className="flex justify-between items-start mb-10">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Performance</p>
                {loadingChart
                  ? <div className="h-10 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  : <h1 className="text-4xl font-black text-slate-900 dark:text-slate-100">{weekH}h <span className="text-primary">{weekM}m</span></h1>
                }
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800/30">
                  +12% vs last week
                </span>
              </div>
            </div>

            <div className="h-64 flex items-end justify-between gap-3 px-2">
              {loadingChart ? (
                [1, 2, 3, 4, 5, 6, 7].map(i => (
                  <div key={i} className="flex-1 h-full flex flex-col justify-end">
                    <div className="w-full rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ height: `${20 + i * 10}%` }} />
                  </div>
                ))
              ) : (
                weeklyData.map((d, i) => {
                  const label = d.minutes >= 60 ? `${Math.floor(d.minutes / 60)}h` : d.minutes > 0 ? `${d.minutes}m` : '0'
                  const pct = (d.minutes / maxMins) * 100
                  return (
                    <div key={i} className="flex flex-col items-center gap-3 flex-1 group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md mb-1">
                        {label}
                      </div>
                      <div className="w-full relative h-48 flex items-end">
                        <div className="w-full bg-slate-100 dark:bg-slate-800/50 rounded-2xl absolute inset-0" />
                        <div
                          className="w-full bg-primary rounded-2xl relative z-10 transition-all duration-1000 ease-out"
                          style={{ height: `${Math.max(pct, 5)}%`, boxShadow: '0 4px 20px rgba(37, 99, 235, 0.2)' }}
                        >
                          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl" />
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase">{d.day}</span>
                    </div>
                  )
                })
              )}
            </div>
          </section>

          {/* Subject Mastery Radar */}
          <section className="glass-card p-8 rounded-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">radar</span>
                Subject Mastery
              </h3>
            </div>
            {subjects.length > 0 ? (
              <div className="h-72 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={subjects}>
                    <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} stroke="#334155" />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    />
                    <Radar
                      name="Progress %"
                      dataKey="progress"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fill="#3b82f6"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-6 text-xs text-slate-400 font-medium text-center">Add subjects to see your mastery radar!</p>
            )}
          </section>
        </div>

        <div className="space-y-8">
          {[
            { icon: 'schedule', label: 'Study Hours', value: (totalMins / 60).toFixed(1) + 'h', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
            { icon: 'category', label: 'Subjects', value: subjects.length, color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
            { icon: 'local_fire_department', label: 'Day Streak', value: streak, color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20', fill: true },
          ].map((s) => (
            <div key={s.label} className="glass-card p-6 rounded-3xl flex items-center gap-5">
              <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center flex-shrink-0 animate-float`}>
                <span className="material-symbols-outlined text-3xl" style={s.fill ? { fontVariationSettings: "'FILL' 1" } : {}}>
                  {s.icon}
                </span>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{s.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100">{s.value}</p>
              </div>
            </div>
          ))}

          <section className="glass-card p-6 rounded-3xl">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">psychology</span>
              Focus Distribution
            </h3>
            {rawSessions.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No completed sessions yet.</p>
            ) : (
              <div className="space-y-6">
                {habits.map((h) => (
                  <div key={h.label} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">{h.label}</span>
                      <span className="text-primary">{h.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${h.color} transition-all duration-1000`}
                        style={{ width: `${h.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

      </div>
    </div>
  )
}
