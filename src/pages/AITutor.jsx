// src/pages/AITutor.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Production-ready AI Tutor page.
// • Loads real Supabase chat history on mount
// • Sends messages to NVIDIA-backed /api/ai-tutor with graceful fallback
// • Persists every message to Supabase ai_chats table
// • Supports Quick Actions, Markdown chat bubbles, auto-scroll
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import PageHeader from '../components/PageHeader'
import ChatBubble, { TypingIndicator } from '../components/ChatBubble'
import MessageInput from '../components/MessageInput'
import { askTutor, loadChatHistory, saveChatMessage } from '../services/aiService'
import { useAuth } from '../hooks/useAuth'
import { useNotes } from '../hooks/useNotes'
import { useSubjects } from '../hooks/useSubjects'

// ── Welcome message (shown when history is empty) ─────────────────────────────
const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi there! 👋 I'm your **AI Study Tutor**, powered by NVIDIA AI.\n\nI can help you:\n• **Explain** any concept clearly\n• **Generate** quiz questions for practice\n• **Create** flashcards to memorise faster\n• **Summarize** your study notes\n\nWhat would you like to study today?",
}

// ── Error notice component ────────────────────────────────────────────────────
function ErrorNotice({ message, onDismiss }) {
  return (
    <div className="mx-4 my-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
      <span className="material-symbols-outlined text-red-500 text-lg mt-0.5">error</span>
      <p className="text-xs text-red-600 dark:text-red-400 flex-1 leading-relaxed">{message}</p>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 transition-colors"
        aria-label="Dismiss error"
      >
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  )
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function HistoryLoadingSkeleton() {
  return (
    <div className="space-y-4 p-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <div className="flex-1 max-w-[70%]">
            <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AITutor() {
  const { user } = useAuth()
  const { notes } = useNotes()
  const { subjects } = useSubjects()

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState(null)
  const [voiceMode, setVoiceMode] = useState(false)

  const bottomRef = useRef(null)
  const abortRef = useRef(null)
  const containerRef = useRef(null)

  // ── GSAP Mount Animation ──────────────────────────────────────────────────
  useEffect(() => {
    gsap.fromTo(containerRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }
    )
  }, [])

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // ── Cleanup on unmount ────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      abortRef.current?.abort()
      window.speechSynthesis?.cancel()
    }
  }, [])

  // ── Load Supabase chat history on mount ───────────────────────────────────
  useEffect(() => {
    let cancelled = false

    async function fetchHistory() {
      setHistoryLoading(true)
      try {
        if (!user?.id) throw new Error('not-logged-in')
        const history = await loadChatHistory(user.id)
        if (!cancelled) {
          setMessages(history.length > 0 ? history : [WELCOME_MESSAGE])
        }
      } catch (err) {
        if (!cancelled) {
          // If Supabase fails or user not logged in, show welcome + soft warning
          console.warn('[AITutor] Could not load history:', err.message)
          setMessages([WELCOME_MESSAGE])
        }
      } finally {
        if (!cancelled) setHistoryLoading(false)
      }
    }

    fetchHistory()
    return () => { cancelled = true }
  }, [user?.id])

  const [selectedContext, setSelectedContext] = useState(null) // { type: 'note'|'subject', id, title, content? }

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (overrideText) => {
      const text = (overrideText ?? inputMessage).trim()
      if (!text || loading) return

      setInputMessage('')
      setError(null)

      const userMsg = { id: `u-${Date.now()}`, role: 'user', content: text }
      setMessages((prev) => [...prev, userMsg])
      setLoading(true)

      // Persist user message (non-blocking)
      if (user?.id) saveChatMessage(user.id, 'user', text)

      try {
        abortRef.current?.abort()
        abortRef.current = new AbortController()

        // Pass context to the AI
        const contextStr = selectedContext
          ? `[CONTEXT: This conversation is focused on ${selectedContext.type} "${selectedContext.title}". ${selectedContext.content ? `Content: ${selectedContext.content}` : ''}]`
          : ''

        const reply = await askTutor(text, {
          context: contextStr,
          signal: abortRef.current.signal
        })
        const aiMsg = { id: `a-${Date.now()}`, role: 'assistant', content: reply }
        setMessages((prev) => [...prev, aiMsg])

        // Persist AI reply (non-blocking)
        if (user?.id) saveChatMessage(user.id, 'assistant', reply)

        if (voiceMode && window.speechSynthesis) {
          window.speechSynthesis.cancel()
          const utterance = new SpeechSynthesisUtterance(reply)
          window.speechSynthesis.speak(utterance)
        }
      } catch (err) {
        if (err.name === 'AbortError') return

        console.error('[AITutor] API error:', err)
        setError(
          err.message?.includes('Failed to fetch')
            ? 'Could not reach the AI server. Please check your connection.'
            : `AI error: ${err.message}`
        )
        // Remove optimistic user message on failure
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id))
        setInputMessage(text) // Restore input
      } finally {
        setLoading(false)
      }
    },
    [inputMessage, loading, user?.id, voiceMode, selectedContext]
  )

  // ── Clear chat ────────────────────────────────────────────────────────────
  const clearChat = () => {
    setMessages([WELCOME_MESSAGE])
    setError(null)
  }

  // ── Whether to show Quick Actions ─────────────────────────────────────────
  // Show only when <= 1 message (welcome only) or last AI msg was about welcome
  const showQuickActions = messages.length <= 1

  return (
    <div ref={containerRef} className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <PageHeader
        title="AI Tutor"
        actions={
          <div className="flex items-center gap-3">
            {/* Context Badge */}
            {selectedContext && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 text-[10px] font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-sm">
                  {selectedContext.type === 'note' ? 'description' : 'book'}
                </span>
                {selectedContext.title}
                <button onClick={() => setSelectedContext(null)} className="ml-1 hover:text-indigo-800 dark:hover:text-indigo-200">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            {/* Context Menu (Simplfied Select) */}
            <div className="relative group">
              <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-colors">
                <span className="material-symbols-outlined text-[16px]">link</span>
                Set Context
              </button>
              <div className="absolute top-full right-0 mt-2 w-56 glass-card rounded-xl opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 transition-all z-50 p-2 overflow-hidden shadow-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">Linked Note</p>
                <div className="max-h-32 overflow-y-auto custom-scrollbar">
                  {notes.slice(0, 5).map(n => (
                    <button key={n.id} onClick={() => setSelectedContext({ type: 'note', id: n.id, title: n.title, content: n.content })}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-xs transition-colors truncate">
                      {n.title}
                    </button>
                  ))}
                </div>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-1.5">Focus Subject</p>
                <div className="max-h-32 overflow-y-auto custom-scrollbar">
                  {subjects.map(s => (
                    <button key={s.id} onClick={() => setSelectedContext({ type: 'subject', id: s.id, title: s.name })}
                      className="w-full text-left px-2 py-1.5 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-xs transition-colors truncate text-slate-600 dark:text-slate-300">
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (voiceMode) window.speechSynthesis?.cancel()
                setVoiceMode(!voiceMode)
              }}
              title={voiceMode ? 'Voice Mode: ON' : 'Voice Mode: OFF'}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${voiceMode
                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {voiceMode ? 'volume_up' : 'volume_off'}
              </span>
              Voice Mode
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500 font-medium">NVIDIA AI</span>
            </div>
            <button
              onClick={clearChat}
              title="Clear chat"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <span className="material-symbols-outlined text-lg">delete_sweep</span>
            </button>
          </div>
        }
      />

      {/* Chat area */}
      <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-900/50">
        {historyLoading ? (
          <HistoryLoadingSkeleton />
        ) : (
          <div className="p-4 space-y-5 pb-2">
            {/* Chat history badge if we have real history */}
            {messages.length > 1 && messages.some(m => m.id !== 'welcome') && (
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Persistent Chat History
                </span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
              </div>
            )}

            {/* Messages */}
            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                role={msg.role}
                content={msg.content}
                senderName={msg.role === 'user' ? (user?.user_metadata?.full_name ?? user?.email ?? 'You') : 'AI Tutor'}
                avatarUrl={msg.role === 'user' ? user?.user_metadata?.avatar_url : null}
                timestamp={msg.created_at}
              />
            ))}

            {/* Typing indicator */}
            {loading && <TypingIndicator />}

            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Error notice */}
      {error && (
        <ErrorNotice message={error} onDismiss={() => setError(null)} />
      )}

      {/* Input */}
      <MessageInput
        value={inputMessage}
        onChange={(e) => setInputMessage(e.target.value)}
        onSend={sendMessage}
        loading={loading}
        showActions={showQuickActions}
      />
    </div>
  )
}
