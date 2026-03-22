import { useState, useEffect, useCallback } from 'react'

const XP_PER_LEVEL = 100
const STORAGE_KEY = 'jpdesk_xp_data'

export function useXPEngine() {
  const [xpData, setXpData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : { xp: 0, level: 1, totalXp: 0 }
  })
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [prevLevel, setPrevLevel] = useState(xpData.level)

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(xpData))
  }, [xpData])

  // Check for level up
  useEffect(() => {
    if (xpData.level > prevLevel) {
      setShowLevelUp(true)
      setPrevLevel(xpData.level)
    }
  }, [xpData.level, prevLevel])

  const addXP = useCallback((amount) => {
    setXpData(prev => {
      const newTotalXp = prev.totalXp + amount
      const newXp = prev.xp + amount
      
      let newLevel = prev.level
      let currentXp = newXp
      
      while (currentXp >= XP_PER_LEVEL) {
        currentXp -= XP_PER_LEVEL
        newLevel += 1
      }
      
      return {
        xp: currentXp,
        level: newLevel,
        totalXp: newTotalXp
      }
    })
  }, [])

  const resetLevelUp = () => setShowLevelUp(false)

  return {
    xp: xpData.xp,
    level: xpData.level,
    totalXp: xpData.totalXp,
    xpProgress: (xpData.xp / XP_PER_LEVEL) * 100,
    addXP,
    showLevelUp,
    resetLevelUp
  }
}
