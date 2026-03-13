import { useState, useEffect, useRef } from 'react'

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

export const ALARM_SOUNDS = [
  { id: 'radar',  label: 'Radar',       emoji: '📡', desc: 'Classic dun-dun-dun pulse' },
  { id: 'chime',  label: 'Soft Chime',  emoji: '🔔', desc: 'Gentle bell tones' },
  { id: 'digital',label: 'Digital',     emoji: '💻', desc: 'Retro rising beeps' },
]

function pad(n) { return String(n).padStart(2, '0') }
function fmtCountdown(secs) {
  const m = Math.floor(Math.abs(secs) / 60)
  const s = Math.abs(secs) % 60
  return `${pad(m)}:${pad(s)}`
}
function fmtTime(date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
}


// ── Timer engine hook — must live in App so it never unmounts ─────────
export function useBreakEngine() {
  const [breakStates, setBreakStates] = useState(() =>
    Object.fromEntries(BREAKS.map(b => [b.id, { ...INITIAL_BREAK_STATE, remaining: b.duration }]))
  )
  const [intervalState, setIntervalState] = useState({ lastBreak: null })
  const [selectedSound, setSelectedSound] = useState('radar')
  const intervalsRef = useRef({})   // { breakId: intervalId }
  const chimeRef     = useRef(null)
  const intervalTimerRef = useRef(null)

  const stopChime = () => {
    if (chimeRef.current) { clearInterval(chimeRef.current); chimeRef.current = null }
  }

  const playSound = (soundId, audioCtx) => {
    const now = audioCtx.currentTime
    if (soundId === 'radar') {
      ;[0, 0.22, 0.44, 0.66].forEach(t => {
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain()
        osc.type = 'sine'; osc.frequency.setValueAtTime(480, now + t)
        osc.frequency.linearRampToValueAtTime(520, now + t + 0.04)
        gain.gain.setValueAtTime(0, now + t); gain.gain.linearRampToValueAtTime(0.55, now + t + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18)
        osc.connect(gain); gain.connect(audioCtx.destination)
        osc.start(now + t); osc.stop(now + t + 0.2)
        const o2 = audioCtx.createOscillator(); const g2 = audioCtx.createGain()
        o2.type = 'sine'; o2.frequency.setValueAtTime(240, now + t)
        g2.gain.setValueAtTime(0, now + t); g2.gain.linearRampToValueAtTime(0.2, now + t + 0.01)
        g2.gain.exponentialRampToValueAtTime(0.001, now + t + 0.15)
        o2.connect(g2); g2.connect(audioCtx.destination); o2.start(now + t); o2.stop(now + t + 0.18)
      })
    }
    if (soundId === 'chime') {
      const bell = (freq, startT, vol) => {
        const o = audioCtx.createOscillator(); const g = audioCtx.createGain()
        o.type = 'sine'; o.frequency.setValueAtTime(freq, now + startT)
        o.frequency.exponentialRampToValueAtTime(freq * 0.95, now + startT + 0.05)
        g.gain.setValueAtTime(0, now + startT); g.gain.linearRampToValueAtTime(vol, now + startT + 0.01)
        g.gain.exponentialRampToValueAtTime(0.001, now + startT + 2.5)
        o.connect(g); g.connect(audioCtx.destination); o.start(now + startT); o.stop(now + startT + 2.6)
        const o2 = audioCtx.createOscillator(); const g2 = audioCtx.createGain()
        o2.type = 'sine'; o2.frequency.setValueAtTime(freq * 1.5, now + startT)
        g2.gain.setValueAtTime(0, now + startT); g2.gain.linearRampToValueAtTime(vol * 0.4, now + startT + 0.01)
        g2.gain.exponentialRampToValueAtTime(0.001, now + startT + 1.8)
        o2.connect(g2); g2.connect(audioCtx.destination); o2.start(now + startT); o2.stop(now + startT + 2.0)
      }
      bell(880, 0, 0.35); bell(660, 0.7, 0.28)
    }
    if (soundId === 'digital') {
      ;[440, 554, 659].forEach((freq, i) => {
        const t = i * 0.28
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain()
        osc.type = 'square'; osc.frequency.setValueAtTime(freq, now + t)
        gain.gain.setValueAtTime(0, now + t); gain.gain.linearRampToValueAtTime(0.18, now + t + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.25)
        osc.connect(gain); gain.connect(audioCtx.destination); osc.start(now + t); osc.stop(now + t + 0.28)
      })
    }
  }

  const startAlarm = (soundId) => {
    stopChime()
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      playSound(soundId, ctx)
      chimeRef.current = setInterval(() => {
        try {
          const ctx2 = new (window.AudioContext || window.webkitAudioContext)()
          playSound(soundId, ctx2)
          setTimeout(() => ctx2.close(), 3500)
        } catch(e) {}
      }, LOOP_INTERVALS[soundId] || 2000)
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
    updateBreak(id, () => ({ ...INITIAL_BREAK_STATE, remaining: BREAKS.find(b => b.id === id).duration }))
  }

  const resetInterval = () => {
    setIntervalState({ lastBreak: Date.now() })
  }

  // ── Master tick — runs always regardless of tab ──
  useEffect(() => {
    const tick = setInterval(() => {
      setBreakStates(prev => {
        let next = { ...prev }
        let alarmId = null
        Object.keys(next).forEach(id => {
          const s = next[id]
          if (s.status === 'running') {
            const newRemaining = s.remaining - 1
            if (newRemaining <= 0) {
              next[id] = { ...s, status: 'overbreak', remaining: 0, endedAt: new Date() }
              alarmId = s._soundId || selectedSound
            } else {
              next[id] = { ...s, remaining: newRemaining }
            }
          } else if (s.status === 'overbreak') {
            next[id] = { ...s, remaining: s.remaining - 1 }
          }
        })
        if (alarmId) setTimeout(() => startAlarm(alarmId), 0)
        return next
      })
    }, 1000)
    return () => clearInterval(tick)
  }, [selectedSound])

  // ── Interval tracker tick ──
  useEffect(() => {
    intervalTimerRef.current = setInterval(() => {
      setIntervalState(prev => prev.lastBreak ? { ...prev, _tick: Date.now() } : prev)
    }, 1000)
    return () => clearInterval(intervalTimerRef.current)
  }, [])

  return { breakStates, intervalState, selectedSound, setSelectedSound, startBreak, pauseBreak, finishBreak, resetBreak, resetInterval, stopChime }
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

// ── 2-hour interval reminder ───────────────────────────────
function IntervalReminder({ state, onReset }) {
  const TARGET = 2 * 60 * 60
  const elapsed = state.lastBreak ? Math.floor((Date.now() - state.lastBreak) / 1000) : 0

  const pct = Math.min(1, elapsed / TARGET)
  const remaining = Math.max(0, TARGET - elapsed)
  const overdue = elapsed > TARGET

  return (
    <div className="card" style={{ marginBottom: 10, padding: '12px 14px', border: `1px solid ${overdue ? 'rgba(239,68,68,0.4)' : 'var(--border)'}`, background: overdue ? 'rgba(239,68,68,0.05)' : 'var(--surface)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 13, color: overdue ? '#EF4444' : 'var(--text-primary)' }}>⏰ Break Interval Tracker</div>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', marginTop: 2 }}>Break every 2 hours</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)' }}>{overdue ? 'OVERDUE' : 'NEXT BREAK IN'}</div>
          <div style={{ fontSize: 16, fontFamily: 'JetBrains Mono', fontWeight: 800, color: overdue ? '#EF4444' : '#6366F1', marginTop: 1 }}>
            {state.lastBreak ? fmtCountdown(remaining || elapsed - TARGET) : '--:--'}
          </div>
        </div>
      </div>
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, marginBottom: 10, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct * 100}%`, background: overdue ? '#EF4444' : 'linear-gradient(90deg, #6366F1, #8B5CF6)', borderRadius: 99, transition: 'width 1s linear' }} />
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button onClick={onReset} className="btn btn-brand" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>
          🔄 Reset Interval (just returned)
        </button>
        {state.lastBreak && (
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', flexShrink: 0 }}>
            Last: {fmtTime(new Date(state.lastBreak))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sound Picker ──────────────────────────────────────────
function SoundPicker({ selected, onChange }) {
  const [testing, setTesting] = useState(null)

  const testSound = (id) => {
    setTesting(id)
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const now = ctx.currentTime
      if (id === 'radar') {
        ;[0, 0.22, 0.44, 0.66].forEach(t => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain()
          osc.type = 'sine'; osc.frequency.setValueAtTime(480, now + t)
          osc.frequency.linearRampToValueAtTime(520, now + t + 0.04)
          gain.gain.setValueAtTime(0, now + t); gain.gain.linearRampToValueAtTime(0.55, now + t + 0.01)
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18)
          osc.connect(gain); gain.connect(ctx.destination)
          osc.start(now + t); osc.stop(now + t + 0.2)
        })
        setTimeout(() => setTesting(null), 1000)
      }
      if (id === 'chime') {
        const bell = (freq, startT, vol) => {
          const o = ctx.createOscillator(); const g = ctx.createGain()
          o.type = 'sine'; o.frequency.setValueAtTime(freq, now + startT)
          g.gain.setValueAtTime(0, now + startT); g.gain.linearRampToValueAtTime(vol, now + startT + 0.01)
          g.gain.exponentialRampToValueAtTime(0.001, now + startT + 2.5)
          o.connect(g); g.connect(ctx.destination); o.start(now + startT); o.stop(now + startT + 2.6)
        }
        bell(880, 0, 0.35); bell(660, 0.7, 0.28)
        setTimeout(() => setTesting(null), 2000)
      }
      if (id === 'digital') {
        ;[440, 554, 659].forEach((freq, i) => {
          const t = i * 0.28
          const osc = ctx.createOscillator(); const gain = ctx.createGain()
          osc.type = 'square'; osc.frequency.setValueAtTime(freq, now + t)
          gain.gain.setValueAtTime(0, now + t); gain.gain.linearRampToValueAtTime(0.18, now + t + 0.01)
          gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.25)
          osc.connect(gain); gain.connect(ctx.destination); osc.start(now + t); osc.stop(now + t + 0.28)
        })
        setTimeout(() => setTesting(null), 1200)
      }
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
              border: `1px solid ${selected === s.id ? '#6366F1' : 'var(--border)'}`,
              background: selected === s.id ? 'rgba(99,102,241,0.1)' : 'var(--bg)',
              transition: 'all 0.15s ease'
            }}>
            <div style={{ fontSize: 18, marginBottom: 3 }}>{s.emoji}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: selected === s.id ? '#6366F1' : 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{s.label}</div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginTop: 2, lineHeight: 1.3 }}>{s.desc}</div>
            <button
              onClick={e => { e.stopPropagation(); testSound(s.id) }}
              style={{ marginTop: 6, fontSize: 9, padding: '2px 8px', background: 'none', border: `1px solid ${selected === s.id ? '#6366F1' : 'var(--border)'}`, borderRadius: 20, cursor: 'pointer', color: selected === s.id ? '#6366F1' : 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>
              {testing === s.id ? '▶ playing...' : '▶ test'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function BreakPage({ engine }) {
  const { breakStates, intervalState, selectedSound, setSelectedSound, resetInterval } = engine
  return (
    <div style={{ padding: '12px 13px' }}>
      <IntervalReminder state={intervalState} onReset={resetInterval} />
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
