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

const BANKS = [
  { id: 'wellsfargo', name: 'Wells Fargo',      emoji: '🏦', color: '#D4111E', soft: 'rgba(212,17,30,0.08)',   border: 'rgba(212,17,30,0.2)',   number: '1-800-869-3557' },
  { id: 'chase',      name: 'Chase',            emoji: '🏛️', color: '#117ACA', soft: 'rgba(17,122,202,0.08)',  border: 'rgba(17,122,202,0.2)',  number: '1-800-935-9935' },
  { id: 'jpmorgan',   name: 'JPMorgan',         emoji: '🏢', color: '#2C2C6C', soft: 'rgba(44,44,108,0.08)',   border: 'rgba(44,44,108,0.2)',   number: '1-212-270-6000' },
  { id: 'bofa',       name: 'Bank of America',  emoji: '🔴', color: '#E31837', soft: 'rgba(227,24,55,0.08)',   border: 'rgba(227,24,55,0.2)',   number: '1-800-432-1000' },
  { id: 'citi',       name: 'Citibank',         emoji: '🌐', color: '#003B70', soft: 'rgba(0,59,112,0.08)',    border: 'rgba(0,59,112,0.2)',    number: '1-800-374-9700' },
  { id: 'usbank',     name: 'U.S. Bank',        emoji: '🇺🇸', color: '#003087', soft: 'rgba(0,48,135,0.08)',   border: 'rgba(0,48,135,0.2)',    number: '1-800-872-2657' },
  { id: 'tdbank',     name: 'TD Bank',          emoji: '🟢', color: '#1A7D2D', soft: 'rgba(26,125,45,0.08)',   border: 'rgba(26,125,45,0.2)',   number: '1-888-751-9000' },
  { id: 'capital1',   name: 'Capital One',      emoji: '💳', color: '#D03027', soft: 'rgba(208,48,39,0.08)',   border: 'rgba(208,48,39,0.2)',   number: '1-877-383-4802' },
  { id: 'discover',   name: 'Discover',         emoji: '🟠', color: '#FF6600', soft: 'rgba(255,102,0,0.08)',   border: 'rgba(255,102,0,0.2)',   number: '1-800-347-2683' },
  { id: 'pnc',        name: 'PNC Bank',         emoji: '🏗️', color: '#F15A22', soft: 'rgba(241,90,34,0.08)',   border: 'rgba(241,90,34,0.2)',   number: '1-888-762-2265' },
]

function BankCard({ bank, isAdmin, onEdit }) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]   = useState(bank.number)
  const [saving, setSaving] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(bank.number)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const save = async () => {
    setSaving(true)
    onEdit(bank.id, draft)
    setEditing(false)
    setSaving(false)
  }

  return (
    <div style={{ marginBottom: 8, border: `1px solid var(--border)`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 13px', background: 'var(--surface)' }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: bank.soft, border: `1px solid ${bank.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
          {bank.emoji}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: bank.color }}>{bank.name}</div>
          {editing ? (
            <input
              value={draft}
              onChange={e => setDraft(e.target.value)}
              style={{ fontSize: 12, fontFamily: 'JetBrains Mono', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 6, padding: '2px 6px', color: 'var(--text-primary)', width: 140, marginTop: 2 }}
              autoFocus
            />
          ) : (
            <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono', color: 'var(--text-primary)', fontWeight: 600, marginTop: 1 }}>{bank.number}</div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {editing ? (
            <>
              <button onClick={save} disabled={saving} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: `1px solid ${bank.border}`, background: bank.soft, color: bank.color, cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>save</button>
              <button onClick={() => { setEditing(false); setDraft(bank.number) }} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>cancel</button>
            </>
          ) : (
            <>
              <button onClick={copy} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: `1px solid ${bank.border}`, background: copied ? bank.soft : 'transparent', color: copied ? bank.color : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono', transition: 'all 0.15s' }}>
                {copied ? '✓ copied' : 'copy'}
              </button>
              {isAdmin && (
                <button onClick={() => setEditing(true)} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'JetBrains Mono' }}>✏️</button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}


export default function InfoPage() {
  const { isAdmin } = useAuth()
  const [infos, setInfos] = useState([])
  const [loading, setLoading] = useState(true)
  const [editTarget, setEditTarget] = useState(null)
  const [showPwGate, setShowPwGate] = useState(false)
  const [activeTab, setActiveTab] = useState('brands')
  const [bankNumbers, setBankNumbers] = useState(() => {
    const saved = localStorage.getItem('jpdesk_bank_numbers')
    return saved ? JSON.parse(saved) : {}
  })

  const getBankNumber = (id, defaultNum) => bankNumbers[id] ?? defaultNum

  const handleBankEdit = (id, number) => {
    const updated = { ...bankNumbers, [id]: number }
    setBankNumbers(updated)
    localStorage.setItem('jpdesk_bank_numbers', JSON.stringify(updated))
  }

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
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {[{ id: 'brands', label: '🏷️ Brands' }, { id: 'banks', label: '🏦 Banks' }].map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
            flex: 1, padding: '7px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 600,
            background: activeTab === t.id ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : 'var(--surface)',
            color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'brands' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
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
        </>
      )}

      {activeTab === 'banks' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Customer service numbers</div>
            {isAdmin && <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#6366F1', padding: '3px 9px' }}>👑 Edit numbers</span>}
          </div>
          {BANKS.map(bank => (
            <BankCard
              key={bank.id}
              bank={{ ...bank, number: getBankNumber(bank.id, bank.number) }}
              isAdmin={isAdmin}
              onEdit={handleBankEdit}
            />
          ))}
        </>
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
