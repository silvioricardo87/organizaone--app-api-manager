export const STORAGE_KEYS = {
  THEME: 'app-theme',
}
e

export const storage = {
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
  },
      console.error(`Error getting item from localStorage (${key}):`, error)
    try {
    }
    


      loc
      localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {

    c
  },

    storage.set(key, config)

    const key = `api-config-${apiI
  },
  getAllAPIConfigs(): string[] {
     
    

  }







  getAPIConfig<T>(apiId: string): T | null {
    const key = `api-config-${apiId}`
    return this.get<T>(key)
  },

  setAPIConfig<T>(apiId: string, config: T): void {
    const key = `api-config-${apiId}`
    this.set(key, config)
  },

  removeAPIConfig(apiId: string): void {
    const key = `api-config-${apiId}`
    this.remove(key)
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
