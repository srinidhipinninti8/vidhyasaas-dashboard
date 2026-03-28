import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { db } from './supabase'
import Login from './components/Login'
import Staff from './components/Staff'
import Finance from './components/Finance'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [schema, setSchema] = useState(null)

  useEffect(() => {
    // Check for existing session
    db.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user)
        setSchema(session.user.user_metadata?.schema_name || 'tenant_demo_school')
      }
      setLoading(false)
    })

    // Listen for login/logout
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

  if (loading) {
    return (
      <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', color:'#64748b' }}>
        Connecting to VidhyaSaaS...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          <Route path="*" element={<Login onLogin={(u) => setUser(u)} />} />
        ) : (
          <Route path="/">
            <Route index element={<Navigate to="/staff" replace />} />
            <Route path="staff" element={<Staff schema={schema} />} />
            <Route path="finance" element={<Finance schema={schema} />} />
            <Route path="*" element={<Navigate to="/staff" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}