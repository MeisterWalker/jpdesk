import { useState, useEffect, useCallback, useRef } from 'react'

const FREQUENCIES = [
  { id: 'weekly',      label: 'Weekly',       desc: 'Every week' },
  { id: 'biweekly',   label: 'Bi-Weekly',    desc: 'Every 2 weeks' },
  { id: 'semimonthly',label: 'Semi-Monthly', desc: 'Twice a month' },
  { id: 'monthly',    label: 'Monthly',      desc: 'Once a month' },
]

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// Timezone view options
// CST = customer's calendar day (no offset)
// PH  = when PH agent sees it (+1 day, since CST end-of-day = PH next morning)
const TZ_OPTIONS = [
  { id: 'cst', label: 'CST', flag: '🇺🇸', desc: "Customer's pay date" },
  { id: 'ph',  label: 'PH',  flag: '🇵🇭', desc: 'PH arrival day (+1)' },
]
const TZ_OFFSET = { cst: 0, ph: 1 }

// Parse a "YYYY-MM-DD" string as LOCAL midnight (not UTC) to avoid timezone day-shift bugs
function parseLocalDate(str) {
  if (!str) return null
  const [y, m, d] = str.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Add dayOffset to each computed date, then collect only those that fall in the target month
function applyOffset(rawDates, dayOffset, year, month) {
  if (dayOffset === 0) return rawDates
  const shifted = new Set()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  rawDates.forEach(day => {
    const d = new Date(year, month, day)
    d.setDate(d.getDate() + dayOffset)
    // Only keep if still in the same display month
    if (d.getFullYear() === year && d.getMonth() === month) {
      shifted.add(d.getDate())
    }
  })
  return shifted
}

function getPayDates(frequency, startDate, year, month, dayOffset = 0) {
  const rawDates = new Set()
  if (!startDate) return rawDates

  const start = parseLocalDate(startDate)
  start.setHours(0, 0, 0, 0)

  const monthStart = new Date(year, month, 1)
  const monthEnd   = new Date(year, month + 1, 0)

  if (frequency === 'weekly') {
    let d = new Date(start)
    while (d > monthEnd) d.setDate(d.getDate() - 7)
    while (d < monthStart) d.setDate(d.getDate() + 7)
    while (d <= monthEnd) {
      if (d >= monthStart) rawDates.add(d.getDate())
      d = new Date(d); d.setDate(d.getDate() + 7)
    }
  }

  if (frequency === 'biweekly') {
    let d = new Date(start)
    while (d > monthEnd) d.setDate(d.getDate() - 14)
    while (d < monthStart) d.setDate(d.getDate() + 14)
    while (d <= monthEnd) {
      if (d >= monthStart) rawDates.add(d.getDate())
      d = new Date(d); d.setDate(d.getDate() + 14)
    }
  }

  if (frequency === 'semimonthly') {
    const day1 = start.getDate()
    const day2 = Math.min(day1 + 15, new Date(year, month + 1, 0).getDate())
    const lastDay = new Date(year, month + 1, 0).getDate()
    rawDates.add(Math.min(day1, lastDay))
    rawDates.add(Math.min(day2, lastDay))
  }

  if (frequency === 'monthly') {
    const day = start.getDate()
    const lastDay = new Date(year, month + 1, 0).getDate()
    rawDates.add(Math.min(day, lastDay))
  }

  return applyOffset(rawDates, dayOffset, year, month)
}

const SHORT_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getUpcomingPayDates(frequency, startDate, fromDate, count = 4, dayOffset = 0) {
  if (!startDate) return []
  const results = []
  const start = parseLocalDate(startDate)
  start.setHours(0, 0, 0, 0)
  const from = new Date(fromDate)
  from.setHours(0, 0, 0, 0)

  if (frequency === 'weekly') {
    let d = new Date(start)
    while (d <= from) d.setDate(d.getDate() + 7)
    while (results.length < count) {
      const shifted = new Date(d); shifted.setDate(shifted.getDate() + dayOffset)
      results.push(shifted)
      d.setDate(d.getDate() + 7)
    }
  }

  if (frequency === 'biweekly') {
    let d = new Date(start)
    while (d <= from) d.setDate(d.getDate() + 14)
    while (results.length < count) {
      const shifted = new Date(d); shifted.setDate(shifted.getDate() + dayOffset)
      results.push(shifted)
      d.setDate(d.getDate() + 14)
    }
  }

  if (frequency === 'semimonthly') {
    const day1 = start.getDate()
    const day2 = day1 + 15
    let y = from.getFullYear(), m = from.getMonth()
    while (results.length < count) {
      const lastDay = new Date(y, m + 1, 0).getDate()
      const d1 = new Date(y, m, Math.min(day1, lastDay))
      const d2 = new Date(y, m, Math.min(day2, lastDay))
      d1.setDate(d1.getDate() + dayOffset)
      d2.setDate(d2.getDate() + dayOffset)
      if (d1 > from) results.push(d1)
      if (results.length < count && d2 > from) results.push(d2)
      m++; if (m > 11) { m = 0; y++ }
    }
  }

  if (frequency === 'monthly') {
    const day = start.getDate()
    let y = from.getFullYear(), m = from.getMonth()
    while (results.length < count) {
      const lastDay = new Date(y, m + 1, 0).getDate()
      const d = new Date(y, m, Math.min(day, lastDay))
      d.setDate(d.getDate() + dayOffset)
      if (d > from) results.push(d)
      m++; if (m > 11) { m = 0; y++ }
    }
  }

  return results.slice(0, count)
}

function CalendarGrid({ year, month, payDates, today }) {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const isToday = (d) => d && today.getFullYear() === year && today.getMonth() === month && today.getDate() === d
  const isPay   = (d) => d && payDates.has(d)

  return (
    <div style={{ padding: '0 10px 10px' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 3 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', fontWeight: 700, padding: '3px 0', letterSpacing: '0.04em' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {cells.map((d, i) => (
          <div key={i} style={{
            height: 28,
            borderRadius: 7,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11,
            fontFamily: 'JetBrains Mono',
            fontWeight: isPay(d) ? 800 : isToday(d) ? 700 : 400,
            background: isPay(d)
              ? 'linear-gradient(135deg,var(--accent),var(--accent-2))'
              : isToday(d)
              ? 'var(--accent-soft)'
              : 'transparent',
            color: isPay(d)
              ? '#fff'
              : isToday(d)
              ? 'var(--accent-muted)'
              : d ? 'var(--text-primary)' : 'transparent',
            border: isToday(d) && !isPay(d) ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
            boxShadow: isPay(d) ? '0 2px 8px rgba(99,102,241,0.35)' : 'none',
            transition: 'all 0.15s',
            position: 'relative',
          }}>
            {d || ''}
            {isPay(d) && (
              <span style={{ position: 'absolute', bottom: 2, right: 3, fontSize: 6, opacity: 0.8 }}>💰</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function JPCal({ focused = true, onFocus = () => {} }) {
  const today = new Date()
  const [expanded, setExpanded]     = useState(true)
  const [position, setPosition]     = useState({ x: window.innerWidth - 460, y: 90 })
  const [dragging, setDragging]     = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [viewYear, setViewYear]     = useState(today.getFullYear())
  const [viewMonth, setViewMonth]   = useState(today.getMonth())
  const [frequency, setFrequency]   = useState('weekly')
  const [startDate, setStartDate]   = useState('')
  const [tzView, setTzView]         = useState('cst')

  const dayOffset = TZ_OFFSET[tzView]
  const payDates = getPayDates(frequency, startDate, viewYear, viewMonth, dayOffset)
  const upcomingDates = getUpcomingPayDates(frequency, startDate, startDate ? parseLocalDate(startDate) : today, 4, dayOffset)

  // ── Drag ──────────────────────────────────────────────────
  const handleWidgetMouseDown = useCallback((e) => {
    onFocus()
    if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('select')) {
      setDragging(true)
      setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [position, onFocus])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => {
      setPosition({
        x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 240)),
        y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - (expanded ? 420 : 44))),
      })
    }
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragOffset, expanded])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const payCount = payDates.size

  return (
    <div
      data-theme="dark"
      onMouseDown={handleWidgetMouseDown}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: 240,
        zIndex: focused ? 9999 : 9990,
        borderRadius: expanded ? 18 : 12,
        background: 'var(--surface)',
        border: `1px solid ${focused ? 'var(--accent-border)' : 'var(--border)'}`,
        boxShadow: focused ? '0 8px 40px rgba(0,0,0,0.55)' : '0 4px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: dragging ? 'none' : 'border-radius 0.25s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
    >
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '11px 14px',
        background: 'var(--surface)',
        borderBottom: expanded ? '1px solid var(--border)' : 'none',
        cursor: dragging ? 'grabbing' : 'grab',
      }}>
        <span style={{ fontSize: 14 }}>📅</span>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          JP<span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Cal</span>
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            background: 'var(--surface-2)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer',
            width: 24, height: 24, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 11, flexShrink: 0,
          }}
          title={expanded ? 'Minimize' : 'Expand'}
        >
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>

          {/* ── Config panel ── */}
          <div style={{ padding: '10px 12px 8px', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>

            {/* Frequency selector */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, fontWeight: 700 }}>
                Pay Frequency
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                {FREQUENCIES.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setFrequency(f.id)}
                    style={{
                      padding: '5px 4px',
                      borderRadius: 8,
                      border: `1px solid ${frequency === f.id ? 'var(--accent-border)' : 'var(--border)'}`,
                      background: frequency === f.id ? 'var(--accent-soft)' : 'var(--surface)',
                      color: frequency === f.id ? 'var(--accent-muted)' : 'var(--text-muted)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 10,
                      fontWeight: frequency === f.id ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'center',
                    }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Start date */}
            <div>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, fontWeight: 700 }}>
                {frequency === 'weekly' || frequency === 'biweekly' ? 'First Pay Date' : 'First Pay Date'}
              </div>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--text-primary)',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 11,
                  boxSizing: 'border-box',
                  outline: 'none',
                  colorScheme: 'dark',
                }}
              />
            </div>

            {/* Timezone view toggle */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5, fontWeight: 700 }}>
                View As
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {TZ_OPTIONS.map(tz => (
                  <button
                    key={tz.id}
                    onClick={() => setTzView(tz.id)}
                    title={tz.desc}
                    style={{
                      flex: 1,
                      padding: '5px 4px',
                      borderRadius: 8,
                      border: `1px solid ${tzView === tz.id ? 'var(--accent-border)' : 'var(--border)'}`,
                      background: tzView === tz.id ? 'var(--accent-soft)' : 'var(--surface)',
                      color: tzView === tz.id ? 'var(--accent-muted)' : 'var(--text-muted)',
                      fontFamily: 'JetBrains Mono',
                      fontSize: 10,
                      fontWeight: tzView === tz.id ? 700 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      textAlign: 'center',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}
                  >
                    <span style={{ fontSize: 12 }}>{tz.flag}</span>
                    {tz.label}
                  </button>
                ))}
              </div>
              {tzView === 'ph' && (
                <div style={{ marginTop: 4, fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--accent-muted)', opacity: 0.8 }}>
                  ⚡ Showing CST payday +1 day (PH arrival)
                </div>
              )}
            </div>
          </div>

          {/* ── Month nav ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px', background: 'var(--surface)' }}>
            <button onClick={prevMonth} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>‹</button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>{MONTHS[viewMonth]}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: 'var(--text-label)' }}>{viewYear}</div>
            </div>
            <button onClick={nextMonth} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>›</button>
          </div>

          {/* ── Calendar grid ── */}
          <CalendarGrid year={viewYear} month={viewMonth} payDates={payDates} today={today} />

          {/* ── Upcoming paydays summary ── */}
          {startDate && upcomingDates.length > 0 && (
            <div style={{ padding: '8px 12px', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>⏭ Next {upcomingDates.length} Paydays</span>
                <span style={{ fontSize: 9, background: 'var(--accent-soft)', color: 'var(--accent-muted)', borderRadius: 5, padding: '1px 5px', fontWeight: 700 }}>
                  {TZ_OPTIONS.find(t => t.id === tzView)?.flag} {TZ_OPTIONS.find(t => t.id === tzView)?.label}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {upcomingDates.map((d, i) => {
                  const isNextPay = i === 0
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '5px 8px', borderRadius: 8,
                      background: isNextPay ? 'var(--accent-soft)' : 'var(--surface)',
                      border: `1px solid ${isNextPay ? 'var(--accent-border)' : 'var(--border)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10 }}>{isNextPay ? '💰' : '📆'}</span>
                        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11, color: isNextPay ? 'var(--accent-muted)' : 'var(--text-primary)' }}>
                          {SHORT_DAYS[d.getDay()]}, {SHORT_MONTHS[d.getMonth()]} {d.getDate()}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: isNextPay ? 'var(--accent-muted)' : 'var(--text-muted)', fontWeight: isNextPay ? 700 : 400 }}>
                        {d.getFullYear()}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Footer ── */}
          <div style={{ padding: '6px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.08em' }}>JPCAL v1.0</span>
            {payCount > 0 && startDate ? (
              <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--accent-muted)', fontWeight: 700 }}>
                💰 {payCount} pay day{payCount !== 1 ? 's' : ''} this month
              </span>
            ) : (
              <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)' }}>set a date to highlight</span>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
