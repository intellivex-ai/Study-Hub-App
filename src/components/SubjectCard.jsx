import { useNavigate } from 'react-router-dom'
import ProgressBar from './ProgressBar'

export default function SubjectCard({ subject, compact = false }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/subjects/${subject.id}`)}
      className={`bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-card hover:shadow-card-hover hover:border-primary/30 transition-all cursor-pointer flex flex-col gap-4 ${
        compact ? 'p-4 min-w-[180px]' : 'p-5'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg ${subject.bgClass} ${subject.textClass} flex items-center justify-center`}>
        <span className="material-symbols-outlined">{subject.icon}</span>
      </div>
      <div>
        <h4 className="font-bold text-slate-800 dark:text-slate-200">{subject.name}</h4>
        <p className="text-xs text-slate-500">{subject.chapters} Chapters</p>
      </div>
      <div className="space-y-1.5">
        <ProgressBar value={subject.progress} colorClass={subject.barClass} height="h-1.5" />
        <p className="text-[10px] font-bold text-slate-400">{subject.progress}% COMPLETE</p>
      </div>
    </div>
  )
}
