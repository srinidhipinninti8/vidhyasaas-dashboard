import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { db } from './supabase'
import Login from './components/Login'
import Staff from './components/Staff'
import Finance from './components/Finance'
// Add any other imports you have here (Settings, Students, etc.)

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [schema, setSchema] = useState(null)

  useEffect(() => {
    // This checks if someone is logged in
    db.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setSchema(session.user.user_metadata?.schema_name || 'tenant_demo_school')
      }
      setLoading(false)
    })

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user)
        setSchema(session.user.user_metadata?.schema_name || 'tenant_demo_school')
      } else {
        setUser(null)
        setSchema(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // 1. Loading State
  if (loading) {
    return (
      <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', color:'#64748b', fontSize:'13px' }}>
        Connecting to VidhyaSaaS...
      </div>
    )
  }

  // 2. Main Application logic
  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          /* If no user, show Login */
          <Route path="*" element={<Login onLogin={(u) => setUser(u)} />} />
        ) : (
          /* If user exists, show the Dashboard/Staff */
          <Route path="/">
            <Route index element={<Navigate to="/staff" replace />} />
            <Route path="staff" element={<Staff schema={schema} />} />
            <Route path="finance" element={<Finance schema={schema} />} />
            {/* You can add more routes here later */}
            <Route path="*" element={<Navigate to="/staff" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}