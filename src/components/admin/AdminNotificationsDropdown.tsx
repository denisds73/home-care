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
        <div className="absolute right-0 top-full mt-2 w-[min(100vw-2rem,22rem)] max-h-[min(24rem,80vh)] overflow-y-auto glass-card border border-default shadow-lg z-50 py-1">
          {loading ? (
            <p className="px-3 py-4 text-xs text-muted text-center">Loading…</p>
          ) : (
            <>
              {pendingBookings.length > 0 && (
                <div className="border-b border-default pb-1 mb-1">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                    Awaiting vendor assignment
                    {pendingTotal > pendingBookings.length ? (
                      <span className="font-normal text-secondary"> ({pendingTotal} total)</span>
                    ) : null}
                  </p>
                  <ul className="max-h-48 overflow-y-auto">
                    {pendingBookings.map((b) => (
                      <li key={b.booking_id}>
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2.5 text-sm hover:bg-surface transition border-l-[3px] border-l-error"
                          onClick={() => onPickBooking(b)}
                        >
                          <span className="font-medium text-primary block truncate">
                            {b.customer_name}
                          </span>
                          <span className="text-xs text-muted truncate block mt-0.5">
                            {b.service_name} · {b.booking_id.slice(0, 8)}…
                          </span>
                          <span className="text-[10px] text-secondary mt-0.5 block">
                            {formatDate(b.preferred_date)}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {preview.length > 0 ? (
                <>
                  {pendingBookings.length > 0 ? (
                    <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wide text-muted">
                      Inbox
                    </p>
                  ) : null}
                  <ul className="divide-y divide-default">
                    {preview.map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          className={`w-full text-left px-3 py-2.5 text-sm hover:bg-surface transition border-l-[3px] ${
                            n.priority === 'urgent' ? 'border-l-error' : n.priority === 'high' ? 'border-l-[#D97706]' : !n.read ? 'border-l-brand' : 'border-l-transparent'
                          }`}
                          onClick={() => void onPick(n)}
                        >
                          <p className="text-xs font-semibold text-primary leading-snug">
                            {n.priority === 'urgent' && (
                              <span className="inline-block text-[0.6rem] font-bold uppercase tracking-wider text-error bg-error-soft px-1.5 py-0.5 rounded mr-1.5">
                                Urgent
                              </span>
                            )}
                            {n.title}
                          </p>
                          <span className="text-xs text-muted line-clamp-2 mt-0.5">{n.description}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : pendingBookings.length === 0 ? (
                <p className="px-3 py-4 text-xs text-muted text-center">No notifications</p>
              ) : null}
            </>
          )}
          <div className="border-t border-default px-2 py-1.5">
            <button
              type="button"
              className="text-xs text-brand font-semibold w-full py-1.5"
              onClick={() => {
                setOpen(false)
                navigate(ADMIN_NOTIFICATIONS)
              }}
            >
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

AdminNotificationsDropdown.displayName = 'AdminNotificationsDropdown'
