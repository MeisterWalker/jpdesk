import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

const ACCENTS = [
  { id: 'indigo',  label: 'Indigo',  primary: '#6366F1', secondary: '#8B5CF6' },
  { id: 'blue',    label: 'Blue',    primary: '#3B82F6', secondary: '#60A5FA' },
  { id: 'cyan',    label: 'Cyan',    primary: '#06B6D4', secondary: '#22D3EE' },
  { id: 'emerald', label: 'Emerald', primary: '#10B981', secondary: '#34D399' },
  { id: 'rose',    label: 'Rose',    primary: '#F43F5E', secondary: '#FB7185' },
  { id: 'orange',  label: 'Orange',  primary: '#F97316', secondary: '#FB923C' },
  { id: 'amber',   label: 'Amber',   primary: '#F59E0B', secondary: '#FBBF24' },
  { id: 'pink',    label: 'Pink',    primary: '#EC4899', secondary: '#F472B6' },
]

export { ACCENTS }

export function ThemeProvider({ children }) {
  const [theme, setTheme]   = useState(() => localStorage.getItem('jpdesk_theme') || 'dark')
  const [accent, setAccent] = useState(() => localStorage.getItem('jpdesk_accent') || 'indigo')

  const toggleTheme = () => setTheme(t => {
    const next = t === 'dark' ? 'light' : 'dark'
    localStorage.setItem('jpdesk_theme', next)
    return next
  })

  const changeAccent = (id) => {
    localStorage.setItem('jpdesk_accent', id)
    setAccent(id)
  }

  // Apply accent CSS vars
  useEffect(() => {
    const a = ACCENTS.find(x => x.id === accent) || ACCENTS[0]
    document.documentElement.style.setProperty('--accent', a.primary)
    document.documentElement.style.setProperty('--accent-2', a.secondary)
    document.documentElement.style.setProperty('--accent-soft', `${a.primary}18`)
    document.documentElement.style.setProperty('--accent-border', `${a.primary}35`)
  }, [accent])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accent, changeAccent, accents: ACCENTS }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() { return useContext(ThemeContext) }
