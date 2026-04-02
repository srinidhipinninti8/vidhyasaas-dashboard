import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { db, getUserSchema, clearSchemaCache } from './supabase'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import CRM from './pages/CRM'
import Finance from './pages/Finance'
import Academics from './pages/Academics'
import Staff from './pages/Staff'
import Login from './pages/Login'
import Settings from './pages/Settings'
import Landing from './pages/Landing'
import './index.css'

export default function App() {
  const [theme, setTheme] = useState(localStorage.getItem('vs-theme') || 'light')
  const [user, setUser] = useState(null)
  const [schema, setSchema] = useState(null)
  const [ready, setReady] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  useEffect(() => {
    const safety = setTimeout(() => setReady(true), 6000)

    const { data: listener } = db.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user || null
      setUser(sessionUser)
      if (sessionUser) {
        const s = await getUserSchema()
        if (!s) {
          setAccessDenied(true)
          setSchema(null)
        } else {
          setAccessDenied(false)
          setSchema(s)
        }
      } else {
        setAccessDenied(false)
        setSchema(null)
        clearSchemaCache()
      }
      clearTimeout(safety)
      setReady(true)
    })

    return () => {
      listener.subscription.unsubscribe()
      clearTimeout(safety)
    }
  }, [])

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    localStorage.setItem('vs-theme', next)
    document.documentElement.dataset.theme = next
  }

  document.documentElement.dataset.theme = theme

  if (!ready) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text3)', fontSize:'13px' }}>
      Loading...
    </div>
  )

  if (accessDenied) return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', flexDirection:'column', gap:'16px' }}>
      <div style={{ fontSize:'48px' }}>🚫</div>
      <div style={{ fontSize:'18px', fontWeight:600, color:'var(--text)' }}>Access Denied</div>
      <div style={{ fontSize:'13px', color:'var(--text3)', textAlign:'center', maxWidth:'320px' }}>
        Your account is not linked to any school. Please contact your administrator to get access.
      </div>
      <button onClick={() => {
        clearSchemaCache()
        setAccessDenied(false)
        setUser(null)
        db.auth.signOut()
      }} style={{ padding:'9px 20px', background:'#2563eb', color:'#fff', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:500, cursor:'pointer' }}>
        Sign out
      </button>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={async (u) => {
          setUser(u)
          const s = await getUserSchema()
          if (!s) {
            setAccessDenied(true)
          } else {
            setAccessDenied(false)
            setSchema(s)
          }
        }} />} />
        <Route path="/" element={user && schema
          ? <Layout theme={theme} toggleTheme={toggleTheme} user={user} onLogout={() => {
              clearSchemaCache()
              db.auth.signOut().then(() => { window.location.href = '/' })
            }} />
          : <Navigate to="/" />
        }>
          <Route path="dashboard" element={<Dashboard schema={schema} />} />
          <Route path="students" element={<Students schema={schema} />} />
          <Route path="crm" element={<CRM schema={schema} />} />
          <Route path="finance" element={<Finance schema={schema} />} />
          <Route path="academics" element={<Academics schema={schema} />} />
          <Route path="staff" element={<Staff schema={schema} />} />
          <Route path="settings" element={<Settings onUpdate={setUser} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}