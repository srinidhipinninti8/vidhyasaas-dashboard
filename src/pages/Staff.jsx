import { useState, useEffect } from 'react'
import { db, SCHEMA } from '../supabase'

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

export default function Staff() {
  const [staff, setStaff] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState({ msg:'', color:'' })
  const [showForm, setShowForm] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({
    first_name:'', last_name:'', phone:'', email:'',
    role:'teacher', department:'', salary:''
  })

  useEffect(() => { loadStaff() }, [])

  useEffect(() => {
    if (!search) { setFiltered(staff); return }
    setFiltered(staff.filter(s =>
      `${s.first_name} ${s.last_name} ${s.role} ${s.department}`.toLowerCase().includes(search.toLowerCase())
    ))
  }, [search, staff])

  function showToast(msg, color) {
    setToast({ msg, color })
    setTimeout(() => setToast({ msg:'', color:'' }), 3000)
  }

  async function loadStaff() {
    const { data, error } = await db.schema(SCHEMA).from('staff').select('*').order('created_at', { ascending: false })
    if (error) { console.error(error); return }
    setStaff(data || [])
    setFiltered(data || [])
  }

  async function addStaff() {
    if (!form.first_name || !form.last_name) {
      showToast('First and last name required', '#d97706'); return
    }
    const { error } = await db.schema(SCHEMA).from('staff').insert({
      employee_id: 'EMP' + Date.now(),
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone || null,
      email: form.email || null,
      role: form.role,
      department: form.department || null,
      salary: parseFloat(form.salary) || 0,
      status: 'active',
      join_date: new Date().toISOString().split('T')[0]
    })
    if (error) { showToast('Error: ' + error.message, '#dc2626'); return }
    showToast('Staff member added!')
    setForm({ first_name:'', last_name:'', phone:'', email:'', role:'teacher', department:'', salary:'' })
    setShowForm(false)
    loadStaff()
  }

  function exportCSV() {
    if (!staff.length) { showToast('No staff to export', '#d97706'); return }
    const headers = ['Employee ID','First Name','Last Name','Role','Department','Phone','Email','Salary','Status']
    const rows = staff.map(s => [s.employee_id,s.first_name,s.last_name,s.role,s.department,s.phone,s.email,s.salary,s.status])
    const csv = [headers,...rows].map(r => r.map(v => `"${v||''}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = 'staff_export.csv'
    a.click()
    showToast('Staff exported!')
  }

  const totalPayroll = staff.reduce((s, r) => s + Number(r.salary || 0), 0)

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

      {/* Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
        {[
          { label:'Total staff', value: staff.length },
          { label:'Teaching staff', value: staff.filter(s => s.role === 'teacher' || s.role === 'hod').length },
          { label:'Monthly payroll', value: '₹' + (totalPayroll/100000).toFixed(1) + 'L' },
          { label:'Departments', value: [...new Set(staff.map(s => s.department).filter(Boolean))].length },
        ].map(m => (
          <div key={m.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'14px', boxShadow:'var(--shadow)' }}>
            <div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'7px', fontWeight:500 }}>{m.label}</div>
            <div style={{ fontSize:'24px', fontWeight:600, color:'var(--text)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      {/* Staff table */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>
        <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)', display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ fontSize:'13px', fontWeight:600, color:'var(--text)', flex:1 }}>Staff directory ({filtered.length})</div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, role, department..."
            style={{ padding:'7px 11px', fontSize:'12.5px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', outline:'none', width:'240px' }}
          />
          <button onClick={exportCSV} style={{ padding:'7px 12px', fontSize:'12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'8px', cursor:'pointer', color:'var(--text2)' }}>
            Export CSV
          </button>
          <button onClick={() => setShowForm(true)} style={{ padding:'7px 12px', fontSize:'12px', background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:500 }}>
            + Add staff
          </button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12.5px' }}>
            <thead>
              <tr style={{ background:'var(--surface2)' }}>
                {['Employee ID','Name','Role','Department','Phone','Salary','Status',''].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'9px 14px', fontSize:'11px', color:'var(--text3)', fontWeight:500, borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding:'24px', textAlign:'center', color:'var(--text3)' }}>
                  No staff added yet. Click + Add staff to begin.
                </td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'10px 14px', fontFamily:'var(--mono)', fontSize:'11.5px', color:'var(--text3)' }}>{s.employee_id}</td>
                  <td style={{ padding:'10px 14px', fontWeight:500, color:'var(--text)' }}>{s.first_name} {s.last_name}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'var(--accent-bg)', color:'var(--accent-text)', fontWeight:500, textTransform:'capitalize' }}>{s.role}</span>
                  </td>
                  <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{s.department || '--'}</td>
                  <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{s.phone || '--'}</td>
                  <td style={{ padding:'10px 14px', color:'var(--text)' }}>₹{Number(s.salary||0).toLocaleString('en-IN')}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'var(--green-bg)', color:'var(--green-text)', fontWeight:500 }}>Active</span>
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <button onClick={() => setSelected(s)} style={{ padding:'4px 10px', fontSize:'11.5px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'6px', cursor:'pointer', color:'var(--text2)' }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add staff modal */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', borderRadius:'12px', padding:'22px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
              <div style={{ fontSize:'15px', fontWeight:600, color:'var(--text)' }}>Add staff member</div>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'var(--text2)' }}>x</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>First name *</div>{inp('first_name','e.g. Lakshmi')}</div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Last name *</div>{inp('last_name','e.g. Iyer')}</div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Phone</div>{inp('phone','+91 9876543210')}</div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Email</div>{inp('email','staff@school.in')}</div>
              <div>
                <div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Role</div>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', width:'100%' }}>
                  <option value="teacher">Teacher</option>
                  <option value="hod">HOD</option>
                  <option value="principal">Principal</option>
                  <option value="admin">Admin</option>
                  <option value="accountant">Accountant</option>
                  <option value="peon">Peon</option>
                  <option value="security">Security</option>
                </select>
              </div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Department</div>{inp('department','e.g. Mathematics')}</div>
              <div style={{ gridColumn:'span 2' }}><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Salary (₹)</div>{inp('salary','e.g. 35000','number')}</div>
            </div>
            <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>
              <button onClick={addStaff} style={{ flex:1, padding:'9px', fontSize:'13px', fontWeight:500, background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'8px', cursor:'pointer' }}>+ Add staff</button>
              <button onClick={() => setShowForm(false)} style={{ padding:'9px 16px', fontSize:'13px', background:'none', border:'1px solid var(--border2)', borderRadius:'8px', cursor:'pointer', color:'var(--text2)' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* View staff modal */}
      {selected && (
        <div onClick={() => setSelected(null)} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', borderRadius:'12px', padding:'22px', width:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
              <div style={{ fontSize:'15px', fontWeight:600, color:'var(--text)' }}>Staff details</div>
              <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'var(--text2)' }}>x</button>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {[
                ['Employee ID', selected.employee_id],
                ['Name', `${selected.first_name} ${selected.last_name}`],
                ['Role', selected.role],
                ['Department', selected.department],
                ['Phone', selected.phone],
                ['Email', selected.email],
                ['Salary', '₹' + Number(selected.salary||0).toLocaleString('en-IN')],
                ['Join date', selected.join_date],
                ['Status', selected.status],
              ].map(([k,v]) => (
                <div key={k} style={{ padding:'8px', background:'var(--surface2)', borderRadius:'6px' }}>
                  <div style={{ fontSize:'10.5px', color:'var(--text3)', marginBottom:'3px' }}>{k}</div>
                  <div style={{ fontSize:'12.5px', fontWeight:500, color:'var(--text)' }}>{v || '--'}</div>
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
