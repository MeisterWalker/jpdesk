import { useState, useEffect, useCallback } from 'react'

const BTN_ROWS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
]

const calculate = (a, b, op) => {
  const x = parseFloat(a), y = parseFloat(b)
  switch (op) {
    case '+': return String(Math.round((x + y) * 1e10) / 1e10)
    case '−': return String(Math.round((x - y) * 1e10) / 1e10)
    case '×': return String(Math.round((x * y) * 1e10) / 1e10)
    case '÷': return y === 0 ? 'Error' : String(Math.round((x / y) * 1e10) / 1e10)
    default:  return b
  }
}

export default function CalcPage() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev]       = useState(null)
  const [op, setOp]           = useState(null)
  const [fresh, setFresh]     = useState(false)
  const [history, setHistory] = useState([])

  const press = useCallback((val) => {
    if (val === 'C')  { setDisplay('0'); setPrev(null); setOp(null); setFresh(false); return }
    if (val === '⌫')  { setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0'); return }
    if (val === '±')  { setDisplay(d => d === 'Error' ? d : String(parseFloat(d) * -1)); return }
    if (val === '%')  { setDisplay(d => String(parseFloat(d) / 100)); return }

    if (['+','−','×','÷'].includes(val)) {
      if (op && !fresh) {
        const r = calculate(prev, display, op)
        setPrev(r); setDisplay(r)
      } else { setPrev(display) }
      setOp(val); setFresh(true); return
    }

    if (val === '=') {
      if (!op || !prev) return
      const r = calculate(prev, display, op)
      setHistory(h => [`${prev} ${op} ${display} = ${r}`, ...h].slice(0, 8))
      setDisplay(r); setPrev(null); setOp(null); setFresh(false); return
    }

    if (val === '.') {
      if (fresh) { setDisplay('0.'); setFresh(false); return }
      if (!display.includes('.')) setDisplay(d => d + '.')
      return
    }

    if (fresh) { setDisplay(val); setFresh(false) }
    else setDisplay(d => d === '0' ? val : d.length < 14 ? d + val : d)
  }, [display, prev, op, fresh])

  // Keyboard support
  useEffect(() => {
    const map = { '*': '×', '/': '÷', '-': '−', 'Enter': '=', 'Backspace': '⌫', 'Escape': 'C' }
    const handler = (e) => {
      const k = map[e.key] || e.key
      if ([...'0123456789.+=%', '×','÷','−','⌫','C','%'].includes(k)) {
        e.preventDefault(); press(k)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [press])

  const isOp = (v) => ['+','−','×','÷'].includes(v)

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0 }}>

      {/* ── Calculator ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>

        {/* Display */}
        <div style={{ padding: '16px 18px 12px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          {/* Operator hint */}
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6366F1', textAlign: 'right', minHeight: 16, marginBottom: 4 }}>
            {op ? `${prev} ${op}` : '\u00a0'}
          </div>
          {/* Main display */}
          <div style={{
            fontFamily: 'JetBrains Mono', fontWeight: 700, textAlign: 'right',
            fontSize: display.length > 10 ? 20 : display.length > 7 ? 26 : 34,
            color: display === 'Error' ? '#F87171' : 'var(--text-primary)',
            letterSpacing: '-0.02em', lineHeight: 1.1, minHeight: 42,
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            transition: 'font-size 0.1s',
          }}>
            {display}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ flex: 1, padding: '12px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridTemplateRows: 'repeat(5, 1fr)', gap: 7 }}>
          {BTN_ROWS.flat().map((v, i) => {
            const isEquals  = v === '='
            const isOpBtn   = isOp(v)
            const isActive  = isOpBtn && op === v
            const isSpecial = ['C', '±', '%'].includes(v)
            const isBacksp  = v === '⌫'

            return (
              <button
                key={i}
                onClick={() => press(v)}
                style={{
                  borderRadius: 10,
                  border: isActive ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent',
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono',
                  fontWeight: isEquals || isOpBtn ? 700 : 500,
                  fontSize: 15,
                  transition: 'all 0.1s',
                  background: isEquals
                    ? 'linear-gradient(135deg,#6366F1,#8B5CF6)'
                    : isActive
                    ? 'rgba(99,102,241,0.18)'
                    : isOpBtn
                    ? 'rgba(99,102,241,0.08)'
                    : isSpecial
                    ? 'rgba(239,68,68,0.08)'
                    : isBacksp
                    ? 'rgba(245,158,11,0.08)'
                    : 'var(--surface)',
                  color: isEquals
                    ? '#fff'
                    : isOpBtn
                    ? '#818CF8'
                    : isSpecial
                    ? '#F87171'
                    : isBacksp
                    ? '#FBBF24'
                    : 'var(--text-primary)',
                  boxShadow: isEquals ? '0 2px 14px rgba(99,102,241,0.35)' : 'none',
                }}
              >
                {v}
              </button>
            )
          })}
        </div>

        {/* Keyboard hint */}
        <div style={{ padding: '6px 14px 10px', textAlign: 'center' }}>
          <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', opacity: 0.6 }}>
            ⌨️ keyboard supported
          </span>
        </div>
      </div>

      {/* ── History panel ── */}
      <div style={{ width: 160, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>History</span>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 4px' }}>
              clear
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {history.length === 0 ? (
            <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              No calculations yet.<br/>Results will<br/>appear here.
            </div>
          ) : history.map((h, i) => {
            const parts = h.split(' = ')
            return (
              <div
                key={i}
                onClick={() => setDisplay(parts[1])}
                style={{
                  padding: '7px 12px', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'background 0.1s',
                  opacity: 1 - i * 0.1,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginBottom: 2 }}>{parts[0]}</div>
                <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', fontWeight: 700, color: '#6366F1' }}>= {parts[1]}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
