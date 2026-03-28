import { useState, useEffect } from 'react'
import { db } from '../supabase'

const CLASSES = ['Class 1','Class 2','Class 3','Class 4','Class 5','Class 6','Class 7','Class 8','Class 9','Class 10','Class 11','Class 12']
const SECTIONS = ['A','B','C','D']

export default function Academics({ schema }) {
  const [students, setStudents] = useState([])
  const [selected, setSelected] = useState(null) // { class, section }
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (schema) loadStudents() }, [schema])

  async function loadStudents() {
    setLoading(true)
    const { data } = await db.schema(schema).from('students').select('*').order('first_name')
    setStudents(data || [])
    setLoading(false)
  }

  function getStudents(cls, section) {
    return students.filter(s => s.class_id === cls && s.section === section)
  }

  function getTotalForClass(cls) {
    return students.filter(s => s.class_id === cls).length
  }

  const selectedStudents = selected ? getStudents(selected.cls, selected.section) : []

  if (loading) return (
    <div style={{ padding:'40px', textAlign:'center', color:'var(--text3)', fontSize:'13px' }}>Loading...</div>
  )

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom:'20px' }}>
        <div style={{ fontSize:'18px', fontWeight:600, color:'var(--text)', marginBottom:'4px' }}>Academics</div>
        <div style={{ fontSize:'13px', color:'var(--text3)' }}>Class and section wise student view — {students.length} total students</div>
      </div>

      {/* Class grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'14px', marginBottom:'20px' }}>
        {CLASSES.map(cls => (
          <div key={cls} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>
            {/* Class header */}
            <div style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:'13px', fontWeight:600, color:'var(--text)' }}>{cls}</div>
              <div style={{ fontSize:'11px', color:'var(--text3)', background:'var(--surface2)', padding:'2px 8px', borderRadius:'20px' }}>
                {getTotalForClass(cls)} students
              </div>
            </div>
            {/* Section buttons */}
            <div style={{ padding:'10px', display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'6px' }}>
              {SECTIONS.map(section => {
                const count = getStudents(cls, section).length
                const isSelected = selected?.cls === cls && selected?.section === section
                return (
                  <button
                    key={section}
                    onClick={() => setSelected(isSelected ? null : { cls, section })}
                    style={{
                      padding:'8px 4px', borderRadius:'8px', border:'none',
                      cursor:'pointer', textAlign:'center', transition:'all .15s',
                      background: isSelected ? 'var(--accent-bg)' : count > 0 ? 'var(--surface2)' : 'transparent',
                      border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border2)',
                    }}
                  >
                    <div style={{ fontSize:'13px', fontWeight:600, color: isSelected ? 'var(--accent-text)' : 'var(--text)' }}>
                      {section}
                    </div>
                    <div style={{ fontSize:'10px', color: isSelected ? 'var(--accent-text)' : 'var(--text3)', marginTop:'2px' }}>
                      {count} {count === 1 ? 'student' : 'students'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selected class/section students */}
      {selected && (
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>
          <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ fontSize:'13px', fontWeight:600, color:'var(--text)' }}>
                {selected.cls} — Section {selected.section}
              </div>
              <div style={{ fontSize:'11.5px', color:'var(--text3)', marginTop:'2px' }}>{selectedStudents.length} students</div>
            </div>
            <button onClick={() => setSelected(null)} style={{ background:'none', border:'none', fontSize:'18px', cursor:'pointer', color:'var(--text3)' }}>✕</button>
          </div>

          {selectedStudents.length === 0 ? (
            <div style={{ padding:'32px', textAlign:'center', color:'var(--text3)', fontSize:'13px' }}>
              No students assigned to {selected.cls} Section {selected.section} yet.
              <div style={{ marginTop:'6px', fontSize:'12px' }}>Go to Students → Enroll or edit a student to assign them here.</div>
            </div>
          ) : (
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12.5px' }}>
                <thead>
                  <tr style={{ background:'var(--surface2)' }}>
                    {['#','Admission No','Name','Gender','Guardian','Phone','Status'].map(h => (
                      <th key={h} style={{ textAlign:'left', padding:'9px 14px', fontSize:'11px', color:'var(--text3)', fontWeight:500, borderBottom:'1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedStudents.map((s, i) => (
                    <tr key={s.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'10px 14px', color:'var(--text3)', fontSize:'11.5px' }}>{i + 1}</td>
                      <td style={{ padding:'10px 14px', fontFamily:'var(--mono)', fontSize:'11.5px', color:'var(--text3)' }}>{s.admission_no}</td>
                      <td style={{ padding:'10px 14px', fontWeight:500, color:'var(--text)' }}>{s.first_name} {s.last_name}</td>
                      <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{s.gender || '--'}</td>
                      <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{s.guardian_name || '--'}</td>
                      <td style={{ padding:'10px 14px', color:'var(--text2)' }}>{s.guardian_phone || '--'}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ background:'var(--green-bg)', color:'var(--green-text)', fontSize:'11px', padding:'2px 8px', borderRadius:'20px', fontWeight:500 }}>Active</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}