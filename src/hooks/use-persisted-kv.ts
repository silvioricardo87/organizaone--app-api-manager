import { useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { storage } from '@/lib/storage'

export function usePersistedKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((current: T) => T)) => void, () => void] {
  const [value, setValue, deleteValue] = useKV<T>(key, defaultValue)

  useEffect(() => {
    const storedValue = storage.get<T>(key)
    if (storedValue !== null && value === defaultValue) {
      setValue(storedValue)
    }
  }, [])

  useEffect(() => {
    if (value !== null && value !== undefined) {
      storage.set(key, value)
    }
  }, [value, key])

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
