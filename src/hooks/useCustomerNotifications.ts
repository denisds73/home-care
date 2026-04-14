import { useCallback, useEffect, useRef, useState } from 'react'
import { notificationService } from '../services/notificationService'
import type { Notification } from '../types/domain'

const POLL_MS = 30_000

function normalize(raw: Record<string, unknown>): Notification {
  const bookingId =
    (raw.booking_id as string | null | undefined) ??
    (raw.bookingId as string | null | undefined) ??
    null
  return {
    id: String(raw.id),
    type: raw.type as Notification['type'],
    title: String(raw.title ?? ''),
    description: String(raw.description ?? ''),
    timestamp:
      typeof raw.timestamp === 'string'
        ? raw.timestamp
        : (raw.timestamp as Date)?.toISOString?.() ?? new Date().toISOString(),
    read: Boolean(raw.read),
    booking_id: bookingId,
    priority: (raw.priority as string) ?? 'normal',
  } as Notification
}

const PRIORITY_ORDER: Record<string, number> = { urgent: 0, high: 1, normal: 2 }

export function useCustomerNotifications() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = useCallback(async () => {
    if (document.visibilityState !== 'visible') return
    try {
      const res = await notificationService.getAll()
      const list = Array.isArray(res.data)
        ? res.data.map((n) => normalize(n as unknown as Record<string, unknown>))
        : []
      list.sort(
        (a, b) =>
          (PRIORITY_ORDER[a.priority ?? 'normal'] ?? 2) -
          (PRIORITY_ORDER[b.priority ?? 'normal'] ?? 2),
      )
      setItems(list)
    } catch {
      /* best-effort polling */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    intervalRef.current = setInterval(() => void load(), POLL_MS)
    const onVis = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [load])

  const unreadCount = items.filter((n) => !n.read).length
  const highPriorityItems = items.filter(
    (n) => !n.read && (n.priority === 'urgent' || n.priority === 'high'),
  )

  const markAsRead = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
    try {
      await notificationService.markAsRead(id)
    } catch {
      /* best-effort */
    }
  }

  return { items, loading, unreadCount, highPriorityItems, markAsRead, reload: load }
}
