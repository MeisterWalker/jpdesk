import { useState, useEffect, useCallback, useRef } from 'react'

const FREQUENCIES = [
  { id: 'weekly',      label: 'Weekly',       desc: 'Every week' },
  { id: 'biweekly',   label: 'Bi-Weekly',    desc: 'Every 2 weeks' },
  { id: 'semimonthly',label: 'Semi-Monthly', desc: 'Twice a month' },
  { id: 'monthly',    label: 'Monthly',      desc: 'Once a month' },
]

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function getPayDates(frequency, startDate, year, month) {
  const dates = new Set()
  if (!startDate) return dates

  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  const monthStart = new Date(year, month, 1)
  const monthEnd   = new Date(year, month + 1, 0)

  if (frequency === 'weekly') {
    // Find first occurrence of that weekday in or before monthStart
    let d = new Date(start)
    // Walk back to same weekday before or at monthStart
    while (d > monthEnd) d.setDate(d.getDate() - 7)
    while (d < monthStart) d.setDate(d.getDate() + 7)
    while (d <= monthEnd) {
      if (d >= monthStart) dates.add(d.getDate())
      d = new Date(d); d.setDate(d.getDate() + 7)
    }
  }

  if (frequency === 'biweekly') {
    let d = new Date(start)
    while (d > monthEnd) d.setDate(d.getDate() - 14)
    while (d < monthStart) d.setDate(d.getDate() + 14)
    while (d <= monthEnd) {
      if (d >= monthStart) dates.add(d.getDate())
      d = new Date(d); d.setDate(d.getDate() + 14)
    }
  }

  if (frequency === 'semimonthly') {
    // Use start date day as 1st pay, +15 days as 2nd pay (capped to last day)
    const day1 = start.getDate()
    const day2 = Math.min(day1 + 15, new Date(year, month + 1, 0).getDate())
    const lastDay = new Date(year, month + 1, 0).getDate()
    dates.add(Math.min(day1, lastDay))
    dates.add(Math.min(day2, lastDay))
  }

  if (frequency === 'monthly') {
    const day = start.getDate()
    const lastDay = new Date(year, month + 1, 0).getDate()
    dates.add(Math.min(day, lastDay))
  }

  return dates
}

const SHORT_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function getUpcomingPayDates(frequency, startDate, fromDate, count = 4) {
  if (!startDate) return []
  const results = []
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const from = new Date(fromDate)
  from.setHours(0, 0, 0, 0)

  if (frequency === 'weekly') {
    let d = new Date(start)
    while (d <= from) d.setDate(d.getDate() + 7)
    while (results.length < count) {
      results.push(new Date(d))
      d.setDate(d.getDate() + 7)
    }
  }

  if (frequency === 'biweekly') {
    let d = new Date(start)
    while (d <= from) d.setDate(d.getDate() + 14)
    while (results.length < count) {
      results.push(new Date(d))
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
              ? 'linear-gradient(135deg,#6366F1,#8B5CF6)'
              : isToday(d)
              ? 'rgba(99,102,241,0.12)'
              : 'transparent',
            color: isPay(d)
              ? '#fff'
              : isToday(d)
              ? '#818CF8'
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

  const payDates = getPayDates(frequency, startDate, viewYear, viewMonth)
  const upcomingDates = getUpcomingPayDates(frequency, startDate, startDate ? new Date(startDate) : today, 4)

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
        border: `1px solid ${focused ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
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
          JP<span style={{ background: 'linear-gradient(90deg,#6366F1,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Cal</span>
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
                      border: `1px solid ${frequency === f.id ? 'rgba(99,102,241,0.5)' : 'var(--border)'}`,
                      background: frequency === f.id ? 'rgba(99,102,241,0.15)' : 'var(--surface)',
                      color: frequency === f.id ? '#818CF8' : 'var(--text-muted)',
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
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 6 }}>
                ⏭ Next {upcomingDates.length} Paydays
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {upcomingDates.map((d, i) => {
                  const isNextPay = i === 0
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '5px 8px', borderRadius: 8,
                      background: isNextPay ? 'rgba(99,102,241,0.12)' : 'var(--surface)',
                      border: `1px solid ${isNextPay ? 'rgba(99,102,241,0.3)' : 'var(--border)'}`,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 10 }}>{isNextPay ? '💰' : '📆'}</span>
                        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11, color: isNextPay ? '#818CF8' : 'var(--text-primary)' }}>
                          {SHORT_DAYS[d.getDay()]}, {SHORT_MONTHS[d.getMonth()]} {d.getDate()}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, color: isNextPay ? '#818CF8' : 'var(--text-muted)', fontWeight: isNextPay ? 700 : 400 }}>
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
              <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: '#818CF8', fontWeight: 700 }}>
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
