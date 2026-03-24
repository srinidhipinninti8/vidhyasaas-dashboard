import { useState, useEffect, useRef } from 'react'
import { db } from '../supabase'

function Toast({ msg, color }) {
  return msg ? (
    <div style={{
      position:'fixed', top:'20px', right:'20px', padding:'11px 18px',
      borderRadius:'8px', fontSize:'13px', fontWeight:500, zIndex:9999,
      background: color || '#16a34a', color:'#fff',
      boxShadow:'0 4px 14px rgba(0,0,0,0.2)'
    }}>{msg}</div>
  ) : null
}

const STAGES = ['inquiry','visited','applied','enrolled','lost']
const STAGE_COLORS = {
  inquiry:  { bg:'#eff6ff', text:'#1d4ed8' },
  visited:  { bg:'#f5f3ff', text:'#6d28d9' },
  applied:  { bg:'#fffbeb', text:'#b45309' },
  enrolled: { bg:'#f0fdf4', text:'#15803d' },
  lost:     { bg:'#fef2f2', text:'#b91c1c' },
}

export default function CRM({ schema }) {
  const [leads, setLeads] = useState([])
  const [toast, setToast] = useState({ msg:'', color:'' })
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState('')
  const fileRef = useRef()
  const [form, setForm] = useState({
    parent_name:'', parent_phone:'', student_name:'',
    interested_class:'', source:'walk_in', follow_up_date:'', notes:''
  })

  useEffect(() => { if (schema) loadLeads() }, [schema])

  function showToast(msg, color) {
    setToast({ msg, color })
    setTimeout(() => setToast({ msg:'', color:'' }), 3000)
  }

  async function loadLeads() {
    const { data, error } = await db.schema(schema).from('leads').select('*').order('created_at', { ascending: false })
    if (error) { console.error('Load leads error:', error); return }
    setLeads(data || [])
  }

  async function addLead() {
    if (!form.parent_name || !form.parent_phone) {
      showToast('Parent name and phone required', '#d97706')
      return
    }
    const { error } = await db.schema(schema).from('leads').insert({
      parent_name: form.parent_name,
      parent_phone: form.parent_phone,
      student_name: form.student_name || null,
      interested_class: form.interested_class || null,
      source: form.source,
      follow_up_date: form.follow_up_date || null,
      notes: form.notes || null,
      stage: 'inquiry'
    })
    if (error) { showToast('Error: ' + error.message, '#dc2626'); return }
    showToast('Lead added!')
    setForm({ parent_name:'', parent_phone:'', student_name:'', interested_class:'', source:'walk_in', follow_up_date:'', notes:'' })
    setShowForm(false)
    loadLeads()
  }

  async function moveStage(id, stage) {
    const { error } = await db.schema(schema).from('leads').update({ stage, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { showToast('Error moving lead', '#dc2626'); return }
    showToast('Moved to ' + stage + '!')
    loadLeads()
  }

  async function importLeads(e) {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    setImportResult('')
    const text = await file.text()
    const rows = text.trim().split('\n')
    const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '').replace(/\s+/g,'_'))
    const data = rows.slice(1).filter(r => r.trim()).map(row => {
      const vals = row.split(',').map(v => v.trim().replace(/^"|"$/g,''))
      const obj = {}
      headers.forEach((h,i) => obj[h] = vals[i] || null)
      return obj
    })
    let success = 0, failed = 0
    for (const row of data) {
      const insertData = {
        parent_name: row.parent_name || row.parentname || 'Unknown',
        parent_phone: row.parent_phone || row.parentphone || 'Unknown',
        student_name: row.student_name || row.studentname || null,
        interested_class: row.interested_class || row.interestedclass || row.class || null,
        source: 'walk_in',
        follow_up_date: row.follow_up_date || row.followupdate || null,
        notes: row.notes || null,
        stage: 'inquiry'
      }
      const { error } = await db.schema(schema).from('leads').insert(insertData)
      if (error) { console.error('Insert error:', error.message, insertData); failed++ } else { success++ }
    }
    setImporting(false)
    setImportResult(success + ' leads imported' + (failed ? ', ' + failed + ' failed' : ''))
    showToast(success + ' leads imported!')
    loadLeads()
    fileRef.current.value = ''
  }

  function exportCSV() {
    if (!leads.length) { showToast('No leads to export', '#d97706'); return }
    const headers = ['Parent Name','Phone','Student Name','Class','Source','Stage','Follow-up']
    const rows = leads.map(l => [l.parent_name,l.parent_phone,l.student_name,l.interested_class,l.source,l.stage,l.follow_up_date])
    const csv = [headers,...rows].map(r => r.map(v => `"${v||''}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = 'leads_export.csv'
    a.click()
    showToast('Leads exported!')
  }

  const today = new Date().toISOString().split('T')[0]
  const followupsToday = leads.filter(l => l.follow_up_date === today && !['enrolled','lost'].includes(l.stage)).length
  const enrolled = leads.filter(l => l.stage === 'enrolled').length
  const convRate = leads.length ? Math.round(enrolled / leads.length * 100) : 0

  const inp = (id, placeholder, type='text') => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[id]}
      onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
      style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', outline:'none', width:'100%' }}
    />
  )

  return (
    <div>
      <Toast msg={toast.msg} color={toast.color} />

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
        {[
          { label:'Total leads', value: leads.length },
          { label:'Follow-ups today', value: followupsToday },
          { label:'Conversion rate', value: convRate + '%' },
          { label:'Enrolled', value: enrolled },
        ].map(m => (
          <div key={m.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'14px', boxShadow:'var(--shadow)' }}>
            <div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'7px', fontWeight:500 }}>{m.label}</div>
            <div style={{ fontSize:'24px', fontWeight:600, color:'var(--text)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'13px 16px', marginBottom:'14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ fontSize:'13px', fontWeight:600, color:'var(--text)' }}>Admissions pipeline</div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <button onClick={exportCSV} style={{ padding:'6px 12px', fontSize:'12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'6px', cursor:'pointer', color:'var(--text2)' }}>Export CSV</button>
          <button onClick={() => fileRef.current.click()} disabled={importing} style={{ padding:'6px 12px', fontSize:'12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'6px', cursor:'pointer', color:'var(--text2)' }}>
            {importing ? 'Importing...' : 'Import CSV'}
          </button>
          <input ref={fileRef} type="file" accept=".csv" onChange={importLeads} style={{ display:'none' }} />
          <button onClick={() => setShowForm(true)} style={{ padding:'6px 12px', fontSize:'12px', background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:500 }}>+ Add lead</button>
        </div>
      </div>

      {importResult && (
        <div style={{ marginBottom:'12px', padding:'10px 14px', background:'var(--green-bg)', color:'var(--green-text)', borderRadius:'8px', fontSize:'12.5px', fontWeight:500 }}>
          {importResult}
        </div>
      )}

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px' }}>
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage)
          return (
            <div key={stage} style={{ background:'var(--surface2)', borderRadius:'12px', padding:'10px', minHeight:'280px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingBottom:'8px', marginBottom:'6px', borderBottom:'1px solid var(--border)', fontSize:'11.5px', fontWeight:500, color:'var(--text2)', textTransform:'capitalize' }}>
                <span>{stage}</span>
                <span style={{ fontFamily:'var(--mono)', fontSize:'11px', color:'var(--text3)' }}>{stageLeads.length}</span>
              </div>
              {stageLeads.map(lead => (
                <div key={lead.id} onClick={() => setSelected(lead)} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'10px', marginBottom:'7px', cursor:'pointer', boxShadow:'var(--shadow)' }}>
                  <div style={{ fontSize:'12.5px', fontWeight:500, color:'var(--text)', marginBottom:'2px' }}>{lead.student_name || '--'}</div>
                  <div style={{ fontSize:'11px', color:'var(--text3)' }}>{lead.parent_name}</div>
                  <div style={{ fontSize:'11px', color:'var(--text3)' }}>{lead.parent_phone}</div>
                  <div style={{ marginTop:'6px', display:'flex', gap:'4px', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'10px', padding:'1px 6px', borderRadius:'10px', background: STAGE_COLORS[stage].bg, color: STAGE_COLORS[stage].text, fontWeight:500 }}>
                      {lead.interested_class || '--'}
                    </span>
                  </div>
                  {stage !== 'enrolled' && stage !== 'lost' && (
                    <div style={{ marginTop:'6px', display:'flex', gap:'4px', flexWrap:'wrap' }}>
                      {STAGES.filter(s => s !== stage && s !== 'lost' && STAGES.indexOf(s) > STAGES.indexOf(stage)).map(s => (
                        <button key={s} onClick={e => { e.stopPropagation(); moveStage(lead.id, s) }} style={{ fontSize:'10px', padding:'2px 6px', background:'var(--surface2)', border:'0.5px solid var(--border2)', borderRadius:'4px', cursor:'pointer', color:'var(--text2)' }}>
                          {'->'} {s}
                        </button>
                      ))}
                      <button onClick={e => { e.stopPropagation(); moveStage(lead.id, 'lost') }} style={{ fontSize:'10px', padding:'2px 6px', background:'var(--red-bg)', border:'none', borderRadius:'4px', cursor:'pointer', color:'var(--red-text)' }}>
                        Lost
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>

      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', borderRadius:'12px', padding:'22px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
              <div style={{ fontSize:'15px', fontWeight:600, color:'var(--text)' }}>Add new lead</div>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'var(--text2)' }}>x</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Parent name *</div>{inp('parent_name','e.g. Vijay Reddy')}</div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Phone *</div>{inp('parent_phone','+91 9876543210')}</div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Student name</div>{inp('student_name','e.g. Aryan Reddy')}</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Interested class</div>{inp('interested_class','Class 9')}</div>
                <div>
                  <div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Source</div>
                  <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', width:'100%' }}>
                    <option value="walk_in">Walk-in</option>
                    <option value="website">Website</option>
                    <option value="referral">Referral</option>
                    <option value="social">Social media</option>
                    <option value="school_fair">School fair</option>
                  </select>
                </div>
              </div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Follow-up date</div>{inp('follow_up_date','','date')}</div>
              <div>
                <div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Notes</div>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any notes..." rows={2} style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', width:'100%', resize:'vertical', outline:'none' }} />
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>
              <button onClick={addLead} style={{ flex:1, padding:'9px', fontSize:'13px', fontWeight:500, background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'8px', cursor:'pointer' }}>+ Add lead</button>
              <button onClick={() => setShowForm(false)} style={{ padding:'9px 16px', fontSize:'13px', background:'none', border:'1px solid var(--border2)', borderRadius:'8px', cursor:'pointer', color:'var(--text2)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selected && (
        <div onClick={() => setSelected(null)} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', borderRadius:'12px', padding:'22px', width:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
              <div style={{ fontSize:'15px', fontWeight:600, color:'var(--text)' }}>Lead details</div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'var(--text2)' }}>x</button>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {[['Parent',selected.parent_name],['Phone',selected.parent_phone],['Student',selected.student_name],['Class',selected.interested_class],['Source',selected.source],['Stage',selected.stage],['Follow-up',selected.follow_up_date],['Notes',selected.notes]].map(([k,v]) => (
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'0.5px solid var(--border)', fontSize:'12.5px' }}>
                  <span style={{ color:'var(--text2)' }}>{k}</span>
                  <span style={{ fontWeight:500, color:'var(--text)' }}>{v || '--'}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} style={{ marginTop:'16px', width:'100%', padding:'9px', background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:500 }}>Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
