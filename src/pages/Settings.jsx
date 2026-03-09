import { useState } from 'react'
import PageHeader from '../components/PageHeader'

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
  const [settings, setSettings] = useState({
    notifications: true,
    dailyReminder: true,
    soundEffects: false,
    darkMode: false,
    streakAlerts: true,
    weeklyReport: true,
  })

  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }))

  const sections = [
    {
      title: 'Notifications',
      items: [
        { key: 'notifications', label: 'Push Notifications', desc: 'Enable all push notifications' },
        { key: 'dailyReminder', label: 'Daily Study Reminder', desc: 'Remind me to study every day' },
        { key: 'streakAlerts', label: 'Streak Alerts', desc: 'Alert when streak is at risk' },
        { key: 'weeklyReport', label: 'Weekly Report', desc: 'Send weekly progress summary' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { key: 'soundEffects', label: 'Sound Effects', desc: 'Play sounds on interactions' },
        { key: 'darkMode', label: 'Dark Mode', desc: 'Switch to dark theme' },
      ],
    },
  ]

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="max-w-lg mx-auto p-4 space-y-6">
        {sections.map(section => (
          <div key={section.title}>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">{section.title}</h3>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-card">
              {section.items.map((item, i) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between px-5 py-4 ${i < section.items.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
                >
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <Toggle checked={settings[item.key]} onChange={val => set(item.key, val)} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Account */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Account</h3>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-card">
            {[
              { label: 'Change Password', icon: 'lock' },
              { label: 'Export Data', icon: 'download' },
              { label: 'Privacy Policy', icon: 'policy' },
              { label: 'Terms of Service', icon: 'gavel' },
            ].map((item, i, arr) => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left ${i < arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''}`}
              >
                <span className="material-symbols-outlined text-slate-500">{item.icon}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                <span className="material-symbols-outlined text-slate-300 ml-auto">chevron_right</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">StudyHub v1.0.0 · Made with ❤️</p>
      </div>
    </div>
  )
}
