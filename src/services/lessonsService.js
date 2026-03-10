// src/services/lessonsService.js
import { supabase } from './supabaseClient'

const toError = (e) => (e instanceof Error ? e : new Error(e?.message ?? 'Unknown error'))

/** Fetch all lessons for a user, joined with subject names. */
export const getLessons = async (userId) => {
    const { data, error } = await supabase
        .from('lessons')
        .select('*, subjects(name, color_hex)')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
    if (error) throw toError(error)
    return data ?? []
}

/** Fetch a single lesson by ID including its 'outline' (JSONB). */
export const getLessonById = async (lessonId) => {
    const { data, error } = await supabase
        .from('lessons')
        .select('*, subjects(name, color_hex)')
        .eq('id', lessonId)
        .maybeSingle()
    if (error) throw toError(error)
    return data
}

/** Update the 'outline' JSONB field or completion status. */
export const updateLessonProgress = async (lessonId, updates) => {
    const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', lessonId)
        .select()
        .maybeSingle()
    if (error) throw toError(error)
    return data
}
