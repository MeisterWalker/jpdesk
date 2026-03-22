import React, { useState, useEffect, useRef } from 'react'
import { MusicIcon, RainIcon, OceanIcon, NatureIcon } from './Icons'

const SOUNDS = [
  { 
    id: 'rain',   
    label: 'Rain',   
    icon: <RainIcon size={20} iconSize={12} />, 
    url: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73484.mp3?filename=soft-rain-ambient-111154.mp3'
  },
  { 
    id: 'ocean',  
    label: 'Ocean',  
    icon: <OceanIcon size={20} iconSize={12} />, 
    url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_924b276229.mp3?filename=beach-tides-13233.mp3'
  },
  { 
    id: 'nature', 
    label: 'Nature', 
    icon: <NatureIcon size={20} iconSize={12} />, 
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_6108f90264.mp3?filename=forest-lullaby-110624.mp3'
  },
]

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentId, setCurrentId] = useState('rain')
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  
  const audioRef = useRef(null)
  const menuRef = useRef(null)

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
  }, [currentId])

  const togglePlay = () => {
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
    setCurrentId(id)
    if (!isPlaying) {
      // Auto-start if it was paused
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

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000002 }}>
      {/* Hidden Audio element - The "Hard Fix" engine */}
      <audio 
        ref={audioRef}
        src={currentTrack.url}
        loop
        preload="auto"
        crossOrigin="anonymous"
        onCanPlay={() => setIsLoading(false)}
        onWaiting={() => setIsLoading(true)}
        onError={() => {
          setIsError(true)
          setIsLoading(false)
          setIsPlaying(false)
        }}
      />

      <div style={{ position: 'relative' }}>
        {/* Main Floating Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="glass-reflection"
          style={{
            width: 44, height: 44, borderRadius: 14,
            background: isPlaying ? 'linear-gradient(135deg, var(--accent), var(--accent-2))' : 'var(--surface)',
            border: `1px solid ${isPlaying ? 'var(--accent-border)' : 'var(--border)'}`,
            boxShadow: isPlaying ? '0 8px 24px rgba(99,102,241,0.45)' : '0 4px 16px rgba(0,0,0,0.3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transform: isOpen ? 'scale(0.95)' : 'scale(1)',
          }}
        >
          {isLoading ? (
            <div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          ) : isError ? (
            <span style={{ fontSize: 16 }}>⚠️</span>
          ) : (
            <MusicIcon size={28} iconSize={16} />
          )}
          
          {/* Pulse Effect when playing */}
          {isPlaying && !isLoading && (
            <div style={{
              position: 'absolute', inset: -4, borderRadius: 16,
              border: '2px solid var(--accent)', opacity: 0.5,
              animation: 'pulse 2s cubic-bezier(0.075, 0.82, 0.165, 1) infinite'
            }} />
          )}
        </button>

        {/* Mini Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            style={{
              position: 'absolute', top: 52, right: 0, width: 180,
              background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(16px)',
              border: '1px solid var(--accent-border)', borderRadius: 16,
              padding: '12px', boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
              animation: 'slideInY 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Ambient Sound</span>
              <button 
                onClick={togglePlay}
                style={{ 
                  background: 'var(--accent-soft)', border: 'none', borderRadius: 8, 
                  width: 28, height: 28, cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center' 
                }}
              >
                {isPlaying ? '⏸' : '▶'}
              </button>
            </div>

            {/* Error Message */}
            {isError && (
              <div style={{ fontSize: 9, color: '#F87171', marginBottom: 8, textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '4px', borderRadius: 4 }}>
                Playback failed. Try a different track.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {SOUNDS.map(s => (
                <button
                  key={s.id}
                  onClick={() => selectTrack(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                    borderRadius: 10, border: `1px solid ${currentId === s.id ? 'var(--accent-border)' : 'transparent'}`,
                    background: currentId === s.id ? 'var(--accent-soft)' : 'rgba(255,255,255,0.03)',
                    color: currentId === s.id ? 'var(--accent-muted)' : 'var(--text-primary)',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
                  }}
                >
                  {s.icon}
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                </button>
              ))}
            </div>

            {/* Volume Slider */}
            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Volume</span>
                  <span>{Math.round(volume * 100)}%</span>
               </div>
               <input 
                type="range" min="0" max="1" step="0.01" 
                value={volume} onChange={(e) => setVolume(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
               />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes slideInY { 
          from { transform: translateY(10px); opacity: 0; } 
          to { transform: translateY(0); opacity: 1; } 
        }
      `}</style>
    </div>
  )
}
