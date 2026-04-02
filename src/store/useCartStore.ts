import { create } from 'zustand'
import type { CartLine, Service } from '../types/domain'
import { CONVENIENCE_FEE, GST_RATE } from '../data/services'

interface CartStore {
  cart: CartLine[]
  addToCart: (service: Service) => void
  removeFromCart: (serviceId: number) => void
  removeItemFromCart: (serviceId: number) => void
  clearCart: () => void
  getCartQty: (serviceId: number) => number
  getCartTotal: () => number
  getCartCount: () => number
  getCartGrandTotal: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  addToCart: (service) => {
    const cart = [...get().cart]
    const existing = cart.find(c => c.service.id === service.id)
    if (existing) existing.qty++
    else cart.push({ service, qty: 1 })
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
}))
