import { describe, it, expect } from 'vitest'
import { getDisplayStatus } from './getDisplayStatus'
import type { Booking } from '../types/domain'
import type { DelayEvent, RescheduleRequest } from '../types/delay'

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    booking_id: 'HC-1001',
    customer_name: 'Test',
    phone: '9876543210',
    address: '123 Test St',
    lat: 0,
    lng: 0,
    category: 'ac',
    service_id: 1,
    service_name: 'AC Cleaning',
    price: 500,
    services_list: [],
    preferred_date: '2026-04-13',
    time_slot: '9AM-12PM',
    payment_mode: 'PAY_AFTER_SERVICE',
    payment_status: 'PENDING',
    razorpay_order_id: null,
    booking_status: 'accepted',
    created_at: '2026-04-12T10:00:00Z',
    updated_at: '2026-04-12T10:00:00Z',
    ...overrides,
  } as Booking
}

function makeDelay(overrides: Partial<DelayEvent> = {}): DelayEvent {
  return {
    id: 'd1',
    booking_id: 'HC-1001',
    delay_type: 'running_late',
    reason: 'traffic',
    reason_note: null,
    revised_eta: '2026-04-13T14:30:00Z',
    original_eta: '2026-04-13T13:00:00Z',
    reported_by_user_id: 'u1',
    reported_by_role: 'technician',
    client_response: 'pending',
    client_responded_at: null,
    is_active: true,
    created_at: '2026-04-13T13:10:00Z',
    updated_at: '2026-04-13T13:10:00Z',
    ...overrides,
  }
}

function makeReschedule(overrides: Partial<RescheduleRequest> = {}): RescheduleRequest {
  return {
    id: 'r1',
    booking_id: 'HC-1001',
    initiated_by_user_id: 'u1',
    initiated_by_role: 'vendor',
    reason: 'parts_unavailable',
    reason_note: null,
    original_date: '2026-04-13',
    original_time_slot: '9AM-12PM',
    proposed_date: '2026-04-15',
    proposed_time_slot: '9AM-12PM',
    status: 'proposed',
    responded_by_user_id: null,
    responded_by_role: null,
    counter_date: null,
    counter_time_slot: null,
    expires_at: '2026-04-14T13:00:00Z',
    reschedule_number: 1,
    created_at: '2026-04-13T13:00:00Z',
    updated_at: '2026-04-13T13:00:00Z',
    ...overrides,
  }
}

describe('getDisplayStatus', () => {
  it('returns base status when no delay or reschedule', () => {
    expect(getDisplayStatus(makeBooking(), null, null)).toBe('accepted')
  })

  it('returns "delayed" for active running_late', () => {
    expect(getDisplayStatus(makeBooking(), makeDelay(), null)).toBe('delayed')
  })

  it('returns "cannot_attend" for active cannot_attend', () => {
    const delay = makeDelay({ delay_type: 'cannot_attend', revised_eta: null })
    expect(getDisplayStatus(makeBooking(), delay, null)).toBe('cannot_attend')
  })

  it('returns "rescheduling" for proposed reschedule', () => {
    expect(getDisplayStatus(makeBooking(), null, makeReschedule())).toBe('rescheduling')
  })

  it('returns "rescheduling" for counter_proposed reschedule', () => {
    const rs = makeReschedule({ status: 'counter_proposed' })
    expect(getDisplayStatus(makeBooking(), null, rs)).toBe('rescheduling')
  })

  it('returns "rescheduled" for accepted reschedule', () => {
    const rs = makeReschedule({ status: 'accepted' })
    expect(getDisplayStatus(makeBooking(), null, rs)).toBe('rescheduled')
  })

  it('prioritises reschedule over delay', () => {
    expect(getDisplayStatus(makeBooking(), makeDelay(), makeReschedule())).toBe('rescheduling')
  })

  it('prioritises cannot_attend over running_late', () => {
    const delay = makeDelay({ delay_type: 'cannot_attend', revised_eta: null })
    expect(getDisplayStatus(makeBooking(), delay, null)).toBe('cannot_attend')
  })

  it('falls through when delay is inactive', () => {
    const delay = makeDelay({ is_active: false })
    expect(getDisplayStatus(makeBooking(), delay, null)).toBe('accepted')
  })

  it('falls through when reschedule is expired', () => {
    const rs = makeReschedule({ status: 'expired' })
    expect(getDisplayStatus(makeBooking(), null, rs)).toBe('accepted')
  })

  it('returns base status when all null', () => {
    const b = makeBooking({ booking_status: 'pending' })
    expect(getDisplayStatus(b, null, null)).toBe('pending')
  })

  it('returns "completed" for completed booking even with active delay', () => {
    const b = makeBooking({ booking_status: 'completed' })
    expect(getDisplayStatus(b, makeDelay(), null)).toBe('completed')
  })
})
