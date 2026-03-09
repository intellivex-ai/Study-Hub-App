import { useNavigate } from 'react-router-dom'

export default function PageHeader({ title, actions }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-bg-dark/80 backdrop-blur-md px-4 h-14 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-400"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-lg font-bold tracking-tight">{title}</h1>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  )
}
