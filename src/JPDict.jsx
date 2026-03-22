import { useState, useRef, useEffect, useCallback } from 'react'

export default function JPDict({ focused, onFocus }) {
  const [word, setWord] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  const [pos, setPos] = useState({ x: window.innerWidth - 420, y: 150 })
  const [dragging, setDragging] = useState(false)
  const [rel, setRel] = useState({ x: 0, y: 0 })

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!word.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.trim().toLowerCase()}`)
      if (!res.ok) throw new Error('Word not found')
      const data = await res.json()
      setResult(data[0])
      if (!history.includes(word.trim())) {
        setHistory(prev => [word.trim(), ...prev].slice(0, 5))
      }
    } catch (err) {
      setError(err.message)
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  const onMouseDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return
    setDragging(true)
    onFocus()
    const rect = e.currentTarget.getBoundingClientRect()
    setRel({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    e.preventDefault()
  }

  useEffect(() => {
    if (!dragging) return
    const onMouseMove = (e) => {
      setPos({ x: e.clientX - rel.x, y: e.clientY - rel.y })
    }
    const onMouseUp = () => setDragging(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [dragging, rel])

  return (
    <div
      onMouseDown={() => onFocus()}
      style={{
        position: 'fixed', left: pos.x, top: pos.y,
        width: 320, maxHeight: 480, zIndex: focused ? 9999 : 9990,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'springUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        fontFamily: 'JetBrains Mono',
      }}
    >
      {/* Header */}
      <div 
        onMouseDown={onMouseDown}
        style={{ 
          padding: '12px 14px', background: 'var(--surface-2)', 
          cursor: dragging ? 'grabbing' : 'grab',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid var(--border)'
        }}
      >
        <span style={{ fontSize: 16 }}>📖</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>JPDICT</span>
        <div style={{ flex: 1 }} />
        {loading && <div className="loader-mini" />}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ padding: 12, borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <input 
          autoFocus
          value={word}
          onChange={e => setWord(e.target.value)}
          placeholder="Search word..."
          style={{
            width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, padding: '8px 12px', color: 'var(--text-primary)',
            fontSize: 12, outline: 'none', transition: 'border 0.2s',
            fontFamily: 'JetBrains Mono'
          }}
        />
      </form>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, minHeight: 150 }}>
        {error && (
          <div style={{ color: '#EF4444', fontSize: 11, textAlign: 'center', paddingTop: 20 }}>
             ⚠️ {error}
          </div>
        )}

        {!result && !error && !loading && (
          <div style={{ color: 'var(--text-muted)', fontSize: 11, textAlign: 'center', paddingTop: 40, opacity: 0.6 }}>
            Type a word and press Enter
            {history.length > 0 && (
              <div style={{ marginTop: 15, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
                {history.map(h => (
                  <button key={h} onClick={() => { setWord(h); handleSearch() }} style={{ background: 'var(--surface-2)', border: 'none', borderRadius: 4, padding: '2px 6px', fontSize: 10, color: 'var(--accent)', cursor: 'pointer' }}>
                    {h}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {result && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
              <h2 style={{ fontSize: 20, margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>{result.word}</h2>
              <span style={{ fontSize: 11, color: 'var(--accent)', opacity: 0.8 }}>{result.phonetic}</span>
            </div>

            {result.meanings.map((m, i) => (
              <div key={i} style={{ marginBottom: 16 }}>
                <div style={{ 
                  display: 'inline-block', fontSize: 9, textTransform: 'uppercase', 
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  padding: '2px 6px', borderRadius: 4, fontWeight: 800, marginBottom: 8
                }}>
                  {m.partOfSpeech}
                </div>
                {m.definitions.slice(0, 2).map((d, di) => (
                  <div key={di} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      • {d.definition}
                    </div>
                    {d.example && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: 12, marginTop: 4 }}>
                        "{d.example}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .loader-mini {
          width: 12, height: 12, borderRadius: '50%',
          border: '2px solid rgba(99,102,241,0.2)',
          borderTop: '2px solid #6366F1',
          animation: 'spin 0.6s linear infinite'
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  )
}
