import { useState } from 'react'
import { mockNotifications } from '../../data/mockData'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications)

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = notifications.filter(n => !n.read).length

  const grouped = notifications.reduce<Record<string, typeof notifications>>((acc, n) => {
    const date = new Date(n.timestamp).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    if (!acc[date]) acc[date] = []
    acc[date].push(n)
    return acc
  }, {})

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
              <div
                key={n.id}
                className={`glass-card p-4 flex items-start gap-3 ${!n.read ? 'border-l-[3px] border-l-brand' : ''}`}
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
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
