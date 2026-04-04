import { api } from './api'

export interface OrderPayload {
  amount: number
  currency: string
  receipt: string
}

export const paymentService = {
  createOrder: (data: OrderPayload) => api.post<{ order_id: string; amount: number; currency: string }>('/payments/order', data),
  verifyPayment: (data: Record<string, unknown>) =>
    api.post<{ success: boolean; transaction_id: string }>('/payments/verify', data),
}
