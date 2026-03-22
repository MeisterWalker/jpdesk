import { useState, useEffect, useCallback } from 'react'
import { PhoneticIcon } from './components/Icons'

const PHONETIC = {
  A:'Alpha', B:'Bravo', C:'Charlie', D:'Delta', E:'Echo', F:'Foxtrot',
  G:'Golf', H:'Hotel', I:'India', J:'Juliet', K:'Kilo', L:'Lima',
  M:'Mike', N:'November', O:'Oscar', P:'Papa', Q:'Quebec', R:'Romeo',
  S:'Sierra', T:'Tango', U:'Uniform', V:'Victor', W:'Whiskey', X:'X-ray',
  Y:'Yankee', Z:'Zulu',
  '0':'Zero', '1':'One', '2':'Two', '3':'Three', '4':'Four',
  '5':'Five', '6':'Six', '7':'Seven', '8':'Eight', '9':'Nine',
}

const COLORS = [
  'var(--accent)','var(--accent-2)','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#14B8A6',
  '#F97316','#84CC16','#06B6D4','#A78BFA',
]

function getColor(char) {
  const idx = char.toUpperCase().charCodeAt(0) % COLORS.length
  return COLORS[idx]
}

export default function JPPhonetic({ focused = true, onFocus = () => {} }) {
  const [expanded, setExpanded] = useState(true)
  const [position, setPosition] = useState({ x: window.innerWidth - 480, y: 90 })
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [input, setInput] = useState('')
  const [copied, setCopied] = useState(false)

  const tokens = input.toUpperCase().split('').map(c => ({
    char: c,
    word: PHONETIC[c] || (c === ' ' ? null : c),
    isSpace: c === ' ',
  }))

  const spokenText = tokens
    .filter(t => !t.isSpace && t.word)
    .map(t => t.word)
    .join(' ')

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
  }, [dragging, dragOffset])

  const copyResult = () => {
    if (!spokenText) return
    navigator.clipboard.writeText(spokenText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      data-theme="dark"
      onMouseDown={handleWidgetMouseDown}
      style={{
        position: 'fixed', left: position.x, top: position.y, width: 260,
        zIndex: focused ? 9999 : 9990,
        borderRadius: expanded ? 18 : 12,
        background: 'var(--surface)',
        border: `1px solid ${focused ? 'var(--accent-border)' : 'var(--border)'}`,
        boxShadow: focused ? '0 8px 40px rgba(0,0,0,0.55)' : '0 4px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: dragging ? 'none' : 'border-radius 0.25s ease, box-shadow 0.2s ease',
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'var(--surface)', borderBottom: expanded ? '1px solid var(--border)' : 'none', cursor: dragging ? 'grabbing' : 'grab' }}>
        <PhoneticIcon size={20} iconSize={12} />
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          JP<span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Phonetic</span>
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.04em' }}>NATO</span>
        <button onClick={() => setExpanded(v => !v)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* Input */}
          <div style={{ padding: '10px 12px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 6 }}>Type to spell out</div>
            <input
              type="text"
              placeholder="e.g. John Smith..."
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                width: '100%', padding: '7px 10px', borderRadius: 8,
                border: '1px solid var(--border)', background: 'var(--surface)',
                color: 'var(--text-primary)', fontFamily: 'JetBrains Mono',
                fontSize: 12, boxSizing: 'border-box', outline: 'none',
              }}
            />
          </div>

          {/* Phonetic result */}
          {input && (
            <div style={{ padding: '10px 12px', maxHeight: 200, overflowY: 'auto' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {tokens.map((t, i) =>
                  t.isSpace ? (
                    <div key={i} style={{ width: 8 }} />
                  ) : (
                    <div key={i} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      padding: '4px 6px', borderRadius: 7,
                      background: `${getColor(t.char)}18`,
                      border: `1px solid ${getColor(t.char)}35`,
                      minWidth: 32,
                    }}>
                      <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 12, color: getColor(t.char) }}>{t.char}</span>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, color: 'var(--text-muted)', marginTop: 1, whiteSpace: 'nowrap' }}>{t.word || '?'}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {!input && (
            <div style={{ padding: '16px 12px', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textAlign: 'center', lineHeight: 1.7 }}>
              Type any name, word, or ID<br />to get NATO phonetic spelling
            </div>
          )}

          {/* Footer */}
          <div style={{ padding: '6px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.08em' }}>JPPHONETIC v1.0</span>
            {spokenText && (
              <button onClick={copyResult} style={{
                fontSize: 9, fontFamily: 'JetBrains Mono', padding: '2px 8px', borderRadius: 6,
                background: copied ? 'rgba(34,197,94,0.15)' : 'var(--accent-soft)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'var(--accent-border)'}`,
                color: copied ? '#22C55E' : 'var(--accent-muted)', cursor: 'pointer', fontWeight: 700,
              }}>
                {copied ? '✓ Copied!' : '⎘ Copy'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
