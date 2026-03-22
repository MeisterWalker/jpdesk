import React, { useState, useEffect, useRef } from 'react'
import { MusicIcon, RainIcon, OceanIcon, NatureIcon } from './Icons'
import { supabase } from '../lib/supabase'

// Configuration for Supabase Storage
const BUCKET_NAME = 'ambient-sounds'
const SOUND_FILES = {
  rain: 'rain.mp3',
  ocean: 'ocean.mp3',
  nature: 'ES_Water, Surf, Seaside, Big, Waves, Little Hut Bay 02 - Epidemic Sound.mp3'
}

const SOUNDS = [
  { 
    id: 'rain',   
    label: 'Rain',   
    icon: <RainIcon size={20} iconSize={12} />, 
    filename: SOUND_FILES.rain
  },
  { 
    id: 'ocean',  
    label: 'Ocean',  
    icon: <OceanIcon size={20} iconSize={12} />, 
    filename: SOUND_FILES.ocean
  },
  { 
    id: 'nature', 
    label: 'Nature', 
    icon: <NatureIcon size={20} iconSize={12} />, 
    filename: SOUND_FILES.nature
  },
]

export default function MusicPlayer() {
  const [isOpen, setIsOpen] = useState(false)
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
      // Debugging: Log the URL so user can check it
      console.log(`MusicPlayer: Loading track "${currentId}" from ${publicUrl}`)
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
        console.error('Supabase Playback failed:', e)
        setIsPlaying(false)
        setIsError(true)
      })
    }
  }, [audioUrl])

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
          console.error('Supabase Audio start blocked/failed:', e)
          setIsError(true)
        })
    }
  }

  const selectTrack = (id) => {
    setCurrentId(id)
    if (!isPlaying) {
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

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 1000002 }}>
      {/* Hidden Audio element - The "Supabase Hard Fix" engine */}
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
              position: 'absolute', top: 52, right: 0, width: 220,
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

            {/* Error Message with Instructions */}
            {isError && (
              <div style={{ 
                fontSize: 9, color: '#F87171', marginBottom: 10, textAlign: 'left', 
                background: 'rgba(239,68,68,0.1)', padding: '8px', borderRadius: 8,
                border: '1px solid rgba(239,68,68,0.2)'
              }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>SOUND NOT FOUND</div>
                Please ensure you have:
                <ul style={{ paddingLeft: 12, marginTop: 4 }}>
                  <li>1. Private/Public bucket: <b>{BUCKET_NAME}</b></li>
                  <li>2. Uploaded: <b>{SOUND_FILES[currentId]}</b></li>
                </ul>
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
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</span>
                    <span style={{ fontSize: 8, opacity: 0.5, maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.filename}</span>
                  </div>
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
