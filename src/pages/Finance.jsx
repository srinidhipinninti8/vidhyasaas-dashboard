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

export default function Finance() {
  const [payments, setPayments] = useState([])
  const [toast, setToast] = useState({ msg:'', color:'' })
  const [form, setForm] = useState({
    admission_no:'', fee_type:'Tuition fee', amount:'',
    discount:'0', payment_mode:'UPI', transaction_id:''
  })

  useEffect(() => { loadPayments() }, [])

  function showToast(msg, color) {
    setToast({ msg, color })
    setTimeout(() => setToast({ msg:'', color:'' }), 3000)
  }

  async function loadPayments() {
    const { data } = await db.schema(SCHEMA).from('fee_payments').select('*').order('created_at', { ascending: false })
    setPayments(data || [])
  }

  async function recordPayment() {
    if (!form.admission_no || !form.amount) {
      showToast('Admission number and amount required', '#d97706'); return
    }
    const amount = parseFloat(form.amount)
    const discount = parseFloat(form.discount) || 0
    const paid = amount - discount
    const receiptNo = 'RCP' + Date.now()
    const { error } = await db.schema(SCHEMA).from('fee_payments').insert({
      amount, discount, paid_amount: paid, balance: 0,
      payment_mode: form.payment_mode.toLowerCase(),
      transaction_id: form.transaction_id || null,
      receipt_no: receiptNo, status: 'paid',
      payment_date: new Date().toISOString().split('T')[0],
      notes: 'Admission: ' + form.admission_no
    })
    if (error) { showToast('Error: ' + error.message, '#dc2626'); return }
    showToast('Payment recorded! Receipt: ' + receiptNo)
    setForm({ admission_no:'', fee_type:'Tuition fee', amount:'', discount:'0', payment_mode:'UPI', transaction_id:'' })
    loadPayments()
  }

  function exportCSV() {
    if (!payments.length) { showToast('No payments to export', '#d97706'); return }
    const headers = ['Receipt No','Admission No','Amount','Paid','Discount','Mode','Date','Status']
    const rows = payments.map(p => [p.receipt_no, p.notes?.replace('Admission: ',''), p.amount, p.paid_amount, p.discount, p.payment_mode, p.payment_date, p.status])
    const csv = [headers,...rows].map(r => r.map(v => `"${v||''}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }))
    a.download = 'fees_export.csv'
    a.click()
    showToast('Payments exported!')
  }

  const totalCollected = payments.reduce((s,p) => s + Number(p.paid_amount||0), 0)
  const overdueList = payments.filter(p => p.status === 'overdue' || p.status === 'partial')
  const overdueAmt = overdueList.reduce((s,p) => s + Number(p.balance||0), 0)

  const inp = (id, placeholder, type='text') => (
    <input
      type={type}
      placeholder={placeholder}
      value={form[id]}
      onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
      style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', outline:'none', width:'100%' }}
    />
  )

  const sel = (id, options) => (
    <select
      value={form[id]}
      onChange={e => setForm(f => ({ ...f, [id]: e.target.value }))}
      style={{ padding:'8px 11px', fontSize:'13px', border:'1px solid var(--border2)', borderRadius:'8px', background:'var(--surface2)', color:'var(--text)', width:'100%' }}
    >
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  )

  return (
    <div>
      <Toast msg={toast.msg} color={toast.color} />

      {/* Metrics */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'16px' }}>
        {[
          { label:'Total collected', value:'₹' + (totalCollected/100000).toFixed(1) + 'L' },
          { label:'Transactions', value: payments.length },
          { label:'Overdue amount', value:'₹' + (overdueAmt/100000).toFixed(1) + 'L' },
          { label:'Overdue students', value: overdueList.length },
        ].map(m => (
          <div key={m.label} style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'14px', boxShadow:'var(--shadow)' }}>
            <div style={{ fontSize:'11px', color:'var(--text3)', marginBottom:'7px', fontWeight:500 }}>{m.label}</div>
            <div style={{ fontSize:'24px', fontWeight:600, color:'var(--text)' }}>{m.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr', gap:'14px', marginBottom:'14px' }}>

        {/* Record payment */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>
          <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)', fontSize:'13px', fontWeight:600, color:'var(--text)' }}>Record fee payment</div>
          <div style={{ padding:'16px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'11px', marginBottom:'14px' }}>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Admission no. *</div>{inp('admission_no','ADM20250001')}</div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Fee type</div>{sel('fee_type',['Tuition fee','Transport','Lab fee','Exam fee','Sports fee'])}</div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Amount (₹) *</div>{inp('amount','18500','number')}</div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Discount (₹)</div>{inp('discount','0','number')}</div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Payment mode</div>{sel('payment_mode',['UPI','Cash','Netbanking','Card','Cheque'])}</div>
              <div><div style={{ fontSize:'11.5px', fontWeight:500, color:'var(--text2)', marginBottom:'4px' }}>Transaction ID</div>{inp('transaction_id','Optional for cash')}</div>
            </div>
            <button onClick={recordPayment} style={{ padding:'9px 18px', fontSize:'13px', fontWeight:500, background:'var(--accent-bg)', color:'var(--accent-text)', border:'none', borderRadius:'8px', cursor:'pointer' }}>
              Record payment + Generate receipt
            </button>
          </div>
        </div>

        {/* Overdue */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>
          <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontSize:'13px', fontWeight:600, color:'var(--text)' }}>Overdue students</div>
            <button onClick={() => showToast('Reminders sent to all overdue students!')} style={{ padding:'5px 10px', fontSize:'11.5px', background:'var(--red-bg)', color:'var(--red-text)', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:500 }}>Send reminders</button>
          </div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12.5px' }}>
              <thead>
                <tr style={{ background:'var(--surface2)' }}>
                  {['Admission No','Balance','Status'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'9px 13px', fontSize:'11px', color:'var(--text3)', fontWeight:500, borderBottom:'1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdueList.length === 0 ? (
                  <tr><td colSpan={3} style={{ padding:'20px', textAlign:'center', color:'var(--text3)' }}>No overdue payments!</td></tr>
                ) : overdueList.map(p => (
                  <tr key={p.id} style={{ borderBottom:'1px solid var(--border)' }}>
                    <td style={{ padding:'9px 13px', fontFamily:'var(--mono)', fontSize:'11.5px', color:'var(--text3)' }}>{p.notes?.replace('Admission: ','')}</td>
                    <td style={{ padding:'9px 13px', color:'var(--red-text)', fontWeight:500 }}>₹{Number(p.balance||0).toLocaleString('en-IN')}</td>
                    <td style={{ padding:'9px 13px' }}>
                      <span style={{ background:'var(--amber-bg)', color:'var(--amber-text)', fontSize:'11px', padding:'2px 8px', borderRadius:'20px', fontWeight:500 }}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transactions table */}
      <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>
        <div style={{ padding:'13px 16px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:'13px', fontWeight:600, color:'var(--text)' }}>Recent transactions ({payments.length})</div>
          <button onClick={exportCSV} style={{ padding:'5px 10px', fontSize:'11.5px', background:'var(--surface2)', border:'1px solid var(--border2)', borderRadius:'6px', cursor:'pointer', color:'var(--text2)' }}>Export CSV</button>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'12.5px' }}>
            <thead>
              <tr style={{ background:'var(--surface2)' }}>
                {['Receipt No','Admission No','Amount','Paid','Mode','Date','Status'].map(h => (
                  <th key={h} style={{ textAlign:'left', padding:'9px 13px', fontSize:'11px', color:'var(--text3)', fontWeight:500, borderBottom:'1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr><td colSpan={7} style={{ padding:'20px', textAlign:'center', color:'var(--text3)' }}>No payments recorded yet</td></tr>
              ) : payments.map(p => (
                <tr key={p.id} style={{ borderBottom:'1px solid var(--border)' }}>
                  <td style={{ padding:'9px 13px', fontFamily:'var(--mono)', fontSize:'11.5px', color:'var(--text3)' }}>{p.receipt_no}</td>
                  <td style={{ padding:'9px 13px', fontFamily:'var(--mono)', fontSize:'11.5px', color:'var(--text3)' }}>{p.notes?.replace('Admission: ','')}</td>
                  <td style={{ padding:'9px 13px', color:'var(--text)' }}>₹{Number(p.amount||0).toLocaleString('en-IN')}</td>
                  <td style={{ padding:'9px 13px', color:'var(--text)' }}>₹{Number(p.paid_amount||0).toLocaleString('en-IN')}</td>
                  <td style={{ padding:'9px 13px', color:'var(--text2)' }}>{p.payment_mode}</td>
                  <td style={{ padding:'9px 13px', color:'var(--text2)' }}>{p.payment_date}</td>
                  <td style={{ padding:'9px 13px' }}>
                    <span style={{ background:'var(--green-bg)', color:'var(--green-text)', fontSize:'11px', padding:'2px 8px', borderRadius:'20px', fontWeight:500 }}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}