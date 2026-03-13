import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const TAG_COLORS = [
  { id: 'blue',   label: 'Info',   color: '#3B82F6' },
  { id: 'yellow', label: 'Remind', color: '#F59E0B' },
  { id: 'red',    label: 'Urgent', color: '#EF4444' },
  { id: 'green',  label: 'Done',   color: '#22C55E' },
  { id: 'purple', label: 'Ref',    color: '#8B5CF6' },
]

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={copy} className={`btn btn-copy ${copied ? 'copied' : ''}`} style={{ padding: '3px 8px', fontSize: 10 }}>
      {copied ? '✓ Copied' : '⎘ Copy'}
    </button>
  )
}

function NoteCard({ note, onPin, onDelete, onEdit }) {
  const [collapsed, setCollapsed] = useState(true)
  const tag = TAG_COLORS.find(t => t.id === note.color_tag)
  return (
    <div className="card animate-fadeIn" style={{ borderLeft: `3px solid ${tag?.color || '#6366F1'}`, marginBottom: 7, overflow: 'hidden' }}>
      {/* Title row — always visible */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 11px' }}>
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: '1px 3px', flexShrink: 0, transition: 'transform 0.2s', transform: collapsed ? 'none' : 'rotate(90deg)' }}>
          ▶
        </button>

        {note.pinned && <span style={{ fontSize: 10, color: '#6366F1', flexShrink: 0 }}>📌</span>}

        {/* Title — click to expand too */}
        <span onClick={() => setCollapsed(v => !v)}
          style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, cursor: 'pointer' }}>
          {note.title || 'Untitled'}
        </span>

        {tag && (
          <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 20, background: `${tag.color}22`, color: tag.color, fontFamily: 'JetBrains Mono', fontWeight: 700, flexShrink: 0 }}>
            {tag.label}
          </span>
        )}

        <div style={{ display: 'flex', gap: 2, flexShrink: 0, alignItems: 'center' }}>
          <CopyBtn text={note.content} />
          <button onClick={() => onPin(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, opacity: note.pinned ? 1 : 0.3, padding: '2px 3px' }}>📌</button>
          <button onClick={() => onEdit(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, opacity: 0.5, padding: '2px 3px' }}>✏️</button>
          <button onClick={() => onDelete(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, opacity: 0.4, padding: '2px 3px' }}>🗑</button>
        </div>
      </div>

      {/* Expanded content */}
      {!collapsed && (
        <div className="animate-fadeIn" style={{ padding: '0 11px 10px 28px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 8 }}>
            {note.content}
          </p>
          <div style={{ marginTop: 6, fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)' }}>
            {new Date(note.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}
    </div>
  )
}

function NoteForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [content, setContent] = useState(initial?.content || '')
  const [tag, setTag] = useState(initial?.color_tag || '')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!content.trim()) return
    setSaving(true)
    const payload = { title: title.trim(), content: content.trim(), color_tag: tag || null, pinned: initial?.pinned || false }
    if (initial?.id) {
      await supabase.from('notes').update(payload).eq('id', initial.id)
    } else {
      await supabase.from('notes').insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user?.id, created_at: new Date().toISOString() })
    }
    setSaving(false)
    onSave()
  }

  return (
    <div className="card animate-slideUp" style={{ padding: 13, marginBottom: 10 }}>
      <input placeholder="Note title (optional)" value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: 7, fontFamily: 'Space Grotesk', fontWeight: 600 }} />
      <textarea placeholder="Write your note here..." value={content} onChange={e => setContent(e.target.value)} style={{ marginBottom: 7, minHeight: 85 }} autoFocus />
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 9 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tag:</span>
        {TAG_COLORS.map(t => (
          <button key={t.id} onClick={() => setTag(tag === t.id ? '' : t.id)}
            style={{ width: 16, height: 16, borderRadius: '50%', background: t.color, border: tag === t.id ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', transition: 'var(--transition)' }}
            title={t.label} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 7 }}>
        <button onClick={save} className="btn btn-brand" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
          {saving ? 'Saving...' : initial?.id ? 'Update Note' : 'Save Note'}
        </button>
        <button onClick={onCancel} className="btn btn-ghost">Cancel</button>
      </div>
    </div>
  )
}

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('alpha')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('notes').select('*').eq('user_id', user?.id).order('pinned', { ascending: false }).order('created_at', { ascending: false })
    setNotes(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handlePin = async (note) => {
    await supabase.from('notes').update({ pinned: !note.pinned }).eq('id', note.id)
    fetch()
  }
  const handleDelete = async (id) => {
    await supabase.from('notes').delete().eq('id', id)
    setNotes(prev => prev.filter(n => n.id !== id))
  }

  const filtered = notes
    .filter(n => !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'alpha') return (a.title || 'Untitled').localeCompare(b.title || 'Untitled')
      if (sort === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      if (sort === 'oldest') return new Date(a.created_at) - new Date(b.created_at)
      return 0
    })
  const pinned = filtered.filter(n => n.pinned)
  const unpinned = filtered.filter(n => !n.pinned)

  return (
    <div style={{ padding: '12px 13px' }}>
      <div style={{ display: 'flex', gap: 7, marginBottom: 11 }}>
        <input placeholder="🔍 Search notes..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, fontSize: 12 }} />
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ fontSize: 11, padding: '6px 8px', width: 'auto', flexShrink: 0, fontFamily: 'JetBrains Mono' }}>
          <option value="alpha">A–Z</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
        <button onClick={() => { setAdding(true); setEditing(null) }} className="btn btn-brand" style={{ padding: '7px 11px', flexShrink: 0 }}>+ Note</button>
      </div>

      {adding && !editing && <NoteForm onSave={() => { setAdding(false); fetch() }} onCancel={() => setAdding(false)} />}
      {editing && <NoteForm initial={editing} onSave={() => { setEditing(null); fetch() }} onCancel={() => setEditing(null)} />}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 12 }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📝</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{search ? 'No notes match.' : 'No notes yet!'}</div>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', letterSpacing: '0.08em', marginBottom: 6, textTransform: 'uppercase' }}>📌 Pinned</div>
              {pinned.map(n => <NoteCard key={n.id} note={n} onPin={handlePin} onDelete={handleDelete} onEdit={setEditing} />)}
              {unpinned.length > 0 && <div className="divider" />}
            </>
          )}
          {unpinned.map(n => <NoteCard key={n.id} note={n} onPin={handlePin} onDelete={handleDelete} onEdit={setEditing} />)}
        </>
      )}
    </div>
  )
}
