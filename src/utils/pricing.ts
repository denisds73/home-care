import { CONVENIENCE_FEE, GST_RATE } from '../data/services'
import type { CartLine } from '../types/domain'

export interface PricingBreakdown {
  subtotal: number
  convenienceFee: number
  gst: number
  grandTotal: number
}

export function calculatePricing(cart: CartLine[]): PricingBreakdown {
  const subtotal = cart.reduce((sum, c) => sum + c.service.price * c.qty, 0)
  if (subtotal === 0) return { subtotal: 0, convenienceFee: 0, gst: 0, grandTotal: 0 }
  const convenienceFee = CONVENIENCE_FEE
  const gst = Math.round(subtotal * GST_RATE)
  const grandTotal = subtotal + convenienceFee + gst
  return { subtotal, convenienceFee, gst, grandTotal }
}
