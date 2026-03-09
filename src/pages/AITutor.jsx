// src/pages/AITutor.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Production-ready AI Tutor page.
// • Loads real Supabase chat history on mount
// • Sends messages to NVIDIA-backed /api/ai-tutor with graceful fallback
// • Persists every message to Supabase ai_chats table
// • Supports Quick Actions, Markdown chat bubbles, auto-scroll
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import PageHeader from '../components/PageHeader'
import ChatBubble, { TypingIndicator } from '../components/ChatBubble'
import MessageInput from '../components/MessageInput'
import { askTutor, loadChatHistory, saveChatMessage } from '../services/aiService'
import { useAuth } from '../hooks/useAuth'

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

  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [error, setError] = useState(null)

  const bottomRef = useRef(null)
  const abortRef = useRef(null)

  // ── Auto-scroll to bottom ─────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

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
        const reply = await askTutor(text)
        const aiMsg = { id: `a-${Date.now()}`, role: 'assistant', content: reply }
        setMessages((prev) => [...prev, aiMsg])

        // Persist AI reply (non-blocking)
        if (user?.id) saveChatMessage(user.id, 'assistant', reply)
      } catch (err) {
        console.error('[AITutor] API error:', err)
        setError(
          err.message.includes('Failed to fetch')
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
    [inputMessage, loading, user?.id]
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <PageHeader
        title="AI Tutor"
        actions={
          <div className="flex items-center gap-3">
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
            {/* Chat history badge */}
            {messages.length > 1 && (
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Chat History
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
                senderName={user?.user_metadata?.full_name ?? user?.email ?? 'You'}
                avatarUrl={user?.user_metadata?.avatar_url}
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
