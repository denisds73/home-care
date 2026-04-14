import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { bookingService } from '../../services/bookingService'
import { VendorRequestCard, EmptyState } from '../../components/vendor'
import { CalendarIcon, ClipboardIcon, WrenchIcon, PackageIcon } from '../../components/common/Icons'
import useStore from '../../store/useStore'
import type { Booking, BookingStatus } from '../../types/domain'

type TabKey = BookingStatus

const TABS: { key: TabKey; label: string }[] = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'rejected', label: 'Rejected' },
]

const EMPTY_MESSAGES: Partial<Record<TabKey, { title: string; desc: string; icon: typeof CalendarIcon }>> = {
  assigned: { title: 'No new assignments', desc: 'New admin assignments will appear here.', icon: CalendarIcon },
  accepted: { title: 'No accepted jobs', desc: 'Jobs you accept will appear here.', icon: ClipboardIcon },
  in_progress: { title: 'No jobs in progress', desc: 'Active jobs will appear here once started.', icon: WrenchIcon },
  completed: { title: 'No completed jobs yet', desc: 'Finished jobs will appear here.', icon: PackageIcon },
}

export default function VendorRequestsPage() {
  const showToast = useStore((s) => s.showToast)
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = (searchParams.get('status') as TabKey | null) ?? 'assigned'
  const [tab, setTab] = useState<TabKey>(initial)
  const [items, setItems] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null)
  const [updatingAction, setUpdatingAction] = useState<'accept' | 'reject' | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await bookingService.listForVendor({ status: tab })
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests')
    } finally {
      setIsLoading(false)
    }
  }, [tab])

  useEffect(() => { load() }, [load])

  const handleAccept = async (bookingId: string) => {
    try {
      setUpdatingBookingId(bookingId)
      setUpdatingAction('accept')
      await bookingService.accept(bookingId)
      showToast('Job accepted', 'success')
      await load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to accept job', 'danger')
    } finally {
      setUpdatingBookingId(null)
      setUpdatingAction(null)
    }
  }

  const handleReject = async (bookingId: string) => {
    try {
      setUpdatingBookingId(bookingId)
      setUpdatingAction('reject')
      await bookingService.reject(bookingId)
      showToast('Job rejected', 'warning')
      await load()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reject job', 'danger')
    } finally {
      setUpdatingBookingId(null)
      setUpdatingAction(null)
    }
  }

  const changeTab = (next: TabKey) => {
    setTab(next)
    setSearchParams({ status: next }, { replace: true })
  }

  const emptyInfo = EMPTY_MESSAGES[tab]
  const EmptyIcon = emptyInfo?.icon ?? CalendarIcon

  return (
    <div className="space-y-5">
      {/* Pill tab bar */}
      <div className="glass-card no-hover p-1.5 inline-flex gap-1 flex-wrap">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => changeTab(t.key)}
              className={`text-xs px-4 py-2 min-h-[40px] rounded-lg font-medium transition-colors ${
                active
                  ? 'btn-base btn-primary'
                  : 'text-secondary hover:bg-surface'
              }`}
            >
              {t.label}
              {!isLoading && active && items.length > 0 && (
                <span className="ml-1.5 opacity-70">({items.length})</span>
              )}
            </button>
          )
        })}
      </div>

      {error ? (
        <div className="glass-card p-6 text-center">
          <p className="text-error text-sm mb-3">{error}</p>
          <button type="button" onClick={load} className="btn-base btn-primary text-sm px-5 py-2 min-h-[44px]">
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="glass-card p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-surface rounded" />
                  <div className="h-3 w-64 bg-surface rounded" />
                  <div className="h-3 w-48 bg-surface rounded" />
                </div>
                <div className="space-y-2">
                  <div className="h-5 w-16 bg-surface rounded-full" />
                  <div className="h-5 w-14 bg-surface rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<EmptyIcon className="w-12 h-12" />}
          title={emptyInfo?.title ?? 'No requests in this category'}
          description={emptyInfo?.desc ?? 'Requests matching this filter will appear here.'}
        />
      ) : (
        <div className="space-y-3">
          {items.map((b, i) => (
            <VendorRequestCard
              key={b.booking_id}
              booking={b}
              onAccept={handleAccept}
              onReject={handleReject}
              isAccepting={updatingBookingId === b.booking_id && updatingAction === 'accept'}
              isRejecting={updatingBookingId === b.booking_id && updatingAction === 'reject'}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
