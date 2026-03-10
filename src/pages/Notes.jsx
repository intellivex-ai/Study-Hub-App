// src/pages/Notes.jsx — wired to Supabase via useNotes()
import { askTutor } from '../services/aiService'
import { createFlashcard } from '../services/flashcardsService'

const renderMarkdown = (text) =>
  text
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-3 mb-1 text-slate-900 dark:text-slate-100">$1</h1>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-3 mb-1 text-slate-800 dark:text-slate-200">$2</h2>')
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-2 mb-1 text-slate-700 dark:text-slate-300">$3</h3>')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 italic text-slate-600 dark:text-slate-400 my-2">$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>')
    .replace(/\n\n/g, '<br/>')

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
        <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
          <div className="p-3 space-y-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-base">search</span>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes…"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 rounded-lg outline-none focus:ring-2 focus:ring-primary/50" />
            </div>
            <button onClick={handleCreate} className="w-full flex items-center gap-2 bg-primary text-white px-3 py-2 rounded-lg font-semibold text-sm hover:bg-primary-dark transition-colors">
              <span className="material-symbols-outlined text-base">add</span>New Note
            </button>
          </div>
          <div className="flex-1 p-2 space-y-1 custom-scrollbar overflow-y-auto">
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
                className={`group w-full text-left p-3 rounded-lg transition-colors cursor-pointer ${activeNoteId === note.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
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
              <div className="px-6 pt-5 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <input value={activeNote.title} onChange={handleTitleChange}
                  className="w-full text-xl font-bold bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder-slate-300" placeholder="Note title…" />
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
                ? <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900" dangerouslySetInnerHTML={{ __html: renderMarkdown(activeNote.content || '') }} />
                : <textarea value={activeNote.content || ''} onChange={handleContentChange}
                  className="flex-1 p-6 font-mono text-sm resize-none outline-none bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 custom-scrollbar" placeholder="Start writing in Markdown…" />
              }
              <div className="flex items-center justify-between px-4 py-1.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-400">
                <span>{(activeNote.content || '').split('\n').length} lines · {(activeNote.content || '').length} chars</span>
                <span className="flex items-center gap-1.5">
                  {saving ? <><div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />Saving…</> : <><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />Saved</>}
                </span>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 bg-white dark:bg-slate-900">
              <span className="material-symbols-outlined text-slate-200 dark:text-slate-700 text-7xl">description</span>
              <div>
                <p className="font-semibold text-slate-600 dark:text-slate-400">No note selected</p>
                <p className="text-sm text-slate-400">Create a new note or select one from the list.</p>
              </div>
              <button onClick={handleCreate} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-colors">
                <span className="material-symbols-outlined text-base">add</span>New Note
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
