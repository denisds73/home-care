import { useEffect, useRef, useState } from 'react'
import { ENV } from '../config/env'
import { getStoredToken } from '../lib/auth'

interface UseNotificationStreamOptions {
  enabled?: boolean
  onNotification: (data: Record<string, unknown>) => void
}

/**
 * Connects to the SSE notification stream.
 * Uses native EventSource with JWT passed as a query parameter.
 * Built-in auto-reconnect with exponential backoff on errors.
 */
export function useNotificationStream({
  enabled = true,
  onNotification,
}: UseNotificationStreamOptions) {
  const [connected, setConnected] = useState(false)
  const onNotificationRef = useRef(onNotification)

  useEffect(() => {
    onNotificationRef.current = onNotification
  }, [onNotification])

  const retryCountRef = useRef(0)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // This effect manages a long-lived SSE connection — setState calls here
  // synchronize React state with the external EventSource lifecycle.
  useEffect(() => {
    if (!enabled) {
      setConnected(false) // eslint-disable-line react-hooks/set-state-in-effect
      return
    }

    let es: EventSource | null = null
    let disposed = false

    function connect() {
      if (disposed) return

      const token = getStoredToken()
      if (!token) return

      const url = `${ENV.API_URL}/notifications/stream?token=${encodeURIComponent(token)}`
      es = new EventSource(url)

      es.onopen = () => {
        if (disposed) return
        retryCountRef.current = 0
        setConnected(true)
      }

      es.addEventListener('notification', (event: MessageEvent) => {
        if (disposed) return
        try {
          const data = JSON.parse(event.data) as Record<string, unknown>
          onNotificationRef.current(data)
        } catch {
          // malformed event — skip
        }
      })

      es.onerror = () => {
        if (disposed) return
        setConnected(false)
        es?.close()
        es = null

        // Exponential backoff: 1s, 2s, 4s, 8s, ... capped at 30s
        const delay = Math.min(1000 * 2 ** retryCountRef.current, 30_000)
        retryCountRef.current++
        retryTimerRef.current = setTimeout(connect, delay)
      }
    }

    connect()

    // Reconnect when tab becomes visible after being hidden
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !es) {
        retryCountRef.current = 0
        connect()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      disposed = true
      es?.close()
      es = null
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
      setConnected(false)
    }
  }, [enabled])

  return { connected }
}
