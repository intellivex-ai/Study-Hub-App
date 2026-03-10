// src/pages/Dashboard.jsx
// ─────────────────────────────────────────────────────────────────────────────
// 100% real Supabase data — no hardcoded demo values.
// Enhanced with Glassmorphism and Daily Goal tracking.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
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
        <div key={i} className="flex-shrink-0 w-48 h-28 glass-card rounded-2xl overflow-hidden relative">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-100/50 dark:via-slate-700/20 to-transparent" />
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { profile, user } = useAuth()
  const { subjects, stats, loading: subjectsLoading } = useSubjects()

  const containerRef = useRef(null)

  // Recent Activity state
  const [recentNotes, setRecentNotes] = useState([])
  const [recentQuizzes, setRecentQuizzes] = useState([])
  const [latestLesson, setLatestLesson] = useState(null)

  useEffect(() => {
    gsap.fromTo('.gsap-card',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" }
    )
  }, [])

  // Fetch Latest Lesson & Recent Activity
  useEffect(() => {
    if (!user) return
      ; (async () => {
        const { supabase } = await import('../services/supabaseClient')
        const { getNotes } = await import('../services/notesService')
        const { getQuizHistory } = await import('../services/quizService')

        // Latest incomplete lesson
        const { data: lessonData } = await supabase
          .from('lessons')
          .select('id, title, module, thumbnail_url, video_url, duration_sec, is_completed, subjects(name, color_hex)')
          .eq('user_id', user.id)
          .eq('is_completed', false)
          .order('sort_order', { ascending: true })
          .limit(1)
          .maybeSingle()
        setLatestLesson(lessonData ?? null)

        // Recent Notes
        try {
          const notes = await getNotes({ userId: user.id })
          setRecentNotes(notes.slice(0, 3))
        } catch (err) { console.error('Notes fetch error:', err) }

        // Recent Quizzes
        try {
          const quizzes = await getQuizHistory({ userId: user.id, limit: 3 })
          setRecentQuizzes(quizzes || [])
        } catch (err) { console.error('Quiz fetch error:', err) }
      })()
  }, [user])

  const streak = stats?.streak ?? profile?.streak ?? 0
  const firstName = (stats?.full_name ?? profile?.full_name ?? user?.email ?? 'Student')
    .split(' ')[0]
    .replace(/@.+/, '')

  const totalMins = stats?.total_study_minutes ?? profile?.total_study_minutes ?? 0
  const totalHours = (totalMins / 60).toFixed(1)
  const dailyTargetHours = 2
  const goalProgress = Math.min((totalHours / dailyTargetHours) * 100, 100)

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto p-4 space-y-8 pb-20">

      {/* ── Welcome & Stats ── */}
      <section className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 glass-card gsap-card p-10 rounded-3xl relative overflow-hidden group border-t border-l border-white/60 dark:border-slate-700/50 bg-gradient-to-br from-white/80 to-slate-50/20 dark:from-slate-800/80 dark:to-slate-900/40">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-8xl">auto_stories</span>
          </div>
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back, <span className="text-primary">{firstName}</span> 👋
            </h2>
            <p className="text-slate-500 dark:text-slate-400 italic font-medium max-w-md">
              "The beautiful thing about learning is that no one can take it away from you."
            </p>
            <div className="pt-8 flex flex-wrap gap-4">
              <Link to="/ai-tutor" className="bg-gradient-to-br from-indigo-500 to-cyan-500 text-white px-8 py-3 rounded-2xl font-bold transition-all hover:-translate-y-1 shadow-glow premium-button">
                Ask AI Tutor
              </Link>
              <Link to="/notes" className="bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 px-8 py-3 rounded-2xl font-bold transition-all border border-slate-200 dark:border-slate-700 premium-button hover:-translate-y-1">
                Continue Notes
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:w-80 flex flex-col gap-6">
          {/* Daily Goal Card */}
          <div className="glass-card gsap-card p-8 rounded-3xl flex flex-col items-center text-center justify-center">
            <div className="relative w-24 h-24 mb-3">
              <svg className="w-full h-full -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100 dark:text-slate-800" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * goalProgress) / 100} strokeLinecap="round" className="text-primary transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-slate-900 dark:text-slate-100">{goalProgress.toFixed(0)}%</span>
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daily Goal</p>
            <p className="text-sm font-medium text-slate-400">{dailyTargetHours}h study target</p>
          </div>

          <div className="flex gap-6">
            <div className="flex-1 glass-card gsap-card p-5 rounded-3xl flex flex-col items-center">
              <span className="material-symbols-outlined text-orange-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              <span className="text-lg font-black mt-1 leading-none">{streak}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Streak</span>
            </div>
            <div className="flex-1 glass-card gsap-card p-5 rounded-3xl flex flex-col items-center">
              <span className="material-symbols-outlined text-indigo-500 text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
              <span className="text-lg font-black mt-1 leading-none">{totalHours}h</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Study</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Dashboard Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning */}
          {latestLesson && (
            <section>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <span className="material-symbols-outlined text-primary">play_circle</span>
                Continue Learning
              </h3>
              <Link
                to={`/lesson/${latestLesson.id}`}
                className="group relative glass-card gsap-card rounded-[2rem] overflow-hidden shadow-soft hover:shadow-premium-hover dark:hover:shadow-premium-dark hover:-translate-y-1 transition-all duration-300 block border border-transparent hover:border-indigo-500/30"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5 aspect-video md:aspect-auto md:h-48 bg-slate-200 relative overflow-hidden">
                    {latestLesson.thumbnail_url
                      ? <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={latestLesson.thumbnail_url} alt={latestLesson.title} />
                      : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary text-5xl">play_lesson</span>
                        </div>
                      )
                    }
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      {latestLesson.subjects && (
                        <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border border-primary/20">
                          {latestLesson.subjects.name}
                        </span>
                      )}
                      <h4 className="text-xl font-extrabold mt-3 text-slate-900 dark:text-slate-100 leading-tight">{latestLesson.title}</h4>
                      {latestLesson.module && (
                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">{latestLesson.module}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {/* Quick Actions */}
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <span className="material-symbols-outlined text-primary">bolt</span>
              Power Tools
            </h3>
            <div className="glass-card gsap-card p-6 rounded-[2rem]">
              <QuickActions />
            </div>
          </section>

          {/* Subjects */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                <span className="material-symbols-outlined text-primary">category</span>
                Knowledge Library
                <span className="flex items-center gap-1.5 ml-1 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
                </span>
              </h3>
              <Link to="/subjects" className="text-primary text-xs font-black uppercase tracking-widest hover:underline">See All</Link>
            </div>

            {subjectsLoading ? (
              <SubjectSkeleton />
            ) : subjects.length === 0 ? (
              <div className="text-center py-12 glass-card gsap-card rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-700">
                <span className="material-symbols-outlined text-slate-300 text-5xl">school</span>
                <p className="text-sm text-slate-400 mt-2 font-medium">No subjects yet. Start your journey!</p>
              </div>
            ) : (
              <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
                {subjects.map((s) => (
                  <SubjectCard key={s.id} subject={s} compact />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Activity & Focus */}
        <div className="space-y-8">
          {/* Recent Activity */}
          <section>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-slate-200">
              <span className="material-symbols-outlined text-primary">history</span>
              Recent Activity
            </h3>
            <div className="glass-card gsap-card rounded-[2rem] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/50">
              {[...recentNotes.map(n => ({ ...n, type: 'note' })), ...recentQuizzes.map(q => ({ ...q, type: 'quiz' }))]
                .sort((a, b) => new Date(b.updated_at || b.taken_at || b.created_at) - new Date(a.updated_at || a.taken_at || a.created_at))
                .slice(0, 5)
                .map((item, idx) => (
                  <div key={idx} className="p-4 flex items-start gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className={`p-2 rounded-xl flex-shrink-0 ${item.type === 'quiz' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                      <span className="material-symbols-outlined text-lg">
                        {item.type === 'quiz' ? 'quiz' : 'description'}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.title || (item.type === 'quiz' ? `Quiz: ${item.subjects?.name || item.quiz_title || 'General'}` : 'Untitled Note')}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">
                        {item.type === 'quiz' ? `Scored ${item.score_pct || 0}%` : 'Updated Note'} • {new Date(item.updated_at || item.taken_at || item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              {recentNotes.length === 0 && recentQuizzes.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 font-medium">No recent activity</div>
              )}
            </div>
          </section>

          {/* Focus Timer CTA */}
          <section>
            <Link
              to="/focus"
              className="group glass-card gsap-card p-8 rounded-[2rem] block relative overflow-hidden border border-transparent hover:border-indigo-500/30 transition-all duration-300 shadow-soft hover:shadow-premium-hover hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">
                <span className="material-symbols-outlined text-6xl">timer</span>
              </div>
              <div className="relative z-10">
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">Enter Zen Mode</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">Boost your focus with our Pomodoro engine. Your mins are tracked.</p>
                <div className="mt-4 flex items-center gap-1 text-primary text-xs font-black uppercase tracking-widest">
                  Start Session <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </div>
              </div>
            </Link>
          </section>
        </div>

      </div>
    </div>
  )
}
