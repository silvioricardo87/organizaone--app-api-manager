import { useEffect, useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { storage } from '@/lib/storage'

export function usePersistedKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((current: T) => T)) => void, () => void] {
  const [isInitialized, setIsInitialized] = useState(false)
  const [value, setValue, deleteValue] = useKV<T>(key, defaultValue)

  useEffect(() => {
    if (!isInitialized) {
      const storedValue = storage.get<T>(key)
      if (storedValue !== null) {
        setValue(storedValue)
      }
      setIsInitialized(true)
    }
  }, [key, isInitialized])

  useEffect(() => {
    if (isInitialized && value !== null && value !== undefined) {
      storage.set(key, value)
    }
  }, [value, key, isInitialized])

  const wrappedSetValue = (newValue: T | ((current: T) => T)) => {
    setValue((currentValue) => {
      const actualCurrentValue = currentValue ?? defaultValue
      const resolvedValue =
        typeof newValue === 'function' ? (newValue as (current: T) => T)(actualCurrentValue) : newValue

      storage.set(key, resolvedValue)
      return resolvedValue
    })
  }

  const wrappedDeleteValue = () => {
    storage.remove(key)
    deleteValue()
  }

  return [value ?? defaultValue, wrappedSetValue, wrappedDeleteValue]
}
