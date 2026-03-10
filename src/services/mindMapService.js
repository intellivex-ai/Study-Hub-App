// src/services/mindMapService.js
import { db } from './db'
import { askTutor } from './aiService'

export const getMindMap = async (userId, subjectId) => {
    try {
        const record = await db.mindmaps.where({ user_id: userId, subject_id: subjectId }).first()
        return record ? record.data : null
    } catch (err) {
        console.error('Dexie getMindMap error:', err)
        return null
    }
}

export const saveMindMap = async (userId, subjectId, data) => {
    try {
        // data contains { nodes, edges } for React Flow
        const existing = await db.mindmaps.where({ user_id: userId, subject_id: subjectId }).first()
        if (existing) {
            await db.mindmaps.update(existing.id, { data, _sync_status: 'updated' })
        } else {
            await db.mindmaps.add({
                id: crypto.randomUUID(),
                user_id: userId,
                subject_id: subjectId,
                data,
                _sync_status: 'created'
            })
        }
    } catch (err) {
        console.error('Dexie saveMindMap error:', err)
    }
}

export const generateMindMapFromAI = async (topic) => {
    const prompt = `Generate a hierarchical mind map about "${topic}".
Return ONLY a valid JSON object with {"nodes": [], "edges": []}.
Format for React Flow:
nodes: { id: string, position: {x, y}, data: { label: string } }
edges: { id: string, source: string, target: string }
Important:
- Give the root node id "root" and center it near {x: 250, y: 50}.
- Position child nodes algorithmically in a tree layout.
- Return ONLY JSON, no markdown formatting.`;

    const response = await askTutor(prompt);
    try {
        // Strip markdown if AI returned it by mistake
        let jsonStr = response.trim();
        if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/```json/g, '').replace(/```/g, '');
        } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```/g, '');
        }
        return JSON.parse(jsonStr);
    } catch (err) {
        console.error('Failed to parse AI mind map JSON:', err);
        throw new Error('AI returned invalid format for Mind Map.');
    }
}
