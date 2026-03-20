import { SHIFT_DURATION, SHIFT_THEMES } from './pages/BreakPage'

function pad(n) { return String(n).padStart(2, '0') }
function fmtCountdown(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export default function ShiftBanner({ shift }) {
  const { status, remaining, theme: themeId, emoji } = shift
  
  if (status === 'idle') return null

  const theme = SHIFT_THEMES.find(t => t.id === themeId) || SHIFT_THEMES[0]
  const pct = (SHIFT_DURATION - remaining) / SHIFT_DURATION
  const isDone = status === 'done' || remaining <= 0

  return (
    <div style={{
      position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 99998,
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '6px 16px', borderRadius: 20,
      background: theme.bg,
      backdropFilter: 'blur(12px)',
      border: `1px solid ${theme.border}`,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      animation: 'slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      pointerEvents: 'none',
      userSelect: 'none',
      transition: 'all 0.5s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 14 }}>{isDone ? '🎉' : emoji }</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            fontFamily: 'JetBrains Mono', 
            fontSize: 11, 
            fontWeight: 800, 
            color: isDone ? '#22C55E' : theme.color, 
            lineHeight: 1,
            letterSpacing: '0.05em'
          }}>
            {isDone ? 'SHIFT COMPLETE' : fmtCountdown(remaining)}
          </div>
          {!isDone && (
            <div style={{ 
              width: 80, height: 3, background: 'rgba(255,255,255,0.1)', 
              borderRadius: 3, marginTop: 4, overflow: 'hidden' 
            }}>
              <div style={{ 
                width: `${pct * 100}%`, height: '100%', 
                background: theme.accent,
                transition: 'width 1s linear'
              }} />
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  )
}
