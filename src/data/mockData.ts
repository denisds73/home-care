import type { Notification, Transaction } from '../types/domain'

export const mockNotifications: Notification[] = [
  { id: 'n-1', type: 'booking', title: 'Booking Confirmed', description: 'Your AC service booking HC-1001 has been confirmed for Apr 5', timestamp: '2026-04-04T10:30:00Z', read: false },
  { id: 'n-2', type: 'vendor', title: 'Vendor Assigned', description: 'CoolCare Services will service your AC on Apr 5, 9AM-12PM', timestamp: '2026-04-04T10:35:00Z', read: false },
  { id: 'n-3', type: 'payment', title: 'Payment Successful', description: 'Payment of ₹899 received for booking HC-1001', timestamp: '2026-04-04T10:31:00Z', read: true },
  { id: 'n-4', type: 'booking', title: 'Service Completed', description: 'Your TV repair HC-1003 has been marked as completed', timestamp: '2026-04-03T16:00:00Z', read: true },
  { id: 'n-5', type: 'system', title: 'Rate Your Experience', description: 'How was your AC service? Tap to leave a review', timestamp: '2026-04-03T14:00:00Z', read: true },
  { id: 'n-6', type: 'payment', title: 'Refund Processed', description: 'Refund of ₹499 for cancelled booking HC-1005 has been initiated', timestamp: '2026-04-02T09:00:00Z', read: true },
  { id: 'n-7', type: 'system', title: 'New Offer Available', description: '20% off on all washing machine services this week!', timestamp: '2026-04-01T08:00:00Z', read: true },
  { id: 'n-8', type: 'booking', title: 'Booking Reminder', description: 'Your refrigerator service is scheduled for tomorrow at 12PM', timestamp: '2026-03-31T18:00:00Z', read: true },
  { id: 'n-10', type: 'system', title: 'Welcome to HomeCare!', description: 'Your account has been created successfully. Browse our services to get started.', timestamp: '2026-03-25T10:00:00Z', read: true },
]

export const mockTransactions: Transaction[] = [
  { id: 't-1', amount: 899, type: 'debit', description: 'AC Basic Service', bookingRef: 'HC-1001', date: '2026-04-04' },
  { id: 't-2', amount: 499, type: 'credit', description: 'Refund - Cancelled Booking', bookingRef: 'HC-1005', date: '2026-04-02' },
  { id: 't-3', amount: 1299, type: 'debit', description: 'TV Installation', bookingRef: 'HC-1003', date: '2026-03-28' },
  { id: 't-4', amount: 200, type: 'credit', description: 'Referral Bonus', date: '2026-03-25' },
  { id: 't-5', amount: 749, type: 'debit', description: 'Refrigerator Gas Recharge', bookingRef: 'HC-1002', date: '2026-03-20' },
]

export const monthlyRevenue = [
  { month: 'Oct', revenue: 85000, payouts: 42000 },
  { month: 'Nov', revenue: 98000, payouts: 48000 },
  { month: 'Dec', revenue: 120000, payouts: 58000 },
  { month: 'Jan', revenue: 105000, payouts: 52000 },
  { month: 'Feb', revenue: 135000, payouts: 65000 },
  { month: 'Mar', revenue: 158000, payouts: 78000 },
]
