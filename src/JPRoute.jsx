import { useState, useEffect, useCallback, useRef } from 'react'
import { RouteIcon } from './components/Icons'

function validateRouting(num) {
  if (num.length !== 9) return false
  const d = num.split('').map(Number)
  return (3*(d[0]+d[3]+d[6]) + 7*(d[1]+d[4]+d[7]) + (d[2]+d[5]+d[8])) % 10 === 0
}

function BankResult({ data }) {
  const [copied, setCopied] = useState(false)
  const copyPhone = () => {
    navigator.clipboard.writeText(data.phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ padding: '10px 12px', background: 'var(--accent-soft)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 10, marginBottom: 2 }}>
        <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--accent-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 3 }}>✅ Verified Bank</div>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.3 }}>{data.customer_name}</div>
        {data.telegraphic_name && data.telegraphic_name !== data.customer_name && (
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: 10, color: 'var(--accent-muted)', marginTop: 2 }}>{data.telegraphic_name}</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {data.city && (
          <div style={{ flex: 1, padding: '6px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>City</div>
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', fontWeight: 600 }}>{data.city}</div>
          </div>
        )}
        {data.state && (
          <div style={{ flex: 1, padding: '6px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
            <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>State</div>
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', fontWeight: 600 }}>{data.state}</div>
          </div>
        )}
      </div>

      {data.address && (
        <div style={{ padding: '6px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Address</div>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', fontWeight: 600 }}>{data.address}</div>
        </div>
      )}

      {data.phone && (
        <div style={{ padding: '6px 8px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8 }}>
          <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Phone</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', fontWeight: 600 }}>{data.phone}</div>
            <button onClick={copyPhone} style={{
              fontSize: 9, fontFamily: 'JetBrains Mono', padding: '2px 7px', borderRadius: 6,
              background: copied ? 'rgba(34,197,94,0.15)' : 'var(--accent-soft)',
              border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--accent-border)'}`,
              color: copied ? '#22C55E' : 'var(--accent-muted)', cursor: 'pointer', fontWeight: 700,
              transition: 'all 0.2s', flexShrink: 0,
            }}>
              {copied ? '✓ Copied!' : '⎘ Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JPRoute({ focused = true, onFocus = () => {} }) {
  const [expanded, setExpanded]     = useState(true)
  const [position, setPosition]     = useState({ x: window.innerWidth - 690, y: 90 })
  const [dragging, setDragging]     = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [routing, setRouting]       = useState('')
  const [result, setResult]         = useState(null)
  const [loading, setLoading]       = useState(false)
  const inputRef = useRef(null)

  const handleWidgetMouseDown = useCallback((e) => {
    onFocus()
    if (!e.target.closest('button') && !e.target.closest('input')) {
      setDragging(true)
      setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [position, onFocus])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => setPosition({
      x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 260)),
      y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 44)),
    })
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragOffset, expanded])

  const lookup = useCallback(async (num) => {
    if (!validateRouting(num)) {
      setResult({ error: 'Invalid routing number (checksum failed).' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
      const ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY
      const res = await fetch(`${SUPABASE_URL}/functions/v1/routing-lookup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ routing_number: num })
      })
      const data = await res.json()
      if (data?.code === 200 && data?.customer_name) {
        setResult({ data })
      } else {
        setResult({ error: 'Routing number not found in database.' })
      }
    } catch (e) {
      setResult({ error: 'Lookup failed. Please try again.' })
    }
    setLoading(false)
  }, [])

  const handleInput = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 9)
    setRouting(val)
    setResult(null)
    if (val.length === 9) lookup(val)
  }

  const handleClear = () => { setRouting(''); setResult(null); inputRef.current?.focus() }

  return (
    <div
      data-theme="dark"
      onMouseDown={handleWidgetMouseDown}
      style={{
        position: 'fixed', left: position.x, top: position.y, width: 260,
        zIndex: focused ? 9999 : 9990,
        borderRadius: expanded ? 18 : 12,
        background: '#111827',
        border: `1px solid ${focused ? 'var(--accent-border)' : 'var(--border)'}`,
        boxShadow: focused ? '0 8px 40px rgba(0,0,0,0.55)' : '0 4px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: dragging ? 'none' : 'border-radius 0.25s ease, box-shadow 0.2s ease',
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
        fontFamily: 'Space Grotesk'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#111827', borderBottom: expanded ? '1px solid var(--border)' : 'none', cursor: dragging ? 'grabbing' : 'grab' }}>
        <RouteIcon size={22} iconSize={13} />
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          JP<span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Route</span>
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.04em' }}>U.S. ONLY</span>
        <button onClick={() => setExpanded(v => !v)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', background: '#0A0E1A' }}>
          {/* Input */}
          <div style={{ padding: '10px 12px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 6 }}>Routing Number</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <input
                  ref={inputRef}
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  placeholder="9-digit routing #"
                  value={routing}
                  onChange={handleInput}
                  style={{
                    width: '100%', padding: '7px 10px', borderRadius: 8,
                    border: `1px solid ${result?.error ? 'rgba(239,68,68,0.4)' : result?.data ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
                    background: 'var(--surface)', color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 700,
                    letterSpacing: '0.12em', boxSizing: 'border-box', outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', gap: 3, marginTop: 5, paddingLeft: 2 }}>
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: i < routing.length ? (result?.data ? '#22C55E' : 'var(--accent)') : 'var(--border)',
                      transition: 'background 0.15s',
                    }} />
                  ))}
                </div>
              </div>
              {routing && (
                <button onClick={handleClear} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#F87171', cursor: 'pointer', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>✕</button>
              )}
            </div>
          </div>

          {/* Result */}
          <div style={{ padding: '10px 12px', minHeight: 60 }}>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0' }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid rgba(99,102,241,0.2)', borderTop: '2px solid #6366F1', animation: 'spin 0.7s linear infinite' }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'var(--text-muted)' }}>Looking up bank...</span>
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            )}
            {!loading && result?.error && (
              <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', fontSize: 11, fontFamily: 'JetBrains Mono', color: '#F87171', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span>⚠️</span> {result.error}
              </div>
            )}
            {!loading && result?.data && <BankResult data={result.data} />}
            {!loading && !result && !routing && (
              <div style={{ padding: '10px 0', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textAlign: 'center', lineHeight: 1.7 }}>
                Type or paste a 9-digit<br />U.S. routing number
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: '6px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.08em' }}>JPROUTE v1.0</span>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)' }}>via Federal Reserve ABA</span>
          </div>
        </div>
      )}
    </div>
  )
}
