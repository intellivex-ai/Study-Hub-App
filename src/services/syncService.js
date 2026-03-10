// src/services/syncService.js
// ─────────────────────────────────────────────────────────────────────────────
// Handles bi-directional synchronization between Dexie (Local) and Supabase (Remote).
// ─────────────────────────────────────────────────────────────────────────────
import { supabase } from './supabaseClient'
import { db } from './db'

/**
 * Perform a full sync of local changes ascending to remote, 
 * and remote changes descending to local.
 * @param {string} userId - The current user's ID
 */
export async function syncData(userId) {
    if (!userId) return

    // Prevent multiple simultaneous syncs
    if (syncData.isSyncing) return
    syncData.isSyncing = true

    try {
        console.log('[Sync] Starting synchronization...')

        // ── 1. Push Local Changes to Remote ──────────────────────────────────
        await pushTable('notes', 'notes')
        await pushTable('flashcards', 'flashcards')

        // ── 2. Pull Remote Changes to Local ──────────────────────────────────
        await pullTable('notes', userId)
        await pullTable('flashcards', userId)

        console.log('[Sync] Synchronization complete.')
    } catch (err) {
        console.error('[Sync] Error syncing data:', err)
    } finally {
        syncData.isSyncing = false
    }
}

/**
 * Push local dirty records to Supabase.
 */
async function pushTable(localTable, remoteTable) {
    const dirtyRecords = await db[localTable]
        .where('_sync_status')
        .notEqual('synced')
        .toArray()

    if (dirtyRecords.length === 0) return

    for (const record of dirtyRecords) {
        const { _sync_status, ...cleanData } = record

        try {
            if (_sync_status === 'created') {
                const { error } = await supabase.from(remoteTable).insert(cleanData)
                if (!error) await db[localTable].update(record.id, { _sync_status: 'synced' })
            } else if (_sync_status === 'updated') {
                const { error } = await supabase.from(remoteTable).update(cleanData).eq('id', record.id)
                if (!error) await db[localTable].update(record.id, { _sync_status: 'synced' })
            } else if (_sync_status === 'deleted') {
                const { error } = await supabase.from(remoteTable).delete().eq('id', record.id)
                if (!error) await db[localTable].delete(record.id)
            }
        } catch (err) {
            console.error(`[Sync] Failed to push ${localTable} record ${record.id}:`, err)
        }
    }
}

/**
 * Pull new/updated records from Supabase into Dexie.
 */
async function pullTable(tableName, userId) {
    const syncKey = `${tableName}_last_pull`
    const lastSyncRecord = await db.sync_state.get(syncKey)
    const lastSyncTime = lastSyncRecord?.value || '1970-01-01T00:00:00Z'

    // Fetch anything in Supabase modified after our last sync
    const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', userId)
        .gt('updated_at', lastSyncTime)

    if (error || !data || data.length === 0) return

    let latestDate = lastSyncTime

    await db.transaction('rw', db[tableName], async () => {
        for (const remoteRecord of data) {
            const localRecord = await db[tableName].get(remoteRecord.id)

            // Simple last-write-wins based on updated_at
            if (!localRecord || new Date(remoteRecord.updated_at) > new Date(localRecord.updated_at)) {
                await db[tableName].put({ ...remoteRecord, _sync_status: 'synced' })
            }

            if (remoteRecord.updated_at > latestDate) {
                latestDate = remoteRecord.updated_at
            }
        }
    })

    // Update high-water mark
    await db.sync_state.put({ key: syncKey, value: latestDate })
}

// ── Global Event Listeners ────────────────────────────────────────────────────
// Attempt sync when coming back online
window.addEventListener('online', () => {
    console.log('[Network] Back online! Triggering sync.')
    // We get userId from local storage/auth context where appropriate
    // The exact invocation hook should be bound inside a React effect
})
