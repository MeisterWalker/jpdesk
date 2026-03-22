import { useState, useRef, useEffect, useCallback } from 'react'
import { DictIcon, NounIcon, VerbIcon, AdjectiveIcon, AdverbIcon, PastTenseIcon, GerundIcon, PrepositionIcon, ConjunctionIcon, FutureTenseIcon, DoubleNegativeIcon, StudyIcon, FlashcardIcon, QuizIcon, MatchIcon } from './components/Icons'

const GRAMMAR_TIPS = [
  { id: 'noun', label: 'Noun', icon: NounIcon, def: 'A word used to identify a person, place, or thing.', example: 'The **cat** sat on the **mat**.' },
  { id: 'verb', label: 'Verb', icon: VerbIcon, def: 'A word used to describe an action, state, or occurrence.', example: 'She **runs** fast every morning.' },
  { id: 'adj',  label: 'Adjective', icon: AdjectiveIcon, def: 'A word that describes a noun or pronoun.', example: 'The **blue** sky is beautiful.' },
  { id: 'adv',  label: 'Adverb', icon: AdverbIcon, def: 'A word that modifies a verb, adjective, or other adverb.', example: 'He sang **loudly**.' },
  { id: 'past', label: 'Past Tense', icon: PastTenseIcon, def: 'Used to describe things that happened in the past.', example: 'He **walked** to the store yesterday.' },
  { id: 'ger',  label: 'Gerund', icon: GerundIcon, def: 'A verb ending in -ing that functions as a noun.', example: '**Swimming** is good exercise.' },
  { id: 'prep', label: 'Preposition', icon: PrepositionIcon, def: 'Shows the relationship between a noun and another word.', example: 'The book is **on** the table.' },
  { id: 'conj', label: 'Conjunction', icon: ConjunctionIcon, def: 'Words that connect phrases or clauses.', example: 'I like tea **and** coffee.' },
  { id: 'future', label: 'Future Tense', icon: FutureTenseIcon, def: 'Used to describe things that will happen in the future.', example: 'I **will walk** to the store tomorrow.' },
  { id: 'neg',  label: 'Double Negative', icon: DoubleNegativeIcon, def: 'A rule stating that two negative words should not be used in the same sentence as they cancel each other out.', example: 'INCORRECT: I **don\'t** want **nothing**.<br />CORRECT: I **don\'t** want **anything**.' },
]

export default function JPDictionary({ focused, onFocus, onClose }) {
  const [word, setWord] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [learnTerm, setLearnTerm] = useState(null)
  
  // Study Mode State
  const [view, setView] = useState('search') // 'search' | 'study'
  const [studyPage, setStudyPage] = useState('dashboard') // 'dashboard' | 'flashcards' | 'quiz' | 'match'
  const [progress, setProgress] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('jp_dict_progress') || '{"studied": [], "quizScores": []}')
    } catch {
      return { studied: [], quizScores: [] }
    }
  })

  // Flashcard State
  const [fcIndex, setFcIndex] = useState(0)
  const [fcFlipped, setFcFlipped] = useState(false)

  // Quiz State
  const [quizQ, setQuizQ] = useState(null)
  const [quizAnswer, setQuizAnswer] = useState(null)
  const [quizFeedback, setQuizFeedback] = useState(null)

  const generateQuiz = useCallback(() => {
    const tip = GRAMMAR_TIPS[Math.floor(Math.random() * GRAMMAR_TIPS.length)]
    const options = [tip.label, ...GRAMMAR_TIPS.filter(t => t.id !== tip.id).sort(() => 0.5 - Math.random()).slice(0, 2).map(t => t.label)].sort(() => 0.5 - Math.random())
    setQuizQ({ tip, options })
    setQuizAnswer(null)
    setQuizFeedback(null)
  }, [])

  useEffect(() => {
    if (studyPage === 'quiz' && !quizQ) generateQuiz()
  }, [studyPage, quizQ, generateQuiz])

  // Matching Game State
  const [matchItems, setMatchItems] = useState({ words: [], defs: [] })
  const [matchSelected, setMatchSelected] = useState({ word: null, def: null })
  const [matchedIds, setMatchedIds] = useState([])
  const [matchFeedback, setMatchFeedback] = useState(null)

  const generateMatch = useCallback(() => {
    const pool = [...GRAMMAR_TIPS].sort(() => 0.5 - Math.random()).slice(0, 4)
    setMatchItems({
      words: pool.map(t => ({ id: t.id, label: t.label })).sort(() => 0.5 - Math.random()),
      defs: pool.map(t => ({ id: t.id, def: t.def })).sort(() => 0.5 - Math.random())
    })
    setMatchedIds([])
    setMatchSelected({ word: null, def: null })
    setMatchFeedback(null)
  }, [])

  useEffect(() => {
    if (studyPage === 'match' && matchItems.words.length === 0) generateMatch()
  }, [studyPage, matchItems, generateMatch])

  useEffect(() => {
    if (matchSelected.word && matchSelected.def) {
      if (matchSelected.word === matchSelected.def) {
        setMatchedIds(prev => [...prev, matchSelected.word])
        setMatchSelected({ word: null, def: null })
        if (matchedIds.length + 1 === 4) {
          setMatchFeedback('Perfect Match!')
          setProgress(prev => ({ ...prev, studied: Array.from(new Set([...prev.studied, ...matchItems.words.map(w => w.id)])) }))
        }
      } else {
        setTimeout(() => setMatchSelected({ word: null, def: null }), 500)
      }
    }
  }, [matchSelected, matchedIds, matchItems.words])

  // Word of the Day Logic
  const getWOD = () => {
    const today = new Date().toISOString().slice(0, 10)
    const seed = today.split('-').reduce((a, b) => a + parseInt(b), 0)
    return GRAMMAR_TIPS[seed % GRAMMAR_TIPS.length]
  }
  const wod = getWOD()

  useEffect(() => {
    localStorage.setItem('jp_dict_progress', JSON.stringify(progress))
  }, [progress])

  const [pos, setPos] = useState({ x: window.innerWidth - 425, y: 150 })
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
        width: 400, maxHeight: 540, zIndex: focused ? 9999 : 9990,
        background: '#111827', border: '1px solid var(--border)',
        borderRadius: 20, boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        animation: 'springUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        fontFamily: 'Space Grotesk',
        transition: dragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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

      {/* View Tabs */}
      <div style={{ display: 'flex', background: '#0A0E1A', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setView('search')}
          style={{ 
            flex: 1, padding: '10px 0', fontSize: 10, fontWeight: 800, cursor: 'pointer',
            background: view === 'search' ? 'transparent' : 'rgba(255,255,255,0.02)',
            color: view === 'search' ? 'var(--accent)' : 'var(--text-muted)',
            border: 'none', borderBottom: view === 'search' ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all 0.2s', fontFamily: 'JetBrains Mono'
          }}
        >
          SEARCH & RULES
        </button>
        <button 
          onClick={() => setView('study')}
          style={{ 
            flex: 1, padding: '10px 0', fontSize: 10, fontWeight: 800, cursor: 'pointer',
            background: view === 'study' ? 'transparent' : 'rgba(255,255,255,0.02)',
            color: view === 'study' ? 'var(--accent)' : 'var(--text-muted)',
            border: 'none', borderBottom: view === 'study' ? '2px solid var(--accent)' : '2px solid transparent',
            transition: 'all 0.2s', fontFamily: 'JetBrains Mono'
          }}
        >
          STUDY MODE
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }} className="hide-scrollbar">
        {view === 'search' ? (
          <>
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

            <div style={{ padding: 14 }}>
              {/* Existing Search/Tips Results logic ... */}
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {GRAMMAR_TIPS.map(tip => (
                <button 
                  key={tip.id} 
                  onClick={() => setLearnTerm(tip)}
                  style={{ 
                    background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, 
                    padding: '16px 10px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', borderBottomWidth: 3
                  }}
                  className="hover-card"
                >
                  <tip.icon size={32} iconSize={16} />
                  <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.01em', whiteSpace: 'nowrap' }}>{tip.label}</span>
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
          </>
        ) : (
          <div style={{ padding: 16 }} className="animate-fadeIn">
            {/* Study Dashboard */}
            {studyPage === 'dashboard' && (
              <>
                <div style={{ 
                  background: 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.1))', 
                  borderRadius: 16, padding: 16, border: '1px solid var(--accent-soft)', marginBottom: 20,
                  position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Word of the Day</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <wod.icon size={44} iconSize={20} />
                    <div>
                      <h3 style={{ margin: 0, fontSize: 18, color: 'var(--text-primary)' }}>{wod.label}</h3>
                      <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{wod.def.slice(0, 60)}...</p>
                    </div>
                  </div>
                  <button onClick={() => { setView('search'); setLearnTerm(wod) }} style={{ position: 'absolute', right: 12, bottom: 12, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 8px', fontSize: 9, fontWeight: 800, cursor: 'pointer' }}>LEARN MORE</button>
                </div>

                <div style={{ fontSize: 10, color: 'var(--text-label)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Study Modules</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <button onClick={() => setStudyPage('flashcards')} className="hover-card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <FlashcardIcon size={32} iconSize={16} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>Flashcards</span>
                  </button>
                  <button onClick={() => setStudyPage('quiz')} className="hover-card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <QuizIcon size={32} iconSize={16} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>Grammar Quiz</span>
                  </button>
                  <button onClick={() => setStudyPage('match')} className="hover-card" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                    <MatchIcon size={32} iconSize={16} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>Matching Game</span>
                  </button>
                  <div style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', opacity: 0.8 }}>
                    <div style={{ fontSize: 16 }}>📊</div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-primary)' }}>Progress: {Math.round((progress.studied.length / GRAMMAR_TIPS.length) * 100)}%</div>
                  </div>
                </div>

                <div style={{ fontSize: 10, color: 'var(--text-label)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.05em' }}>Quick Progress</div>
                <div style={{ display: 'flex', gap: 4, height: 6, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
                  {GRAMMAR_TIPS.map(t => (
                    <div key={t.id} style={{ flex: 1, background: progress.studied.includes(t.id) ? 'var(--accent)' : 'transparent', transition: 'all 0.3s' }} />
                  ))}
                </div>
              </>
            )}

            {/* Feature Implementations */}
            {studyPage === 'flashcards' && (
              <div className="animate-fadeIn">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 14, color: 'var(--text-primary)' }}>Flashcards ({fcIndex + 1}/{GRAMMAR_TIPS.length})</h3>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setFcIndex(i => Math.max(0, i - 1)); setFcFlipped(false) }} disabled={fcIndex === 0} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', opacity: fcIndex === 0 ? 0.3 : 1 }}>←</button>
                    <button onClick={() => { setFcIndex(i => Math.min(GRAMMAR_TIPS.length - 1, i + 1)); setFcFlipped(false) }} disabled={fcIndex === GRAMMAR_TIPS.length - 1} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', opacity: fcIndex === GRAMMAR_TIPS.length - 1 ? 0.3 : 1 }}>→</button>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setFcFlipped(!fcFlipped)
                    if (!progress.studied.includes(GRAMMAR_TIPS[fcIndex].id)) {
                      setProgress(prev => ({ ...prev, studied: [...prev.studied, GRAMMAR_TIPS[fcIndex].id] }))
                    }
                  }}
                  className={`flashcard ${fcFlipped ? 'flipped' : ''}`}
                  style={{ height: 220, cursor: 'pointer', perspective: '1000px', position: 'relative' }}
                >
                  <div className="card-inner" style={{ position: 'relative', width: '100%', height: '100%', textAlign: 'center', transition: 'transform 0.6s', transformStyle: 'preserve-3d' }}>
                    {/* Front */}
                    <div className="card-front" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: 'var(--surface-2)', border: '1px solid var(--accent-soft)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 15 }}>
                      <div style={{ background: 'var(--accent-soft)', padding: 12, borderRadius: 12 }}>
                        {React.createElement(GRAMMAR_TIPS[fcIndex].icon, { size: 48, iconSize: 22 })}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)' }}>{GRAMMAR_TIPS[fcIndex].label}</div>
                      <div style={{ fontSize: 10, color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.1em' }}>CLICK TO FLIP</div>
                    </div>
                    {/* Back */}
                    <div className="card-back" style={{ position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden', background: '#0A0E1A', border: '1px solid var(--accent)', borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, transform: 'rotateY(180deg)' }}>
                      <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{GRAMMAR_TIPS[fcIndex].def}</p>
                      <div style={{ marginTop: 15, padding: 10, background: 'var(--surface-2)', borderRadius: 8, fontSize: 11, color: 'var(--text-muted)', italic: 'true' }}>
                        "{GRAMMAR_TIPS[fcIndex].example.replace(/\*\*/g, '')}"
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {studyPage === 'quiz' && quizQ && (
              <div className="animate-fadeIn">
                <div style={{ background: 'var(--surface-2)', borderRadius: 16, padding: 20, border: '1px solid var(--border)', marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 12 }}>Fill in the Blank</div>
                  <div style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 20 }}>
                    "{quizQ.tip.example.split(new RegExp(`\\*\\*${quizQ.tip.label}\\*\\*`, 'i')).map((part, i, arr) => (
                      <span key={i}>
                        {part}
                        {i < arr.length - 1 && <span style={{ padding: '2px 8px', borderBottom: '2px solid var(--accent)', color: quizAnswer ? (quizAnswer === quizQ.tip.label ? '#10B981' : '#EF4444') : 'var(--accent)', fontWeight: 800 }}>{quizAnswer || '______'}</span>}
                      </span>
                    ))}"
                  </div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {quizQ.options.map(opt => (
                      <button
                        key={opt}
                        disabled={!!quizAnswer}
                        onClick={() => {
                          setQuizAnswer(opt)
                          if (opt === quizQ.tip.label) {
                            setQuizFeedback('Correct! Well done.')
                            setProgress(prev => ({ ...prev, studied: Array.from(new Set([...prev.studied, quizQ.tip.id])) }))
                          } else {
                            setQuizFeedback(`Oops! The correct answer was ${quizQ.tip.label}.`)
                          }
                        }}
                        style={{
                          padding: '12px', textAlign: 'left', borderRadius: 10, border: '1px solid var(--border)',
                          background: quizAnswer === opt ? (opt === quizQ.tip.label ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)') : 'var(--bg)',
                          color: quizAnswer === opt ? (opt === quizQ.tip.label ? '#10B981' : '#EF4444') : 'var(--text-primary)',
                          cursor: quizAnswer ? 'default' : 'pointer', fontSize: 12, fontWeight: 700
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                {quizFeedback && (
                  <div className="animate-fadeIn" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: quizAnswer === quizQ.tip.label ? '#10B981' : '#EF4444', fontWeight: 800, marginBottom: 15 }}>{quizFeedback}</div>
                    <button onClick={generateQuiz} className="btn btn-brand" style={{ display: 'inline-flex', margin: '0 auto' }}>NEXT QUESTION</button>
                  </div>
                )}
              </div>
            )}
            
            {studyPage === 'match' && matchItems.words.length > 0 && (
              <div className="animate-fadeIn">
                <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', marginBottom: 15, textAlign: 'center' }}>Match the Pairs</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 15, marginBottom: 20 }}>
                  {/* Words Column */}
                  <div style={{ display: 'grid', gap: 10 }}>
                    {matchItems.words.map(w => (
                      <button
                        key={w.id}
                        disabled={matchedIds.includes(w.id)}
                        onClick={() => setMatchSelected(prev => ({ ...prev, word: w.id }))}
                        style={{
                          padding: '12px 8px', borderRadius: 8, border: '1px solid var(--border)',
                          background: matchedIds.includes(w.id) ? 'rgba(16,185,129,0.1)' : (matchSelected.word === w.id ? 'var(--accent)' : 'var(--bg)'),
                          color: matchedIds.includes(w.id) ? '#10B981' : (matchSelected.word === w.id ? '#fff' : 'var(--text-primary)'),
                          cursor: matchedIds.includes(w.id) ? 'default' : 'pointer', fontSize: 10, fontWeight: 800,
                          opacity: matchedIds.includes(w.id) ? 0.3 : 1, transition: 'all 0.2s', textAlign: 'center'
                        }}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                  {/* Defs Column */}
                  <div style={{ display: 'grid', gap: 10 }}>
                    {matchItems.defs.map(d => (
                      <button
                        key={d.id}
                        disabled={matchedIds.includes(d.id)}
                        onClick={() => setMatchSelected(prev => ({ ...prev, def: d.id }))}
                        style={{
                          padding: '12px 10px', borderRadius: 8, border: '1px solid var(--border)',
                          background: matchedIds.includes(d.id) ? 'rgba(16,185,129,0.1)' : (matchSelected.def === d.id ? 'var(--accent)' : 'var(--bg)'),
                          color: matchedIds.includes(d.id) ? '#10B981' : (matchSelected.def === d.id ? '#fff' : 'var(--text-primary)'),
                          cursor: matchedIds.includes(d.id) ? 'default' : 'pointer', fontSize: 9, lineHeight: 1.3,
                          opacity: matchedIds.includes(d.id) ? 0.3 : 1, transition: 'all 0.2s', textAlign: 'left'
                        }}
                      >
                        {d.def.slice(0, 50)}...
                      </button>
                    ))}
                  </div>
                </div>

                {matchFeedback && (
                  <div className="animate-fadeIn" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 13, color: '#10B981', fontWeight: 800, marginBottom: 15 }}>{matchFeedback}</div>
                    <button onClick={generateMatch} className="btn btn-brand" style={{ display: 'inline-flex', margin: '0 auto' }}>PLAY AGAIN</button>
                  </div>
                )}
              </div>
            )}

            {studyPage !== 'dashboard' && (
              <button onClick={() => setStudyPage('dashboard')} style={{ marginTop: 20, background: 'none', border: 'none', color: 'var(--accent)', fontSize: 10, fontWeight: 800, cursor: 'pointer' }}>← EXIT TO DASHBOARD</button>
            )}
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
        .hover-card:hover { 
          background: var(--surface) !important; 
          border-color: var(--accent) !important; 
          transform: translateY(-3px); 
          box-shadow: 0 6px 15px rgba(0,0,0,0.3);
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .flashcard.flipped .card-inner { transform: rotateY(180deg); }
      `}</style>
    </div>
  )
}
