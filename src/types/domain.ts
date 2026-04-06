export type CategoryId =
  | 'ac'
  | 'tv'
  | 'refrigerator'
  | 'microwave'
  | 'water_purifier'
  | 'washing_machine'

export type View = 'home' | 'services' | 'booking' | 'admin'

export type TimeSlot = '9AM-12PM' | '12PM-3PM' | '3PM-6PM'

export type PaymentMode = 'PAY_NOW' | 'PAY_AFTER_SERVICE'

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING'

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'In Progress'
  | 'Completed'
  | 'Cancelled'

export type ToastType = 'success' | 'danger' | 'warning' | 'info'

export type Role = 'customer' | 'partner' | 'admin'

export type PartnerStatus = 'pending' | 'approved' | 'suspended'

export type JobStatus = 'new' | 'accepted' | 'in_progress' | 'completed' | 'declined'

export type TransactionType = 'credit' | 'debit'

export type NotificationType = 'booking' | 'payment' | 'system' | 'partner'

export interface ServiceFaq {
  question: string
  answer: string
}

export interface ServiceListItem {
  id: number
  name: string
  price: number
  qty: number
}

export interface Service {
  id: number
  category: CategoryId
  service_name: string
  description: string
  price: number
  is_basic: boolean
  is_active: boolean
  /** Admin catalog timestamps (optional; mock seed data omits these) */
  created_at?: string
  updated_at?: string

  // Expanded catalog fields — all optional for backward compat
  long_description?: string
  original_price?: number
  image_url?: string
  estimated_duration?: string
  inclusions?: string[]
  exclusions?: string[]
  faqs?: ServiceFaq[]
  rating_average?: number
  rating_count?: number
  rating_distribution?: number[] // [5star%, 4star%, 3star%, 2star%, 1star%]
  sort_order?: number
}

export interface Booking {
  booking_id: string
  customer_name: string
  phone: string
  address: string
  lat: number
  lng: number
  category: CategoryId | string
  service_id: number | undefined
  service_name: string
  price: number
  services_list: ServiceListItem[]
  preferred_date: string
  time_slot: TimeSlot | string
  payment_mode: PaymentMode
  payment_status: PaymentStatus
  razorpay_order_id: string | null
  booking_status: BookingStatus
  created_at: string
  updated_at: string
}

/** Payload sent to POST /bookings — matches backend CreateBookingDto */
export interface CreateBookingPayload {
  customer_name: string
  phone: string
  address: string
  lat: number
  lng: number
  category: string
  service_id?: number
  service_name: string
  price: number
  services_list: ServiceListItem[]
  preferred_date: string
  time_slot: string
  payment_mode: PaymentMode
}

/** Payload passed to `addBooking` before `booking_id` is assigned */
export type NewBookingPayload = Omit<Booking, 'booking_id'> & {
  razorpay_order_id?: string | null
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
  avatar?: string
}

export interface CartLine {
  service: Service
  qty: number
}

export interface CategoryMeta {
  id: CategoryId
  name: string
  icon: string
  desc: string
  color: string
}

export interface ToastAction {
  label: string
  onClick: () => void
}

export interface ToastState {
  msg: string
  type: ToastType
}

export interface ToastItem {
  id: string
  msg: string
  type: ToastType
  action?: ToastAction
  duration: number
  createdAt: number
}

export interface Partner {
  id: string
  name: string
  email: string
  phone: string
  avatar?: string
  skills: CategoryId[]
  rating: number
  completedJobs: number
  status: PartnerStatus
  serviceArea: string
  isOnline: boolean
  joinedAt: string
  earnings: number
}

export interface Job {
  id: string
  bookingId: string
  partnerId: string
  customerName: string
  phone: string
  address: string
  category: CategoryId
  serviceName: string
  price: number
  preferredDate: string
  timeSlot: TimeSlot | string
  status: JobStatus
  createdAt: string
}

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  description: string
  bookingRef?: string
  date: string
}

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: string
  read: boolean
}

export interface PayoutRequest {
  id: string
  partnerId: string
  partnerName: string
  amount: number
  status: 'pending' | 'processed' | 'rejected'
  requestedAt: string
  processedAt?: string
}

export interface LocationData {
  label: string
  fullAddress: string
  lat: number
  lng: number
  placeId: string | null
}

export type LocationStatus = 'idle' | 'detecting' | 'resolved' | 'denied' | 'error'
