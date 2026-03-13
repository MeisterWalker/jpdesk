import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function AdminPage() {
  const { isAdmin } = useAuth()
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState({ email: '', password: '', full_name: '', username: '', role: 'user' })
  const [saving, setSaving]     = useState(false)
  const [msg, setMsg]           = useState('')

  const fetchUsers = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at')
    setUsers(data || []); setLoading(false)
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const [syncing, setSyncing] = useState({})
  const [syncAll, setSyncAll] = useState(false)

  const syncUserData = async (userId) => {
    setSyncing(p => ({ ...p, [userId]: true }))
    setMsg('')

    try {
      // Get current user's own notes and scripts (admin is logged in)
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) throw new Error('Not logged in')

      // Get admin notes
      const { data: adminNotes, error: notesErr } = await supabase
        .from('notes').select('*').eq('user_id', currentUser.id)
      if (notesErr) throw notesErr

      // Get admin scripts
      const { data: adminScripts, error: scriptsErr } = await supabase
        .from('canned_responses').select('*').eq('user_id', currentUser.id)
      if (scriptsErr) throw scriptsErr

      // Get user's existing notes titles
      const { data: userNotes } = await supabase
        .from('notes').select('title').eq('user_id', userId)
      const existingNoteTitles = new Set((userNotes || []).map(n => n.title))

      // Get user's existing script titles
      const { data: userScripts } = await supabase
        .from('canned_responses').select('title').eq('user_id', userId)
      const existingScriptTitles = new Set((userScripts || []).map(s => s.title))

      // Insert new notes only
      const newNotes = (adminNotes || [])
        .filter(n => !existingNoteTitles.has(n.title))
        .map(({ id, user_id, ...rest }) => ({ ...rest, user_id: userId, created_at: new Date().toISOString() }))
      if (newNotes.length) {
        const { error } = await supabase.from('notes').insert(newNotes)
        if (error) throw error
      }

      // Insert new scripts only
      const newScripts = (adminScripts || [])
        .filter(s => !existingScriptTitles.has(s.title))
        .map(({ id, user_id, ...rest }) => ({ ...rest, user_id: userId, created_at: new Date().toISOString() }))
      if (newScripts.length) {
        const { error } = await supabase.from('canned_responses').insert(newScripts)
        if (error) throw error
      }

      const username = users.find(u => u.id === userId)?.username || 'user'
      setMsg(`✅ Synced ${username} — ${newNotes.length} notes, ${newScripts.length} scripts added.`)
    } catch (err) {
      setMsg('❌ Sync failed: ' + err.message)
    }

    setSyncing(p => ({ ...p, [userId]: false }))
  }

  const syncAllUsers = async () => {
    setSyncAll(true); setMsg('')
    const nonAdmins = users.filter(u => u.role !== 'admin')
    for (const u of nonAdmins) await syncUserData(u.id)
    setSyncAll(false)
    setMsg('✅ All users synced!')
  }

  const createUser = async () => {
    if (!form.email || !form.username) { setMsg('Email and username are required.'); return }
    setSaving(true); setMsg('')

    // Sign up the user with a temp session (service role not available in browser)
    // We use signUp with a random password they can reset later
    const tempPassword = form.password || Math.random().toString(36).slice(-10) + 'Aa1!'
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: tempPassword,
      options: {
        data: { username: form.username, full_name: form.full_name, role: form.role }
      }
    })

    if (error) { setMsg('Error: ' + error.message); setSaving(false); return }

    // Update the profile with correct role/name (trigger creates it, we update it)
    if (data?.user) {
      await supabase.from('profiles').upsert({
        id: data.user.id,
        username: form.username,
        full_name: form.full_name,
        role: form.role,
        seeded: false
      })
    }

    setMsg('✅ User created! Password: ' + tempPassword + ' — share this with them.')
    setForm({ email: '', password: '', full_name: '', username: '', role: 'user' })
    setShowForm(false)
    fetchUsers()
    setSaving(false)
  }

  if (!isAdmin) return (
    <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
      🔒 Admin access only.
    </div>
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
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', marginTop: 2 }}>Push your latest notes/scripts to all users</div>
          </div>
          <button onClick={syncAllUsers} disabled={syncAll || loading} className="btn btn-brand"
            style={{ fontSize: 11, padding: '5px 12px', background: syncAll ? 'var(--surface-2)' : undefined }}>
            {syncAll ? '⏳ Syncing...' : '🔄 Sync All'}
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
              <button onClick={() => syncUserData(u.id)} disabled={syncing[u.id]}
                className="btn btn-ghost" style={{ fontSize: 10, padding: '3px 8px' }}>
                {syncing[u.id] ? '⏳' : '🔄'}
              </button>
            )}
            <span style={{ fontSize: 9, padding: '2px 7px', borderRadius: 20, background: u.role === 'admin' ? 'rgba(99,102,241,0.15)' : 'var(--surface-2)', color: u.role === 'admin' ? '#6366F1' : 'var(--text-muted)', fontFamily: 'JetBrains Mono', fontWeight: 700, textTransform: 'uppercase' }}>
              {u.role}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}
