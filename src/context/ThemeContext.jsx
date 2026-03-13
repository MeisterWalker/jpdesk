import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('jpdesk_theme') || 'dark')
  const toggleTheme = () => setTheme(t => {
    const next = t === 'dark' ? 'light' : 'dark'
    localStorage.setItem('jpdesk_theme', next)
    return next
  })
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() { return useContext(ThemeContext) }
