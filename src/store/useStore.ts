import { create } from 'zustand'
import { initialServices } from '../data/services'
import { initialBookings } from '../data/bookings'
import { initialOffers } from '../data/offers'
import { CATEGORIES } from '../data/categories'
import { serviceService } from '../services/serviceService'
import { bookingService } from '../services/bookingService'
import { offerService } from '../services/offerService'
import { calculatePricing } from '../utils/pricing'
import type {
  Booking,
  BookingStatus,
  CartLine,
  CategoryId,
  CategoryMeta,
  NewBookingPayload,
  Offer,
  Service,
  ToastAction,
  ToastItem,
  ToastState,
  ToastType,
} from '../types/domain'

export type ServiceDraft = Omit<Service, 'id'> & { created_at?: string; updated_at?: string }

interface Store {
  services: Service[]
  categories: CategoryMeta[]
  /** Tracks highlighted category in navbar (synced from CategoryPage). */
  selectedCategory: CategoryId | null
  nextServiceId: number

  /** API fetching state */
  servicesLoading: boolean
  servicesError: string | null
  bookingsLoading: boolean
  bookingsError: string | null
  offersLoading: boolean
  offersError: string | null

  /** Fetch services from backend; falls back to mock data on failure */
  fetchServices: () => Promise<void>
  /** Fetch categories from backend; falls back to static CATEGORIES on failure */
  fetchCategories: () => Promise<void>
  /** Fetch bookings from backend; falls back to mock data on failure */
  fetchBookings: () => Promise<void>
  /** Fetch active offers from backend; falls back to mock data on failure */
  fetchOffers: () => Promise<void>

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
  locationPickerOpen: boolean
  setLocationPickerOpen: (open: boolean) => void
  toggleCartDrawer: () => void
  openDetailSheet: (id: number) => void
  closeDetailSheet: () => void
  offers: Offer[]
  addOffer: (offer: Omit<Offer, 'id' | 'created_at' | 'updated_at'>) => void
  updateOffer: (id: string, data: Partial<Offer>) => void
  deleteOffer: (id: string) => void
  toggleOfferActive: (id: string) => void

  toast: ToastState | null
  toasts: ToastItem[]
  showToast: (msg: string, type?: ToastType, action?: ToastAction) => void
  dismissToast: (id: string) => void
}

const useStore = create<Store>()((set, get) => ({
  services: initialServices,
  categories: CATEGORIES,
  selectedCategory: null,
  nextServiceId: 31,

  servicesLoading: false,
  servicesError: null,
  bookingsLoading: false,
  bookingsError: null,
  offersLoading: false,
  offersError: null,

  fetchServices: async () => {
    set({ servicesLoading: true, servicesError: null })
    try {
      // Always fetch ALL services — CategoryPage filters locally by category
      const response = await serviceService.getServices()
      const services = response.data
      if (Array.isArray(services) && services.length > 0) {
        set({ services, servicesLoading: false })
      } else {
        set({ servicesLoading: false })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load services'
      set({ servicesError: message, servicesLoading: false })
    }
  },

  fetchCategories: async () => {
    try {
      const response = await serviceService.getCategories()
      const categories = response.data
      if (Array.isArray(categories) && categories.length > 0) {
        set({ categories })
      }
    } catch {
      // Static CATEGORIES remain as fallback
    }
  },

  fetchBookings: async () => {
    set({ bookingsLoading: true, bookingsError: null })
    try {
      const response = await bookingService.getMyBookings()
      const bookings = response.data
      if (Array.isArray(bookings)) {
        set({ bookings, bookingsLoading: false })
      } else {
        set({ bookingsLoading: false })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load bookings'
      set({ bookingsError: message, bookingsLoading: false })
      // Mock data remains as fallback
    }
  },

  fetchOffers: async () => {
    set({ offersLoading: true, offersError: null })
    try {
      const response = await offerService.getActiveOffers()
      const offers = response.data
      if (Array.isArray(offers)) {
        set({ offers, offersLoading: false })
      } else {
        set({ offersLoading: false })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load offers'
      set({ offersError: message, offersLoading: false })
    }
  },

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
    const cart = get().cart
    const exists = cart.some(c => c.service.id === serviceId)
    if (exists) {
      set({ cart: cart.map(c => c.service.id === serviceId ? { ...c, qty: c.qty + 1 } : c) })
    } else {
      set({ cart: [...cart, { service: svc, qty: 1 }] })
    }
  },
  removeFromCart: (serviceId) => {
    const cart = get().cart
    const item = cart.find(c => c.service.id === serviceId)
    if (!item) return
    if (item.qty > 1) {
      set({ cart: cart.map(c => c.service.id === serviceId ? { ...c, qty: c.qty - 1 } : c) })
    } else {
      set({ cart: cart.filter(c => c.service.id !== serviceId) })
    }
  },
  removeItemFromCart: (serviceId) => set({ cart: get().cart.filter(c => c.service.id !== serviceId) }),
  clearCart: () => set({ cart: [] }),
  getCartQty: (serviceId) => {
    const item = get().cart.find(c => c.service.id === serviceId)
    return item ? item.qty : 0
  },
  getCartTotal: () => get().cart.reduce((sum, c) => sum + c.service.price * c.qty, 0),
  getCartCount: () => get().cart.reduce((sum, c) => sum + c.qty, 0),
  getCartGrandTotal: () => calculatePricing(get().cart).grandTotal,

  cartDrawerOpen: false,
  detailSheetOpen: false,
  detailServiceId: null,
  accountSheetOpen: false,
  locationPickerOpen: false,
  setLocationPickerOpen: (open) => set({ locationPickerOpen: open }),
  toggleCartDrawer: () => set(s => ({ cartDrawerOpen: !s.cartDrawerOpen })),
  openDetailSheet: (id) => set({ detailSheetOpen: true, detailServiceId: id }),
  closeDetailSheet: () => set({ detailSheetOpen: false }),

  offers: initialOffers,
  addOffer: (draft) => {
    const now = new Date().toISOString()
    const id = `offer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    set({ offers: [...get().offers, { ...draft, id, created_at: now, updated_at: now }] })
  },
  updateOffer: (id, data) =>
    set({
      offers: get().offers.map(o =>
        o.id === id ? { ...o, ...data, updated_at: new Date().toISOString() } : o,
      ),
    }),
  deleteOffer: (id) => set({ offers: get().offers.filter(o => o.id !== id) }),
  toggleOfferActive: (id) =>
    set({
      offers: get().offers.map(o =>
        o.id === id ? { ...o, is_active: !o.is_active, updated_at: new Date().toISOString() } : o,
      ),
    }),

  toast: null,
  toasts: [],
  showToast: (msg, type = 'info', action?) => {
    const duration = type === 'danger' ? 5000 : type === 'warning' ? 4000 : 3000
    const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const item: ToastItem = { id, msg, type, action, duration, createdAt: Date.now() }
    set(s => ({
      toast: { msg, type },
      toasts: [...s.toasts.slice(-4), item], // max 5 visible
    }))
    setTimeout(() => get().dismissToast(id), duration)
  },
  dismissToast: (id) => {
    set(s => {
      const toasts = s.toasts.filter(t => t.id !== id)
      return { toasts, toast: toasts.length ? { msg: toasts[toasts.length - 1].msg, type: toasts[toasts.length - 1].type } : null }
    })
  },
}))

export default useStore
