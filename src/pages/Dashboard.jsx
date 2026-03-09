// src/pages/Dashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// 100% real Supabase data — no hardcoded demo values.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import SubjectCard from '../components/SubjectCard'
import QuickActions from '../components/QuickActions'
import ProgressBar from '../components/ProgressBar'
import { useSubjects } from '../hooks/useSubjects'
import { useAuth } from '../hooks/useAuth'

function SubjectSkeleton() {
  return (
    <div className="flex gap-4 pb-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex-shrink-0 w-40 h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const { subjects, stats, loading: subjectsLoading } = useSubjects()

  // Latest incomplete lesson from Supabase
  const [latestLesson, setLatestLesson] = useState(null)

  useEffect(() => {
    if (!user) return
      ; (async () => {
        const { supabase } = await import('../services/supabaseClient')
        const { data } = await supabase
          .from('lessons')
          .select('id, title, module, thumbnail_url, video_url, duration_sec, is_completed, subjects(name, color_hex)')
          .eq('user_id', user.id)
          .eq('is_completed', false)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle()
        setLatestLesson(data ?? null)
      })()
  }, [user])

  const streak = stats?.streak ?? profile?.streak ?? 0
  const firstName = (stats?.full_name ?? profile?.full_name ?? user?.email ?? 'Student')
    .split(' ')[0]
    .replace(/@.+/, '')       // strip email domain if using email
  const totalMins = stats?.total_study_minutes ?? profile?.total_study_minutes ?? 0
  const totalHours = (totalMins / 60).toFixed(1)

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">

      {/* ── Welcome ── */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Welcome back, {firstName} 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 italic font-light max-w-md text-sm">
            "The beautiful thing about learning is that no one can take it away from you."
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Streak */}
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/30 px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="bg-orange-500 text-white p-1.5 rounded-lg flex items-center">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
            </div>
            <div>
              <p className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase tracking-wider">Daily Streak</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-tight">{streak} Days</p>
            </div>
          </div>

          {/* Study Hours */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/30 px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="bg-indigo-500 text-white p-1.5 rounded-lg flex items-center">
              <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
            </div>
            <div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Study Hours</p>
              <p className="text-lg font-bold text-slate-800 dark:text-slate-200 leading-tight">{totalHours}h</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Continue Learning (only shown if there's a real incomplete lesson) ── */}
      {latestLesson && (
        <section>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">play_circle</span>
            Continue Learning
          </h3>
          <Link
            to={`/lesson/${latestLesson.id}`}
            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow block"
          >
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/3 aspect-video md:aspect-auto md:h-48 bg-slate-200 relative">
                {latestLesson.thumbnail_url
                  ? <img className="w-full h-full object-cover" src={latestLesson.thumbnail_url} alt={latestLesson.title} />
                  : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-5xl">play_lesson</span>
                    </div>
                  )
                }
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  {latestLesson.subjects && (
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                      {latestLesson.subjects.name}
                    </span>
                  )}
                  <h4 className="text-xl font-bold mt-2 text-slate-900 dark:text-slate-100">{latestLesson.title}</h4>
                  {latestLesson.module && (
                    <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{latestLesson.module}</p>
                  )}
                </div>
                <button className="mt-6 w-full md:w-auto px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined">play_arrow</span>
                  Resume Lesson
                </button>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Quick Actions ── */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">bolt</span>
          Quick Actions
        </h3>
        <QuickActions />
      </section>

      {/* ── My Subjects (LIVE) ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">category</span>
            My Subjects
            <span className="flex items-center gap-1 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Live</span>
            </span>
          </h3>
          <Link to="/subjects" className="text-primary text-sm font-bold hover:underline">View All</Link>
        </div>

        {subjectsLoading ? (
          <SubjectSkeleton />
        ) : subjects.length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            <span className="material-symbols-outlined text-slate-300 text-5xl">school</span>
            <p className="text-sm text-slate-400 mt-2">No subjects yet. Run the Supabase schema to seed defaults.</p>
            <Link to="/subjects" className="text-primary text-sm font-semibold mt-1 hover:underline block">
              Go to Subjects →
            </Link>
          </div>
        ) : (
          <div className="flex overflow-x-auto gap-4 pb-2 hide-scrollbar">
            {subjects.map((s) => (
              <SubjectCard key={s.id} subject={s} compact />
            ))}
          </div>
        )}
      </section>

      {/* ── Focus Timer CTA (replaces hardcoded schedule) ── */}
      <section>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">timer</span>
          Ready to Focus?
        </h3>
        <Link
          to="/focus"
          className="flex items-center gap-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-card hover:shadow-card-hover transition-shadow"
        >
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>timer</span>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Start a Focus Session</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Use the Pomodoro timer to study with focus. Your session time is tracked automatically.</p>
          </div>
          <span className="material-symbols-outlined text-slate-400">chevron_right</span>
        </Link>
      </section>

    </div>
  )
}
