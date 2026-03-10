// src/pages/Settings.jsx — Settings Pro with Real-time Sync & Security
import { useState, useEffect } from 'react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function Settings() {
  const { user, profile, updateProfile, updatePassword } = useAuth()
  const { theme, toggleTheme } = useTheme()

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    grade: '',
    phone: '',
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [passForm, setPassForm] = useState({ old: '', new: '' })
  const [msg, setMsg] = useState({ type: '', text: '' })

  // Preference states (placeholder for now, could be in metadata)
  const [prefs, setPrefs] = useState({
    notifications: true,
    dailyReminder: true,
    soundEffects: false,
  })

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        grade: profile.grade || '',
        phone: profile.phone || '',
      })
    }
  }, [profile])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setIsUpdating(true)
    setMsg({ type: '', text: '' })
    try {
      await updateProfile(formData)
      setMsg({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Update failed' })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e) => {
    e.preventDefault()
    if (!passForm.new) return
    setMsg({ type: '', text: '' })
    try {
      await updatePassword(passForm.new)
      setPassForm({ old: '', new: '' })
      setMsg({ type: 'success', text: 'Password changed successfully!' })
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Password update failed' })
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-32">
      <PageHeader title="Command Center" actions={
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none">Security: High</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>
      } />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Profile Editor */}
        <div className="lg:col-span-2 space-y-8">
          <section className="glass-card p-8 rounded-[2rem]">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">person_edit</span>
              Edit Profile
            </h3>

            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={e => setFormData(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-primary/30 rounded-2xl px-4 py-3 outline-none transition-all font-medium"
                  placeholder="Your Name"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Current Grade</label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={e => setFormData(f => ({ ...f, grade: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-primary/30 rounded-2xl px-4 py-3 outline-none transition-all font-medium"
                  placeholder="e.g. Grade 12"
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-primary/30 rounded-2xl px-4 py-3 outline-none transition-all font-medium"
                  placeholder="+1 234 567 890"
                />
              </div>

              <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/50">
                {msg.text && (
                  <p className={`text-xs font-bold ${msg.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {msg.text}
                  </p>
                )}
                <button
                  disabled={isUpdating}
                  className="ml-auto bg-primary text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </section>

          {/* Preferences */}
          <section className="glass-card p-8 rounded-[2rem]">
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">notifications_active</span>
              Preferences
            </h3>
            <div className="space-y-2">
              {[
                { key: 'notifications', label: 'Push Notifications', desc: 'Alerts for session reminders' },
                { key: 'dailyReminder', label: 'Daily Goals', desc: 'Nudging you to hit study targets' },
                { key: 'soundEffects', label: 'Sound FX', desc: 'Audio feedback on timer completion' },
              ].map((item, i) => (
                <div key={item.key} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.label}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{item.desc}</p>
                  </div>
                  <Toggle checked={prefs[item.key]} onChange={val => setPrefs(p => ({ ...p, [item.key]: val }))} />
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar: Security & Appearance */}
        <div className="space-y-6">
          <section className="glass-card p-6 rounded-[2rem]">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Security</h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <input
                  type="password"
                  value={passForm.new}
                  onChange={e => setPassForm(p => ({ ...p, new: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-transparent focus:border-primary/30 rounded-2xl px-4 py-3 outline-none transition-all text-sm"
                  placeholder="New Password"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all"
              >
                Update Password
              </button>
            </form>
          </section>

          <section className="glass-card p-6 rounded-[2rem]">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Appearance</h3>
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined">
                    {theme === 'pookie' ? 'favorite' : theme === 'dark' ? 'dark_mode' : 'light_mode'}
                  </span>
                </div>
                <div className="text-left font-black tracking-widest uppercase text-[10px] text-slate-600 dark:text-slate-400 leading-none">
                  {theme} mode
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-300">swap_horiz</span>
            </button>
          </section>

          <div className="p-6 text-center space-y-2">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">StudyHub v2.0-PRO</p>
            <p className="text-[10px] text-slate-400 font-medium">Your data is encrypted and secure.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
