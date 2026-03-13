import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const CATEGORIES = ['General Questions', 'FAQ', 'Other']

function parseVariables(text) {
  const matches = [...text.matchAll(/\[([^\]]+)\]/g)]
  return [...new Set(matches.map(m => m[1]))]
}

function fillVariables(text, vars) {
  let out = text
  Object.entries(vars).forEach(([k, v]) => { out = out.replaceAll(`[${k}]`, v || `[${k}]`) })
  return out
}

function CopyBtn({ getText }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(getText()); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <button onClick={copy} className={`btn btn-copy ${copied ? 'copied' : ''}`} style={{ padding: '5px 12px', fontSize: 11 }}>
      {copied ? '✓ Copied!' : '⎘ Copy'}
    </button>
  )
}

function ScriptCard({ script, onDelete, onEdit, onFavorite }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [collapsed, setCollapsed] = useState(true)
  const [vars, setVars] = useState({})
  const [showAI, setShowAI] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const variables = parseVariables(script.body)

  const checkGrammar = async () => {
    setAiLoading(true); setAiResult('')
    try {
      const prompt = `You are a BPO QA specialist. Review this customer service script for grammar, tone, clarity and professionalism. Be concise.

Script:
"""
${script.body}
"""

Format:
ISSUES: (bullet points or "None found")
REWRITE:
(improved version)`
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.REACT_APP_ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      if (!res.ok) { setAiResult('API Error ' + res.status + ': ' + JSON.stringify(data)); return }
      setAiResult(data.content?.[0]?.text || 'No response.')
    } catch (err) {
      console.error('AI Error:', err)
      const msg = err?.message || String(err)
      setAiResult('AI check failed: ' + msg)
    }
    setAiLoading(false)
  }

  return (
    <div className="card animate-fadeIn" style={{ marginBottom: 7, overflow: 'hidden' }}>

      {/* Title row — always visible */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 11px' }}>
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(v => !v)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 10, padding: '1px 3px', flexShrink: 0, transition: 'transform 0.2s', transform: collapsed ? 'none' : 'rotate(90deg)' }}>
          ▶
        </button>

        {script.is_favorite && <span style={{ fontSize: 11, color: '#F59E0B', flexShrink: 0 }}>★</span>}

        {/* Title + category — click to expand */}
        <div onClick={() => setCollapsed(v => !v)} style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {script.title}
          </div>
          <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', marginTop: 1 }}>{script.category}</div>
        </div>

        {/* Action buttons — always visible */}
        <div style={{ display: 'flex', gap: 2, alignItems: 'center', flexShrink: 0 }}>
          <CopyBtn getText={() => fillVariables(script.body, vars)} />
          <button onClick={() => onFavorite(script)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, opacity: script.is_favorite ? 1 : 0.3, padding: '2px 3px' }}>★</button>
          {/* 🤖 AI Check hidden — re-enable when credits are topped up */}
          <button onClick={() => onEdit(script)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, opacity: 0.5, padding: '2px 3px' }}>✏️</button>
          {confirmDelete ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#EF4444' }}>Delete?</span>
              <button onClick={() => { onDelete(script.id); setConfirmDelete(false) }} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, border: '1px solid #EF4444', background: 'rgba(239,68,68,0.12)', color: '#EF4444', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>Yes</button>
              <button onClick={() => setConfirmDelete(false)} style={{ fontSize: 10, padding: '2px 6px', borderRadius: 5, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>No</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, opacity: 0.65, padding: '2px 3px', filter: 'brightness(1.8)' }}>🗑</button>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {!collapsed && (
        <div className="animate-fadeIn" style={{ borderTop: '1px solid var(--border)', padding: '9px 13px 11px 28px' }}>
          <p style={{ fontSize: 12, color: 'var(--text-body)', lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: 8 }}>
            {script.body.split(/(\[[^\]]+\])/g).map((part, i) =>
              /^\[.+\]$/.test(part)
                ? <mark key={i} style={{ background: 'rgba(99,102,241,0.15)', color: '#6366F1', borderRadius: 3, padding: '0 2px', fontFamily: 'JetBrains Mono', fontSize: 11 }}>{part}</mark>
                : part
            )}
          </p>

          {variables.length > 0 && (
            <div style={{ marginBottom: 9 }}>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>Fill variables</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                {variables.map(v => (
                  <div key={v}>
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6366F1', marginBottom: 2 }}>[{v}]</div>
                    <input placeholder={`${v}...`} value={vars[v] || ''} onChange={e => setVars(p => ({ ...p, [v]: e.target.value }))} style={{ fontSize: 11, padding: '4px 8px' }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI Check panel hidden — re-enable when credits are topped up */}
        </div>
      )}
    </div>
  )
}

function ScriptForm({ initial, onSave, onCancel }) {
  const [title, setTitle] = useState(initial?.title || '')
  const [category, setCategory] = useState(initial?.category || CATEGORIES[0])
  const [body, setBody] = useState(initial?.body || '')
  const [saving, setSaving] = useState(false)
  const variables = parseVariables(body)

  const save = async () => {
    if (!body.trim() || !title.trim()) return
    setSaving(true)
    const payload = { title: title.trim(), category, body: body.trim(), is_favorite: initial?.is_favorite || false }
    if (initial?.id) { await supabase.from('canned_responses').update(payload).eq('id', initial.id) }
    else { await supabase.from('canned_responses').insert({ ...payload, user_id: (await supabase.auth.getUser()).data.user?.id, created_at: new Date().toISOString() }) }
    setSaving(false); onSave()
  }

  return (
    <div className="card animate-slideUp" style={{ padding: 13, marginBottom: 10 }}>
      <input placeholder="Script title *" value={title} onChange={e => setTitle(e.target.value)} style={{ marginBottom: 7, fontFamily: 'Space Grotesk', fontWeight: 600 }} />
      <select value={category} onChange={e => setCategory(e.target.value)} style={{ marginBottom: 7 }}>
        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
      </select>
      <textarea
        placeholder={`Write script here...\nUse [VARIABLE] for dynamic fields e.g. "Thank you [CUSTOMER NAME]!"`}
        value={body} onChange={e => setBody(e.target.value)}
        style={{ marginBottom: 5, minHeight: 100, fontSize: 12 }}
      />
      {variables.length > 0 && (
        <div style={{ marginBottom: 7, fontSize: 11, color: 'var(--text-muted)' }}>
          Variables: {variables.map(v => <mark key={v} style={{ background: 'rgba(99,102,241,0.15)', color: '#6366F1', borderRadius: 3, padding: '0 4px', marginLeft: 4, fontFamily: 'JetBrains Mono', fontSize: 10 }}>[{v}]</mark>)}
        </div>
      )}
      <div style={{ display: 'flex', gap: 7 }}>
        <button onClick={save} className="btn btn-brand" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saving...' : initial?.id ? 'Update' : 'Save Script'}</button>
        <button onClick={onCancel} className="btn btn-ghost">Cancel</button>
      </div>
    </div>
  )
}

export default function ScriptsPage() {
  const { user } = useAuth()
  const [scripts, setScripts] = useState([])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data } = await supabase.from('canned_responses').select('*').eq('user_id', user?.id).order('is_favorite', { ascending: false }).order('title', { ascending: true })
    setScripts(data || []); setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const handleDelete = async (id) => { await supabase.from('canned_responses').delete().eq('id', id); setScripts(p => p.filter(s => s.id !== id)) }
  const handleFavorite = async (s) => { await supabase.from('canned_responses').update({ is_favorite: !s.is_favorite }).eq('id', s.id); fetch() }

  const categories = ['All', 'Favorites', ...CATEGORIES]
  const filtered = scripts.filter(s => {
    const ms = !search || s.title?.toLowerCase().includes(search.toLowerCase()) || s.body?.toLowerCase().includes(search.toLowerCase())
    const mc = activeCategory === 'All' || (activeCategory === 'Favorites' ? s.is_favorite : s.category === activeCategory)
    return ms && mc
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Category tabs */}
      <div style={{ display: 'flex', gap: 3, padding: '8px 11px 0', overflowX: 'auto', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            style={{
              padding: '5px 9px', borderRadius: '6px 6px 0 0', whiteSpace: 'nowrap',
              background: activeCategory === cat ? 'var(--bg)' : 'transparent',
              border: activeCategory === cat ? '1px solid var(--border)' : '1px solid transparent',
              borderBottom: activeCategory === cat ? '1px solid var(--bg)' : 'none',
              marginBottom: activeCategory === cat ? -1 : 0,
              color: activeCategory === cat ? '#6366F1' : 'var(--text-muted)',
              fontSize: 11, fontWeight: activeCategory === cat ? 700 : 400,
              cursor: 'pointer', transition: 'var(--transition)', fontFamily: 'JetBrains Mono',
            }}>
            {cat === 'Favorites' ? '★ Faves' : cat}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 7, padding: '9px 12px', background: 'var(--bg)', flexShrink: 0 }}>
        <input placeholder="🔍 Search scripts..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, fontSize: 12 }} />
        <button onClick={() => { setAdding(true); setEditing(null) }} className="btn btn-brand" style={{ padding: '7px 11px', flexShrink: 0 }}>+ Script</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px 12px' }}>
        {adding && !editing && <ScriptForm onSave={() => { setAdding(false); fetch() }} onCancel={() => setAdding(false)} />}
        {editing && <ScriptForm initial={editing} onSave={() => { setEditing(null); fetch() }} onCancel={() => setEditing(null)} />}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 12 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{search ? 'No scripts match.' : 'No scripts yet!'}</div>
          </div>
        ) : filtered.map(s => <ScriptCard key={s.id} script={s} onDelete={handleDelete} onEdit={setEditing} onFavorite={handleFavorite} />)}
      </div>
    </div>
  )
}
