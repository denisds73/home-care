import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../../services/notificationService'
import { useNotificationStore } from '../../store/useNotificationStore'
import { useNotificationStream } from '../../hooks/useNotificationStream'

interface VendorNotificationsDropdownProps {
  /** Path to the full notifications list page (e.g. '/vendor/notifications') */
  notificationsPath: string
  /** Builds the booking detail path from a booking ID */
  bookingDetailPath: (id: string) => string
}

export const VendorNotificationsDropdown = memo(
  ({ notificationsPath, bookingDetailPath }: VendorNotificationsDropdownProps) => {
    const navigate = useNavigate()
    const [open, setOpen] = useState(false)
    const items = useNotificationStore((s) => s.items)
    const storeLoading = useNotificationStore((s) => s.loading)
    const mergeItems = useNotificationStore((s) => s.mergeItems)
    const prepend = useNotificationStore((s) => s.prepend)
    const markReadInStore = useNotificationStore((s) => s.markRead)
    const markAllReadInStore = useNotificationStore((s) => s.markAllRead)
    const rootRef = useRef<HTMLDivElement>(null)
    const loadedRef = useRef(false)

    const load = useCallback(async () => {
      try {
        const res = await notificationService.getAll()
        const list = Array.isArray(res.data) ? res.data : []
        mergeItems(list as unknown as Record<string, unknown>[])
      } catch {
        /* best-effort */
      }
    }, [mergeItems])

    useEffect(() => {
      if (!loadedRef.current) {
        loadedRef.current = true
        void load()
      }
    }, [load])

    // SSE stream for real-time updates
    useNotificationStream({ enabled: true, onNotification: prepend })

    // Close on outside click
    useEffect(() => {
      if (!open) return
      const close = (e: MouseEvent) => {
        if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
      }
      document.addEventListener('mousedown', close)
      return () => document.removeEventListener('mousedown', close)
    }, [open])

    const unreadCount = items.filter((n) => !n.read).length

    const onMarkAllRead = async () => {
      markAllReadInStore()
      try {
        await notificationService.markAllAsRead()
      } catch {
        /* best-effort */
      }
    }

    const onPick = async (n: { id: string; read: boolean; booking_id?: string | null }) => {
      try {
        if (!n.read) {
          markReadInStore(n.id)
          await notificationService.markAsRead(n.id)
        }
      } catch {
        /* best-effort */
      }
      setOpen(false)
      if (n.booking_id) {
        navigate(bookingDetailPath(n.booking_id))
      } else {
        navigate(notificationsPath)
      }
    }

    const preview = items.slice(0, 8)

    return (
      <div className="relative" ref={rootRef}>
        <button
          type="button"
          className="p-1.5 rounded-lg hover:bg-muted transition relative"
          aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
          onClick={() => setOpen((o) => !o)}
        >
          <svg
            className="w-5 h-5 text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-error text-white text-[10px] font-bold leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {open && (
          <div
            className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,24rem)] flex flex-col z-50 overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(16px) saturate(140%)',
              WebkitBackdropFilter: 'blur(16px) saturate(140%)',
              border: '1px solid var(--color-border)',
              borderRadius: '16px',
              boxShadow:
                '0 12px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="font-brand text-sm font-bold text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  type="button"
                  className="text-[0.65rem] font-semibold text-brand hover:text-brand-dark transition-colors"
                  onClick={() => void onMarkAllRead()}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[min(22rem,70vh)]">
              {storeLoading ? (
                <div className="px-4 py-8 text-center">
                  <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-muted mt-2">Loading...</p>
                </div>
              ) : preview.length > 0 ? (
                <ul>
                  {preview.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-surface transition-colors flex items-start gap-3"
                        onClick={() => void onPick(n)}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            n.read
                              ? 'bg-border'
                              : n.priority === 'urgent'
                                ? 'bg-error'
                                : n.priority === 'high'
                                  ? 'bg-[#D97706]'
                                  : 'bg-brand'
                          }`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {n.priority === 'urgent' && (
                              <span className="shrink-0 text-[0.55rem] font-bold uppercase tracking-[0.06em] text-white bg-error px-1.5 py-[1px] rounded">
                                Urgent
                              </span>
                            )}
                            <p
                              className={`text-[0.78rem] font-semibold truncate ${n.read ? 'text-muted' : 'text-primary'}`}
                            >
                              {n.title}
                            </p>
                          </div>
                          <p
                            className={`text-[0.7rem] line-clamp-2 mt-0.5 leading-relaxed ${n.read ? 'text-muted' : 'text-secondary'}`}
                          >
                            {n.description}
                          </p>
                          <p className="text-[0.6rem] text-muted mt-1">
                            {new Date(n.timestamp).toLocaleString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center">
                  <svg
                    className="w-8 h-8 text-border mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <p className="text-xs text-muted">All caught up</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2.5">
              <button
                type="button"
                className="text-[0.75rem] text-brand font-bold w-full py-1 hover:text-brand-dark transition-colors"
                onClick={() => {
                  setOpen(false)
                  navigate(notificationsPath)
                }}
              >
                View all notifications
              </button>
            </div>
          </div>
        )}
      </div>
    )
  },
)

VendorNotificationsDropdown.displayName = 'VendorNotificationsDropdown'
