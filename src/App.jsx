import { useState, useEffect, useRef, useCallback } from 'react'
import './index.css'
import { supabase } from './lib/supabase'
import NotesPage from './pages/NotesPage'
import ScriptsPage from './pages/ScriptsPage'
import InfoPage from './pages/InfoPage'
import BreakPage, { useBreakEngine } from './pages/BreakPage'
import { ThemeProvider, useTheme } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import DoodleLayer from './DoodleLayer'
import LoginPage from './pages/LoginPage'
import AdminPage from './pages/AdminPage'
import CalcPage from './pages/CalcPage'

const TABS = [
  { id: 'notes',   label: 'Notes',   icon: '📝' },
  { id: 'scripts', label: 'Scripts', icon: '💬' },
  { id: 'info',    label: 'Info',    icon: '📋' },
  { id: 'breaks',  label: 'Breaks',  icon: '⏱' },
  { id: 'calc',    label: 'Calc',    icon: '🧮' },
  { id: 'admin',   label: 'Admin',   icon: '👑' },
]

const TIMEZONES = [
  { label: 'PH',  tz: 'Asia/Manila',         color: '#F59E0B' },
  { label: 'CST', tz: 'America/Chicago',      color: '#60A5FA' },
  { label: 'PST', tz: 'America/Los_Angeles',  color: '#A78BFA' },
  { label: 'EST', tz: 'America/New_York',     color: '#34D399' },
  { label: 'HST', tz: 'Pacific/Honolulu',     color: '#F472B6' },
]

function Clock() {
  const [time, setTime] = useState(new Date())
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const fmt = (tz) => time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: tz })
  const fmtShort = (tz) => time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: tz })

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowAll(v => !v)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, padding: '2px 4px' }}
        title="Click to see all timezones"
      >
        <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#F59E0B', fontWeight: 700 }}>PH</span>
        <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>
          {fmtShort('Asia/Manila')}
        </span>
        <span style={{ fontSize: 9, color: 'var(--text-label)' }}>▾</span>
      </button>

      {showAll && (
        <div className="animate-slideUp" style={{
          position: 'absolute', top: 28, right: 0, zIndex: 200,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '8px 0', minWidth: 200,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
        }}>
          {TIMEZONES.map(z => (
            <div key={z.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: z.color, boxShadow: `0 0 6px ${z.color}` }} />
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 700, color: z.color, minWidth: 30 }}>{z.label}</span>
              </div>
              <span className="mono" style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(z.tz)}</span>
            </div>
          ))}
          <div style={{ margin: '6px 14px 2px', paddingTop: 6, borderTop: '1px solid var(--border)', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)' }}>
            {time.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'Asia/Manila' })} · PH DATE
          </div>
        </div>
      )}
    </div>
  )
}

// ── Gentleman logo animation ──────────────────────────────
const gentlemanStyles = `
  @keyframes tipHat {
    0%, 85%, 100% { transform: rotate(0deg) translateY(0); }
    88%           { transform: rotate(-18deg) translateY(-2px); }
    94%           { transform: rotate(8deg) translateY(-1px); }
    97%           { transform: rotate(-5deg); }
  }
  @keyframes blinkEye {
    0%, 90%, 100% { transform: scaleY(1); }
    95%           { transform: scaleY(0.1); }
  }
  @keyframes breathe {
    0%, 100% { transform: scaleY(1); }
    50%      { transform: scaleY(1.04); }
  }
  @keyframes floatBadge {
    0%, 100% { transform: translateY(0px); }
    50%      { transform: translateY(-1.5px); }
  }
`

function GentlemanLogo() {
  return (
    <>
      <style>{gentlemanStyles}</style>
      <svg width="26" height="26" viewBox="0 0 26 26" xmlns="http://www.w3.org/2000/svg"
        style={{ animation: 'floatBadge 3s ease-in-out infinite', flexShrink: 0 }}>

        {/* Background badge */}
        <rect width="26" height="26" rx="7" fill="url(#ggrad)" />
        <defs>
          <linearGradient id="ggrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>

        {/* Body / suit */}
        <rect x="8" y="17" width="10" height="7" rx="2" fill="#312e81"
          style={{ transformOrigin: '13px 20px', animation: 'breathe 3s ease-in-out infinite' }} />

        {/* Tie */}
        <polygon points="13,17 11.5,19.5 13,22 14.5,19.5" fill="#818cf8" />

        {/* Shirt collar */}
        <polygon points="10,17 13,19.5 10,21" fill="white" opacity="0.9" />
        <polygon points="16,17 13,19.5 16,21" fill="white" opacity="0.9" />

        {/* Head */}
        <circle cx="13" cy="11" r="5" fill="#fcd9b0"
          style={{ transformOrigin: '13px 11px', animation: 'tipHat 4s ease-in-out infinite' }} />

        {/* Eyes */}
        <ellipse cx="11.2" cy="10.5" rx="0.9" ry="0.9" fill="#1e1b4b"
          style={{ transformOrigin: '11.2px 10.5px', animation: 'blinkEye 4s ease-in-out infinite' }} />
        <ellipse cx="14.8" cy="10.5" rx="0.9" ry="0.9" fill="#1e1b4b"
          style={{ transformOrigin: '14.8px 10.5px', animation: 'blinkEye 4s ease-in-out infinite' }} />

        {/* Smile */}
        <path d="M11 12.5 Q13 14 15 12.5" fill="none" stroke="#c2853a" strokeWidth="0.8" strokeLinecap="round" />

        {/* Hat brim */}
        <rect x="7.5" y="7.2" width="11" height="1.5" rx="0.7" fill="#312e81"
          style={{ transformOrigin: '13px 8px', animation: 'tipHat 4s ease-in-out infinite' }} />
        {/* Hat top */}
        <rect x="9.5" y="3.5" width="7" height="4" rx="1" fill="#312e81"
          style={{ transformOrigin: '13px 8px', animation: 'tipHat 4s ease-in-out infinite' }} />
        {/* Hat band */}
        <rect x="9.5" y="6.2" width="7" height="1.2" rx="0.3" fill="#818cf8"
          style={{ transformOrigin: '13px 8px', animation: 'tipHat 4s ease-in-out infinite' }} />
      </svg>
    </>
  )
}

function AppInner() {
  const { theme, toggleTheme } = useTheme()
  const { user, profile, loading: authLoading, signOut, isAdmin } = useAuth()
  const [onlineUsers, setOnlineUsers] = useState([])
  const [showOnline, setShowOnline]   = useState(false)
  const [showHydration, setShowHydration] = useState(false)
  const [hydrationDismissed, setHydrationDismissed] = useState(false)

  // ── Presence ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const channel = supabase.channel('online-users', { config: { presence: { key: user.id } } })
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const users = Object.values(state).map(arr => arr[0]).filter(Boolean)
        setOnlineUsers(users)
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, username: profile?.username || 'user', online_at: new Date().toISOString() })
        }
      })
    return () => { supabase.removeChannel(channel) }
  }, [user, profile])

  // ── Hydration reminder every 60 min ───────────────────────────────────────
  useEffect(() => {
    if (!user) return
    const timer = setInterval(() => {
      setHydrationDismissed(false)
      setShowHydration(true)
    }, 60 * 60 * 1000)
    return () => clearInterval(timer)
  }, [user])
  const [expanded, setExpanded] = useState(true)
  const [activeTab, setActiveTab] = useState('notes')
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const barRef = useRef(null)
  const breakEngine = useBreakEngine()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.setAttribute('data-theme', theme)
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

  if (authLoading) return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#0d0f1a',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: '3px solid rgba(99,102,241,0.2)',
        borderTop: '3px solid #6366F1',
        animation: 'spin 0.8s linear infinite',
      }}/>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: 11, color: 'rgba(139,92,246,0.6)', letterSpacing: '0.1em' }}>
        LOADING...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!user) return <LoginPage />

  return (
    <>
      <DoodleLayer />
      <div
      ref={barRef}
      data-theme={theme}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: expanded ? 460 : 340,
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
          <GentlemanLogo />
          <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            JP<span style={{ background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Desk</span>
          </span>
        </div>

        <div style={{ flex: 1 }} />
        <Clock />

        {/* User + sign out */}
        {expanded && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.username || ''}
            </span>
            <button onMouseDown={e => e.stopPropagation()} onClick={signOut} title="Sign out"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, opacity: 0.5, padding: '2px 3px' }}>
              🚪
            </button>
          </div>
        )}

        {/* Theme toggle */}
        <button onClick={toggleTheme}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, padding: '2px 4px', opacity: 0.6 }}
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>

        {/* Expand/collapse */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={() => setExpanded(v => !v)}
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
            {TABS.filter(t => t.id !== 'admin' || isAdmin).map(tab => (
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
            {activeTab === 'breaks'  && <BreakPage engine={breakEngine} />}
            {activeTab === 'calc'    && <CalcPage />}
            {activeTab === 'admin'   && <AdminPage />}
          </div>

          {/* Footer */}
          <div style={{ padding: '7px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0, position: 'relative' }}>
            <span className="mono" style={{ fontSize: 10, color: 'var(--text-label)', letterSpacing: '0.08em' }}>JPDESK v1.0 · BY JOHN PAUL LACARON</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

              {/* Who's online */}
              <div style={{ position: 'relative' }}>
                <button onClick={() => setShowOnline(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', borderRadius: 6 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>👥</span>
                  <span className="mono" style={{ fontSize: 10, color: 'var(--text-label)' }}>{onlineUsers.length} online</span>
                </button>
                {showOnline && (
                  <div style={{ position: 'absolute', bottom: 28, right: 0, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 0', minWidth: 160, zIndex: 999, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
                    <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 6px', borderBottom: '1px solid var(--border)', marginBottom: 4 }}>Online Now</div>
                    {onlineUsers.length === 0 ? (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', padding: '4px 12px' }}>No one yet</div>
                    ) : onlineUsers.map((u, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px' }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 5px #22C55E', flexShrink: 0 }} />
                        <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)' }}>
                          {u.username}{u.user_id === user?.id ? ' (you)' : ''}
                        </span>
                      </div>
                    ))}
                    <button onClick={() => setShowOnline(false)} style={{ width: '100%', marginTop: 4, padding: '4px 12px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', textAlign: 'left', borderTop: '1px solid var(--border)' }}>close</button>
                  </div>
                )}
              </div>

              <div style={{ width: 1, height: 10, background: 'var(--border)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px #22C55E' }} />
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-label)' }}>LIVE</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Hydration reminder toast */}
    {showHydration && !hydrationDismissed && (
      <div style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, rgba(14,165,233,0.95), rgba(99,102,241,0.95))',
        borderRadius: 14, padding: '12px 18px', zIndex: 99999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', gap: 12,
        animation: 'slideUp 0.3s ease',
        minWidth: 240,
      }}>
        <span style={{ fontSize: 22 }}>💧</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: '#fff' }}>Time to hydrate!</div>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'rgba(255,255,255,0.75)', marginTop: 1 }}>Take a sip of water 😊</div>
        </div>
        <button onClick={() => { setShowHydration(false); setHydrationDismissed(true) }}
          style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer', fontSize: 11, padding: '4px 10px', fontFamily: 'JetBrains Mono' }}>
          👍 Done
        </button>
      </div>
    )}
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppInner />
      </ThemeProvider>
    </AuthProvider>
  )
}
