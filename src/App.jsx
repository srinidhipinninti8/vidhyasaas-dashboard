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
  const [schema, setSchema] = useState('tenant_demo_school')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Safety timeout — never stuck loading more than 5 seconds
    const timeout = setTimeout(() => setLoading(false), 5000)

    db.auth.getSession().then(async ({ data }) => {
      const sessionUser = data.session?.user || null
      setUser(sessionUser)
      if (sessionUser) {
        const s = await getUserSchema()
        setSchema(s || 'tenant_demo_school')
      }
      clearTimeout(timeout)
      setLoading(false)
    })

    const { data: listener } = db.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user || null
      setUser(sessionUser)
      if (sessionUser) {
        const s = await getUserSchema()
        setSchema(s || 'tenant_demo_school')
      }
    })
    return () => {
      listener.subscription.unsubscribe()
      clearTimeout(timeout)
    }
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout theme={theme} toggleTheme={toggleTheme} user={user} onLogout={() => db.auth.signOut().then(() => { window.location.href = 'https://vidhyasaas.vercel.app'; })} />}>
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