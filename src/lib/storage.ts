export const STORAGE_KEYS = {
  LANGUAGE: 'app-language',
  THEME: 'app-theme',
  APIS: 'apis',
}

export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error getting item from localStorage (${key}):`, error)
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error setting item in localStorage (${key}):`, error)
    }
  },

  remove(key: string): void {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing item from localStorage (${key}):`, error)
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
    const key = `api-config-${apiId}`
    return storage.get<T>(key)
  },

  setAPIConfig<T>(apiId: string, config: T): void {
    const key = `api-config-${apiId}`
    storage.set(key, config)
  },

  removeAPIConfig(apiId: string): void {
    const key = `api-config-${apiId}`
    storage.remove(key)
  },

  getAllAPIConfigs(): string[] {
    try {
      const keys = Object.keys(localStorage)
      return keys.filter(key => key.startsWith('api-config-'))
    } catch (error) {
      console.error('Error getting all API configs:', error)
      return []
    }
  }
}
