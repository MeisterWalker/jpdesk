import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const SCRIPT_CATEGORIES = ['General Questions', 'FAQ', 'Other']

// ── Sync Modal ───────────────────────────────────────────────────────────────
function SyncModal({ targetUser, onClose, onDone }) {
  const [syncNotes, setSyncNotes]       = useState(true)
  const [syncScripts, setSyncScripts]   = useState(true)
  const [scriptCats, setScriptCats]     = useState(new Set(SCRIPT_CATEGORIES))
  const [syncing, setSyncing]           = useState(false)
  const [result, setResult]             = useState(null)

  const toggleCat = (cat) => {
    setScriptCats(prev => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const run = async () => {
    setSyncing(true)
    setResult(null)
    try {
      const { data: { user: me } } = await supabase.auth.getUser()
      if (!me) throw new Error('Not logged in')

      let notesAdded = 0
      let scriptsAdded = 0

      if (syncNotes) {
        const { data: adminNotes } = await supabase.from('notes').select('*').eq('user_id', me.id)
        const { data: userNotes }  = await supabase.from('notes').select('title').eq('user_id', targetUser.id)
        const existing = new Set((userNotes || []).map(n => n.title))
        const toAdd = (adminNotes || []).filter(n => !existing.has(n.title))
          .map(({ id, user_id, ...rest }) => ({ ...rest, user_id: targetUser.id, created_at: new Date().toISOString() }))
        if (toAdd.length) { const { error } = await supabase.from('notes').insert(toAdd); if (error) throw error }
        notesAdded = toAdd.length
      }

      if (syncScripts && scriptCats.size > 0) {
        const { data: adminScripts } = await supabase.from('canned_responses').select('*').eq('user_id', me.id)
        const { data: userScripts }  = await supabase.from('canned_responses').select('title').eq('user_id', targetUser.id)
        const existing = new Set((userScripts || []).map(s => s.title))
        const toAdd = (adminScripts || [])
          .filter(s => scriptCats.has(s.category) && !existing.has(s.title))
          .map(({ id, user_id, ...rest }) => ({ ...rest, user_id: targetUser.id, created_at: new Date().toISOString() }))
        if (toAdd.length) { const { error } = await supabase.from('canned_responses').insert(toAdd); if (error) throw error }
        scriptsAdded = toAdd.length
      }

      setResult({ ok: true, notesAdded, scriptsAdded })
      onDone(`✅ Synced ${targetUser.username} — ${notesAdded} notes, ${scriptsAdded} scripts added.`)
    } catch (err) {
      setResult({ ok: false, msg: err.message })
    }
    setSyncing(false)
  }

  const btnBase = { fontSize: 10, padding: '4px 10px', borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', border: '1px solid var(--border)', transition: 'all 0.15s' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 18, width: '100%', maxWidth: 320 }}>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>🔄 Sync to {targetUser.username}</div>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginBottom: 14 }}>Choose what to sync</div>

        {/* Notes toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 11px', borderRadius: 9, border: `1px solid ${syncNotes ? 'rgba(99,102,241,0.35)' : 'var(--border)'}`, background: syncNotes ? 'rgba(99,102,241,0.06)' : 'var(--bg)', marginBottom: 8, cursor: 'pointer' }}
          onClick={() => setSyncNotes(v => !v)}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>📝 Notes</div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>Sync all notes</div>
          </div>
          <div style={{ width: 32, height: 18, borderRadius: 9, background: syncNotes ? '#6366F1' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: 2, left: syncNotes ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </div>
        </div>

        {/* Scripts toggle */}
        <div style={{ padding: '9px 11px', borderRadius: 9, border: `1px solid ${syncScripts ? 'rgba(99,102,241,0.35)' : 'var(--border)'}`, background: syncScripts ? 'rgba(99,102,241,0.06)' : 'var(--bg)', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: syncScripts ? 10 : 0 }}
            onClick={() => setSyncScripts(v => !v)}>
            <div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>📋 Scripts</div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>Sync by category</div>
            </div>
            <div style={{ width: 32, height: 18, borderRadius: 9, background: syncScripts ? '#6366F1' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 2, left: syncScripts ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
          </div>

          {syncScripts && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {SCRIPT_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => toggleCat(cat)} style={{
                  ...btnBase,
                  background: scriptCats.has(cat) ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: scriptCats.has(cat) ? '#6366F1' : 'var(--text-muted)',
                  border: `1px solid ${scriptCats.has(cat) ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                }}>
                  {scriptCats.has(cat) ? '✓ ' : ''}{cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Result */}
        {result && (
          <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 7, background: result.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: result.ok ? '#22C55E' : '#EF4444', fontSize: 11, fontFamily: 'JetBrains Mono' }}>
            {result.ok ? `✅ Done — ${result.notesAdded} notes, ${result.scriptsAdded} scripts added` : `❌ ${result.msg}`}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
            {result?.ok ? 'Close' : 'Cancel'}
          </button>
          {!result?.ok && (
            <button onClick={run} disabled={syncing || (!syncNotes && !syncScripts) || (syncScripts && scriptCats.size === 0)}
              className="btn btn-brand" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>
              {syncing ? '⏳ Syncing...' : '🔄 Sync Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sync All Modal ────────────────────────────────────────────────────────────
function SyncAllModal({ users, onClose, onDone }) {
  const [syncNotes, setSyncNotes]     = useState(true)
  const [syncScripts, setSyncScripts] = useState(true)
  const [scriptCats, setScriptCats]   = useState(new Set(SCRIPT_CATEGORIES))
  const [syncing, setSyncing]         = useState(false)
  const [result, setResult]           = useState(null)

  const toggleCat = (cat) => {
    setScriptCats(prev => { const next = new Set(prev); next.has(cat) ? next.delete(cat) : next.add(cat); return next })
  }

  const run = async () => {
    setSyncing(true); setResult(null)
    try {
      const { data: { user: me } } = await supabase.auth.getUser()
      if (!me) throw new Error('Not logged in')
      const nonAdmins = users.filter(u => u.role !== 'admin')
      let totalNotes = 0, totalScripts = 0

      for (const u of nonAdmins) {
        if (syncNotes) {
          const { data: adminNotes } = await supabase.from('notes').select('*').eq('user_id', me.id)
          const { data: userNotes }  = await supabase.from('notes').select('title').eq('user_id', u.id)
          const existing = new Set((userNotes || []).map(n => n.title))
          const toAdd = (adminNotes || []).filter(n => !existing.has(n.title))
            .map(({ id, user_id, ...rest }) => ({ ...rest, user_id: u.id, created_at: new Date().toISOString() }))
          if (toAdd.length) await supabase.from('notes').insert(toAdd)
          totalNotes += toAdd.length
        }
        if (syncScripts && scriptCats.size > 0) {
          const { data: adminScripts } = await supabase.from('canned_responses').select('*').eq('user_id', me.id)
          const { data: userScripts }  = await supabase.from('canned_responses').select('title').eq('user_id', u.id)
          const existing = new Set((userScripts || []).map(s => s.title))
          const toAdd = (adminScripts || [])
            .filter(s => scriptCats.has(s.category) && !existing.has(s.title))
            .map(({ id, user_id, ...rest }) => ({ ...rest, user_id: u.id, created_at: new Date().toISOString() }))
          if (toAdd.length) await supabase.from('canned_responses').insert(toAdd)
          totalScripts += toAdd.length
        }
      }
      setResult({ ok: true, totalNotes, totalScripts, count: nonAdmins.length })
      onDone(`✅ Synced ${nonAdmins.length} users — ${totalNotes} notes, ${totalScripts} scripts added.`)
    } catch (err) {
      setResult({ ok: false, msg: err.message })
    }
    setSyncing(false)
  }

  const btnBase = { fontSize: 10, padding: '4px 10px', borderRadius: 7, cursor: 'pointer', fontFamily: 'JetBrains Mono', border: '1px solid var(--border)', transition: 'all 0.15s' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 18, width: '100%', maxWidth: 320 }}>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>🔄 Sync All Users</div>
        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', marginBottom: 14 }}>Choose what to sync to everyone</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 11px', borderRadius: 9, border: `1px solid ${syncNotes ? 'rgba(99,102,241,0.35)' : 'var(--border)'}`, background: syncNotes ? 'rgba(99,102,241,0.06)' : 'var(--bg)', marginBottom: 8, cursor: 'pointer' }}
          onClick={() => setSyncNotes(v => !v)}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>📝 Notes</div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>Sync all notes</div>
          </div>
          <div style={{ width: 32, height: 18, borderRadius: 9, background: syncNotes ? '#6366F1' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ position: 'absolute', top: 2, left: syncNotes ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
          </div>
        </div>

        <div style={{ padding: '9px 11px', borderRadius: 9, border: `1px solid ${syncScripts ? 'rgba(99,102,241,0.35)' : 'var(--border)'}`, background: syncScripts ? 'rgba(99,102,241,0.06)' : 'var(--bg)', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', marginBottom: syncScripts ? 10 : 0 }}
            onClick={() => setSyncScripts(v => !v)}>
            <div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>📋 Scripts</div>
              <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)' }}>Sync by category</div>
            </div>
            <div style={{ width: 32, height: 18, borderRadius: 9, background: syncScripts ? '#6366F1' : 'var(--border)', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 2, left: syncScripts ? 14 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
          </div>
          {syncScripts && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {SCRIPT_CATEGORIES.map(cat => (
                <button key={cat} onClick={() => toggleCat(cat)} style={{
                  ...btnBase,
                  background: scriptCats.has(cat) ? 'rgba(99,102,241,0.15)' : 'transparent',
                  color: scriptCats.has(cat) ? '#6366F1' : 'var(--text-muted)',
                  border: `1px solid ${scriptCats.has(cat) ? 'rgba(99,102,241,0.4)' : 'var(--border)'}`,
                }}>
                  {scriptCats.has(cat) ? '✓ ' : ''}{cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {result && (
          <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 7, background: result.ok ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: result.ok ? '#22C55E' : '#EF4444', fontSize: 11, fontFamily: 'JetBrains Mono' }}>
            {result.ok ? `✅ Done — ${result.totalNotes} notes, ${result.totalScripts} scripts across ${result.count} users` : `❌ ${result.msg}`}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 11 }}>
            {result?.ok ? 'Close' : 'Cancel'}
          </button>
          {!result?.ok && (
            <button onClick={run} disabled={syncing || (!syncNotes && !syncScripts) || (syncScripts && scriptCats.size === 0)}
              className="btn btn-brand" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }}>
              {syncing ? '⏳ Syncing...' : '🔄 Sync All'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { isAdmin } = useAuth()
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [form, setForm]           = useState({ email: '', password: '', full_name: '', username: '', role: 'user' })
  const [saving, setSaving]       = useState(false)
  const [msg, setMsg]             = useState('')
  const [syncTarget, setSyncTarget] = useState(null)   // single user sync modal
  const [showSyncAll, setShowSyncAll] = useState(false) // sync all modal

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setUsers(data || []); setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const createUser = async () => {
    if (!form.email || !form.username) { setMsg('Email and username are required.'); return }
    setSaving(true); setMsg('')
    const tempPassword = form.password || Math.random().toString(36).slice(-10) + 'Aa1!'
    const { data, error } = await supabase.auth.signUp({
      email: form.email, password: tempPassword,
      options: { data: { username: form.username, full_name: form.full_name, role: form.role } }
    })
    if (error) { setMsg('Error: ' + error.message); setSaving(false); return }
    if (data?.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, username: form.username, full_name: form.full_name, role: form.role, seeded: false })
    }
    setMsg('✅ User created! Password: ' + tempPassword + ' — share this with them.')
    setForm({ email: '', password: '', full_name: '', username: '', role: 'user' })
    setShowForm(false); fetchUsers(); setSaving(false)
  }

  if (!isAdmin) return (
    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>🔒 Admin access only.</div>
  )

  return (
    <div style={{ padding: '12px 13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>👥 User Management</div>
        <button onClick={() => setShowForm(v => !v)} className="btn btn-brand" style={{ fontSize: 11, padding: '5px 11px' }}>
          {showForm ? 'Cancel' : '+ Add User'}
        </button>
      </div>

      {msg && (
        <div style={{ marginBottom: 10, padding: '7px 10px', background: msg.startsWith('✅') ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: 8, fontSize: 12, color: msg.startsWith('✅') ? '#22C55E' : '#EF4444', fontFamily: 'JetBrains Mono' }}>
          {msg}
        </div>
      )}

      {/* Sync panel */}
      <div className="card" style={{ padding: '11px 13px', marginBottom: 12, background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>🔄 Sync Notes & Scripts</div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', marginTop: 2 }}>Choose what to push and to whom</div>
          </div>
          <button onClick={() => setShowSyncAll(true)} disabled={loading} className="btn btn-brand" style={{ fontSize: 11, padding: '5px 12px' }}>
            🔄 Sync All
          </button>
        </div>
      </div>

      {/* Add user form */}
      {showForm && (
        <div className="card animate-slideUp" style={{ padding: 13, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>New User</div>
          {[
            { key: 'full_name', label: 'Full Name',  placeholder: 'Juan dela Cruz' },
            { key: 'username',  label: 'Username',   placeholder: 'juan' },
            { key: 'email',     label: 'Email',      placeholder: 'juan@email.com', type: 'email' },
            { key: 'password',  label: 'Password (optional — auto-generated if blank)', placeholder: '••••••••', type: 'password' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 8 }}>
              <label style={{ display: 'block', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{f.label}</label>
              <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ fontSize: 12 }} />
            </div>
          ))}
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: 'block', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} style={{ fontSize: 12 }}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={createUser} disabled={saving} className="btn btn-brand" style={{ width: '100%', justifyContent: 'center' }}>
            {saving ? 'Creating...' : 'Create User'}
          </button>
        </div>
      )}

      {/* Users list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 12 }}>Loading...</div>
      ) : users.map(u => (
        <div key={u.id} className="card" style={{ marginBottom: 7, padding: '10px 13px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: u.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>
            {u.role === 'admin' ? '👑' : '👤'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{u.full_name || u.username}</div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', marginTop: 1 }}>@{u.username} · {u.role}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {u.role !== 'admin' && (
              <button onClick={() => setSyncTarget(u)} className="btn btn-ghost" style={{ fontSize: 10, padding: '3px 8px' }}>🔄</button>
            )}
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: u.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'var(--surface-2)', color: u.role === 'admin' ? '#6366F1' : 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700, textTransform: 'uppercase' }}>
              {u.role}
            </span>
          </div>
        </div>
      ))}

      {/* Modals */}
      {syncTarget && (
        <SyncModal
          targetUser={syncTarget}
          onClose={() => setSyncTarget(null)}
          onDone={(m) => { setMsg(m); setSyncTarget(null) }}
        />
      )}
      {showSyncAll && (
        <SyncAllModal
          users={users}
          onClose={() => setShowSyncAll(false)}
          onDone={(m) => { setMsg(m); setShowSyncAll(false) }}
        />
      )}
    </div>
  )
}
