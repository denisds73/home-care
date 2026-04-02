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

/** Payload passed to `addBooking` before `booking_id` is assigned */
export type NewBookingPayload = Omit<Booking, 'booking_id'> & {
  razorpay_order_id?: string | null
}

export interface User {
  name: string
  email: string
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

export interface ToastState {
  msg: string
  type: ToastType
}
