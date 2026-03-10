// src/services/intellivexAi.js
import { supabase } from './supabaseClient';

export const IntellivexAI = {
    async generateStudyPlan(exam, date, hours, subjects) {
        const { data, error } = await supabase.functions.invoke('intellivex-core', {
            body: { action: 'generate_plan', exam, date, hours, subjects }
        });
        if (error) throw error;
        return data.plan;
    },

    async analyzeWeakTopics(userId, recentScores) {
        const { data, error } = await supabase.functions.invoke('intellivex-core', {
            body: { action: 'detect_weakness', userId, recentScores }
        });
        if (error) throw error;
        return data.weakTopics;
    },

    async improveNotes(rawText) {
        const { data, error } = await supabase.functions.invoke('intellivex-core', {
            body: { action: 'improve_notes', text: rawText }
        });
        if (error) throw error;
        return data.structuredNotes;
    },

    async simplifyConcept(text, level = 'simply') {
        // level can be 'simply', 'deeply', 'like_im_10'
        const { data, error } = await supabase.functions.invoke('intellivex-core', {
            body: { action: 'simplify_concept', text, level }
        });
        if (error) throw error;
        return data.explanation;
    }
};