import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { db } from '../supabase'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬛' },
  { to: '/students',  label: 'Students',  icon: '👥' },
  { to: '/crm',       label: 'CRM / Leads', icon: '📈' },
  { to: '/finance',   label: 'Finance', icon: '💳' },
  { to: '/academics', label: 'Academics', icon: '🎓' },
  { to: '/staff',     label: 'Staff / HR', icon: '🏢' },
  { to: '/settings',  label: 'Settings', icon: '⚙️' },
]

export default function Layout({ theme, toggleTheme, user, onLogout }) {
  const [schoolName, setSchoolName] = useState('Demo School')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => { setSidebarOpen(false) }, [location])

  useEffect(() => {
    db.auth.getUser().then(({ data }) => {
      setSchoolName(data.user?.user_metadata?.school_name || 'Demo School')
    })
    const { data: listener } = db.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.user_metadata?.school_name) {
        setSchoolName(session.user.user_metadata.school_name)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.4)',
          zIndex:40, display:'block'
        }} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: '220px',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}>
        {/* Sidebar header */}
        <div style={{ padding:'18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:'16px', fontWeight:600, color:'var(--text)' }}>
              Vidhya<span style={{ color:'#2563eb' }}>SaaS</span>
            </div>
            <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px', fontFamily:'var(--mono)' }}>School Management</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} style={{
            background:'none', border:'none', fontSize:'18px',
            cursor:'pointer', color:'var(--text2)', padding:'4px'
          }}>✕</button>
        </div>

        <nav style={{ flex:1, padding:'8px', overflowY:'auto' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 12px', borderRadius: '8px', marginBottom: '2px',
              cursor: 'pointer', fontSize: '13px', textDecoration: 'none',
              background: isActive ? 'var(--accent-bg)' : 'transparent',
              color: isActive ? 'var(--accent-text)' : 'var(--text2)',
              fontWeight: isActive ? 500 : 400,
              transition: 'all .15s'
            })}>
              <span style={{ fontSize:'16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding:'12px 8px', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px' }}>
            <div style={{
              width:'32px', height:'32px', borderRadius:'50%',
              background:'var(--accent-bg)', color:'var(--accent-text)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'11px', fontWeight:600, flexShrink:0
            }}>SA</div>
            <div style={{ overflow:'hidden' }}>
              <div style={{ fontSize:'12px', fontWeight:500, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                {user?.email?.split('@')[0] || 'Admin'}
              </div>
              <div style={{ fontSize:'11px', cursor:'pointer', color:'var(--red-text)' }} onClick={onLogout}>Sign out</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', width:'100%' }}>

        {/* Topbar */}
        <div style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '0 16px',
          height: '52px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          {/* Hamburger */}
          <button onClick={() => setSidebarOpen(true)} style={{
            background:'none', border:'none', cursor:'pointer',
            fontSize:'20px', color:'var(--text2)', padding:'4px',
            display:'flex', alignItems:'center', justifyContent:'center',
            borderRadius:'6px',
          }}>☰</button>

          <div style={{ flex:1, fontSize:'15px', fontWeight:600, color:'var(--text)' }}>
            Vidhya<span style={{ color:'#2563eb' }}>SaaS</span>
          </div>

          <span style={{
            fontSize:'11px', fontFamily:'var(--mono)',
            background:'var(--green-bg)', color:'var(--green-text)',
            padding:'3px 9px', borderRadius:'20px',
            whiteSpace:'nowrap', maxWidth:'120px',
            overflow:'hidden', textOverflow:'ellipsis'
          }}>{schoolName}</span>

          <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'var(--text3)' }}>
            <span>☀️</span>
            <button onClick={toggleTheme} style={{
              width:'36px', height:'20px',
              background: theme === 'dark' ? 'var(--accent)' : 'var(--border2)',
              borderRadius:'10px', border:'none', cursor:'pointer',
              position:'relative', transition:'background .25s', flexShrink:0
            }}>
              <span style={{
                position:'absolute',
                left: theme === 'dark' ? '18px' : '2px',
                top:'2px', width:'16px', height:'16px', borderRadius:'50%',
                background:'var(--surface)', transition:'left .25s',
                boxShadow:'var(--shadow)'
              }}/>
            </button>
            <span>🌙</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflow:'auto', padding:'16px', scrollbarWidth:'thin' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}