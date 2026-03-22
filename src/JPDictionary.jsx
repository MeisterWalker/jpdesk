import { useState, useRef, useEffect, useCallback } from 'react'
import { DictIcon, NounIcon, VerbIcon, AdjectiveIcon, AdverbIcon, PastTenseIcon, GerundIcon, PrepositionIcon, ConjunctionIcon } from './components/Icons'

const GRAMMAR_TIPS = [
  { id: 'noun', label: 'Noun', icon: NounIcon, def: 'A word used to identify a person, place, or thing.', example: 'The **cat** sat on the **mat**.' },
  { id: 'verb', label: 'Verb', icon: VerbIcon, def: 'A word used to describe an action, state, or occurrence.', example: 'She **runs** fast every morning.' },
  { id: 'adj',  label: 'Adjective', icon: AdjectiveIcon, def: 'A word that describes a noun or pronoun.', example: 'The **blue** sky is beautiful.' },
  { id: 'adv',  label: 'Adverb', icon: AdverbIcon, def: 'A word that modifies a verb, adjective, or other adverb.', example: 'He sang **loudly**.' },
  { id: 'past', label: 'Past Tense', icon: PastTenseIcon, def: 'Used to describe things that happened in the past.', example: 'He **walked** to the store yesterday.' },
  { id: 'ger',  label: 'Gerund', icon: GerundIcon, def: 'A verb ending in -ing that functions as a noun.', example: '**Swimming** is good exercise.' },
  { id: 'prep', label: 'Preposition', icon: PrepositionIcon, def: 'Shows the relationship between a noun and another word.', example: 'The book is **on** the table.' },
  { id: 'conj', label: 'Conjunction', icon: ConjunctionIcon, def: 'Words that connect phrases or clauses.', example: 'I like tea **and** coffee.' },
]

export default function JPDictionary({ focused, onFocus, onClose }) {
  const [word, setWord] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [learnTerm, setLearnTerm] = useState(null)

  const [pos, setPos] = useState({ x: window.innerWidth - 420, y: 150 })
  const [dragging, setDragging] = useState(false)
  const [rel, setRel] = useState({ x: 0, y: 0 })

  const handleSearch = async (e, customWord) => {
    if (e) e.preventDefault()
    const targetWord = customWord || word
    if (!targetWord.trim()) return
    setLoading(true)
    setError(null)
    setLearnTerm(null)
    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${targetWord.trim().toLowerCase()}`)
      if (!res.ok) throw new Error('Word not found')
      const data = await res.json()
      setResult(data[0])
      if (!history.includes(targetWord.trim())) {
        setHistory(prev => [targetWord.trim(), ...prev].slice(0, 5))
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
        width: 320, maxHeight: 520, zIndex: focused ? 9999 : 9990,
        background: '#111827', border: '1px solid var(--border)',
        borderRadius: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'springUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        fontFamily: 'Space Grotesk',
      }}
    >
      {/* Header */}
      <div 
        onMouseDown={onMouseDown}
        style={{ 
          padding: '12px 14px', background: '#111827', 
          cursor: dragging ? 'grabbing' : 'grab',
          display: 'flex', alignItems: 'center', gap: 10,
          borderBottom: '1px solid var(--border)'
        }}
      >
        <div style={{
          width: 24, height: 24, background: 'linear-gradient(135deg, #6366F1, #4F46E5)',
          borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <span style={{ fontSize: 14 }}>📖</span>
        </div>
        <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          JP<span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Dictionary</span>
        </span>
        <div style={{ flex: 1 }} />
        {loading && <div className="loader-mini" />}
        <button 
          onClick={onClose} 
          style={{ 
            background: 'none', border: 'none', color: 'var(--text-muted)', 
            cursor: 'pointer', fontSize: 14, padding: '4px', opacity: 0.6,
            transition: 'opacity 0.2s'
          }}
          className="hover-bright"
        >×</button>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ padding: 12, borderBottom: '1px solid var(--border)', background: '#0A0E1A' }}>
        <div style={{ position: 'relative' }}>
          <input 
            autoFocus
            value={word}
            onChange={e => setWord(e.target.value)}
            placeholder="Search words or grammar..."
            style={{
              width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)',
              fontSize: 12, outline: 'none', transition: 'all 0.2s',
              fontFamily: 'JetBrains Mono'
            }}
          />
          {word && <button type="submit" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 }}>🔍</button>}
        </div>
      </form>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, minHeight: 200 }} className="hide-scrollbar">
        {error && (
          <div style={{ color: '#EF4444', fontSize: 11, textAlign: 'center', paddingTop: 30 }} className="animate-fadeIn">
             ⚠️ {error}
             <button onClick={() => setError(null)} style={{ display: 'block', margin: '15px auto', background: 'var(--surface-2)', border: 'none', borderRadius: 6, padding: '4px 12px', fontSize: 10, color: 'var(--text-primary)', cursor: 'pointer' }}>Clear</button>
          </div>
        )}

        {learnTerm && (
          <div className="animate-fadeIn">
            <button onClick={() => setLearnTerm(null)} style={{ marginBottom: 12, background: 'none', border: 'none', color: 'var(--accent)', fontSize: 10, cursor: 'pointer', fontWeight: 800 }}>← BACK TO TIPS</button>
            <div style={{ background: 'var(--surface-2)', borderRadius: 12, padding: 16, border: '1px solid var(--accent-soft)' }}>
               <div style={{ fontSize: 24, marginBottom: 8 }}>
                 <learnTerm.icon size={36} iconSize={20} />
               </div>
               <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>{learnTerm.label}</h3>
               <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: '10px 0' }}>{learnTerm.def}</p>
               <div style={{ padding: 10, background: 'var(--bg)', borderRadius: 8, fontSize: 11, borderLeft: '3px solid var(--accent)' }}>
                 <div style={{ color: 'var(--accent)', fontWeight: 800, fontSize: 9, marginBottom: 4, textTransform: 'uppercase' }}>Example</div>
                 <span dangerouslySetInnerHTML={{ __html: learnTerm.example }} />
               </div>
            </div>
            <button 
              onClick={() => { setWord(learnTerm.label); handleSearch(null, learnTerm.label) }}
              className="btn btn-brand" style={{ width: '100%', marginTop: 12, justifyContent: 'center' }}
            >
              See detailed definition
            </button>
          </div>
        )}

        {!result && !error && !loading && !learnTerm && (
          <div className="animate-fadeIn">
            <div style={{ fontSize: 10, color: 'var(--text-label)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>
              💡 Educational Tips & Quiz
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {GRAMMAR_TIPS.map(tip => (
                <button 
                  key={tip.id} 
                  onClick={() => setLearnTerm(tip)}
                  style={{ 
                    background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, 
                    padding: '16px 12px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start'
                  }}
                  className="hover-bright"
                >
                  <tip.icon size={28} iconSize={16} />
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.01em' }}>{tip.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {result && (
          <div className="animate-fadeIn">
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
              <h2 style={{ fontSize: 22, margin: 0, color: 'var(--text-primary)', fontWeight: 800 }}>{result.word}</h2>
              <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>{result.phonetic}</span>
            </div>

            {result.meanings.map((m, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div style={{ 
                  display: 'inline-block', fontSize: 9, textTransform: 'uppercase', 
                  background: 'var(--accent-soft)', color: 'var(--accent)',
                  padding: '3px 8px', borderRadius: 6, fontWeight: 900, marginBottom: 10
                }}>
                  {m.partOfSpeech}
                </div>
                {m.definitions.slice(0, 2).map((d, di) => (
                  <div key={di} style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
                      • {d.definition}
                    </div>
                    {d.example && (
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: 12, marginTop: 6, opacity: 0.8 }}>
                        "{d.example}"
                      </div>
                    )}
                  </div>
                ))}
                
                {m.synonyms?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-label)', fontWeight: 800, display: 'block', marginBottom: 4 }}>SYNONYMS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {m.synonyms.slice(0, 4).map(s => (
                        <button key={s} onClick={() => { setWord(s); handleSearch(null, s) }} style={{ fontSize: 9, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--accent)', cursor: 'pointer' }}>{s}</button>
                      ))}
                    </div>
                  </div>
                )}
                {m.antonyms?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <span style={{ fontSize: 9, color: 'var(--text-label)', fontWeight: 800, display: 'block', marginBottom: 4 }}>ANTONYMS</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {m.antonyms.slice(0, 4).map(a => (
                        <button key={a} onClick={() => { setWord(a); handleSearch(null, a) }} style={{ fontSize: 9, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: '#F43F5E', cursor: 'pointer' }}>{a}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .loader-mini {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid var(--accent-soft);
          border-top: 2px solid var(--accent);
          animation: spin 0.6s linear infinite;
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .hover-bright:hover { background: var(--surface) !important; border-color: var(--accent-soft) !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}
