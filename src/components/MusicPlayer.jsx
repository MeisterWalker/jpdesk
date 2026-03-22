import React, { useState, useEffect, useRef } from 'react'
import { MusicIcon, RainIcon, OceanIcon, NatureIcon } from './Icons'
import { supabase } from '../lib/supabase'

const BUCKET_NAME = 'ambient-sounds'

const CATEGORIES = [
  { id: 'ambient', label: 'Ambient' },
  { id: 'instrumental', label: 'Instrumental' },
  { id: 'vocals', label: 'Vocals' }
]

const SOUNDS = [
  // AMBIENT CATEGORY
  { 
    id: 'rain',   
    category: 'ambient',
    label: 'Rainy Day',   
    sublabel: 'Soothing rainfall',
    icon: <RainIcon size={44} iconSize={24} />, 
    filename: 'rain.mp3'
  },
  { 
    id: 'ocean',  
    category: 'ambient',
    label: 'Pacific Waves',  
    sublabel: 'Deep ocean surf',
    icon: <OceanIcon size={44} iconSize={24} />, 
    filename: 'ocean.mp3'
  },
  { 
    id: 'nature', 
    category: 'ambient',
    label: 'Nature Forest', 
    sublabel: 'Birds and wind',
    icon: <NatureIcon size={44} iconSize={24} />, 
    filename: 'nature.mp3'
  },
  // INSTRUMENTAL CATEGORY
  { 
    id: 'all_that_you_are', 
    category: 'instrumental',
    label: 'All That You Are', 
    sublabel: 'Instrumental collection',
    icon: <MusicIcon size={44} iconSize={24} />, 
    filename: 'All That You Are.mp3'
  },
  // VOCALS CATEGORY
  { 
    id: 'quiet_days', 
    category: 'vocals',
    label: 'Quiet Days', 
    sublabel: 'Vocal collection',
    icon: <MusicIcon size={44} iconSize={24} gradient="linear-gradient(135deg, #F472B6, #8B5CF6)" />, 
    filename: 'Quiet days.mp3'
  }
]

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('ambient')
  const [currentId, setCurrentId] = useState('rain')
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [audioUrl, setAudioUrl] = useState('')
  
  const audioRef = useRef(null)
  const menuRef = useRef(null)

  // Fetch Public URL from Supabase when currentId changes
  useEffect(() => {
    const track = SOUNDS.find(s => s.id === currentId)
    if (track) {
      const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(track.filename)
      setAudioUrl(publicUrl)
    }
  }, [currentId])

  // Sync volume with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  // Reset error when switching tracks
  useEffect(() => {
    setIsError(false)
    setIsLoading(true)
    if (isPlaying && audioRef.current) {
      audioRef.current.load()
      audioRef.current.play().catch(e => {
        console.error('Playback failed:', e)
        setIsPlaying(false)
        setIsError(true)
      })
    }
  }, [audioUrl])

  const togglePlay = (e) => {
    e?.stopPropagation()
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      setIsError(false)
      setIsLoading(true)
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => {
          console.error('Audio start blocked/failed:', e)
          setIsError(true)
        })
    }
  }

  const selectTrack = (id) => {
    if (currentId === id) {
      togglePlay()
    } else {
      setCurrentId(id)
      setIsPlaying(true)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const currentTrack = SOUNDS.find(s => s.id === currentId)
  const filteredSounds = SOUNDS.filter(s => s.category === activeTab)

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000002 }}>
      {/* Hidden Audio Engine */}
      <audio 
        ref={audioRef}
        src={audioUrl}
        loop
        preload="auto"
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onError={() => {
          setIsError(true)
          setIsLoading(false)
          setIsPlaying(false)
        }}
      />

      <div style={{ position: 'relative' }}>
        {/* Main Badge Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="glass-reflection"
          style={{
            width: 48, height: 48, borderRadius: 16,
            background: isPlaying ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'var(--surface)',
            border: `1px solid ${isPlaying ? 'var(--accent-border)' : 'var(--border)'}`,
            boxShadow: isPlaying ? '0 8px 32px rgba(99,102,241,0.5)' : '0 4px 16px rgba(0,0,0,0.3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isOpen ? 'scale(0.9) translateY(2px)' : 'scale(1)',
          }}
        >
          {isPlaying ? (
             <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
                {[0.6, 1, 0.4].map((h, i) => (
                  <div key={i} style={{ 
                    width: 3, height: 14, background: '#fff', borderRadius: 2,
                    animation: `equalizer 0.6s ease-in-out infinite alternate ${i * 0.2}s`
                  }} />
                ))}
             </div>
          ) : (
            <MusicIcon size={28} iconSize={18} />
          )}
        </button>

        {/* Premium Player Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            className="glass-reflection"
            style={{
              position: 'absolute', top: 60, right: 0, width: 280,
              background: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(24px)',
              border: '1px solid var(--accent-border)', borderRadius: 24,
              padding: '16px', boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              animation: 'playerIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              display: 'flex', flexDirection: 'column', gap: 16
            }}
          >
            {/* Tab Header */}
            <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  style={{
                    flex: 1, padding: '8px', border: 'none', borderRadius: 8,
                    background: activeTab === cat.id ? 'var(--accent)' : 'transparent',
                    color: activeTab === cat.id ? '#fff' : 'var(--text-muted)',
                    fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Now Playing Area (Apple Music Style) */}
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: '12px',
              display: 'flex', alignItems: 'center', gap: 12, position: 'relative',
              border: isActiveTrack(currentTrack) ? '1px solid var(--accent-border)' : '1px solid transparent'
            }}>
              <div style={{ 
                width: 56, height: 56, borderRadius: 12, overflow: 'hidden', 
                background: 'var(--surface-light)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: isPlaying ? '0 8px 16px rgba(0,0,0,0.4)' : 'none',
                transition: 'all 0.3s'
              }}>
                {currentTrack.icon}
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentTrack.label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 500 }}>{currentId === currentTrack.id && isPlaying ? 'Now Playing' : 'Paused'}</div>
              </div>
              <button 
                onClick={togglePlay}
                style={{ 
                  width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)',
                  border: 'none', color: '#fff', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 12
                }}
              >
                {isLoading ? (
                  <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                ) : isPlaying ? '⏸' : '▶'}
              </button>
            </div>

            {/* Scrollable Track List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
              {filteredSounds.map(s => (
                <button
                  key={s.id}
                  onClick={() => selectTrack(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px',
                    borderRadius: 14, border: '1px solid transparent',
                    background: currentId === s.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                    opacity: currentId === s.id ? 1 : 0.7
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = currentId === s.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent'}
                >
                  <div style={{ transform: 'scale(0.6)' }}>{s.icon}</div>
                  <div style={{ flex: 1 }}>
                     <div style={{ fontSize: 12, fontWeight: 700, color: currentId === s.id ? 'var(--accent)' : 'var(--text-primary)' }}>{s.label}</div>
                     <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{s.sublabel}</div>
                  </div>
                  {currentId === s.id && isPlaying && (
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
                  )}
                </button>
              ))}
            </div>

            {/* Volume Control */}
            <div style={{ paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'JetBrains Mono' }}>
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                 <span style={{ fontSize: 12, opacity: 0.5 }}>🔈</span>
                 <input 
                  type="range" min="0" max="1" step="0.01" 
                  value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                  style={{ flex: 1, accentColor: 'var(--accent)', cursor: 'pointer', height: 4 }}
                 />
                 <span style={{ fontSize: 12, opacity: 0.5 }}>🔊</span>
               </div>
            </div>

            {isError && (
              <div style={{ fontSize: 9, color: '#F87171', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '6px', borderRadius: 8 }}>
                 Playback Error: Track not found in Supabase.
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes playerIn { 
          from { transform: translateY(20px) scale(0.95); opacity: 0; } 
          to { transform: translateY(0) scale(1); opacity: 1; } 
        }
        @keyframes equalizer {
          from { transform: scaleY(0.4); }
          to { transform: scaleY(1); }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); borderRadius: 10px; }
      `}</style>
    </div>
  )
}

function isActiveTrack(track) {
  return track ? true : false
}
