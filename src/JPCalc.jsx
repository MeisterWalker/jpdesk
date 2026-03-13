import { useState, useEffect, useRef, useCallback } from 'react'

const BTN_ROWS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '⌫', '='],
]

// Tiny click sounds via Web Audio API
function makeSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'number') {
      osc.frequency.setValueAtTime(880, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.05)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08)
    } else if (type === 'op') {
      osc.frequency.setValueAtTime(1100, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.06)
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1)
    } else if (type === 'equals') {
      osc.frequency.setValueAtTime(660, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15)
    } else if (type === 'clear') {
      osc.frequency.setValueAtTime(440, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.1)
      gain.gain.setValueAtTime(0.08, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
    }

    osc.type = 'sine'
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.2)
    setTimeout(() => ctx.close(), 300)
  } catch (e) {}
}

function getSoundType(val) {
  if (val === '=') return 'equals'
  if (['C', '⌫'].includes(val)) return 'clear'
  if (['+','−','×','÷','±','%'].includes(val)) return 'op'
  return 'number'
}

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

export default function JPCalc({ focused = true, onFocus = () => {} }) {
  const [expanded, setExpanded]     = useState(true)
  const [display, setDisplay]       = useState('0')
  const [prev, setPrev]             = useState(null)
  const [op, setOp]                 = useState(null)
  const [fresh, setFresh]           = useState(false)
  const [history, setHistory]       = useState([])
  const [muted, setMuted]           = useState(false)
  const [position, setPosition]     = useState({ x: window.innerWidth - 230, y: 90 })
  const [dragging, setDragging]     = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const ref = useRef(null)

  // ── Drag — only triggered from non-button areas ────────────────────────
  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button')) return
    setDragging(true)
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
  }, [position])

  // ── Any click anywhere on widget → bring to front ─────────────────────
  const handleWidgetMouseDown = useCallback((e) => {
    onFocus()
    if (!e.target.closest('button')) {
      setDragging(true)
      setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [position, onFocus])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const nx = e.clientX - dragOffset.x
      const ny = e.clientY - dragOffset.y
      setPosition({
        x: Math.max(0, Math.min(nx, window.innerWidth - 210)),
        y: Math.max(0, Math.min(ny, window.innerHeight - (expanded ? 380 : 44))),
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragOffset, expanded])

  // ── Calc logic ─────────────────────────────────────────────────────────
  const press = useCallback((val) => {
    if (!muted) makeSound(getSoundType(val))

    if (val === 'C')  { setDisplay('0'); setPrev(null); setOp(null); setFresh(false); return }
    if (val === '⌫')  { setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0'); return }
    if (val === '±')  { setDisplay(d => String(parseFloat(d) * -1)); return }
    if (val === '%')  { setDisplay(d => String(parseFloat(d) / 100)); return }
    if (['+','−','×','÷'].includes(val)) {
      if (op && !fresh) { const r = calculate(prev, display, op); setPrev(r); setDisplay(r) }
      else { setPrev(display) }
      setOp(val); setFresh(true); return
    }
    if (val === '=') {
      if (!op || !prev) return
      const r = calculate(prev, display, op)
      setHistory(h => [`${prev} ${op} ${display} = ${r}`, ...h].slice(0, 5))
      setDisplay(r); setPrev(null); setOp(null); setFresh(false); return
    }
    if (val === '.') {
      if (fresh) { setDisplay('0.'); setFresh(false); return }
      if (!display.includes('.')) setDisplay(d => d + '.')
      return
    }
    if (fresh) { setDisplay(val); setFresh(false) }
    else setDisplay(d => d === '0' ? val : d.length < 12 ? d + val : d)
  }, [display, prev, op, fresh, muted])

  // ── Keyboard ───────────────────────────────────────────────────────────
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
    <div
      ref={ref}
      data-theme="dark"
      onMouseDown={handleWidgetMouseDown}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 210,
        zIndex: focused ? 9999 : 9990,
        borderRadius: expanded ? 18 : 12,
        background: 'var(--surface)',
        border: `1px solid ${focused ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
        boxShadow: focused ? '0 8px 40px rgba(0,0,0,0.55)' : '0 4px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: dragging ? 'none' : 'border-radius 0.25s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 14px',
        background: 'var(--surface)',
        borderBottom: expanded ? '1px solid var(--border)' : 'none',
        cursor: dragging ? 'grabbing' : 'grab',
      }}>
        <span style={{ fontSize: 14 }}>🧮</span>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          JP<span style={{ background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Calc</span>
        </span>
        <div style={{ flex: 1 }} />

        {/* Mute toggle */}
        <button
          onClick={() => setMuted(v => !v)}
          title={muted ? 'Unmute sounds' : 'Mute sounds'}
          style={{
            background: muted ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.08)',
            border: `1px solid ${muted ? 'rgba(239,68,68,0.3)' : 'rgba(99,102,241,0.2)'}`,
            borderRadius: 6, color: muted ? '#F87171' : '#818CF8',
            cursor: 'pointer', width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, transition: 'all 0.2s', flexShrink: 0,
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {/* Expand/collapse */}
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer',
            width: 24, height: 24, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 11, flexShrink: 0,
          }}
          title={expanded ? 'Minimize' : 'Expand'}
        >
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {/* ── Body ── */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Display */}
          <div style={{ padding: '10px 14px 8px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: '#6366F1', textAlign: 'right', minHeight: 14, marginBottom: 2 }}>
              {op ? `${prev} ${op}` : '\u00a0'}
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono', fontWeight: 700,
              fontSize: display.length > 9 ? 16 : display.length > 6 ? 20 : 26,
              color: display === 'Error' ? '#F87171' : 'var(--text-primary)',
              textAlign: 'right', letterSpacing: '-0.02em',
              lineHeight: 1.1, minHeight: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            }}>
              {display}
            </div>
          </div>

          {/* History */}
          {history.length > 0 && (
            <div style={{ padding: '4px 12px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
              {history.slice(0, 2).map((h, i) => (
                <div key={i} style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', textAlign: 'right', lineHeight: 1.7, opacity: 1 - i * 0.4 }}>
                  {h}
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div style={{ padding: '10px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5, background: 'var(--surface)' }}>
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
                    padding: '10px 4px',
                    borderRadius: 8,
                    border: isActive ? '1px solid rgba(99,102,241,0.5)' : '1px solid transparent',
                    cursor: 'pointer',
                    fontFamily: 'JetBrains Mono',
                    fontWeight: isEquals || isOpBtn ? 700 : 500,
                    fontSize: 13,
                    transition: 'all 0.1s',
                    background: isEquals
                      ? 'linear-gradient(135deg,#6366F1,#8B5CF6)'
                      : isActive  ? 'rgba(99,102,241,0.18)'
                      : isOpBtn   ? 'rgba(99,102,241,0.08)'
                      : isSpecial ? 'rgba(239,68,68,0.08)'
                      : isBacksp  ? 'rgba(245,158,11,0.08)'
                      : 'var(--surface-2)',
                    color: isEquals  ? '#fff'
                      : isOpBtn   ? '#818CF8'
                      : isSpecial ? '#F87171'
                      : isBacksp  ? '#FBBF24'
                      : 'var(--text-primary)',
                    boxShadow: isEquals ? '0 2px 12px rgba(99,102,241,0.3)' : 'none',
                  }}
                >
                  {v}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '6px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.08em' }}>JPCALC v1.0</span>
            <button
              onClick={() => { setDisplay('0'); setPrev(null); setOp(null); setFresh(false); setHistory([]) }}
              style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 4px' }}
            >
              clear all
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
