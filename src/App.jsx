import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { db, getUserSchema } from './supabase'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import CRM from './pages/CRM'
import Finance from './pages/Finance'
import Staff from './pages/Staff'
import Login from './pages/Login'
import Settings from './pages/Settings'
import './index.css'

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('vs-theme') || 'light')
  const [user, setUser] = useState(null)
  const [schema, setSchema] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)
      const { data } = await db.auth.getSession()
      const sessionUser = data.session?.user || null
      setUser(sessionUser)
      
      if (sessionUser) {
        const s = await getUserSchema()
        setSchema(s)
      }
      setLoading(false)
    }

    initAuth()

    const { data: listener } = db.auth.onAuthStateChange(async (_event, session) => {
      setLoading(true)
      const sessionUser = session?.user || null
      setUser(sessionUser)
      
      if (sessionUser) {
        const s = await getUserSchema()
        setSchema(s)
      } else {
        setSchema(null)
      }
      setLoading(false)
    })

    return () => {
      if (listener?.subscription) listener.subscription.unsubscribe()
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('vs-theme', next)
    document.documentElement.dataset.theme = next
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  // 1. Loading State Guard
  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', color:'#64748b', fontSize:'13px' }}>
      Loading VidhyaSaaS...
    </div>
  )

  // 2. Main Router Logic
  return (
    <BrowserRouter>
      <Routes>
        {!user ? (
          /* If no user, every path shows Login */
          <Route path="*" element={<Login onLogin={setUser} />} />
        ) : !schema ? (
          /* If user exists but no school data, show error */
          <Route path="*" element={
            <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc', color:'#64748b', gap:'10px' }}>
              <p>Error: No school assigned to your account.</p>
              <button onClick={() => db.auth.signOut()} style={{ padding:'8px 16px', background:'#ef4444', color:'white', borderRadius:'6px' }}>Sign Out</button>
            </div>
          } />
        ) : (
          /* Everything is good - show the App */
          <Route path="/" element={
            <Layout 
              theme={theme} 
              toggleTheme={toggleTheme} 
              user={user} 
              onLogout={() => db.auth.signOut().then(() => {
                setUser(null);
                setSchema(null);
                window.location.href = '/'; 
              })} 
            />
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard schema={schema} />} />
            <Route path="students" element={<Students schema={schema} />} />
            <Route path="crm" element={<CRM schema={schema} />} />
            <Route path="finance" element={<Finance schema={schema} />} />
            <Route path="staff" element={<Staff schema={schema} />} />
            <Route path="settings" element={<Settings onUpdate={setUser} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}