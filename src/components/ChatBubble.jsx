// src/components/ChatBubble.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Renders a single chat message — either user or AI assistant.
// Supports Markdown formatting with LaTeX and syntax highlighting.
// ─────────────────────────────────────────────────────────────────────────────

import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'

import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github-dark.css'



// ── Avatar components ──────────────────────────────────────────────────────────
function AIAvatar() {
    return (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-indigo-500/30">
            <span className="material-symbols-outlined text-white text-lg">smart_toy</span>
        </div>
    )
}

function UserAvatar({ avatar, name }) {
    return (
        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white dark:border-slate-700 flex-shrink-0 shadow-sm">
            {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                    {name?.[0]?.toUpperCase() ?? 'U'}
                </div>
            )}
        </div>
    )
}

// ── Main ChatBubble component ─────────────────────────────────────────────────
/**
 * @param {Object} props
 * @param {'user'|'assistant'} props.role
 * @param {string} props.content
 * @param {string} [props.senderName]
 * @param {string} [props.avatarUrl]
 * @param {string} [props.timestamp]
 */
export default function ChatBubble({ role, content, senderName, avatarUrl, timestamp }) {
    const isUser = role === 'user'

    return (
        <div
            className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'} group`}
        >
            {/* Avatar */}
            {isUser ? (
                <UserAvatar avatar={avatarUrl} name={senderName} />
            ) : (
                <AIAvatar />
            )}

            {/* Bubble */}
            <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Sender label */}
                <span className="text-[11px] font-semibold text-slate-400 px-1">
                    {isUser ? (senderName ?? 'You') : 'AI Tutor'}
                </span>

                {isUser ? (
                    /* User bubble — solid indigo gradient */
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 px-4 py-3 rounded-2xl rounded-br-sm shadow-lg shadow-indigo-500/25">
                        <p className="text-sm text-white leading-relaxed font-medium whitespace-pre-wrap">
                            {content}
                        </p>
                    </div>
                ) : (
                    /* AI bubble — card style with markdown */
                    <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-slate-100 dark:border-slate-700 prose-bubble">
                        <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 prose dark:prose-invert max-w-none break-words prose-pre:my-1 prose-pre:p-2 prose-pre:bg-[#0d1117] prose-p:my-1 prose-ul:my-1 prose-ol:my-1">
                            <ReactMarkdown
                                remarkPlugins={[remarkMath]}
                                rehypePlugins={[rehypeKatex, rehypeHighlight]}
                            >
                                {content}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}

                {/* Timestamp */}
                {timestamp && (
                    <span className="text-[10px] text-slate-300 dark:text-slate-600 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                )}
            </div>
        </div>
    )
}

// ── Typing indicator (exported for reuse) ─────────────────────────────────────
export function TypingIndicator() {
    return (
        <div className="flex items-end gap-2.5">
            <AIAvatar />
            <div className="bg-white dark:bg-slate-800 px-4 py-3.5 rounded-2xl rounded-bl-sm border border-slate-100 dark:border-slate-700 shadow-sm">
                <div className="flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                        <span
                            key={i}
                            className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.18}s` }}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
