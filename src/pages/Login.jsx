import { useState } from 'react'
import { db } from '../supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')

  async function handleLogin() {
    if (!email || !password) { setError('Email and password required'); return }
    setLoading(true); setError('')
    const { data, error } = await db.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    onLogin(data.user)
  }

  async function handleSignup() {
    if (!email || !password) { setError('Email and password required'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true); setError('')
    const { error } = await db.auth.signUp({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setMessage('Account created! Please check your email to verify before logging in.')
    setMode('login')
  }

  return (
    <div style={{
      height:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg)', fontFamily:'var(--font)'
    }}>
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'16px', padding:'32px', width:'380px',
        boxShadow:'0 20px 60px rgba(0,0,0,0.1)'
      }}>
        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'24px', fontWeight:700, color:'var(--text)', letterSpacing:'-.5px' }}>VidyaSaaS</div>
          <div style={{ fontSize:'12px', color:'var(--text3)', marginTop:'3px' }}>School Management Platform</div>
        </div>

        <div style={{ fontSize:'15px', fontWeight:600, color:'var(--text)', marginBottom:'20px' }}>
          {mode === 'login' ? 'Sign in to your account' : 'Create new account'}
        </div>

        {message && (
          <div style={{ padding:'10px 13px', background:'var(--green-bg)', color:'var(--green-text)', borderRadius:'8px', fontSize:'12.5px', marginBottom:'14px', lineHeight:1.55 }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ padding:'10px 13px', background:'var(--red-bg)', color:'var(--red-text)', borderRadius:'8px', fontSize:'12.5px', marginBottom:'14px' }}>
            {error}
          </div>
        )}

        <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
          <div>
            <div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'5px' }}>Email address</div>
            <input
              type="email"
              placeholder="admin@yourschool.in"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
              style={{ width:'100%', padding:'9px 12px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', outline:'none' }}
            />
          </div>
          <div>
            <div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'5px' }}>Password</div>
            <input
              type="password"
              placeholder={mode === 'login' ? 'Enter your password' : 'Min 6 characters'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleSignup())}
              style={{ width:'100%', padding:'9px 12px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', outline:'none' }}
            />
          </div>
        </div>

        <button
          onClick={mode === 'login' ? handleLogin : handleSignup}
          disabled={loading}
          style={{
            width:'100%', padding:'10px', fontSize:'13px', fontWeight:600,
            background: loading ? 'var(--border2)' : 'var(--accent)',
            color:'#fff', border:'none', borderRadius:'8px', cursor: loading ? 'not-allowed' : 'pointer',
            transition:'filter .15s'
          }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <div style={{ textAlign:'center', marginTop:'16px', fontSize:'12.5px', color:'var(--text3)' }}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <span onClick={() => { setMode('signup'); setError(''); setMessage('') }} style={{ color:'var(--accent-text)', cursor:'pointer', fontWeight:500 }}>Sign up</span>
            </>
          ) : (
            <>Already have an account?{' '}
              <span onClick={() => { setMode('login'); setError(''); setMessage('') }} style={{ color:'var(--accent-text)', cursor:'pointer', fontWeight:500 }}>Sign in</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}