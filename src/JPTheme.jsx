import { useState, useEffect, useCallback } from 'react'
import { useTheme, ACCENTS } from './context/ThemeContext'

export default function JPTheme({ focused = true, onFocus = () => {} }) {
  const { theme, toggleTheme, accent, changeAccent } = useTheme()
  const [expanded, setExpanded] = useState(true)
  const [position, setPosition] = useState({ x: window.innerWidth - 510, y: 90 })
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

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
      x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 220)),
      y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 44)),
    })
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragOffset])

  const currentAccent = ACCENTS.find(a => a.id === accent) || ACCENTS[0]

  return (
    <div
      data-theme="dark"
      onMouseDown={handleWidgetMouseDown}
      style={{
        position: 'fixed', left: position.x, top: position.y, width: 220,
        zIndex: focused ? 9999 : 9990,
        borderRadius: expanded ? 18 : 12,
        background: 'var(--surface)',
        border: `1px solid ${focused ? `${currentAccent.primary}66` : 'var(--border)'}`,
        boxShadow: focused ? `0 8px 40px rgba(0,0,0,0.55)` : '0 4px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: dragging ? 'none' : 'border-radius 0.25s ease, box-shadow 0.2s ease',
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'var(--surface)', borderBottom: expanded ? '1px solid var(--border)' : 'none', cursor: dragging ? 'grabbing' : 'grab' }}>
        <span style={{ fontSize: 14 }}>🎨</span>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          JP<span style={{ background: `linear-gradient(90deg,${currentAccent.primary},${currentAccent.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Theme</span>
        </span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setExpanded(v => !v)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* Dark / Light toggle */}
          <div style={{ padding: '10px 12px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 8 }}>Mode</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['dark', 'light'].map(m => (
                <button key={m} onClick={() => { if (theme !== m) toggleTheme() }} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: `1px solid ${theme === m ? `${currentAccent.primary}66` : 'var(--border)'}`,
                  background: theme === m ? `${currentAccent.primary}18` : 'var(--surface)',
                  transition: 'all 0.15s',
                }}>
                  <div style={{ fontSize: 16, marginBottom: 3 }}>{m === 'dark' ? '🌙' : '☀️'}</div>
                  <div style={{ fontSize: 10, fontFamily: 'Space Grotesk', fontWeight: 700, color: theme === m ? currentAccent.primary : 'var(--text-muted)', textTransform: 'capitalize' }}>{m}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Accent colors */}
          <div style={{ padding: '10px 12px' }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 8 }}>Accent Color</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {ACCENTS.map(a => (
                <button key={a.id} onClick={() => changeAccent(a.id)} title={a.label} style={{
                  padding: '6px 4px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                  border: `2px solid ${accent === a.id ? a.primary : 'transparent'}`,
                  background: accent === a.id ? `${a.primary}18` : 'var(--surface-2)',
                  transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: `linear-gradient(135deg, ${a.primary}, ${a.secondary})`, boxShadow: accent === a.id ? `0 0 8px ${a.primary}88` : 'none' }} />
                  <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: accent === a.id ? a.primary : 'var(--text-muted)', fontWeight: accent === a.id ? 700 : 400 }}>{a.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div style={{ padding: '8px 12px', background: 'var(--bg)', borderTop: '1px solid var(--border)' }}>
            <div style={{ padding: '8px 10px', borderRadius: 10, background: `${currentAccent.primary}12`, border: `1px solid ${currentAccent.primary}30`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `linear-gradient(135deg,${currentAccent.primary},${currentAccent.secondary})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>🎩</div>
              <div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 12, color: 'var(--text-primary)' }}>
                  JP<span style={{ background: `linear-gradient(90deg,${currentAccent.primary},${currentAccent.secondary})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Desk</span>
                </div>
                <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: currentAccent.primary, fontWeight: 700 }}>{currentAccent.label} · {theme}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '6px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.08em' }}>JPTHEME v1.0</span>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: currentAccent.primary, fontWeight: 700 }}>{currentAccent.label}</span>
          </div>
        </div>
      )}
    </div>
  )
}
