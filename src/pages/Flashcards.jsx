// src/pages/Flashcards.jsx — wired to Supabase via useFlashcards()
import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
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

  const cardRef = useRef(null)

  useEffect(() => {
    if (!loading && cards.length > 0 && !sessionDone) {
      gsap.fromTo('.flashcard-container',
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "back.out(1.2)" }
      )
    }
  }, [loading, cards.length, currentIndex, sessionDone])

  const handleMouseMove = (e) => {
    if (!cardRef.current || flipped) return
    const { left, top, width, height } = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - left - width / 2) / 15
    const y = -(e.clientY - top - height / 2) / 15
    gsap.to(cardRef.current, { rotationY: x, rotationX: y, ease: 'power2.out', duration: 0.3 })
  }

  const handleMouseLeave = () => {
    if (!cardRef.current || flipped) return
    gsap.to(cardRef.current, { rotationY: 0, rotationX: 0, ease: 'power2.out', duration: 0.5 })
  }

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
            <span key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i < sessionStats.reviewed ? (sessionStats.easy > sessionStats.hard ? 'bg-emerald-500' : 'bg-orange-400') : i === currentIndex ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
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
          <div className="text-center space-y-8 py-12 glass-card rounded-[2.5rem] p-8 border border-white/40 dark:border-slate-700/50 shadow-soft">
            <div className="text-7xl animate-bounce">🎉</div>
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Deck Complete!</h2>
              <p className="text-slate-500 font-medium mt-2">You reviewed all {cards.length} cards</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[{ label: 'Easy', value: sessionStats.easy, c: 'emerald' }, { label: 'Medium', value: sessionStats.medium, c: 'orange' }, { label: 'Hard', value: sessionStats.hard, c: 'red' }].map(s => (
                <div key={s.label} className={`bg-${s.c}-50/50 dark:bg-${s.c}-900/20 rounded-2xl p-5 border border-${s.c}-200 dark:border-${s.c}-800/50 text-center shadow-sm`}>
                  <p className={`text-4xl font-black text-${s.c}-500 mb-1`}>{s.value}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
            <button onClick={restart} className="w-full py-4 premium-button bg-gradient-to-br from-indigo-500 to-cyan-500 text-white font-bold rounded-2xl shadow-glow text-lg">
              Review Again
            </button>
          </div>
        ) : (
          <div className="flashcard-container">
            {/* Tilt Wrapper */}
            <div
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="card-flip-container cursor-pointer perspective-1000 w-full"
              onClick={() => {
                setFlipped(f => !f)
                gsap.to(cardRef.current, { rotationY: 0, rotationX: 0, duration: 0.3 })
              }}
            >
              <div className={`card-flip relative w-full transition-transform duration-700 transform-style-3d ${flipped ? 'flipped' : ''}`} style={{ minHeight: 340 }}>
                {/* Front */}
                <div className="card-front absolute inset-0 backface-hidden w-full glass-card rounded-[2rem] border border-white/60 dark:border-slate-700/50 p-10 flex flex-col items-center justify-center text-center hover:shadow-premium-hover dark:hover:shadow-premium-dark transition-shadow duration-300">
                  <span className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-6 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 px-4 py-1.5 rounded-full shadow-sm">
                    {currentCard?.subjects?.name || currentCard?.deck_name || 'Flashcard'}
                  </span>
                  <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 leading-snug">{currentCard?.front}</p>
                  <div className="absolute bottom-6 flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-base">touch_app</span> Tap to reveal
                  </div>
                </div>
                {/* Back */}
                <div className="card-back absolute inset-0 backface-hidden w-full bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center shadow-glow rotate-y-180">
                  <span className="text-[10px] font-black text-white/90 uppercase tracking-widest mb-6 bg-white/20 border border-white/30 px-4 py-1.5 rounded-full shadow-sm">
                    Answer
                  </span>
                  <p className="text-xl font-bold text-white leading-relaxed">{currentCard?.back}</p>
                </div>
              </div>
            </div>

            {/* Difficulty buttons (visible after flip) */}
            <div className={`grid grid-cols-3 gap-3 transition-all duration-500 mt-8 ${flipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
              {[
                { d: 'hard', label: 'Hard', icon: 'sentiment_dissatisfied', c: 'border-red-200 bg-red-50/50 hover:bg-red-50 dark:bg-red-900/20 dark:border-red-800/50 text-red-600 dark:text-red-400 hover:border-red-400' },
                { d: 'medium', label: 'Medium', icon: 'sentiment_neutral', c: 'border-orange-200 bg-orange-50/50 hover:bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800/50 text-orange-600 dark:text-orange-400 hover:border-orange-400' },
                { d: 'easy', label: 'Easy', icon: 'sentiment_satisfied', c: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 hover:border-emerald-400' },
              ].map(({ d, label, icon, c }) => (
                <button key={d} onClick={() => handleReview(d)} className={`py-4 border rounded-2xl font-bold transition-all duration-300 flex flex-col items-center gap-1.5 premium-button shadow-sm hover:shadow-md ${c}`}>
                  <span className="material-symbols-outlined text-2xl">{icon}</span>
                  <span className="text-xs uppercase tracking-widest">{label}</span>
                </button>
              ))}
            </div>

            {/* Reveal button placeholder when hidden to prevent layout shift */}
            {!flipped && (
              <div className="mt-8 flex justify-center">
                <button onClick={() => {
                  setFlipped(true)
                  gsap.to(cardRef.current, { rotationY: 0, rotationX: 0, duration: 0.3 })
                }} className="w-full py-4 premium-button bg-slate-800 dark:bg-slate-700 border border-slate-700 dark:border-slate-600 text-white font-bold text-sm tracking-wider uppercase rounded-2xl shadow-soft">
                  Click card to reveal answer
                </button>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-center text-sm text-red-500">{error}</p>}
      </div>
    </div>
  )
}
