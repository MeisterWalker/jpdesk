import React, { useState, useEffect, useRef } from 'react'
import { MusicIcon, RainIcon, OceanIcon, NatureIcon } from './Icons'

const SOUNDS = [
  { id: 'rain',   label: 'Rain',   icon: <RainIcon size={20} iconSize={12} />, url: 'https://www.soundjay.com/nature/rain-01.mp3' },
  { id: 'ocean',  label: 'Ocean',  icon: <OceanIcon size={20} iconSize={12} />, url: 'https://www.soundjay.com/nature/ocean-wave-1.mp3' },
  { id: 'nature', label: 'Nature', icon: <NatureIcon size={20} iconSize={12} />, url: 'https://www.soundjay.com/nature/birds-chirping-01.mp3' },
]

export default function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentId, setCurrentId] = useState('rain')
  const [isOpen, setIsOpen] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    audioRef.current = new Audio(SOUNDS.find(s => s.id === currentId).url)
    audioRef.current.loop = true
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!audioRef.current) return
    const wasPlaying = isPlaying
    audioRef.current.pause()
    audioRef.current.src = SOUNDS.find(s => s.id === currentId).url
    if (wasPlaying) {
      audioRef.current.play().catch(e => console.error("Audio play failed", e))
    }
  }, [currentId])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(e => console.error("Audio play failed", e))
    }
    setIsPlaying(!isPlaying)
  }

  const selectTrack = (id) => {
    setCurrentId(id)
    if (!isPlaying) {
      setIsPlaying(true)
      // The useEffect will handle the source change and play
    }
    setIsOpen(false)
  }

  return (
    <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 999999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {isPlaying && (
          <div style={{ 
            display: 'flex', alignItems: 'center', gap: 3, padding: '4px 10px', 
            background: 'rgba(99, 102, 241, 0.15)', borderRadius: 20, border: '1px solid rgba(99, 102, 241, 0.3)',
            backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease'
          }}>
            <div className="music-bar" style={{ width: 2, height: 8, background: '#6366F1', animation: 'musicBar 0.6s ease-in-out infinite' }} />
            <div className="music-bar" style={{ width: 2, height: 12, background: '#8B5CF6', animation: 'musicBar 0.6s ease-in-out infinite 0.1s' }} />
            <div className="music-bar" style={{ width: 2, height: 6, background: '#6366F1', animation: 'musicBar 0.6s ease-in-out infinite 0.2s' }} />
            <span style={{ fontSize: 10, fontFamily: 'JetBrains Mono', color: '#fff', marginLeft: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {SOUNDS.find(s => s.id === currentId).label}
            </span>
          </div>
        )}
        
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="icon-click"
          style={{ 
            width: 36, height: 36, borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)', transition: 'all 0.2s'
          }}
        >
          <MusicIcon size={24} iconSize={14} />
        </button>
      </div>

      {isOpen && (
        <div style={{ 
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '6px', 
          width: 140, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)',
          animation: 'slideInRight 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', padding: '4px 8px 6px', borderBottom: '1px solid var(--border)', marginBottom: 4, textTransform: 'uppercase' }}>Ambient Sounds</div>
          {SOUNDS.map(s => (
            <button 
              key={s.id}
              onClick={() => selectTrack(s.id)}
              style={{ 
                width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', 
                background: currentId === s.id && isPlaying ? 'rgba(255,255,255,0.05)' : 'none', 
                border: 'none', borderRadius: 8, cursor: 'pointer', color: currentId === s.id && isPlaying ? 'var(--accent)' : 'var(--text-primary)',
                transition: 'all 0.2s'
              }}
              className="list-item-hover"
            >
              <div style={{ opacity: currentId === s.id && isPlaying ? 1 : 0.6 }}>{s.icon}</div>
              <span style={{ fontSize: 12, fontWeight: currentId === s.id && isPlaying ? 700 : 400 }}>{s.label}</span>
              {currentId === s.id && isPlaying && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />}
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4 }}>
            <button 
              onClick={togglePlay}
              style={{ 
                width: '100%', padding: '8px', borderRadius: 8, background: isPlaying ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                border: 'none', color: isPlaying ? '#EF4444' : '#22C55E', fontSize: 11, fontWeight: 700, cursor: 'pointer'
              }}
            >
              {isPlaying ? '⏹ STOP MUSIC' : '▶ PLAY MUSIC'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes musicBar {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.8); }
        }
        @keyframes fadeIn { from { opacity: 0; transform: translateX(10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(20px) scale(0.95); } to { opacity: 1; transform: translateX(0) scale(1); } }
        .list-item-hover:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>
    </div>
  )
}
