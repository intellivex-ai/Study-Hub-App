// src/pages/Profile.jsx — real Supabase data via useAuth() + useSubjects()
import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import { useAuth } from '../hooks/useAuth'
import { useSubjects } from '../hooks/useSubjects'

const menuItems = [
  { icon: 'settings', label: 'Settings', to: '/settings', color: 'text-slate-600' },
  { icon: 'notifications', label: 'Notifications', to: '/settings', color: 'text-slate-600' },
  { icon: 'palette', label: 'Appearance', to: '/settings', color: 'text-slate-600' },
  { icon: 'help', label: 'Help & Support', to: '/settings', color: 'text-slate-600' },
  { icon: 'logout', label: 'Sign Out', to: '/login', color: 'text-red-500' },
]

function resolveBarClass(colorHex = '#2563EB') {
  const map = {
    '#3b82f6': 'bg-blue-500',
    '#10b981': 'bg-emerald-500',
    '#f97316': 'bg-orange-500',
    '#ec4899': 'bg-pink-500',
    '#8b5cf6': 'bg-violet-500',
    '#06b6d4': 'bg-cyan-500',
  }
  return map[colorHex] ?? 'bg-indigo-500'
}

function resolveIconClass(colorHex = '#2563EB') {
  const map = {
    '#3b82f6': 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    '#10b981': 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    '#f97316': 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    '#ec4899': 'text-pink-500 bg-pink-50 dark:bg-pink-900/20',
    '#8b5cf6': 'text-violet-500 bg-violet-50 dark:bg-violet-900/20',
    '#06b6d4': 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  }
  return map[colorHex] ?? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
}

export default function Profile() {
  const { user, profile, logout } = useAuth()
  const { subjects, loading: subjectsLoading } = useSubjects()

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
    <div>
      <PageHeader title="Profile" actions={
        <Link to="/settings" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
          <span className="material-symbols-outlined text-slate-600 dark:text-slate-400">settings</span>
        </Link>
      } />
      <div className="max-w-lg mx-auto p-4 space-y-5">

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-card">
          <div className="h-20 bg-gradient-to-r from-primary to-blue-400" />
          <div className="px-5 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-900 shadow-lg overflow-hidden bg-primary flex items-center justify-center">
                {avatarUrl
                  ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
                  : <span className="text-white text-2xl font-bold">{initials}</span>
                }
              </div>
              <Link to="/settings" className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined text-base">edit</span>
                Edit
              </Link>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{displayName}</h2>
            <p className="text-slate-500 text-sm">{email}</p>
            <span className="inline-block mt-2 text-xs bg-primary/10 text-primary font-bold px-2 py-1 rounded-full">
              {grade}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Study Hours', value: totalHours, icon: 'schedule', color: 'text-primary bg-blue-50 dark:bg-blue-900/20' },
            { label: 'Subjects', value: subjects.length, icon: 'book', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' },
            { label: 'Day Streak', value: streak, icon: 'local_fire_department', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-card text-center">
              <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center mx-auto mb-2`}>
                <span className="material-symbols-outlined text-lg">{s.icon}</span>
              </div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Subject Progress */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-card">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4">Subject Progress</h3>
          {subjectsLoading && (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => <div key={i} className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg" />)}
            </div>
          )}
          {!subjectsLoading && subjects.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No subjects yet. Add subjects from the Subjects page.</p>
          )}
          <div className="space-y-3">
            {subjects.map((s) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${resolveIconClass(s.color_hex)}`}>
                  <span className="material-symbols-outlined text-base">{s.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{s.name}</span>
                    <span className="font-bold text-slate-600 dark:text-slate-400">{s.progress ?? 0}%</span>
                  </div>
                  <ProgressBar value={s.progress ?? 0} colorClass={resolveBarClass(s.color_hex)} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
          {menuItems.map((item, i) => (
            item.label === 'Sign Out'
              ? (
                <button
                  key={item.label}
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                  <span className={`font-medium ${item.color}`}>{item.label}</span>
                  <span className="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
                </button>
              )
              : (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${i < menuItems.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                >
                  <span className={`material-symbols-outlined ${item.color}`}>{item.icon}</span>
                  <span className={`font-medium ${item.color}`}>{item.label}</span>
                  <span className="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
                </Link>
              )
          ))}
        </div>

      </div>
    </div>
  )
}
