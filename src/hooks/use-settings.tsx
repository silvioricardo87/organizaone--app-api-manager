import { createContext, useContext, ReactNode, useEffect } from 'react'
import { translations, Language } from '@/lib/i18n'
import { usePersistedKV } from '@/hooks/use-persisted-kv'
import { STORAGE_KEYS } from '@/lib/storage'

type Theme = 'light' | 'dark' | 'system'

interface SettingsContextType {
  language: Language
  setLanguage: (lang: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  t: typeof translations.en
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = usePersistedKV<Language>(STORAGE_KEYS.LANGUAGE, 'pt')
  const [theme, setTheme] = usePersistedKV<Theme>(STORAGE_KEYS.THEME, 'light')

  const currentLanguage = (language ?? 'pt') as Language
  const currentTheme = (theme ?? 'light') as Theme

  useEffect(() => {
    const root = document.documentElement
    
    if (currentTheme === 'dark') {
      root.classList.add('dark')
    } else if (currentTheme === 'light') {
      root.classList.remove('dark')
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }
  }, [currentTheme])

  useEffect(() => {
    if (currentTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e: MediaQueryListEvent) => {
        if (e.matches) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [currentTheme])

  const t = translations[currentLanguage] || translations.pt

  return (
    <SettingsContext.Provider
      value={{
        language: currentLanguage,
        setLanguage: (lang) => setLanguage(lang),
        theme: currentTheme,
        setTheme: (newTheme) => setTheme(newTheme),
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}
