import { useState, useEffect, useRef, useCallback } from 'react'
import './index.css'
import NotesPage from './pages/NotesPage'
import ScriptsPage from './pages/ScriptsPage'
import InfoPage from './pages/InfoPage'
import { ThemeProvider, useTheme } from './context/ThemeContext'

const TABS = [
  { id: 'notes',   label: 'Notes',   icon: '📝' },
  { id: 'scripts', label: 'Scripts', icon: '💬' },
  { id: 'info',    label: 'Info',    icon: '📋' },
]

function Clock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return (
    <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
      {time.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  )
}

function AppInner() {
  const { theme, toggleTheme } = useTheme()
  const [expanded, setExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState('notes')
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const barRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select') || e.target.closest('textarea')) return
    setDragging(true)
    setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
  }, [position])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      const nx = e.clientX - dragOffset.x
      const ny = e.clientY - dragOffset.y
      const maxX = window.innerWidth - (expanded ? 460 : 320)
      const maxY = window.innerHeight - (expanded ? 600 : 48)
      setPosition({ x: Math.max(0, Math.min(nx, maxX)), y: Math.max(0, Math.min(ny, maxY)) })
    }
    const onUp = () => {
      setDragging(false)
      setPosition(prev => {
        const snapThreshold = 60
        let { x, y } = prev
        if (x < snapThreshold) x = 0
        if (x > window.innerWidth - (expanded ? 460 : 320) - snapThreshold) x = window.innerWidth - (expanded ? 460 : 320)
        return { x, y }
      })
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragOffset, expanded])

  return (
    <div
      ref={barRef}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: expanded ? 460 : 300,
        zIndex: 9999,
        borderRadius: expanded ? 18 : 12,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.45)',
        overflow: 'hidden',
        transition: dragging ? 'none' : 'width 0.25s cubic-bezier(0.34,1.56,0.64,1), border-radius 0.25s ease',
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div
        onMouseDown={onMouseDown}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '11px 14px',
          background: 'var(--surface)',
          borderBottom: expanded ? '1px solid var(--border)' : 'none',
          cursor: dragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg,#6366F1,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>⚡</div>
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            JP<span style={{ background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Desk</span>
          </span>
        </div>

        <div style={{ flex: 1 }} />
        <Clock />

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '2px 4px', opacity: 0.6 }}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Expand/collapse */}
        <button onClick={() => setExpanded(v => !v)}
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, transition: 'var(--transition)', flexShrink: 0 }}
          title={expanded ? 'Minimize' : 'Expand'}>
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="animate-spring" style={{ display: 'flex', flexDirection: 'column', height: 560 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', padding: '8px 12px 0', gap: 2, borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px',
                  borderRadius: '8px 8px 0 0', position: 'relative',
                  background: activeTab === tab.id ? 'var(--bg)' : 'transparent',
                  border: activeTab === tab.id ? '1px solid var(--border)' : '1px solid transparent',
                  borderBottom: activeTab === tab.id ? '1px solid var(--bg)' : '1px solid transparent',
                  marginBottom: activeTab === tab.id ? -1 : 0,
                  color: activeTab === tab.id ? '#6366F1' : 'var(--text-muted)',
                  fontSize: 12, fontWeight: activeTab === tab.id ? 700 : 400,
                  cursor: 'pointer', transition: 'var(--transition)',
                }}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', borderRadius: 2 }} />
                )}
              </button>
            ))}
          </div>

          {/* Page */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }} key={activeTab} className="animate-slideRight">
            {activeTab === 'notes'   && <NotesPage />}
            {activeTab === 'scripts' && <ScriptsPage />}
            {activeTab === 'info'    && <InfoPage />}
          </div>

          {/* Footer */}
          <div style={{ padding: '7px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-label)', letterSpacing: '0.08em' }}>JPDESK v1.0 · BY JOHN PAUL LACARON</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-label)' }}>LIVE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
