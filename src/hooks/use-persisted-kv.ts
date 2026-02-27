import { useState, useCallback, useRef, useEffect } from 'react'
import { storage } from '@/lib/storage'

export function usePersistedKV<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((current: T) => T)) => void, () => void] {
  const [value, setValueState] = useState<T>(() => {
    const stored = storage.get<T>(key)
    return stored !== null ? stored : defaultValue
  })

  const valueRef = useRef(value)
  useEffect(() => {
    valueRef.current = value
  }, [value])

  const setValue = useCallback((newValue: T | ((current: T) => T)) => {
    setValueState((current) => {
      const resolved =
        typeof newValue === 'function'
          ? (newValue as (current: T) => T)(current ?? defaultValue)
          : newValue
      storage.set(key, resolved)
      return resolved
    })
  }, [key, defaultValue])

  const deleteValue = useCallback(() => {
    storage.remove(key)
    setValueState(defaultValue)
  }, [key, defaultValue])

  return [value ?? defaultValue, setValue, deleteValue]
}
