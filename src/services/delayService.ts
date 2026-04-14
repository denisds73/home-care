import { api } from './api'
import type { DelayEvent, ReportDelayPayload, RespondToDelayPayload } from '../types/delay'

interface Envelope<T> {
  success?: boolean
  data: T
  message?: string
}

export const delayService = {
  reportDelay: async (
    bookingId: string,
    payload: ReportDelayPayload,
  ): Promise<DelayEvent> => {
    const res = await api.post<Envelope<DelayEvent>>(
      `/bookings/${bookingId}/delay`,
      payload,
    )
    return res.data
  },

  updateDelay: async (
    bookingId: string,
    delayId: string,
    payload: Partial<ReportDelayPayload>,
  ): Promise<DelayEvent> => {
    const res = await api.patch<Envelope<DelayEvent>>(
      `/bookings/${bookingId}/delay/${delayId}`,
      payload,
    )
    return res.data
  },

  respondToDelay: async (
    bookingId: string,
    delayId: string,
    payload: RespondToDelayPayload,
  ): Promise<DelayEvent> => {
    const res = await api.post<Envelope<DelayEvent>>(
      `/bookings/${bookingId}/delay/${delayId}/respond`,
      payload,
    )
    return res.data
  },

  getDelayEvents: async (bookingId: string): Promise<DelayEvent[]> => {
    const res = await api.get<Envelope<DelayEvent[]>>(
      `/bookings/${bookingId}/delay-events`,
    )
    return res.data ?? []
  },
}
