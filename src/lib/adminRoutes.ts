import type { BookingStatus, VendorStatus } from '../types/domain'

export const ADMIN_DASHBOARD = '/admin'
export const ADMIN_BOOKINGS = '/admin/bookings'
export const ADMIN_FINANCE = '/admin/finance'
export const ADMIN_USERS = '/admin/users'
export const ADMIN_VENDORS = '/admin/vendors'
export const ADMIN_VENDORS_NEW = '/admin/vendors/new'
export const ADMIN_NOTIFICATIONS = '/admin/notifications'

const STATUS_QUERY = 'status'

export function adminBookingDetail(bookingId: string): string {
  return `${ADMIN_BOOKINGS}/${bookingId}`
}

export function adminVendorDetail(vendorId: string): string {
  return `${ADMIN_VENDORS}/${vendorId}`
}

export function buildAdminBookingsUrl(filters?: { status?: BookingStatus }): string {
  if (!filters?.status) return ADMIN_BOOKINGS
  const q = new URLSearchParams()
  q.set(STATUS_QUERY, filters.status)
  return `${ADMIN_BOOKINGS}?${q.toString()}`
}

export function buildAdminVendorsUrl(filters?: { status?: VendorStatus }): string {
  if (!filters?.status) return ADMIN_VENDORS
  const q = new URLSearchParams()
  q.set(STATUS_QUERY, filters.status)
  return `${ADMIN_VENDORS}?${q.toString()}`
}

const BOOKING_STATUS_VALUES: readonly BookingStatus[] = [
  'pending',
  'assigned',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
] as const

export function parseBookingStatusQuery(value: string | null): BookingStatus | '' {
  if (!value) return ''
  return BOOKING_STATUS_VALUES.includes(value as BookingStatus)
    ? (value as BookingStatus)
    : ''
}

const VENDOR_STATUS_VALUES: readonly VendorStatus[] = [
  'pending',
  'active',
  'suspended',
  'rejected',
] as const

export function parseVendorStatusQuery(value: string | null): VendorStatus | '' {
  if (!value) return ''
  return VENDOR_STATUS_VALUES.includes(value as VendorStatus)
    ? (value as VendorStatus)
    : ''
}
