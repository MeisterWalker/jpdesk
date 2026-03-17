import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { useAuth } from './context/AuthContext'

const TYPES = [
  { id: 'info',    label: 'Info',    emoji: '📢', color: 'var(--accent)', bg: 'var(--accent-soft)',  border: 'var(--accent-border)' },
  { id: 'warning', label: 'Warning', emoji: '⚠️', color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  { id: 'urgent',  label: 'Urgent',  emoji: '🚨', color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.3)' },
  { id: 'success', label: 'Success', emoji: '✅', color: '#22C55E', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)' },
]

export default function Announcements() {
  const { isAdmin, user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [showCompose, setShowCompose]     = useState(false)
  const [message, setMessage]             = useState('')
  const [type, setType]                   = useState('info')
  const [sending, setSending]             = useState(false)
  const [dismissed, setDismissed]         = useState(() => {
    try { return JSON.parse(localStorage.getItem('jpdesk_dismissed_announcements') || '[]') } catch { return [] }
  })

  const load = async () => {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(5)
    if (data) setAnnouncements(data)
  }

  useEffect(() => {
    load()
    // Realtime subscription
    const channel = supabase
      .channel('announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const send = async () => {
    if (!message.trim()) return
    setSending(true)
    await supabase.from('announcements').insert({ message: message.trim(), type, active: true, created_by: user.id })
    setMessage(''); setShowCompose(false)
    setSending(false)
  }

  const dismiss = (id) => {
    const next = [...dismissed, id]
    setDismissed(next)
    localStorage.setItem('jpdesk_dismissed_announcements', JSON.stringify(next))
  }

  const deactivate = async (id) => {
    await supabase.from('announcements').update({ active: false }).eq('id', id)
    setAnnouncements(a => a.filter(x => x.id !== id))
  }

  const visible = announcements.filter(a => !dismissed.includes(a.id))

  if (visible.length === 0 && !isAdmin) return null

  return (
    <div style={{ position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 99998, display: 'flex', flexDirection: 'column', gap: 6, width: 'min(520px, 90vw)', pointerEvents: 'none' }}>

      {/* Active announcements */}
      {visible.map(a => {
        const t = TYPES.find(x => x.id === a.type) || TYPES[0]
        return (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 12,
            background: t.bg, border: `1px solid ${t.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
            pointerEvents: 'all',
            animation: 'slideDown 0.3s ease',
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{t.emoji}</span>
            <div style={{ flex: 1, fontFamily: 'JetBrains Mono', fontSize: 12, color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.4 }}>{a.message}</div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {isAdmin && (
                <button onClick={() => deactivate(a.id)} title="Remove for everyone" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, color: '#F87171', cursor: 'pointer', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>✕</button>
              )}
              <button onClick={() => dismiss(a.id)} title="Dismiss" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 6, color: 'var(--text-muted)', cursor: 'pointer', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>–</button>
            </div>
          </div>
        )
      })}

      {/* Admin compose button */}
      {isAdmin && (
        <div style={{ pointerEvents: 'all' }}>
          {!showCompose ? (
            <button onClick={() => setShowCompose(true)} style={{
              width: '100%', padding: '7px 14px', borderRadius: 10,
              background: 'var(--accent-soft)', border: '1px dashed rgba(99,102,241,0.3)',
              color: 'var(--accent-muted)', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 700,
              cursor: 'pointer', letterSpacing: '0.04em',
            }}>
              📢 POST ANNOUNCEMENT
            </button>
          ) : (
            <div style={{ padding: '10px 12px', borderRadius: 12, background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>New Announcement</div>
              <div style={{ display: 'flex', gap: 5 }}>
                {TYPES.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)} style={{
                    flex: 1, padding: '5px 4px', borderRadius: 7, fontSize: 9, fontFamily: 'JetBrains Mono', fontWeight: 700, cursor: 'pointer', textAlign: 'center',
                    background: type === t.id ? t.bg : 'var(--surface-2)',
                    border: `1px solid ${type === t.id ? t.border : 'var(--border)'}`,
                    color: type === t.id ? t.color : 'var(--text-muted)',
                  }}>{t.emoji} {t.label}</button>
                ))}
              </div>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Type your announcement..." rows={2}
                style={{ width: '100%', padding: '7px 9px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontSize: 12, boxSizing: 'border-box', outline: 'none', resize: 'none' }} />
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => setShowCompose(false)} style={{ flex: 1, padding: '7px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontSize: 11, cursor: 'pointer' }}>Cancel</button>
                <button onClick={send} disabled={sending || !message.trim()} style={{ flex: 2, padding: '7px', borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--accent-2))', border: 'none', color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, cursor: 'pointer', opacity: sending ? 0.7 : 1 }}>
                  {sending ? 'Sending...' : '📢 Send to All'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes slideDown { from { opacity: 0; transform: translateY(-8px) } to { opacity: 1; transform: translateY(0) } }`}</style>
    </div>
  )
}
