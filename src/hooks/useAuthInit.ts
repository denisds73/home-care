import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { getStoredToken } from '../lib/auth'

const RESTORE_TIMEOUT_MS = 10_000

/**
 * Restores the auth session on app mount by checking localStorage for a saved token
 * and verifying it against the backend. Returns `isLoading` so the app can show
 * a loading spinner while the session is being restored.
 */
export function useAuthInit(): { isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(() => {
    return getStoredToken() !== null
  })

  const restoreSession = useAuthStore((s) => s.restoreSession)

  useEffect(() => {
    const token = getStoredToken()
    if (!token) return

    let cancelled = false

    const safety = setTimeout(() => {
      if (!cancelled) setIsLoading(false)
    }, RESTORE_TIMEOUT_MS)

    restoreSession().finally(() => {
      cancelled = true
      clearTimeout(safety)
      setIsLoading(false)
    })

    return () => {
      cancelled = true
      clearTimeout(safety)
    }
  }, [restoreSession])

  return { isLoading }
}
