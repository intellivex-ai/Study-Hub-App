// src/pages/Landing.jsx — Marketing & Polish with Glassmorphism
import { Link } from 'react-router-dom'

export default function Landing() {
    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex flex-col font-sans overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] mix-blend-screen" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-2 group">
                    <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-white text-2xl">auto_stories</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-primary text-glow">StudyHub</h1>
                </div>
                <div className="flex gap-4">
                    <Link to="/login" className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">Log In</Link>
                    <Link to="/signup" className="px-5 py-2 text-sm font-bold bg-primary text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:scale-105 transition-all">Get Started</Link>
                </div>
            </nav>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 -mt-16">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8 animate-float">
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                    StudyHub v2.0 is Live
                </div>

                <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-slate-100 tracking-tighter max-w-4xl mx-auto leading-tight">
                    Supercharge your study sessions with <span className="text-primary text-glow">Artificial Intelligence</span>
                </h1>

                <p className="mt-6 text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium">
                    Generate mind maps instantly, chat with an AI tutor, stay focused with our built-in Pomodoro App Blocker, and track real-time analytics.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/signup" className="px-8 py-4 bg-primary text-white rounded-2xl font-black shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)] hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
                        Start Learning Free
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </Link>
                    <a href="#features" className="px-8 py-4 glass-card rounded-2xl font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:scale-105 active:scale-95 transition-all text-lg flex items-center justify-center gap-2">
                        View Features
                    </a>
                </div>

                {/* Feature Grid */}
                <div id="features" className="mt-32 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                    {[
                        { icon: 'psychology', title: 'AI Study Generator', desc: 'Turn any topic into detailed notes, math formulas, and code snippets powered by AI.' },
                        { icon: 'account_tree', title: 'Interactive Mind Maps', desc: 'Generate complete subject trees in seconds and explore concepts visually.' },
                        { icon: 'block', title: 'Focus App Blocker', desc: 'Lock out distractions like Discord and Steam while the Pomodoro timer tracks your deep work.' }
                    ].map((f, i) => (
                        <div key={i} className="glass-card p-8 rounded-3xl hover:-translate-y-2 transition-transform duration-500">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                <span className="material-symbols-outlined text-3xl text-primary">{f.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-3">{f.title}</h3>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="relative z-10 py-10 text-center text-sm font-medium text-slate-400 mt-20 border-t border-slate-200 dark:border-slate-800">
                &copy; {new Date().getFullYear()} StudyHub. Designed for deep focus.
            </footer>
        </div>
    )
}
