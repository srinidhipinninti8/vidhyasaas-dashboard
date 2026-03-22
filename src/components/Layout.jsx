import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { db } from '../supabase'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '⬛' },
  { to: '/students',  label: 'Students',  icon: '👥' },
  { to: '/crm',       label: 'CRM / Leads', icon: '📈' },
  { to: '/finance',   label: 'Finance', icon: '💳' },
  { to: '/staff',     label: 'Staff / HR', icon: '🏢' },
  { to: '/settings',  label: 'Settings', icon: '⚙️' },
]

export default function Layout({ theme, toggleTheme, user, onLogout }) {
  const [schoolName, setSchoolName] = useState('Demo School')

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
    <div style={{ display:'flex', height:'100vh' }}>

      {/* Sidebar */}
      <aside style={{
        width: '220px', background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        <div style={{ padding:'18px', borderBottom:'1px solid var(--border)' }}>
          <div style={{ fontSize:'16px', fontWeight:600, color:'var(--text)' }}>VidyaSaaS</div>
          <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'2px', fontFamily:'var(--mono)' }}>School Management</div>
        </div>

        <nav style={{ flex:1, padding:'8px' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 10px', borderRadius: '8px', marginBottom: '2px',
              cursor: 'pointer', fontSize: '13px', textDecoration: 'none',
              background: isActive ? 'var(--accent-bg)' : 'transparent',
              color: isActive ? 'var(--accent-text)' : 'var(--text2)',
              fontWeight: isActive ? 500 : 400,
              transition: 'all .15s'
            })}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div style={{ padding:'12px 8px', borderTop:'1px solid var(--border)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 10px' }}>
            <div style={{
              width:'28px', height:'28px', borderRadius:'50%',
              background:'var(--accent-bg)', color:'var(--accent-text)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'10px', fontWeight:600
            }}>SA</div>
            <div>
              <div style={{ fontSize:'12px', fontWeight:500, color:'var(--text)' }}>{user?.email?.split('@')[0] || 'Admin'}</div>
              <div style={{ fontSize:'11px', cursor:'pointer', color:'var(--red-text)' }} onClick={onLogout}>Sign out</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Topbar */}
        <div style={{
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          padding: '0 20px', height: '52px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{ flex:1, fontSize:'15px', fontWeight:600, color:'var(--text)' }}>
            VidyaSaaS
          </div>
          <span style={{
            fontSize:'11px', fontFamily:'var(--mono)',
            background:'var(--green-bg)', color:'var(--green-text)',
            padding:'3px 9px', borderRadius:'20px'
          }}>{schoolName}</span>
          <div style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'11px', color:'var(--text3)' }}>
            <span>☀️</span>
            <button onClick={toggleTheme} style={{
              width:'36px', height:'20px',
              background: theme === 'dark' ? 'var(--accent)' : 'var(--border2)',
              borderRadius:'10px', border:'none', cursor:'pointer',
              position:'relative', transition:'background .25s'
            }}>
              <span style={{
                position:'absolute', left: theme === 'dark' ? '18px' : '2px',
                top:'2px', width:'16px', height:'16px', borderRadius:'50%',
                background:'var(--surface)', transition:'left .25s',
                boxShadow:'var(--shadow)'
              }}/>
            </button>
            <span>🌙</span>
          </div>
        </div>

        {/* Page content */}
        <div style={{ flex:1, overflow:'auto', padding:'20px', scrollbarWidth:'thin' }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
