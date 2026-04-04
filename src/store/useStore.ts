import { create } from 'zustand'
import { initialServices, CONVENIENCE_FEE, GST_RATE } from '../data/services'
import { initialBookings } from '../data/bookings'
import { CATEGORIES } from '../data/categories'
import type {
  Booking,
  BookingStatus,
  CartLine,
  CategoryMeta,
  NewBookingPayload,
  Service,
  ToastState,
  ToastType,
} from '../types/domain'

export type ServiceDraft = Omit<Service, 'id'> & { created_at?: string; updated_at?: string }

interface Store {
  services: Service[]
  categories: CategoryMeta[]
  nextServiceId: number
  addService: (svc: ServiceDraft) => void
  updateService: (id: number, data: Partial<Service> & { created_at?: string; updated_at?: string }) => void
  deleteService: (id: number) => void
  toggleServiceActive: (id: number) => void
  bookings: Booking[]
  nextBookingNum: number
  addBooking: (booking: NewBookingPayload) => string
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void
  cart: CartLine[]
  addToCart: (serviceId: number) => void
  removeFromCart: (serviceId: number) => void
  removeItemFromCart: (serviceId: number) => void
  clearCart: () => void
  getCartQty: (serviceId: number) => number
  getCartTotal: () => number
  getCartCount: () => number
  getCartGrandTotal: () => number
  cartDrawerOpen: boolean
  detailSheetOpen: boolean
  detailServiceId: number | null
  accountSheetOpen: boolean
  toggleCartDrawer: () => void
  openDetailSheet: (id: number) => void
  closeDetailSheet: () => void
  toast: ToastState | null
  showToast: (msg: string, type?: ToastType) => void
}

const useStore = create<Store>()((set, get) => ({
  services: initialServices,
  categories: CATEGORIES,
  nextServiceId: 31,
  addService: (svc) => {
    const id = get().nextServiceId
    set({ services: [...get().services, { ...svc, id }], nextServiceId: id + 1 })
  },
  updateService: (id, data) => set({ services: get().services.map(s => (s.id === id ? { ...s, ...data } : s)) }),
  deleteService: (id) => set({ services: get().services.filter(s => s.id !== id) }),
  toggleServiceActive: (id) => set({ services: get().services.map(s => (s.id === id ? { ...s, is_active: !s.is_active } : s)) }),

  bookings: initialBookings,
  nextBookingNum: 1007,
  addBooking: (booking) => {
    const num = get().nextBookingNum
    const id = 'HC-' + num
    const row: Booking = {
      ...booking,
      booking_id: id,
      razorpay_order_id: booking.razorpay_order_id ?? null,
    }
    set({ bookings: [row, ...get().bookings], nextBookingNum: num + 1 })
    return id
  },
  updateBookingStatus: (bookingId, status) =>
    set({
      bookings: get().bookings.map(b =>
        b.booking_id === bookingId ? { ...b, booking_status: status, updated_at: new Date().toISOString() } : b,
      ),
    }),

  cart: [],
  addToCart: (serviceId) => {
    const svc = get().services.find(s => s.id === serviceId)
    if (!svc) return
    const cart = [...get().cart]
    const existing = cart.find(c => c.service.id === serviceId)
    if (existing) existing.qty++
    else cart.push({ service: svc, qty: 1 })
    set({ cart })
  },
  removeFromCart: (serviceId) => {
    const cart = [...get().cart]
    const idx = cart.findIndex(c => c.service.id === serviceId)
    if (idx === -1) return
    if (cart[idx].qty > 1) cart[idx].qty--
    else cart.splice(idx, 1)
    set({ cart })
  },
  removeItemFromCart: (serviceId) => set({ cart: get().cart.filter(c => c.service.id !== serviceId) }),
  clearCart: () => set({ cart: [] }),
  getCartQty: (serviceId) => {
    const item = get().cart.find(c => c.service.id === serviceId)
    return item ? item.qty : 0
  },
  getCartTotal: () => get().cart.reduce((sum, c) => sum + c.service.price * c.qty, 0),
  getCartCount: () => get().cart.reduce((sum, c) => sum + c.qty, 0),
  getCartGrandTotal: () => {
    const subtotal = get().getCartTotal()
    if (subtotal === 0) return 0
    return subtotal + CONVENIENCE_FEE + Math.round(subtotal * GST_RATE)
  },

  cartDrawerOpen: false,
  detailSheetOpen: false,
  detailServiceId: null,
  accountSheetOpen: false,
  toggleCartDrawer: () => set(s => ({ cartDrawerOpen: !s.cartDrawerOpen })),
  openDetailSheet: (id) => set({ detailSheetOpen: true, detailServiceId: id }),
  closeDetailSheet: () => set({ detailSheetOpen: false }),

  toast: null,
  showToast: (msg, type = 'info') => {
    set({ toast: { msg, type } })
    setTimeout(() => set({ toast: null }), 3500)
  },
}))

export default useStore
