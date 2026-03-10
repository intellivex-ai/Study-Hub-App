// src/hooks/useAuth.js
// ─────────────────────────────────────────────────────────────────────────────
// Central auth hook. Provides: user, profile, loading state, and auth actions.
// Wrap your app in <AuthProvider> and call useAuth() anywhere you need them.
// ─────────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  signUp as _signUp,
  login as _login,
  logout as _logout,
  loginWithOAuth as _oauth,
  getProfile,
  onAuthStateChange,
  updateProfile as _updateProfile,
  updatePassword as _updatePassword,
} from '../services/authService'

// ── Context ───────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [session, setSession] = useState(undefined)  // undefined = loading
  const [profile, setProfile] = useState(null)
  const [authError, setAuthError] = useState(null)

  const isLoading = session === undefined

  // Subscribe to auth state changes on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (newSession) => {
      setSession(newSession)
      if (newSession?.user) {
        try {
          const p = await getProfile(newSession.user.id)
          setProfile(p)
        } catch {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
    })
    return unsubscribe
  }, [])

  // ── Actions ──────────────────────────────────────────────────────────────────

  const signUp = useCallback(async ({ fullName, email, password }) => {
    setAuthError(null)
    const { user, session: s, error } = await _signUp({ fullName, email, password })
    if (error) { setAuthError(error.message); return false }
    setSession(s)
    // Supabase may require email confirmation; handle both paths
    if (user && !user.email_confirmed_at) {
      return 'confirm-email'  // caller should show "check your inbox" screen
    }
    navigate('/dashboard')
    return true
  }, [navigate])

  const login = useCallback(async ({ email, password }) => {
    setAuthError(null)
    const { session: s, error } = await _login({ email, password })
    if (error) { setAuthError(error.message); return false }
    setSession(s)
    navigate('/dashboard')
    return true
  }, [navigate])

  const loginWithOAuth = useCallback(async (provider) => {
    setAuthError(null)
    try {
      await _oauth(provider)
    } catch (err) {
      setAuthError(err.message)
    }
  }, [])

  const logout = useCallback(async () => {
    await _logout()
    setSession(null)
    setProfile(null)
    navigate('/login')
  }, [navigate])

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return
    const p = await getProfile(session.user.id)
    setProfile(p)
  }, [session])

  const updateProfile = useCallback(async (updates) => {
    if (!session?.user) return
    const p = await _updateProfile(session.user.id, updates)
    setProfile(p)
    return p
  }, [session])

  const updatePassword = useCallback(async (newPassword) => {
    await _updatePassword(newPassword)
  }, [])

  const value = {
    // State
    user: session?.user ?? null,
    session,
    profile,
    isLoading,
    isAuthenticated: !!session?.user,
    authError,
    // Actions
    signUp,
    login,
    loginWithOAuth,
    logout,
    refreshProfile,
    updateProfile,
    updatePassword,
    clearAuthError: () => setAuthError(null),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}

// ── Route Guard ───────────────────────────────────────────────────────────────
/**
 * Wrap protected routes: redirects to /login when not authenticated.
 *
 * @example
 *   <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
 */
export function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, isLoading, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light dark:bg-bg-dark">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Loading…</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? children : null
}
