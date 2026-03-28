import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { db } from './supabase'
import Login from './components/Login'
import Staff from './components/Staff'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 1. Check if user is already logged in
    db.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Watch for login/logout actions
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{padding:'20px'}}>Loading VidyaSaaS...</div>

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          /* If NOT logged in, show the Login box */
          <Route path="*" element={<Login onLogin={(u) => setUser(u)} />} />
        ) : (
          /* If logged in, show the Staff Dashboard */
          <Route path="*" element={<Staff />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}