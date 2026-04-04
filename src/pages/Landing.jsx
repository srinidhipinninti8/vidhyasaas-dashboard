import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  const [contact, setContact] = useState({ name: '', school: '', phone: '', email: '', msg: '' })
  const [submitted, setSubmitted] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handle)
    return () => window.removeEventListener('resize', handle)
  }, [])

  function handleContact(e) {
    e.preventDefault()
    if (!contact.name || !contact.school || !contact.phone || !contact.email) return
    setSubmitted(true)
    setContact({ name: '', school: '', phone: '', email: '', msg: '' })
    setTimeout(() => setSubmitted(false), 5000)
  }

  const inp = (field, placeholder, type = 'text') => (
    <input
      type={type}
      placeholder={placeholder}
      value={contact[field]}
      onChange={e => setContact(c => ({ ...c, [field]: e.target.value }))}
      style={{
        width: '100%', padding: '10px 13px', fontSize: '13px',
        border: '1px solid #e5e7eb', borderRadius: '8px',
        background: '#f9fafb', color: '#111', outline: 'none',
        fontFamily: 'inherit', boxSizing: 'border-box',
      }}
      onFocus={e => e.target.style.borderColor = '#2563eb'}
      onBlur={e => e.target.style.borderColor = '#e5e7eb'}
    />
  )

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#fff', color: '#111', overflowX: 'hidden', maxWidth: '100vw' }}>

      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: isMobile ? '12px 16px' : '14px 32px',
        borderBottom: '0.5px solid #e5e7eb',
        background: '#fff', position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: '#111' }}>
          Vidhya<span style={{ color: '#2563eb' }}>SaaS</span>
        </div>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '28px', fontSize: '13px' }}>
            {['Features', 'Pricing', 'Contact'].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{
                color: '#6b7280', textDecoration: 'none', fontWeight: 500,
              }}
              onMouseEnter={e => e.target.style.color = '#2563eb'}
              onMouseLeave={e => e.target.style.color = '#6b7280'}
              >{l}</a>
            ))}
          </div>
        )}

        {/* Desktop buttons / Mobile single button */}
        {isMobile ? (
          <button onClick={() => navigate('/login')} style={{
            padding: '8px 16px', background: '#2563eb', color: '#fff',
            border: 'none', borderRadius: '8px', fontSize: '13px',
            fontWeight: 500, cursor: 'pointer'
          }}>Sign in</button>
        ) : (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => navigate('/login')} style={{
              padding: '8px 18px', background: 'transparent', color: '#2563eb',
              border: '1.5px solid #2563eb', borderRadius: '8px', fontSize: '13px',
              fontWeight: 500, cursor: 'pointer', transition: 'background .15s'
            }}
            onMouseEnter={e => e.target.style.background = '#eff6ff'}
            onMouseLeave={e => e.target.style.background = 'transparent'}
            >Sign in</button>
            <button onClick={() => navigate('/login')} style={{
              padding: '8px 18px', background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: 500, cursor: 'pointer', transition: 'background .15s'
            }}
            onMouseEnter={e => e.target.style.background = '#1d4ed8'}
            onMouseLeave={e => e.target.style.background = '#2563eb'}
            >Get started free</button>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section style={{
        textAlign: 'center',
        padding: isMobile ? '48px 20px 40px' : '80px 24px 64px',
        background: 'linear-gradient(180deg, #eff6ff 0%, #fff 100%)'
      }}>
        <div style={{
          display: 'inline-block', padding: '4px 16px', background: '#dbeafe',
          color: '#1d4ed8', borderRadius: '20px', fontSize: '12px',
          fontWeight: 600, marginBottom: '20px', letterSpacing: '0.02em'
        }}>Built for Indian schools</div>
        <h1 style={{
          fontSize: isMobile ? '28px' : '42px', fontWeight: 600, color: '#0f172a',
          lineHeight: 1.2, margin: '0 auto 16px',
          maxWidth: isMobile ? '100%' : '560px'
        }}>
          Complete school management —{' '}
          <span style={{ color: '#2563eb' }}>simplified</span>
        </h1>
        <p style={{
          fontSize: isMobile ? '14px' : '16px', color: '#6b7280',
          maxWidth: isMobile ? '100%' : '440px',
          margin: '0 auto 32px', lineHeight: 1.75
        }}>
          Students, fees, admissions, staff and AI insights — all in one platform. No technical knowledge required.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/login')} style={{
            padding: isMobile ? '11px 22px' : '13px 28px',
            background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px',
            fontSize: isMobile ? '14px' : '15px', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37,99,235,0.3)', width: isMobile ? '100%' : 'auto'
          }}>Start free 14-day trial →</button>
          <button onClick={() => navigate('/login')} style={{
            padding: isMobile ? '11px 22px' : '13px 28px',
            background: 'transparent', color: '#2563eb',
            border: '1.5px solid #2563eb', borderRadius: '10px',
            fontSize: isMobile ? '14px' : '15px', fontWeight: 500, cursor: 'pointer',
            width: isMobile ? '100%' : 'auto'
          }}>Sign in to dashboard</button>
        </div>
        <div style={{
          display: 'flex', justifyContent: 'center',
          gap: isMobile ? '24px' : '48px',
          marginTop: '52px', flexWrap: 'wrap'
        }}>
          {[['100%', 'Free to start'], ['5 min', 'Setup time'], ['Mumbai', 'Data stored in India'], ['24/7', 'Access anywhere']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '22px', fontWeight: 600, color: '#2563eb' }}>{v}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '3px' }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: isMobile ? '48px 20px' : '72px 24px', background: '#fff' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.1em', textAlign: 'center', marginBottom: '8px' }}>Features</div>
        <h2 style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: 600, textAlign: 'center', color: '#0f172a', marginBottom: '8px' }}>Everything your school needs</h2>
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '44px', maxWidth: '480px', margin: '0 auto 44px' }}>
          One platform replaces multiple tools — no more Excel sheets and WhatsApp groups
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '16px', maxWidth: '840px', margin: '0 auto'
        }}>
          {[
            ['👥', '#dbeafe', 'Student management', 'Enroll students, track attendance, manage records and generate reports in seconds.'],
            ['💳', '#f0fdf4', 'Fee collection', 'Record payments, generate receipts, track overdue fees and send reminders automatically.'],
            ['📈', '#f5f3ff', 'Admissions CRM', 'Track every enquiry from walk-in to enrolled. Visual pipeline with follow-up reminders.'],
            ['🏢', '#fffbeb', 'Staff management', 'Staff directory, attendance, payroll overview and department management in one place.'],
            ['🔔', '#fef2f2', 'Notifications', 'Send SMS and email to parents for fees, attendance and exam results with one click.'],
            ['🤖', '#ecfeff', 'AI assistant', 'Ask questions about your school data in plain language. Get instant insights and answers.'],
          ].map(([icon, bg, title, desc]) => (
            <div key={title} style={{
              background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: '14px', padding: '22px'
            }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '14px' }}>{icon}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', marginBottom: '6px' }}>{title}</div>
              <div style={{ fontSize: '12.5px', color: '#6b7280', lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section style={{ padding: isMobile ? '48px 20px' : '72px 24px', background: '#f9fafb' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.1em', textAlign: 'center', marginBottom: '8px' }}>Why VidhyaSaaS</div>
        <h2 style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: 600, textAlign: 'center', color: '#0f172a', marginBottom: '8px' }}>How we compare</h2>
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '40px' }}>See why schools choose VidhyaSaaS over spreadsheets and generic software</p>
        <div style={{ maxWidth: '840px', margin: '0 auto', overflowX: 'auto', borderRadius: '14px', border: '0.5px solid #e5e7eb' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: isMobile ? '11px' : '13px', minWidth: isMobile ? '500px' : 'auto' }}>
            <thead>
              <tr>
                <th style={{ padding: isMobile ? '10px 12px' : '14px 18px', textAlign: 'left', fontWeight: 600, color: '#6b7280', borderBottom: '0.5px solid #e5e7eb', background: '#f9fafb' }}>Feature</th>
                <th style={{ padding: isMobile ? '10px 12px' : '14px 18px', textAlign: 'center', fontWeight: 600, color: '#1d4ed8', borderBottom: '0.5px solid #e5e7eb', background: '#eff6ff' }}>VidhyaSaaS</th>
                <th style={{ padding: isMobile ? '10px 12px' : '14px 18px', textAlign: 'center', fontWeight: 500, color: '#6b7280', borderBottom: '0.5px solid #e5e7eb', background: '#f9fafb' }}>Excel</th>
                <th style={{ padding: isMobile ? '10px 12px' : '14px 18px', textAlign: 'center', fontWeight: 500, color: '#6b7280', borderBottom: '0.5px solid #e5e7eb', background: '#f9fafb' }}>Generic ERP</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Setup time', '5 minutes', 'Hours', 'Weeks'],
                ['Indian schools', '✅ Yes', '❌ No', '⚠️ Partial'],
                ['Fee collection', '✅ Auto', '❌ Manual', '⚠️ Complex'],
                ['Admissions CRM', '✅ Built-in', '❌ No', '⚠️ Add-on'],
                ['AI insights', '✅ Included', '❌ No', '❌ No'],
                ['Price', '₹1,999/mo', 'Time costly', '₹20,000+/mo'],
              ].map(([f, v, e, g], i) => (
                <tr key={f} style={{ borderBottom: '0.5px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                  <td style={{ padding: isMobile ? '10px 12px' : '12px 18px', fontWeight: 500, color: '#0f172a' }}>{f}</td>
                  <td style={{ padding: isMobile ? '10px 12px' : '12px 18px', textAlign: 'center', color: '#1d4ed8', fontWeight: 500, background: '#f0f7ff' }}>{v}</td>
                  <td style={{ padding: isMobile ? '10px 12px' : '12px 18px', textAlign: 'center', color: '#6b7280' }}>{e}</td>
                  <td style={{ padding: isMobile ? '10px 12px' : '12px 18px', textAlign: 'center', color: '#6b7280' }}>{g}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: isMobile ? '48px 20px' : '72px 24px', background: '#fff' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.1em', textAlign: 'center', marginBottom: '8px' }}>Pricing</div>
        <h2 style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: 600, textAlign: 'center', color: '#0f172a', marginBottom: '8px' }}>Simple, transparent pricing</h2>
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '44px' }}>Start free. Upgrade when you grow. No hidden charges.</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: '16px', maxWidth: '820px', margin: '0 auto'
        }}>
          {[
            { name: 'Starter', price: '₹1,999', desc: 'Small schools', features: ['Up to 150 students', '5 admin users', '500 SMS/month', 'Email support'], popular: false },
            { name: 'Growth', price: '₹4,999', desc: 'Growing schools', features: ['Up to 500 students', '15 admin users', '2,000 SMS/month', 'Priority support'], popular: true },
            { name: 'Institution', price: '₹9,999', desc: 'Large schools', features: ['Up to 1,500 students', '40 admin users', '5,000 SMS/month', 'Dedicated support'], popular: false },
          ].map(p => (
            <div key={p.name} style={{
              background: p.popular ? '#eff6ff' : '#fff',
              border: p.popular ? '2px solid #2563eb' : '0.5px solid #e5e7eb',
              borderRadius: '14px', padding: '26px', position: 'relative',
              boxShadow: p.popular ? '0 8px 24px rgba(37,99,235,0.12)' : 'none'
            }}>
              {p.popular && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#2563eb', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '3px 12px', borderRadius: '20px' }}>Most popular</div>}
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{p.name}</div>
              <div style={{ fontSize: '30px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{p.price}<span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 400 }}>/mo</span></div>
              <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '18px' }}>{p.desc}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {p.features.map(f => (
                  <div key={f} style={{ fontSize: '12.5px', color: '#374151', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#16a34a', fontWeight: 700 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/login')} style={{
                width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px',
                fontWeight: 600, cursor: 'pointer', border: 'none',
                background: p.popular ? '#2563eb' : '#f3f4f6',
                color: p.popular ? '#fff' : '#111'
              }}>Get started</button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ textAlign: 'center', padding: isMobile ? '48px 20px' : '72px 24px', background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)' }}>
        <h2 style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>Ready to transform your school?</h2>
        <p style={{ fontSize: isMobile ? '14px' : '15px', color: '#bfdbfe', marginBottom: '28px' }}>Join schools across India using VidhyaSaaS. Free 14-day trial — no credit card required.</p>
        <button onClick={() => navigate('/login')} style={{
          padding: '14px 32px', background: '#fff', color: '#1d4ed8',
          border: 'none', borderRadius: '10px', fontSize: '15px',
          fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          width: isMobile ? '100%' : 'auto'
        }}>Start your free 14-day trial →</button>
      </section>

      {/* Contact */}
      <section id="contact" style={{ padding: isMobile ? '48px 20px' : '72px 24px', background: '#f9fafb' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '.1em', textAlign: 'center', marginBottom: '8px' }}>Contact</div>
        <h2 style={{ fontSize: isMobile ? '24px' : '30px', fontWeight: 600, textAlign: 'center', color: '#0f172a', marginBottom: '8px' }}>Get in touch</h2>
        <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center', marginBottom: '44px' }}>Have questions? We'd love to hear from you.</p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: '40px', maxWidth: '760px', margin: '0 auto'
        }}>
          {/* Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {[
              ['✉️', 'Email us', 'srinidhipinninti1@gmail.com'],
              ['🕐', 'Response time', 'Within 24 hours'],
              ['🇮🇳', 'Based in', 'India — serving schools nationwide'],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '3px' }}>{label}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: '#0f172a' }}>{val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <form onSubmit={handleContact} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {inp('name', 'Your name *')}
            {inp('school', 'School name *')}
            {inp('phone', 'Phone number *', 'tel')}
            {inp('email', 'Email address *', 'email')}
            <textarea
              placeholder="Your message (optional)"
              value={contact.msg}
              onChange={e => setContact(c => ({ ...c, msg: e.target.value }))}
              rows={3}
              style={{
                width: '100%', padding: '10px 13px', fontSize: '13px',
                border: '1px solid #e5e7eb', borderRadius: '8px',
                background: '#f9fafb', color: '#111', outline: 'none',
                fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box'
              }}
            />
            <button type="submit" style={{
              padding: '11px', background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: '8px', fontSize: '13px',
              fontWeight: 600, cursor: 'pointer'
            }}>Send message</button>
            {submitted && (
              <div style={{
                padding: '10px 14px', background: '#f0fdf4', color: '#16a34a',
                borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                border: '1px solid #bbf7d0', textAlign: 'center'
              }}>✅ We would reply within 24 hrs.</div>
            )}
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: isMobile ? '16px 20px' : '20px 32px',
        borderTop: '0.5px solid #e5e7eb',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '12px', color: '#9ca3af', flexWrap: 'wrap', gap: '8px'
      }}>
        <div>© 2026 VidhyaSaaS — Made in India for Indian schools</div>
        <div>srinidhipinninti1@gmail.com</div>
      </footer>
    </div>
  )
}