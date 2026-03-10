// src/components/MessageInput.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Controlled message input with quick-action chips and send button.
// Supports Enter to send, Shift+Enter for newline.
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useState } from 'react'
import { QUICK_ACTIONS } from '../services/aiService'

/**
 * @param {Object} props
 * @param {string}   props.value        - Controlled input value
 * @param {Function} props.onChange     - (e) => void
 * @param {Function} props.onSend       - (text?) => void
 * @param {boolean}  props.loading      - Disables send & actions when true
 * @param {boolean}  props.showActions  - Whether to show quick-action chips
 */
export default function MessageInput({ value, onChange, onSend, loading, showActions }) {
    const textareaRef = useRef(null)
    const [isListening, setIsListening] = useState(false)
    const [recognitionInstance, setRecognitionInstance] = useState(null)

    const toggleMic = () => {
        if (isListening && recognitionInstance) {
            recognitionInstance.stop()
            return
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            alert('Your browser does not support Speech Recognition.')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false

        recognition.onstart = () => setIsListening(true)
        recognition.onend = () => {
            setIsListening(false)
            setRecognitionInstance(null)
        }
        recognition.onerror = (e) => {
            console.error('Speech recognition error', e)
            setIsListening(false)
            setRecognitionInstance(null)
        }
        recognition.onresult = (e) => {
            const transcript = e.results[0][0].transcript
            const newValue = value + (value && !value.endsWith(' ') ? ' ' : '') + transcript
            onChange({ target: { value: newValue } })
        }

        recognition.start()
        setRecognitionInstance(recognition)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            onSend()
        }
    }

    const handleQuickAction = (action) => {
        const prompt = action.prompt()
        onSend(prompt)
    }

    const colorMap = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/40',
        violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800 hover:bg-violet-100 dark:hover:bg-violet-900/40',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40',
    }

    return (
        <div className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            {/* Quick Action chips */}
            {showActions && (
                <div className="px-4 pt-3 pb-1 flex gap-2 overflow-x-auto hide-scrollbar">
                    {QUICK_ACTIONS.map((action) => (
                        <button
                            key={action.id}
                            onClick={() => handleQuickAction(action)}
                            disabled={loading}
                            className={`flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${colorMap[action.color]}`}
                        >
                            <span className="material-symbols-outlined text-[14px]">{action.icon}</span>
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Input row */}
            <div className="p-3 flex items-end gap-2">
                <div className="flex-1 flex items-end gap-2 bg-slate-100 dark:bg-slate-800 rounded-2xl px-4 py-2.5 border border-transparent focus-within:border-indigo-400 dark:focus-within:border-indigo-600 transition-colors">
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={value}
                        onChange={onChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
                        className="flex-1 bg-transparent resize-none outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 leading-relaxed max-h-32 overflow-y-auto custom-scrollbar"
                        style={{ field_sizing: 'content' }}
                        onInput={(e) => {
                            // Auto-grow textarea
                            e.target.style.height = 'auto'
                            e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
                        }}
                    />
                </div>

                {/* Mic button */}
                <button
                    onClick={toggleMic}
                    disabled={loading}
                    title={isListening ? "Stop listening" : "Start speaking"}
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all flex-shrink-0 ${isListening
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/30 animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:scale-95 text-slate-600 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed'
                        }`}
                >
                    <span className="material-symbols-outlined text-xl">
                        {isListening ? 'mic' : 'mic_none'}
                    </span>
                </button>

                {/* Send button */}
                <button
                    onClick={() => onSend()}
                    disabled={!value.trim() || loading}
                    aria-label="Send message"
                    className="w-11 h-11 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-md shadow-indigo-500/30 flex-shrink-0"
                >
                    {loading ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined text-xl">send</span>
                    )}
                </button>
            </div>

            {/* Hint */}
            <p className="text-center text-[10px] text-slate-300 dark:text-slate-600 pb-2">
                AI Tutor can make mistakes. Verify important information.
            </p>
        </div>
    )
}
