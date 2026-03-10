// src/pages/Profile.jsx — Profile Pro with Glassmorphism & Achievements
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import gsap from 'gsap'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import { useAuth } from '../hooks/useAuth'
import { useSubjects } from '../hooks/useSubjects'
import { useTheme } from '../hooks/useTheme'

// Badge Definitions
const BADGES = [
  { id: 'early_bird', icon: 'wb_sunny', label: 'Early Bird', detail: 'Studied before 8AM', color: 'text-amber-500' },
  { id: 'streak_3', icon: 'local_fire_department', label: '3 Day Streak', detail: 'Consistency is key', color: 'text-orange-500' },
  { id: 'hour_10', icon: 'military_tech', label: '10h Scholar', detail: 'Deep focus master', color: 'text-blue-500' },
  { id: 'quiz_hero', icon: 'workspace_premium', label: 'Quiz Hero', detail: '90%+ in 5 quizzes', color: 'text-emerald-500' },
]

export default function Profile() {
  const { user, profile, logout } = useAuth()
  const { subjects } = useSubjects()
  const { theme, toggleTheme } = useTheme()
  const containerRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(containerRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" })
  }, [])

  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student'
  const email = profile?.email || user?.email || ''
  const grade = profile?.grade || 'Student'
  const avatarUrl = profile?.avatar_url || null
  const streak = profile?.streak || 0
  const totalHours = ((profile?.total_study_minutes ?? 0) / 60).toFixed(1)
  const initials = displayName.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)

  const handleSignOut = async (e) => {
    e.preventDefault()
    await logout()
  }

  return (
    <div ref={containerRef} className="max-w-6xl mx-auto p-4 space-y-8 pb-32">
      <PageHeader title="Identity" actions={
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Status</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Left Column: Personal Card & Settings ── */}
        <div className="space-y-6">
          <div className="glass-card rounded-[2rem] overflow-hidden group">
            <div className="h-24 bg-gradient-to-br from-primary to-indigo-600 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] animate-pulse" />
            </div>
            <div className="px-6 pb-8 text-center">
              <div className="relative -mt-12 mb-4 mx-auto w-24 h-24">
                <div className="w-24 h-24 rounded-3xl border-4 border-white dark:border-slate-900 shadow-2xl overflow-hidden bg-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                    : <span className="text-white text-3xl font-black">{initials}</span>
                  }
                </div>
                <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-lg border border-slate-100 dark:border-slate-700 flex items-center justify-center hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                </button>
              </div>

              <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{displayName}</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{email}</p>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/20">
                  {grade}
                </span>
                <span className="px-3 py-1 rounded-lg bg-orange-100/50 dark:bg-orange-900/20 text-orange-600 text-[10px] font-black uppercase tracking-wider border border-orange-200/50 dark:border-orange-800/30 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
                  {streak} Day Streak
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[2rem] space-y-4">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest px-1">Appearance</h3>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-primary/20 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">
                    {theme === 'pookie' ? 'favorite' : theme === 'dark' ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">System Vibe</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{theme}</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">swap_horiz</span>
            </button>
            <Link to="/settings" className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all border border-transparent hover:border-primary/20 group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-slate-500">
                  <span className="material-symbols-outlined">settings</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Account Settings</p>
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Profile & Security</p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm font-black uppercase tracking-widest">Sign Out</span>
            </button>
          </div>
        </div>

        {/* ── Mid/Right: Achievements & Knowledge ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: 'schedule', val: totalHours + 'h', label: 'Study Time', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
              { icon: 'auto_stories', val: subjects.length, label: 'Subjects', color: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20' },
              { icon: 'verified', val: 'PRO', label: 'Account', color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' },
            ].map((s, i) => (
              <div key={i} className="glass-card p-6 rounded-3xl flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mb-3`}>
                  <span className="material-symbols-outlined text-2xl">{s.icon}</span>
                </div>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none">{s.val}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Achievement Badges */}
          <section className="glass-card p-8 rounded-[2rem]">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">emoji_events</span>
              Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BADGES.map((b) => (
                <div key={b.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-transparent hover:border-primary/10 transition-all flex items-center gap-4 group">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-white dark:bg-slate-900 shadow-sm transition-transform group-hover:rotate-12 ${b.color}`}>
                    <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{b.icon}</span>
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-800 dark:text-slate-200 leading-tight">{b.label}</p>
                    <p className="text-[10px] uppercase font-black text-slate-400 mt-1 tracking-wider">{b.detail}</p>
                  </div>
                  <div className="ml-auto opacity-20">
                    <span className="material-symbols-outlined text-xl">verified</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Knowledge Mastery */}
          <section className="glass-card p-8 rounded-[2rem]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">data_exploration</span>
                Knowledge Flow
              </h3>
              <Link to="/analytics" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">Full Analytics</Link>
            </div>

            <div className="space-y-6">
              {subjects.slice(0, 4).map((s) => (
                <div key={s.id} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-sm">
                        <span className="material-symbols-outlined text-lg">{s.icon || 'book'}</span>
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-sm">{s.name}</span>
                    </div>
                    <span className="text-xs font-black text-primary">{s.progress ?? 0}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-1000 ease-out"
                      style={{ width: `${s.progress ?? 0}%`, boxShadow: '0 0 15px rgba(37,99,235,0.2)' }}
                    />
                  </div>
                </div>
              ))}
              {subjects.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm font-medium text-slate-400 italic">Start studying to build your mastery flow.</p>
                </div>
              )}
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}
