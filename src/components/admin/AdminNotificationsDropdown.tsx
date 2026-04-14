import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationService } from '../../services/notificationService'
import { bookingService } from '../../services/bookingService'
import type { Booking, Notification } from '../../types/domain'
import { formatDate } from '../../data/helpers'
import { adminBookingDetail, ADMIN_NOTIFICATIONS } from '../../lib/adminRoutes'

const POLL_MS = 30_000

function normalizeNotification(raw: Record<string, unknown>): Notification {
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

export const AdminNotificationsDropdown = memo(() => {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notification[]>([])
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([])
  const [pendingTotal, setPendingTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const rootRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (document.visibilityState !== 'visible') return
    try {
      const [notifRes, bookingPage] = await Promise.all([
        notificationService.getAll(),
        bookingService.listForAdmin({ status: 'pending', limit: 15, page: 1 }),
      ])
      const normalized = Array.isArray(notifRes.data)
        ? notifRes.data.map((n) =>
            normalizeNotification(n as unknown as Record<string, unknown>),
          )
        : []
      normalized.sort((a, b) => {
        const order: Record<string, number> = { urgent: 0, high: 1, normal: 2 }
        return (order[a.priority ?? 'normal'] ?? 2) - (order[b.priority ?? 'normal'] ?? 2)
      })
      setItems(normalized)
      setPendingBookings(bookingPage.items ?? [])
      setPendingTotal(
        typeof bookingPage.total === 'number'
          ? bookingPage.total
          : bookingPage.items?.length ?? 0,
      )
    } catch {
      setItems([])
      setPendingBookings([])
      setPendingTotal(0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
    const id = window.setInterval(() => void load(), POLL_MS)
    const onVis = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [load])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const unread = items.filter((n) => !n.read).length
  // Surface whichever signal is higher: live pending queue vs unread inbox items.
  const badgeCount = Math.max(pendingTotal, unread)

  const onPick = async (n: Notification) => {
    try {
      if (!n.read) {
        await notificationService.markAsRead(n.id)
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
      }
    } catch {
      /* best-effort */
    }
    setOpen(false)
    if (n.booking_id) {
      navigate(adminBookingDetail(n.booking_id))
    } else {
      navigate(ADMIN_NOTIFICATIONS)
    }
  }

  const onPickBooking = (b: Booking) => {
    setOpen(false)
    navigate(adminBookingDetail(b.booking_id))
  }

  const preview = items.slice(0, 8)

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        className="p-1.5 rounded-lg hover:bg-muted transition relative"
        aria-label={
          badgeCount > 0
            ? `Notifications, ${badgeCount} attention items`
            : 'Notifications'
        }
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
        {badgeCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-error text-white text-[10px] font-bold leading-none">
            {badgeCount > 9 ? '9+' : badgeCount}
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
            boxShadow: '0 12px 48px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-brand text-sm font-bold text-primary">Notifications</h3>
            {unread > 0 && (
              <span className="text-[0.65rem] font-semibold text-muted bg-muted px-2 py-0.5 rounded-full">
                {unread} unread
              </span>
            )}
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto max-h-[min(22rem,70vh)]">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <div className="w-5 h-5 border-2 border-border border-t-brand rounded-full animate-spin mx-auto" />
                <p className="text-xs text-muted mt-2">Loading...</p>
              </div>
            ) : (
              <>
                {/* Pending bookings section */}
                {pendingBookings.length > 0 && (
                  <div className="border-b border-border">
                    <p className="px-4 pt-3 pb-1.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-muted">
                      Awaiting Assignment
                      {pendingTotal > pendingBookings.length && (
                        <span className="font-normal ml-1">({pendingTotal})</span>
                      )}
                    </p>
                    <ul>
                      {pendingBookings.slice(0, 5).map((b) => (
                        <li key={b.booking_id}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-2.5 hover:bg-surface transition-colors flex items-start gap-3"
                            onClick={() => onPickBooking(b)}
                          >
                            <div className="w-2 h-2 rounded-full bg-error mt-1.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-[0.78rem] font-semibold text-primary truncate">{b.customer_name}</p>
                              <p className="text-[0.7rem] text-muted truncate">{b.service_name} &middot; {formatDate(b.preferred_date)}</p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Notification items */}
                {preview.length > 0 ? (
                  <div>
                    {pendingBookings.length > 0 && (
                      <p className="px-4 pt-3 pb-1.5 text-[0.6rem] font-bold uppercase tracking-[0.08em] text-muted">
                        Recent
                      </p>
                    )}
                    <ul>
                      {preview.map((n) => (
                        <li key={n.id}>
                          <button
                            type="button"
                            className="w-full text-left px-4 py-3 hover:bg-surface transition-colors flex items-start gap-3"
                            onClick={() => void onPick(n)}
                          >
                            {/* Priority indicator dot */}
                            <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              n.priority === 'urgent' ? 'bg-error' :
                              n.priority === 'high' ? 'bg-[#D97706]' :
                              !n.read ? 'bg-brand' : 'bg-border'
                            }`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {n.priority === 'urgent' && (
                                  <span className="shrink-0 text-[0.55rem] font-bold uppercase tracking-[0.06em] text-white bg-error px-1.5 py-[1px] rounded">
                                    Urgent
                                  </span>
                                )}
                                <p className={`text-[0.78rem] font-semibold truncate ${n.read ? 'text-muted' : 'text-primary'}`}>
                                  {n.title}
                                </p>
                              </div>
                              <p className={`text-[0.7rem] line-clamp-2 mt-0.5 leading-relaxed ${n.read ? 'text-muted' : 'text-secondary'}`}>
                                {n.description}
                              </p>
                              <p className="text-[0.6rem] text-muted mt-1">
                                {new Date(n.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })}
                              </p>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : pendingBookings.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <svg className="w-8 h-8 text-border mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-xs text-muted">All caught up</p>
                  </div>
                ) : null}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-border px-4 py-2.5">
            <button
              type="button"
              className="text-[0.75rem] text-brand font-bold w-full py-1 hover:text-brand-dark transition-colors"
              onClick={() => { setOpen(false); navigate(ADMIN_NOTIFICATIONS) }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

AdminNotificationsDropdown.displayName = 'AdminNotificationsDropdown'
