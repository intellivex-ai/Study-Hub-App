import { useState } from 'react'
import { useParams } from 'react-router-dom'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import { currentLesson, lessonOutline } from '../data/sampleData'

export default function Lesson() {
  const { id } = useParams()
  const [completed, setCompleted] = useState(
    lessonOutline.reduce((acc, l) => ({ ...acc, [l.id]: l.completed }), {})
  )

  const completedCount = Object.values(completed).filter(Boolean).length
  const progress = Math.round((completedCount / lessonOutline.length) * 100)

  return (
    <div>
      <PageHeader
        title="Lesson"
        actions={
          <span className="text-xs font-bold text-primary">{completedCount}/{lessonOutline.length} Done</span>
        }
      />
      <div className="max-w-2xl mx-auto">
        {/* Video Player */}
        <div className="aspect-video bg-slate-900 relative flex items-center justify-center">
          <img
            src={currentLesson.thumbnail}
            alt={currentLesson.title}
            className="w-full h-full object-cover opacity-80"
          />
          <button className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                play_arrow
              </span>
            </div>
          </button>
          {/* Progress bar overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-primary" style={{ width: '38%' }} />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Title */}
          <div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              {currentLesson.subject}
            </span>
            <h2 className="text-xl font-bold mt-2 text-slate-900 dark:text-slate-100">{currentLesson.title}</h2>
            <p className="text-slate-500 text-sm mt-1">{currentLesson.module}</p>
          </div>

          {/* Progress */}
          <ProgressBar value={progress} showLabel />

          {/* Lesson Outline */}
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">list</span>
              Lesson Outline
            </h3>
            <div className="space-y-2">
              {lessonOutline.map(lesson => (
                <button
                  key={lesson.id}
                  onClick={() => setCompleted(prev => ({ ...prev, [lesson.id]: !prev[lesson.id] }))}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                    lesson.active
                      ? 'bg-primary/5 border-primary/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    completed[lesson.id]
                      ? 'bg-emerald-500 text-white'
                      : lesson.active
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {completed[lesson.id] ? (
                      <span className="material-symbols-outlined text-base">check</span>
                    ) : lesson.active ? (
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    ) : (
                      <span className="text-xs font-bold">{lesson.id}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${lesson.active ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>
                      {lesson.title}
                    </p>
                    <p className="text-xs text-slate-500">{lesson.duration}</p>
                  </div>
                  {lesson.active && (
                    <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">NOW</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mark Complete Button */}
          <button
            onClick={() => setCompleted(prev => Object.fromEntries(lessonOutline.map(l => [l.id, true])))}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Mark All Lessons Complete
          </button>
        </div>
      </div>
    </div>
  )
}
