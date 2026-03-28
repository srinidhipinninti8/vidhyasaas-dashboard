import { useState } from 'react'
import { db } from '../supabase'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login')
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault(); // Prevents page reload
    if (!email || !password) { setError('Email and password required'); return }
    
    setLoading(true); 
    setError('');
    
    if (mode === 'login') {
      const { data, error } = await db.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
        setLoading(false)
      } else {
        console.log("Login Success, sending user to App.jsx:", data.user)
        onLogin(data.user) // This triggers the App.jsx redirect
      }
    } else {
      const { error } = await db.auth.signUp({ email, password })
      setLoading(false)
      if (error) { setError(error.message) }
      else {
        setMessage('Account created! Please check your email to verify.')
        setMode('login')
      }
    }
  }

  return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      {/* WRAP EVERYTHING IN A FORM TAG */}
      <form onSubmit={handleSubmit} style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'16px', padding:'32px', width:'380px',
        boxShadow:'0 20px 60px rgba(0,0,0,0.1)'
      }}>
        <div style={{ textAlign:'center', marginBottom:'28px' }}>
          <div style={{ fontSize:'24px', fontWeight:700, color:'var(--text)' }}>VidyaSaaS</div>
        </div>

        {error && <div style={{ color:'red', marginBottom:'10px', fontSize:'12px' }}>{error}</div>}
        {message && <div style={{ color:'green', marginBottom:'10px', fontSize:'12px' }}>{message}</div>}

        <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)' }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width:'100%', padding:'9px 12px', borderRadius:'8px', border:'1px solid var(--border2)' }}
          />
        </div>

        {/* Change type to "submit" */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width:'100%', padding:'10px', background:'var(--accent)',
            color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer'
          }}
        >
          {loading ? 'Processing...' : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <div style={{ textAlign:'center', marginTop:'16px', fontSize:'12px', cursor:'pointer' }} onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
          {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
        </div>
      </form>
    </div>
  )
}