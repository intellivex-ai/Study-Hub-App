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
                  <div className={`absolute -top-6 p-4 rounded-3xl shadow-lg border border-white/10 transition-all duration-300 ${isActive ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-glow -translate-y-2' : 'bg-slate-800 shadow-soft hover:-translate-y-1'}`}>
                    <span className="material-symbols-outlined text-white">smart_toy</span>
                  </div>
                  <div className="h-6" />
                  <span className={`text-[10px] font-bold uppercase tracking-tighter ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
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
                  <div className="relative flex flex-col items-center">
                    <span
                      className="material-symbols-outlined text-2xl transition-all duration-300"
                      style={isActive ? { fontVariationSettings: "'FILL' 1", transform: 'scale(1.1)' } : {}}
                    >
                      {item.icon}
                    </span>
                    {isActive && (
                      <div className="absolute -bottom-3 w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-glow" />
                    )}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-tighter mt-1">{item.label}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  )
}
