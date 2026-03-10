// src/pages/Practice.jsx — saves results to Supabase via saveQuizResult()
import { useState } from 'react'
import PageHeader from '../components/PageHeader'
import { useAuth } from '../hooks/useAuth'
import { saveQuizResult, getQuizQuestions } from '../services/quizService'
import { useEffect } from 'react'

export default function Practice() {
  const { user } = useAuth()
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState(null)
  const [confirmed, setConfirmed] = useState(false)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [saving, setSaving] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [startTime] = useState(Date.now())
  const [answers, setAnswers] = useState([])
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const data = await getQuizQuestions('Quantum Mechanics Quiz')
        setQuizQuestions(data)
      } catch (err) {
        console.error('Failed to load quiz questions:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuestions()
  }, [])

  const q = quizQuestions[current]
  const isCorrect = selected === q.correct

  const handleConfirm = () => {
    if (selected === null) return
    setConfirmed(true)
    if (isCorrect) setScore(s => s + 1)
    setAnswers(prev => [...prev, { question: q.question, chosen: selected, correct: q.correct }])
  }

  const handleNext = async () => {
    if (current + 1 < quizQuestions.length) {
      setCurrent(c => c + 1); setSelected(null); setConfirmed(false)
    } else {
      setFinished(true)
      if (user) {
        setSaving(true)
        try {
          await saveQuizResult({
            userId: user.id,
            quizTitle: 'Quantum Mechanics Quiz',
            totalQuestions: quizQuestions.length,
            correctAnswers: score + (isCorrect ? 1 : 0),
            timeTakenSec: Math.round((Date.now() - startTime) / 1000),
            answers,
          })
        } catch (err) { console.error('Failed to save quiz result:', err) }
        finally { setSaving(false) }
      }
    }
  }

  if (loading) return (
    <div>
      <PageHeader title="Practice Quiz" />
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (quizQuestions.length === 0) return (
    <div>
      <PageHeader title="Practice Quiz" />
      <div className="max-w-lg mx-auto p-20 text-center opacity-50">
        <span className="material-symbols-outlined text-6xl mb-4">quiz</span>
        <p>No questions found for this quiz.</p>
      </div>
    </div>
  )

  const handleRestart = () => { setCurrent(0); setSelected(null); setConfirmed(false); setScore(0); setFinished(false); setAnswers([]) }

  if (finished) {
    const pct = Math.round((score / quizQuestions.length) * 100)
    return (
      <div>
        <PageHeader title="Practice Quiz" />
        <div className="max-w-lg mx-auto p-6 flex flex-col items-center text-center gap-6 mt-8">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl font-bold text-white ${pct >= 70 ? 'bg-emerald-500' : 'bg-orange-500'}`}>{pct}%</div>
          <div><h2 className="text-2xl font-bold">Quiz Complete!</h2><p className="text-slate-500 mt-1">You scored {score} out of {quizQuestions.length}</p></div>
          {saving && <p className="text-sm text-slate-400 flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />Saving result…</p>}
          <div className="w-full grid grid-cols-3 gap-3">
            {[{ l: 'Correct', v: score, c: 'text-emerald-600' }, { l: 'Wrong', v: quizQuestions.length - score, c: 'text-red-500' }, { l: 'Accuracy', v: `${pct}%`, c: 'text-primary' }].map(s => (
              <div key={s.l} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 text-center">
                <p className={`text-2xl font-bold ${s.c}`}>{s.v}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{s.l}</p>
              </div>
            ))}
          </div>
          <button onClick={handleRestart} className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors">Try Again</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Practice Quiz" />
      <div className="max-w-lg mx-auto p-4 space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-slate-600 dark:text-slate-400">
            <span>Question {current + 1} of {quizQuestions.length}</span>
            <span className="text-primary font-bold">Score: {score}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: `${(current / quizQuestions.length) * 100}%` }} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-card space-y-5">
          <div className="flex items-start gap-3">
            <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">{current + 1}</span>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 leading-snug">{q.question}</h3>
          </div>
          <div className="space-y-3">
            {q.options.map((opt, i) => {
              let style = 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-primary/50'
              if (confirmed) {
                if (i === q.correct) style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700'
                else if (i === selected && !isCorrect) style = 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600'
              } else if (selected === i) style = 'border-primary bg-primary/5'
              return (
                <button key={i} disabled={confirmed} onClick={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${style}`}>
                  <span className={`w-7 h-7 rounded-full border-2 flex items-center justify-center font-bold text-sm flex-shrink-0 ${confirmed && i === q.correct ? 'border-emerald-500 bg-emerald-500 text-white' : confirmed && i === selected && !isCorrect ? 'border-red-400 bg-red-400 text-white' : selected === i ? 'border-primary bg-primary text-white' : 'border-slate-300 dark:border-slate-600 text-slate-400'}`}>
                    {confirmed && i === q.correct ? <span className="material-symbols-outlined text-sm">check</span> : confirmed && i === selected && !isCorrect ? <span className="material-symbols-outlined text-sm">close</span> : String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-medium">{opt}</span>
                </button>
              )
            })}
          </div>
          {confirmed && (
            <div className={`p-4 rounded-xl ${isCorrect ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <p className={`font-bold text-sm mb-1 ${isCorrect ? 'text-emerald-700' : 'text-red-600'}`}>{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{q.explanation}</p>
            </div>
          )}
        </div>

        {!confirmed
          ? <button onClick={handleConfirm} disabled={selected === null} className="w-full py-3 bg-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors">Confirm Answer</button>
          : <button onClick={handleNext} className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
            {current + 1 < quizQuestions.length ? 'Next Question' : 'View Results'}
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        }
      </div>
    </div>
  )
}
