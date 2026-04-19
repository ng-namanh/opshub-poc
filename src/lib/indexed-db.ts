import { useState, useEffect, useCallback } from 'react'

const DB_NAME = 'docx-form-filler'
const DB_VERSION = 1
const STORE_NAME = 'form-state'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME)
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getItem<T>(key: string): Promise<T | undefined> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(key)
    request.onsuccess = () => resolve(request.result as T | undefined)
    request.onerror = () => reject(request.error)
  })
}

async function setItem<T>(key: string, value: T): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const request = tx.objectStore(STORE_NAME).put(value, key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function removeItem(key: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const request = tx.objectStore(STORE_NAME).delete(key)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Drop-in replacement for useState that persists to IndexedDB.
 * On mount, rehydrates from IndexedDB so state survives page reloads.
 */
export function useIndexedDBState<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [state, setState] = useState<T>(initialValue)
  const [hydrated, setHydrated] = useState(false)

  // Rehydrate on mount
  useEffect(() => {
    getItem<T>(key)
      .then((stored) => {
        if (stored !== undefined) {
          setState(stored)
        }
      })
      .finally(() => setHydrated(true))
  }, [key])

  // Persist to IndexedDB whenever state changes (after hydration)
  useEffect(() => {
    if (!hydrated) return
    setItem(key, state).catch(console.error)
  }, [key, state, hydrated])

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === 'function'
          ? (value as (prev: T) => T)(prev)
          : value
        return next
      })
    },
    []
  )

  const clearValue = useCallback(() => {
    setState(initialValue)
    removeItem(key).catch(console.error)
  }, [key, initialValue])

  return [state, setValue, clearValue]
}
