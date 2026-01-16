export const STORAGE_KEYS = {
  LANGUAGE: 'app-lang
  APIS: 'apis',

  get<T>(k

    } catch (error) {
      return null
    try {
  set<T>(key: string, value: T): void {
      localStorage.setItem(key, JSON.string
      console.error(`
  },
  remove(key: str
     
    

  clear(): void {
      loc
      console.error('Error clearing localStorage:', er
  },
  getAPIConfig<T>(apiId: string): T | null {
    r


  },
  removeA
    storage.remove(key)

    try {
     
    

      return keys
      con
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  },

  getAPIConfig<T>(apiId: string): T | null {






























