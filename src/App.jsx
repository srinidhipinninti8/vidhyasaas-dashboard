import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { db } from './supabase'
import Login from './components/Login'
import Staff from './components/Staff'

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the Login Page */}
        <Route path="/login" element={!user ? <Login onLogin={(u) => setUser(u)} /> : <Navigate to="/dashboard" />} />
        
        {/* Route for the Staff Dashboard */}
        <Route path="/dashboard" element={user ? <Staff /> : <Navigate to="/login" />} />
        
        {/* All other links stay on your index.html Landing Page */}
      </Routes>
    </BrowserRouter>
  )
}