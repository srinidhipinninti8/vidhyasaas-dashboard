import { useState, useEffect } from 'react'
import { db } from '../supabase'

export default function Settings() {
  const [schoolName, setSchoolName] = useState('')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    db.auth.getUser().then(({ data }) => {
      setSchoolName(data.user?.user_metadata?.school_name || '')
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    setSuccess(false)
    await db.auth.updateUser({ data: { school_name: schoolName } })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div style={{ maxWidth: '480px' }}>
      <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text)', marginBottom: '24px' }}>Settings</div>

      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '24px' }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', marginBottom: '16px' }}>School Information</div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', color: 'var(--text3)', display: 'block', marginBottom: '6px' }}>School name</label>
          <input
            value={schoolName}
            onChange={e => setSchoolName(e.target.value)}
            placeholder="e.g. St. Mary's School"
            style={{
              width: '100%', padding: '9px 12px',
              border: '1px solid var(--border2)', borderRadius: '8px',
              fontSize: '13px', background: 'var(--bg)',
              color: 'var(--text)', outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '9px 20px', background: 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: '8px',
            fontSize: '13px', fontWeight: 500, cursor: saving ? 'not-allowed' : 'pointer',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? 'Saving...' : 'Save changes'}
        </button>

        {success && (
          <span style={{ marginLeft: '12px', fontSize: '12px', color: 'var(--green-text)' }}>
            ✓ Saved successfully!
          </span>
        )}
      </div>
    </div>
  )
}
