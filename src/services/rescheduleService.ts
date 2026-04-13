import { api } from './api'
import type { RescheduleRequest } from '../types/delay'

interface Envelope<T> {
  success?: boolean
  data: T
  message?: string
}

export interface ProposeReschedulePayload {
  proposed_date: string
  proposed_time_slot: string
  reason?: string
  reason_note?: string
}

export interface RespondReschedulePayload {
  response: 'accepted' | 'rejected' | 'counter_proposed'
  counter_date?: string
  counter_time_slot?: string
}

export const rescheduleService = {
  propose: async (
    bookingId: string,
    payload: ProposeReschedulePayload,
  ): Promise<RescheduleRequest> => {
    const res = await api.post<Envelope<RescheduleRequest>>(
      `/bookings/${bookingId}/reschedule`,
      payload,
    )
    return res.data
  },

  respond: async (
    bookingId: string,
    rescheduleId: string,
    payload: RespondReschedulePayload,
  ): Promise<RescheduleRequest> => {
    const res = await api.post<Envelope<RescheduleRequest>>(
      `/bookings/${bookingId}/reschedule/${rescheduleId}/respond`,
      payload,
    )
    return res.data
  },

  getRequests: async (bookingId: string): Promise<RescheduleRequest[]> => {
    const res = await api.get<Envelope<RescheduleRequest[]>>(
      `/bookings/${bookingId}/reschedule-requests`,
    )
    return res.data ?? []
  },
}
