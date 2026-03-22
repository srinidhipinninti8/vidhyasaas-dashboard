import { useState, useEffect } from 'react'
import { db, SCHEMA } from '../supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, leads: 0, fees: '0', staff: 0 })
  const [recent, setRecent] = useState([])
  const [aiQ, setAiQ] = useState('')
  const [aiResp, setAiResp] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => { loadStats() }, [])

  async function loadStats() {
    const [stuRes, leadRes, feeRes, staffRes] = await Promise.all([
      db.schema(SCHEMA).from('students').select('*', { count: 'exact', head: true }),
      db.schema(SCHEMA).from('leads').select('*', { count: 'exact', head: true }),
      db.schema(SCHEMA).from('fee_payments').select('paid_amount'),
      db.schema(SCHEMA).from('staff').select('*', { count: 'exact', head: true }),
    ])
    const totalFee = (feeRes.data || []).reduce((s, r) => s + Number(r.paid_amount || 0), 0)
    setStats({
      students: stuRes.count || 0,
      leads: leadRes.count || 0,
      fees: '₹' + (totalFee / 100000).toFixed(1) + 'L',
      staff: staffRes.count || 0,
    })
    const { data } = await db.schema(SCHEMA).from('students').select('*').order('created_at', { ascending: false }).limit(5)
    setRecent(data || [])
  }

  async function askAI() {
    if (!aiQ.trim()) return
    setAiLoading(true)
    setAiResp('')
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 500,
          system: 'You are an AI assistant for VidyaSaaS, a school management platform for Indian schools. Answer in 2-3 sentences.',
          messages: [{ role: 'user', content: aiQ }]
        })
      })
      const d = await r.json()
      setAiResp(d.content?.[0]?.text || 'No response')
    } catch { setAiResp('AI temporarily unavailable') }
    setAiLoading(false)
    setAiQ('')
  }

  const metrics = [
    { label: 'Total students', value: stats.students, sub: 'Enrolled' },
    { label: 'Active leads', value: stats.leads, sub: 'In pipeline' },
    { label: 'Fee collected', value: stats.fees, sub: 'Total' },
    { label: 'Staff members', value: stats.staff, sub: 'Active' },
  ]

  return (
    <div>
      {/* Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
        {metrics.map(m => (
          <div key={m.label} style={{
            background:'var(--surface)', border:'1px solid var(--border)',
            borderRadius:'var(--radius)', padding:'16px', boxShadow:'var(--shadow)'
          }}>
            <div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'8px', fontWeight:500 }}>{m.label}</div>
            <div style={{ fontSize:'26px', fontWeight:600, color:'var(--text)', letterSpacing:'-.5px' }}>{m.value}</div>
            <div style={{ fontSize:'11px', color:'var(--text3)', marginTop:'4px' }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Recent students */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'var(--radius)', marginBottom:'16px', overflow:'hidden'
      }}>
        <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)', fontSize:'13px', fontWeight:600, color:'var(--text)' }}>
          Recent students
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12.5px' }}>
          <thead>
            <tr style={{ background:'var(--surface2)' }}>
              {['Adm. No','Name','Class','Phone','Status'].map(h => (
                <th key={h} style={{ textAlign:'left', padding:'9px 14px', fontSize:'11px', color:'var(--text3)', fontWeight:500, borderBottom:'1px solid var(--border)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr><td colSpan={5} style={{ padding:'20px', textAlign:'center', color:'var(--text3)' }}>No students yet</td></tr>
            ) : recent.map(s => (
              <tr key={s.id} style={{ borderBottom:'1px solid var(--border)' }}>
                <td style={{ padding:'10px 14px', fontFamily:'var(--mono)', fontSize:'11.5px', color:'var(--text3)' }}>{s.admission_no}</td>
                <td style={{ padding:'10px 14px', fontWeight:500, color:'var(--text)' }}>{s.first_name} {s.last_name}</td>
                <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{s.class_id || '--'}</td>
                <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{s.guardian_phone}</td>
                <td style={{ padding:'10px 14px' }}>
                  <span style={{ background:'var(--green-bg)', color:'var(--green-text)', fontSize:'11px', padding:'2px 8px', borderRadius:'20px', fontWeight:500 }}>Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Assistant */}
      <div style={{
        background:'var(--surface)', border:'1px solid var(--border)',
        borderRadius:'var(--radius)', padding:'16px'
      }}>
        <div style={{ fontSize:'13px', fontWeight:600, color:'var(--text)', marginBottom:'12px' }}>AI School Assistant</div>
        <div style={{ background:'var(--surface2)', borderRadius:'var(--radius-sm)', padding:'12px' }}>
          <div style={{ fontSize:'11.5px', color:'var(--text3)', marginBottom:'8px' }}>
            Ask anything -- "How many students enrolled?" "Who has overdue fees?"
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <input
              value={aiQ}
              onChange={e => setAiQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && askAI()}
              placeholder="Ask about your school..."
              style={{
                flex:1, padding:'8px 11px', fontSize:'12.5px',
                border:'1px solid var(--border2)', borderRadius:'var(--radius-sm)',
                background:'var(--surface)', color:'var(--text)', outline:'none'
              }}
            />
            <button
              onClick={askAI}
              disabled={aiLoading}
              style={{
                padding:'8px 16px', fontSize:'12.5px', fontWeight:500,
                background:'var(--accent-bg)', color:'var(--accent-text)',
                border:'none', borderRadius:'var(--radius-sm)', cursor:'pointer'
              }}
            >
              {aiLoading ? '...' : 'Ask'}
            </button>
          </div>
          {aiResp && (
            <div style={{ marginTop:'10px', fontSize:'12.5px', color:'var(--text2)', lineHeight:1.65 }}>
              {aiResp}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}