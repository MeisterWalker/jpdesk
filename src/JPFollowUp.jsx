import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './context/AuthContext'

const PRIORITIES = [
  { id: 'urgent', label: 'Urgent', color: '#EF4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)' },
  { id: 'normal', label: 'Normal', color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  { id: 'low',    label: 'Low',    color: '#22C55E', bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.25)' },
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0) return `${d}d ago`
  if (h > 0) return `${h}h ago`
  if (m > 0) return `${m}m ago`
  return 'just now'
}

export default function JPFollowUp({ focused = true, onFocus = () => {} }) {
  const { user } = useAuth()
  const [expanded, setExpanded]   = useState(true)
  const [position, setPosition]   = useState({ x: window.innerWidth - 750, y: 90 })
  const [dragging, setDragging]   = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [followups, setFollowups] = useState([])
  const [showForm, setShowForm]   = useState(false)
  const [loading, setLoading]     = useState(false)

  // Form state
  const [appId, setAppId]         = useState('')
  const [custName, setCustName]   = useState('')
  const [note, setNote]           = useState('')
  const [priority, setPriority]   = useState('normal')
  const [dueDate, setDueDate]     = useState('')

  // Load from Supabase
  const load = useCallback(async () => {
    if (!user) return
    const { data } = await supabase
      .from('followups')
      .select('*')
      .eq('user_id', user.id)
      .eq('done', false)
      .order('created_at', { ascending: false })
    if (data) setFollowups(data)
  }, [user])

  useEffect(() => { load() }, [load])

  // Drag
  const handleWidgetMouseDown = useCallback((e) => {
    onFocus()
    if (!e.target.closest('button') && !e.target.closest('input') && !e.target.closest('textarea') && !e.target.closest('select')) {
      setDragging(true)
      setDragOffset({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [position, onFocus])

  useEffect(() => {
    if (!dragging) return
    const onMove = (e) => setPosition({
      x: Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 280)),
      y: Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 44)),
    })
    const onUp = () => setDragging(false)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [dragging, dragOffset])

  const addFollowup = async () => {
    if (!custName.trim() && !appId.trim()) return
    setLoading(true)
    await supabase.from('followups').insert({
      user_id: user.id,
      app_id: appId.trim(),
      customer_name: custName.trim(),
      note: note.trim(),
      priority,
      due_date: dueDate || null,
      done: false,
    })
    setAppId(''); setCustName(''); setNote(''); setPriority('normal'); setDueDate('')
    setShowForm(false)
    await load()
    setLoading(false)
  }

  const markDone = async (id) => {
    await supabase.from('followups').update({ done: true }).eq('id', id)
    setFollowups(f => f.filter(x => x.id !== id))
  }

  const deleteFollowup = async (id) => {
    await supabase.from('followups').delete().eq('id', id)
    setFollowups(f => f.filter(x => x.id !== id))
  }

  const pri = (id) => PRIORITIES.find(p => p.id === id) || PRIORITIES[1]

  return (
    <div
      data-theme="dark"
      onMouseDown={handleWidgetMouseDown}
      style={{
        position: 'fixed', left: position.x, top: position.y, width: 280,
        zIndex: focused ? 9999 : 9990,
        borderRadius: expanded ? 18 : 12,
        background: 'var(--surface)',
        border: `1px solid ${focused ? 'var(--accent-border)' : 'var(--border)'}`,
        boxShadow: focused ? '0 8px 40px rgba(0,0,0,0.55)' : '0 4px 20px rgba(0,0,0,0.3)',
        overflow: 'hidden',
        transition: dragging ? 'none' : 'border-radius 0.25s ease, box-shadow 0.2s ease',
        cursor: dragging ? 'grabbing' : 'default',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 14px', background: 'var(--surface)', borderBottom: expanded ? '1px solid var(--border)' : 'none', cursor: dragging ? 'grabbing' : 'grab' }}>
        <span style={{ fontSize: 14 }}>📌</span>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          JP<span style={{ background: 'linear-gradient(90deg,var(--accent),var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>FollowUp</span>
        </span>
        {followups.length > 0 && (
          <div style={{ background: '#EF4444', borderRadius: 99, minWidth: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#fff', fontFamily: 'JetBrains Mono', padding: '0 4px' }}>
            {followups.length}
          </div>
        )}
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setShowForm(v => !v)}
          style={{
            background: showForm ? 'var(--accent-border)' : 'var(--accent-soft)',
            border: '1px solid rgba(99,102,241,0.3)', borderRadius: 6,
            color: 'var(--accent-muted)', cursor: 'pointer', width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0,
          }}
          title="Add follow-up"
        >+</button>
        <button onClick={() => setExpanded(v => !v)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>
          {expanded ? '▼' : '▲'}
        </button>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: 480, overflow: 'hidden' }}>

          {/* Add Form */}
          {showForm && (
            <div style={{ padding: '10px 12px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 7 }}>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>New Follow-Up</div>

              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>App ID</div>
                  <input value={appId} onChange={e => setAppId(e.target.value)} placeholder="e.g. LN-2024-001"
                    style={{ width: '100%', padding: '5px 8px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 11, boxSizing: 'border-box', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Customer Name</div>
                  <input value={custName} onChange={e => setCustName(e.target.value)} placeholder="Full name"
                    style={{ width: '100%', padding: '5px 8px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 11, boxSizing: 'border-box', outline: 'none' }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Note</div>
                <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="What needs follow-up?" rows={2}
                  style={{ width: '100%', padding: '5px 8px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 11, boxSizing: 'border-box', outline: 'none', resize: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Priority</div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {PRIORITIES.map(p => (
                      <button key={p.id} onClick={() => setPriority(p.id)} style={{
                        flex: 1, padding: '4px 2px', borderRadius: 6, fontSize: 9, fontFamily: 'JetBrains Mono', fontWeight: 700, cursor: 'pointer',
                        background: priority === p.id ? p.bg : 'var(--surface)',
                        border: `1px solid ${priority === p.id ? p.border : 'var(--border)'}`,
                        color: priority === p.id ? p.color : 'var(--text-muted)',
                      }}>{p.label}</button>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 8, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>Due Date</div>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    style={{ width: '100%', padding: '4px 6px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 10, boxSizing: 'border-box', outline: 'none', colorScheme: 'dark' }} />
                </div>
              </div>

              <button onClick={addFollowup} disabled={loading || (!custName.trim() && !appId.trim())}
                style={{ padding: '7px', borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', border: 'none', color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
                {loading ? 'Saving...' : '📌 Add Follow-Up'}
              </button>
            </div>
          )}

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {followups.length === 0 && !showForm && (
              <div style={{ padding: '20px 12px', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textAlign: 'center', lineHeight: 1.7 }}>
                No follow-ups yet.<br />Click + to add one.
              </div>
            )}
            {followups.map(f => {
              const p = pri(f.priority)
              const isOverdue = f.due_date && new Date(f.due_date) < new Date()
              return (
                <div key={f.id} style={{ padding: '9px 12px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* App ID + Name */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3, flexWrap: 'wrap' }}>
                        {f.app_id && (
                          <span style={{ fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 700, color: 'var(--accent-muted)', background: 'var(--accent-soft)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 4, padding: '1px 5px' }}>
                            {f.app_id}
                          </span>
                        )}
                        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>
                          {f.customer_name || 'Unknown'}
                        </span>
                        <span style={{ fontFamily: 'JetBrains Mono', fontSize: 8, fontWeight: 700, color: p.color, background: p.bg, border: `1px solid ${p.border}`, borderRadius: 4, padding: '1px 5px' }}>
                          {p.label}
                        </span>
                      </div>

                      {/* Note */}
                      {f.note && (
                        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 4 }}>
                          {f.note}
                        </div>
                      )}

                      {/* Due date + time ago */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {f.due_date && (
                          <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: isOverdue ? '#EF4444' : 'var(--text-label)', fontWeight: isOverdue ? 700 : 400 }}>
                            {isOverdue ? '⚠️ ' : '📅 '}{new Date(f.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)' }}>{timeAgo(f.created_at)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => markDone(f.id)} title="Mark done" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 6, color: '#22C55E', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✓</button>
                      <button onClick={() => deleteFollowup(f.id)} title="Delete" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#F87171', cursor: 'pointer', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>✕</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: '6px 14px', borderTop: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.08em' }}>JPFOLLOWUP v1.0</span>
            <span style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)' }}>{followups.length} pending</span>
          </div>
        </div>
      )}
    </div>
  )
}
