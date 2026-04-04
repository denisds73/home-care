import { useState, useEffect } from 'react'
import useStore from '../../store/useStore'
import { notificationService } from '../../services/notificationService'
import type { Notification } from '../../types/domain'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const showToast = useStore(state => state.showToast)

  const fetchNotifications = async () => {
    try {
      setError(null)
      const result = await notificationService.getAll()
      setNotifications(result.data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load notifications'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark notification as read'
      showToast(message, 'danger')
    }
  }

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to mark all as read'
      showToast(message, 'danger')
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const grouped = notifications.reduce<Record<string, Notification[]>>((acc, n) => {
    const date = new Date(n.timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(n)
    return acc
  }, {})

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-primary mb-4">Notifications</h1>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-muted border-t-brand rounded-full animate-spin" />
          <p className="text-muted text-sm mt-3">Loading notifications...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-primary mb-4">Notifications</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
          <p className="text-error text-sm font-medium">{error}</p>
          <button
            className="btn-base btn-secondary px-4 py-2 text-sm mt-4"
            onClick={() => { setIsLoading(true); fetchNotifications() }}
            aria-label="Retry loading notifications"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-primary mb-4">Notifications</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
          <span className="text-4xl mb-3" role="img" aria-label="No notifications">🔔</span>
          <h3 className="font-brand text-base font-semibold text-primary">No notifications yet</h3>
          <p className="text-muted text-sm mt-1">You will see your notifications here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-primary">Notifications</h1>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} className="text-xs text-brand font-semibold">
            Mark all as read
          </button>
        )}
      </div>

      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="mb-6">
          <p className="text-xs font-semibold text-muted uppercase mb-2">{date}</p>
          <div className="space-y-2">
            {items.map(n => (
              <button
                key={n.id}
                type="button"
                onClick={() => { if (!n.read) markAsRead(n.id) }}
                className={`glass-card p-4 flex items-start gap-3 w-full text-left ${!n.read ? 'border-l-[3px] border-l-brand cursor-pointer' : 'cursor-default'}`}
                aria-label={n.read ? n.title : `Mark "${n.title}" as read`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary">{n.title}</p>
                  <p className="text-xs text-secondary mt-0.5">{n.description}</p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(n.timestamp).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
