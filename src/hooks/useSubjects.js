// src/hooks/useSubjects.js
// ─────────────────────────────────────────────────────────────────────────────
// Live subjects state with Supabase realtime + optimistic updates.
// Also fetches the user's profile stats (streak, study minutes).
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
    getSubjects,
    createSubject,
    updateSubject,
    deleteSubject,
    subscribeToSubjects,
    getUserStats,
    subscribeToUserStats,
} from '../services/subjectsService'

export function useSubjects() {
    const { user } = useAuth()
    const [subjects, setSubjects] = useState([])
    const [stats, setStats] = useState(null)   // streak, total_study_minutes, etc.
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // ── Initial load ─────────────────────────────────────────────────────────────
    const load = useCallback(async () => {
        if (!user) return
        setLoading(true)
        setError(null)
        try {
            const [subs, userStats] = await Promise.all([
                getSubjects(user.id),
                getUserStats(user.id),
            ])
            setSubjects(subs)
            setStats(userStats)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => { load() }, [load])

    // ── Realtime: subjects ────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user) return
        const ch = subscribeToSubjects(user.id, (event, row) => {
            setSubjects((prev) => {
                if (event === 'INSERT') return [...prev, row].sort((a, b) => a.name.localeCompare(b.name))
                if (event === 'UPDATE') return prev.map((s) => (s.id === row.id ? { ...s, ...row } : s))
                if (event === 'DELETE') return prev.filter((s) => s.id !== row.id)
                return prev
            })
        })
        return () => ch.unsubscribe()
    }, [user])

    // ── Realtime: user stats (streak, study minutes) ──────────────────────────────
    useEffect(() => {
        if (!user) return
        const ch = subscribeToUserStats(user.id, (row) => {
            setStats((prev) => ({ ...prev, ...row }))
        })
        return () => ch.unsubscribe()
    }, [user])

    // ── Actions ──────────────────────────────────────────────────────────────────
    const create = useCallback(async (params) => {
        if (!user) return
        const subject = await createSubject({ userId: user.id, ...params })
        setSubjects((prev) => [...prev, subject].sort((a, b) => a.name.localeCompare(b.name)))
        return subject
    }, [user])

    const update = useCallback(async (subjectId, changes) => {
        // Optimistic
        setSubjects((prev) => prev.map((s) => (s.id === subjectId ? { ...s, ...changes } : s)))
        try {
            await updateSubject(subjectId, changes)
        } catch (err) {
            setError(err.message)
            load() // revert
        }
    }, [load])

    const remove = useCallback(async (subjectId) => {
        setSubjects((prev) => prev.filter((s) => s.id !== subjectId))
        try {
            await deleteSubject(subjectId)
        } catch (err) {
            setError(err.message)
            load()
        }
    }, [load])

    return { subjects, stats, loading, error, create, update, remove, reload: load }
}
