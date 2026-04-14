import type { Booking } from '../types/domain'
import type { DelayEvent, DisplayStatus, RescheduleRequest } from '../types/delay'

const TERMINAL: Set<string> = new Set(['completed', 'cancelled', 'rejected'])

export function getDisplayStatus(
  booking: Booking,
  activeDelay: DelayEvent | null,
  activeReschedule: RescheduleRequest | null,
): DisplayStatus {
  if (TERMINAL.has(booking.booking_status)) {
    return booking.booking_status
  }

  if (activeReschedule) {
    if (
      activeReschedule.status === 'proposed' ||
      activeReschedule.status === 'counter_proposed'
    ) {
      return 'rescheduling'
    }
    if (activeReschedule.status === 'accepted' || activeReschedule.status === 'auto_confirmed') {
      return 'rescheduled'
    }
  }

  if (activeDelay?.is_active) {
    if (activeDelay.delay_type === 'cannot_attend') return 'cannot_attend'
    if (activeDelay.delay_type === 'running_late') return 'delayed'
  }

  return booking.booking_status
}
