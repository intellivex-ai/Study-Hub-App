// src/services/mindMapService.js
import { supabase } from './supabaseClient'

const toError = (e) => (e instanceof Error ? e : new Error(e?.message ?? 'Unknown error'))

/** Fetch the mind map for a specific subject. */
export const getMindMap = async (userId, subjectId) => {
    const { data, error } = await supabase
        .from('mind_maps')
        .select('*')
        .eq('user_id', userId)
        .eq('subject_id', subjectId)
        .maybeSingle()
    if (error) throw toError(error)
    return data?.nodes ?? []
}

/** Create or update a mind map for a subject. */
export const saveMindMap = async (userId, subjectId, nodes) => {
    // Try to find existing record
    const { data: existing } = await supabase
        .from('mind_maps')
        .select('id')
        .eq('user_id', userId)
        .eq('subject_id', subjectId)
        .maybeSingle()

    if (existing) {
        const { error } = await supabase
            .from('mind_maps')
            .update({ nodes, updated_at: new Date().toISOString() })
            .eq('id', existing.id)
        if (error) throw toError(error)
    } else {
        const { error } = await supabase
            .from('mind_maps')
            .insert({ user_id: userId, subject_id: subjectId, nodes })
        if (error) throw toError(error)
    }
}
