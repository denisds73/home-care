import { api } from './api'
import type { Offer } from '../types/domain'

export const offerService = {
  getActiveOffers: () => api.get<{ data: Offer[] }>('/offers'),
}
