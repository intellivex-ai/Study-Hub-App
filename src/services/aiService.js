// src/services/aiService.js
// ─────────────────────────────────────────────────────────────────────────────
// AI Tutor service — sends user messages to the NVIDIA-backed /api/ai-tutor
// endpoint and persists the conversation in Supabase (ai_chats table).
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient'


// ── NVIDIA NIM API config ─────────────────────────────────────────────────────
const NVIDIA_API_KEY = import.meta.env.VITE_NVIDIA_API_KEY
// In dev: use Vite proxy (/nvidia-api) to avoid CORS.
// In production: set VITE_NVIDIA_BASE_URL to your backend URL.
const NVIDIA_BASE_URL = import.meta.env.VITE_NVIDIA_BASE_URL ?? '/nvidia-api/v1'
const NVIDIA_MODEL = 'meta/llama-3.1-70b-instruct' // Change to any NIM model you prefer

const SYSTEM_PROMPT = `You are an expert AI Study Tutor helping a student preparing for competitive exams (JEE, NEET, etc.).
You explain concepts clearly, generate quizzes with answers, create flashcards, and summarize notes.
Use simple language, bullet points, and examples. Format your responses using markdown:
- **bold** for key terms
- \`code\` for formulas or code
- Bullet points for lists
Keep responses concise but thorough.`

// ── Core API call ─────────────────────────────────────────────────────────────
/**
 * Send a message to the NVIDIA NIM AI tutor.
 * @param {string} message - The user's message text.
 * @returns {Promise<string>} - The AI's reply text.
 */
export async function askTutor(message) {
    if (!NVIDIA_API_KEY || NVIDIA_API_KEY === 'nvapi-your-key-here') {
        throw new Error('NVIDIA API key not set. Add VITE_NVIDIA_API_KEY to your .env file.')
    }

    const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
            model: NVIDIA_MODEL,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: message },
            ],
            temperature: 0.7,
            max_tokens: 1024,
        }),
    })

    if (!response.ok) {
        const err = await response.text()
        throw new Error(`NVIDIA API error (${response.status}): ${err}`)
    }

    const data = await response.json()
    return data.choices?.[0]?.message?.content ?? 'No response from AI.'
}


// ── Supabase chat history ─────────────────────────────────────────────────────
/**
 * Load previous chat messages for the current user from Supabase.
 * @param {string} userId
 * @param {number} [limit=50] - Max messages to load.
 * @returns {Promise<Array>} - Array of { id, role, content, created_at }
 */
export async function loadChatHistory(userId, limit = 50) {
    const { data, error } = await supabase
        .from('ai_chats')
        .select('id, role, message, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit)

    if (error) throw error

    // Normalise to { id, role, content } shape used by the UI
    return (data ?? []).map((row) => ({
        id: row.id,
        role: row.role,           // 'user' | 'assistant'
        content: row.message,
        created_at: row.created_at,
    }))
}

/**
 * Persist a single chat message to Supabase.
 * Fails silently so the UI never breaks if Supabase is unavailable.
 * @param {string} userId
 * @param {'user'|'assistant'} role
 * @param {string} message
 */
export async function saveChatMessage(userId, role, message) {
    try {
        await supabase.from('ai_chats').insert({ user_id: userId, role, message })
    } catch (_) {
        // Non-critical — log but don't throw
        console.warn('[aiService] Could not save message to Supabase:', _)
    }
}

// ── Quick Action prompts ───────────────────────────────────────────────────────
export const QUICK_ACTIONS = [
    {
        id: 'explain',
        label: 'Explain Concept',
        icon: 'auto_stories',
        color: 'blue',
        prompt: (topic = 'the current topic') =>
            `Please explain the concept of ${topic} in simple, clear language with examples.`,
    },
    {
        id: 'quiz',
        label: 'Generate Quiz',
        icon: 'quiz',
        color: 'violet',
        prompt: (topic = 'the current topic') =>
            `Generate 5 multiple-choice quiz questions about ${topic} with answers and explanations.`,
    },
    {
        id: 'flashcards',
        label: 'Create Flashcards',
        icon: 'style',
        color: 'emerald',
        prompt: (topic = 'the current topic') =>
            `Create 6 concise flashcards (question + answer) for ${topic}.`,
    },
    {
        id: 'summarize',
        label: 'Summarize Notes',
        icon: 'summarize',
        color: 'amber',
        prompt: (topic = 'the current topic') =>
            `Summarize the key points of ${topic} in a clear, bullet-point format.`,
    },
]
