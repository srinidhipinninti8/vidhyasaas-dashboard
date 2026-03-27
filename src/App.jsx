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
    // Initialize Auth
    const initAuth = async () => {
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
      const sessionUser = session?.user || null
      setUser(sessionUser)
      
      if (sessionUser) {
        const s = await getUserSchema()
        setSchema(s)
      } else {
        setSchema(null)
      }
      setLoading(false) // Ensure loading stops on auth change
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

  // Effect to apply theme to HTML tag
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f8fafc', color:'#64748b', fontSize:'13px' }}>
      Loading VidhyaSaaS...
    </div>
  )

  if (!user) return <Login onLogin={setUser} />

  // If logged in but schema fetch failed, allow access to settings or show error
  if (user && !schema) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f8fafc', color:'#64748b', gap:'10px' }}>
      <p>Error: No school assigned to your account.</p>
      <button onClick={() => db.auth.signOut()} style={{ padding:'8px 16px', background:'#ef4444', color:'white', borderRadius:'6px' }}>Sign Out</button>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <Layout 
            theme={theme} 
            toggleTheme={toggleTheme} 
            user={user} 
            onLogout={() => db.auth.signOut().then(() => {
              setUser(null);
              setSchema(null);
              // Simplified redirect to avoid external URL loops
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
      </Routes>
    </BrowserRouter>
  )
}