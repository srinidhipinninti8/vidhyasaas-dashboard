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
    db.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user || null
      setUser(sessionUser)
      if (sessionUser) {
        // Retry up to 3 times if schema fetch fails
        let s = null
        for (let i = 0; i < 3; i++) {
          s = await getUserSchema()
          if (s) break
          await new Promise(r => setTimeout(r, 500))
        }
        setSchema(s)
      }
      setLoading(false)
    })

    const { data: listener } = db.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user || null
      setUser(sessionUser)
      if (sessionUser) {
        let s = null
        for (let i = 0; i < 3; i++) {
          s = await getUserSchema()
          if (s) break
          await new Promise(r => setTimeout(r, 500))
        }
        setSchema(s)
      } else {
        setSchema(null)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('vs-theme', next)
    document.documentElement.dataset.theme = next
  }

  document.documentElement.dataset.theme = theme

  if (loading) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text3)', fontSize:'13px' }}>
      Loading...
    </div>
  )

  if (!user) return <Login onLogin={setUser} />

  if (user && !schema) return (
    <div style={{ height:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text3)', fontSize:'13px', gap:'12px' }}>
      <div>Error: No school assigned to your account.</div>
      <button onClick={() => db.auth.signOut().then(() => window.location.reload())}
        style={{ padding:'8px 16px', background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px' }}>
        Sign out
      </button>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout theme={theme} toggleTheme={toggleTheme} user={user} onLogout={() => db.auth.signOut().then(() => { setUser(null); setSchema(null); window.location.href = 'https://vidhyasaas-dashboard.vercel.app'; })} />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard schema={schema} />} />
          <Route path="students" element={<Students schema={schema} />} />
          <Route path="crm" element={<CRM schema={schema} />} />
          <Route path="finance" element={<Finance schema={schema} />} />
          <Route path="staff" element={<Staff schema={schema} />} />
          <Route path="settings" element={<Settings onUpdate={setUser} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}