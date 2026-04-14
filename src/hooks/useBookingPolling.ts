import { useCallback, useEffect, useRef, useState } from 'react'
import { bookingService } from '../services/bookingService'
import type { Booking } from '../types/domain'

const POLL_INTERVAL_MS = 10_000

function isToday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10)
  return dateStr === today
}

export function useBookingPolling(
  bookingId: string | undefined,
  preferredDate: string | undefined,
): { booking: Booking | null; isPolling: boolean } {
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const shouldPoll = !!(bookingId && preferredDate && isToday(preferredDate))

  const poll = useCallback(async () => {
    if (!bookingId) return
    try {
      const b = await bookingService.getById(bookingId)
      setBooking(b)
    } catch {
      // Silently fail on poll — next tick will retry
    }
  }, [bookingId])

  useEffect(() => {
    if (!shouldPoll) {
      setIsPolling(false)
      return
    }

    setIsPolling(true)

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        poll()
        if (!intervalRef.current) {
          intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
        }
      } else {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }
    }

    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibility)
      setIsPolling(false)
    }
  }, [shouldPoll, poll])

  return { booking, isPolling }
}
