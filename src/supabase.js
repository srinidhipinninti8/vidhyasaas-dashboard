import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://skzfyflcmvzuzrmuwkpv.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNremZ5ZmxjbXZ6dXpybXV3a3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTc4OTMsImV4cCI6MjA4OTQ5Mzg5M30.TzZhxaJ4_V9SXN0Cmdd2td3OOQor_TVEr27T7hOD19w'

export const db = createClient(SUPA_URL, SUPA_KEY, {
  auth: {
    storageKey: 'sb-skzfyflcmvzuzrmuwkpv-auth-token'
  }
})

// Returns schema string if user is authorized, or null if not found
export async function getUserSchema() {
  try {
    const cached = localStorage.getItem('vs-schema')
    if (cached) return cached

    const { data: { user } } = await db.auth.getUser()
    if (!user) return null

    const { data, error } = await db
      .schema('public')
      .from('profiles')
      .select('school_slug')
      .eq('id', user.id)
      .single()

    if (error || !data) return null // No profile = no access

    const schema = 'tenant_' + data.school_slug
    localStorage.setItem('vs-schema', schema)
    return schema
  } catch (e) {
    return localStorage.getItem('vs-schema') || null
  }
}

export function clearSchemaCache() {
  localStorage.removeItem('vs-schema')
}

export const SCHEMA = 'tenant_demo_school'