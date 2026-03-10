import { useState } from 'react';

const MILESTONES = [
    { id: 'math-m1', subject: 'Math', title: 'Algebra Foundations', status: 'completed', desc: 'Linear equations and inequalities.' },
    { id: 'phy-m1', subject: 'Physics', title: 'Kinematics 1D', status: 'completed', desc: 'Motion in a straight line, velocity, acceleration.' },
    { id: 'chem-m1', subject: 'Chemistry', title: 'Atomic Structure', status: 'active', desc: 'Bohr model, quantum numbers, electron configuration.' },
    { id: 'math-m2', subject: 'Math', title: 'Trigonometry', status: 'locked', desc: 'Identities, ratios, and functions.' },
    { id: 'phy-m2', subject: 'Physics', title: 'Newton\'s Laws', status: 'locked', desc: 'Force, mass, and laws of motion.' }
];

const STYLES = {
    Math: 'from-blue-500 to-cyan-400',
    Physics: 'from-violet-500 to-fuchsia-500',
    Chemistry: 'from-emerald-400 to-teal-500'
};

const ICONS = {
    Math: 'calculate',
    Physics: 'rocket_launch',
    Chemistry: 'science'
};

export default function JEEFoundationRoadmap() {
    const [selectedId, setSelectedId] = useState(null);

    return (
        <div className="max-w-3xl mx-auto p-6 bg-slate-50 rounded-3xl dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white">JEE Foundation Roadmap</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Class 8 to 10 Mastery Setup</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="material-symbols-outlined text-white">map</span>
                </div>
            </div>

            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-6 space-y-8 pb-4">
                {MILESTONES.map((milestone) => {
                    const isActive = milestone.status === 'active';
                    const isCompleted = milestone.status === 'completed';
                    const isLocked = milestone.status === 'locked';

                    return (
                        <div key={milestone.id} className="relative pl-8 group">
                            {/* Node */}
                            <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-slate-50 dark:border-slate-900 flex items-center justify-center transition-transform ${isCompleted ? 'bg-indigo-500' : isActive ? 'bg-amber-400 scale-110 shadow-lg shadow-amber-500/20 animate-pulse' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                {isCompleted && <span className="material-symbols-outlined text-white text-[14px]">check</span>}
                            </div>

                            {/* Card */}
                            <div
                                onClick={() => !isLocked && setSelectedId(selectedId === milestone.id ? null : milestone.id)}
                                className={`p-5 rounded-2xl border transition-all duration-300 ${isLocked
                                        ? 'bg-slate-100/50 dark:bg-slate-800/20 border-transparent opacity-60 cursor-not-allowed'
                                        : isActive
                                            ? 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900 shadow-xl shadow-amber-500/5 cursor-pointer ring-1 ring-amber-500/20'
                                            : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-300 hover:shadow-md cursor-pointer'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${STYLES[milestone.subject]} flex items-center justify-center shadow-sm`}>
                                            <span className="material-symbols-outlined text-white text-[16px]">{ICONS[milestone.subject]}</span>
                                        </div>
                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isLocked ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {milestone.subject}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-full font-bold">
                                            IN PROGRESS
                                        </span>
                                    )}
                                </div>

                                <h3 className={`text-lg font-bold mt-1 ${isLocked ? 'text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'}`}>
                                    {milestone.title}
                                </h3>

                                {(!isLocked && (selectedId === milestone.id || isActive)) && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {milestone.desc}
                                        </p>
                                        {isActive && (
                                            <button className="mt-4 w-full py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                                                Resume Learning
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
