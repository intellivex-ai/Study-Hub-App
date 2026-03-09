// src/pages/Subjects.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Live Supabase data via useSubjects() — subjects update in real time.
// ─────────────────────────────────────────────────────────────────────────────
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

  return (
    <div>
      <PageHeader title="My Subjects" />
      <div className="max-w-2xl mx-auto p-4 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Subjects', value: subjects.length, icon: 'book', color: 'text-primary bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Avg Progress', value: `${avgProgress}%`, icon: 'trending_up', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Chapters', value: totalChapters, icon: 'menu_book', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-card text-center">
              <div className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center mx-auto mb-2`}>
                <span className="material-symbols-outlined text-xl">{stat.icon}</span>
              </div>
              <p className="text-xl font-bold">{loading ? '—' : stat.value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</p>
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
          <div className="grid grid-cols-2 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Subject Cards Grid */}
        {!loading && subjects.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {subjects.map((s) => (
              <SubjectCard key={s.id} subject={s} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && subjects.length === 0 && (
          <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-slate-300 text-6xl">school</span>
            <p className="font-semibold text-slate-500 mt-3">No subjects yet</p>
            <p className="text-sm text-slate-400 mt-1">Check your Supabase database — run the schema SQL to seed default subjects.</p>
          </div>
        )}

        {/* Overall Progress */}
        {!loading && subjects.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-200">Overall Progress</h3>
            {subjects.map((s) => (
              <div key={s.id} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-base ${s.textClass}`}>{s.icon}</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                  </div>
                  <span className="font-bold text-slate-600 dark:text-slate-400">{s.progress ?? 0}%</span>
                </div>
                <ProgressBar value={s.progress ?? 0} colorClass={s.barClass} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
