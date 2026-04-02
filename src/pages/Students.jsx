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

const CLASSES = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12']
const SECTIONS = ['A','B','C','D']

export default function Students({ schema }) {
  const [students, setStudents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState('')
  const [sectionFilter, setSectionFilter] = useState('')
  const [toast, setToast] = useState({ msg:'', color:'' })
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState('')
  const [selected, setSelected] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const fileRef = useRef()

  const [form, setForm] = useState({
    first_name:'', last_name:'', dob:'', gender:'Male',
    class_id:'Class 1', section:'A',
    guardian_name:'', guardian_phone:'', guardian_email:''
  })

  useEffect(() => { if (schema) loadStudents() }, [schema])

  useEffect(() => {
    let data = students
    if (search) data = data.filter(s =>
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (s.admission_no || '').toLowerCase().includes(search.toLowerCase())
    )
    if (classFilter) data = data.filter(s => s.class_id === classFilter)
    if (sectionFilter) data = data.filter(s => s.section === sectionFilter)
    setFiltered(data)
  }, [search, classFilter, sectionFilter, students])

  function showToast(msg, color) {
    setToast({ msg, color })
    setTimeout(() => setToast({ msg:'', color:'' }), 3000)
  }

  async function loadStudents() {
    const { data } = await db.schema(schema).from('students').select('*').order('created_at', { ascending: false })
    setStudents(data || [])
  }

  async function enroll() {
    if (!form.first_name || !form.last_name || !form.guardian_phone) {
      showToast('Please fill First name, Last name and Phone', '#d97706'); return
    }
    const { error } = await db.schema(schema).from('students').insert({
      first_name: form.first_name,
      last_name: form.last_name,
      dob: form.dob || null,
      gender: form.gender,
      class_id: form.class_id,
      section: form.section,
      guardian_name: form.guardian_name,
      guardian_phone: form.guardian_phone,
      guardian_email: form.guardian_email || null,
      admission_no: 'ADM' + Date.now(),
      status: 'active',
    })
    if (error) { showToast('Error: ' + error.message, '#dc2626'); return }
    showToast('Student enrolled successfully!')
    setForm({ first_name:'', last_name:'', dob:'', gender:'Male', class_id:'Class 1', section:'A', guardian_name:'', guardian_phone:'', guardian_email:'' })
    loadStudents()
  }

  async function saveEdit() {
    const { error } = await db.schema(schema).from('students').update({
      first_name: editForm.first_name,
      last_name: editForm.last_name,
      class_id: editForm.class_id,
      section: editForm.section,
      gender: editForm.gender,
      dob: editForm.dob,
      guardian_name: editForm.guardian_name,
      guardian_phone: editForm.guardian_phone,
      guardian_email: editForm.guardian_email,
    }).eq('id', editForm.id)
    if (error) { showToast('Error: ' + error.message, '#dc2626'); return }
    showToast('Student updated!')
    setEditMode(false)
    setSelected(null)
    loadStudents()
  }

  function downloadTemplate() {
    const csv = 'first_name,last_name,guardian_name,guardian_phone,class_id,section,gender,dob\nAarav,Sharma,Suresh Sharma,+91 9876543210,Class 10,A,Male,2009-05-15'
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = 'student_template.csv'
    a.click()
    showToast('Template downloaded!')
  }

  async function handleCSV(e) {
    const file = e.target.files[0]
    if (!file) return
    setImporting(true)
    setImportProgress(0)
    setImportResult('')
    const text = await file.text()
    const rows = text.trim().split('\n')
    const headers = rows[0].split(',').map(h => h.trim().toLowerCase())
    const data = rows.slice(1).filter(r => r.trim()).map(row => {
      const vals = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const obj = {}
      headers.forEach((h, i) => obj[h] = vals[i] || null)
      return obj
    })
    let success = 0, failed = 0
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const { error } = await db.schema(schema).from('students').insert({
        admission_no: row.admission_no || 'ADM' + Date.now() + i,
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        guardian_name: row.guardian_name || '',
        guardian_phone: row.guardian_phone || '',
        class_id: row.class_id || null,
        section: row.section || null,
        gender: row.gender || null,
        dob: row.dob || null,
        status: 'active'
      })
      if (error) failed++; else success++
      setImportProgress(Math.round((i + 1) / data.length * 100))
      await new Promise(r => setTimeout(r, 30))
    }
    setImporting(false)
    setImportResult(`${success} imported successfully${failed ? `, ${failed} failed` : ''}`)
    showToast(`${success} students imported!`)
    loadStudents()
    fileRef.current.value = ''
  }

  function exportCSV() {
    if (!students.length) { showToast('No students to export', '#d97706'); return }
    const headers = ['Admission No','First Name','Last Name','Class','Section','Gender','Guardian','Phone','Email','Status']
    const rows = students.map(s => [s.admission_no,s.first_name,s.last_name,s.class_id,s.section,s.gender,s.guardian_name,s.guardian_phone,s.guardian_email,s.status])
    const csv = [headers, ...rows].map(r => r.map(v => `"${v||''}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = 'students_export.csv'
    a.click()
    showToast('Students exported!')
  }

  const sel = (field, options, formObj, setFormObj) => (
    <select value={formObj[field]} onChange={e => setFormObj(f => ({ ...f, [field]: e.target.value }))}
      style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', width:'100%' }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  )

  const inp = (id, placeholder, type='text') => (
    <input type={type} placeholder={placeholder} value={form[id]}
      onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
      style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', outline:'none', width:'100%' }}
    />
  )

  const editInp = (id, placeholder, type='text') => (
    <input type={type} placeholder={placeholder} value={editForm[id] || ''}
      onChange={e => setEditForm(f => ({ ...f, [id]: e.target.value }))}
      style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', outline:'none', width:'100%' }}
    />
  )

  return (
    <div>
      <Toast msg={toast.msg} color={toast.color} />

      {/* Enroll form */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
        <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)', fontSize:'13px', fontWeight:600, color:'var(--text)' }}>Enroll new student</div>
        <div style={{ padding:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'11px', marginBottom:'12px' }}>
            <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>First name *</div>{inp('first_name','e.g. Arjun')}</div>
            <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Last name *</div>{inp('last_name','e.g. Kumar')}</div>
            <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Date of birth</div>{inp('dob','','date')}</div>
            <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Gender</div>{sel('gender',['Male','Female','Other'],form,setForm)}</div>
            <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Class</div>{sel('class_id',CLASSES,form,setForm)}</div>
            <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Section</div>{sel('section',SECTIONS,form,setForm)}</div>
            <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Guardian name</div>{inp('guardian_name','e.g. Suresh Kumar')}</div>
            <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Guardian phone *</div>{inp('guardian_phone','+91 9876543210')}</div>
            <div style={{ gridColumn:'span 2' }}><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Guardian email</div>{inp('guardian_email','parent@gmail.com')}</div>
          </div>
          <button onClick={enroll} style={{ padding:'8px 16px', fontSize:'13px', fontWeight:500, background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'8px', cursor:'pointer' }}>
            + Enroll student
          </button>
        </div>
      </div>

      {/* CSV Import */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', marginBottom:'14px', overflow:'hidden' }}>
        <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:'13px', fontWeight:600, color:'var(--text)' }}>Import from CSV</div>
          <button onClick={downloadTemplate} style={{ padding:'5px 10px', fontSize:'11.5px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'6px', cursor:'pointer', color:'var(--text2)' }}>Download template</button>
        </div>
        <div style={{ padding:'16px' }}>
          <div onClick={() => fileRef.current.click()} style={{ border:'2px dashed var(--border2)', borderRadius:'10px', padding:'20px', textAlign:'center', cursor:'pointer' }}>
            <div style={{ fontSize:'13px', color:'var(--text2)', marginBottom:'4px' }}>Click to select CSV file</div>
            <div style={{ fontSize:'11.5px', color:'var(--text3)' }}>Supports .csv — max 500 students</div>
          </div>
          <input ref={fileRef} type="file" accept=".csv" onChange={handleCSV} style={{ display:'none' }} />
          {importing && (
            <div style={{ marginTop:'10px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11.5px', color:'var(--text3)', marginBottom:'4px' }}>
                <span>Importing...</span><span>{importProgress}%</span>
              </div>
              <div style={{ height:'6px', background:'var(--surface2)', borderRadius:'3px', overflow:'hidden' }}>
                <div style={{ height:'100%', width: importProgress + '%', background:'var(--green)', borderRadius:'3px', transition:'width .2s' }} />
              </div>
            </div>
          )}
          {importResult && <div style={{ marginTop:'8px', fontSize:'12.5px', color:'var(--green-text)' }}>✓ {importResult}</div>}
        </div>
      </div>

      {/* Students table */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>
        <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)', display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ fontSize:'13px', fontWeight:600, color:'var(--text)', flex:1 }}>All students ({filtered.length})</div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or adm no..."
            style={{ padding:'7px 11px', fontSize:'12.5px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', outline:'none', width:'200px' }} />
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)}
            style={{ padding:'7px 11px', fontSize:'12.5px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)' }}>
            <option value=''>All classes</option>
            {CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={sectionFilter} onChange={e => setSectionFilter(e.target.value)}
            style={{ padding:'7px 11px', fontSize:'12.5px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)' }}>
            <option value=''>All sections</option>
            {SECTIONS.map(s => <option key={s}>Section {s}</option>)}
          </select>
          <button onClick={exportCSV} style={{ padding:'7px 12px', fontSize:'12px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'8px', cursor:'pointer', color:'var(--text2)' }}>Export CSV</button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12.5px' }}>
            <thead>
              <tr style={{ background:'var(--surface2)' }}>
                {['Adm. No','Name','Class','Section','Guardian','Phone','Status',''].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'9px 14px', fontSize:'11px', color:'var(--text3)', fontWeight:500, borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding:'24px', textAlign:'center', color:'var(--text3)' }}>No students found. Enroll your first student above!</td></tr>
              ) : filtered.map(s => (
                <tr key={s.id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'10px 14px', fontFamily:'var(--mono)', fontSize:'11.5px', color:'var(--text3)' }}>{s.admission_no}</td>
                  <td style={{ padding:'10px 14px', fontWeight:500, color:'var(--text)' }}>{s.first_name} {s.last_name}</td>
                  <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{s.class_id || '--'}</td>
                  <td style={{ padding:'10px 14px' }}>
                    {s.section ? <span style={{ background:'var(--accent-bg)', color:'var(--accent-text)', fontSize:'11px', padding:'2px 8px', borderRadius:'20px', fontWeight:600 }}>Section {s.section}</span> : '--'}
                  </td>
                  <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{s.guardian_name || '--'}</td>
                  <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{s.guardian_phone}</td>
                  <td style={{ padding:'10px 14px' }}>
                    <span style={{ background:'var(--green-bg)', color:'var(--green-text)', fontSize:'11px', padding:'2px 8px', borderRadius:'20px', fontWeight:500 }}>Active</span>
                  </td>
                  <td style={{ padding:'10px 14px' }}>
                    <button onClick={() => { setSelected(s); setEditForm(s); setEditMode(false) }}
                      style={{ padding:'4px 10px', fontSize:'11.5px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'6px', cursor:'pointer', color:'var(--text2)' }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View/Edit modal */}
      {selected && (
        <div onClick={() => { setSelected(null); setEditMode(false) }} style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background:'var(--surface)', borderRadius:'12px', padding:'22px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.3)', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <div style={{ fontSize:'15px', fontWeight:600, color:'var(--text)' }}>{editMode ? 'Edit student' : 'Student details'}</div>
              <div style={{ display:'flex', gap:'8px' }}>
                {!editMode && <button onClick={() => setEditMode(true)} style={{ padding:'4px 12px', fontSize:'12px', background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:500 }}>Edit</button>}
                <button onClick={() => { setSelected(null); setEditMode(false) }} style={{ background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'var(--text2)' }}>x</button>
              </div>
            </div>

            {editMode ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'4px' }}>First name</div>{editInp('first_name','First name')}</div>
                <div><div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'4px' }}>Last name</div>{editInp('last_name','Last name')}</div>
                <div>
                  <div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'4px' }}>Class</div>
                  <select value={editForm.class_id || ''} onChange={e => setEditForm(f => ({ ...f, class_id: e.target.value }))}
                    style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', width:'100%' }}>
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'4px' }}>Section</div>
                  <select value={editForm.section || ''} onChange={e => setEditForm(f => ({ ...f, section: e.target.value }))}
                    style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', width:'100%' }}>
                    {SECTIONS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'4px' }}>Guardian name</div>{editInp('guardian_name','Guardian name')}</div>
                <div><div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'4px' }}>Guardian phone</div>{editInp('guardian_phone','Phone')}</div>
                <div style={{ gridColumn:'span 2' }}><div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'4px' }}>Guardian email</div>{editInp('guardian_email','Email')}</div>
                <div style={{ gridColumn:'span 2', display:'flex', gap:'8px', marginTop:'6px' }}>
                  <button onClick={saveEdit} style={{ flex:1, padding:'9px', fontSize:'13px', fontWeight:500, background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'8px', cursor:'pointer' }}>Save changes</button>
                  <button onClick={() => setEditMode(false)} style={{ padding:'9px 16px', fontSize:'13px', background:'none', border:'1px solid var(--border2)', borderRadius:'8px', cursor:'pointer', color:'var(--text2)' }}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  {[
                    ['Admission No', selected.admission_no],
                    ['Name', `${selected.first_name} ${selected.last_name}`],
                    ['Class', selected.class_id || '--'],
                    ['Section', selected.section ? `Section ${selected.section}` : '--'],
                    ['Gender', selected.gender],
                    ['Date of birth', selected.dob],
                    ['Guardian', selected.guardian_name],
                    ['Phone', selected.guardian_phone],
                    ['Email', selected.guardian_email],
                  ].map(([k,v]) => (
                    <div key={k} style={{ padding:'8px', background:'var(--surface2)', borderRadius:'6px' }}>
                      <div style={{ fontSize:'10.5px', color:'var(--text3)', marginBottom:'3px' }}>{k}</div>
                      <div style={{ fontSize:'12.5px', fontWeight:500, color:'var(--text)' }}>{v || '--'}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>
  <button onClick={() => { setSelected(null); setEditMode(false) }} style={{ flex:1, padding:'9px', background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:500 }}>Close</button>
  <button onClick={async () => {
    if (!window.confirm(`Delete ${selected.first_name} ${selected.last_name}? This cannot be undone.`)) return
    const { error } = await db.schema(schema).from('students').delete().eq('id', selected.id)
    if (error) { showToast('Error deleting student', '#dc2626'); return }
    showToast('Student deleted!')
    setSelected(null)
    setEditMode(false)
    loadStudents()
  }} style={{ flex:1, padding:'9px', background:'#dc2626', color:'#fff', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'13px', fontWeight:500 }}>
    Delete
  </button>
</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}