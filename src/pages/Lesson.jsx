import { useState, useRef, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import gsap from 'gsap'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import { getLessonById, updateLessonProgress } from '../services/lessonsService'
import { useAuth } from '../hooks/useAuth'
import { createNote } from '../services/notesService'

export default function Lesson() {
  const { id } = useParams()
  const { user } = useAuth()
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completed, setCompleted] = useState({})

  const containerRef = useRef(null)

  // Highlight Reel State
  const [isClipping, setIsClipping] = useState(false)
  const [clipStart, setClipStart] = useState(0)
  const [clipEnd, setClipEnd] = useState(30)
  const [savingToast, setSavingToast] = useState(false)

  // Fetch lesson data on mount
  useEffect(() => {
    async function fetchLesson() {
      try {
        const data = await getLessonById(id)
        if (data) {
          setLesson(data)
          const outline = data.outline || []
          setCompleted(outline.reduce((acc, l) => ({ ...acc, [l.id]: !!l.completed }), {}))
        }
      } catch (err) {
        console.error('Failed to load lesson:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLesson()
  }, [id])

  // Mount animation
  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    )
  }, [])

  const handleSaveHighlight = async () => {
    if (!user || !lesson) return alert("Must be logged in to save notes.")
    try {
      await createNote({
        userId: user.id,
        title: `Highlight: ${lesson.title}`,
        content: `> **Video Highlight**\n> Saved from **${formatTime(clipStart)}** to **${formatTime(clipEnd)}**.\n\n*Add your notes about this snippet here!*`,
        tags: ['highlight']
      })

      setIsClipping(false)
      setSavingToast(true)
      setTimeout(() => setSavingToast(false), 3000)
    } catch (err) {
      console.error(err)
      alert("Error saving highlight.")
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleToggleCompleted = async (lessonItemId) => {
    const newCompleted = { ...completed, [lessonItemId]: !completed[lessonItemId] }
    setCompleted(newCompleted)

    // Update DB
    if (lesson) {
      const newOutline = lesson.outline.map(l => ({
        ...l,
        completed: l.id === lessonItemId ? !completed[lessonItemId] : !!completed[l.id]
      }))
      try {
        await updateLessonProgress(lesson.id, { outline: newOutline })
      } catch (err) { console.error('Failed to update progress:', err) }
    }
  }

  const handleMarkAllComplete = async () => {
    if (!lesson) return
    const newOutline = lesson.outline.map(l => ({ ...l, completed: true }))
    setCompleted(Object.fromEntries(newOutline.map(l => [l.id, true])))
    try {
      await updateLessonProgress(lesson.id, { outline: newOutline, is_completed: true })
    } catch (err) { console.error('Failed to mark all complete:', err) }
  }

  if (loading) return (
    <div>
      <PageHeader title="Lesson" />
      <div className="flex justify-center items-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (!lesson) return (
    <div>
      <PageHeader title="Lesson" />
      <div className="max-w-2xl mx-auto p-20 text-center opacity-50">
        <span className="material-symbols-outlined text-6xl mb-4">video_library</span>
        <p>Lesson not found or access denied.</p>
      </div>
    </div>
  )

  const lessonOutline = lesson.outline || []
  const completedCount = Object.values(completed).filter(Boolean).length
  const progress = lessonOutline.length > 0 ? Math.round((completedCount / lessonOutline.length) * 100) : 0

  return (
    <div ref={containerRef}>
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
            src={lesson.thumbnail_url || 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&q=80'}
            alt={lesson.title}
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

        {/* --- Highlight Reel Controls --- */}
        <div className="bg-slate-900 border-x border-b border-slate-800 text-white p-4 flex flex-col gap-4 shadow-inner">
          <div className="flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-500 text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>content_cut</span>
              Highlight Reel
            </h3>
            <button
              onClick={() => setIsClipping(!isClipping)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors ${isClipping ? 'bg-slate-700 text-white' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}
            >
              {isClipping ? 'Cancel' : 'Clip Highlight'}
            </button>
          </div>

          {isClipping && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-6 pt-2 border-t border-slate-700/50">
              <div className="flex items-center gap-6">
                <div className="flex flex-col flex-1 gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase text-slate-400 font-bold">Start</label>
                    <span className="text-sm font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">{formatTime(clipStart)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={clipEnd - 5 > 0 ? clipEnd - 5 : 0}
                    value={clipStart}
                    onChange={(e) => setClipStart(Number(e.target.value))}
                    className="accent-rose-500"
                  />
                </div>

                <div className="flex flex-col flex-1 gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs uppercase text-slate-400 font-bold">End</label>
                    <span className="text-sm font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">{formatTime(clipEnd)}</span>
                  </div>
                  <input
                    type="range"
                    min={clipStart + 5}
                    max={600}
                    value={clipEnd}
                    onChange={(e) => setClipEnd(Number(e.target.value))}
                    className="accent-rose-500"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveHighlight}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-rose-500/20 flex justify-center items-center gap-2 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>bookmark_add</span>
                Save to Notes
              </button>
            </div>
          )}
        </div>

        {/* Toast */}
        {savingToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-6 py-3 rounded-full font-bold shadow-xl shadow-emerald-500/20 animate-in slide-in-from-bottom-8 z-50 flex items-center gap-2">
            <span className="material-symbols-outlined text-xl">check_circle</span>
            Highlight saved to Notes!
          </div>
        )}

        <div className="p-4 space-y-6">
          {/* Title */}
          <div>
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
              {lesson.subjects?.name || 'Subject'}
            </span>
            <h2 className="text-xl font-bold mt-2 text-slate-900 dark:text-slate-100">{lesson.title}</h2>
            <p className="text-slate-500 text-sm mt-1">{lesson.module}</p>
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
              {lessonOutline.map(l => (
                <button
                  key={l.id}
                  onClick={() => handleToggleCompleted(l.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${l.active
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${completed[l.id]
                    ? 'bg-emerald-500 text-white'
                    : l.active
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                    {completed[l.id] ? (
                      <span className="material-symbols-outlined text-base">check</span>
                    ) : l.active ? (
                      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                    ) : (
                      <span className="text-xs font-bold">{l.id}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${l.active ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>
                      {l.title}
                    </p>
                    <p className="text-xs text-slate-500">{l.duration}</p>
                  </div>
                  {l.active && (
                    <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">NOW</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mark Complete Button */}
          <button
            onClick={handleMarkAllComplete}
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
