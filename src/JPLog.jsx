import { useState, useCallback, useEffect } from 'react'

export default function JPLog({ focused = true, onFocus = () => {} }) {
  const [expanded, setExpanded] = useState(true)
  const [position, setPosition] = useState({ x: window.innerWidth - 480, y: 150 })
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const [form, setForm] = useState({
    customer: '',
    caseNum: '',
    issue: '',
    steps: '',
    resolution: ''
  })
  const [generated, setGenerated] = useState('')
  const [copied, setCopied] = useState(false)

  const handleDragStart = useCallback((e) => {
    onFocus()
    if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('textarea') && !e.target.closest('select')) {
      setDragging(true)
      setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [position, onFocus])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      setPosition({
        x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 260)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - (expanded ? 480 : 44))),
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragOffset, expanded])

  const generateSummary = () => {
    const summary = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 CASE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 CUSTOMER : ${form.customer.toUpperCase() || 'N/A'}
🔢 CASE #   : ${form.caseNum || 'N/A'}
🛠 ISSUE    : ${form.issue || 'General Inquiry'}
────────────────────────────────────────────
📝 STEPS TAKEN:
${form.steps || 'N/A'}

✅ RESOLUTION / PENDING:
${form.resolution || 'N/A'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim()
    setGenerated(summary)
  }

  const copyToClipboard = () => {
    if (!generated) return
    navigator.clipboard.writeText(generated)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearForm = () => {
    if (window.confirm('Clear all fields?')) {
      setForm({ customer: '', caseNum: '', issue: '', steps: '', resolution: '' })
      setGenerated('')
    }
  }

  return (
    <div
      data-theme="dark"
      onMouseDown={handleDragStart}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 260,
        zIndex: focused ? 9999 : 9990,
        borderRadius: expanded ? 20 : 12,
        background: 'var(--surface)',
        border: `1px solid ${focused ? 'var(--accent-border)' : 'var(--border)'}`,
        boxShadow: focused ? '0 12px 48px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: dragging ? 'none' : 'border-radius 0.25s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '12px 14px',
        background: 'var(--surface)',
        borderBottom: expanded ? '1px solid var(--border)' : 'none',
        cursor: dragging ? 'grabbing' : 'grab',
      }}>
        <span style={{ fontSize: 14 }}>📓</span>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 13, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          JP<span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Log</span>
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer',
            width: 24, height: 24, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 11, flexShrink: 0,
          }}
        >
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {expanded && (
        <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg)' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Customer Name</label>
              <input 
                value={form.customer}
                onChange={e => setForm({...form, customer: e.target.value})}
                placeholder="John Doe"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', color: '#fff', fontSize: 11, outline: 'none' }} 
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Case Number</label>
              <input 
                value={form.caseNum}
                onChange={e => setForm({...form, caseNum: e.target.value})}
                placeholder="#12345"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', color: '#fff', fontSize: 11, outline: 'none' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Issue Type</label>
            <input 
              value={form.issue}
              onChange={e => setForm({...form, issue: e.target.value})}
              placeholder="e.g. Billing Dispute"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 8px', color: '#fff', fontSize: 11, outline: 'none' }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Steps Taken</label>
            <textarea 
              value={form.steps}
              onChange={e => setForm({...form, steps: e.target.value})}
              placeholder="What did you do?"
              style={{ 
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, 
                padding: '6px 8px', color: '#fff', fontSize: 10, outline: 'none', 
                minHeight: 60, resize: 'none', fontFamily: 'JetBrains Mono' 
              }} 
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Resolution / Pending</label>
            <textarea 
              value={form.resolution}
              onChange={e => setForm({...form, resolution: e.target.value})}
              placeholder="What's next?"
              style={{ 
                background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, 
                padding: '6px 8px', color: '#fff', fontSize: 10, outline: 'none', 
                minHeight: 50, resize: 'none', fontFamily: 'JetBrains Mono' 
              }} 
            />
          </div>

          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
            <button 
              onClick={generateSummary}
              style={{ 
                flex: 1, background: 'linear-gradient(90deg,var(--accent),var(--accent-2))', 
                border: 'none', borderRadius: 8, padding: '8px', color: '#fff', 
                fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 12, cursor: 'pointer' 
              }}
            >
              🚀 Generate
            </button>
            <button 
              onClick={clearForm}
              style={{ 
                width: 36, background: 'var(--surface)', border: '1px solid var(--border)', 
                borderRadius: 8, color: 'var(--text-muted)', cursor: 'pointer' 
              }}
              title="Clear form"
            >
              🗑️
            </button>
          </div>

          {generated && (
            <div className="animate-slideUp" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ 
                background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', 
                borderRadius: 8, padding: '8px', maxHeight: 80, overflowY: 'auto'
              }}>
                <pre style={{ margin: 0, fontSize: 9, color: 'var(--text-muted)', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono' }}>
                  {generated}
                </pre>
              </div>
              <button 
                onClick={copyToClipboard}
                style={{ 
                  width: '100%', background: copied ? '#22C55E' : 'var(--accent-soft)', 
                  border: `1px solid ${copied ? '#22C55E' : 'var(--accent-border)'}`, 
                  borderRadius: 8, padding: '6px', color: copied ? '#fff' : 'var(--accent)', 
                  fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: 10, cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {copied ? '✅ Copied!' : '📋 Copy Summary'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '6px 12px', background: 'var(--surface)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.04em' }}>JPLOG v1.0</span>
        <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>READY FOR CRM ⚡</span>
      </div>
    </div>
  )
}
