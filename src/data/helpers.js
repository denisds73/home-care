import { CATEGORIES } from './categories'

export function getCategoryName(id) {
  const c = CATEGORIES.find(x => x.id === id)
  return c ? c.name : id
}

export function getCategoryIcon(id) {
  const c = CATEGORIES.find(x => x.id === id)
  return c ? c.icon : ''
}

export function statusClass(s) {
  return s.toLowerCase().replace(/\s+/g, '-')
}

export function paymentBadgeClass(s) {
  return s === 'SUCCESS' ? 'success' : s === 'FAILED' ? 'failed' : 'pay-pending'
}

export function formatPaymentMode(m) {
  return m === 'PAY_NOW' ? 'Pay Now (Online)' : m === 'PAY_AFTER_SERVICE' ? 'Pay After Service' : m
}

export function formatPaymentStatus(s) {
  return s === 'SUCCESS' ? 'Paid' : s === 'FAILED' ? 'Failed' : 'Pending'
}

export function formatTimeSlot(s) {
  return s === '9AM-12PM' ? '9:00 AM – 12:00 PM' : s === '12PM-3PM' ? '12:00 PM – 3:00 PM' : s === '3PM-6PM' ? '3:00 PM – 6:00 PM' : s
}

export function formatDate(d) {
  if (!d) return ''
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(d) {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export function generateRazorpayId() {
  const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = 'rzp_order_'
  for (let i = 0; i < 11; i++) id += c.charAt(Math.floor(Math.random() * c.length))
  return id
}

export function getValidTransitions(current) {
  switch (current) {
    case 'Pending': return ['Pending', 'Confirmed', 'Cancelled']
    case 'Confirmed': return ['Confirmed', 'In Progress', 'Cancelled']
    case 'In Progress': return ['In Progress', 'Completed', 'Cancelled']
    case 'Completed': return ['Completed']
    case 'Cancelled': return ['Cancelled']
    default: return ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled']
  }
}

export function seededRating(serviceId) {
  const seed = ((serviceId * 2654435761) >>> 0) / 4294967296
  return {
    rating: (4.5 + seed * 0.5).toFixed(1),
    reviews: Math.floor(seed * 2000) + 200,
    reviewsK: (Math.floor(seed * 2000) + 200) >= 1000 ? ((Math.floor(seed * 2000) + 200) / 1000).toFixed(1) + 'K' : String(Math.floor(seed * 2000) + 200)
  }
}
