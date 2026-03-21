import { useEffect, useRef, useState } from 'react'

const AMBIENT_SOUNDS = {
  rain:    { label: 'Rain',    url: 'https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg' },
  bubbles: { label: 'Waves',   url: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_shore.ogg' },
  leaves:  { label: 'Forest',  url: 'https://actions.google.com/sounds/v1/ambient/morning_forest.ogg' },
  stars:   { label: 'Lo-Fi',   url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' }, // Placeholder for Lo-Fi
  hearts:  { label: 'Soft',    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }, // Placeholder for Soft
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

    const play = () => {
      const audio = new Audio(sound.url)
      audio.loop = true
      audio.volume = volume
      audio.play().catch(() => setError(true))
      audioRef.current = audio
    }

    if (audioRef.current) {
      audioRef.current.pause()
    }
    play()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
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
