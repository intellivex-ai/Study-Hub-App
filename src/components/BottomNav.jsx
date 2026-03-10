import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/subjects', icon: 'book', label: 'Subjects' },
  { to: '/ai-tutor', icon: 'smart_toy', label: 'AI Tutor', center: true },
  { to: '/notes', icon: 'description', label: 'Notes' },
  { to: '/analytics', icon: 'analytics', label: 'Analytics' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-4 left-4 right-4 h-16 glass-card rounded-2xl px-2 py-2 z-50 flex items-center">
      <div className="max-w-xl mx-auto flex justify-between items-center w-full">
        {navItems.map(item =>
          item.center ? (
            <NavLink
              key={item.to}
              to={item.to}
              className="flex flex-col items-center justify-center gap-1 w-1/5 py-1 relative"
            >
              {({ isActive }) => (
                <>
                  <div className={`absolute -top-6 p-3 rounded-full shadow-lg border-4 border-white dark:border-bg-dark transition-colors ${isActive ? 'bg-primary-dark shadow-primary/40' : 'bg-primary shadow-primary/40'}`}>
                    <span className="material-symbols-outlined text-white">smart_toy</span>
                  </div>
                  <div className="h-6" />
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-500 dark:text-slate-400">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 w-1/5 py-1 transition-colors ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}
