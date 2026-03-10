// src/services/db.js
// ─────────────────────────────────────────────────────────────────────────────
// Local IndexedDB configuration using Dexie.
// ─────────────────────────────────────────────────────────────────────────────
import Dexie from 'dexie'

export const db = new Dexie('StudyHubLocalDB')

// Define schema. 
// Note: We only index fields that we plan to query against.
// _sync_status can be: 'synced', 'created', 'updated', 'deleted'
db.version(1).stores({
    notes: 'id, subject_id, user_id, updated_at',
    flashcards: 'id, subject_id, next_review_at',
    study_plans: 'id, target_exam',
    weak_topics: 'id, subject, weakness_score',
    sync_queue: '++id, action, table, payload'
})

// Lifecycle hooks to auto-manage timestamps
const addTimestamps = (item) => {
    const now = new Date().toISOString()
    if (!item.created_at) item.created_at = now
    item.updated_at = now
    return item
}

db.notes.hook('creating', function (primKey, obj) {
    addTimestamps(obj)
})

db.notes.hook('updating', function (mods, primKey, obj) {
    return { updated_at: new Date().toISOString() }
})

db.flashcards.hook('creating', function (primKey, obj) {
    addTimestamps(obj)
})

db.flashcards.hook('updating', function (mods, primKey, obj) {
    return { updated_at: new Date().toISOString() }
})

db.mindmaps.hook('creating', function (primKey, obj) {
    addTimestamps(obj)
})

db.mindmaps.hook('updating', function (mods, primKey, obj) {
    return { updated_at: new Date().toISOString() }
})
