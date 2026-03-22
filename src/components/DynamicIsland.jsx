import React, { useState, useEffect } from 'react'
import { BuildingIcon, WaveIcon, RocketIcon } from './Icons'
import { SHIFT_THEMES } from '../pages/BreakPage'

function pad(n) { return String(n).padStart(2, '0') }
function fmtCountdown(secs) {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return `${pad(h)}:${pad(m)}:${pad(s)}`
}

export default function DynamicIsland({ shift, xpProgress, level }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const { status, remaining, theme: themeId, milestoneMsg, totalDuration } = shift
  const isShiftActive = status !== 'idle'
  const theme = SHIFT_THEMES.find(t => t.id === themeId) || SHIFT_THEMES[0]
  
  // Payday Logic (5th and 20th)
  const getPaydayInfo = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const date = now.getDate()

    let lastPayday, nextPayday

    if (date < 5) {
      // Before the 5th: Last was 20th of prev month, Next is 5th of current
      lastPayday = new Date(year, month - 1, 20)
      nextPayday = new Date(year, month, 5)
    } else if (date < 20) {
      // Between 5th and 20th: Last was 5th, Next is 20th
      lastPayday = new Date(year, month, 5)
      nextPayday = new Date(year, month, 20)
    } else {
      // After 20th: Last was 20th, Next is 5th of next month
      lastPayday = new Date(year, month, 20)
      nextPayday = new Date(year, month + 1, 5)
    }

    const totalDays = (nextPayday - lastPayday) / (1000 * 60 * 60 * 24)
    const daysElapsed = (now - lastPayday) / (1000 * 60 * 60 * 24)
    const pct = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100))
    const daysLeft = Math.ceil((nextPayday - now) / (1000 * 60 * 60 * 24))

    return { pct, daysLeft, nextDate: nextPayday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
  }

  const payday = getPaydayInfo()

  return (
    <div 
      className="dynamic-island-container"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 99999,
        pointerEvents: 'auto', userSelect: 'none'
      }}
    >
      <div style={{
        background: '#000',
        borderRadius: isExpanded ? 24 : 100,
        height: isExpanded ? 110 : 32,
        width: isExpanded ? 280 : (isShiftActive ? 160 : 100),
        display: 'flex', flexDirection: 'column',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        padding: isExpanded ? '16px' : '0 12px',
        boxShadow: isExpanded ? '0 10px 40px rgba(0,0,0,0.6)' : '0 4px 12px rgba(0,0,0,0.4)',
        border: isExpanded ? '1px solid rgba(255,255,255,0.1)' : 'none',
        overflow: 'hidden',
        color: '#fff',
        alignItems: 'center',
        justifyContent: isExpanded ? 'space-between' : 'center',
        position: 'relative'
      }}>
        {/* XP Mini Bar (Top) */}
        <div style={{ 
          position: 'absolute', top: 0, left: 0, height: 2, 
          width: `${xpProgress}%`, background: 'var(--accent)',
          boxShadow: '0 0 8px var(--accent)', transition: 'width 0.6s ease'
        }} />

        {/* Compact State Content */}
        {!isExpanded && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700,
            animation: 'fadeIn 0.3s ease'
          }}>
            {isShiftActive ? (
              <>
                <div className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: theme.color }} />
                <span style={{ fontFamily: 'JetBrains Mono' }}>{fmtCountdown(remaining)}</span>
              </>
            ) : (
              <span style={{ opacity: 0.8 }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            )}
          </div>
        )}

        {/* Expanded State Content */}
        {isExpanded && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeIn 0.3s ease' }}>
            {/* Top Row: Clock & Shift Status */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.1em' }}>CURRENT STATUS</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {isShiftActive ? (status === 'break' ? '☕ ON BREAK' : '🔨 ON SHIFT') : '🏠 OFF DUTY'}
                  </div>
                  <div style={{ 
                    fontSize: 8, background: 'var(--accent)', color: '#fff', 
                    padding: '1px 5px', borderRadius: 4, fontWeight: 900 
                  }}>
                    LVL {level}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 800, letterSpacing: '0.1em' }}>TIME</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            {/* Middle Row: Shift Timer (if active) */}
            {isShiftActive && (
               <div style={{ 
                 background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '8px 12px',
                 display: 'flex', alignItems: 'center', justifyContent: 'space-between'
               }}>
                  <div style={{ fontSize: 11, color: theme.color, fontWeight: 800 }}>{milestoneMsg || 'SESSION'}</div>
                  <div style={{ fontFamily: 'JetBrains Mono', fontSize: 14, fontWeight: 900, color: theme.color }}>{fmtCountdown(remaining)}</div>
               </div>
            )}

            {/* Bottom Row: Payday Horizon */}
            <div style={{ marginTop: isShiftActive ? 0 : 4 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 6 }}>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>PAYDAY HORIZON</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)' }}>{payday.daysLeft} DAYS LEFT</div>
               </div>
               <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${payday.pct}%`, height: '100%', 
                    background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                    transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    boxShadow: '0 0 10px var(--accent-soft)'
                  }} />
               </div>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 8, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>
                  <span>5th / 20th CYCLE</span>
                  <span>NEXT: {payday.nextDate}</span>
               </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .pulse-dot { animation: pulse 2s infinite; }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
