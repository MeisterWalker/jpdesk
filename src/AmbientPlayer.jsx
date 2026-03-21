import { useEffect, useRef, useState } from 'react'

const AMBIENT_SOUNDS = {
  rain:    { label: 'Rain',    url: 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' },
  bubbles: { label: 'Ocean',   url: 'https://actions.google.com/sounds/v1/water/ocean_waves.ogg' },
  leaves:  { label: 'Nature',  url: 'https://actions.google.com/sounds/v1/animals/forest_birds.ogg' },
  stars:   { label: 'Midnight', url: 'https://actions.google.com/sounds/v1/ambiences/city_street_traffic.ogg' }, 
  hearts:  { label: 'Kawaii',  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  slate:   { label: 'Slate',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
  sunset:  { label: 'Sunset',  url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_shore.ogg' },
  none:    { label: 'Silent',  url: '' }
}

export default function AmbientPlayer({ type, isPlaying, volume = 0.5 }) {
  const audioRef = useRef(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!isPlaying || !type || type === 'none') {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      return
    }

    const sound = AMBIENT_SOUNDS[type] || AMBIENT_SOUNDS.none
    if (!sound.url) return

    const audio = new Audio()
    audio.src = sound.url.startsWith('http') ? sound.url : (window.location.origin + sound.url)
    audio.loop = true
    audio.volume = volume
    
    const startPlayback = () => {
      audio.play().catch(e => {
        console.warn("Ambient playback blocked or failed:", e)
        setError(true)
      })
    }

    startPlayback()
    audioRef.current = audio

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current = null
      }
    }
  }, [type, isPlaying])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  if (error) return null // Silently fail if audio can't play
  return null // Headless component
}
