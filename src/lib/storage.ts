export const STORAGE_KEYS = {
  APIS: 'openfinance-apis',
  THEME: 'app-theme',
} as const
export con

      return item ? JSON
      console.error(`Error readin
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error)
    }
  },

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },
}
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage key "${key}":`, error)
    }
  },

  clear(): void {
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },

  getAPIConfig<T>(apiId: string): T | null {
    const key = `${STORAGE_KEYS.API_CONFIG_PREFIX}${apiId}`
    return storage.get<T>(key)
  },

  setAPIConfig<T>(apiId: string, config: T): void {
    const key = `${STORAGE_KEYS.API_CONFIG_PREFIX}${apiId}`
    storage.set<T>(key, config)
  },

  removeAPIConfig(apiId: string): void {
    const key = `${STORAGE_KEYS.API_CONFIG_PREFIX}${apiId}`
    storage.remove(key)
  },

  getAllAPIConfigs(): string[] {
    try {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith(STORAGE_KEYS.API_CONFIG_PREFIX)) {
          keys.push(key)
        }
      }
      return keys
    } catch (error) {
      console.error('Error getting all API configs:', error)
      return []
    }
  },
}

