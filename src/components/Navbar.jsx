// src/components/Navbar.jsx — uses real auth data from useAuth()
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

export default function Navbar() {
  const [search, setSearch] = useState('')
  const { user, profile } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Build avatar: prefer profile avatar_url, else gravatar-style initial from email
  const avatarUrl = profile?.avatar_url ?? null
  const displayName = profile?.full_name ?? user?.email ?? ''
  const initials = displayName
    ? displayName.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const themeIcons = {
    light: 'light_mode',
    dark: 'dark_mode',
    pookie: 'favorite'
  }

  return (
    <nav className="sticky top-0 z-50 glass-nav px-6 h-16 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <div className="bg-gradient-to-br from-indigo-500 to-cyan-500 p-2 rounded-xl flex items-center justify-center group-hover:scale-105 group-active:scale-95 transition-all shadow-glow">
          <span className="material-symbols-outlined text-white text-xl">auto_stories</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-primary transition-colors">StudyHub</h1>
      </Link>

      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl group-focus-within:text-primary transition-colors">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-medium shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
            placeholder="Search courses, notes..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2.5 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 premium-button border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={`Switch Theme (Current: ${theme})`}
        >
          <span className={`material-symbols-outlined text-lg ${theme === 'pookie' ? 'text-pink-500' : ''}`}>
            {themeIcons[theme]}
          </span>
        </button>

        <button className="p-2.5 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 premium-button border border-transparent hover:border-slate-200 dark:hover:border-slate-700 relative">
          <span className="material-symbols-outlined text-lg">notifications</span>
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
        </button>

        {profile && (
          <div className="hidden sm:flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800 shadow-sm mr-2">
            <span className="material-symbols-outlined text-amber-500 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 leading-none">Level {profile.level || 1}</span>
              <span className="text-[10px] font-semibold text-amber-700/70 dark:text-amber-300/70 leading-none mt-0.5">{profile.xp || 0} XP</span>
            </div>
          </div>
        )}

        <Link to="/profile" className="ml-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 overflow-hidden border border-white/20 flex items-center justify-center premium-button">
            {avatarUrl
              ? <img alt={displayName} src={avatarUrl} className="w-full h-full object-cover" />
              : <span className="text-white text-sm font-bold tracking-wider">{initials}</span>
            }
          </div>
        </Link>
      </div>
    </nav>
  )
}
