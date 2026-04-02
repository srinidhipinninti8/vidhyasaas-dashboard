import { createClient } from '@supabase/supabase-js'

const SUPA_URL = 'https://skzfyflcmvzuzrmuwkpv.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNremZ5ZmxjbXZ6dXpybXV3a3B2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5MTc4OTMsImV4cCI6MjA4OTQ5Mzg5M30.TzZhxaJ4_V9SXN0Cmdd2td3OOQor_TVEr27T7hOD19w'

export const db = createClient(SUPA_URL, SUPA_KEY, {
  auth: {
    storageKey: 'sb-skzfyflcmvzuzrmuwkpv-auth-token'
  }
})

export async function getUserSchema() {
  try {
    const { data: { user } } = await db.auth.getUser()
    if (!user) return null

    // Cache is per user — key includes user ID
    const cacheKey = `vs-schema-${user.id}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) return cached

    const { data, error } = await db
      .schema('public')
      .from('profiles')
      .select('school_slug')
      .eq('id', user.id)
      .single()

    if (error || !data) return null

    const schema = 'tenant_' + data.school_slug
    localStorage.setItem(cacheKey, schema)
    return schema
  } catch (e) {
    const { data: { user } } = await db.auth.getUser().catch(() => ({ data: { user: null } }))
    if (!user) return null
    return localStorage.getItem(`vs-schema-${user.id}`) || null
  }
}

export function clearSchemaCache() {
  // Clear all vs-schema keys
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('vs-schema')) localStorage.removeItem(key)
  })
}

export const SCHEMA = 'tenant_demo_school'