import type {
  Job,
  Notification,
  Transaction,
  PayoutRequest,
} from '../types/domain'

export const mockNotifications: Notification[] = [
  { id: 'n-1', type: 'booking', title: 'Booking Confirmed', description: 'Your AC service booking HC-1001 has been confirmed for Apr 5', timestamp: '2026-04-04T10:30:00Z', read: false },
  { id: 'n-2', type: 'partner', title: 'Partner Assigned', description: 'Rajesh Kumar will service your AC on Apr 5, 9AM-12PM', timestamp: '2026-04-04T10:35:00Z', read: false },
  { id: 'n-3', type: 'payment', title: 'Payment Successful', description: 'Payment of ₹899 received for booking HC-1001', timestamp: '2026-04-04T10:31:00Z', read: true },
  { id: 'n-4', type: 'booking', title: 'Service Completed', description: 'Your TV repair HC-1003 has been marked as completed', timestamp: '2026-04-03T16:00:00Z', read: true },
  { id: 'n-5', type: 'system', title: 'Rate Your Experience', description: 'How was your AC service? Tap to leave a review', timestamp: '2026-04-03T14:00:00Z', read: true },
  { id: 'n-6', type: 'payment', title: 'Refund Processed', description: 'Refund of ₹499 for cancelled booking HC-1005 has been initiated', timestamp: '2026-04-02T09:00:00Z', read: true },
  { id: 'n-7', type: 'system', title: 'New Offer Available', description: '20% off on all washing machine services this week!', timestamp: '2026-04-01T08:00:00Z', read: true },
  { id: 'n-8', type: 'booking', title: 'Booking Reminder', description: 'Your refrigerator service is scheduled for tomorrow at 12PM', timestamp: '2026-03-31T18:00:00Z', read: true },
  { id: 'n-9', type: 'partner', title: 'Partner En Route', description: 'Sunil Sharma is on the way. ETA: 15 minutes', timestamp: '2026-03-30T09:45:00Z', read: true },
  { id: 'n-10', type: 'system', title: 'Welcome to HomeCare!', description: 'Your account has been created successfully. Browse our services to get started.', timestamp: '2026-03-25T10:00:00Z', read: true },
]

export const mockTransactions: Transaction[] = [
  { id: 't-1', amount: 899, type: 'debit', description: 'AC Basic Service', bookingRef: 'HC-1001', date: '2026-04-04' },
  { id: 't-2', amount: 499, type: 'credit', description: 'Refund - Cancelled Booking', bookingRef: 'HC-1005', date: '2026-04-02' },
  { id: 't-3', amount: 1299, type: 'debit', description: 'TV Installation', bookingRef: 'HC-1003', date: '2026-03-28' },
  { id: 't-4', amount: 200, type: 'credit', description: 'Referral Bonus', date: '2026-03-25' },
  { id: 't-5', amount: 749, type: 'debit', description: 'Refrigerator Gas Recharge', bookingRef: 'HC-1002', date: '2026-03-20' },
  { id: 't-6', amount: 599, type: 'debit', description: 'Water Purifier Service', bookingRef: 'HC-1004', date: '2026-03-18' },
  { id: 't-7', amount: 100, type: 'credit', description: 'Cashback Offer', date: '2026-03-15' },
  { id: 't-8', amount: 1499, type: 'debit', description: 'AC Installation', bookingRef: 'HC-1006', date: '2026-03-12' },
  { id: 't-9', amount: 350, type: 'debit', description: 'Microwave Repair', bookingRef: 'HC-998', date: '2026-03-08' },
  { id: 't-10', amount: 500, type: 'credit', description: 'Welcome Bonus', date: '2026-03-01' },
  { id: 't-11', amount: 899, type: 'debit', description: 'Washing Machine Service', bookingRef: 'HC-995', date: '2026-02-25' },
  { id: 't-12', amount: 649, type: 'debit', description: 'AC General Service', bookingRef: 'HC-990', date: '2026-02-18' },
  { id: 't-13', amount: 150, type: 'credit', description: 'Loyalty Points Cashback', date: '2026-02-10' },
  { id: 't-14', amount: 1799, type: 'debit', description: 'Refrigerator Compressor Replace', bookingRef: 'HC-985', date: '2026-02-05' },
  { id: 't-15', amount: 299, type: 'debit', description: 'Water Purifier Filter Change', bookingRef: 'HC-980', date: '2026-01-28' },
]

export const mockJobs: Job[] = [
  { id: 'j-1', bookingId: 'HC-1001', partnerId: 'p-1', customerName: 'Priya Sharma', phone: '9988776655', address: '42, 1st Cross, Koramangala', category: 'ac', serviceName: 'AC Basic Service', price: 899, preferredDate: '2026-04-05', timeSlot: '9AM-12PM', status: 'new', createdAt: '2026-04-04T08:00:00Z' },
  { id: 'j-2', bookingId: 'HC-1002', partnerId: 'p-1', customerName: 'Rahul Verma', phone: '9988776656', address: '15, 3rd Block, HSR Layout', category: 'refrigerator', serviceName: 'Refrigerator Gas Recharge', price: 749, preferredDate: '2026-04-05', timeSlot: '12PM-3PM', status: 'accepted', createdAt: '2026-04-03T14:00:00Z' },
  { id: 'j-3', bookingId: 'HC-1003', partnerId: 'p-1', customerName: 'Meena Iyer', phone: '9988776657', address: '88, 5th Main, Indiranagar', category: 'ac', serviceName: 'AC Gas Recharge', price: 1499, preferredDate: '2026-04-04', timeSlot: '9AM-12PM', status: 'in_progress', createdAt: '2026-04-02T10:00:00Z' },
  { id: 'j-4', bookingId: 'HC-998', partnerId: 'p-1', customerName: 'Arun Das', phone: '9988776658', address: '22, Church Street', category: 'ac', serviceName: 'AC Installation', price: 1299, preferredDate: '2026-04-01', timeSlot: '3PM-6PM', status: 'completed', createdAt: '2026-03-30T09:00:00Z' },
  { id: 'j-5', bookingId: 'HC-995', partnerId: 'p-1', customerName: 'Sneha Rao', phone: '9988776659', address: '7, Residency Road', category: 'refrigerator', serviceName: 'Refrigerator Repair', price: 649, preferredDate: '2026-03-29', timeSlot: '12PM-3PM', status: 'completed', createdAt: '2026-03-28T11:00:00Z' },
  { id: 'j-6', bookingId: 'HC-1007', partnerId: 'p-1', customerName: 'Vikash Jain', phone: '9988776660', address: '31, BTM 2nd Stage', category: 'ac', serviceName: 'AC Jet Wash', price: 999, preferredDate: '2026-04-06', timeSlot: '9AM-12PM', status: 'new', createdAt: '2026-04-04T12:00:00Z' },
  { id: 'j-7', bookingId: 'HC-990', partnerId: 'p-1', customerName: 'Nisha Gupta', phone: '9988776661', address: '55, Jayanagar 4th Block', category: 'ac', serviceName: 'AC Dismantle', price: 499, preferredDate: '2026-03-25', timeSlot: '3PM-6PM', status: 'declined', createdAt: '2026-03-24T08:00:00Z' },
]

export const adminKPIs = {
  totalRevenue: 1245000,
  totalBookings: 1847,
  activePartners: 5,
  totalUsers: 3200,
  avgRating: 4.7,
  pendingApprovals: 2,
}

export const mockPayoutRequests: PayoutRequest[] = [
  { id: 'pay-1', partnerId: 'p-1', partnerName: 'Rajesh Kumar', amount: 25000, status: 'pending', requestedAt: '2026-04-03' },
  { id: 'pay-2', partnerId: 'p-2', partnerName: 'Sunil Sharma', amount: 18000, status: 'pending', requestedAt: '2026-04-02' },
  { id: 'pay-3', partnerId: 'p-3', partnerName: 'Amit Patel', amount: 32000, status: 'processed', requestedAt: '2026-03-28', processedAt: '2026-03-30' },
  { id: 'pay-4', partnerId: 'p-4', partnerName: 'Vikram Singh', amount: 15000, status: 'processed', requestedAt: '2026-03-25', processedAt: '2026-03-27' },
  { id: 'pay-5', partnerId: 'p-5', partnerName: 'Priya Nair', amount: 12000, status: 'rejected', requestedAt: '2026-03-20', processedAt: '2026-03-22' },
]

export const monthlyRevenue = [
  { month: 'Oct', revenue: 85000, payouts: 42000 },
  { month: 'Nov', revenue: 98000, payouts: 48000 },
  { month: 'Dec', revenue: 120000, payouts: 58000 },
  { month: 'Jan', revenue: 105000, payouts: 52000 },
  { month: 'Feb', revenue: 135000, payouts: 65000 },
  { month: 'Mar', revenue: 158000, payouts: 78000 },
]

export const weeklyEarnings = [
  { day: 'Mon', amount: 3200 },
  { day: 'Tue', amount: 2800 },
  { day: 'Wed', amount: 4100 },
  { day: 'Thu', amount: 3500 },
  { day: 'Fri', amount: 5200 },
  { day: 'Sat', amount: 6100 },
  { day: 'Sun', amount: 1800 },
]
