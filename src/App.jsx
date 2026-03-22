import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { db } from './supabase'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    db.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null)
      setLoading(false)
    })
    const { data: listener } = db.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout theme={theme} toggleTheme={toggleTheme} user={user} onLogout={() => db.auth.signOut().then(() => { window.location.href = 'https://vidhyasaas-dashboard.netlify.app'; })} />}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="crm" element={<CRM />} />
          <Route path="finance" element={<Finance />} />
          <Route path="staff" element={<Staff />} />
          <Route path="settings" element={<Settings onUpdate={setUser} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
