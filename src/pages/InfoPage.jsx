import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'


const BRANDS = [
  { id: 'birch',  name: 'Birch Lending',       short: 'BL',  color: '#0D9488', soft: 'rgba(13,148,136,0.1)',  border: 'rgba(13,148,136,0.25)', emoji: '🌿' },
  { id: 'minto',  name: 'Minto Money',          short: 'MM',  color: '#16A34A', soft: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.25)',  emoji: '💚' },
  { id: 'sticks', name: 'Three Sticks Lending', short: 'TSL', color: '#C2410C', soft: 'rgba(194,65,12,0.1)',   border: 'rgba(194,65,12,0.25)', emoji: '🔥' },
  { id: 'willow', name: 'Willow Lake Lending',  short: 'WLL', color: '#166534', soft: 'rgba(22,101,52,0.12)',  border: 'rgba(22,101,52,0.3)',  emoji: '🌲' },
  { id: 'deer',   name: 'Deer Creek Lending',   short: 'DCL', color: '#F87171', soft: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)', emoji: '🦌' },
]

const DEPT_TYPES = ['Customer Service', 'Collections', 'Fraud', 'Payments', 'Disputes', 'Operations', 'Supervisor', 'Other']

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <button onClick={copy} className={`btn btn-copy ${copied ? 'copied' : ''}`} style={{ padding: '2px 8px', fontSize: 10, flexShrink: 0 }}>
      {copied ? '✓' : '⎘'}
    </button>
  )
}

// ── Reusable dept row editor (phones OR emails) ────────────
function DeptListEditor({ label, icon, items, onChange, placeholder }) {
  const add = () => onChange([...items, { type: 'Customer Service', value: '' }])
  const update = (i, k, v) => onChange(items.map((item, idx) => idx === i ? { ...item, [k]: v } : item))
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i))

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
          {icon} {label}
        </div>
        <button onClick={add} className="btn btn-ghost" style={{ fontSize: 10, padding: '2px 8px' }}>+ Add</button>
      </div>
      {items.length === 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '6px 0' }}>None added. Click + Add.</div>
      )}
      {items.map((item, i) => (
        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 6, marginBottom: 7, alignItems: 'center' }}>
          <select
            value={item.type}
            onChange={e => update(i, 'type', e.target.value)}
            style={{ fontSize: 11, padding: '6px 8px' }}
          >
            {DEPT_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
          <input
            value={item.value}
            onChange={e => update(i, 'value', e.target.value)}
            placeholder={placeholder}
            style={{ fontSize: 11, padding: '6px 8px' }}
          />
          <button onClick={() => remove(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444', fontSize: 14, padding: '2px 4px' }}>✕</button>
        </div>
      ))}
    </div>
  )
}

// ── Edit Modal ─────────────────────────────────────────────
function EditModal({ brand, info, onSave, onClose }) {
  const [phones, setPhones] = useState(info?.phones_list || [])
  const [emails, setEmails] = useState(info?.emails_list || [])
  const [address, setAddress] = useState(info?.address || '')
  const [website, setWebsite] = useState(info?.website || '')
  const [hours, setHours]     = useState(info?.hours   || '')
  const [notes, setNotes]     = useState(info?.notes   || '')
  const [saving, setSaving]   = useState(false)

  const save = async () => {
    if (saving) return
    setSaving(true)
    const payload = {
      brand_id:    brand.id,
      phones_list: JSON.stringify(phones),
      emails_list: JSON.stringify(emails),
      address,
      website,
      hours,
      notes,
    }
    const { error } = await supabase.from('brand_info').upsert(payload, { onConflict: 'brand_id' })
    if (error) { alert('Save failed: ' + error.message); setSaving(false); return }
    setSaving(false)
    onSave()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 16 }}>
      <div className="card animate-spring" style={{ width: '100%', maxWidth: 420, padding: 16, maxHeight: '88vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 15, color: brand.color }}>{brand.emoji} {brand.name}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}>✕</button>
        </div>

        <DeptListEditor
          label="Phone Numbers"
          icon="📞"
          items={phones}
          onChange={setPhones}
          placeholder="(000) 000-0000"
        />

        <div className="divider" />

        <DeptListEditor
          label="Email Addresses"
          icon="✉️"
          items={emails}
          onChange={setEmails}
          placeholder="dept@brand.com"
        />

        <div className="divider" />

        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, marginBottom: 10 }}>ℹ️ General Info</div>
          {[
            { label: 'Mailing Address',    key: 'address', val: address, set: setAddress, multi: true,  placeholder: 'Full mailing address' },
            { label: 'Website URL',        key: 'website', val: website, set: setWebsite, multi: false, placeholder: 'https://...' },
            { label: 'Hours of Operation', key: 'hours',   val: hours,   set: setHours,   multi: false, placeholder: 'Mon–Fri 8AM–8PM CST' },
            { label: 'Additional Notes',   key: 'notes',   val: notes,   set: setNotes,   multi: true,  placeholder: 'Extra info for agents...' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 9 }}>
              <label style={{ display: 'block', fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{f.label}</label>
              {f.multi
                ? <textarea value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{ minHeight: 55, fontSize: 12 }} />
                : <input    value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.placeholder} style={{ fontSize: 12 }} />
              }
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button onClick={save} className="btn btn-brand" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Brand Card ─────────────────────────────────────────────
function DeptRows({ items, color }) {
  if (!items || items.length === 0) return null
  return (
    <>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.type}</div>
            <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono', fontWeight: 700, color: 'var(--text-primary)', marginTop: 1 }}>{item.value}</div>
          </div>
          <CopyBtn text={item.value} />
        </div>
      ))}
    </>
  )
}

function BrandCard({ brand, info, onEdit, isAdmin }) {
  const [expanded, setExpanded] = useState(false)
  const phones = info?.phones_list || []
  const emails = info?.emails_list || []
  const hasInfo = phones.length > 0 || emails.length > 0 || info?.address || info?.website || info?.hours

  return (
    <div className="animate-fadeIn" style={{ marginBottom: 8, border: `1px solid ${expanded ? brand.border : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s ease' }}>
      <button onClick={() => setExpanded(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', background: expanded ? brand.soft : 'var(--surface)', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: brand.soft, border: `1px solid ${brand.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {brand.emoji}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: brand.color }}>{brand.name}</div>
          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', marginTop: 1 }}>
            {hasInfo ? `${phones.length} number${phones.length !== 1 ? 's' : ''} · ${emails.length} email${emails.length !== 1 ? 's' : ''}` : 'No info yet'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {isAdmin && (
            <button onClick={e => { e.stopPropagation(); onEdit(brand, info) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, opacity: 0.55, padding: '2px 4px' }}>✏️</button>
          )}
          <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'inline-block', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>▼</span>
        </div>
      </button>

      {expanded && (
        <div className="animate-slideUp" style={{ background: 'var(--bg)', padding: '6px 13px 12px' }}>
          {!hasInfo ? (
            <div style={{ padding: '14px 0', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              No information yet.{isAdmin ? ' Click ✏️ to add.' : ' Ask JP to add it.'}
            </div>
          ) : (
            <>
              {phones.length > 0 && (
                <div style={{ marginBottom: phones.length && emails.length ? 10 : 0 }}>
                  <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: brand.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, marginTop: 6, fontWeight: 700 }}>📞 Numbers</div>
                  <DeptRows items={phones} color={brand.color} />
                </div>
              )}

              {emails.length > 0 && (
                <div style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: brand.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, marginTop: phones.length ? 10 : 6, fontWeight: 700 }}>✉️ Emails</div>
                  <DeptRows items={emails} color={brand.color} />
                </div>
              )}

              {[
                { label: 'Address', value: info.address },
                { label: 'Website', value: info.website },
                { label: 'Hours',   value: info.hours   },
              ].filter(r => r.value).map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-body)', marginTop: 1, lineHeight: 1.5 }}>{r.value}</div>
                  </div>
                  <CopyBtn text={r.value} />
                </div>
              ))}

              {info.notes && (
                <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 12, color: 'var(--text-body)', lineHeight: 1.6 }}>
                  📌 {info.notes}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── Password Gate ──────────────────────────────────────────
function PasswordGate({ onUnlock, onClose }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const check = () => { pw === ADMIN_PASSWORD ? onUnlock() : (setError(true), setPw('')) }
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999, padding: 16 }}>
      <div className="card animate-spring" style={{ width: '100%', maxWidth: 300, padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>Admin Access</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14 }}>Enter password to edit brand info</div>
        <input type="password" placeholder="Password" value={pw}
          onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
          style={{ marginBottom: 6, textAlign: 'center', borderColor: error ? '#EF4444' : undefined }} autoFocus />
        {error && <div style={{ fontSize: 11, color: '#EF4444', marginBottom: 8 }}>Incorrect password</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={check} className="btn btn-brand" style={{ flex: 1, justifyContent: 'center' }}>Unlock</button>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
        </div>
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────
export default function InfoPage() {
  const { isAdmin } = useAuth()
  const [infos, setInfos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [showPwGate, setShowPwGate] = useState(false)

  const fetchInfos = useCallback(async () => {
    const { data, error } = await supabase.from('brand_info').select('*')
    if (error) { console.error(error); setLoading(false); return }
    const parsed = (data || []).map(row => {
      // Parse phones_list — also migrate legacy 'departments' column
      let phones_list = []
      if (row.phones_list) {
        phones_list = typeof row.phones_list === 'string' ? JSON.parse(row.phones_list || '[]') : (row.phones_list || [])
      } else if (row.departments) {
        // Migrate old departments format: {type, number} → {type, value}
        const old = typeof row.departments === 'string' ? JSON.parse(row.departments || '[]') : (row.departments || [])
        phones_list = old.map(d => ({ type: d.type, value: d.number || d.value || '' }))
      }

      // Parse emails_list — also migrate legacy 'emails' text column and 'dept_emails'
      let emails_list = []
      if (row.emails_list) {
        emails_list = typeof row.emails_list === 'string' ? JSON.parse(row.emails_list || '[]') : (row.emails_list || [])
      } else if (row.dept_emails) {
        const old = typeof row.dept_emails === 'string' ? JSON.parse(row.dept_emails || '[]') : (row.dept_emails || [])
        emails_list = old.map(d => ({ type: d.type, value: d.email || d.value || '' }))
      } else if (row.emails) {
        // Legacy plain text email — convert to single entry
        emails_list = [{ type: 'Customer Service', value: row.emails }]
      }

      return { ...row, phones_list, emails_list }
    })
    setInfos(parsed)
    setLoading(false)
  }, [])

  useEffect(() => { fetchInfos() }, [fetchInfos])

  const handleEdit = (brand, info) => {
    if (!isAdmin) return
    setEditTarget({ brand, info })
  }

  const getInfo = (brandId) => infos.find(i => i.brand_id === brandId)

  return (
    <div style={{ padding: '12px 13px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap a brand to expand</div>
        {isAdmin && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6366F1', padding: '3px 9px' }}>👑 Admin Mode</span>}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 12 }}>Loading...</div>
      ) : (
        BRANDS.map(brand => (
          <BrandCard key={brand.id} brand={brand} info={getInfo(brand.id)} onEdit={handleEdit} isAdmin={isAdmin} />
        ))
      )}

      {editTarget && (
        <EditModal
          brand={editTarget.brand}
          info={editTarget.info}
          onSave={() => { setEditTarget(null); fetchInfos() }}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
