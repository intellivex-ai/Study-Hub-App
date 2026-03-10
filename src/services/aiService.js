// src/services/aiService.js
// ─────────────────────────────────────────────────────────────────────────────
// AI Tutor service — sends user messages to the NVIDIA-backed /api/ai-tutor
// endpoint and persists the conversation in Supabase (ai_chats table).
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient'


// ── NVIDIA NIM API config ─────────────────────────────────────────────────────
// Migrated to Supabase Edge Function to protect API keys.
// The Edge function `ai-tutor` now securely handles the prompt and API call.

// ── Core API call ─────────────────────────────────────────────────────────────
/**
 * Send a message to the NVIDIA NIM AI tutor via Supabase Edge Function.
 * @param {string} message - The user's message text.
 * @param {Object} [options] - Optional config { context, systemPrompt, signal }
 * @returns {Promise<string>} - The AI's reply text.
 */
export async function askTutor(message, options = {}) {
    const { context, systemPrompt, signal } = options

    // We securely call our edge function instead of hitting NVIDIA directly
    const { data, error } = await supabase.functions.invoke('ai-tutor', {
        body: {
            message,
            context,
            systemPrompt
        },
    })

    if (error) {
        throw new Error(`AI error: ${error.message || 'Unknown error returning from Edge Function'}`)
    }

    if (data?.error) {
        throw new Error(`Edge Function Error: ${data.error}`)
    }

    return data?.reply ?? 'No response from AI.'
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
