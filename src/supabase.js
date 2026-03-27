import { createClient } from '@supabase/supabase-js'

// Using Environment Variables for Security & Flexibility
const SUPA_URL = import.meta.env.VITE_SUPABASE_URL
const SUPA_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const db = createClient(SUPA_URL, SUPA_KEY, {
  auth: {
    storageKey: 'sb-skzfyflcmvzuzrmuwkpv-auth-token',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Optimized function to get the school schema
export async function getUserSchema() {
  try {
    // 1. Get the session (more reliable than getUser on initial load)
    const { data: { session } } = await db.auth.getSession()
    if (!session?.user) return null

    // 2. Fetch the school slug from the profiles table
    const { data, error } = await db
      .from('profiles') // Defaults to public schema
      .select('school_slug')
      .eq('id', session.user.id)
      .single()

    if (error || !data) {
      console.error("Schema Fetch Error:", error)
      return 'tenant_demo_school' // Fallback to your demo schema so the app doesn't break
    }

    return `tenant_${data.school_slug}`
  } catch (err) {
    return 'tenant_demo_school'
  }
}

// Keeping this for your existing components
export const SCHEMA = 'tenant_demo_school'