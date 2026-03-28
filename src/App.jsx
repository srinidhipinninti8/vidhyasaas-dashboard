import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { db } from './supabase'
import Login from './components/Login'
import Staff from './components/Staff'

// This "export default function App() {" is the wrapper you were missing!
export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check session on load
    db.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for login/logout changes
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>Loading VidhyaSaaS...</div>
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* If no user, show Login. If user exists, show Staff dashboard */}
        {!user ? (
          <Route path="*" element={<Login onLogin={(u) => setUser(u)} />} />
        ) : (
          <Route path="/" element={<Staff />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}