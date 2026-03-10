// src/pages/Subjects.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Live Supabase data via useSubjects() — subjects update in real time.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect } from 'react'
import gsap from 'gsap'
import SubjectCard from '../components/SubjectCard'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import { useSubjects } from '../hooks/useSubjects'

// Map Supabase color_hex to Tailwind icon/bar/text classes (best-effort)
function resolveColorClasses(colorHex = '#2563EB') {
  const map = {
    '#3b82f6': { text: 'text-blue-500', bar: 'bg-blue-500' },
    '#10b981': { text: 'text-emerald-500', bar: 'bg-emerald-500' },
    '#f97316': { text: 'text-orange-500', bar: 'bg-orange-500' },
    '#ec4899': { text: 'text-pink-500', bar: 'bg-pink-500' },
    '#8b5cf6': { text: 'text-violet-500', bar: 'bg-violet-500' },
    '#06b6d4': { text: 'text-cyan-500', bar: 'bg-cyan-500' },
  }
  return map[colorHex] ?? { text: 'text-indigo-500', bar: 'bg-indigo-500' }
}

// Enrich Supabase row to match SubjectCard expected shape
function enrichSubject(s) {
  const { text, bar } = resolveColorClasses(s.color_hex)
  return {
    ...s,
    colorHex: s.color_hex,
    textClass: text,
    barClass: bar,
  }
}

export default function Subjects() {
  const { subjects: raw, loading, error } = useSubjects()
  const subjects = raw.map(enrichSubject)

  const avgProgress = subjects.length
    ? Math.round(subjects.reduce((a, s) => a + (s.progress ?? 0), 0) / subjects.length)
    : 0
  const totalChapters = subjects.reduce((a, s) => a + (s.chapters ?? 0), 0)

  useEffect(() => {
    if (!loading) {
      gsap.fromTo('.gsap-card',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
      )
    }
  }, [loading])

  return (
    <div className="pb-10">
      <PageHeader title="My Subjects" />
      <div className="max-w-2xl mx-auto p-4 space-y-8">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Subjects', value: subjects.length, icon: 'book', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400' },
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: 'trending_up', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' },
            { label: 'Chapters', value: totalChapters, icon: 'menu_book', color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card gsap-card rounded-2xl p-5 border border-white/40 dark:border-slate-700/50 shadow-soft text-center hover:-translate-y-1 transition-transform">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center mx-auto mb-3 shadow-inner`}>
                <span className="material-symbols-outlined text-2xl">{stat.icon}</span>
              </div>
              <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{loading ? '—' : stat.value}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 dark:border-red-800">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 glass-card rounded-3xl overflow-hidden relative">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 dark:via-slate-700/20 to-transparent" />
              </div>
            ))}
          </div>
        )}

        {/* Subject Cards Grid */}
        {!loading && subjects.length > 0 && (
          <div className="grid grid-cols-2 gap-5">
            {subjects.map((s) => (
              <div key={s.id} className="gsap-card">
                <SubjectCard subject={s} />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && subjects.length === 0 && (
          <div className="text-center py-20 premium-panel gsap-card border border-dashed border-slate-300 dark:border-slate-700">
            <span className="material-symbols-outlined text-slate-200 dark:text-slate-700/50 text-7xl">school</span>
            <p className="font-extrabold text-xl text-slate-800 dark:text-slate-200 mt-4">No subjects yet</p>
            <p className="text-sm font-medium text-slate-400 mt-1">Generate subjects with the AI Tutor or check your Supabase schema.</p>
          </div>
        )}

        {/* Overall Progress */}
        {!loading && subjects.length > 0 && (
          <div className="premium-panel gsap-card p-8 space-y-6">
            <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Overall Progress</h3>
            <div className="space-y-5">
              {subjects.map((s) => (
                <div key={s.id} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`material-symbols-outlined text-lg ${s.textClass}`}>{s.icon || 'menu_book'}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{s.name}</span>
                    </div>
                    <span className={`font-black tracking-wide ${s.textClass}`}>{s.progress ?? 0}%</span>
                  </div>
                  <ProgressBar value={s.progress ?? 0} colorClass={s.barClass} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
