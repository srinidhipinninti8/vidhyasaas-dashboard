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
  // Read schema from cache instantly — no waiting
  const [schema, setSchema] = useState(localStorage.getItem('vs-schema') || 'tenant_demo_school')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const safety = setTimeout(() => setReady(true), 5000)

    const { data: listener } = db.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user || null
      setUser(sessionUser)
      if (sessionUser) {
        const s = await getUserSchema()
        setSchema(s || 'tenant_demo_school')
      } else {
        clearSchemaCache()
        setSchema('tenant_demo_school')
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={async (u) => {
          setUser(u)
          const s = await getUserSchema()
          setSchema(s || 'tenant_demo_school')
        }} />} />
        <Route path="/" element={user
          ? <Layout theme={theme} toggleTheme={toggleTheme} user={user}
              onLogout={() => {
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