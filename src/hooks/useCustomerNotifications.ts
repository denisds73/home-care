import { useCallback, useEffect } from 'react'
import { notificationService } from '../services/notificationService'
import { useNotificationStore } from '../store/useNotificationStore'
import { useNotificationStream } from './useNotificationStream'

export function useCustomerNotifications(enabled = true) {
  const items = useNotificationStore((s) => s.items)
  const loading = useNotificationStore((s) => s.loading)
  const mergeItems = useNotificationStore((s) => s.mergeItems)
  const prepend = useNotificationStore((s) => s.prepend)
  const markReadInStore = useNotificationStore((s) => s.markRead)
  const setLoading = useNotificationStore((s) => s.setLoading)

  const load = useCallback(async () => {
    if (!enabled) return
    try {
      const res = await notificationService.getAll()
      const list = Array.isArray(res.data) ? res.data : []
      mergeItems(list as unknown as Record<string, unknown>[])
    } catch {
      /* best-effort load */
    }
  }, [enabled, mergeItems])

  // Initial REST load — run once on mount
  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled])

  // Refresh on tab visibility return (catches anything missed while hidden)
  useEffect(() => {
    if (!enabled) return
    const onVis = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [enabled, load])

  // SSE stream for real-time updates
  useNotificationStream({
    enabled,
    onNotification: prepend,
  })

  const unreadCount = items.filter((n) => !n.read).length
  const highPriorityItems = items.filter(
    (n) => !n.read && (n.priority === 'urgent' || n.priority === 'high'),
  )

  const markAsRead = async (id: string) => {
    markReadInStore(id)
    try {
      await notificationService.markAsRead(id)
    } catch {
      /* best-effort */
    }
  }

  return { items, loading, unreadCount, highPriorityItems, markAsRead, reload: load }
}
