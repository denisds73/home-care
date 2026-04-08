import api from './api'
import type {
  User,
  Address,
  PaymentMethod,
  UserPreferences,
} from '../types/domain'

interface Envelope<T> {
  data: T
}

export const userService = {
  updateProfile: async (payload: Partial<User>): Promise<User> => {
    const res = await api.patch<Envelope<User>>('/users/me', payload)
    return res.data
  },
  listAddresses: async (): Promise<Address[]> => {
    const res = await api.get<Envelope<Address[]>>('/users/me/addresses')
    return res.data
  },
  createAddress: async (payload: Omit<Address, 'id'>): Promise<Address> => {
    const res = await api.post<Envelope<Address>>(
      '/users/me/addresses',
      payload,
    )
    return res.data
  },
  updateAddress: async (
    id: string,
    payload: Partial<Address>,
  ): Promise<Address> => {
    const res = await api.patch<Envelope<Address>>(
      `/users/me/addresses/${id}`,
      payload,
    )
    return res.data
  },
  deleteAddress: async (id: string): Promise<void> => {
    await api.delete(`/users/me/addresses/${id}`)
  },
  listPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const res = await api.get<Envelope<PaymentMethod[]>>(
      '/users/me/payment-methods',
    )
    return res.data
  },
  createPaymentMethod: async (
    p: Omit<PaymentMethod, 'id'>,
  ): Promise<PaymentMethod> => {
    const res = await api.post<Envelope<PaymentMethod>>(
      '/users/me/payment-methods',
      p,
    )
    return res.data
  },
  deletePaymentMethod: async (id: string): Promise<void> => {
    await api.delete(`/users/me/payment-methods/${id}`)
  },
  updatePreferences: async (
    p: UserPreferences,
  ): Promise<UserPreferences> => {
    const res = await api.patch<Envelope<UserPreferences>>(
      '/users/me/preferences',
      p,
    )
    return res.data
  },
  changePassword: async (payload: {
    current: string
    next: string
  }): Promise<void> => {
    await api.post('/users/me/change-password', payload)
  },
  deleteAccount: async (): Promise<void> => {
    await api.delete('/users/me')
  },
}
