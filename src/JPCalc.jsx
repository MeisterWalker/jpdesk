import { useState, useEffect, useCallback } from 'react'
import { CalcIcon } from './components/Icons'

// ── Click sounds (preserved exactly) ─────────────────────────────────────────
function makeSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const ERRORS = ['Error', 'Cannot divide by zero', 'Invalid input', 'Overflow']
const isErr = (v) => ERRORS.includes(v)

// Format raw string for display: add thousands commas, preserve trailing dot/decimals
function fmtDisplay(raw) {
  if (!raw || isErr(raw)) return raw || '0'
  const neg = raw.startsWith('-')
  const abs = neg ? raw.slice(1) : raw
  const trailingDot = abs.endsWith('.')
  const [intStr, decStr] = abs.split('.')
  const intNum = parseInt(intStr || '0', 10)
  const intFmt = isNaN(intNum) ? intStr : intNum.toLocaleString('en-US')
  let out = neg ? '-' + intFmt : intFmt
  if (trailingDot) return out + '.'
  if (decStr !== undefined) return out + '.' + decStr
  return out
}

// Format a number for the expression line (compact, no unnecessary trailing zeros)
function fmtExpr(val) {
  if (!val || isErr(val)) return val || ''
  const n = parseFloat(val)
  if (isNaN(n)) return val
  return n.toLocaleString('en-US', { maximumFractionDigits: 10 })
}

// Compute a binary operation, return string result
function compute(a, op, b) {
  const x = parseFloat(a), y = parseFloat(b)
  if (isNaN(x) || isNaN(y)) return 'Error'
  let r
  switch (op) {
    case '+': r = x + y; break
    case '−': r = x - y; break
    case '×': r = x * y; break
    case '÷': if (y === 0) return 'Cannot divide by zero'; r = x / y; break
    default: return String(b)
  }
  if (!isFinite(r)) return 'Overflow'
  return String(Math.round(r * 1e10) / 1e10)
}

// ── Layout ────────────────────────────────────────────────────────────────────
const MEM_ROW  = ['MC', 'MR', 'M+', 'M−', 'MS']
const CALC_ROWS = [
  ['%',   'CE',  'C',   '⌫' ],
  ['¹⁄ₓ', 'x²', '√x',  '÷' ],
  ['7',   '8',   '9',   '×' ],
  ['4',   '5',   '6',   '−' ],
  ['1',   '2',   '3',   '+' ],
  ['±',   '0',   '.',   '=' ],
]
const OPS = ['+', '−', '×', '÷']
const SYM = { '+': '+', '−': '−', '×': '×', '÷': '÷' }

// ── Main component ────────────────────────────────────────────────────────────
export default function JPCalc({ focused = true, onFocus = () => {} }) {
  // Widget state
  const [expanded,   setExpanded]   = useState(true)
  const [position,   setPosition]   = useState({ x: window.innerWidth - 310, y: 90 })
  const [dragging,   setDragging]   = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [muted,      setMuted]      = useState(false)
  const [copied,     setCopied]     = useState(false) // for the explicit copy button

  // Calculator state
  const [display,  setDisplay]  = useState('0')    // current shown value (raw, no commas)
  const [expr,     setExpr]     = useState('')      // expression line above
  const [prevVal,  setPrevVal]  = useState(null)    // first operand
  const [op,       setOp]       = useState(null)    // pending operator
  const [waitOp,   setWaitOp]   = useState(false)   // next digit starts fresh
  const [afterEq,  setAfterEq]  = useState(false)   // just pressed =
  const [lastOp,   setLastOp]   = useState(null)    // for repeat =
  const [lastB,    setLastB]    = useState(null)    // second operand for repeat =
  const [memory,   setMemory]   = useState(null)    // memory slot

  // ── Drag ──────────────────────────────────────────────────────────────────
  const handleWidgetMouseDown = useCallback((e) => {
    onFocus()
    if (!e.target.closest('button')) {
      setDragging(true)
      setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [position, onFocus])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => setPosition({
      x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 300)),
      y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - (expanded ? 510 : 44))),
    })
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragOffset, expanded])

  // ── Press handler ──────────────────────────────────────────────────────────
  const press = useCallback((btn) => {
    // Sound
    if (!muted) {
      if (btn === '=')                              makeSound('equals')
      else if (['C','CE','⌫'].includes(btn))        makeSound('clear')
      else if (/^\d$/.test(btn) || btn === '.')     makeSound('number')
      else                                          makeSound('op')
    }

    // ── Digit ───────────────────────────────────────────────────────────────
    if (/^\d$/.test(btn)) {
      if (isErr(display) || afterEq || waitOp) {
        setDisplay(btn === '0' ? '0' : btn)
        setWaitOp(false); setAfterEq(false)
        if (afterEq) setExpr('')
        return
      }
      if (display === '0') setDisplay(btn)
      else if (display.replace(/\D/g, '').length < 16) setDisplay(display + btn)
      return
    }

    // ── Decimal ─────────────────────────────────────────────────────────────
    if (btn === '.') {
      if (isErr(display) || afterEq || waitOp) {
        setDisplay('0.'); setWaitOp(false); setAfterEq(false)
        if (afterEq) setExpr('')
        return
      }
      if (!display.includes('.')) setDisplay(display + '.')
      return
    }

    // ── Backspace ────────────────────────────────────────────────────────────
    if (btn === '⌫') {
      if (afterEq || waitOp || isErr(display)) { setDisplay('0'); return }
      setDisplay(d => d.length > 1 ? d.slice(0, -1) : '0')
      return
    }

    // ── CE — clear entry, keep operator/prevVal ──────────────────────────────
    if (btn === 'CE') {
      setDisplay('0'); setAfterEq(false)
      // If we were mid-expression, allow re-entry of second operand
      if (op && prevVal !== null) setWaitOp(false)
      return
    }

    // ── C — all clear ────────────────────────────────────────────────────────
    if (btn === 'C') {
      setDisplay('0'); setExpr(''); setPrevVal(null)
      setOp(null); setWaitOp(false); setAfterEq(false)
      return
    }

    // ── Negate ───────────────────────────────────────────────────────────────
    if (btn === '±') {
      if (isErr(display) || display === '0') return
      setDisplay(d => d.startsWith('-') ? d.slice(1) : '-' + d)
      return
    }

    // ── Percent ──────────────────────────────────────────────────────────────
    if (btn === '%') {
      if (isErr(display)) return
      const curr = parseFloat(display)
      let result
      if (op && prevVal !== null) {
        // +/−: percentage of prevVal; ×/÷: just /100
        result = (op === '+' || op === '−')
          ? parseFloat(prevVal) * curr / 100
          : curr / 100
      } else {
        result = curr / 100
      }
      const rs = String(Math.round(result * 1e10) / 1e10)
      setDisplay(rs); setWaitOp(false)
      return
    }

    // ── Unary: 1/x ───────────────────────────────────────────────────────────
    if (btn === '¹⁄ₓ') {
      if (isErr(display)) return
      const n = parseFloat(display)
      if (n === 0) { setDisplay('Cannot divide by zero'); return }
      const result = String(Math.round((1 / n) * 1e10) / 1e10)
      setExpr(`1/(${fmtExpr(display)})`); setDisplay(result); setWaitOp(false)
      return
    }

    // ── Unary: x² ────────────────────────────────────────────────────────────
    if (btn === 'x²') {
      if (isErr(display)) return
      const n = parseFloat(display)
      const result = String(Math.round((n * n) * 1e10) / 1e10)
      setExpr(`sqr(${fmtExpr(display)})`); setDisplay(result); setWaitOp(false)
      return
    }

    // ── Unary: √x ────────────────────────────────────────────────────────────
    if (btn === '√x') {
      if (isErr(display)) return
      const n = parseFloat(display)
      if (n < 0) { setDisplay('Invalid input'); return }
      const result = String(Math.round(Math.sqrt(n) * 1e10) / 1e10)
      setExpr(`√(${fmtExpr(display)})`); setDisplay(result); setWaitOp(false)
      return
    }

    // ── Binary operators (+, −, ×, ÷) ────────────────────────────────────────
    if (OPS.includes(btn)) {
      if (isErr(display)) return
      if (op && !waitOp && !afterEq) {
        // Chain: evaluate pending op first, then set new op
        const result = compute(prevVal, op, display)
        if (isErr(result)) { setDisplay(result); setExpr(''); setPrevVal(null); setOp(null); return }
        setPrevVal(result)
        setExpr(fmtExpr(result) + ' ' + SYM[btn])
        setDisplay(result)
      } else {
        setPrevVal(display)
        setExpr(fmtExpr(display) + ' ' + SYM[btn])
      }
      setOp(btn); setWaitOp(true); setAfterEq(false)
      return
    }

    // ── Equals ────────────────────────────────────────────────────────────────
    if (btn === '=') {
      if (afterEq && lastOp && lastB !== null) {
        // Repeat last operation
        const result = compute(display, lastOp, lastB)
        setExpr(fmtExpr(display) + ' ' + SYM[lastOp] + ' ' + fmtExpr(lastB) + ' =')
        setDisplay(result); return
      }
      if (!op || prevVal === null) return
      const b = display
      const result = compute(prevVal, op, b)
      setExpr(fmtExpr(prevVal) + ' ' + SYM[op] + ' ' + fmtExpr(b) + ' =')
      setDisplay(result)
      setLastOp(op); setLastB(b)
      setPrevVal(null); setOp(null); setWaitOp(false); setAfterEq(true)
      return
    }

    // ── Memory ────────────────────────────────────────────────────────────────
    if (btn === 'MC') { setMemory(null); return }
    if (btn === 'MR') {
      if (memory !== null) { setDisplay(String(memory)); setWaitOp(false); setAfterEq(false) }
      return
    }
    if (btn === 'M+') { setMemory(m => m === null ? parseFloat(display) : m + parseFloat(display)); return }
    if (btn === 'M−') { setMemory(m => m === null ? -parseFloat(display) : m - parseFloat(display)); return }
    if (btn === 'MS') { setMemory(parseFloat(display)); return }

  }, [display, prevVal, op, waitOp, afterEq, lastOp, lastB, memory, muted])

  // ── Keyboard support ──────────────────────────────────────────────────────
  useEffect(() => {
    const isTypingElsewhere = () => {
      const el = document.activeElement
      if (!el) return false
      const tag = el.tagName.toLowerCase()
      return tag === 'input' || tag === 'textarea' || el.isContentEditable
    }
    const KEY_MAP = { '*': '×', '/': '÷', '-': '−', 'Enter': '=', 'Backspace': '⌫', 'Escape': 'C', 'Delete': 'CE' }
    const handler = (e) => {
      if (!focused || isTypingElsewhere()) return
      const k = KEY_MAP[e.key] || e.key
      if ([...'0123456789.=+%', '×','÷','−','⌫','C','CE'].includes(k)) { e.preventDefault(); press(k) }
    }
    const pasteHandler = (e) => {
      if (!focused || isTypingElsewhere()) return
      const text = (e.clipboardData || window.clipboardData).getData('text')
      const num = text.replace(/[^0-9.\-]/g, '')  // strip everything except digits, dot, minus
      if (num && !isNaN(parseFloat(num))) {
        e.preventDefault()
        // Replace display entirely, like Windows 11 calc
        setDisplay(num.length > 16 ? num.slice(0, 16) : num)
        setWaitOp(false)
        setAfterEq(false)
      }
    }
    window.addEventListener('keydown', handler)
    window.addEventListener('paste', pasteHandler)
    return () => { window.removeEventListener('keydown', handler); window.removeEventListener('paste', pasteHandler) }
  }, [press, focused])

  // ── Render helpers ────────────────────────────────────────────────────────
  const dispStr  = fmtDisplay(display)
  const dispLen  = dispStr.replace(/[,\-]/g, '').length
  const fontSize = dispLen > 14 ? 13 : dispLen > 11 ? 17 : dispLen > 8 ? 22 : 28

  const getBtnStyle = (btn) => {
    const isEq      = btn === '='
    const isOp      = OPS.includes(btn)
    const isActive  = isOp && op === btn && waitOp
    const isClear   = ['C', 'CE'].includes(btn)
    const isBS      = btn === '⌫'
    const isMem     = MEM_ROW.includes(btn)
    const isGray    = ['%', '¹⁄ₓ', 'x²', '√x', '±'].includes(btn)
    const memDim    = memory === null && ['MC', 'MR'].includes(btn)
    const memLit    = memory !== null && MEM_ROW.includes(btn)
    return {
      padding:      isMem ? '7px 0' : '13px 4px',
      borderRadius: 6,
      border:       isActive || memLit ? '1px solid var(--accent-border)' : '1px solid transparent',
      cursor:       memDim ? 'not-allowed' : 'pointer',
      fontFamily:   'JetBrains Mono',
      fontWeight:   isEq || isOp ? 700 : 500,
      fontSize:     isMem ? 10 : 14,
      transition:   'background 0.1s, color 0.1s, transform 0.07s',
      background:   isEq    ? 'linear-gradient(135deg,var(--accent),var(--accent-2))'
                  : isActive ? 'rgba(99,102,241,0.25)'
                  : isOp    ? 'rgba(99,102,241,0.1)'
                  : isClear ? 'rgba(239,68,68,0.1)'
                  : isBS    ? 'rgba(245,158,11,0.1)'
                  : isMem   ? 'transparent'
                  : isGray  ? 'rgba(255,255,255,0.06)'
                  : 'var(--surface-2)',
      color:        isEq    ? '#fff'
                  : isActive ? 'var(--accent-muted)'
                  : isOp    ? 'var(--accent-muted)'
                  : isClear ? '#F87171'
                  : isBS    ? '#FBBF24'
                  : memLit  ? 'var(--accent-muted)'
                  : isMem   ? 'var(--text-muted)'
                  : 'var(--text-primary)',
      boxShadow:    isEq ? '0 2px 12px rgba(99,102,241,0.3)' : 'none',
      opacity:      memDim ? 0.3 : 1,
    }
  }

  return (
    <div
      data-theme="dark"
      onMouseDown={handleWidgetMouseDown}
      style={{
        position: 'fixed', left: position.x, top: position.y,
        width: 300,
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
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 14px', background: '#111827',
        borderBottom: expanded ? '1px solid var(--border)' : 'none',
        cursor: dragging ? 'grabbing' : 'grab',
      }}>
        <CalcIcon size={22} iconSize={13} />
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          JP<span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Calc</span>
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setMuted(v => !v)} title={muted ? 'Unmute' : 'Mute sounds'}
          style={{ background: muted ? 'rgba(239,68,68,0.1)' : 'var(--accent-soft)', border: `1px solid ${muted ? 'rgba(239,68,68,0.3)' : 'var(--accent-border)'}`, borderRadius: 6, color: muted ? '#F87171' : 'var(--accent-muted)', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
          {muted ? '🔇' : '🔊'}
        </button>
        <button onClick={() => setExpanded(v => !v)} title={expanded ? 'Minimize' : 'Expand'}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {/* ── Body ── */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', background: '#0A0E1A' }}>

          {/* Display */}
          <div style={{ padding: '8px 14px 8px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', position: 'relative' }}>
            {/* Copy button — top right, explicit like Win11 */}
            <button
              onMouseDown={e => e.stopPropagation()}
              onClick={() => {
                if (!isErr(display)) {
                  navigator.clipboard.writeText(display)
                  setCopied(true); setTimeout(() => setCopied(false), 1500)
                }
              }}
              title="Copy result"
              style={{
                position: 'absolute', top: 7, right: 10,
                background: copied ? 'rgba(34,197,94,0.15)' : 'transparent',
                border: '1px solid transparent',
                borderRadius: 5, cursor: 'pointer',
                padding: '2px 5px', fontSize: 11,
                color: copied ? '#22C55E' : 'var(--text-muted)',
                opacity: 0.7, transition: 'all 0.15s',
              }}
            >
              {copied ? '✓' : '⎘'}
            </button>

            {/* Expression line */}
            <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', textAlign: 'right', minHeight: 18, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 22 }}>
              {expr || '\u00a0'}
            </div>
            {/* Main number — selectable like Win11 */}
            <div
              onMouseDown={e => e.stopPropagation()}
              style={{
                fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize,
                color: isErr(display) ? '#F87171' : 'var(--text-primary)',
                textAlign: 'right', letterSpacing: '-0.02em',
                lineHeight: 1.1, minHeight: 36,
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                overflow: 'hidden', cursor: 'text', userSelect: 'text',
              }}
            >
              {dispStr}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ padding: '8px 10px 10px', background: 'var(--surface)' }}>
            {/* Memory row — 5 buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, marginBottom: 5 }}>
              {MEM_ROW.map(btn => (
                <button key={btn} onClick={() => press(btn)} style={getBtnStyle(btn)}>{btn}</button>
              ))}
            </div>
            {/* Main grid — 4 columns × 6 rows */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 5 }}>
              {CALC_ROWS.flat().map((btn, i) => (
                <button key={i} onClick={() => press(btn)} style={getBtnStyle(btn)}>{btn}</button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '6px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.08em' }}>JPCALC v2.0</span>
            {memory !== null && (
              <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--accent-muted)', fontWeight: 700 }}>
                M: {fmtDisplay(String(memory))}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
