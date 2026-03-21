import { useState, useEffect, useRef } from 'react'
import ShiftAnimation from '../ShiftAnimation'
import AmbientPlayer from '../AmbientPlayer'

export const BREAKS = [
  { id: 'break1', label: '1st Break',  duration: 15 * 60, color: '#60A5FA', soft: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.25)',  emoji: '☕' },
  { id: 'meal',   label: 'Meal Break', duration: 30 * 60, color: '#34D399', soft: 'rgba(52,211,153,0.1)',  border: 'rgba(52,211,153,0.25)',  emoji: '🍱' },
  { id: 'break2', label: 'Last Break', duration: 15 * 60, color: '#F59E0B', soft: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.25)',  emoji: '🧃' },
]

export const INITIAL_BREAK_STATE = {
  status: 'idle',    // idle | running | paused | done | overbreak
  remaining: null,
  startedAt: null,
  endedAt: null,
}

export const SHIFT_DURATION_DEFAULT = 8 * 60 * 60
export const INITIAL_SHIFT_STATE = {
  status: 'idle',    // idle | running | paused | done
  totalDuration: SHIFT_DURATION_DEFAULT,
  remaining: SHIFT_DURATION_DEFAULT,
  startedAt: null,
  endedAt: null,
  theme: 'slate',
  emoji: '🏢',
  isMusicPlaying: false,
  musicVolume: 0.5,
}

export const SHIFT_THEMES = [
  { id: 'slate',    label: 'Slate',    bg: 'rgba(15, 23, 42, 0.9)', border: 'rgba(255,255,255,0.1)', color: '#fff', accent: '#6366F1', animation: 'slate' },
  { id: 'kawaii',   label: 'Kawaii',   bg: 'linear-gradient(135deg, #FF69B4, #DA70D6)', border: '#FFC0CB', color: '#fff', accent: '#FFF0F5', animation: 'hearts' },
  { id: 'midnight', label: 'Midnight', bg: 'linear-gradient(135deg, #0F172A, #1E1B4B)', border: '#312E81', color: '#818CF8', accent: '#C7D2FE', animation: 'stars' },
  { id: 'nature',   label: 'Nature',   bg: 'linear-gradient(135deg, #065F46, #059669)', border: '#34D399', color: '#ecfdf5', accent: '#6EE7B7', animation: 'leaves' },
  { id: 'sunset',   label: 'Sunset',   bg: 'linear-gradient(135deg, #BE123C, #FB923C)', border: '#FECDD3', color: '#fff', accent: '#FDE68A', animation: 'sunset' },
  { id: 'ocean',    label: 'Ocean',    bg: 'linear-gradient(180deg, #0EA5E9, #0369A1)', border: '#7DD3FC', color: '#fff', accent: '#BAE6FD', animation: 'bubbles' },
  { id: 'rain',     label: 'Rain',     bg: 'linear-gradient(180deg, #334155, #1E293B)', border: '#475569', color: '#CBD5E1', accent: '#94A3B8', animation: 'rain' },
]

export const ALARM_SOUNDS = [
  { id: 'radar',     label: 'Radar',     emoji: '📡', file: '/iPhone-Radar-Alarm.mp3' },
  { id: 'emergency', label: 'Emergency', emoji: '🚨', file: '/iPhone-Emergency-Alarm.mp3' },
]

export function pad(n) { return String(n).padStart(2, '0') }
export function fmtCountdown(secs) {
  const h = Math.floor(Math.abs(secs) / 3600)
  const m = Math.floor((Math.abs(secs) % 3600) / 60)
  const s = Math.abs(secs) % 60
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}
function fmtTime(date) {
  if (!date) return '--:--'
  return new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
}

const EQ_STYLE = `
  @keyframes epulse {
    0% { height: 4px; }
    50% { height: 12px; }
    100% { height: 4px; }
  }
`

// ── Premium Helpers ─────────────────────────────────────────
export function fireConfetti() {
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.width = '100vw'
  container.style.height = '100vh'
  container.style.pointerEvents = 'none'
  container.style.zIndex = '99999'
  document.body.appendChild(container)

  const colors = ['#FF69B4', '#6366F1', '#34D399', '#F59E0B', '#EF4444', '#A855F7']
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('div')
    p.style.position = 'absolute'
    p.style.width = '8px'
    p.style.height = '8px'
    p.style.background = colors[Math.floor(Math.random() * colors.length)]
    p.style.left = '50%'
    p.style.top = '50%'
    p.style.borderRadius = '2px'
    container.appendChild(p)

    const angle = Math.random() * Math.PI * 2
    const velocity = 5 + Math.random() * 10
    const vx = Math.cos(angle) * velocity
    const vy = Math.sin(angle) * velocity
    let x = 0, y = 0, opacity = 1

    const anim = () => {
      x += vx; y += vy + 0.2
      opacity -= 0.01
      p.style.transform = `translate(${x}px, ${y}px) rotate(${x*2}deg)`
      p.style.opacity = opacity
      if (opacity > 0) requestAnimationFrame(anim)
      else if (p.parentNode) container.removeChild(p)
    }
    requestAnimationFrame(anim)
  }
  setTimeout(() => document.body.removeChild(container), 3000)
}

export function showNotification(title, body) {
  if (!("Notification" in window)) return
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: '/favicon.ico' })
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") new Notification(title, { body, icon: '/favicon.ico' })
    })
  }
}


// ── Timer engine hook — must live in App so it never unmounts ─────────
export function useBreakEngine() {
  const [breakStates, setBreakStates] = useState(() => {
    const saved = localStorage.getItem('jpdesk_break_states')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const now = Date.now()
        const lastUpdated = parsed._ts || now
        const elapsed = Math.floor((now - lastUpdated) / 1000)
        
        // Resume elapsed time for running/overbreak timers
        const recovered = {}
        Object.keys(parsed).forEach(id => {
          if (id === '_ts') return
          const s = parsed[id]
          if (s.status === 'running') {
            const newRem = s.remaining - elapsed
            if (newRem <= 0) {
              recovered[id] = { ...s, status: 'overbreak', remaining: 0, endedAt: s.endedAt || new Date(lastUpdated + s.remaining * 1000) }
            } else {
              recovered[id] = { ...s, remaining: newRem }
            }
          } else if (s.status === 'overbreak') {
            recovered[id] = { ...s, remaining: s.remaining - elapsed }
          } else {
            recovered[id] = s
          }
        })
        return { ...Object.fromEntries(BREAKS.map(b => [b.id, { ...INITIAL_BREAK_STATE, remaining: b.duration }])), ...recovered }
      } catch (e) { console.error("Failed to load break states", e) }
    }
    return Object.fromEntries(BREAKS.map(b => [b.id, { ...INITIAL_BREAK_STATE, remaining: b.duration }]))
  })

  const [shift, setShift] = useState(() => {
    const saved = localStorage.getItem('jpdesk_shift_state')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const now = Date.now()
        const lastUpdated = parsed._ts || now
        const elapsed = Math.floor((now - lastUpdated) / 1000)

        // Ensure totalDuration is present
        const data = { totalDuration: SHIFT_DURATION_DEFAULT, ...parsed }

        if (data.status === 'running') {
          const newRem = data.remaining - elapsed
          if (newRem <= 0) {
            return { ...data, status: 'done', remaining: 0, endedAt: data.endedAt || new Date(lastUpdated + data.remaining * 1000) }
          } else {
            return { ...data, remaining: newRem }
          }
        }
        return data
      } catch (e) { console.error("Failed to load shift state", e) }
    }
    return INITIAL_SHIFT_STATE
  })

  const [selectedSound, setSelectedSound] = useState(() => localStorage.getItem('jpdesk_alert_sound') || 'radar')
  const intervalsRef = useRef({})   // { breakId: intervalId }
  const chimeRef     = useRef(null)

  // Save on every change
  useEffect(() => {
    localStorage.setItem('jpdesk_break_states', JSON.stringify({ ...breakStates, _ts: Date.now() }))
  }, [breakStates])

  useEffect(() => {
    localStorage.setItem('jpdesk_shift_state', JSON.stringify({ ...shift, _ts: Date.now() }))
  }, [shift])

  useEffect(() => {
    localStorage.setItem('jpdesk_alert_sound', selectedSound)
  }, [selectedSound])

  const stopChime = () => {
    if (chimeRef.current) {
      chimeRef.current.pause()
      chimeRef.current.currentTime = 0
      chimeRef.current = null
    }
  }

  const startAlarm = (soundId) => {
    stopChime()
    const sound = ALARM_SOUNDS.find(s => s.id === soundId)
    if (!sound) return
    try {
      const playLoop = () => {
        const audio = new Audio(sound.file)
        audio.volume = 1.0
        audio.play()
        audio.onended = () => {
          if (chimeRef.current === audio) playLoop()
        }
        chimeRef.current = audio
      }
      playLoop()
    } catch(e) {}
  }

  const updateBreak = (id, updater) => {
    setBreakStates(prev => ({ ...prev, [id]: typeof updater === 'function' ? updater(prev[id]) : updater }))
  }

  const startBreak = (id) => {
    setBreakStates(prev => {
      const s = prev[id]
      if (s.status !== 'idle' && s.status !== 'paused') return prev
      const isIdle = s.status === 'idle'
      return {
        ...prev,
        [id]: { ...s, status: 'running', remaining: isIdle ? BREAKS.find(b => b.id === id).duration : s.remaining, startedAt: isIdle ? new Date() : s.startedAt, _soundId: selectedSound }
      }
    })
  }

  const pauseBreak = (id) => {
    if (intervalsRef.current[id]) { clearInterval(intervalsRef.current[id]); delete intervalsRef.current[id] }
    updateBreak(id, s => ({ ...s, status: 'paused' }))
  }

  const finishBreak = (id) => {
    if (intervalsRef.current[id]) { clearInterval(intervalsRef.current[id]); delete intervalsRef.current[id] }
    stopChime()
    updateBreak(id, s => ({ ...s, status: 'done', endedAt: s.endedAt || new Date() }))
  }

  const resetBreak = (id) => {
    if (intervalsRef.current[id]) { clearInterval(intervalsRef.current[id]); delete intervalsRef.current[id] }
    stopChime()
    updateBreak(id, () => ({ ...INITIAL_BREAK_STATE, remaining: BREAKS.find(b => b.id === id).duration, _snoozedUntil: null }))
  }

  const snoozeBreak = (id) => {
    stopChime()
    updateBreak(id, s => ({ ...s, _snoozedUntil: Date.now() + 5 * 60 * 1000 }))
  }

  // ── Shift actions ──
  const startShift = () => {
    setShift(prev => {
      if (prev.status === 'running') return prev
      const isIdle = prev.status === 'idle'
      return {
        ...prev,
        status: 'running',
        startedAt: isIdle ? new Date() : prev.startedAt,
        remaining: isIdle ? prev.totalDuration : prev.remaining
      }
    })
  }

  const pauseShift = () => {
    setShift(prev => ({ ...prev, status: 'paused' }))
  }

  const resetShift = () => {
    setShift(INITIAL_SHIFT_STATE)
  }

  const finishShift = () => {
    setShift(prev => ({ ...prev, status: 'done', endedAt: new Date() }))
  }

  const updateShiftTheme = (themeId) => setShift(prev => ({ ...prev, theme: themeId }))
  const updateShiftEmoji = (emoji)   => setShift(prev => ({ ...prev, emoji }))
  const toggleMusic = () => setShift(prev => ({ ...prev, isMusicPlaying: !prev.isMusicPlaying }))
  const setMusicVolume = (vol) => setShift(prev => ({ ...prev, musicVolume: vol }))

  const setShiftDuration = (hrs) => {
    const secs = hrs * 3600
    setShift(prev => {
      // If idle, just update both. If running, adjust remaining proportionally or just set new total?
      // User likely sets this BEFORE starting or to extend. 
      // Let's just update totalDuration and remaining (if idle).
      if (prev.status === 'idle') {
        return { ...prev, totalDuration: secs, remaining: secs }
      }
      return { ...prev, totalDuration: secs }
    })
  }

  const setShiftStartTime = (timeStr) => {
    if (!timeStr) return
    const [hrs, mins] = timeStr.split(':').map(Number)
    const now = new Date()
    const newStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hrs, mins, 0)
    
    setShift(prev => {
      const elapsed = Math.floor((Date.now() - newStart.getTime()) / 1000)
      const newRem = Math.max(0, prev.totalDuration - elapsed)
      const isDone = newRem <= 0
      
      if (isDone) {
        setTimeout(() => { fireConfetti(); showNotification("Shift Complete! 🎉", "Based on your manual start time, your shift is already finished.") }, 100)
      }

      return { 
        ...prev, 
        startedAt: newStart, 
        remaining: newRem, 
        status: isDone ? 'done' : (prev.status === 'idle' ? 'running' : prev.status),
        endedAt: isDone ? new Date(newStart.getTime() + prev.totalDuration * 1000) : prev.endedAt
      }
    })
  }

  // ── Master tick — runs always regardless of tab ──
  useEffect(() => {
    const tick = setInterval(() => {
      // Tick breaks
      setBreakStates(prev => {
        let next = { ...prev }
        let alarmId = null
        Object.keys(next).forEach(id => {
          const s = next[id]
          if (s.status === 'running') {
            const newRemaining = s.remaining - 1
            if (newRemaining <= 0) {
              next[id] = { ...s, status: 'overbreak', remaining: 0, endedAt: new Date() }
              // Alarm logic with snooze
              if (!s._snoozedUntil || Date.now() > s._snoozedUntil) {
                alarmId = s._soundId || selectedSound
              }
            } else {
              next[id] = { ...s, remaining: newRemaining }
            }
          } else if (s.status === 'overbreak') {
            next[id] = { ...s, remaining: s.remaining - 1 }
            if (s._snoozedUntil && Date.now() > s._snoozedUntil) {
              next[id]._snoozedUntil = null // Clear snooze and re-alarm
              alarmId = s._soundId || selectedSound
            }
          }
        })
        if (alarmId) setTimeout(() => startAlarm(alarmId), 0)
        return next
      })

      // Tick shift
      setShift(prev => {
        if (prev.status !== 'running') return prev
        const newRemaining = prev.remaining - 1
        
        // Milestone checks
        const total = prev.totalDuration
        const progress = (total - newRemaining) / total
        const milestones = [0.25, 0.5, 0.75]
        milestones.forEach(m => {
          const mKey = `m${m*100}`
          if (progress >= m && !prev[mKey]) {
            showNotification("Shift Milestone!", `You've completed ${m*100}% of your shift. Great job!`)
            prev[mKey] = true
            prev.milestoneMsg = `${m*100}% Milestone Reached! 🚀`
            setTimeout(() => setShift(s => ({ ...s, milestoneMsg: null })), 6000)
          }
        })

        // Smart Break Reminders (only if 8-hour shift or proportional?)
        // Let's stick to fixed 2h/4h for now as they are standard.
        if (newRemaining === prev.totalDuration - 2 * 3600 && !prev.notifiedBreak1) {
          showNotification("Break Reminder ☕", "It's been 2 hours! Time for your 1st 15-min break?")
          prev.notifiedBreak1 = true
          prev.milestoneMsg = "Time for your 1st Break? ☕"
          setTimeout(() => setShift(s => ({ ...s, milestoneMsg: null })), 6000)
        }
        if (newRemaining === prev.totalDuration - 4 * 3600 && !prev.notifiedMeal) {
          showNotification("Meal Time 🍱", "Halfway through your shift! Time for a 30-min meal break?")
          prev.notifiedMeal = true
          prev.milestoneMsg = "Halfway! Time for Meal Break? 🍱"
          setTimeout(() => setShift(s => ({ ...s, milestoneMsg: null })), 6000)
        }

        if (newRemaining <= 0) {
          setTimeout(() => {
            startAlarm(selectedSound)
            fireConfetti()
            showNotification("Shift Complete! 🎉", "Great work today! Your 8-hour shift is officially over.")
          }, 0)
          return { ...prev, status: 'done', remaining: 0, endedAt: new Date() }
        }
        return { ...prev, remaining: newRemaining }
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [selectedSound])

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = EQ_STYLE
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  useEffect(() => {
    localStorage.setItem('jpdesk_alert_sound', selectedSound)
  }, [selectedSound])

  return { breakStates, shift, selectedSound, setSelectedSound, startBreak, pauseBreak, finishBreak, resetBreak, snoozeBreak, stopChime, startShift, pauseShift, resetShift, finishShift, updateShiftTheme, updateShiftEmoji, setShiftStartTime, setShiftDuration, toggleMusic, setMusicVolume }
}

// ── Ring progress ──────────────────────────────────────────
function Ring({ pct, color, size = 56, stroke = 5 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const dash = circ * Math.max(0, Math.min(1, pct))
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease' }} />
    </svg>
  )
}

// ── Break animations ──────────────────────────────────────
const animStyles = `
  @keyframes steam1 {
    0%   { transform: translateY(0px) scaleX(1);    opacity: 0; }
    20%  { opacity: 0.6; }
    100% { transform: translateY(-12px) scaleX(1.4); opacity: 0; }
  }
  @keyframes steam2 {
    0%   { transform: translateY(0px) scaleX(1);    opacity: 0; }
    20%  { opacity: 0.5; }
    100% { transform: translateY(-10px) scaleX(1.6); opacity: 0; }
  }
  @keyframes steam3 {
    0%   { transform: translateY(0px) scaleX(1);    opacity: 0; }
    20%  { opacity: 0.4; }
    100% { transform: translateY(-14px) scaleX(1.2); opacity: 0; }
  }
  @keyframes chopL {
    0%, 100% { transform: rotate(0deg); }
    40%      { transform: rotate(12deg); }
    60%      { transform: rotate(12deg); }
  }
  @keyframes chopR {
    0%, 100% { transform: rotate(0deg); }
    40%      { transform: rotate(-12deg); }
    60%      { transform: rotate(-12deg); }
  }
  @keyframes liftFood {
    0%   { transform: translateY(0px);  opacity: 0.85; }
    40%  { transform: translateY(-6px); opacity: 1; }
    60%  { transform: translateY(-6px); opacity: 1; }
    100% { transform: translateY(0px);  opacity: 0.85; }
  }
  @keyframes tipBox {
    0%, 35%  { transform: rotate(0deg); }
    50%, 75% { transform: rotate(35deg); }
    90%, 100%{ transform: rotate(0deg); }
  }
  @keyframes pourDrop {
    0%         { transform: translate(0, 0);      opacity: 0; }
    40%, 50%   { opacity: 0.9; }
    50%        { transform: translate(0, 0);      opacity: 0.9; }
    100%       { transform: translate(6px, 14px); opacity: 0; }
  }
`

function SteamCup({ color }) {
  return (
    <>
      <style>{animStyles}</style>
      <div style={{ position: 'relative', width: 28, height: 34, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
        <svg width="28" height="16" style={{ position: 'absolute', top: -2, left: 0 }} overflow="visible">
          <path d="M8 14 Q6 8 8 4 Q10 0 8 -2" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"
            style={{ animation: 'steam1 1.8s ease-out infinite', opacity: 0 }} />
          <path d="M14 14 Q12 7 14 3 Q16 -1 14 -3" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"
            style={{ animation: 'steam2 1.8s ease-out infinite 0.6s', opacity: 0 }} />
          <path d="M20 14 Q18 8 20 4 Q22 0 20 -2" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"
            style={{ animation: 'steam3 1.8s ease-out infinite 1.1s', opacity: 0 }} />
        </svg>
        <span style={{ fontSize: 18, lineHeight: 1, userSelect: 'none' }}>☕</span>
      </div>
    </>
  )
}

function FloatingMeal({ color }) {
  return (
    <div style={{ position: 'relative', width: 34, height: 38, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <svg width="34" height="22" style={{ position: 'absolute', top: 0, left: 0 }} overflow="visible">
        <line x1="10" y1="2" x2="17" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"
          style={{ transformOrigin: '10px 2px', animation: 'chopL 1.6s ease-in-out infinite' }} />
        <line x1="24" y1="2" x2="17" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round"
          style={{ transformOrigin: '24px 2px', animation: 'chopR 1.6s ease-in-out infinite' }} />
        <circle cx="17" cy="19" r="2.5" fill={color}
          style={{ animation: 'liftFood 1.6s ease-in-out infinite', opacity: 0.85 }} />
      </svg>
      <span style={{ fontSize: 18, lineHeight: 1, userSelect: 'none', marginTop: 16 }}>🍱</span>
    </div>
  )
}

function SippingJuice({ color }) {
  return (
    <div style={{ position: 'relative', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 20, lineHeight: 1, userSelect: 'none', display: 'inline-block', transformOrigin: 'bottom center', animation: 'tipBox 2.2s ease-in-out infinite' }}>🧃</span>
      <svg width="36" height="36" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} overflow="visible">
        <circle cx="28" cy="12" r="2.2" fill={color} style={{ animation: 'pourDrop 2.2s ease-in infinite 0.5s', opacity: 0 }} />
        <circle cx="30" cy="10" r="1.6" fill={color} style={{ animation: 'pourDrop 2.2s ease-in infinite 0.75s', opacity: 0 }} />
        <circle cx="26" cy="14" r="1.4" fill={color} style={{ animation: 'pourDrop 2.2s ease-in infinite 0.95s', opacity: 0 }} />
      </svg>
    </div>
  )
}

// ── Break Timer Card ───────────────────────────────────────
function BreakCard({ brk, state, engine }) {
  const { status, remaining, startedAt, endedAt } = state
  const isOverbreak = remaining < 0

  const start  = () => engine.startBreak(brk.id)
  const pause  = () => engine.pauseBreak(brk.id)
  const finish = () => engine.finishBreak(brk.id)
  const reset  = () => engine.resetBreak(brk.id)

  const pct = status === 'done' ? 0 : Math.max(0, remaining / brk.duration)
  const startedAtDate = startedAt ? new Date(startedAt) : null
  const endedAtDate   = endedAt   ? new Date(endedAt)   : null

  const statusLabel = {
    idle:      'Ready',
    running:   '⏱ Running',
    paused:    '⏸ Paused',
    overbreak: '🚨 OVERBREAK',
    done:      '✅ Done',
  }[status] || 'Ready'

  return (
    <div className="card animate-fadeIn" style={{
      marginBottom: 10, padding: '14px 14px',
      border: `1px solid ${status === 'running' ? brk.border : isOverbreak ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`,
      background: isOverbreak ? 'rgba(239,68,68,0.05)' : status === 'running' ? brk.soft : 'var(--surface)',
      transition: 'all 0.3s ease'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: brk.soft, border: `1px solid ${brk.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'visible' }}>
          {brk.id === 'break1' ? <SteamCup color={brk.color} /> : brk.id === 'meal' ? <FloatingMeal color={brk.color} /> : <SippingJuice color={brk.color} />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, color: isOverbreak ? '#EF4444' : brk.color }}>{brk.label}</div>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', marginTop: 1 }}>
            {brk.duration / 60} min · {statusLabel}
          </div>
        </div>
        <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
          <Ring pct={isOverbreak ? 1 : pct} color={isOverbreak ? '#EF4444' : brk.color} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 11, color: isOverbreak ? '#EF4444' : brk.color, lineHeight: 1 }}>
              {isOverbreak ? '+' : ''}{fmtCountdown(remaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Time row */}
      {startedAtDate && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 10, padding: '6px 10px', background: 'var(--bg)', borderRadius: 8 }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Started</div>
            <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--text-primary)', marginTop: 1 }}>{fmtTime(startedAtDate)}</div>
          </div>
          {endedAtDate ? (
            <div>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Ended</div>
              <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 700, color: endedAtDate - startedAtDate > brk.duration * 1000 ? '#EF4444' : '#34D399', marginTop: 1 }}>{fmtTime(endedAtDate)}</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Expected End</div>
              <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 700, color: brk.color, marginTop: 1 }}>
                {fmtTime(new Date(startedAtDate.getTime() + brk.duration * 1000))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Overbreak warning */}
      {isOverbreak && (
        <div style={{ marginBottom: 10, padding: '7px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.3)', fontSize: 12, fontWeight: 700, color: '#EF4444', textAlign: 'center', fontFamily: 'JetBrains Mono' }}>
          🚨 +{fmtCountdown(remaining)} OVERBREAK — Please return ASAP!
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 6 }}>
        {status === 'idle' && (
          <button onClick={start} className="btn btn-brand" style={{ flex: 1, justifyContent: 'center', background: brk.color, border: 'none' }}>▶ Start Break</button>
        )}
        {status === 'running' && (<>
          <button onClick={pause}  className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>⏸ Pause</button>
          <button onClick={finish} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>✅ I'm Back</button>
          <button onClick={reset}  className="btn btn-ghost" style={{ padding: '7px 10px' }} title="Reset">↺</button>
        </>)}
        {status === 'paused' && (<>
          <button onClick={start}  className="btn btn-brand" style={{ flex: 1, justifyContent: 'center', background: brk.color, border: 'none' }}>▶ Resume</button>
          <button onClick={finish} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>✅ I'm Back</button>
          <button onClick={reset}  className="btn btn-ghost" style={{ padding: '7px 10px' }} title="Reset">↺</button>
        </>)}
        {status === 'overbreak' && (<>
          <button onClick={() => engine.snoozeBreak(brk.id)} className="btn btn-ghost" style={{ flex: 1, height: 32, fontSize: 11, borderColor: '#F59E0B', color: '#F59E0B' }}>🛌 Snooze 5m</button>
          <button onClick={finish} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', borderColor: '#EF4444', color: '#EF4444' }}>✅ I'm Back</button>
          <button onClick={reset}  className="btn btn-ghost" style={{ padding: '7px 10px' }} title="Reset">↺</button>
        </>)}
        {status === 'done' && (<>
          <div style={{ flex: 1, fontSize: 12, fontFamily: 'JetBrains Mono', color: '#34D399', display: 'flex', alignItems: 'center', gap: 5 }}>✅ Break complete</div>
          <button onClick={reset} className="btn btn-ghost" style={{ padding: '7px 12px' }}>↺ Reset</button>
        </>)}
      </div>
    </div>
  )
}

// ── Sound Picker ──────────────────────────────────────────
function SoundPicker({ selected, onChange }) {
  const [testing, setTesting] = useState(null)

  const testSound = (id) => {
    setTesting(id)
    const sound = ALARM_SOUNDS.find(s => s.id === id)
    if (!sound) return
    try {
      const audio = new Audio(sound.file)
      audio.volume = 1.0
      audio.play()
      audio.onended = () => setTesting(null)
      setTimeout(() => { audio.pause(); audio.currentTime = 0; setTesting(null) }, 4000)
    } catch(e) { setTesting(null) }
  }

  return (
    <div className="card" style={{ marginBottom: 10, padding: '11px 13px' }}>
      <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 9, fontWeight: 700 }}>
        🔊 Alarm Sound — applies to all breaks
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {ALARM_SOUNDS.map(s => (
          <div key={s.id}
            onClick={() => onChange(s.id)}
            style={{
              flex: 1, padding: '8px 6px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
              border: `1px solid ${selected === s.id ? 'var(--accent)' : 'var(--border)'}`,
              background: selected === s.id ? 'var(--accent-soft)' : 'var(--bg)',
              transition: 'all 0.15s ease'
            }}>
            <div style={{ fontSize: 18, marginBottom: 3 }}>{s.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: selected === s.id ? 'var(--accent)' : 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{s.label}</div>
            <button
              onClick={e => { e.stopPropagation(); testSound(s.id) }}
              style={{ marginTop: 6, fontSize: 9, padding: '2px 8px', background: 'none', border: `1px solid ${selected === s.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 20, cursor: 'pointer', color: selected === s.id ? 'var(--accent)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              {testing === s.id ? '▶ playing...' : '▶ test'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Shift Card ─────────────────────────────────────────────
function ShiftCard({ shift, engine }) {
  const { status, remaining, startedAt, endedAt, theme: themeId, emoji, totalDuration, isMusicPlaying, musicVolume } = shift
  const isRunning = status === 'running'
  const isPaused  = status === 'paused'
  const isDone    = status === 'done' || (status !== 'idle' && remaining <= 0)

  const theme = SHIFT_THEMES.find(t => t.id === themeId) || SHIFT_THEMES[0]
  const pct = (totalDuration - Math.max(0, remaining)) / totalDuration
  const startedAtDate = startedAt ? new Date(startedAt) : null
  const endedAtDate   = endedAt   ? new Date(endedAt)   : null

  const emojis = ['🏢', '🎩', '🚀', '🐱', '🌈', '🌸', '🌊', '🔥', '💻', '☕']

  return (
    <div className="card animate-fadeIn" style={{
      marginBottom: 16, padding: '16px',
      border: `1px solid ${isRunning ? theme.border : 'var(--border)'}`,
      background: isRunning ? theme.bg : 'var(--surface)',
      transition: 'all 0.5s ease',
      position: 'relative',
      overflow: 'hidden',
      color: isRunning ? theme.color : 'var(--text-primary)'
    }}>
      <ShiftAnimation type={isRunning ? theme.animation : 'none'} />
      <AmbientPlayer type={theme.animation} isPlaying={isRunning && isMusicPlaying} volume={musicVolume} />
      
      {/* Ambient Player Visible UI */}
      {isMusicPlaying && isRunning && (
        <div style={{ 
          position: 'absolute', top: 12, right: 12, zIndex: 10, 
          display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px',
          background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(10px)', 
          borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ 
                width: 2, background: theme.accent, borderRadius: 1,
                animation: `epulse ${0.5 + i*0.2}s infinite ease-in-out` 
              }} />
            ))}
          </div>
          <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>
             Playing: {theme.label} {theme.animation === 'none' ? '(Silent)' : ''}
          </span>
        </div>
      )}

      {/* Background progress */}
      {isRunning && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, height: 3,
          width: `${pct * 100}%`, background: theme.accent,
          transition: 'width 1s linear', opacity: 0.8
        }} />
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, position: 'relative', zIndex: 1 }}>
        <div style={{ 
          width: 44, height: 44, borderRadius: 12, 
          background: isRunning ? 'rgba(255,255,255,0.1)' : 'var(--bg)', 
          border: `1px solid ${isRunning ? theme.border : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
        }}>
          {isDone ? '🎉' : emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 16, color: 'inherit' }}>Full 8-Hour Shift</div>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: isRunning ? 'rgba(255,255,255,0.7)' : 'var(--text-label)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {status === 'idle' ? 'Ready to work' : status === 'running' ? '⏱ Duty in Progress' : status === 'paused' ? '⏸ On Hold' : '✅ Shift Ended'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 800, fontSize: 18, color: isDone ? '#22C55E' : 'inherit' }}>
            {fmtCountdown(remaining)}
          </div>
          <div style={{ fontSize: 9, color: isRunning ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>REMAINING</div>
        </div>
      </div>

      {startedAtDate && (
        <div style={{ 
          display: 'flex', gap: 16, marginBottom: 14, padding: '8px 12px', 
          background: isRunning ? 'rgba(0,0,0,0.2)' : 'var(--bg)', 
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative', zIndex: 1
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: isRunning ? 'rgba(255,255,255,0.5)' : 'var(--text-label)', textTransform: 'uppercase' }}>Shift Started</div>
            <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'inherit', marginTop: 1 }}>{fmtTime(startedAtDate)}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: isRunning ? 'rgba(255,255,255,0.5)' : 'var(--text-label)', textTransform: 'uppercase' }}>{isDone ? 'Shift Ended' : 'Expected End'}</div>
            <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 700, color: isDone ? '#22C55E' : isRunning ? theme.accent : 'var(--accent)', marginTop: 1 }}>
              {isDone ? fmtTime(endedAtDate) : fmtTime(new Date(startedAtDate.getTime() + totalDuration * 1000))}
            </div>
          </div>
        </div>
      )}

      {/* Customization Section */}
      <div style={{ 
        marginBottom: 14, padding: '10px', background: isRunning ? 'rgba(0,0,0,0.1)' : 'var(--bg)', 
        borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', zIndex: 1
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: isRunning ? 'rgba(255,255,255,0.5)' : 'var(--text-label)', textTransform: 'uppercase', fontWeight: 700 }}>✨ Pro Settings & Style</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 9, color: isRunning ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}>Music:</span>
            <button onClick={engine.toggleMusic} style={{ 
              width: 32, height: 16, borderRadius: 10, background: isMusicPlaying ? theme.accent : 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', position: 'relative', transition: 'all 0.2s'
            }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: isMusicPlaying ? 18 : 2, transition: 'all 0.2s' }} />
            </button>
          </div>
        </div>
        
        {/* Duration Slider */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 9, minWidth: 60, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>SHIFT: {totalDuration / 3600}h</span>
          <input type="range" min="1" max="12" step="0.5" value={totalDuration / 3600} 
            onChange={e => engine.setShiftDuration(Number(e.target.value))}
            style={{ flex: 1, height: 4, accentColor: theme.accent, cursor: 'pointer' }} 
          />
        </div>

        {/* Music Controls (Explicit) */}
        {isMusicPlaying && (
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 9, minWidth: 60, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>VOLUME:</span>
            <input type="range" min="0" max="1" step="0.1" value={musicVolume} 
              onChange={e => engine.setMusicVolume(Number(e.target.value))}
              style={{ flex: 1, height: 4, accentColor: theme.accent, cursor: 'pointer' }} 
            />
          </div>
        )}

        {/* Theme Picker */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 8, overflowX: 'auto', paddingBottom: 4 }} className="hide-scrollbar">
          {SHIFT_THEMES.map(t => (
            <button key={t.id} onClick={() => engine.updateShiftTheme(t.id)} style={{
              flexShrink: 0, padding: '5px 10px', borderRadius: 8, fontSize: 10, fontFamily: 'Space Grotesk', fontWeight: 700, cursor: 'pointer',
              background: themeId === t.id ? t.bg : (isRunning ? 'rgba(255,255,255,0.05)' : 'var(--surface)'),
              border: `1px solid ${themeId === t.id ? t.border : 'transparent'}`,
              color: themeId === t.id ? (t.id === 'slate' ? '#fff' : '#fff') : (isRunning ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)'),
              transition: 'all 0.2s ease'
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Emoji Picker */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {emojis.map(e => (
            <button key={e} onClick={() => engine.updateShiftEmoji(e)} style={{
              width: 28, height: 28, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, cursor: 'pointer',
              background: emoji === e ? (isRunning ? 'rgba(255,255,255,0.2)' : 'var(--surface-2)') : 'transparent',
              border: `1px solid ${emoji === e ? 'rgba(255,255,255,0.3)' : 'transparent'}`,
              transition: 'all 0.15s ease'
            }}>
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Start Time Entry */}
      <div style={{ 
        marginBottom: 14, padding: '10px', background: isRunning ? 'rgba(0,0,0,0.1)' : 'var(--bg)', 
        borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)',
        position: 'relative', zIndex: 1
      }}>
        <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: isRunning ? 'rgba(255,255,255,0.5)' : 'var(--text-label)', textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>⏳ Set Shift Start Time</div>
        <div style={{ display: 'flex', gap: 6 }}>
          <input 
            type="time" 
            id="shift-start-input"
            defaultValue={startedAt ? new Date(startedAt).toTimeString().slice(0, 5) : "09:00"}
            style={{ 
              flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: 6, color: '#fff', fontSize: 12, padding: '4px 8px', outline: 'none' 
            }}
          />
          <button 
            onClick={() => {
              const val = document.getElementById('shift-start-input').value
              engine.setShiftStartTime(val)
            }}
            className="btn btn-brand" 
            style={{ padding: '0 12px', fontSize: 11, height: 28, background: theme.accent, color: '#000', border: 'none' }}
          >
            Update
          </button>
        </div>
        <div style={{ fontSize: 8, color: 'var(--text-muted)', marginTop: 4, fontFamily: 'JetBrains Mono' }}>
          Recalibrates the 8-hour timer from this moment.
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, position: 'relative', zIndex: 1 }}>
        {status === 'idle' && (
          <button onClick={engine.startShift} className="btn btn-brand" style={{ 
            flex: 1, justifyContent: 'center', height: 40, fontSize: 13, 
            background: isRunning ? theme.accent : 'var(--accent)', border: 'none', color: isRunning ? '#000' : '#fff'
          }}>▶ Start My Shift</button>
        )}
        {(isRunning || isPaused) && (
          <>
            {isRunning ? (
              <button onClick={engine.pauseShift} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', height: 40, color: 'inherit', borderColor: 'rgba(255,255,255,0.2)' }}>⏸ Pause</button>
            ) : (
              <button onClick={engine.startShift} className="btn btn-brand" style={{ flex: 1, justifyContent: 'center', height: 40 }}>▶ Resume</button>
            )}
            <button onClick={engine.finishShift} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', height: 40, color: 'inherit', borderColor: 'rgba(255,255,255,0.2)' }}>✅ Finish Now</button>
            <button onClick={engine.resetShift} className="btn btn-ghost" style={{ width: 40, height: 40, padding: 0, justifyContent: 'center', color: 'inherit', borderColor: 'rgba(255,255,255,0.2)' }} title="Reset">↺</button>
          </>
        )}
        {status === 'done' && (
          <>
            <button onClick={engine.stopChime} className="btn btn-brand" style={{ flex: 1, justifyContent: 'center', height: 40, background: '#EF4444', border: 'none' }}>🔇 Stop Alarm</button>
            <button onClick={engine.resetShift} className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', height: 40, color: 'inherit', borderColor: 'rgba(255,255,255,0.2)' }}>↺ Reset</button>
          </>
        )}
      </div>

      {/* Permission Button */}
      {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
        <button onClick={() => Notification.requestPermission()} className="btn btn-ghost" style={{ 
          width: '100%', marginTop: 12, fontSize: 10, height: 32, borderColor: 'rgba(255,255,255,0.1)', color: 'inherit', opacity: 0.8
        }}>
          🔔 Enable Desktop Notifications
        </button>
      )}
    </div>
  )
}

export default function BreakPage({ engine }) {
  const { breakStates, shift, selectedSound, setSelectedSound } = engine
  return (
    <div style={{ padding: '12px 13px' }}>
      <ShiftCard shift={shift} engine={engine} />
      
      <SoundPicker selected={selectedSound} onChange={setSelectedSound} />
      <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, marginTop: 4 }}>
        Break Timers
      </div>
      {BREAKS.map(b => (
        <BreakCard key={b.id} brk={b} state={breakStates[b.id]} engine={engine} />
      ))}
    </div>
  )
}
