import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/useAuthStore'

/**
 * Restores the auth session on app mount by checking localStorage for a saved token
 * and verifying it against the backend. Returns `isLoading` so the app can show
 * a loading spinner while the session is being restored.
 */
export function useAuthInit(): { isLoading: boolean } {
  const [isLoading, setIsLoading] = useState(() => {
    return localStorage.getItem('homecare_token') !== null
  })

  const restoreSession = useAuthStore((s) => s.restoreSession)

  useEffect(() => {
    const token = localStorage.getItem('homecare_token')
    if (!token) {
      setIsLoading(false)
      return
    }

    restoreSession().finally(() => {
      setIsLoading(false)
    })
  }, [restoreSession])

  return { isLoading }
}
