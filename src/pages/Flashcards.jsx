// src/pages/Flashcards.jsx — wired to Supabase via useFlashcards()
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useFlashcards } from '../hooks/useFlashcards'

export default function Flashcards() {
  const [flipped, setFlipped] = useState(false)

  const {
    cards, loading, error,
    currentCard, currentIndex,
    sessionDone, sessionStats,
    review, restart, remove,
  } = useFlashcards()

  const handleReview = async (difficulty) => {
    setFlipped(false)
    setTimeout(() => review(difficulty), 200)
  }

  if (loading) return (
    <div>
      <PageHeader title="Flashcards" />
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="Flashcards" actions={<span className="text-xs font-semibold text-slate-500">{currentIndex + 1} / {cards.length}</span>} />
      <div className="max-w-lg mx-auto p-4 space-y-6">

        {/* Progress dots */}
        <div className="flex gap-1.5 justify-center flex-wrap">
          {cards.map((_, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i < sessionStats.reviewed ? (sessionStats.easy > sessionStats.hard ? 'bg-emerald-500' : 'bg-orange-400') : i === currentIndex ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
            }`} />
          ))}
        </div>

        {cards.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <span className="material-symbols-outlined text-slate-300 text-6xl">style</span>
            <p className="font-semibold text-slate-600 dark:text-slate-400">No flashcards yet</p>
            <p className="text-sm text-slate-400">Your flashcards will appear here once saved.</p>
          </div>
        ) : sessionDone ? (
          <div className="text-center space-y-6 py-8">
            <div className="text-6xl">🎉</div>
            <div><h2 className="text-2xl font-bold">Deck Complete!</h2><p className="text-slate-500 mt-1">You reviewed all {cards.length} cards</p></div>
            <div className="grid grid-cols-3 gap-3">
              {[{label:'Easy',value:sessionStats.easy,c:'emerald'},{label:'Medium',value:sessionStats.medium,c:'orange'},{label:'Hard',value:sessionStats.hard,c:'red'}].map(s=>(
                <div key={s.label} className={`bg-${s.c}-50 dark:bg-${s.c}-900/20 rounded-xl p-4 border border-${s.c}-200 dark:border-${s.c}-800 text-center`}>
                  <p className={`text-3xl font-bold text-${s.c}-600`}>{s.value}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
            <button onClick={restart} className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors">Review Again</button>
          </div>
        ) : (
          <>
            {/* Flip Card */}
            <div className="card-flip-container cursor-pointer" onClick={() => setFlipped(f => !f)}>
              <div className={`card-flip relative ${flipped ? 'flipped' : ''}`} style={{ minHeight: 280 }}>
                <div className="card-front w-full bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center shadow-card min-h-[280px]">
                  <span className="text-xs font-bold text-primary uppercase tracking-widest mb-4 bg-primary/10 px-3 py-1 rounded-full">
                    {currentCard?.subjects?.name || currentCard?.deck_name || 'Flashcard'}
                  </span>
                  <p className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-snug">{currentCard?.front}</p>
                  <p className="text-xs text-slate-400 mt-6 flex items-center gap-1"><span className="material-symbols-outlined text-base">touch_app</span>Tap to reveal answer</p>
                </div>
                <div className="card-back w-full bg-primary rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-lg min-h-[280px]">
                  <span className="text-xs font-bold text-white/70 uppercase tracking-widest mb-4 bg-white/20 px-3 py-1 rounded-full">Answer</span>
                  <p className="text-lg font-medium text-white leading-relaxed">{currentCard?.back}</p>
                </div>
              </div>
            </div>

            {/* Difficulty buttons (visible after flip) */}
            {flipped ? (
              <div className="grid grid-cols-3 gap-2">
                {[
                  { d: 'hard',   label: 'Hard',   icon: 'sentiment_dissatisfied', c: 'border-red-300 bg-red-50 dark:bg-red-900/20 text-red-600' },
                  { d: 'medium', label: 'Medium', icon: 'sentiment_neutral',      c: 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 text-orange-600' },
                  { d: 'easy',   label: 'Easy',   icon: 'sentiment_satisfied',    c: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' },
                ].map(({ d, label, icon, c }) => (
                  <button key={d} onClick={() => handleReview(d)} className={`py-3 border-2 rounded-xl font-bold transition-colors flex flex-col items-center gap-1 hover:brightness-95 ${c}`}>
                    <span className="material-symbols-outlined text-xl">{icon}</span>
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => setFlipped(true)} className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors">Reveal Answer</button>
            )}
          </>
        )}

        {error && <p className="text-center text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}
