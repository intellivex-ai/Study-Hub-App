// src/pages/Notes.jsx — wired to Supabase via useNotes()
import { askTutor } from '../services/aiService'
import { createFlashcard } from '../services/flashcardsService'
import { useState } from 'react'
import { useNotes } from '../hooks/useNotes'
import PageHeader from '../components/PageHeader'


import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'

export default function Notes() {
  const [preview, setPreview] = useState(false)
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const {
    user,
    notes, loading, error,
    activeNote, activeNoteId, setActiveNoteId,
    create, update, remove, togglePin,
  } = useNotes({ search })

  const handleCreate = async () => { await create({ title: 'Untitled Note', content: '' }); setPreview(false) }

  const handleSummarize = async () => {
    if (!activeNote || aiLoading) return
    setAiLoading(true)
    try {
      const summary = await askTutor(
        `Summarize the following note content into a structured, concise summary:\n\n${activeNote.content}`,
        { systemPrompt: "You are an expert academic summarizer. Use bullet points and bold key terms." }
      )
      // Prepend summary to content or replace? Let's append with a header.
      const newContent = `> [!NOTE]\n> **AI Summary**\n${summary.split('\n').map(line => `> ${line}`).join('\n')}\n\n---\n\n${activeNote.content}`
      update(activeNote.id, { content: newContent })
    } catch (err) {
      alert('AI Summary failed: ' + err.message)
    } finally {
      setAiLoading(false)
    }
  }

  const handleGenerateFlashcards = async () => {
    if (!activeNote || aiLoading) return
    if (!window.confirm('This will generate flashcards from your note and add them to your collection. Continue?')) return
    setAiLoading(true)
    try {
      const jsonStr = await askTutor(
        `From the following note, extract 5 key facts and return them as a JSON array of objects with "front" and "back" keys. Return ONLY the JSON array.\n\nContent:\n${activeNote.content}`,
        { systemPrompt: "Return only a JSON array. Example: [{\"front\": \"...\", \"back\": \"...\"}]" }
      )
      const flashcards = JSON.parse(jsonStr.replace(/```json|```/g, '').trim())
      for (const card of flashcards) {
        await createFlashcard({
          userId: user.id,
          subjectId: activeNote.subject_id,
          front: card.front,
          back: card.back,
        })
      }
      alert(`Success! Generated ${flashcards.length} flashcards linked to this subject.`)
    } catch (err) {
      console.error(err)
      alert('AI Flashcard generation failed. Please ensure the note has enough clear information.')
    } finally {
      setAiLoading(false)
    }
  }

  const handleContentChange = (e) => {
    if (!activeNote) return
    setSaving(true)
    update(activeNote.id, { content: e.target.value }, { debounced: true })
    setTimeout(() => setSaving(false), 1200)
  }

  const handleTitleChange = (e) => {
    if (!activeNote) return
    update(activeNote.id, { title: e.target.value }, { debounced: true })
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
      <PageHeader
        title={activeNote?.title || 'Notes'}
        actions={
          <div className="flex items-center gap-2">
            {activeNote && (
              <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleSummarize}
                  disabled={saving || !activeNote.content}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 hover:text-amber-500 transition-all group relative"
                  title="Summarize with AI"
                >
                  <span className="material-symbols-outlined text-base">summarize</span>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Summarize</span>
                </button>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                <button
                  onClick={handleGenerateFlashcards}
                  disabled={saving || !activeNote.content}
                  className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400 hover:text-emerald-500 transition-all group relative"
                  title="Generate Flashcards"
                >
                  <span className="material-symbols-outlined text-base">style</span>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">Flashcards</span>
                </button>
              </div>
            )}
            <button
              onClick={() => setPreview(p => !p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${preview ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
            >
              <span className="material-symbols-outlined text-base">{preview ? 'edit' : 'visibility'}</span>
              {preview ? 'Edit' : 'Preview'}
            </button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-72 glass-sidebar overflow-y-auto">
          <div className="p-4 space-y-3 border-b border-slate-200/50 dark:border-slate-800/50">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base group-focus-within:text-primary transition-colors">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-100/50 dark:bg-slate-800/50 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm" />
            </div>
            <button onClick={handleCreate} className="w-full flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:-translate-y-0.5 shadow-glow premium-button transition-all">
              <span className="material-symbols-outlined text-lg">add</span>New Note
            </button>
          </div>
          <div className="flex-1 p-3 space-y-1.5 custom-scrollbar overflow-y-auto">
            {loading && <div className="flex justify-center py-8"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}
            {!loading && notes.length === 0 && (
              <div className="text-center py-8 px-4">
                <span className="material-symbols-outlined text-slate-300 text-4xl">description</span>
                <p className="text-sm text-slate-400 mt-2">No notes yet</p>
                <button onClick={handleCreate} className="text-primary text-sm font-medium mt-1 hover:underline">Create your first note</button>
              </div>
            )}
            {notes.map(note => (
              <div key={note.id} onClick={() => setActiveNoteId(note.id)}
                className={`group w-full text-left p-3 rounded-xl transition-all duration-300 cursor-pointer border ${activeNoteId === note.id ? 'bg-indigo-50/80 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800/50 shadow-sm' : 'border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/30'}`}>
                <div className="flex items-start justify-between">
                  <p className={`font-semibold text-sm truncate flex-1 ${activeNoteId === note.id ? 'text-primary' : 'text-slate-800 dark:text-slate-200'}`}>
                    {note.is_pinned && <span className="material-symbols-outlined text-amber-500 text-sm mr-1" style={{ fontVariationSettings: "'FILL' 1" }}>push_pin</span>}
                    {note.title || 'Untitled'}
                  </p>
                  <div className="hidden group-hover:flex gap-0.5 ml-1">
                    <button onClick={e => { e.stopPropagation(); togglePin(note.id, note.is_pinned) }} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-400 hover:text-amber-500">
                      <span className="material-symbols-outlined text-sm">push_pin</span>
                    </button>
                    <button onClick={e => { e.stopPropagation(); if (window.confirm('Delete?')) remove(note.id) }} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-slate-400 hover:text-red-500">
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {note.subjects && (
                    <span className="inline-block text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ color: note.subjects.color_hex, background: `${note.subjects.color_hex}20` }}>
                      {note.subjects.name}
                    </span>
                  )}
                  {note.tags && note.tags.includes('highlight') && (
                    <span className="inline-flex items-center text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
                      <span className="material-symbols-outlined text-[12px] mr-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>content_cut</span>
                      Highlight
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{note.content?.slice(0, 60) || 'No content…'}</p>
                <p className="text-[10px] text-slate-400 mt-1">{new Date(note.updated_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </aside>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeNote ? (
            <>
              <div className="px-8 pt-6 pb-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
                <input value={activeNote.title} onChange={handleTitleChange}
                  className="w-full text-3xl font-extrabold tracking-tight bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder-slate-300 dark:placeholder-slate-700 transition-colors focus:text-primary" placeholder="Note title…" />
              </div>
              {!preview && (
                <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto hide-scrollbar">
                  {['format_bold', 'format_italic', 'format_list_bulleted', 'format_list_numbered', 'format_quote', 'code'].map(icon => (
                    <button key={icon} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500 transition-colors flex-shrink-0">
                      <span className="material-symbols-outlined text-xl">{icon}</span>
                    </button>
                  ))}
                </div>
              )}
              {preview
                ? <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm prose dark:prose-invert prose-p:leading-relaxed prose-headings:font-bold prose-pre:my-2 max-w-none break-words">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex, rehypeHighlight]}>
                    {activeNote.content || ''}
                  </ReactMarkdown>
                </div>
                : <textarea value={activeNote.content || ''} onChange={handleContentChange}
                  className="flex-1 p-8 font-mono text-sm resize-none outline-none bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm text-slate-800 dark:text-slate-200 custom-scrollbar leading-relaxed" placeholder="Start writing in Markdown…" />
              }
              <div className="flex items-center justify-between px-4 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-400">
                <span>{(activeNote.content || '').split('\n').length} lines · {(activeNote.content || '').length} chars</span>
                <span className="flex items-center gap-1.5">
                  {saving ? <><div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />Saving…</> : <><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Saved</>}
                </span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5 bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm">
              <span className="material-symbols-outlined text-slate-200 dark:text-slate-700/50 text-8xl">description</span>
              <div>
                <p className="font-extrabold text-xl text-slate-800 dark:text-slate-200">No note selected</p>
                <p className="text-sm font-medium text-slate-400 mt-1">Create a new note or select one from the list.</p>
              </div>
              <button onClick={handleCreate} className="mt-4 flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-indigo-500 to-cyan-500 text-white rounded-2xl font-bold shadow-glow hover:-translate-y-1 transition-all premium-button">
                <span className="material-symbols-outlined text-lg">add</span>New Note
              </button>
            </div>
          )}
        </div>
      </div>

      <button onClick={handleCreate} className="md:hidden fixed bottom-24 right-4 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:bg-primary-dark transition-colors z-40">
        <span className="material-symbols-outlined text-2xl">add</span>
      </button>
      {error && <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50">{error}</div>}
    </div>
  )
}
