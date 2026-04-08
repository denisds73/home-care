import type { BookingStatus, CategoryId, PaymentMode, PaymentStatus, TimeSlot } from '../types/domain'
import { CATEGORIES } from './categories'

export function getCategoryName(id: CategoryId | string): string {
  const c = CATEGORIES.find(x => x.id === id)
  return c ? c.name : id
}

export function getCategoryIcon(id: CategoryId | string): string {
  const c = CATEGORIES.find(x => x.id === id)
  return c ? c.icon : ''
}

export function statusClass(s: string): string {
  return s.toLowerCase().replace(/[\s_]+/g, '-')
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending',
  assigned: 'Assigned',
  accepted: 'Accepted',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
}

export function bookingStatusLabel(s: BookingStatus | string): string {
  return STATUS_LABELS[s as BookingStatus] ?? String(s)
}

export function paymentBadgeClass(s: PaymentStatus): 'success' | 'failed' | 'pay-pending' {
  return s === 'SUCCESS' ? 'success' : s === 'FAILED' ? 'failed' : 'pay-pending'
}

export function formatPaymentMode(m: PaymentMode | string): string {
  return m === 'PAY_NOW' ? 'Pay Now (Online)' : m === 'PAY_AFTER_SERVICE' ? 'Pay After Service' : String(m)
}

export function formatPaymentStatus(s: PaymentStatus): string {
  return s === 'SUCCESS' ? 'Paid' : s === 'FAILED' ? 'Failed' : 'Pending'
}

export function formatTimeSlot(s: TimeSlot | string): string {
  return s === '9AM-12PM' ? '9:00 AM – 12:00 PM' : s === '12PM-3PM' ? '12:00 PM – 3:00 PM' : s === '3PM-6PM' ? '3:00 PM – 6:00 PM' : s
}

export function formatDate(d: string | undefined): string {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(d: string | undefined): string {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function generateRazorpayId(): string {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'rzp_order_'
  for (let i = 0; i < 11; i++) id += c.charAt(Math.floor(Math.random() * c.length))
  return id
}

export function getValidTransitions(current: BookingStatus | string): BookingStatus[] {
  switch (current) {
    case 'pending': return ['pending', 'assigned', 'cancelled']
    case 'assigned': return ['assigned', 'accepted', 'rejected', 'cancelled']
    case 'accepted': return ['accepted', 'in_progress', 'cancelled']
    case 'in_progress': return ['in_progress', 'completed', 'cancelled']
    case 'completed': return ['completed']
    case 'cancelled': return ['cancelled']
    case 'rejected': return ['rejected']
    default: return ['pending', 'assigned', 'accepted', 'in_progress', 'completed', 'cancelled', 'rejected']
  }
}

export function seededRating(serviceId: number): { rating: string; reviews: number; reviewsK: string } {
  const seed = ((serviceId * 2654435761) >>> 0) / 4294967296
  return {
    rating: (4.5 + seed * 0.5).toFixed(1),
    reviews: Math.floor(seed * 2000) + 200,
    reviewsK: (Math.floor(seed * 2000) + 200) >= 1000 ? ((Math.floor(seed * 2000) + 200) / 1000).toFixed(1) + 'K' : String(Math.floor(seed * 2000) + 200),
  }
}
