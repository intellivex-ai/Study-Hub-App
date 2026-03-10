// src/pages/AppBlocker.jsx
import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import gsap from 'gsap'
import * as studyService from '../services/studyService'
import { useAuth } from '../hooks/useAuth'

export default function AppBlocker() {
    const [blockedApps, setBlockedApps] = useState([])
    const [newApp, setNewApp] = useState('')

    const { user } = useAuth()

    useEffect(() => {
        if (!user) return

        // Load from Supabase (with localStorage fallback)
        studyService.getBlockedApps(user.id).then(apps => {
            if (apps && apps.length > 0) {
                setBlockedApps(apps)
                localStorage.setItem('studyhub_blocked_apps', JSON.stringify(apps))
            } else {
                const saved = JSON.parse(localStorage.getItem('studyhub_blocked_apps') || '[]')
                if (saved.length > 0) {
                    setBlockedApps(saved)
                } else {
                    const defaultApps = ['discord.exe', 'steam.exe', 'Spotify.exe']
                    setBlockedApps(defaultApps)
                    localStorage.setItem('studyhub_blocked_apps', JSON.stringify(defaultApps))
                }
            }
        }).catch(err => {
            console.error('Failed to fetch blocked apps:', err)
        })
    }, [user])

    const handleAddApp = (e) => {
        e.preventDefault()
        if (!newApp.trim()) return

        // Add simple .exe if user didn't provide extension (Windows assumption, can be adjusted)
        const appName = newApp.trim().toLowerCase()
        const appToAdd = appName.includes('.') ? appName : `${appName}.exe`

        if (!blockedApps.includes(appToAdd)) {
            const updated = [...blockedApps, appToAdd]
            setBlockedApps(updated)
            localStorage.setItem('studyhub_blocked_apps', JSON.stringify(updated))
            if (user) studyService.updateBlockedApps(user.id, updated)
        }
        setNewApp('')
    }

    const handleRemoveApp = (appToRemove) => {
        const updated = blockedApps.filter(app => app !== appToRemove)
        setBlockedApps(updated)
        localStorage.setItem('studyhub_blocked_apps', JSON.stringify(updated))
        if (user) studyService.updateBlockedApps(user.id, updated)
    }

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8 pb-20">
            <PageHeader
                title="App Blocker Settings"
                actions={
                    <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active in Zen Mode</span>
                    </div>
                }
            />

            <div className="glass-card gsap-card p-10 rounded-[2.5rem] space-y-8 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/60 dark:border-slate-700/50 shadow-soft">
                <div>
                    <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-3 text-slate-900 dark:text-slate-100">
                        <span className="material-symbols-outlined text-rose-500 text-3xl">block</span>
                        Distraction List
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        These applications will be automatically blocked or closed when you start a Zen Mode Focus Session.
                        Make sure to include the ".exe" extension (e.g., discord.exe).
                    </p>
                </div>

                <form onSubmit={handleAddApp} className="flex gap-4">
                    <div className="relative flex-1 group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">add_task</span>
                        <input
                            type="text"
                            value={newApp}
                            onChange={(e) => setNewApp(e.target.value)}
                            placeholder="Add an app to block (e.g. steam.exe)"
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-100/50 dark:bg-slate-800/50 border border-transparent rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm font-semibold shadow-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!newApp.trim()}
                        className="px-8 flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-bold rounded-2xl shadow-glow premium-button hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:transform-none"
                    >
                        <span className="material-symbols-outlined text-lg">add</span> Add
                    </button>
                </form>

                <div className="bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-inner">
                    {blockedApps.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-700/50 text-6xl mb-3">verified</span>
                            <p className="font-bold text-slate-500 dark:text-slate-400">No apps blocked.</p>
                            <p className="text-sm text-slate-400 mt-1 font-medium">You are free to be distracted, but we don't recommend it!</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-100 dark:divide-slate-800/40">
                            {blockedApps.map((app) => (
                                <li key={app} className="flex items-center justify-between p-5 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-300 group backdrop-blur-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-500 border border-orange-100 dark:border-orange-800/50 flex items-center justify-center shadow-sm">
                                            <span className="material-symbols-outlined">desktop_windows</span>
                                        </div>
                                        <span className="font-extrabold text-slate-800 dark:text-slate-200 tracking-wide">{app}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveApp(app)}
                                        className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all duration-300 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-110 active:scale-95"
                                        title="Remove from blocklist"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    )
}
