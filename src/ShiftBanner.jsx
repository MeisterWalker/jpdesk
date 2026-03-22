import ShiftAnimation from './ShiftAnimation'
import { SHIFT_THEMES } from './pages/BreakPage'
import { BuildingIcon, HatIcon, RocketIcon, CatIcon, RainbowIcon, BlossomIcon, WaveIcon, FireIcon, LaptopIcon, CoffeeIcon } from './components/Icons'

const ICON_MAP = {
  building: BuildingIcon,
  hat:      HatIcon,
  rocket:   RocketIcon,
  cat:      CatIcon,
  rainbow:  RainbowIcon,
  blossom:  BlossomIcon,
  wave:     WaveIcon,
  fire:     FireIcon,
  laptop:   LaptopIcon,
  coffee:   CoffeeIcon,
}

function pad(n) { return String(n).padStart(2, '0') }
function fmtCountdown(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export default function ShiftBanner({ shift }) {
  const { status, remaining, theme: themeId, emoji, milestoneMsg, totalDuration } = shift
  
  if (status === 'idle') return null

  const theme = SHIFT_THEMES.find(t => t.id === themeId) || SHIFT_THEMES[0]
  const pct = (totalDuration - remaining) / totalDuration
  const isDone = status === 'done' || remaining <= 0
  const Icon = ICON_MAP[emoji] || BuildingIcon

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
      transition: 'all 0.5s ease',
      // overflow: 'hidden' // Removed to allow icon bloom if needed
    }}>
      <ShiftAnimation type={theme.animation} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, position: 'relative', zIndex: 1 }}>
        <span style={{ fontSize: 14, display: 'flex' }}>
          {isDone ? '🎉' : <Icon size={24} iconSize={14} />}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ 
            fontFamily: 'JetBrains Mono', 
            fontSize: milestoneMsg ? 10 : 11, 
            fontWeight: 800, 
            color: isDone ? '#22C55E' : theme.color, 
            lineHeight: 1.1,
            letterSpacing: '0.05em',
            animation: milestoneMsg ? 'milestonePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
          }}>
            {isDone ? 'SHIFT COMPLETE' : (milestoneMsg || fmtCountdown(remaining))}
          </div>
          {!isDone && !milestoneMsg && (
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
        @keyframes milestonePop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
