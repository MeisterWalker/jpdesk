import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

const BRANDS = [
  { id: 'birch',  name: 'Birch Lending',       short: 'BL',  color: '#0D9488', soft: 'rgba(13,148,136,0.1)',   border: 'rgba(13,148,136,0.25)',  emoji: '🌿' },
  { id: 'minto',  name: 'Minto Money',          short: 'MM',  color: '#16A34A', soft: 'rgba(22,163,74,0.1)',    border: 'rgba(22,163,74,0.25)',   emoji: '💚' },
  { id: 'sticks', name: 'Three Sticks Lending', short: 'TSL', color: '#C2410C', soft: 'rgba(194,65,12,0.1)',    border: 'rgba(194,65,12,0.25)',   emoji: '🔥' },
  { id: 'willow', name: 'Willow Lake Lending',  short: 'WLL', color: '#166534', soft: 'rgba(22,101,52,0.12)',   border: 'rgba(22,101,52,0.3)',    emoji: '🌲' },
  { id: 'deer',   name: 'Deer Creek Lending',   short: 'DCL', color: '#F87171', soft: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)', emoji: '🦌' },
]

const DEPT_TYPES = ['Customer Service', 'Collections', 'Fraud', 'Payments', 'Disputes', 'Operations', 'Supervisor', 'Other']

const BANKS = [
  // ── Major Banks ──────────────────────────────────────────────────────────
  { id: 'wellsfargo', cat: 'bank', name: 'Wells Fargo',      emoji: '🏦', color: '#D4111E', soft: 'rgba(212,17,30,0.08)',  border: 'rgba(212,17,30,0.2)',  number: '1-800-869-3557' },
  { id: 'chase',      cat: 'bank', name: 'Chase',            emoji: '🏛️', color: '#117ACA', soft: 'rgba(17,122,202,0.08)', border: 'rgba(17,122,202,0.2)', number: '1-800-935-9935' },
  { id: 'jpmorgan',   cat: 'bank', name: 'JPMorgan',         emoji: '🏢', color: '#2C2C6C', soft: 'rgba(44,44,108,0.08)',  border: 'rgba(44,44,108,0.2)',  number: '1-212-270-6000' },
  { id: 'bofa',       cat: 'bank', name: 'Bank of America',  emoji: '🔴', color: '#E31837', soft: 'rgba(227,24,55,0.08)',  border: 'rgba(227,24,55,0.2)',  number: '1-800-432-1000' },
  { id: 'citi',       cat: 'bank', name: 'Citibank',         emoji: '🌐', color: '#003B70', soft: 'rgba(0,59,112,0.08)',   border: 'rgba(0,59,112,0.2)',   number: '1-800-374-9700' },
  { id: 'usbank',     cat: 'bank', name: 'U.S. Bank',        emoji: '🇺🇸', color: '#003087', soft: 'rgba(0,48,135,0.08)',  border: 'rgba(0,48,135,0.2)',   number: '1-800-872-2657' },
  { id: 'tdbank',     cat: 'bank', name: 'TD Bank',          emoji: '🟢', color: '#1A7D2D', soft: 'rgba(26,125,45,0.08)',  border: 'rgba(26,125,45,0.2)',  number: '1-888-751-9000' },
  { id: 'capital1',   cat: 'bank', name: 'Capital One',      emoji: '💳', color: '#D03027', soft: 'rgba(208,48,39,0.08)',  border: 'rgba(208,48,39,0.2)',  number: '1-877-383-4802' },
  { id: 'discover',   cat: 'bank', name: 'Discover',         emoji: '🟠', color: '#FF6600', soft: 'rgba(255,102,0,0.08)',  border: 'rgba(255,102,0,0.2)',  number: '1-800-347-2683' },
  { id: 'pnc',        cat: 'bank', name: 'PNC Bank',         emoji: '🏗️', color: '#F15A22', soft: 'rgba(241,90,34,0.08)',  border: 'rgba(241,90,34,0.2)',  number: '1-888-762-2265' },
  { id: 'regions',    cat: 'bank', name: 'Regions Bank',     emoji: '🌄', color: '#006747', soft: 'rgba(0,103,71,0.08)',   border: 'rgba(0,103,71,0.2)',   number: '1-800-734-4667' },
  { id: 'truist',     cat: 'bank', name: 'Truist Bank',      emoji: '💜', color: '#4B286D', soft: 'rgba(75,40,109,0.08)',  border: 'rgba(75,40,109,0.2)',  number: '1-844-487-8478' },
  { id: 'ally',       cat: 'bank', name: 'Ally Bank',        emoji: '🚗', color: '#7B2D8B', soft: 'rgba(123,45,139,0.08)', border: 'rgba(123,45,139,0.2)', number: '1-877-247-2559' },
  { id: 'synchrony',  cat: 'bank', name: 'Synchrony Bank',   emoji: '💰', color: '#00A0D2', soft: 'rgba(0,160,210,0.08)',  border: 'rgba(0,160,210,0.2)',  number: '1-866-226-5638' },
  // ── Credit Unions ─────────────────────────────────────────────────────────
  { id: 'navyfcu',    cat: 'cu',   name: 'Navy Federal CU',  emoji: '⚓', color: '#003366', soft: 'rgba(0,51,102,0.08)',   border: 'rgba(0,51,102,0.2)',   number: '1-888-842-6328' },
  { id: 'pennfcu',    cat: 'cu',   name: 'PenFed CU',        emoji: '🦅', color: '#003087', soft: 'rgba(0,48,135,0.08)',   border: 'rgba(0,48,135,0.2)',   number: '1-800-247-5626' },
  { id: 'becu',       cat: 'cu',   name: 'BECU',             emoji: '🐝', color: '#F5A800', soft: 'rgba(245,168,0,0.08)',  border: 'rgba(245,168,0,0.2)',  number: '1-800-233-2328' },
  { id: 'schoolsfcu', cat: 'cu',   name: 'Schools First FCU', emoji: '📚', color: '#0066CC', soft: 'rgba(0,102,204,0.08)', border: 'rgba(0,102,204,0.2)',  number: '1-800-462-8328' },
  { id: 'suncoast',   cat: 'cu',   name: 'Suncoast CU',      emoji: '☀️', color: '#F47920', soft: 'rgba(244,121,32,0.08)', border: 'rgba(244,121,32,0.2)', number: '1-800-999-5887' },
  { id: 'alliantcu',  cat: 'cu',   name: 'Alliant CU',       emoji: '🤝', color: '#00833E', soft: 'rgba(0,131,62,0.08)',   border: 'rgba(0,131,62,0.2)',   number: '1-800-328-1935' },
  { id: 'goldenone',  cat: 'cu',   name: 'Golden 1 CU',      emoji: '🥇', color: '#C9973A', soft: 'rgba(201,151,58,0.08)', border: 'rgba(201,151,58,0.2)', number: '1-877-465-3361' },
  { id: 'americafirst', cat: 'cu', name: 'America First CU', emoji: '🌟', color: '#CC0000', soft: 'rgba(204,0,0,0.08)',    border: 'rgba(204,0,0,0.2)',    number: '1-800-999-3961' },
]

function DeptRows({ items, color }) {
  const [copied, setCopied] = useState(null)
  if (!items || items.length === 0) return <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>None added</div>
  return items.map((item, i) => (
    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none' }}>
      <div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{item.type}</div>
        <div style={{ fontSize: 12, color: 'var(--text-primary)', fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{item.value}</div>
      </div>
      <button onClick={() => { navigator.clipboard.writeText(item.value); setCopied(i); setTimeout(() => setCopied(null), 1500) }}
        style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: copied === i ? `${color}22` : 'transparent', color: copied === i ? color : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono', transition: 'all 0.15s' }}>
        {copied === i ? '✓' : 'copy'}
      </button>
    </div>
  ))
}

function EditModal({ brand, info, onSave, onClose }) {
  const [phones, setPhones] = useState(info?.phones_list || [])
  const [emails, setEmails] = useState(info?.emails_list || [])
  const [saving, setSaving] = useState(false)
  const inputStyle = { width: '100%', padding: '5px 8px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-primary)', fontSize: 12, fontFamily: 'JetBrains Mono', outline: 'none', boxSizing: 'border-box' }

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('brand_info').upsert({ brand_id: brand.id, phones_list: phones, emails_list: emails }, { onConflict: 'brand_id' })
    if (!error) onSave()
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, padding: 16, width: '100%', maxWidth: 340, maxHeight: '80vh', overflowY: 'auto' }}>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 15, color: brand.color, marginBottom: 12 }}>{brand.emoji} {brand.name}</div>

        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>📞 Phone Numbers</div>
        {phones.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
            <select value={p.type} onChange={e => setPhones(ph => ph.map((x, idx) => idx === i ? { ...x, type: e.target.value } : x))} style={{ ...inputStyle, width: 130 }}>
              {DEPT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <input value={p.value} onChange={e => setPhones(ph => ph.map((x, idx) => idx === i ? { ...x, value: e.target.value } : x))} placeholder="1-800-000-0000" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => setPhones(p => p.filter((_, idx) => idx !== i))} style={{ padding: '4px 7px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
          </div>
        ))}
        <button onClick={() => setPhones(p => [...p, { type: 'Customer Service', value: '' }])} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono', marginBottom: 12 }}>+ Add Number</button>

        <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>✉️ Emails</div>
        {emails.map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 5 }}>
            <select value={e.type} onChange={ev => setEmails(em => em.map((x, idx) => idx === i ? { ...x, type: ev.target.value } : x))} style={{ ...inputStyle, width: 130 }}>
              {DEPT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <input value={e.value} onChange={ev => setEmails(em => em.map((x, idx) => idx === i ? { ...x, value: ev.target.value } : x))} placeholder="dept@brand.com" style={{ ...inputStyle, flex: 1 }} />
            <button onClick={() => setEmails(e => e.filter((_, idx) => idx !== i))} style={{ padding: '4px 7px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer' }}>×</button>
          </div>
        ))}
        <button onClick={() => setEmails(e => [...e, { type: 'Customer Service', value: '' }])} style={{ fontSize: 10, padding: '4px 10px', borderRadius: 6, border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono', marginBottom: 14 }}>+ Add Email</button>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '8px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono', fontSize: 11 }}>Cancel</button>
          <button onClick={save} className="btn btn-brand" disabled={saving} style={{ flex: 1, justifyContent: 'center' }}>{saving ? 'Saving…' : 'Save'}</button>
        </div>
      </div>
    </div>
  )
}

function BrandCard({ brand, info, onEdit, isAdmin }) {
  const [expanded, setExpanded] = useState(false)
  const phones = info?.phones_list || []
  const emails = info?.emails_list || []

  return (
    <div className="animate-fadeIn" style={{ marginBottom: 8, border: `1px solid ${expanded ? brand.border : 'var(--border)'}`, borderRadius: 12, overflow: 'hidden', transition: 'border-color 0.2s ease' }}>
      <button onClick={() => setExpanded(e => !e)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', background: expanded ? brand.soft : 'var(--surface)', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: brand.soft, border: `1px solid ${brand.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {brand.emoji}
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: brand.color }}>{brand.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono' }}>{phones.length} numbers · {emails.length} emails</div>
        </div>
        {isAdmin && (
          <button onClick={e => { e.stopPropagation(); onEdit(brand, info) }} onMouseDown={e => e.stopPropagation()}
            style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: `1px solid ${brand.border}`, background: 'transparent', color: brand.color, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>
            ✏️ Edit
          </button>
        )}
        <span style={{ fontSize: 10, color: 'var(--text-muted)', transition: 'transform 0.2s', display: 'inline-block', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', marginLeft: 4 }}>▶</span>
      </button>
      {expanded && (
        <div style={{ padding: '8px 13px 12px', background: 'var(--bg)', borderTop: `1px solid ${brand.border}` }}>
          {phones.length > 0 && <>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: brand.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, marginTop: 6, fontWeight: 700 }}>📞 Numbers</div>
            <DeptRows items={phones} color={brand.color} />
          </>}
          {emails.length > 0 && <>
            <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: brand.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6, marginTop: phones.length ? 10 : 6, fontWeight: 700 }}>✉️ Emails</div>
            <DeptRows items={emails} color={brand.color} />
          </>}
          {phones.length === 0 && emails.length === 0 && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', padding: '6px 0' }}>No info added yet{isAdmin ? ' — click Edit to add' : ''}.</div>
          )}
        </div>
      )}
    </div>
  )
}

function BankCard({ bank, isAdmin, onEdit }) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(bank.number)

  const copy = () => { navigator.clipboard.writeText(bank.number); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  const save = () => { onEdit(bank.id, draft); setEditing(false) }

  return (
    <div style={{ marginBottom: 8, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', background: 'var(--surface)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: bank.soft, border: `1px solid ${bank.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {bank.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: bank.color }}>{bank.name}</div>
          {editing
            ? <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === 'Enter' && save()} autoFocus
                style={{ fontSize: 12, fontFamily: 'JetBrains Mono', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 6px', color: 'var(--text-primary)', width: 140, marginTop: 2, outline: 'none' }} />
            : <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', fontWeight: 600, marginTop: 1 }}>{bank.number}</div>
          }
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {editing ? <>
            <button onClick={save} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: `1px solid ${bank.border}`, background: bank.soft, color: bank.color, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>save</button>
            <button onClick={() => { setEditing(false); setDraft(bank.number) }} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>cancel</button>
          </> : <>
            <button onClick={copy} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: `1px solid ${bank.border}`, background: copied ? bank.soft : 'transparent', color: copied ? bank.color : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono', transition: 'all 0.15s' }}>
              {copied ? '✓ copied' : 'copy'}
            </button>
            {isAdmin && <button onClick={() => setEditing(true)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>✏️</button>}
          </>}
        </div>
      </div>
    </div>
  )
}

export default function InfoPage() {
  const { isAdmin } = useAuth()
  const [infos, setInfos]             = useState([])
  const [loading, setLoading]         = useState(true)
  const [editTarget, setEditTarget]   = useState(null)
  const [activeTab, setActiveTab]     = useState('brands')
  const [bankNumbers, setBankNumbers] = useState({})

  const getBankNumber = (id, def) => bankNumbers[id] ?? def
  const handleBankEdit = (id, number) => setBankNumbers(prev => ({ ...prev, [id]: number }))

  const fetchInfos = useCallback(async () => {
    const { data, error } = await supabase.from('brand_info').select('*')
    if (error) { console.error(error); setLoading(false); return }
    const parsed = (data || []).map(row => {
      let phones_list = []
      if (row.phones_list) phones_list = typeof row.phones_list === 'string' ? JSON.parse(row.phones_list || '[]') : (row.phones_list || [])
      else if (row.departments) { const old = typeof row.departments === 'string' ? JSON.parse(row.departments || '[]') : (row.departments || []); phones_list = old.map(d => ({ type: d.type, value: d.number || d.value || '' })) }
      let emails_list = []
      if (row.emails_list) emails_list = typeof row.emails_list === 'string' ? JSON.parse(row.emails_list || '[]') : (row.emails_list || [])
      else if (row.dept_emails) { const old = typeof row.dept_emails === 'string' ? JSON.parse(row.dept_emails || '[]') : (row.dept_emails || []); emails_list = old.map(d => ({ type: d.type, value: d.email || d.value || '' })) }
      else if (row.emails) emails_list = [{ type: 'Customer Service', value: row.emails }]
      return { ...row, phones_list, emails_list }
    })
    setInfos(parsed)
    setLoading(false)
  }, [])

  useEffect(() => { fetchInfos() }, [fetchInfos])

  const handleEdit = (brand, info) => { if (!isAdmin) return; setEditTarget({ brand, info }) }
  const getInfo = (brandId) => infos.find(i => i.brand_id === brandId)

  return (
    <div style={{ padding: '12px 13px' }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[{ id: 'brands', label: '🏷️ Brands' }, { id: 'banks', label: '🏦 Banks' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600,
            background: activeTab === t.id ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'var(--surface)',
            color: activeTab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'brands' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tap a brand to expand</div>
            {isAdmin && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6366F1', padding: '3px 9px' }}>👑 Admin Mode</span>}
          </div>
          {loading
            ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 12 }}>Loading...</div>
            : BRANDS.map(brand => <BrandCard key={brand.id} brand={brand} info={getInfo(brand.id)} onEdit={handleEdit} isAdmin={isAdmin} />)
          }
        </>
      )}

      {activeTab === 'banks' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Customer service numbers</div>
            {isAdmin && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6366F1', padding: '3px 9px' }}>👑 Edit numbers</span>}
          </div>

          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, paddingLeft: 2 }}>🏦 Major Banks</div>
          {BANKS.filter(b => b.cat === 'bank').map(bank => (
            <BankCard key={bank.id} bank={{ ...bank, number: getBankNumber(bank.id, bank.number) }} isAdmin={isAdmin} onEdit={handleBankEdit} />
          ))}

          <div style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8, marginTop: 14, paddingLeft: 2 }}>🤝 Credit Unions</div>
          {BANKS.filter(b => b.cat === 'cu').map(bank => (
            <BankCard key={bank.id} bank={{ ...bank, number: getBankNumber(bank.id, bank.number) }} isAdmin={isAdmin} onEdit={handleBankEdit} />
          ))}
        </>
      )}

      {editTarget && (
        <EditModal brand={editTarget.brand} info={editTarget.info}
          onSave={() => { setEditTarget(null); fetchInfos() }}
          onClose={() => setEditTarget(null)} />
      )}
    </div>
  )
}
