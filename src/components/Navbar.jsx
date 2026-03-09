// src/components/Navbar.jsx — uses real auth data from useAuth()
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const [search, setSearch] = useState('')
  const { user, profile } = useAuth()

  // Build avatar: prefer profile avatar_url, else gravatar-style initial from email
  const avatarUrl = profile?.avatar_url ?? null
  const displayName = profile?.full_name ?? user?.email ?? ''
  const initials = displayName
    ? displayName.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
      <Link to="/dashboard" className="flex items-center gap-2">
        <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-2xl">auto_stories</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-primary">StudyHub</h1>
      </Link>

      <div className="hidden md:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all text-sm"
            placeholder="Search courses, notes..."
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 relative">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-bg-dark" />
        </button>
        <Link to="/profile">
          <div className="w-10 h-10 rounded-full bg-primary overflow-hidden border-2 border-primary/20 flex items-center justify-center">
            {avatarUrl
              ? <img alt={displayName} src={avatarUrl} className="w-full h-full object-cover" />
              : <span className="text-white text-sm font-bold">{initials}</span>
            }
          </div>
        </Link>
      </div>
    </nav>
  )
}
