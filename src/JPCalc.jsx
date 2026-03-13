import { useState, useEffect, useRef, useCallback } from 'react'

const BTN = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
]

export default function JPCalc() {
  const [expanded, setExpanded]     = useState(true)
  const [display, setDisplay]       = useState('0')
  const [prev, setPrev]             = useState(null)
  const [op, setOp]                 = useState(null)
  const [fresh, setFresh]           = useState(false)
  const [history, setHistory]       = useState([])
  const [position, setPosition]     = useState({ x: window.innerWidth - 220, y: 80 })
  const [dragging, setDragging]     = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  // ── Drag ──────────────────────────────────────────────────────────────────
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return
    setDragging(true)
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
  }, [position])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const nx = e.clientX - dragOffset.x
      const ny = e.clientY - dragOffset.y
      const w = expanded ? 200 : 180
      const h = expanded ? 340 : 36
      setPosition({ x: Math.max(0, Math.min(nx, window.innerWidth - w)), y: Math.max(0, Math.min(ny, window.innerHeight - h)) })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragOffset, expanded])

  // ── Calc logic ────────────────────────────────────────────────────────────
  const calculate = (a, b, operator) => {
    const x = parseFloat(a), y = parseFloat(b)
    switch (operator) {
      case '+': return String(Math.round((x + y) * 1e10) / 1e10)
      case '−': return String(Math.round((x - y) * 1e10) / 1e10)
      case '×': return String(Math.round((x * y) * 1e10) / 1e10)
      case '÷': return y === 0 ? 'Error' : String(Math.round((x / y) * 1e10) / 1e10)
      default:  return b
    }
  }

  const press = (val) => {
    if (val === 'C') {
      setDisplay('0'); setPrev(null); setOp(null); setFresh(false); return
    }
    if (val === '⌫') {
      setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0'); return
    }
    if (val === '±') {
      setDisplay(d => String(parseFloat(d) * -1)); return
    }
    if (val === '%') {
      setDisplay(d => String(parseFloat(d) / 100)); return
    }
    if (['+', '−', '×', '÷'].includes(val)) {
      if (op && !fresh) {
        const result = calculate(prev, display, op)
        setPrev(result); setDisplay(result)
      } else {
        setPrev(display)
      }
      setOp(val); setFresh(true); return
    }
    if (val === '=') {
      if (!op || !prev) return
      const result = calculate(prev, display, op)
      setHistory(h => [`${prev} ${op} ${display} = ${result}`, ...h].slice(0, 5))
      setDisplay(result); setPrev(null); setOp(null); setFresh(false); return
    }
    if (val === '.') {
      if (fresh) { setDisplay('0.'); setFresh(false); return }
      if (!display.includes('.')) setDisplay(d => d + '.')
      return
    }
    if (fresh) { setDisplay(val); setFresh(false) }
    else setDisplay(d => d === '0' ? val : d.length < 12 ? d + val : d)
  }

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = { '*': '×', '/': '÷', '-': '−', 'Enter': '=', 'Backspace': '⌫', 'Escape': 'C' }
    const handler = (e) => {
      const k = map[e.key] || e.key
      const valid = [...'0123456789.+-=', '×', '÷', '−', '⌫', 'C', '%']
      if (valid.includes(k)) { e.preventDefault(); press(k) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [display, prev, op, fresh])

  const isOp = (v) => ['+', '−', '×', '÷'].includes(v)

  return (
    <div
      ref={ref}
      onMouseDown={onMouseDown}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 9000,
        userSelect: 'none',
        cursor: dragging ? 'grabbing' : 'grab',
        width: 200,
        filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.45))',
      }}
    >
      {/* Header */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: expanded ? '12px 12px 0 0' : 12,
        border: '1px solid var(--border)',
        borderBottom: expanded ? 'none' : '1px solid var(--border)',
        padding: '7px 11px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12 }}>🧮</span>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 12, background: 'linear-gradient(90deg, rgba(99,102,241,0.9), rgba(139,92,246,0.9))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            JPCalc
          </span>
        </div>
        <button
          onClick={() => setExpanded(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'JetBrains Mono', padding: '1px 5px' }}
        >
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 12px 12px', overflow: 'hidden' }}>

          {/* Display */}
          <div style={{ padding: '8px 12px 6px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            {op && (
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: '#6366F1', textAlign: 'right', marginBottom: 2 }}>
                {prev} {op}
              </div>
            )}
            <div style={{
              fontFamily: 'JetBrains Mono', fontWeight: 700,
              fontSize: display.length > 9 ? 14 : display.length > 6 ? 18 : 24,
              color: 'var(--text-primary)', textAlign: 'right',
              letterSpacing: '-0.02em', lineHeight: 1.1,
              minHeight: 30, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            }}>
              {display}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{ padding: '4px 10px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {history.slice(0, 2).map((h, i) => (
                <div key={i} style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.6 }}>{h}</div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div style={{ padding: 8, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
            {BTN.flat().map((v, i) => {
              const isEquals  = v === '='
              const isOpBtn   = isOp(v)
              const isActive  = isOpBtn && op === v
              const isSpecial = ['C', '±', '%'].includes(v)
              const isBacksp  = v === '⌫'
              const isZero    = v === '0'

              return (
                <button
                  key={i}
                  onClick={() => press(v)}
                  style={{
                    gridColumn: isZero ? 'span 1' : undefined,
                    padding: '9px 4px',
                    borderRadius: 8,
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono',
                    fontWeight: isEquals || isOpBtn ? 700 : 500,
                    fontSize: 13,
                    transition: 'all 0.1s',
                    background: isEquals
                      ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                      : isActive
                      ? 'rgba(99,102,241,0.25)'
                      : isOpBtn
                      ? 'rgba(99,102,241,0.1)'
                      : isSpecial
                      ? 'rgba(239,68,68,0.1)'
                      : isBacksp
                      ? 'rgba(245,158,11,0.1)'
                      : 'var(--surface-2)',
                    color: isEquals
                      ? '#fff'
                      : isOpBtn
                      ? '#818CF8'
                      : isSpecial
                      ? '#F87171'
                      : isBacksp
                      ? '#FBBF24'
                      : 'var(--text-primary)',
                  }}
                >
                  {v}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
