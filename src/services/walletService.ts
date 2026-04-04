import { api } from './api'
import type { Transaction } from '../types/domain'

export const walletService = {
  getBalance: () => api.get<{ data: { balance: number } }>('/wallet/balance'),
  getTransactions: () => api.get<{ data: { data: Transaction[]; total: number } }>('/wallet/transactions'),
  requestPayout: (amount: number) => api.post<{ data: unknown }>('/wallet/payouts', { amount }),
}
