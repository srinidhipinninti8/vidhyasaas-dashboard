import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { db, getUserSchema } from './supabase'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const { data } = await db.auth.getSession()
        const sessionUser = data.session?.user || null
        setUser(sessionUser)
        if (sessionUser) {
          const s = await getUserSchema()
          setSchema(s || 'tenant_demo_school')
        }
      } catch(e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()

    const { data: listener } = db.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user || null
      setUser(sessionUser)
      if (sessionUser) {
        const s = await getUserSchema()
        setSchema(s || 'tenant_demo_school')
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

  const Loader = ({ msg }) => (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', color:'var(--text3)', fontSize:'13px' }}>
      {msg || 'Loading...'}
    </div>
  )

  // Show loader while fetching session
  if (loading) return <Loader />

  // Show loader while fetching schema (user logged in but schema not ready yet)
  if (user && !schema) return <Loader msg="Loading your school..." />

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />

        {/* Login */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login onLogin={async (u) => {
          setUser(u)
          const s = await getUserSchema()
          setSchema(s || 'tenant_demo_school')
        }} />} />

        {/* Protected routes */}
        <Route path="/" element={user ? <Layout theme={theme} toggleTheme={toggleTheme} user={user} onLogout={() => db.auth.signOut().then(() => { window.location.href = '/'; })} /> : <Navigate to="/" />}>
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