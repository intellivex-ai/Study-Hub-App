export default function ProgressBar({ value = 0, colorClass = 'bg-primary', height = 'h-2', showLabel = false }) {
  return (
    <div className="space-y-1">
      {showLabel && (
        <div className="flex justify-between text-sm font-medium">
          <span className="text-slate-600 dark:text-slate-400">Progress</span>
          <span className="text-primary font-bold">{value}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 dark:bg-slate-800 ${height} rounded-full overflow-hidden`}>
        <div
          className={`${colorClass} h-full rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
