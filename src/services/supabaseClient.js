// src/services/supabaseClient.js
// ─────────────────────────────────────────────────────────────────────────────
// Singleton Supabase client — import this everywhere instead of calling
// createClient() multiple times.
// ─────────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    '[StudyHub] Missing Supabase env vars. ' +
    'Copy .env.example → .env and fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // Persist session in localStorage so the user stays logged in after refresh
    persistSession: true,
    autoRefreshToken: true,
    // Redirect back here after OAuth / email confirmation
    detectSessionInUrl: true,
  },
})
