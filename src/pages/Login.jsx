// src/pages/Login.jsx — wired to Supabase Auth via useAuth()
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login, loginWithOAuth, authError, clearAuthError, isLoading } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const set = (key, val) => { clearAuthError(); setForm(prev => ({ ...prev, [key]: val })) }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    await login({ email: form.email, password: form.password })
    setSubmitting(false)
  }

  const loading = submitting || isLoading

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark font-display flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="pt-10 pb-6 px-8 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-primary text-white p-2 rounded-xl">
              <span className="material-symbols-outlined block text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            </div>
            <h2 className="text-slate-900 dark:text-slate-100 text-2xl font-bold tracking-tight">StudyHub</h2>
          </div>
          <div className="w-full h-44 rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-white dark:from-primary/20 dark:to-bg-dark flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <path d="M44.7,-76.4C58.3,-69.2,70,-58.1,78.5,-44.7C87,-31.3,92.3,-15.7,91.1,-0.7C89.9,14.3,82.2,28.6,72.7,40.9C63.2,53.2,51.8,63.5,38.8,71.5C25.8,79.5,12.9,85.2,-0.9,86.7C-14.7,88.2,-29.4,85.4,-42.9,78.1C-56.4,70.8,-68.7,59,-77.6,45.2C-86.4,31.4,-91.9,15.7,-91.3,0.4C-90.6,-14.9,-83.8,-29.8,-74.2,-42.3C-64.6,-54.8,-52.1,-64.9,-38.6,-72.3C-25.1,-79.6,-12.5,-84.3,1.3,-86.5C15.1,-88.7,30.3,-83.5,44.7,-76.4Z" fill="#2563EB" transform="translate(100 100)" />
              </svg>
            </div>
            {[{c:'top-3 left-4',ic:'science',t:'text-primary'},{c:'top-5 right-6',ic:'functions',t:'text-orange-500'},{c:'bottom-4 left-8',ic:'experiment',t:'text-emerald-500'},{c:'bottom-3 right-5',ic:'psychology',t:'text-pink-500'}].map(({c,ic,t})=>(
              <div key={ic} className={`absolute ${c} w-9 h-9 bg-white/80 dark:bg-slate-800/80 rounded-lg flex items-center justify-center shadow-sm`}>
                <span className={`material-symbols-outlined text-lg ${t}`}>{ic}</span>
              </div>
            ))}
            <div className="relative z-10 text-center">
              <h1 className="text-slate-900 dark:text-slate-100 text-2xl font-bold mb-1">Welcome Back</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Empowering your learning journey</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-10">
          {authError && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-base">error</span>{authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium mb-2" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
                <input id="email" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all text-sm" />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="block text-slate-700 dark:text-slate-300 text-sm font-medium" htmlFor="password">Password</label>
                <button type="button" className="text-primary text-sm font-medium hover:underline">Forgot Password?</button>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
                <input id="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-primary rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all text-sm" />
                <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-70 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
              {loading ? <><svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Signing In…</> : 'Sign In'}
            </button>
          </form>

          <div className="relative my-7"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800" /></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-white dark:bg-slate-900 text-slate-400">Or continue with</span></div></div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => loginWithOAuth('google')} className="flex items-center justify-center gap-2.5 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>Google
            </button>
            <button onClick={() => loginWithOAuth('apple')} className="flex items-center justify-center gap-2.5 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
              <svg className="w-5 h-5 dark:fill-white fill-slate-800" viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>Apple
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm">Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-semibold hover:underline underline-offset-4">Sign Up</Link>
            </p>
          </div>
        </div>
      </div>
      <footer className="mt-8 flex gap-6 text-slate-400 text-xs">
        <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
        <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
      </footer>
    </div>
  )
}
