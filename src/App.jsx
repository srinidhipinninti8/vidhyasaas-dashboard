// VERSION 2.0 - FIXED WRAPPER
import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { db } from './supabase'
import Login from './components/Login'
import Staff from './components/Staff'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{padding:'20px'}}>Loading...</div>

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <Route path="*" element={<Login onLogin={(u) => setUser(u)} />} />
        ) : (
          <Route path="/" element={<Staff />} />
        )}
      </Routes>
    </BrowserRouter>
  )
}