export type CategoryId =
  | 'ac'
  | 'tv'
  | 'refrigerator'
  | 'microwave'
  | 'water_purifier'
  | 'washing_machine'

export type View = 'home' | 'services' | 'booking' | 'admin'

export type PaymentMode = 'PAY_NOW' | 'PAY_AFTER_SERVICE'

export type PaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING'

// ─── Role & Booking lifecycle contract ────────────────────────────
export type Role = 'customer' | 'vendor' | 'technician' | 'admin'

export type TechnicianStatus = 'active' | 'inactive' | 'on_leave'

export interface Technician {
  id: string
  vendor_id: string
  full_name: string
  phone: string
  email: string
  skills: CategoryId[]
  status: TechnicianStatus
  created_at: string
  updated_at: string
}

export interface CreateTechnicianPayload {
  full_name: string
  phone: string
  email: string
  password: string
  skills: CategoryId[]
  status?: TechnicianStatus
}

export type UpdateTechnicianPayload = Partial<
  Omit<CreateTechnicianPayload, 'password'>
>

export type BookingStatus =
  | 'pending'
  | 'assigned'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rejected'

export type BookingEvent =
  | 'assign'
  | 'accept'
  | 'reject'
  | 'start'
  | 'complete'
  | 'cancel'

export interface BookingStatusEvent {
  id: string
  booking_id: string
  from_status: BookingStatus | null
  to_status: BookingStatus
  event: BookingEvent | 'create'
  actor_user_id: string
  actor_role: Role
  note?: string
  created_at: string
}

export interface BookingReview {
  id: string
  booking_id: string
  customer_id: string
  vendor_id: string
  rating: 1 | 2 | 3 | 4 | 5
  comment?: string
  created_at: string
}

export type ToastType = 'success' | 'danger' | 'warning' | 'info'

export type TransactionType = 'credit' | 'debit'

export type NotificationType = 'booking' | 'payment' | 'system' | 'vendor'

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
  payment_mode: PaymentMode
  payment_status: PaymentStatus
  razorpay_order_id: string | null
  booking_status: BookingStatus
  vendor_id?: string | null
  customer_id?: string | null
  assigned_at?: string | null
  accepted_at?: string | null
  started_at?: string | null
  completed_at?: string | null
  cancelled_at?: string | null
  created_at: string
  updated_at: string
  technician_id?: string | null
  completion_otp?: string | null
  completion_otp_expires_at?: string | null
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
  payment_mode: PaymentMode
}

/** Payload passed to `addBooking` before `booking_id` is assigned */
export type NewBookingPayload = Omit<Booking, 'booking_id'> & {
  razorpay_order_id?: string | null
}

export interface Address {
  id: string
  label: 'Home' | 'Work' | 'Other'
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  landmark?: string
  isDefault: boolean
}

export type PaymentMethodType = 'card' | 'upi'

export type PaymentBrand = 'visa' | 'mastercard' | 'rupay' | 'amex'

export interface PaymentMethod {
  id: string
  type: PaymentMethodType
  label: string
  last4?: string
  brand?: PaymentBrand
  upiId?: string
  isDefault: boolean
}

export interface NotificationPrefs {
  email: boolean
  sms: boolean
  push: boolean
  marketing: boolean
}

export interface UserPreferences {
  notifications: NotificationPrefs
  language: 'en' | 'hi'
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: Role
  avatar?: string
  dob?: string
  gender?: 'male' | 'female' | 'other'
  memberSince?: string
  addresses?: Address[]
  paymentMethods?: PaymentMethod[]
  preferences?: UserPreferences
  vendor_id?: string | null
  technician_id?: string | null
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

/** Legacy partner model — retained for unused admin/partner demo pages. */
export type PartnerStatus = 'pending' | 'approved' | 'suspended'

export type JobStatus = 'new' | 'accepted' | 'in_progress' | 'completed' | 'declined'

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
  /** Present for admin booking alerts; deep-link to booking detail. */
  booking_id?: string | null
}

export interface Offer {
  id: string
  title: string
  description: string
  tag: string
  cta_text: string
  category: CategoryId
  image_url: string
  bg_gradient: string
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface LocationData {
  label: string
  fullAddress: string
  lat: number
  lng: number
  placeId: string | null
}

export type LocationStatus = 'idle' | 'detecting' | 'resolved' | 'denied' | 'error'

// ─── Vendor ─────────────────────────────────────────────────────────

export type VendorStatus = 'pending' | 'active' | 'suspended' | 'rejected'

export interface VendorCategoryRef {
  id: string
  name: string
}

export interface Vendor {
  id: string
  company_name: string
  contact_number: string
  email: string
  city: string
  pin_codes: string[]
  gst_number: string
  gst_verified: boolean
  status: VendorStatus
  categories: VendorCategoryRef[]
  notes?: string | null
  onboarded_by_id?: string | null
  created_at: string
  updated_at: string
}

export interface CreateVendorPayload {
  company_name: string
  contact_number: string
  email: string
  city: string
  pin_codes: string[]
  gst_number: string
  gst_verified?: boolean
  category_ids: string[]
  notes?: string
}

export type UpdateVendorPayload = Partial<CreateVendorPayload>

export interface VendorListQuery {
  status?: VendorStatus
  city?: string
  category_id?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedVendors {
  items: Vendor[]
  total: number
  page: number
  limit: number
}
