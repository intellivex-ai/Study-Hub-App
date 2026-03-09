import { useNavigate } from 'react-router-dom'

const actions = [
  { label: 'Learn', icon: 'school', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600', to: '/lesson/1' },
  { label: 'Practice', icon: 'edit_note', bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600', to: '/practice' },
  { label: 'Revise', icon: 'style', bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600', to: '/flashcards' },
  { label: 'Focus', icon: 'timer', bg: 'bg-red-100 dark:bg-red-900/40', text: 'text-red-600', to: '/focus' },
]

export default function QuickActions() {
  const navigate = useNavigate()
  return (
    <section className="grid grid-cols-4 gap-3">
      {actions.map(a => (
        <button
          key={a.label}
          onClick={() => navigate(a.to)}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/40 transition-all flex flex-col items-center gap-3 cursor-pointer shadow-card hover:shadow-card-hover"
        >
          <div className={`w-12 h-12 rounded-full ${a.bg} ${a.text} flex items-center justify-center`}>
            <span className="material-symbols-outlined">{a.icon}</span>
          </div>
          <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{a.label}</span>
        </button>
      ))}
    </section>
  )
}
