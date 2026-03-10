// src/components/ai/WeakTopicDetector.jsx
import { useEffect, useState } from 'react';
import { IntellivexAI } from '../../services/intellivexAi';
import { useAuth } from '../../hooks/useAuth';

export default function WeakTopicDetector() {
    const { user } = useAuth();
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAnalysis() {
            try {
                // In production, fetch recentScores from your local Dexie DB
                const analysis = await IntellivexAI.analyzeWeakTopics(user.id, []);
                setTopics(analysis);
            } catch (err) {
                console.error("Failed to analyze topics", err);
            } finally {
                setLoading(false);
            }
        }
        fetchAnalysis();
    }, [user]);

    if (loading) return <div className="animate-pulse h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>;

    return (
        <div className="bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-red-500 text-2xl">troubleshoot</span>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Attention Needed</h3>
            </div>

            <div className="space-y-4">
                {topics.map((topic, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">{topic.name}</span>
                            <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md">
                                {topic.accuracy}% Accuracy
                            </span>
                        </div>
                        <div className="flex gap-2 mt-3">
                            <button className="text-xs flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors">
                                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                                Generate Flashcards
                            </button>
                            <button className="text-xs flex items-center gap-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                                <span className="material-symbols-outlined text-[14px]">quiz</span>
                                Practice Quiz
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}