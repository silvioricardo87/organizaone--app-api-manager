import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { usePersistedKV } from '@/hooks/use-persisted-kv'
import { STORAGE_KEYS } from '@/lib/storage'

type Theme = 'light' | 'dark' | 'system'
export type Language = 'en' | 'pt'

interface SettingsContextType {
  language: Language
  setLanguage: (lang: Language) => void
  theme: Theme
  setTheme: (theme: Theme) => void
  t: (key: string) => string
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [language, setLanguagePersisted] = usePersistedKV<Language>(STORAGE_KEYS.LANGUAGE, 'pt')
  const [theme, setTheme] = usePersistedKV<Theme>(STORAGE_KEYS.THEME, 'light')
  const { t, i18n } = useTranslation()

  const currentLanguage = (language ?? 'pt') as Language
  const currentTheme = (theme ?? 'light') as Theme

  const handleSetLanguage = (lang: Language) => {
    setLanguagePersisted(lang)
    i18n.changeLanguage(lang)
  }

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

  return (
    <SettingsContext.Provider
      value={{
        language: currentLanguage,
        setLanguage: handleSetLanguage,
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
