import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const features = [
  { icon: 'school', text: 'Learn from expert-curated content' },
  { icon: 'groups', text: 'Join 100,000+ students worldwide' },
  { icon: 'emoji_events', text: 'Track progress & earn achievements' },
  { icon: 'smart_toy', text: 'AI-powered personal tutor' },
]

export default function SignUp() {
  const { signUp, authError, clearAuthError, isLoading } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [emailSent, setEmailSent] = useState(false)

  const loading = submitting || isLoading

  const set = (key, val) => { clearAuthError(); setForm(prev => ({ ...prev, [key]: val })) }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.password) e.password = 'Password is required'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSubmitting(true)
    const result = await signUp({ fullName: form.name, email: form.email, password: form.password })
    setSubmitting(false)
    // signUp returns 'confirm-email' when Supabase email confirmation is required
    if (result === 'confirm-email') setEmailSent(true)
    // On success (true) useAuth navigates to /dashboard automatically
  }

  const strength = (() => {
    const p = form.password
    if (!p) return 0
    let s = 0
    if (p.length >= 8) s++
    if (/[A-Z]/.test(p)) s++
    if (/[0-9]/.test(p)) s++
    if (/[^A-Za-z0-9]/.test(p)) s++
    return s
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength]
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'][strength]

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark font-display flex items-center justify-center p-4">
      <div className="max-w-5xl w-full grid lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl">

        {/* ── Left: Branding panel ── */}
        <div className="hidden lg:flex flex-col justify-between p-12 bg-primary relative overflow-hidden">
          {/* Blobs */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10 flex items-center gap-2 text-white">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            <span className="text-2xl font-bold tracking-tight">StudyHub</span>
          </div>

          {/* Headline */}
          <div className="relative z-10 space-y-6">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Master any subject with the power of community.
            </h1>
            <p className="text-blue-100 text-base leading-relaxed">
              Join over 100,000 students worldwide sharing notes, joining study groups, and achieving their goals together.
            </p>

            {/* Feature list */}
            <ul className="space-y-3 mt-4">
              {features.map(f => (
                <li key={f.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-white text-base">{f.icon}</span>
                  </div>
                  <span className="text-blue-100 text-sm font-medium">{f.text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats row */}
          <div className="relative z-10 grid grid-cols-3 gap-4">
            {[
              { value: '100K+', label: 'Students' },
              { value: '500+', label: 'Courses' },
              { value: '98%', label: 'Satisfaction' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-blue-200 text-xs font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Form ── */}
        <div className="p-8 lg:p-12 flex flex-col justify-center">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 text-primary mb-8">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_stories</span>
            <span className="text-2xl font-bold tracking-tight">StudyHub</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1">Create Account</h2>
            <p className="text-slate-500 dark:text-slate-400">Join the StudyHub community today</p>
          </div>

          {/* Email confirmation banner */}
          {emailSent && (
            <div className="mb-4 flex items-start gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl text-sm border border-emerald-200 dark:border-emerald-800">
              <span className="material-symbols-outlined text-base mt-0.5 shrink-0">mark_email_read</span>
              <span>Almost there! Check your inbox and click the confirmation link to activate your account, then log in.</span>
            </div>
          )}

          {/* Auth error banner */}
          {authError && !emailSent && (
            <div className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm border border-red-200 dark:border-red-800">
              <span className="material-symbols-outlined text-base">error</span>{authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">person</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="John Doe"
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all text-sm ${errors.name ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-primary'
                    }`}
                />
              </div>
              {errors.name && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">mail</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="name@example.com"
                  className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all text-sm ${errors.email ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-primary'
                    }`}
                />
              </div>
              {errors.email && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">lock</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-12 pr-12 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 rounded-xl outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 transition-all text-sm ${errors.password ? 'border-red-400 focus:border-red-400' : 'border-transparent focus:border-primary'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>

              {/* Password strength */}
              {form.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-slate-200 dark:bg-slate-700'}`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${['', 'text-red-500', 'text-orange-500', 'text-yellow-600', 'text-emerald-600'][strength]}`}>
                    {strengthLabel} password
                  </p>
                </div>
              )}

              {errors.password && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-sm">error</span>{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-70 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account…
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-900 text-slate-400">Or continue with</span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2.5 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button className="flex items-center justify-center gap-2.5 px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300">
              <svg className="w-5 h-5 dark:fill-white fill-slate-800" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              Apple
            </button>
          </div>

          {/* Login link */}
          <p className="mt-8 text-center text-slate-600 dark:text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-4 decoration-2">
              Log In
            </Link>
          </p>
          <p className="mt-3 text-center text-xs text-slate-400">
            By signing up, you agree to our{' '}
            <a href="#" className="underline hover:text-primary">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
